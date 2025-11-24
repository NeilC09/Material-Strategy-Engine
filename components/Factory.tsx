
import React, { useState, useEffect, useRef } from 'react';
import { Factory as FactoryIcon, Settings, ArrowLeft, Box, Wind, Layers, Droplet, Cog, Cpu, Thermometer, Search, ShoppingBag, Globe, Loader2, ExternalLink, Activity, Play, Pause, CheckCircle2, XCircle, Zap, RotateCcw, Monitor } from 'lucide-react';
import { ManufacturingProcess, Manufacturer, SharedContext, VisualizationData } from '../types';
import { findManufacturers, generateMachineSimulation } from '../services/geminiService';

declare global {
  interface Window {
    Plotly: any;
  }
}

interface FactoryProps {
  initialMaterial?: string;
  onNavigate?: (tab: string, data?: SharedContext) => void;
  constraints?: string[];
}

const processes: ManufacturingProcess[] = [
  {
    id: 'injection',
    name: 'Injection Molding',
    icon: Box,
    description: 'High-volume production of complex rigid parts.',
    outputs: ['Phone Cases', 'Cutlery', 'Automotive Trim', 'Medical Devices'],
    runLogic: 'Bio-polymers like PHA and PLA are shear-sensitive. Unlike Polypropylene, they degrade rapidly if dwell time is too long.',
    parameters: [
      { name: 'Melt Temp', unit: '°C', standardVal: '230', bioVal: '190', insight: 'Lower temp prevents thermal degradation.' },
      { name: 'Injection Pressure', unit: 'bar', standardVal: '1200', bioVal: '1000', insight: 'Lower pressure to reduce shear stress.' },
      { name: 'Cooling Time', unit: 's', standardVal: '15', bioVal: '25', insight: 'Longer cooling needed for crystallization.' }
    ]
  },
  {
    id: 'film',
    name: 'Blown Film',
    icon: Wind,
    description: 'Continuous extrusion of thin, flexible films.',
    outputs: ['Compost Bags', 'Ag Mulch Film', 'Food Packaging', 'Shopping Bags'],
    runLogic: 'Melt strength is the killer here. Bio-materials often lack the elasticity to hold a stable bubble.',
    parameters: [
      { name: 'Die Temp', unit: '°C', standardVal: '190', bioVal: '160', insight: 'Prevent melt fracture at exit.' },
      { name: 'Blow-Up Ratio', unit: ':1', standardVal: '3.0', bioVal: '2.0', insight: 'Reduced stretching to prevent tears.' },
      { name: 'Haul-Off Speed', unit: 'm/min', standardVal: '50', bioVal: '35', insight: 'Slower speed for cooling stability.' }
    ]
  },
  {
    id: 'thermo',
    name: 'Thermoforming',
    icon: Layers,
    description: 'Heating a sheet and vacuum forming it over a mold.',
    outputs: ['Coffee Lids', 'Clamshells', 'Yogurt Cups', 'Trays'],
    runLogic: 'The processing window is extremely narrow. PLA sags rapidly once it passes its Glass Transition (Tg ~60°C).',
    parameters: [
      { name: 'Sheet Temp', unit: '°C', standardVal: '150', bioVal: '100', insight: 'Prevent sheet sagging.' },
      { name: 'Vacuum Pressure', unit: 'mmHg', standardVal: '600', bioVal: '500', insight: 'Gentle forming force.' },
      { name: 'Mold Temp', unit: '°C', standardVal: '25', bioVal: '40', insight: 'Warm mold prevents warping.' }
    ]
  },
  {
    id: 'foam',
    name: 'Foaming',
    icon: Droplet,
    description: 'Creating lightweight cellular structures using gas injection.',
    outputs: ['Shoe Soles', 'Insulation', 'Protective Packaging', 'Yoga Mats'],
    runLogic: 'Gas containment is difficult. CO2 solubility in bioplastics is high, but it diffuses out too fast, causing foam collapse.',
    parameters: [
      { name: 'Gas Dosage', unit: '%', standardVal: '5.0', bioVal: '2.5', insight: 'Lower gas to prevent cell rupture.' },
      { name: 'Expansion Ratio', unit: 'x', standardVal: '10', bioVal: '5', insight: 'Denser foam structure.' },
      { name: 'Melt Pressure', unit: 'bar', standardVal: '150', bioVal: '180', insight: 'Keep gas dissolved in melt.' }
    ]
  },
  {
    id: 'fiber',
    name: 'Fiber Spinning',
    icon: Cog,
    description: 'Extruding filaments for textiles and non-wovens.',
    outputs: ['Apparel', 'Teabags', 'Wipes', 'Carpets'],
    runLogic: 'Moisture is the enemy. Even 50ppm of water will cause hydrolysis in the extruder, breaking the polymer chains.',
    parameters: [
      { name: 'Extruder Temp', unit: '°C', standardVal: '260', bioVal: '220', insight: 'Avoid hydrolytic degradation.' },
      { name: 'Draw Ratio', unit: ':1', standardVal: '4.0', bioVal: '2.5', insight: 'Gentle stretching.' },
      { name: 'Quench Air', unit: 'm/s', standardVal: '0.8', bioVal: '0.5', insight: 'Low turbulence cooling.' }
    ]
  },
  {
    id: '3d',
    name: '3D Printing (FDM)',
    icon: Cpu,
    description: 'Additive manufacturing layer by layer.',
    outputs: ['Prototypes', 'Custom Jigs', 'Medical Scaffolds', 'Spare Parts'],
    runLogic: 'Heat creep is the main failure mode. Bio-filaments soften way before the nozzle, clogging the throat tube.',
    parameters: [
      { name: 'Nozzle Temp', unit: '°C', standardVal: '210', bioVal: '195', insight: 'Prevent stringing.' },
      { name: 'Bed Temp', unit: '°C', standardVal: '60', bioVal: '45', insight: 'Adhesion without warping.' },
      { name: 'Print Speed', unit: 'mm/s', standardVal: '60', bioVal: '40', insight: 'Accuracy over speed.' }
    ]
  },
  {
    id: 'bio',
    name: 'Bio-Assembly',
    icon: Thermometer,
    description: 'Growing materials using living organisms.',
    outputs: ['Mycelium Packaging', 'Bacterial Leather', 'Bio-Cement', 'Scaffolds'],
    runLogic: 'This is farming, not manufacturing. You are managing life support systems. The risk is contamination.',
    parameters: [
      { name: 'Incubation Temp', unit: '°C', standardVal: 'N/A', bioVal: '25', insight: 'Optimal fungal growth.' },
      { name: 'Humidity', unit: '%', standardVal: 'N/A', bioVal: '90', insight: 'Prevent drying out.' },
      { name: 'CO2 Level', unit: 'ppm', standardVal: '400', bioVal: '2000', insight: 'Stimulate vertical growth.' }
    ]
  }
];

