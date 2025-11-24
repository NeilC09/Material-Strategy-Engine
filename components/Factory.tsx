
import React, { useState, useEffect } from 'react';
import { Factory as FactoryIcon, Settings, ArrowLeft, Box, Wind, Layers, Droplet, Cog, Cpu, Thermometer, Search, ShoppingBag, Globe, Loader2, ExternalLink, Activity, Sparkles, FlaskConical, AlertTriangle } from 'lucide-react';
import { ManufacturingProcess, Manufacturer } from '../types';
import { findManufacturers } from '../services/geminiService';
import { SharedContext } from '../App';

interface FactoryProps {
  initialMaterial?: string;
  onNavigate?: (tab: string, data?: SharedContext) => void;
  constraints?: string[]; // New: constraints from the Analyzer
}

const processes: ManufacturingProcess[] = [
  {
    id: 'injection',
    name: 'Injection Molding',
    icon: Box,
    description: 'High-volume production of complex rigid parts.',
    outputs: ['Phone Cases', 'Cutlery', 'Automotive Trim', 'Medical Devices'],
    runLogic: 'Bio-polymers like PHA and PLA are shear-sensitive. Unlike Polypropylene, they degrade rapidly if dwell time is too long.',
  },
  {
    id: 'film',
    name: 'Blown Film',
    icon: Wind,
    description: 'Continuous extrusion of thin, flexible films.',
    outputs: ['Compost Bags', 'Ag Mulch Film', 'Food Packaging', 'Shopping Bags'],
    runLogic: 'Melt strength is the killer here. Bio-materials often lack the elasticity to hold a stable bubble.',
  },
  {
    id: 'thermo',
    name: 'Thermoforming',
    icon: Layers,
    description: 'Heating a sheet and vacuum forming it over a mold.',
    outputs: ['Coffee Lids', 'Clamshells', 'Yogurt Cups', 'Trays'],
    runLogic: 'The processing window is extremely narrow. PLA sags rapidly once it passes its Glass Transition (Tg ~60°C).',
  },
  {
    id: 'foam',
    name: 'Foaming',
    icon: Droplet,
    description: 'Creating lightweight cellular structures using gas injection.',
    outputs: ['Shoe Soles', 'Insulation', 'Protective Packaging', 'Yoga Mats'],
    runLogic: 'Gas containment is difficult. CO2 solubility in bioplastics is high, but it diffuses out too fast, causing foam collapse.',
  },
  {
    id: 'fiber',
    name: 'Fiber Spinning',
    icon: Cog,
    description: 'Extruding filaments for textiles and non-wovens.',
    outputs: ['Apparel', 'Teabags', 'Wipes', 'Carpets'],
    runLogic: 'Moisture is the enemy. Even 50ppm of water will cause hydrolysis in the extruder, breaking the polymer chains.',
  },
  {
    id: '3d',
    name: '3D Printing (FDM)',
    icon: Cpu,
    description: 'Additive manufacturing layer by layer.',
    outputs: ['Prototypes', 'Custom Jigs', 'Medical Scaffolds', 'Spare Parts'],
    runLogic: 'Heat creep is the main failure mode. Bio-filaments soften way before the nozzle, clogging the throat tube.',
  },
  {
    id: 'bio',
    name: 'Bio-Assembly',
    icon: Thermometer,
    description: 'Growing materials using living organisms.',
    outputs: ['Mycelium Packaging', 'Bacterial Leather', 'Bio-Cement', 'Scaffolds'],
    runLogic: 'This is farming, not manufacturing. You are managing life support systems. The risk is contamination.',
  }
];

