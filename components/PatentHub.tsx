
import React, { useState, useRef, useEffect } from 'react';
import { FileText, Search, Upload, Loader2, ExternalLink, File, MessageSquare, Download, AlertTriangle } from 'lucide-react';
import { searchPatents, analyzePatentPdf, chatWithPatentContext } from '../services/geminiService';
import { Patent, AnalysisResult, ChatMessage } from '../types';

interface PatentHubProps {
  initialQuery?: string;
}

const PatentHub: React.FC<PatentHubProps> = ({ initialQuery }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'analyze'>('search');
  const [query, setQuery] = useState('');
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await searchPatents(q);
      setPatents(res);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
       const f = e.target.files[0];
       setFile(f);
       const reader = new FileReader();
       reader.onload = () => setFileBase64((reader.result as string).split(',')[1]);
       reader.readAsDataURL(f);
       // Reset previous analysis
       setAnalysis(null);
       setChatHistory([]);
    }
  };

  const handleAnalyze = async () => {
     if (!fileBase64) return;
     setLoading(true);
     try {
        const res = await analyzePatentPdf(fileBase64);
        setAnalysis(res);
     } catch (e) { console.error(e); }
     setLoading(false);
  };

  const handleChat = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!chatInput || !fileBase64) return;
     const msg = chatInput;
     setChatInput('');
     const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() };
     setChatHistory(p => [...p, userMsg]);
     setChatLoading(true);
     try {
        const res = await chatWithPatentContext(msg, fileBase64, chatHistory);
        setChatHistory(p => [...p, { id: Date.now().toString(), role: 'model', content: res, timestamp: new Date() }]);
     } catch (e) { console.error(e); }
     setChatLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-10">
      {/* Toggle */}
      <div className="flex border-b border-gray-200 mb-8">
         <button 
           onClick={() => setActiveTab('search')}
           className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'search' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
           <Search size={16} /> Repository Search
         </button>
         <button 
           onClick={() => setActiveTab('analyze')}
           className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'analyze' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
         >
           <FileText size={16} /> PDF Analysis
         </button>
      </div>

      {/* Search View */}
      {activeTab === 'search' && (
         <div className="max-w-3xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="mb-8">
               <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input 
                     value={query}
                     onChange={e => setQuery(e.target.value)}
                     placeholder="Search by assignee (e.g. 'BASF') or technology..."
                     className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-gray-100 focus:border-gray-300 outline-none transition-all shadow-sm"
                  />
               </div>
            </form>
            
            <div className="space-y-4">
               {loading && <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2"><Loader2 className="animate-spin" /> Searching Global Patents...</div>}
               
               {!loading && patents.length === 0 && query && (
                  <div className="text-center py-12 text-gray-400">No patents found for "{query}".</div>
               )}

               {patents.map((p, i) => (
                  <div key={i} className="group p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all bg-white relative">
                     <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1">
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{p.number}</span>
                              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{p.assignee}</span>
                           </div>
                           <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors">{p.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 pl-4">
                           <a 
                              href={p.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                              title="View Source"
                           >
                              <ExternalLink size={18} />
                           </a>
                           <a 
                              href={p.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                              title="Download Patent PDF"
                           >
                              <Download size={14} /> Download
                           </a>
                        </div>
                     </div>
                     <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{p.snippet}</p>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Analyze View */}
      {activeTab === 'analyze' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
            
            {/* Left Column: Upload & Result */}
            <div className="space-y-6 overflow-y-auto pr-2">
               <div 
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center h-48 cursor-pointer group relative overflow-hidden"
               >
                  <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none"></div>
                  <input type="file" accept=".pdf" className="hidden" ref={fileRef} onChange={handleFile} />
                  {file ? (
                     <div className="z-10 flex flex-col items-center">
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3"><File size={24} className="text-indigo-600" /></div>
                        <span className="text-sm font-bold text-gray-900">{file.name}</span>
                        <span className="text-xs text-gray-500 mt-1">Click to replace</span>
                     </div>
                  ) : (
                     <div className="z-10 flex flex-col items-center">
                        <Upload size={32} className="text-gray-300 group-hover:text-gray-500 mb-3 transition-colors" />
                        <span className="text-sm font-medium text-gray-600">Upload Patent PDF</span>
                        <span className="text-xs text-gray-400 mt-1">Drag & drop or click to browse</span>
                     </div>
                  )}
               </div>
               
               {file && !analysis && (
                  <button 
                     onClick={handleAnalyze} 
                     disabled={loading}
                     className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex justify-center items-center gap-2 shadow-sm"
                  >
                     {loading ? <Loader2 className="animate-spin" size={16} /> : "Deconstruct Invention Strategy"}
                  </button>
               )}

               {analysis && (
                  <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm animate-fade-in">
                     <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                        <h3 className="font-bold text-gray-900">Strategy Analysis</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase">{analysis.quadrant}</span>
                     </div>
                     
                     <div className="space-y-6">
                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Summary</label>
                           <p className="text-sm text-gray-800 leading-relaxed">{analysis.summary}</p>
                        </div>
                        
                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">3-Pillar Breakdown</label>
                           <div className="space-y-3">
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                 <span className="text-xs font-bold text-blue-600 block mb-1">Compounding</span>
                                 <p className="text-sm text-gray-700">{analysis.engineeringLogic.compounding}</p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                 <span className="text-xs font-bold text-purple-600 block mb-1">Processing</span>
                                 <p className="text-sm text-gray-700">{analysis.engineeringLogic.processing}</p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                 <span className="text-xs font-bold text-emerald-600 block mb-1">System Intelligence</span>
                                 <p className="text-sm text-gray-700">{analysis.engineeringLogic.system}</p>
                              </div>
                           </div>
                        </div>

                        {/* Constraints Section */}
                        {analysis.constraints && analysis.constraints.length > 0 && (
                            <div>
                               <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex items-center gap-1">
                                  <AlertTriangle size={12} className="text-amber-500" /> Constraints & Risks
                               </label>
                               <div className="space-y-2">
                                  {analysis.constraints.map((c, i) => (
                                     <div key={i} className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-100/50 rounded-lg text-sm text-amber-900">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                                        <span className="leading-relaxed text-xs font-medium">{c}</span>
                                     </div>
                                  ))}
                               </div>
                            </div>
                        )}
                     </div>
                  </div>
               )}
            </div>

            {/* Right Column: Chat */}
            <div className="border border-gray-200 rounded-xl flex flex-col bg-white shadow-sm overflow-hidden h-full">
               <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2 text-sm font-bold text-gray-700">
                  <MessageSquare size={16} /> Chat with Patent
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                  {chatHistory.length === 0 && (
                     <div className="text-center text-gray-400 mt-20 text-sm">
                        Ask specific questions about claims, temperatures, or materials mentioned in the PDF.
                     </div>
                  )}
                  {chatHistory.map(m => (
                     <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-6 whitespace-pre-line ${
                           m.role === 'user' 
                              ? 'bg-gray-900 text-white rounded-tr-sm' 
                              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                        }`}>
                           {m.content}
                        </div>
                     </div>
                  ))}
                  {chatLoading && (
                     <div className="flex items-center gap-2 text-xs text-gray-400 pl-2">
                        <Loader2 className="animate-spin" size={12} /> Analyzing document...
                     </div>
                  )}
               </div>
               
               <form onSubmit={handleChat} className="p-3 border-t border-gray-100 bg-gray-50">
                  <div className="relative">
                     <input 
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        disabled={!file || chatLoading}
                        placeholder={file ? "Ask a question..." : "Upload a PDF first"}
                        className="w-full bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-gray-300 transition-all"
                     />
                     <button 
                        type="submit" 
                        disabled={!chatInput.trim() || chatLoading}
                        className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-900 disabled:opacity-50"
                     >
                        <Search size={18} />
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default PatentHub;