const parseRange = (valStr: string): number => {
    if (!valStr) return 0;
    const parts = valStr.split('-').map(s => parseFloat(s.trim()));
    if (parts.length === 2) return (parts[0] + parts[1]) / 2;
    return parts[0];
};

const Factory: React.FC<FactoryProps> = ({ initialMaterial, onNavigate, constraints = [] }) => {
  const [selectedProcess, setSelectedProcess] = useState<ManufacturingProcess | null>(null);
  const [materialContext, setMaterialContext] = useState(initialMaterial || 'Bio-Material');
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulate' | 'market'>('simulate');
  
  const [userParams, setUserParams] = useState<Record<string, number>>({});
  
  // 3D Visualization State
  const [vizData, setVizData] = useState<VisualizationData | null>(null);
  const [vizLoading, setVizLoading] = useState(false);
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMaterial) setMaterialContext(initialMaterial);
  }, [initialMaterial]);

  useEffect(() => {
    setManufacturers([]);
    setHasSearched(false);
    setVizData(null); // Reset viz on new process
    if (selectedProcess && selectedProcess.parameters) {
        const initialParams: Record<string, number> = {};
        selectedProcess.parameters.forEach(p => {
            initialParams[p.name] = parseRange(p.bioVal);
        });
        setUserParams(initialParams);
    }
  }, [selectedProcess]);

  // Handle 3D Plot Rendering
  useEffect(() => {
      if (vizData && plotRef.current && window.Plotly) {
          const config = { responsive: true, displayModeBar: false };
          const layout = {
              ...vizData.layout,
              autosize: true,
              margin: { l: 0, r: 0, b: 0, t: 0 },
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              scene: {
                  ...vizData.layout.scene,
                  xaxis: { ...vizData.layout.scene?.xaxis, showgrid: true, gridcolor: '#333' },
                  yaxis: { ...vizData.layout.scene?.yaxis, showgrid: true, gridcolor: '#333' },
                  zaxis: { ...vizData.layout.scene?.zaxis, showgrid: true, gridcolor: '#333' },
              }
          };
          
          window.Plotly.newPlot(plotRef.current, vizData.data, layout, config);
      }
  }, [vizData]);

  const handleRunSimulation = async () => {
      if (!selectedProcess) return;
      setVizLoading(true);
      try {
          const data = await generateMachineSimulation(selectedProcess.name, userParams);
          setVizData(data);
      } catch (error) {
          console.error("Simulation failed", error);
      }
      setVizLoading(false);
  };

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

  const resetParams = () => {
    if (selectedProcess && selectedProcess.parameters) {
        const initialParams: Record<string, number> = {};
        selectedProcess.parameters.forEach(p => {
            initialParams[p.name] = parseRange(p.bioVal);
        });
        setUserParams(initialParams);
        setVizData(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20">
      {!selectedProcess ? (
        /* PROCESS SELECTION GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processes.map((proc) => {
            return (
                <div 
                key={proc.id}
                onClick={() => setSelectedProcess(proc)}
                className={`group bg-obsidian-800 border border-white/10 p-8 cursor-pointer hover:border-cyan-500/50 hover:shadow-glow hover:bg-white/5 transition-all relative overflow-hidden`}
                >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <proc.icon size={64} className="text-white" />
                </div>
                <div className="mb-6 p-3 bg-white/5 border border-white/10 w-fit">
                    <proc.icon size={24} className="text-white group-hover:text-cyan-400" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2 font-mono uppercase tracking-wide group-hover:text-cyan-400 transition-colors">{proc.name}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6 line-clamp-3 font-mono">{proc.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-auto">
                    {proc.outputs.slice(0, 2).map(out => (
                        <span key={out} className="text-[10px] bg-white/5 border border-white/10 text-gray-400 px-2 py-1 font-mono uppercase">{out}</span>
                    ))}
                </div>
                </div>
            );
          })}
        </div>
      ) : (
        /* INTERACTIVE WORKBENCH */
        <div className="animate-fade-in h-[calc(100vh-140px)] flex flex-col">
           {/* Header Bar */}
           <div className="flex items-center justify-between mb-6 shrink-0 border-b border-white/10 pb-6">
             <div className="flex items-center gap-6">
                <button 
                    onClick={() => setSelectedProcess(null)}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-4 font-mono uppercase tracking-tight">
                        {selectedProcess.name} <span className="text-white/20">/</span> <span className="text-cyan-400">{materialContext}</span>
                    </h2>
                </div>
             </div>
             
             <div className="flex gap-4">
                 <button 
                    onClick={() => setActiveTab('simulate')}
                    className={`px-6 py-2 text-xs font-bold font-mono uppercase tracking-wider border transition-all ${activeTab === 'simulate' ? 'bg-cyan-500 text-black border-cyan-500 shadow-neon' : 'text-gray-500 border-transparent hover:text-white'}`}
                 >
                    3D Simulation
                 </button>
                 <button 
                    onClick={() => setActiveTab('market')}
                    className={`px-6 py-2 text-xs font-bold font-mono uppercase tracking-wider border transition-all ${activeTab === 'market' ? 'bg-cyan-500 text-black border-cyan-500 shadow-neon' : 'text-gray-500 border-transparent hover:text-white'}`}
                 >
                    Supply Chain
                 </button>
             </div>
           </div>

           {activeTab === 'simulate' ? (
               <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
                  
                  {/* LEFT: Controls */}
                  <div className="lg:col-span-4 bg-obsidian-800 border border-white/10 flex flex-col overflow-hidden">
                      <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/20">
                          <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest flex items-center gap-2 font-mono">
                              <Settings size={14} /> Physics Engine
                          </h3>
                          <button onClick={resetParams} className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest hover:text-cyan-400 flex items-center gap-1 font-mono">
                              <RotateCcw size={10} /> Reset
                          </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-6 space-y-8">
                          {selectedProcess.parameters?.map((param, i) => {
                              const target = parseRange(param.bioVal);
                              const current = userParams[param.name] || target;
                              const min = target * 0.5;
                              const max = target * 1.5;

                              return (
                                  <div key={i}>
                                      <div className="flex justify-between mb-3">
                                          <label className="text-xs font-bold text-gray-300 font-mono uppercase">{param.name}</label>
                                          <span className="font-mono font-bold text-cyan-400 text-xs">
                                              {current.toFixed(0)} {param.unit}
                                          </span>
                                      </div>
                                      <div className="relative h-2 flex items-center">
                                          <input 
                                              type="range"
                                              min={min}
                                              max={max}
                                              step={(max-min)/100}
                                              value={current}
                                              onChange={(e) => setUserParams(prev => ({...prev, [param.name]: parseFloat(e.target.value)}))}
                                              className="absolute z-20 w-full h-2 bg-white/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                                          />
                                          <div className="absolute h-4 w-0.5 bg-cyan-500 z-10 top-[-4px]" 
                                               style={{ left: `${((target - min) / (max - min)) * 100}%` }}
                                          />
                                      </div>
                                  </div>
                              );
                          })}

                          <button 
                            onClick={handleRunSimulation}
                            disabled={vizLoading}
                            className="w-full py-4 bg-cyan-500 text-black font-bold text-xs uppercase tracking-widest hover:bg-cyan-400 transition-colors shadow-neon flex items-center justify-center gap-2 font-mono"
                          >
                             {vizLoading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                             GENERATE 3D MODEL
                          </button>
                      </div>
                  </div>

                  {/* RIGHT: 3D Visualization Viewport */}
                  <div className="lg:col-span-8 bg-black/40 border border-white/10 relative flex flex-col overflow-hidden">
                      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 bg-black/60 border border-white/10 rounded-full">
                         <div className="w-2 h-2 bg-red-500 animate-pulse rounded-full"></div>
                         <span className="text-[10px] text-gray-300 font-mono uppercase tracking-widest">Live Render</span>
                      </div>

                      {vizLoading && (
                          <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                              <Loader2 className="animate-spin text-cyan-500 mb-4" size={48} />
                              <div className="text-cyan-400 font-mono text-sm uppercase tracking-widest font-bold">Computing Geometry...</div>
                              <div className="text-gray-500 text-xs mt-2 font-mono">SOLVING PHYSICS EQUATIONS</div>
                          </div>
                      )}

                      {!vizData && !vizLoading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                             <Monitor size={48} className="mb-4 opacity-20" />
                             <p className="font-mono text-xs uppercase tracking-widest">Awaiting Simulation Data</p>
                             <p className="text-[10px] mt-2">Configure parameters and click "Generate 3D Model"</p>
                          </div>
                      )}

                      <div ref={plotRef} className="w-full h-full" />
                      
                      {vizData?.explanation && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-white/10 p-4 backdrop-blur-md">
                              <div className="text-cyan-400 text-xs font-bold uppercase mb-1 font-mono">Engineering Insight</div>
                              <p className="text-gray-300 text-sm font-mono leading-relaxed">{vizData.explanation}</p>
                          </div>
                      )}
                  </div>
               </div>
           ) : (
               /* MARKET TAB (Unchanged) */
               <div className="flex-1 bg-obsidian-800 border border-white/10 p-8 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                           <Globe size={16} /> Global Supply Chain
                        </h3>
                        <button 
                           onClick={handleFindManufacturers}
                           disabled={loading}
                           className="bg-cyan-500 text-black px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-cyan-400 transition-colors font-mono shadow-neon"
                        >
                           {loading ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
                           SCAN_PARTNERS
                        </button>
                    </div>

                    <div className="flex-1 bg-black/20 border border-white/5 p-6 overflow-y-auto">
                       {!hasSearched && !loading && (
                          <div className="h-full flex flex-col items-center justify-center text-gray-600 font-mono text-xs">
                             AWAITING_QUERY_INPUT...
                          </div>
                       )}

                       {loading && (
                          <div className="h-full flex flex-col items-center justify-center text-gray-500 font-mono text-xs">
                             <Loader2 size={32} className="mb-4 text-cyan-400 animate-spin" />
                             SCANNING_DATABASE...
                          </div>
                       )}

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {manufacturers.map((m, i) => (
                             <div key={i} className="bg-obsidian-900 border border-white/10 p-6 hover:border-cyan-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                   <h4 className="font-bold text-white text-lg group-hover:text-cyan-400 transition-colors font-mono uppercase">{m.name}</h4>
                                   <a href={m.website} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-white"><ExternalLink size={14} /></a>
                                </div>
                                <p className="text-xs font-bold text-gray-500 mb-4 font-mono uppercase">{m.product}</p>
                                <p className="text-sm text-gray-400 leading-relaxed mb-4 font-mono">{m.description}</p>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                   <Globe size={10} /> {m.location}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
               </div>
           )}
        </div>
      )}
    </div>
  );
};

export default Factory;
