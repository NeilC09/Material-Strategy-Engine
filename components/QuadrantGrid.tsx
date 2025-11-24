
import React, { useState, useRef, useEffect } from 'react';
import { 
  Leaf, ShieldCheck, Droplet, Microscope, ArrowRight, X, 
  Activity, FileText, Globe, Bot, Send, Loader2, ExternalLink, Layers, AlertTriangle, Factory, Sparkles
} from 'lucide-react';
import { QuadrantType, NewsItem, ChatMessage, MaterialFamily } from '../types';
import { SharedContext } from '../App';
import { searchMarketIntel, askQuadrantQuestion, discoverEmergingPolymers } from '../services/geminiService';

interface QuadrantGridProps {
  onNavigate: (tab: string, data?: SharedContext) => void;
}

interface QuadrantDetail {
  id: QuadrantType;
  title: string;
  tagline: string;
  color: string;
  icon: any;
  definition: string;
  coreLogic: string;
  stats: {
    readiness: number;
    sustainability: number;
    scalability: number;
    cost: 'Low' | 'Medium' | 'High' | 'Premium';
  };
  families: MaterialFamily[];
  engineering: {
    challenges: string[];
    processing: string[];
  };
  applications: string[];
  players: {
    name: string;
    tech: string;
  }[];
}

const quadrantData: Record<string, QuadrantDetail> = {
  [QuadrantType.BIO_BIO]: {
    id: QuadrantType.BIO_BIO,
    title: "BIO-BIO",
    tagline: "Grown & Returned to Earth",
    color: "text-emerald-700",
    icon: Leaf,
    definition: "Polymers derived from renewable biomass that fully biodegrade in natural environments.",
    coreLogic: "Stability vs. Degradability",
    stats: { readiness: 75, sustainability: 95, scalability: 60, cost: 'High' },
    families: [
      { name: "PHA", description: "Bacterial polyesters made via fermentation.", commonGrades: ["PHB", "PHBH"] },
      { name: "PLA", description: "Fermented starch converted to lactide.", commonGrades: ["Ingeo", "Luminy"] },
      { name: "Starch", description: "Destructured starch blends.", commonGrades: ["Cardia", "Mater-Bi"] }
    ],
    engineering: {
      challenges: ["Thermal degradation during processing", "Brittleness due to high crystallinity", "Hydrolytic instability"],
      processing: ["Pre-drying required (<250ppm)", "Low shear screw configuration", "Nucleating agents for cycle time"]
    },
    applications: ["Rigid Packaging", "Mulch Film", "Cutlery", "3D Printing"],
    players: [
      { name: "Danimer", tech: "Nodax PHA" },
      { name: "NatureWorks", tech: "Ingeo PLA" },
      { name: "Kaneka", tech: "PHBH" }
    ]
  },
  [QuadrantType.BIO_DURABLE]: {
    id: QuadrantType.BIO_DURABLE,
    title: "BIO-DURABLE",
    tagline: "Green Origins, Permanent",
    color: "text-orange-700",
    icon: ShieldCheck,
    definition: "Chemically identical to fossil plastics but made from bio-feedstock.",
    coreLogic: "Feedstock Substitution",
    stats: { readiness: 95, sustainability: 60, scalability: 85, cost: 'Medium' },
    families: [
      { name: "Bio-PE", description: "Ethanol to ethylene.", commonGrades: ["I'm Green"] },
      { name: "PEF", description: "Bio-barrier polymer.", commonGrades: ["YXY"] },
      { name: "Bio-PA", description: "Castor oil nylons.", commonGrades: ["PA11", "PA6.10"] }
    ],
    engineering: {
      challenges: ["Supply chain consistency", "Land use competition", "Recycling sorting"],
      processing: ["Drop-in replacement", "Standard tooling", "No new equipment needed"]
    },
    applications: ["Automotive", "Durables", "Bottles", "Textiles"],
    players: [
      { name: "Braskem", tech: "Bio-PE" },
      { name: "Avantium", tech: "PEF" },
      { name: "Neste", tech: "Renewable Hydrocarbons" }
    ]
  },
  [QuadrantType.FOSSIL_BIO]: {
    id: QuadrantType.FOSSIL_BIO,
    title: "FOSSIL-BIO",
    tagline: "The Pragmatic Bridge",
    color: "text-amber-700",
    icon: Droplet,
    definition: "Synthetic copolyesters from fossil sources that biodegrade.",
    coreLogic: "Statistical Copolyesters",
    stats: { readiness: 90, sustainability: 40, scalability: 90, cost: 'Medium' },
    families: [
      { name: "PBAT", description: "Flexible copolyester.", commonGrades: ["Ecoflex"] },
      { name: "PBS", description: "Semi-crystalline hybrid.", commonGrades: ["BioPBS"] },
      { name: "PCL", description: "Low melt polyester.", commonGrades: ["Capa"] }
    ],
    engineering: {
      challenges: ["Low modulus", "Heat deflection", "Blend compatibility"],
      processing: ["Film blowing friendly", "Impact modifier role", "Thermal stability"]
    },
    applications: ["Compost Bags", "Coatings", "Ag Films", "Blends"],
    players: [
      { name: "BASF", tech: "Ecoflex" },
      { name: "Novamont", tech: "Mater-Bi" },
      { name: "Mitsubishi", tech: "BioPBS" }
    ]
  },
  [QuadrantType.NEXT_GEN]: {
    id: QuadrantType.NEXT_GEN,
    title: "NEXT-GEN",
    tagline: "Grown, Not Made",
    color: "text-teal-700",
    icon: Microscope,
    definition: "Materials produced via biological assembly or biomimicry.",
    coreLogic: "Bio-Fabrication",
    stats: { readiness: 30, sustainability: 100, scalability: 20, cost: 'Premium' },
    families: [
      { name: "Mycelium", description: "Fungal networks.", commonGrades: ["Mushroom Pkg"] },
      { name: "Algae", description: "Biomass filler.", commonGrades: ["Bloom"] },
      { name: "Protein", description: "Spider silk/Milk.", commonGrades: ["Brewed"] }
    ],
    engineering: {
      challenges: ["Water sensitivity", "Batch variability", "Production time"],
      processing: ["Growth cycles", "Baking/Drying", "Not injection moldable"]
    },
    applications: ["Luxury Pkg", "Leather Alt", "Insulation", "Foams"],
    players: [
      { name: "Ecovative", tech: "Mycelium" },
      { name: "Newlight", tech: "AirCarbon" },
      { name: "Spiber", tech: "Proteins" }
    ]
  }
};

