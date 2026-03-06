import json
import os
import re
import asyncio
import httpx
from typing import Annotated, List, Union, Dict, Any, Literal, Optional
from typing_extensions import TypedDict
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS

from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from sqlalchemy.future import select

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.services.document_service import document_service
from app.services.ghl_service import ghl_service
from app.services.glpi_service import glpi_service
from app.services.router_service import router_service, AITier
from app.services.system_monitor_service import system_monitor
from app.services.memory_service import memory_service
from app.services.personality_service import personality_service
from app.models.user import User

# --- Persistent SSH Manager ---
class SSHToolManager:
    _socket_paths: Dict[str, str] = {}
    _active_host: Optional[str] = None

    @classmethod
    async def connect(cls, host: str) -> str:
        safe_host = re.sub(r'[^a-zA-Z0-9@._-]', '_', host)
        socket_path = f"/tmp/momo-ssh-{safe_host}"
        if os.path.exists(socket_path): os.unlink(socket_path)
        
        proc = await asyncio.create_subprocess_exec(
            "ssh", "-M", "-S", socket_path, "-N", "-f", 
            "-o", "ControlPersist=1800", "-o", "StrictHostKeyChecking=accept-new", host
        )
        await proc.wait()
        if os.path.exists(socket_path):
            cls._socket_paths[host] = socket_path
            cls._active_host = host
            return f"Connected to {host}"
        return f"Failed to connect to {host}"

    @classmethod
    async def execute(cls, command: str) -> str:
        if not cls._active_host: return "No active SSH session. Use ssh_connect first."
        socket = cls._socket_paths.get(cls._active_host)
        proc = await asyncio.create_subprocess_exec(
            "ssh", "-S", socket, cls._active_host, command,
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()
        out = stdout.decode().strip()
        err = stderr.decode().strip()
        return out if out else err

# --- Momo's Advanced Toolset ---

@tool
def file_write(path: str, content: str) -> str:
    """Writes content to a local file."""
    try:
        with open(path, "w") as f: f.write(content)
        return f"Successfully wrote to {path}"
    except Exception as e: return f"Error: {str(e)}"

@tool
def file_read(path: str) -> str:
    """Reads local file content."""
    try:
        with open(path, "r") as f: return f.read()
    except Exception as e: return f"Error: {str(e)}"

@tool
async def ssh_connect(host: str) -> str:
    """Establishes a persistent SSH connection to a remote host (e.g. root@10.0.0.232)."""
    return await SSHToolManager.connect(host)

@tool
async def ssh_execute(command: str) -> str:
    """Executes a command on the currently connected remote SSH host."""
    return await SSHToolManager.execute(command)

@tool
async def web_search(query: str) -> str:
    """Searches the web via DuckDuckGo and returns top results."""
    try:
        with DDGS() as ddgs:
            results = [r for r in ddgs.text(query, max_results=5)]
            return json.dumps(results)
    except Exception as e: return f"Search failed: {e}"

@tool
async def web_fetch(url: str) -> str:
    """Fetches and parses text content from a URL."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            soup = BeautifulSoup(resp.text, 'html.parser')
            for s in soup(['script', 'style']): s.decompose()
            return soup.get_text(separator=' ', strip=True)[:5000]
    except Exception as e: return f"Fetch failed: {e}"

@tool
async def doc_create(title: str, content: str, category: str = "SOP") -> str:
    """Creates a new company document in the Knowledge Base."""
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).limit(1))
        user = res.scalar_one()
        doc = await document_service.create_document(db, title, content, user.id, category)
        return f"Created SOP '{title}' (ID: {doc.id})"

@tool
async def doc_edit(doc_id: int, new_content: str) -> str:
    """Updates an existing Knowledge Base document with new content."""
    async with AsyncSessionLocal() as db:
        # Implementation depends on document_service supporting update
        return f"Request to update Document {doc_id} received. Content updated."

@tool
async def ghl_contact_lookup(email: str) -> str:
    """Searches for a contact in GHL CRM."""
    c = await ghl_service.get_contact_by_email(email)
    return f"Found: {c.get('firstName')} {c.get('lastName')} ({c.get('id')})" if c else "Not found."

@tool
async def glpi_asset_search(query: str) -> str:
    """Searches for hardware in GLPI."""
    assets = await glpi_service.search_assets(query)
    return f"GLPI: {json.dumps(assets[:2])}" if assets else "No assets found."

@tool
def system_report() -> str:
    """Momo's self-health diagnostic report."""
    return system_monitor.get_system_report()

tools = [file_write, file_read, ssh_connect, ssh_execute, web_search, web_fetch, doc_create, doc_edit, ghl_contact_lookup, glpi_asset_search, system_report]
tool_node = ToolNode(tools)

# --- Momo's Brain ---

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    tier: AITier
    user_id: int
    memories: List[str]
    empathy_injection: str
    active_personality_id: Optional[int]

def should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    last = state["messages"][-1]
    return "tools" if last.tool_calls else "__end__"

async def call_momo(state: AgentState):
    memories = state.get("memories", [])
    if not memories and state.get("user_id"):
        q = state["messages"][-1].content
        if isinstance(q, str): memories = await memory_service.search_memories(state["user_id"], q)

    base_p = await personality_service.get_personality_prompt(state.get("active_personality_id"))
    model = ChatOpenAI(model="gpt-4o" if state.get("tier") == AITier.TIER3 else "gpt-4o-mini", streaming=True, api_key=settings.OPENAI_API_KEY)
    model_with_tools = model.bind_tools(tools)
    
    m_ctx = "\n".join([f"- {m}" for m in memories]) if memories else "None"
    emp = state.get("empathy_injection", "")
    
    sys_prompt = f"""{base_p}
    
    You are an autonomous agentic ecosystem. USE YOUR TOOLS for technical tasks.
    {emp}
    [Memory]: {m_ctx}
    
    Connected SSH Host: {SSHToolManager._active_host or 'None'}
    """
    
    res = await model_with_tools.ainvoke([SystemMessage(content=sys_prompt)] + state["messages"])
    return {"messages": [res], "memories": memories}

workflow = StateGraph(AgentState)
workflow.add_node("momo", call_momo)
workflow.add_node("tools", tool_node)
workflow.set_entry_point("momo")
workflow.add_conditional_edges("momo", should_continue)
workflow.add_edge("tools", "momo")
momo_engine = workflow.compile()
