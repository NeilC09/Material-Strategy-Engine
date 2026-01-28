
import React, { useState } from 'react';
import { LayoutGrid, MessageSquare, FlaskConical, Globe, FileText, ChevronDown, Factory, Sparkles, BookMarked, Workflow, Newspaper, Search } from 'lucide-react';
import { SharedContext } from '../types';

interface HeaderProps {
  activeTab: string;
  onNavigate: (tab: string, data?: SharedContext) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate }) => {
  const [query, setQuery] = useState('');

  const navItems = [
    { id: 'dashboard', label: 'Ecosystem Map', icon: LayoutGrid },
    { id: 'workstation', label: 'Workbench', icon: Workflow }, // Unified Tool
    { id: 'research', label: 'Research Feed', icon: Newspaper }, // NEW: Research Tab
    { id: 'intel', label: 'Global Intelligence', icon: Globe },
    { id: 'patents', label: 'Patent Hub', icon: FileText },
    { id: 'library', label: 'Registry', icon: BookMarked },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to Workstation Analyzer with the query
      onNavigate('workstation', { material: query, workstationStep: 'analyze' });
      setQuery('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      {/* User / Workspace Switcher */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-8 h-8 bg-cyan-50 text-cyan-600 border border-cyan-200 rounded-sm flex items-center justify-center text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
             M
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold text-slate-900 tracking-wide block font-mono group-hover:text-cyan-600 transition-colors">MATERIAL_ENG</span>
            <span className="text-[10px] text-slate-500 block font-mono uppercase tracking-wider">v2.4 // PRO</span>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 space-y-1 px-3">
        {/* Quick Search */}
        <div className="px-3 mb-6">
          <form onSubmit={handleSearch} className="relative group">
             <Search className="absolute left-6 top-2.5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" size={14} />
             <input
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder="Find material..."
               className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 transition-all placeholder-slate-400 text-slate-700"
             />
          </form>
        </div>

        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 pl-3 font-mono">
          Modules
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-all duration-200 group border-l-2 ${
              activeTab === item.id
                ? 'bg-cyan-50 border-cyan-400 text-cyan-900 shadow-sm'
                : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <item.icon size={18} className={`${activeTab === item.id ? 'text-cyan-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span className={`font-medium tracking-wide ${activeTab === item.id ? 'text-cyan-900' : ''}`}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Status */}
      <div className="mt-auto p-6 border-t border-slate-200 bg-slate-50">
         <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </div>
            SYSTEMS ONLINE
         </div>
      </div>
    </div>
  );
};

export default Header;
