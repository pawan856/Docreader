from fastapi import APIRouter, File, UploadFile, HTTPException
from services.pdf_extractor import extract_text_from_pdf_bytes
from services.chunker import chunk_text
from services.vector_store import store_chunks

router = APIRouter()

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # 1. Validation: Make sure it's a PDF
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # 2. Read the file into memory
        pdf_bytes = await file.read()
        
        # 3. Extract the text
        extracted_text = extract_text_from_pdf_bytes(pdf_bytes)
        
        # 4. Chunk the text with LangChain
        chunks = chunk_text(extracted_text)
        
        # 5. Embed the chunks and store in ChromaDB
        store_chunks(chunks)
        
        return {
            "filename": file.filename,
            "message": f"Successfully processed! Extracted {len(extracted_text)} characters and stored {len(chunks)} chunks in the Vector Database.",
            "chunks_stored": len(chunks)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")
