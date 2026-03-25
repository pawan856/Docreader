import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, User, Bot, AlertCircle, KeyRound, Loader2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

interface ChatInterfaceProps {
  fileName: string;
  pdfText: string;
}

export default function ChatInterface({ fileName, pdfText }: ChatInterfaceProps) {
  const initialMessage = {
    id: '1',
    role: 'assistant' as const,
    content: `Hello! I have extracted **${pdfText.length.toLocaleString()}** characters from "${fileName}". \n\nWhat would you like to know about this document?`
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API Key State (Reads from .env file first, then local storage)
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  const [apiKey, setApiKey] = useState(() => envKey || localStorage.getItem('gemini_api_key') || '');
  const [tempKey, setTempKey] = useState('');
  const [isSettingKey, setIsSettingKey] = useState(!envKey && !localStorage.getItem('gemini_api_key'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSettingKey]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempKey.trim().length > 10) {
      localStorage.setItem('gemini_api_key', tempKey.trim());
      setApiKey(tempKey.trim());
      setIsSettingKey(false);
    }
  };
  
  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear the conversation history?")) {
      setMessages([initialMessage]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      setIsSettingKey(true);
      return;
    }

    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    const assistantMsgId = (Date.now() + 1).toString();
    
    // Add empty assistant message skeleton for streaming
    setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

    try {
      const { streamGeminiResponse } = await import('../utils/geminiApi');
      
      const historyItems = messages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })) as any[];

      await streamGeminiResponse(
        apiKey,
        pdfText,
        historyItems,
        newMsg.content,
        (currentTextStream) => {
          setMessages(prev => prev.map(m => 
            m.id === assistantMsgId ? { ...m, content: currentTextStream } : m
          ));
        }
      );
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message?.includes("API key") 
        ? "Invalid API Key. Please supply a valid key in your `.env` file or via the Key icon."
        : `Error: ${error.message || 'Failed to connect to Gemini API.'}`;

      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId ? { ...m, content: errorMsg } : m
      ));
      
      if (error.message?.includes('API key')) {
        localStorage.removeItem('gemini_api_key');
        if (!envKey) setApiKey('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 w-full relative">
      
      {/* API Key Modal Overlay */}
      {isSettingKey && (
        <div className="absolute inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Google Gemini API Key</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Since this app runs entirely in your browser without a backend, you'll need to provide your own free Gemini API key to chat with the document.
               <br/><br/>
               You can also put this in your <b>.env</b> file to skip this popup.
            </p>
            <form onSubmit={handleSaveKey}>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-3">
                {apiKey && (
                  <button 
                    type="button" 
                    onClick={() => setIsSettingKey(false)}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={tempKey.length < 10}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:bg-gray-700 disabled:text-gray-500"
                >
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Messages Area Header (Utility Bar) */}
      <div className="px-6 py-2 bg-gray-800/50 border-b border-gray-800 flex justify-end">
         <button 
           onClick={handleClearChat}
           className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg bg-gray-900/50 hover:bg-gray-800 border border-transparent hover:border-gray-700"
         >
           <Trash2 className="w-3.5 h-3.5" />
           Clear Chat
         </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 md:gap-4 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg
                ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}
              >
                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>

              <div className={`px-5 py-3 rounded-2xl shadow-md text-sm md:text-base selection:bg-blue-500/30
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700'}`}
              >
                {msg.content === '' && isLoading && msg.role === 'assistant' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400 my-1" />
                ) : (
                  msg.role === 'user' ? (
                    <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                  ) : (
                    <div className="markdown-body text-sm md:text-base leading-relaxed break-words text-gray-200">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-3 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-3 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-white tracking-wide" {...props} />,
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mb-3 mt-4" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white mb-2 mt-3 text-emerald-400" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-md font-bold text-white mb-2 mt-2" {...props} />,
                          a: ({node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" {...props} />,
                          code: ({inline, className, children, ...props}: any) => {
                            const match = /language-(\w+)/.exec(className || '')
                            return inline ? (
                              <code className="bg-gray-900 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-700" {...props}>
                                {children}
                              </code>
                            ) : (
                              <div className="my-4 rounded-lg overflow-hidden border border-gray-700 shadow-sm relative">
                                <div className="bg-gray-900 px-4 py-1.5 border-b border-gray-800 text-xs text-gray-500 font-mono uppercase tracking-wider">
                                  {match ? match[1] : 'Code'}
                                </div>
                                <pre className="bg-gray-900/50 p-4 overflow-x-auto text-sm text-gray-300">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              </div>
                            )
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )
                )}
              </div>

            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 rounded-b-xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center group">
          <button 
            type="button"
            onClick={() => setIsSettingKey(true)}
            className="absolute left-4 p-2 text-gray-500 hover:text-white transition-colors z-10"
            title="Update API Key"
          >
            <KeyRound className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isSettingKey}
            placeholder={isLoading ? "AI is typing..." : "Ask a question about your PDF..."}
            className="w-full bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 rounded-full pl-14 pr-16 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner disabled:opacity-50 group-hover:border-gray-600"
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading || isSettingKey}
            className="absolute right-2 p-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-full transition-all shadow-lg active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
             {isLoading ? <Loader2 className="w-5 h-5 ml-0.5 animate-spin" /> : <SendHorizontal className="w-5 h-5 ml-0.5" />}
          </button>
        </form>
        <div className="text-center mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500 font-medium pb-1">
          <AlertCircle className="w-3.5 h-3.5" />
          DocuChat AI can make mistakes. Always verify important information.
        </div>
      </div>
    </div>
  );
}
