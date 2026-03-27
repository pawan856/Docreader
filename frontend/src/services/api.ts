import axios from 'axios';

// Create an Axios instance pointing to our FastAPI backend
// The Python FastAPI server runs on port 8000 by default (uvicorn)
export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// We accept an onProgress callback so the React UI can show a loading bar!
export const uploadPdfApi = async (file: File, onProgress?: (percentage: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // Axios gives us native upload progress tracking. We math it to out of 100.
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

export const chatApi = async (messages: {role: string, content: string}[]) => {
  const response = await api.post('/chat', { messages });
  return response.data;
};
