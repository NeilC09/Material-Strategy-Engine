
import React, { useState } from 'react';
import { Map, AlertTriangle, Droplet, Thermometer, Wind, ShieldAlert, Factory, Sprout } from 'lucide-react';

interface SupplyNode {
  id: string;
  name: string;
  regionName: string;
  coordinates: { x: number; y: number }; // % positions
  risks: { type: string; severity: 'Low' | 'Medium' | 'High'; description: string; icon: any }[];
  color: string;
}

const materials: SupplyNode[] = [
  {
    id: 'rubber',
    name: 'Natural Rubber',
    regionName: 'Southeast Asia (Thailand/Indonesia)',
    coordinates: { x: 76, y: 58 },
    color: 'bg-emerald-500',
    risks: [
      { type: 'Monsoons', severity: 'High', description: 'Increasing flood severity disrupts tapping seasons and logistics.', icon: Droplet },
      { type: 'Leaf Blight', severity: 'Medium', description: 'Fungal spread accelerated by humid warming trends.', icon: Sprout }
    ]
  },
  {
    id: 'corn',
    name: 'Corn (PLA Feedstock)',
    regionName: 'US Midwest (Iowa/Nebraska)',
    coordinates: { x: 22, y: 35 },
    color: 'bg-yellow-500',
    risks: [
      { type: 'Droughts', severity: 'High', description: 'Aquifer depletion and heat waves reduce yield stability.', icon: Thermometer },
      { type: 'Soil Degradation', severity: 'Medium', description: 'Intensive monoculture impacting topsoil health.', icon: Wind }
    ]
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (Bio-PE)',
    regionName: 'Brazil (São Paulo State)',
    coordinates: { x: 32, y: 70 },
    color: 'bg-lime-500',
    risks: [
      { type: 'Deforestation Pressure', severity: 'Medium', description: 'Expansion competes with ecologically sensitive zones.', icon: ShieldAlert },
      { type: 'Water Usage', severity: 'High', description: 'High irrigation demands in increasingly dry seasons.', icon: Droplet }
    ]
  },
  {
    id: 'cobalt',
    name: 'Cobalt (Catalysts)',
    regionName: 'DR Congo',
    coordinates: { x: 54, y: 62 },
    color: 'bg-blue-500',
    risks: [
      { type: 'Geopolitical', severity: 'High', description: 'Ethical sourcing concerns and supply instability.', icon: ShieldAlert },
      { type: 'Infrastructure', severity: 'High', description: 'Transport bottlenecks affecting export timelines.', icon: Factory }
    ]
  },
  {
    id: 'wood',
    name: 'Cellulose/Pulp',
    regionName: 'Scandinavia / Canada',
    coordinates: { x: 55, y: 20 },
    color: 'bg-amber-700',
    risks: [
      { type: 'Wildfires', severity: 'High', description: 'Increasing frequency of mega-fires threatens harvestable timber.', icon: Thermometer },
      { type: 'Biodiversity Regs', severity: 'Medium', description: 'Stricter EU regulations on forest management.', icon: ShieldAlert }
    ]
  }
];

const SupplyChain: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<SupplyNode | null>(null);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3 text-gray-500">
          <Map size={24} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Global Supply Risk Heatmap</h2>
            <p className="text-sm">Real-time sourcing vulnerability assessment based on climate & geopolitical data.</p>
          </div>
        </div>
        
        {selectedNode && (
           <div className="px-4 py-2 bg-red-50 border border-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-2 animate-fade-in">
              <AlertTriangle size={14} /> Risk Analysis Active: {selectedNode.name}
           </div>
        )}
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative flex flex-col md:flex-row">
        
        {/* Left Sidebar: Material Selection */}
        <div className="w-full md:w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Key Commodities</h3>
           <div className="space-y-2">
              {materials.map(m => (
                 <button
                   key={m.id}
                   onClick={() => setSelectedNode(m)}
                   className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between group ${
                     selectedNode?.id === m.id 
                       ? 'bg-white shadow-sm text-gray-900 ring-1 ring-gray-200' 
                       : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                   }`}
                 >
                   {m.name}
                   <div className={`w-2 h-2 rounded-full ${m.color} ${selectedNode?.id === m.id ? 'animate-pulse' : 'opacity-50'}`}></div>
                 </button>
              ))}
           </div>

           <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-blue-900 font-bold text-xs mb-2">Why this matters?</h4>
              <p className="text-blue-800 text-xs leading-relaxed">
                 Sustainable materials rely on biology. Unlike oil, biology is subject to climate volatility (droughts, floods, fires). 
                 Understanding these risks is crucial for robust supply chains.
              </p>
           </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 relative bg-slate-50 overflow-hidden">
           {/* SVG Map Background */}
           <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              {/* Simplified World Map SVG Path */}
              <svg viewBox="0 0 1000 500" className="w-full h-full fill-gray-400">
                 {/* North America */}
                 <path d="M 50,100 L 300,50 L 350,150 L 250,250 L 100,200 Z" />
                 {/* South America */}
                 <path d="M 280,260 L 380,260 L 350,450 L 280,400 Z" />
                 {/* Europe */}
                 <path d="M 450,80 L 580,50 L 550,150 L 480,150 Z" />
                 {/* Africa */}
                 <path d="M 450,160 L 600,160 L 580,350 L 480,300 Z" />
                 {/* Asia */}
                 <path d="M 600,50 L 900,50 L 950,200 L 800,300 L 620,200 Z" />
                 {/* Australia */}
                 <path d="M 800,350 L 950,350 L 920,450 L 820,450 Z" />
              </svg>
           </div>
           
           {/* Dotted Grid Overlay */}
           <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>

           {/* Nodes */}
           {materials.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedNode(m)}
                style={{ left: `${m.coordinates.x}%`, top: `${m.coordinates.y}%` }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group z-10`}
              >
                 {/* Ripple Effect */}
                 {selectedNode?.id === m.id && (
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping ${m.color.replace('bg-', 'bg-')}`}></span>
                 )}
                 
                 {/* The Dot */}
                 <div className={`w-4 h-4 rounded-full shadow-lg border-2 border-white ${m.color} ${selectedNode?.id === m.id ? 'scale-150' : 'scale-100 group-hover:scale-125'}`}></div>
                 
                 {/* Label (Visible on Hover or Select) */}
                 <div className={`absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow-md text-xs font-bold text-gray-800 transition-opacity pointer-events-none ${selectedNode?.id === m.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {m.regionName.split('(')[0]}
                 </div>
              </button>
           ))}

           {/* Risk Detail Overlay */}
           {selectedNode && (
              <div className="absolute bottom-6 right-6 w-80 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-notion p-6 animate-fade-in z-20">
                 <div className="flex items-start justify-between mb-4">
                    <div>
                       <h3 className="font-bold text-gray-900">{selectedNode.name}</h3>
                       <p className="text-xs text-gray-500 font-mono uppercase">{selectedNode.regionName}</p>
                    </div>
                    <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-600">×</button>
                 </div>

                 <div className="space-y-3">
                    {selectedNode.risks.map((risk, i) => (
                       <div key={i} className="flex gap-3 items-start p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                          <div className={`p-2 rounded-md shrink-0 ${risk.severity === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                             <risk.icon size={16} />
                          </div>
                          <div>
                             <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-gray-800">{risk.type}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${risk.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                   {risk.severity.toUpperCase()}
                                </span>
                             </div>
                             <p className="text-xs text-gray-500 leading-tight">
                                {risk.description}
                             </p>
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
                    <span>Risk Source: Climate Data API</span>
                    <span>Updated: Q3 2024</span>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SupplyChain;
