import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from './MessageBubble';

export const ChatWindow: React.FC = () => {
  const { messages, isLoading, error, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[85vh] w-full max-w-4xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 pointer-events-none" />
      
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800/80 px-6 py-4 flex items-center justify-between z-10">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          DocuChat AI
        </h2>
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full font-medium shadow-sm">
          <Sparkles size={14} />
          RAG Pipeline Active
        </div>
      </div>
      
      {/* Chat History Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-950/40 z-10 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 animate-in fade-in duration-700">
            <BotIcon />
            <p className="text-lg font-medium text-gray-300">Vector Search Online</p>
            <p className="text-sm max-w-sm text-center opacity-80">Ask any question about your document. Ask follow-ups to test conversational memory!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start mb-6 gap-3 items-center text-gray-400 animate-in fade-in duration-300">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600/50 flex items-center justify-center flex-row">
              <Loader2 size={16} className="text-white animate-spin" />
            </div>
            <span className="text-sm px-4 py-2 bg-gray-800/50 rounded-2xl rounded-bl-sm border border-gray-700/30">
              Retrieving contexts from ChromaDB...
            </span>
          </div>
        )}
        
        {error && (
          <div className="flex justify-center my-6">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-5 py-3 rounded-lg shadow-sm">
              {error}
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-gray-900 border-t border-gray-800/80 z-10">
        <form onSubmit={handleSend} className="relative flex items-center max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "AI is typing..." : "Ask a question about your PDF..."}
            className="w-full bg-gray-800 border-2 border-gray-700/80 text-white rounded-full py-3.5 px-6 pr-14 focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all shadow-inner disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-md group"
          >
            <Send size={18} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

const BotIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500/50">
    <path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path>
  </svg>
);
