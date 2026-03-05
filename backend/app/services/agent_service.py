import json
from typing import Annotated, List, Union, Dict, Any, Literal
from typing_extensions import TypedDict

from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from app.core.config import settings

# --- Momo's Core Toolset ---

@tool
def file_write(path: str, content: str) -> str:
    """Writes content to a file at the specified path."""
    try:
        with open(path, "w") as f:
            f.write(content)
        return f"Successfully wrote to {path}"
    except Exception as e:
        return f"Error writing to {path}: {str(e)}"

@tool
def file_read(path: str) -> str:
    """Reads the content of a file at the specified path."""
    try:
        with open(path, "r") as f:
            return f.read()
    except Exception as e:
        return f"Error reading {path}: {str(e)}"

tools = [file_write, file_read]
tool_node = ToolNode(tools)

# --- Momo's Brain (LangGraph) ---

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]

def should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    last_message = state["messages"][-1]
    if not last_message.tool_calls:
        return "__end__"
    return "tools"

async def call_momo(state: AgentState):
    model = ChatOpenAI(model="gpt-4o", streaming=True, api_key=settings.OPENAI_API_KEY)
    # Bind tools to the model
    model_with_tools = model.bind_tools(tools)
    
    system_prompt = """You are Momo, an autonomous agentic ecosystem. 
    You have direct access to tools. When a user asks for a technical task, 
    DO NOT just explain it. USE YOUR TOOLS. 
    State your plan briefly, then execute.
    """
    
    # We use SystemMessage instead of prepending AIMessage
    messages = [SystemMessage(content=system_prompt)] + state["messages"]
    
    response = await model_with_tools.ainvoke(messages)
    return {"messages": [response]}

workflow = StateGraph(AgentState)
workflow.add_node("momo", call_momo)
workflow.add_node("tools", tool_node)
workflow.set_entry_point("momo")
workflow.add_conditional_edges("momo", should_continue)
workflow.add_edge("tools", "momo")

momo_engine = workflow.compile()
