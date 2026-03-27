from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, chat

app = FastAPI(title="DocuChat API", description="RAG-powered PDF Chat API")

# Configure CORS so React frontend can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development only, restricts origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(chat.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to DocuChat API"}