const QuadrantGrid: React.FC<QuadrantGridProps> = ({ onNavigate }) => {
  const [selectedId, setSelectedId] = useState<QuadrantType | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'engineering' | 'players' | 'intel'>('overview');
  
  // Data Fetching States
  const [intelData, setIntelData] = useState<NewsItem[]>([]);
  const [intelLoading, setIntelLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [discoveredFamilies, setDiscoveredFamilies] = useState<MaterialFamily[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeData = selectedId ? quadrantData[selectedId] : null;

  // Reset discovery when changing quadrants
  useEffect(() => {
    setDiscoveredFamilies([]);
  }, [selectedId]);

  const handleIntelFetch = async () => {
    if (!selectedId || intelData.length > 0) return;
    setIntelLoading(true);
    try {
      const query = `${activeData?.title} material trends and news 2024`;
      const res = await searchMarketIntel(query);
      setIntelData(res);
    } catch (e) { console.error(e); }
    setIntelLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'intel') handleIntelFetch();
  }, [activeTab]);

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() }]);
    setChatLoading(true);
    try {
      const res = await askQuadrantQuestion(activeData?.title || '', msg);
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: res, timestamp: new Date() }]);
    } catch (e) { console.error(e); }
    setChatLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleDiscovery = async () => {
    if (!activeData) return;
    setDiscoveryLoading(true);
    try {
      const results = await discoverEmergingPolymers(activeData.title);
      setDiscoveredFamilies(prev => [...prev, ...results]);
    } catch (error) {
      console.error(error);
    }
    setDiscoveryLoading(false);
  };

  return (
    <div className="relative h-full w-full">
      {/* HEADER */}
      <div className="mb-8 animate-fade-in">
        <div className="h-32 w-full bg-gradient-to-b from-gray-100 to-white rounded-t-lg mb-4 border-b border-gray-100"></div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Material Ecosystem</h1>
        <p className="text-gray-500">Select a quadrant to explore strategic analysis.</p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
        {Object.values(quadrantData).map((q) => {
          const Icon = q.icon;
          return (
            <div 
              key={q.id}
              onClick={() => { setSelectedId(q.id); setActiveTab('overview'); }}
              className="group cursor-pointer bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-all hover:shadow-card relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-md bg-gray-100 ${q.color} bg-opacity-10`}>
                  <Icon size={24} className={q.color} />
                </div>
                <ArrowRight size={18} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{q.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{q.definition}</p>
              
              <div className="flex items-center gap-2 text-xs text-gray-400 font-mono uppercase">
                 <span className="w-2 h-2 rounded-full bg-gray-300"></span> {q.stats.cost} Cost
              </div>
            </div>
          );
        })}
      </div>

      {/* SIDE PEEK OVERLAY */}
      {selectedId && activeData && (
        <div className="fixed inset-0 bg-black/20 z-40 flex justify-end" onClick={() => setSelectedId(null)}>
          <div 
            className="w-full max-w-2xl bg-white h-full shadow-xl animate-fade-in flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between bg-white">
              <div>
                 <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-xs">Quadrant</span>
                    <span>/</span>
                    <span>{activeData.title}</span>
                 </div>
                 <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                   <activeData.icon className={activeData.color} size={28} />
                   {activeData.title}
                 </h2>
                 <p className="text-gray-500 mt-1">{activeData.tagline}</p>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"><X size={20} /></button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-8 border-b border-gray-200 flex gap-6 sticky top-0 bg-white z-10">
              {['overview', 'engineering', 'players', 'intel'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-white">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                   {/* Stats Block */}
                   <div className="grid grid-cols-3 gap-4 pb-6 border-b border-gray-100">
                      <div>
                        <div className="text-xs text-gray-400 uppercase font-bold mb-1">Sustainability</div>
                        <div className="text-xl font-medium text-gray-900">{activeData.stats.sustainability}/100</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase font-bold mb-1">Readiness</div>
                        <div className="text-xl font-medium text-gray-900">{activeData.stats.readiness}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase font-bold mb-1">Scalability</div>
                        <div className="text-xl font-medium text-gray-900">{activeData.stats.scalability}%</div>
                      </div>
                   </div>

                   {/* Families */}
                   <div>
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Layers size={16} /> Material Families</h3>
                        <button 
                          onClick={handleDiscovery}
                          disabled={discoveryLoading}
                          className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-100 flex items-center gap-1.5 font-bold transition-colors"
                        >
                           {discoveryLoading ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                           Scout Emerging Classes
                        </button>
                     </div>
                     
                     <div className="space-y-3">
                       {/* Standard Families */}
                       {activeData.families.map((fam, i) => (
                         <div key={`std-${i}`} className="group border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-center mb-1">
                               <span className="font-medium text-gray-900">{fam.name}</span>
                               <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                                  <button 
                                    onClick={() => onNavigate('factory', { material: fam.name })}
                                    className="text-xs bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1"
                                  >
                                    <Factory size={10} /> Manufacture
                                  </button>
                                  <button 
                                    onClick={() => onNavigate('patents', { query: fam.name })}
                                    className="text-xs bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1"
                                  >
                                    <FileText size={10} /> Patents
                                  </button>
                               </div>
                            </div>
                            <p className="text-sm text-gray-600">{fam.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {fam.commonGrades.map(g => (
                                <span key={g} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{g}</span>
                              ))}
                            </div>
                         </div>
                       ))}

                       {/* Discovered Families */}
                       {discoveredFamilies.map((fam, i) => (
                         <div key={`disc-${i}`} className="group border border-indigo-100 bg-indigo-50/30 rounded-md p-4 hover:bg-indigo-50 transition-colors animate-fade-in">
                            <div className="flex justify-between items-center mb-1">
                               <span className="font-bold text-indigo-900 flex items-center gap-2">
                                  <Sparkles size={12} className="text-indigo-500" /> {fam.name}
                               </span>
                               <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                                  <button 
                                    onClick={() => onNavigate('factory', { material: fam.name })}
                                    className="text-xs bg-white border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-100 text-indigo-700 flex items-center gap-1"
                                  >
                                    <Factory size={10} /> Manufacture
                                  </button>
                                  <button 
                                    onClick={() => onNavigate('patents', { query: fam.name })}
                                    className="text-xs bg-white border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-100 text-indigo-700 flex items-center gap-1"
                                  >
                                    <FileText size={10} /> Patents
                                  </button>
                               </div>
                            </div>
                            <p className="text-sm text-indigo-800">{fam.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {fam.commonGrades.map(g => (
                                <span key={g} className="text-[10px] bg-white border border-indigo-100 text-indigo-500 px-1.5 py-0.5 rounded">{g}</span>
                              ))}
                            </div>
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
              )}

              {activeTab === 'engineering' && (
                <div className="space-y-6">
                   <div className="p-4 bg-amber-50 border border-amber-100 rounded-md">
                      <h4 className="text-amber-800 font-bold text-sm mb-2 flex items-center gap-2"><AlertTriangle size={14} /> Challenges</h4>
                      <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
                        {activeData.engineering.challenges.map(c => <li key={c}>{c}</li>)}
                      </ul>
                   </div>
                   <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
                      <h4 className="text-blue-800 font-bold text-sm mb-2 flex items-center gap-2"><Activity size={14} /> Processing</h4>
                      <ul className="list-disc list-inside text-sm text-blue-900 space-y-1">
                        {activeData.engineering.processing.map(c => <li key={c}>{c}</li>)}
                      </ul>
                   </div>
                </div>
              )}

              {activeTab === 'players' && (
                <div className="space-y-2">
                   {activeData.players.map((p, i) => (
                     <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500 font-bold text-xs">
                              {p.name.charAt(0)}
                           </div>
                           <div>
                             <div className="text-sm font-medium text-gray-900">{p.name}</div>
                             <div className="text-xs text-gray-500">{p.tech}</div>
                           </div>
                        </div>
                        <button onClick={() => onNavigate('patents', { query: p.name })} className="text-gray-400 hover:text-gray-600">
                           <FileText size={16} />
                        </button>
                     </div>
                   ))}
                </div>
              )}

              {activeTab === 'intel' && (
                <div className="space-y-4">
                   {/* Embedded Chat */}
                   <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
                      <div className="max-h-40 overflow-y-auto space-y-3 mb-3">
                         {chatMessages.map(m => (
                           <div key={m.id} className={`text-sm ${m.role === 'user' ? 'text-right text-gray-900' : 'text-left text-gray-600'}`}>
                              <span className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-white border border-gray-200' : 'bg-transparent'}`}>
                                {m.content}
                              </span>
                           </div>
                         ))}
                         {chatLoading && <Loader2 className="animate-spin text-gray-400" size={16} />}
                         <div ref={chatEndRef} />
                      </div>
                      <form onSubmit={handleChatSend} className="flex gap-2">
                         <input 
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder={`Ask AI about ${activeData.title}...`}
                            className="flex-1 text-sm bg-white border border-gray-200 rounded px-3 py-1 focus:outline-none focus:border-gray-400"
                         />
                         <button type="submit" className="p-1 text-gray-500 hover:text-gray-900"><Send size={16} /></button>
                      </form>
                   </div>

                   {/* News Feed */}
                   {intelLoading && <div className="text-sm text-gray-400">Loading market intel...</div>}
                   {intelData.map((item, i) => (
                     <div key={i} className="block p-3 border border-gray-200 rounded hover:border-gray-300 transition-colors">
                        <a href={item.url} target="_blank" rel="noreferrer" className="font-medium text-gray-900 hover:underline flex items-center gap-2">
                           {item.title} <ExternalLink size={12} className="text-gray-400" />
                        </a>
                        <p className="text-xs text-gray-500 mt-1">{item.snippet}</p>
                        <div className="text-[10px] text-gray-400 mt-2 uppercase">{item.source}</div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuadrantGrid;
