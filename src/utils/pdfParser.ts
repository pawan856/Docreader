import * as pdfjsLib from 'pdfjs-dist';

// In Vite, we can import the worker script directly as a URL
// This ensures pdf.js doesn't try to load it from a CDN or fail
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the document 
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Loop through each page and extract text
    for (let i = 1; i <= pdf.numPages; i++) {
      // Get the page
      const page = await pdf.getPage(i);
      
      // Get text content from the page
      const textContent = await page.getTextContent();
      
      // Extract string from each item and join them with spaces
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
        
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Failed to parse PDF file. Please ensure it has readable text.");
  }
};
