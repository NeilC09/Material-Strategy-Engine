
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Material Strategy Engine online. How can I assist with your engineering challenges today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
      const responseText = await getChatResponse(userMsg.content);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', content: responseText, timestamp: new Date() }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-100px)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
         <div className="p-2 bg-gray-100 rounded-lg">
            <Bot size={20} className="text-gray-700" />
         </div>
         <div>
            <h2 className="text-base font-bold text-gray-900">Engineering Assistant</h2>
            <p className="text-xs text-gray-500">Powered by Gemini 3 Pro</p>
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
                     <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                       <Sparkles size={14} className="text-purple-600" />
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
                   <Sparkles size={14} className="text-purple-600" />
               </div>
               <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                  <Loader2 className="animate-spin" size={14} /> Processing request...
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
               placeholder="Ask about formulations, processing parameters, or chemical structures..."
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
            AI responses are based on available engineering data. Verify critical parameters.
         </div>
      </div>
    </div>
  );
};

export default ChatInterface;
