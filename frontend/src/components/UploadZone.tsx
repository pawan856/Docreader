import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { uploadPdfApi } from '../services/api';

interface UploadZoneProps {
  onUploadSuccess: (chunksCount: number) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsHovering(true);
    } else if (e.type === 'dragleave') {
      setIsHovering(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovering(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type !== 'application/pdf') {
        setErrorMsg('Please upload a valid PDF file.');
        setStatus('error');
        return;
      }
      await processFile(droppedFile);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setErrorMsg('Please upload a valid PDF file.');
        setStatus('error');
        return;
      }
      await processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setStatus('uploading');
    setProgress(0);
    setErrorMsg('');

    try {
      // 1. Uploading to FastAPI 
      const data = await uploadPdfApi(selectedFile, (p) => {
        setProgress(p);
        if (p === 100) setStatus('processing'); // Upload done, now Python is chunking/embedding!
      });
      
      setStatus('success');
      // 2. Wait 1.5s to show the green checkmark, then trigger parent to show Chat UI
      setTimeout(() => onUploadSuccess(data.chunks_stored), 1500);
      
    } catch (error: any) {
      setStatus('error');
      setErrorMsg(error.response?.data?.detail || error.message || 'An error occurred during upload.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 mt-24">
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
          isHovering ? 'border-blue-500 bg-blue-500/10 scale-105' : 'border-gray-600 bg-gray-800/50'
        } ${status === 'success' ? 'border-green-500 bg-green-500/10' : ''}`}
      >
        <input 
          type="file" 
          accept="application/pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={status === 'uploading' || status === 'processing' || status === 'success'}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
          {status === 'idle' || status === 'error' ? (
            <>
              <div className="p-4 bg-gray-700/50 rounded-full">
                <UploadCloud className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-200">Upload your PDF</h3>
                <p className="text-gray-400 mt-2">Drag and drop here, or click to browse</p>
              </div>
              {status === 'error' && (
                <p className="text-red-400 text-sm font-medium mt-2">{errorMsg}</p>
              )}
            </>
          ) : status === 'success' ? (
            <>
              <div className="p-4 bg-green-500/20 rounded-full animate-bounce">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-semibold text-green-400">Ready to Chat!</h3>
              <p className="text-green-300/80 mt-2">Vector embeddings generated successfully.</p>
            </>
          ) : (
            <>
              <div className="p-4 bg-blue-500/20 rounded-full animate-pulse">
                {status === 'processing' ? (
                  <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                ) : (
                  <FileText className="w-10 h-10 text-blue-400 animate-bounce" />
                )}
              </div>
              <h3 className="text-2xl font-semibold text-blue-400">
                {status === 'uploading' ? `Uploading... ${progress}%` : 'Embedding vectors...'}
              </h3>
              
              <div className="w-full max-w-xs bg-gray-700 rounded-full h-2 mt-4 overflow-hidden">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${status === 'processing' ? 100 : progress}%` }}
                />
              </div>
              {status === 'processing' && (
                <p className="text-blue-300/80 text-sm mt-2">Chunking text and writing to ChromaDB...</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
