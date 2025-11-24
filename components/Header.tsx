
import React from 'react';
import { LayoutGrid, MessageSquare, FlaskConical, Globe, FileText, ChevronDown, Factory, Sparkles, BookMarked } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Ecosystem', icon: LayoutGrid },
    { id: 'analyze', label: 'Logic Lab', icon: FlaskConical },
    { id: 'innovation', label: 'Innovation Lab', icon: Sparkles },
    { id: 'factory', label: 'The Factory', icon: Factory },
    { id: 'patents', label: 'Patent Hub', icon: FileText },
    { id: 'library', label: 'Material Registry', icon: BookMarked },
    { id: 'chat', label: 'Chat Engine', icon: MessageSquare },
    { id: 'intel', label: 'Market Intel', icon: Globe },
  ];

  return (
    <div className="h-full flex flex-col p-2">
      {/* User / Workspace Switcher */}
      <div className="flex items-center gap-2 p-2 hover:bg-gray-200/50 rounded-md cursor-pointer transition-colors mb-4">
        <div className="w-5 h-5 bg-gray-800 rounded text-white flex items-center justify-center text-[10px] font-bold">
           M
        </div>
        <span className="text-sm font-medium text-gray-700 truncate">Material Engine</span>
        <ChevronDown size={14} className="text-gray-400 ml-auto" />
      </div>

      {/* Quick Actions */}
      <div className="mb-4 px-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
          Workspace
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 mb-0.5 rounded-md text-sm transition-all duration-200 group ${
              activeTab === item.id
                ? 'bg-white shadow-sm text-gray-900 font-medium ring-1 ring-gray-200'
                : 'text-gray-600 hover:bg-gray-100/50'
            }`}
          >
            <item.icon size={16} className={`${activeTab === item.id ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Header;
