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
  borderColor: string;
  bgColor: string;
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
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/5",
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
    color: "text-orange-400",
    borderColor: "border-orange-500/30",
    bgColor: "bg-orange-500/5",
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
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/5",
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
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-500/5",
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
    <div className="relative h-full w-full p-6 overflow-y-auto bg-obsidian-900">
      {/* HEADER */}
      <div className="mb-12 animate-fade-in">
        <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent mb-8"></div>
        <h1 className="text-5xl font-bold text-white mb-2 tracking-tight font-mono uppercase">Material Ecosystem</h1>
        <p className="text-gray-400 font-mono text-sm">Initialize quadrant analysis protocol. Select sector to explore.</p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        {Object.values(quadrantData).map((q) => {
          const Icon = q.icon;
          return (
            <div 
              key={q.id}
              onClick={() => { setSelectedId(q.id); setActiveTab('overview'); }}
              className={`group cursor-pointer bg-obsidian-800 border ${q.borderColor} rounded-sm p-8 hover:bg-white/5 transition-all hover:shadow-glow relative overflow-hidden`}
            >
              {/* Scanline effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className={`p-3 rounded-none ${q.bgColor} border border-white/5`}>
                  <Icon size={28} className={q.color} />
                </div>
                <ArrowRight size={20} className="text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-gray-100 mb-2 font-mono tracking-wider">{q.title}</h3>
              <p className="text-sm text-gray-400 mb-6 line-clamp-2 font-sans leading-relaxed">{q.definition}</p>
              
              <div className="flex items-center gap-3 text-xs text-gray-500 font-mono uppercase tracking-widest border-t border-white/5 pt-4">
                 <span className={`w-1.5 h-1.5 ${q.color.replace('text-', 'bg-')} rounded-full`}></span> 
                 Cost Index: <span className="text-white">{q.stats.cost}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SIDE PEEK OVERLAY */}
      {selectedId && activeData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end" onClick={() => setSelectedId(null)}>
          <div 
            className="w-full max-w-3xl bg-obsidian-800 h-full shadow-[0_0_50px_rgba(34,211,238,0.1)] animate-fade-in flex flex-col border-l border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 py-8 border-b border-white/10 flex items-start justify-between bg-obsidian-800">
              <div>
                 <div className="flex items-center gap-2 text-gray-500 text-xs font-mono mb-3 uppercase tracking-widest">
                    <span className="text-white/50">Quadrant_ID</span>
                    <span className="text-white/30">/</span>
                    <span className={activeData.color}>{activeData.title}</span>
                 </div>
                 <h2 className="text-4xl font-bold text-white flex items-center gap-4 font-mono">
                   {activeData.title}
                 </h2>
                 <p className="text-gray-400 mt-2 font-mono text-sm">{activeData.tagline}</p>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => setSelectedId(null)} className="text-gray-500 hover:text-white p-2 hover:bg-white/10 rounded-sm transition-colors"><X size={24} /></button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-8 border-b border-white/10 flex gap-8 bg-obsidian-800/50 backdrop-blur-md sticky top-0 z-20">
              {['overview', 'engineering', 'players', 'intel'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={`py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === t ? 'border-cyan-400 text-cyan-400 shadow-glow' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-obsidian-900">
              {activeTab === 'overview' && (
                <div className="space-y-10">
                   {/* Stats Block */}
                   <div className="grid grid-cols-3 gap-px bg-white/10 border border-white/10">
                      <div className="bg-obsidian-800 p-6 text-center group hover:bg-white/5 transition-colors">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Sustainability</div>
                        <div className={`text-3xl font-mono font-bold ${activeData.color}`}>{activeData.stats.sustainability}/100</div>
                      </div>
                      <div className="bg-obsidian-800 p-6 text-center group hover:bg-white/5 transition-colors">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Readiness</div>
                        <div className="text-3xl font-mono font-bold text-white">{activeData.stats.readiness}%</div>
                      </div>
                      <div className="bg-obsidian-800 p-6 text-center group hover:bg-white/5 transition-colors">
                        <div className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">Scalability</div>
                        <div className="text-3xl font-mono font-bold text-white">{activeData.stats.scalability}%</div>
                      </div>
                   </div>

                   {/* Families */}
                   <div>
                     <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2"><Layers size={14} /> Material Families</h3>
                        <button 
                          onClick={handleDiscovery}
                          disabled={discoveryLoading}
                          className="text-xs bg-cyan-900/10 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-sm hover:bg-cyan-500/20 flex items-center gap-2 font-bold transition-all font-mono uppercase shadow-glow"
                        >
                           {discoveryLoading ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                           [ Scout_Emerging ]
                        </button>
                     </div>
                     
                     <div className="grid gap-4">
                       {/* Standard Families */}
                       {activeData.families.map((fam, i) => (
                         <div key={`std-${i}`} className="group bg-obsidian-800 border border-white/10 p-5 hover:border-white/30 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                               <span className="font-bold text-white text-lg">{fam.name}</span>
                               <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                                  <button 
                                    onClick={() => onNavigate('factory', { material: fam.name })}
                                    className="text-[10px] bg-white text-black px-3 py-1.5 font-bold uppercase hover:bg-gray-200 flex items-center gap-2"
                                  >
                                    <Factory size={12} /> Build
                                  </button>
                                  <button 
                                    onClick={() => onNavigate('patents', { query: fam.name })}
                                    className="text-[10px] border border-white/30 text-white px-3 py-1.5 font-bold uppercase hover:bg-white/10 flex items-center gap-2"
                                  >
                                    <FileText size={12} /> IP
                                  </button>
                               </div>
                            </div>
                            <p className="text-sm text-gray-400 font-mono mb-3">{fam.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {fam.commonGrades.map(g => (
                                <span key={g} className="text-[10px] bg-white/5 border border-white/10 text-gray-300 px-2 py-1 font-mono">{g}</span>
                              ))}
                            </div>
                         </div>
                       ))}

                       {/* Discovered Families */}
                       {discoveredFamilies.map((fam, i) => (
                         <div key={`disc-${i}`} className="group bg-cyan-900/10 border border-cyan-500/30 p-5 hover:bg-cyan-900/20 transition-colors animate-fade-in">
                            <div className="flex justify-between items-center mb-2">
                               <span className="font-bold text-cyan-400 flex items-center gap-2">
                                  <Sparkles size={14} /> {fam.name}
                               </span>
                            </div>
                            <p className="text-sm text-cyan-200/70 font-mono mb-3">{fam.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {fam.commonGrades.map(g => (
                                <span key={g} className="text-[10px] bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2 py-1 font-mono">{g}</span>
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
                   <div className="p-6 bg-amber-900/10 border border-amber-500/30 rounded-sm">
                      <h4 className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><AlertTriangle size={14} /> Engineering Challenges</h4>
                      <ul className="space-y-3">
                        {activeData.engineering.challenges.map(c => (
                           <li key={c} className="flex items-start gap-3 text-sm text-gray-300 font-mono">
                              <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 flex-shrink-0"></span>
                              {c}
                           </li>
                        ))}
                      </ul>
                   </div>
                   <div className="p-6 bg-cyan-900/10 border border-cyan-500/30 rounded-sm">
                      <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} /> Processing Logic</h4>
                      <ul className="space-y-3">
                        {activeData.engineering.processing.map(c => (
                           <li key={c} className="flex items-start gap-3 text-sm text-gray-300 font-mono">
                              <span className="mt-1.5 w-1.5 h-1.5 bg-cyan-500 flex-shrink-0"></span>
                              {c}
                           </li>
                        ))}
                      </ul>
                   </div>
                </div>
              )}

              {activeTab === 'players' && (
                <div className="grid gap-px bg-white/10 border border-white/10">
                   {activeData.players.map((p, i) => (
                     <div key={i} className="flex items-center justify-between p-4 bg-obsidian-800 hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 font-bold font-mono text-sm group-hover:text-cyan-400 group-hover:border-cyan-500/30">
                              {p.name.charAt(0)}
                           </div>
                           <div>
                             <div className="text-sm font-bold text-white tracking-wide">{p.name}</div>
                             <div className="text-xs text-gray-500 font-mono">{p.tech}</div>
                           </div>
                        </div>
                        <button onClick={() => onNavigate('patents', { query: p.name })} className="text-gray-600 hover:text-white p-2">
                           <FileText size={18} />
                        </button>
                     </div>
                   ))}
                </div>
              )}

              {activeTab === 'intel' && (
                <div className="space-y-6">
                   {/* Embedded Chat */}
                   <div className="border border-white/10 bg-black/40 p-6">
                      <div className="max-h-60 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-gray-700">
                         {chatMessages.map(m => (
                           <div key={m.id} className={`text-sm font-mono ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                              <span className={`inline-block px-4 py-2 ${m.role === 'user' ? 'bg-cyan-900/20 text-cyan-100 border border-cyan-500/30' : 'bg-white/10 text-gray-300 border border-white/10'}`}>
                                {m.content}
                              </span>
                           </div>
                         ))}
                         {chatLoading && <div className="text-xs font-mono text-cyan-500 animate-pulse">PROCESSING_QUERY...</div>}
                         <div ref={chatEndRef} />
                      </div>
                      <form onSubmit={handleChatSend} className="flex gap-2 border-t border-white/10 pt-4">
                         <input 
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder={`QUERY_DATABASE: ${activeData.title}...`}
                            className="flex-1 bg-transparent text-white font-mono text-sm placeholder-gray-600 focus:outline-none"
                         />
                         <button type="submit" className="text-white hover:text-cyan-400"><Send size={18} /></button>
                      </form>
                   </div>

                   {/* News Feed */}
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-8 mb-4 border-b border-white/10 pb-2">Latest Intelligence</h4>
                   {intelLoading && <div className="text-xs font-mono text-gray-500">FETCHING_DATAFEED...</div>}
                   <div className="space-y-3">
                    {intelData.map((item, i) => (
                        <div key={i} className="block p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                            <a href={item.url} target="_blank" rel="noreferrer" className="font-bold text-gray-200 hover:text-cyan-400 flex items-start justify-between gap-4">
                            <span>{item.title}</span>
                            <ExternalLink size={14} className="shrink-0 text-gray-600 group-hover:text-cyan-400" />
                            </a>
                            <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-500 font-mono uppercase">
                                <span className="w-1 h-1 bg-cyan-500 rounded-full"></span>
                                {item.source}
                            </div>
                        </div>
                    ))}
                   </div>
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