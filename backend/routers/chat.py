from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse, SourceChunk
from services.rag_chain import generate_answer

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_pdf(request: ChatRequest):
    """
    Receives chat history from React, runs the RAG pipeline, 
    and returns Claude's answer with source transparency.
    """
    # Basic validation
    if not request.messages:
        raise HTTPException(status_code=400, detail="Must provide chat messages.")
        
    try:
        # Pass the whole history (Memory!) to our RAG chain
        answer_text, chunks_used = generate_answer(request.messages)
        
        # Format the sources to send back to React for transparency
        sources = [SourceChunk(content=chunk) for chunk in chunks_used]
        
        return ChatResponse(
            answer=answer_text,
            sources=sources
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat generation failed: {str(e)}")
