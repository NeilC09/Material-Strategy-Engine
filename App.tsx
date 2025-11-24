
import React, { useState } from 'react';
import Header from './components/Header';
import QuadrantGrid from './components/QuadrantGrid';
import MaterialAnalyzer from './components/MaterialAnalyzer';
import ChatInterface from './components/ChatInterface';
import MarketIntel from './components/MarketIntel';
import PatentHub from './components/PatentHub';
import Factory from './components/Factory';
import InnovationLab from './components/InnovationLab';
import MaterialLibrary from './components/MaterialLibrary';
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
    setActiveTab('library');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <QuadrantGrid onNavigate={handleNavigate} />;
      case 'analyze':
        return <MaterialAnalyzer onNavigate={handleNavigate} initialMaterial={sharedContext.material} />;
      case 'innovation':
        return <InnovationLab onSave={addToLibrary} onNavigate={handleNavigate} initialProblem={sharedContext.problem} />;
      case 'library':
        return <MaterialLibrary items={libraryItems} onNavigate={handleNavigate} />;
      case 'factory':
        return <Factory initialMaterial={sharedContext.material} onNavigate={handleNavigate} />;
      case 'patents':
        return <PatentHub initialQuery={sharedContext.query} />;
      case 'chat':
        return <ChatInterface />;
      case 'intel':
        return <MarketIntel />;
      default:
        return <QuadrantGrid onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-white text-gray-800 font-sans overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"></div>
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-8 left-20 w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-60' : 'w-0'} transition-all duration-300 border-r border-gray-200 bg-white/50 backdrop-blur-md flex-shrink-0 overflow-hidden flex flex-col relative z-10`}>
         <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative z-10">
        {/* Mobile Sidebar Toggle (Visible on mobile or if needed) */}
        <div className="absolute top-4 left-4 z-50 md:hidden">
           <button 
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="p-2 rounded-md bg-white shadow-sm border border-gray-200 text-gray-500"
           >
             Menu
           </button>
        </div>

        <div className="max-w-[1200px] mx-auto p-8 md:p-12 min-h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
