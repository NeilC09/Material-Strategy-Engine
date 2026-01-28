
import React, { useState } from 'react';
import Header from './components/Header';
import QuadrantGrid from './components/QuadrantGrid';
import Workstation from './components/Workstation'; // The Unified Tool
import ChatInterface from './components/ChatInterface';
import MarketIntel from './components/MarketIntel';
import PatentHub from './components/PatentHub';
import MaterialLibrary from './components/MaterialLibrary';
import ResearchFeed from './components/ResearchFeed';
import ResearchReport from './components/ResearchReport';
import { MaterialRecipe, LibraryItem, SharedContext } from './types';
import { Search, AlertTriangle, Terminal, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { generateResearchReport } from './services/geminiService';

const MAX_QUERY_LENGTH = 250;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sharedContext, setSharedContext] = useState<SharedContext>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);

  // Mission Control / Custom Query State
  const [customQuery, setCustomQuery] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [querySuccess, setQuerySuccess] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);

  const handleNavigate = (tab: string, data?: SharedContext) => {
    if (data) {
      setSharedContext(prev => ({ ...prev, ...data }));
    }
    setActiveTab(tab);
  };

  const addToLibrary = (recipe: MaterialRecipe, image?: string) => {
    const newItem: LibraryItem = {
      ...recipe,
      id: Date.now().toString(),
      dateCreated: new Date(),
      image: image,
      category: 'Custom'
    };
    setLibraryItems(prev => [newItem, ...prev]);
  };

  const sanitizeInput = (input: string): string => {
    return input.replace(/<[^>]*>?/gm, "").trim();
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomQuery(val);
    setQuerySuccess(false);
    
    if (val.length > MAX_QUERY_LENGTH) {
        setValidationError(`Query buffer exceeded (${val.length}/${MAX_QUERY_LENGTH})`);
    } else {
        setValidationError(null);
    }
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sanitized = sanitizeInput(customQuery);
    if (!sanitized || queryLoading) return;
    
    if (customQuery.length > MAX_QUERY_LENGTH) {
         setValidationError(`Protocol too long. Reduce complexity.`);
         return;
    }

    setQueryLoading(true);
    setValidationError(null);
    console.log("Executing Mission Protocol:", sanitized);

    try {
      // Check for research/trends intent
      const lower = sanitized.toLowerCase();
      const isResearch = lower.includes('search') || lower.includes('research') || lower.includes('trends') || lower.includes('demand') || lower.includes('market');
      
      if (isResearch) {
        const report = await generateResearchReport(sanitized);
        handleNavigate('report', { researchReport: report });
        setCustomQuery('');
        setQuerySuccess(true);
      } else if (lower.includes('analyze') || lower.includes('question')) {
        handleNavigate('chat');
        setCustomQuery('');
        setQuerySuccess(true);
      } else {
        // Fallback to chat for other generic queries
        handleNavigate('chat');
        setCustomQuery('');
        setQuerySuccess(true);
      }
    } catch (err) {
      setValidationError("Database link failed. Retry protocol.");
    } finally {
      setQueryLoading(false);
      setTimeout(() => setQuerySuccess(false), 3000);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <QuadrantGrid onNavigate={handleNavigate} />;
      case 'workstation':
        return <Workstation onNavigate={handleNavigate} onSaveToLibrary={addToLibrary} initialContext={sharedContext} />;
      case 'library':
        return <MaterialLibrary items={libraryItems} onNavigate={handleNavigate} />;
      case 'patents':
        return <PatentHub initialQuery={sharedContext.query} />;
      case 'research':
        return <ResearchFeed />;
      case 'report':
        return sharedContext.researchReport ? <ResearchReport data={sharedContext.researchReport} /> : <QuadrantGrid onNavigate={handleNavigate} />;
      case 'chat':
        return <ChatInterface />;
      case 'intel':
        return <MarketIntel />;
      default:
        return <QuadrantGrid onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-slate-200 bg-white flex-shrink-0 overflow-hidden flex flex-col relative z-30`}>
         <Header activeTab={activeTab} onNavigate={handleNavigate} />
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden relative z-10 bg-slate-50 text-slate-900 flex flex-col">
        {/* Mobile Sidebar Toggle */}
        <div className="absolute top-4 left-4 z-50 md:hidden">
           <button 
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-slate-900"
           >
             Menu
           </button>
        </div>

        {/* Mission Control Input Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 shrink-0 flex items-center gap-6 z-20 shadow-sm">
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                <Terminal size={14} />
                <span>Command_Line</span>
            </div>
            
            <form onSubmit={handleQuerySubmit} className="flex-1 relative group">
                <Search className={`absolute left-4 top-3 transition-colors ${validationError ? 'text-red-400' : 'text-slate-400 group-focus-within:text-cyan-600'}`} size={18} />
                <input 
                    value={customQuery}
                    onChange={handleQueryChange}
                    disabled={queryLoading}
                    placeholder="Enter custom protocol or query ecosystem..."
                    className={`w-full bg-slate-50 border rounded-xl pl-12 pr-24 py-2.5 text-sm focus:outline-none transition-all font-mono disabled:opacity-50 ${
                        validationError 
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-50 text-red-900 placeholder-red-300' 
                        : 'border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-50 text-slate-900'
                    }`}
                />
                
                {/* Character Counter */}
                <div className={`absolute right-4 top-3 text-[10px] font-bold font-mono ${customQuery.length > MAX_QUERY_LENGTH ? 'text-red-500' : 'text-slate-400'}`}>
                    {queryLoading ? <Loader2 size={14} className="animate-spin text-cyan-600" /> : `${customQuery.length}/${MAX_QUERY_LENGTH}`}
                </div>
            </form>

            {/* Feedback Area */}
            <div className="w-48 flex justify-end">
                {validationError && (
                    <div className="flex items-center gap-2 text-xs font-bold text-red-500 animate-fade-in">
                        <XCircle size={14} /> ERROR
                    </div>
                )}
                {querySuccess && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 animate-fade-in">
                        <CheckCircle2 size={14} /> Protocol Initiated
                    </div>
                )}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 bg-obsidian-950">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
