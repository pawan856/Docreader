import os
from anthropic import Anthropic
from services.vector_store import search_chunks
from models.schemas import ChatMessage

# Initialize Anthropic Claude Client
# You need ANTHROPIC_API_KEY in your backend/.env file
api_key = os.getenv("ANTHROPIC_API_KEY", "mock")
if not api_key:
    api_key = "mock" # prevent crash if missing during tutorial
client = Anthropic(api_key=api_key)

# The System Prompt tells Claude WHO it is and HOW to act
SYSTEM_PROMPT = """You are DocuChat, a helpful AI assistant. 
Use the provided CONTEXT from the user's PDF to answer their question.
If the answer is not in the context, say "I cannot find the answer in the document."
Do not make up facts. Be concise and professional."""

def generate_answer(chat_history: list[ChatMessage]) -> tuple[str, list[str]]:
    """
    1. Extracts the latest question from the chat history.
    2. Searches ChromaDB for relevant chunks.
    3. Builds the prompt with chunks + history (Memory).
    4. Calls Claude API and returns the answer + sources used.
    """
    # 1. Grab the latest question (it's always the last message in the array)
    latest_question = chat_history[-1].content
    
    # 2. Search Vector DB for context chunks matching the question
    relevant_chunks = search_chunks(latest_question, n_results=3)
    
    # 3. Build the Context String safely
    context_text = "\n\n---\n\n".join(relevant_chunks) if relevant_chunks else "No relevant context found."
    
    # 4. We inject the Context secretly into the user's newest message
    augmented_prompt = f"""CONTEXT FROM PDF:
{context_text}

USER QUESTION:
{latest_question}
"""
    
    # 5. Build the Anthropic API messages format (Memory construction)
    # Anthropic expects: [{"role": "user", "content": "..."}, {"role": "assistant", ...}]
    api_messages = []
    
    for i, msg in enumerate(chat_history):
        if i == len(chat_history) - 1:
            # Override the LAST message with the massive augmented RAG prompt
            api_messages.append({"role": msg.role, "content": augmented_prompt})
        else:
            # Keep older messages exactly as they are (This gives Claude conversational memory!)
            api_messages.append({"role": msg.role, "content": msg.content})
            
    # 6. Call Claude 3.5 Sonnet
    try:
        if client.api_key == "mock":
            return "This is a generic answer because you haven't put your real `ANTHROPIC_API_KEY` in `backend/.env` yet! But your vector search successfully gathered context chunks.", relevant_chunks
            
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            system=SYSTEM_PROMPT,
            messages=api_messages
        )
        answer = response.content[0].text
        return answer, relevant_chunks
        
    except Exception as e:
        return f"Error calling Claude API: {str(e)}", relevant_chunks
