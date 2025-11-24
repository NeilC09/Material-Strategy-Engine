
import React, { useState, useMemo } from 'react';
import { BookMarked, Search, Filter, LayoutGrid, List, Calendar, Tag, Factory, X } from 'lucide-react';
import { LibraryItem, QuadrantType, SharedContext } from '../types';

interface MaterialLibraryProps {
  items: LibraryItem[];
  onNavigate: (tab: string, data?: SharedContext) => void;
}

const MaterialLibrary: React.FC<MaterialLibraryProps> = ({ items, onNavigate }) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [quadrantFilter, setQuadrantFilter] = useState<QuadrantType | 'ALL'>('ALL');
  const [applicationFilter, setApplicationFilter] = useState<string>('ALL');

  // Extract unique applications for the filter dropdown
  const allApplications = useMemo(() => {
    const apps = new Set<string>();
    items.forEach(item => {
      item.applications.forEach(app => apps.add(app));
    });
    return Array.from(apps).sort();
  }, [items]);

  const filteredItems = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || 
                          i.description.toLowerCase().includes(search.toLowerCase());
    const matchesQuadrant = quadrantFilter === 'ALL' || i.quadrant === quadrantFilter;
    const matchesApplication = applicationFilter === 'ALL' || i.applications.includes(applicationFilter);

    return matchesSearch && matchesQuadrant && matchesApplication;
  });

  const clearFilters = () => {
      setQuadrantFilter('ALL');
      setApplicationFilter('ALL');
      setSearch('');
  };

  const activeFilterCount = (quadrantFilter !== 'ALL' ? 1 : 0) + (applicationFilter !== 'ALL' ? 1 : 0);

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
      <div className="flex flex-col gap-4 mb-8">
         <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search registry..."
                   className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-gray-400"
                />
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters || activeFilterCount > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
                <Filter size={16} /> Filters
                {activeFilterCount > 0 && (
                    <span className="bg-indigo-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                        {activeFilterCount}
                    </span>
                )}
            </button>
         </div>

         {/* Expanded Filters Panel */}
         {showFilters && (
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Filter size={12} /> Active Filters
                    </h4>
                    <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1">
                        <X size={12} /> Reset All
                    </button>
                </div>
                <div className="flex flex-wrap gap-6">
                    {/* Quadrant Filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Quadrant</label>
                        <select 
                            value={quadrantFilter} 
                            onChange={(e) => setQuadrantFilter(e.target.value as QuadrantType | 'ALL')}
                            className="bg-white border border-gray-200 text-sm rounded-lg p-2.5 min-w-[200px] outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all cursor-pointer"
                        >
                            <option value="ALL">All Quadrants</option>
                            <option value={QuadrantType.BIO_BIO}>BIO-BIO (Green)</option>
                            <option value={QuadrantType.BIO_DURABLE}>BIO-DURABLE (Rust)</option>
                            <option value={QuadrantType.FOSSIL_BIO}>FOSSIL-BIO (Sand)</option>
                            <option value={QuadrantType.NEXT_GEN}>NEXT-GEN (Teal)</option>
                        </select>
                    </div>

                    {/* Application Filter */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-700">Application</label>
                         <select 
                            value={applicationFilter} 
                            onChange={(e) => setApplicationFilter(e.target.value)}
                            className="bg-white border border-gray-200 text-sm rounded-lg p-2.5 min-w-[200px] outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all cursor-pointer"
                        >
                            <option value="ALL">All Applications</option>
                            {allApplications.map(app => (
                                <option key={app} value={app}>{app}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
         )}
      </div>

      {filteredItems.length === 0 ? (
         <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <BookMarked className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-gray-900 font-medium">No materials found</h3>
            <p className="text-gray-500 text-sm mt-1">Adjust your filters or generate new materials in the Lab.</p>
            {(search || quadrantFilter !== 'ALL' || applicationFilter !== 'ALL') ? (
                <button 
                    onClick={clearFilters}
                    className="mt-4 px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50"
                >
                    Clear Filters
                </button>
            ) : (
                <button 
                    onClick={() => onNavigate('innovation')}
                    className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800"
                >
                    Go to Lab
                </button>
            )}
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
                        onClick={() => onNavigate('workstation', { material: item.name, workstationStep: 'build' })}
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
