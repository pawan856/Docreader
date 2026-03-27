import React, { useState } from 'react';
import { UploadZone } from './components/UploadZone';
import { ChatWindow } from './components/ChatWindow';

function App() {
  const [isReady, setIsReady] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-emerald-500/30 font-sans">
      <main className="w-full min-h-screen flex flex-col items-center justify-center py-12 px-4">
        {!isReady ? (
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            <div className="mb-12 text-center max-w-4xl w-full mx-auto">
              <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-emerald-400 to-green-400 bg-clip-text text-transparent mb-6 pb-2">
                DocuChat ✨
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Experience the power of local Retrieval-Augmented Generation. 
                Upload any PDF and get instant, accurate, source-backed answers.
              </p>
            </div>
            <UploadZone onUploadSuccess={() => setIsReady(true)} />
          </div>
        ) : (
          <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500 ease-out">
            <ChatWindow />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
