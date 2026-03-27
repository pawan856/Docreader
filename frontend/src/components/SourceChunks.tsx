import React, { useState } from 'react';
import { SourceChunk } from '../hooks/useChat';
import { ChevronDown, FileText } from 'lucide-react';

export const SourceChunks: React.FC<{ sources: SourceChunk[] }> = ({ sources }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 text-left w-full max-w-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-xs text-gray-400 hover:text-emerald-400 font-medium transition-colors bg-gray-900/50 px-3 py-1.5 rounded-full outline-none"
      >
        <FileText size={12} className="mr-1.5" />
        {sources.length} document sources used 
        <ChevronDown size={14} className={`ml-1.5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {sources.map((src, i) => (
            <div key={i} className="bg-gray-800/80 border border-gray-700/50 rounded-lg p-3 text-xs text-gray-300 shadow-inner">
              <span className="font-semibold text-emerald-500/90 mb-1.5 block">Context Chunk {i+1}</span>
              <p className="leading-relaxed opacity-90">{src.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
