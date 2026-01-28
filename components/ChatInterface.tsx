
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, PenTool, Cpu } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Material Strategy Engine online. Select a persona below to begin.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'engineering' | 'design'>('engineering');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await getChatResponse(userMsg.content, mode);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', content: responseText, timestamp: new Date() }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-100px)] flex flex-col animate-fade-in">
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
         <div className="flex items-center gap-3">
             <div className={`p-2 rounded-lg ${mode === 'engineering' ? 'bg-cyan-50 text-cyan-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {mode === 'engineering' ? <Cpu size={20} /> : <PenTool size={20} />}
             </div>
             <div>
                <h2 className="text-base font-bold text-gray-900">
                    {mode === 'engineering' ? 'Engineering Core' : 'Design Consultant'}
                </h2>
                <p className="text-xs text-gray-500">Powered by Gemini 3 Pro</p>
             </div>
         </div>
         
         <div className="flex bg-gray-100 p-1 rounded-lg">
             <button
               onClick={() => setMode('engineering')}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'engineering' ? 'bg-white shadow text-cyan-600' : 'text-gray-500 hover:text-gray-900'}`}
             >
                Engineering
             </button>
             <button
               onClick={() => setMode('design')}
               className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${mode === 'design' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
             >
                Design
             </button>
         </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
         {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'model' ? 'bg-white' : 'flex-row-reverse'}`}>
               <div className="mt-1 shrink-0">
                  {msg.role === 'user' ? (
                     <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">You</div>
                  ) : (
                     <div className={`w-8 h-8 bg-white border rounded-full flex items-center justify-center shadow-sm ${mode === 'engineering' ? 'border-cyan-200' : 'border-indigo-200'}`}>
                       <Sparkles size={14} className={mode === 'engineering' ? 'text-cyan-600' : 'text-indigo-600'} />
                     </div>
                  )}
               </div>
               
               <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div 
                    className={`inline-block text-sm leading-7 whitespace-pre-line ${
                      msg.role === 'user' 
                        ? 'bg-gray-900 text-white px-4 py-2 rounded-2xl rounded-tr-sm' 
                        : 'text-gray-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className="text-[10px] text-gray-300 mt-1 opacity-0 hover:opacity-100 transition-opacity">
                     {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
               </div>
            </div>
         ))}
         
         {loading && (
            <div className="flex gap-4">
               <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm mt-1">
                   <Loader2 size={14} className={`animate-spin ${mode === 'engineering' ? 'text-cyan-600' : 'text-indigo-600'}`} />
               </div>
               <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  Processing request...
               </div>
            </div>
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-4 pt-2">
         <form onSubmit={handleSend} className="relative group">
            <textarea
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }}}
               placeholder={mode === 'engineering' ? "Ask about rheology, thermal properties..." : "Ask about finish trends, tactile feel, CMF..."}
               className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300 resize-none transition-all"
               rows={1}
               style={{ minHeight: '52px' }}
            />
            <button 
               type="submit" 
               disabled={!input.trim() || loading}
               className="absolute right-2 top-2.5 p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors bg-white rounded-lg shadow-sm border border-gray-100"
            >
               <Send size={16} />
            </button>
         </form>
         <div className="text-[10px] text-center text-gray-400 mt-2 font-medium">
            AI responses vary based on active persona.
         </div>
      </div>
    </div>
  );
};

export default ChatInterface;
