from pydantic import BaseModel
from typing import List

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str
    
# This gets sent by the React frontend
class ChatRequest(BaseModel):
    messages: List[ChatMessage] # Includes chat history + the latest question!

# This gets sent back to the React frontend
class SourceChunk(BaseModel):
    content: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceChunk] # To show the user WHERE the answer came from
