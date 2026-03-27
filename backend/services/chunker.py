from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """
    Splits a massive string of text into smaller, overlapping chunks.
    
    Why Chunking?
    We can't feed a 50-page PDF to an AI at once. It's too expensive and the AI forgets 
    the "middle" details. We break it into ~1000 character paragraphs.
    
    Why Overlap?
    If we cut exactly at 1000 chars, we might cut a sentence in half!
    Overlap ensures the last 200 characters of Chunk 1 are repeated 
    at the start of Chunk 2, preserving context.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""] # Tries to split by double newline first, then single, etc.
    )
    
    # The split_text method takes the raw string and returns a list of strings
    return text_splitter.split_text(text)
