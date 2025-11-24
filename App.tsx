
import React, { useState } from 'react';
import Header from './components/Header';
import QuadrantGrid from './components/QuadrantGrid';
import Workstation from './components/Workstation'; // The Unified Tool
import ChatInterface from './components/ChatInterface';
import MarketIntel from './components/MarketIntel';
import PatentHub from './components/PatentHub';
import MaterialLibrary from './components/MaterialLibrary';
import ResearchFeed from './components/ResearchFeed'; // NEW
import { MaterialRecipe, LibraryItem } from './types';

export interface SharedContext {
  material?: string; // For Analyzer and Factory
  query?: string;    // For Patents
  problem?: string;  // For Innovation Lab
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sharedContext, setSharedContext] = useState<SharedContext>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <QuadrantGrid onNavigate={handleNavigate} />;
      case 'workstation':
        return <Workstation onNavigate={handleNavigate} onSaveToLibrary={addToLibrary} />;
      case 'library':
        return <MaterialLibrary items={libraryItems} onNavigate={handleNavigate} />;
      case 'patents':
        return <PatentHub initialQuery={sharedContext.query} />;
      case 'research': // NEW
        return <ResearchFeed />;
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
         <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden relative z-10 bg-slate-50 text-slate-900">
        {/* Mobile Sidebar Toggle */}
        <div className="absolute top-4 left-4 z-50 md:hidden">
           <button 
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="p-2 rounded-lg bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-slate-900"
           >
             Menu
           </button>
        </div>

        {/* Content Area */}
        <div className="h-full overflow-y-auto">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