const Factory: React.FC<FactoryProps> = ({ initialMaterial, onNavigate, constraints = [] }) => {
  const [selectedProcess, setSelectedProcess] = useState<ManufacturingProcess | null>(null);
  const [materialContext, setMaterialContext] = useState(initialMaterial || 'Bio-Material');
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialMaterial) setMaterialContext(initialMaterial);
  }, [initialMaterial]);

  useEffect(() => {
    setManufacturers([]);
    setHasSearched(false);
  }, [selectedProcess]);

  const handleFindManufacturers = async () => {
    if (!selectedProcess) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const results = await findManufacturers(selectedProcess.name, materialContext);
      setManufacturers(results);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      {!selectedProcess ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processes.map((proc) => {
            // Smart Highlighting based on constraints
            const warning = constraints.some(c => 
                (c.toLowerCase().includes('heat') && proc.id === 'injection') ||
                (c.toLowerCase().includes('moisture') && proc.id === 'fiber') ||
                (c.toLowerCase().includes('melt') && proc.id === 'film')
            );

            return (
                <div 
                key={proc.id}
                onClick={() => setSelectedProcess(proc)}
                className={`group bg-white border rounded-xl p-6 cursor-pointer hover:shadow-notion hover:-translate-y-1 transition-all relative overflow-hidden ${warning ? 'border-amber-200 bg-amber-50/30' : 'border-gray-200'}`}
                >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <proc.icon size={64} className="text-gray-900" />
                </div>
                <div className="mb-4 p-2 bg-gray-50 rounded-lg w-fit">
                    <proc.icon size={24} className="text-gray-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{proc.name}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">{proc.description}</p>
                
                {warning && (
                    <div className="mb-4 px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded flex items-center gap-1 w-fit">
                        <AlertTriangle size={10} /> Constraint Detected
                    </div>
                )}

                <div className="flex flex-wrap gap-1.5 mt-auto">
                    {proc.outputs.slice(0, 2).map(out => (
                        <span key={out} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">{out}</span>
                    ))}
                </div>
                </div>
            );
          })}
        </div>
      ) : (
        /* DETAIL VIEW (DASHBOARD) */
        <div className="animate-fade-in">
           <button 
             onClick={() => setSelectedProcess(null)}
             className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm transition-colors"
           >
             <ArrowLeft size={16} /> Return to Floor
           </button>

           {/* Constraint Warning Banner */}
           {constraints.length > 0 && (
               <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                   <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                       <AlertTriangle size={20} />
                   </div>
                   <div>
                       <h4 className="font-bold text-amber-900 text-sm">Processing Constraints Active</h4>
                       <p className="text-amber-800 text-xs mt-1">
                           The validation logic identified risks for this material. Ensure {selectedProcess.name} parameters account for:
                       </p>
                       <div className="flex flex-wrap gap-2 mt-2">
                           {constraints.map((c, i) => (
                               <span key={i} className="px-2 py-1 bg-white/50 border border-amber-200 rounded text-xs text-amber-900 font-medium">
                                   {c}
                               </span>
                           ))}
                       </div>
                   </div>
               </div>
           )}

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Process Info */}
              <div className="space-y-6">
                 <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-900"></div>
                    <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                       <selectedProcess.icon size={40} className="text-gray-900" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProcess.name}</h2>
                    <p className="text-sm text-gray-500">{selectedProcess.description}</p>
                 </div>

                 <div className="bg-indigo-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Activity size={18} /> Process Logic</h3>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                       {selectedProcess.runLogic}
                    </p>
                 </div>
              </div>

              {/* Right Column: Commercial Discovery Engine */}
              <div className="lg:col-span-2 flex flex-col h-full">
                 <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex-1 flex flex-col min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                           <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <ShoppingBag size={20} className="text-indigo-600" /> Market Discovery
                           </h3>
                           <p className="text-sm text-gray-500 mt-1">Find real-world products using {materialContext} via {selectedProcess.name}.</p>
                        </div>
                        <button 
                           onClick={handleFindManufacturers}
                           disabled={loading}
                           className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-sm"
                        >
                           {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                           Find Products & Makers
                        </button>
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6 overflow-y-auto">
                       {!hasSearched && !loading && (
                          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                             <Globe size={48} className="mb-4 text-gray-300" />
                             <h4 className="font-medium text-gray-600">Market Analysis Inactive</h4>
                             <p className="text-sm max-w-sm mt-1">Click "Find Products & Makers" to scan the web for companies currently producing this.</p>
                          </div>
                       )}

                       {loading && (
                          <div className="h-full flex flex-col items-center justify-center text-gray-400">
                             <Loader2 size={48} className="mb-4 text-indigo-500 animate-spin" />
                             <span className="font-medium text-gray-600">Scanning Global Supply Chain...</span>
                          </div>
                       )}

                       {!loading && hasSearched && manufacturers.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                             <span>No specific products found on the open market.</span>
                             <span className="text-xs mt-2 mb-4 block">Try a more common material term.</span>
                          </div>
                       )}

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {manufacturers.map((m, i) => (
                             <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all group relative">
                                <div className="flex justify-between items-start mb-2">
                                   <h4 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">{m.name}</h4>
                                   <a 
                                      href={m.website} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded transition-colors"
                                   >
                                      <ExternalLink size={16} />
                                   </a>
                                </div>
                                <p className="text-sm font-medium text-gray-700 mb-3 bg-gray-50 p-2 rounded border border-gray-100">{m.product}</p>
                                <p className="text-xs text-gray-500 leading-relaxed mb-3">{m.description}</p>
                                <div className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-wider mt-auto">
                                   <Globe size={10} /> {m.location}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Factory;
