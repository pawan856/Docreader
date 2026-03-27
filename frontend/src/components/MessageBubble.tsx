import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User } from 'lucide-react';
import { ChatMessage } from '../hooks/useChat';
import { SourceChunks } from './SourceChunks';

export const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex w-full max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end group`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md mb-1 ${
          isUser ? 'bg-blue-600 ml-3' : 'bg-emerald-600 mr-3'
        }`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>
        
        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3.5 rounded-2xl shadow-sm ${
            isUser 
              ? 'bg-blue-600 text-white rounded-br-sm' 
              : 'bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700/50'
          }`}>
            <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
          
          {/* Transparency: Show the PDF Chunks used by Claude to generate this specific answer */}
          {!isUser && message.sources && (
            <SourceChunks sources={message.sources} />
          )}
        </div>
        
      </div>
    </div>
  );
};
