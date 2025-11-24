
import React from 'react';
import { LayoutGrid, MessageSquare, FlaskConical, Globe, FileText, ChevronDown, Factory, Sparkles, BookMarked, Workflow } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Ecosystem Map', icon: LayoutGrid },
    { id: 'workstation', label: 'Engineer\'s Workbench', icon: Workflow }, // Unified Tool
    { id: 'intel', label: 'Global Intelligence', icon: Globe },
    { id: 'patents', label: 'Patent Hub', icon: FileText },
    { id: 'library', label: 'Registry', icon: BookMarked },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
  ];

  return (
    <div className="h-full flex flex-col p-2 bg-gray-50/50">
      {/* User / Workspace Switcher */}
      <div className="flex items-center gap-2 p-2 hover:bg-gray-200/50 rounded-md cursor-pointer transition-colors mb-6 mt-2">
        <div className="w-6 h-6 bg-gray-900 rounded-md text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
           MSE
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-gray-900 truncate block">Material Engine</span>
          <span className="text-[10px] text-gray-500 block">v2.4 Pro</span>
        </div>
        <ChevronDown size={14} className="text-gray-400" />
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 space-y-1">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">
          Core Modules
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
              activeTab === item.id
                ? 'bg-white shadow-sm text-gray-900 font-semibold ring-1 ring-gray-200'
                : 'text-gray-600 hover:bg-gray-200/50'
            }`}
          >
            <item.icon size={18} className={`${activeTab === item.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Bottom Status */}
      <div className="mt-auto p-4 border-t border-gray-200">
         <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Systems Online
         </div>
      </div>
    </div>
  );
};

export default Header;
