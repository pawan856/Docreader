import fitz  # PyMuPDF

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """
    Extracts raw text from a PDF file provided as bytes.
    Using PyMuPDF (fitz) because it is incredibly fast and accurate.
    """
    text = ""
    # Open the PDF directly from memory (no need to save to disk first!)
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text() + "\n"
    return text
