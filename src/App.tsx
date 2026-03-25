import React, { useState, DragEvent, useEffect } from 'react';
import { UploadCloud, FileText, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import ChatInterface from './components/ChatInterface';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Parsing states
  const [isParsing, setIsParsing] = useState(false);
  const [parsedText, setParsedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Chat state
  const [isChatStarted, setIsChatStarted] = useState(false);

  useEffect(() => {
    if (file) {
      handleParsePDF(file);
    } else {
      setParsedText(null);
      setError(null);
      setIsChatStarted(false);
    }
  }, [file]);

  const handleParsePDF = async (pdfFile: File) => {
    setIsParsing(true);
    setError(null);
    try {
      // Dynamically import so we reduce initial bundle size
      const { extractTextFromPDF } = await import('./utils/pdfParser');
      const text = await extractTextFromPDF(pdfFile);
      setParsedText(text);
    } catch (err: any) {
      setError(err.message || "Failed to parse PDF.");
      setFile(null); // Reset on error
    } finally {
      setIsParsing(false);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        alert("Please upload a valid PDF file.");
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100 font-sans">
      <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700 shadow-sm z-10 w-full">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            DocuChat
          </h1>
        </div>
      </header>

      <main className="flex-1 w-full overflow-hidden flex flex-col items-center justify-center p-6 md:p-12 relative">
        {/* Background Decorative Blur */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {!file ? (
          <div className="w-full max-w-2xl relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">Chat with your PDF</h2>
              <p className="text-gray-400 text-lg">Upload a document to instantly extract text and start a conversation.</p>
            </div>
            
            <div 
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-2xl p-12 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer shadow-xl
                ${isDragging ? 'border-blue-500 bg-blue-500/10 scale-105' : 'border-gray-600 hover:border-gray-500 bg-gray-800/50 hover:bg-gray-800/80'}`}
            >
              <div className="p-4 bg-gray-700/50 rounded-full mb-6 shadow-inner">
                <UploadCloud className={`w-12 h-12 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Drag & drop your PDF here</h3>
              <p className="text-sm text-gray-500 mb-6">Supported format: .pdf (Max 50MB)</p>
              
              <input 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                id="file-upload" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
              <label 
                htmlFor="file-upload" 
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 cursor-pointer active:scale-95"
              >
                Browse Files
              </label>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl h-full flex flex-col bg-gray-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-700 relative z-10">
             {/* Dynamic Header */}
             <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-100 truncate max-w-[200px] md:max-w-md">{file.name}</h3>
                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Upload New
                </button>
             </div>
             
             {/* Main Content Area */}
             <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/50 w-full overflow-hidden">
               {isParsing ? (
                 <div className="flex flex-col items-center justify-center text-blue-400 animate-pulse h-full p-6">
                   <Loader2 className="w-12 h-12 animate-spin mb-4" />
                   <p className="text-lg font-medium">Extracting text directly in your browser...</p>
                   <p className="text-sm text-gray-500 mt-2">This is fast and 100% private.</p>
                 </div>
               ) : error ? (
                 <div className="flex flex-col items-center text-red-400 h-full justify-center p-6">
                   <p className="text-lg bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/20">{error}</p>
                 </div>
               ) : parsedText && !isChatStarted ? (
                 <div className="w-full h-full flex flex-col items-center justify-center text-green-400 py-8 p-6">
                   <CheckCircle2 className="w-16 h-16 mb-4" />
                   <p className="text-2xl font-bold mb-2 text-gray-100">PDF Extracted!</p>
                   <p className="text-sm text-gray-400 mb-6 bg-gray-800 px-4 py-1 rounded-full border border-gray-700">
                     Extracted {(parsedText.length).toLocaleString()} characters locally.
                   </p>
                   
                   <div className="w-full max-w-2xl bg-gray-900/80 p-6 rounded-xl text-left border border-gray-800 mb-8 max-h-48 overflow-y-auto shadow-inner">
                     <p className="text-gray-400 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words">
                       {parsedText.slice(0, 1000)}
                       {parsedText.length > 1000 && <span className="text-blue-500 font-bold ml-1">... ({parsedText.length - 1000} more characters truncated)</span>}
                     </p>
                   </div>
                   
                   <button 
                     onClick={() => setIsChatStarted(true)} 
                     className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 flex items-center gap-2"
                   >
                     <MessageSquare className="w-5 h-5" />
                     Start Chat
                   </button>
                 </div>
               ) : parsedText && isChatStarted ? (
                 <div className="w-full h-full">
                    <ChatInterface fileName={file.name} pdfText={parsedText} />
                 </div>
               ) : null}
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
