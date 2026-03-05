import json
from typing import Annotated, List, Union, Dict, Any, Literal
from typing_extensions import TypedDict

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
from app.models.user import User

# --- Momo's Core Toolset ---

@tool
def file_write(path: str, content: str) -> str:
    """Writes content to a local file at the specified path."""
    try:
        with open(path, "w") as f:
            f.write(content)
        return f"Successfully wrote to {path}"
    except Exception as e:
        return f"Error writing to {path}: {str(e)}"

@tool
def file_read(path: str) -> str:
    """Reads the content of a local file at the specified path."""
    try:
        with open(path, "r") as f:
            return f.read()
    except Exception as e:
        return f"Error reading {path}: {str(e)}"

@tool
async def doc_create(title: str, content: str, category: str = "SOP") -> str:
    """Creates a new company document/SOP in the Knowledge Base."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).limit(1))
        user = result.scalar_one()
        doc = await document_service.create_document(db, title, content, user.id, category)
        return f"Successfully created SOP '{title}' with ID {doc.id}"

@tool
async def ghl_contact_lookup(email: str) -> str:
    """Searches for a contact in GoHighLevel CRM by email."""
    contact = await ghl_service.get_contact_by_email(email)
    if not contact: return "No contact found with that email in GHL."
    return f"Found Contact: {contact.get('firstName')} {contact.get('lastName')} (ID: {contact.get('id')})"

@tool
async def glpi_asset_search(query: str) -> str:
    """Searches for hardware assets in GLPI management system."""
    assets = await glpi_service.search_assets(query)
    if not assets: return "No assets found in GLPI matching your query."
    return f"GLPI Results: {json.dumps(assets[:3])}"

@tool
def system_report() -> str:
    """Generates a comprehensive report of Momo's current system health."""
    return system_monitor.get_system_report()

tools = [file_write, file_read, doc_create, ghl_contact_lookup, glpi_asset_search, system_report]
tool_node = ToolNode(tools)

# --- Momo's Brain ---

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    tier: AITier
    user_id: int
    memories: List[str]
    empathy_injection: str

def should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    last_message = state["messages"][-1]
    if not last_message.tool_calls:
        return "__end__"
    return "tools"

async def call_momo(state: AgentState):
    memories = state.get("memories", [])
    if not memories and state.get("user_id"):
        user_query = state["messages"][-1].content
        if isinstance(user_query, str):
            memories = await memory_service.search_memories(state["user_id"], user_query)

    model_name = "gpt-4o-mini" if state.get("tier") == AITier.TIER2 else "gpt-4o"
    model = ChatOpenAI(model=model_name, streaming=True, api_key=settings.OPENAI_API_KEY)
    model_with_tools = model.bind_tools(tools)
    
    memory_context = "\n".join([f"- {m}" for m in memories]) if memories else "None"
    empathy = state.get("empathy_injection", "")
    
    system_prompt = f"""You are Momo, an autonomous agentic ecosystem. 
    You have access to tools. When a user asks for a technical task, DO NOT just explain it. USE YOUR TOOLS.
    {empathy}
    
    [Long-term Memory Context]:
    {memory_context}
    
    Stay in character and leverage your memories to provide personalized assistance."""
    
    messages = [SystemMessage(content=system_prompt)] + state["messages"]
    response = await model_with_tools.ainvoke(messages)
    return {"messages": [response], "memories": memories}

workflow = StateGraph(AgentState)
workflow.add_node("momo", call_momo)
workflow.add_node("tools", tool_node)
workflow.set_entry_point("momo")
workflow.add_conditional_edges("momo", should_continue)
workflow.add_edge("tools", "momo")

momo_engine = workflow.compile()
