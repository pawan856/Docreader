import chromadb
import uuid

# Initialize ChromaDB. We use persistent storage so vectors survive a server restart.
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# A Collection in ChromaDB is like a Table in a SQL database.
# By default, Chroma will automatically download and use a lightweight 
# HuggingFace embedding model (`all-MiniLM-L6-v2`) to turn text into vectors!
collection = chroma_client.get_or_create_collection(name="docuchat_docs")

def store_chunks(chunks: list[str]) -> None:
    """
    Takes string chunks, automatically generates embeddings,
    and stores them in the vector database.
    """
    # We must give each chunk a unique ID
    ids = [str(uuid.uuid4()) for _ in chunks]
    
    # The .add() method automatically converts the strings into vector math 
    # under the hood before storing them!
    collection.add(
        documents=chunks,
        ids=ids
    )

def search_chunks(query: str, n_results: int = 3) -> list[str]:
    """
    Embeds the user's question, performs a Cosine Similarity Search,
    and returns the top matching chunks.
    """
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    
    # Chroma returns a complex dictionary. We extract just the text documents.
    if results and "documents" in results and results["documents"]:
        return results["documents"][0] # Return the first list of matched documents
    return []
