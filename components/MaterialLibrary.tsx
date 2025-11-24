
import React, { useState } from 'react';
import { BookMarked, Search, Filter, LayoutGrid, List, Calendar, Tag, Factory } from 'lucide-react';
import { LibraryItem } from '../types';
import { SharedContext } from '../App';

interface MaterialLibraryProps {
  items: LibraryItem[];
  onNavigate: (tab: string, data?: SharedContext) => void;
}

const MaterialLibrary: React.FC<MaterialLibraryProps> = ({ items, onNavigate }) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-8">
         <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
               <BookMarked className="text-indigo-600" /> Material Registry
            </h1>
            <p className="text-gray-500 text-sm mt-1">Database of generated concepts and custom formulations.</p>
         </div>
         <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button 
               onClick={() => setView('grid')}
               className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
               <LayoutGrid size={16} />
            </button>
            <button 
               onClick={() => setView('list')}
               className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
               <List size={16} />
            </button>
         </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 mb-8">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search registry..."
               className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gray-400"
            />
         </div>
         <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Filter size={16} /> Filter
         </button>
      </div>

      {filteredItems.length === 0 ? (
         <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <BookMarked className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-gray-900 font-medium">Registry is empty</h3>
            <p className="text-gray-500 text-sm mt-1">Use the Innovation Lab to generate and save new materials.</p>
            <button 
               onClick={() => onNavigate('innovation')}
               className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800"
            >
               Go to Lab
            </button>
         </div>
      ) : (
         <div className={`${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {filteredItems.map((item) => (
               <div 
                  key={item.id} 
                  className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all group ${view === 'list' ? 'flex items-center p-4 gap-6' : ''}`}
               >
                  {/* Image */}
                  <div className={`${view === 'grid' ? 'aspect-video w-full' : 'w-24 h-24 shrink-0 rounded-lg'} bg-gray-100 overflow-hidden relative`}>
                     {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                     )}
                     <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur text-white text-[10px] font-bold rounded uppercase">
                        {item.quadrant}
                     </div>
                  </div>

                  {/* Content */}
                  <div className={`${view === 'grid' ? 'p-5' : 'flex-1'}`}>
                     <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                        {view === 'list' && (
                           <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar size={12} /> {item.dateCreated.toLocaleDateString()}
                           </span>
                        )}
                     </div>
                     <p className={`text-sm text-gray-500 mb-4 ${view === 'grid' ? 'line-clamp-2' : ''}`}>{item.description}</p>
                     
                     <div className="flex items-center gap-2 mb-4">
                        <Tag size={14} className="text-gray-400" />
                        {item.applications.slice(0, 2).map((app, i) => (
                           <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{app}</span>
                        ))}
                     </div>

                     <button 
                        onClick={() => onNavigate('factory', { material: item.name })}
                        className="w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center justify-center gap-2"
                     >
                        <Factory size={14} /> Simulate
                     </button>
                  </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
};

export default MaterialLibrary;
