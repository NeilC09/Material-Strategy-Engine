import React, { useState, useEffect, useRef } from 'react';
import { Factory as FactoryIcon, Settings, ArrowLeft, Box, Wind, Layers, Droplet, Cog, Cpu, Thermometer, Search, Globe, Loader2, ExternalLink, Activity, Play, Monitor, RotateCcw } from 'lucide-react';
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
    id: 'fiber',
    name: 'Fiber Spinning',
    icon: Cog,
    description: 'Extruding filaments for textiles. Crucial for bio-polyesters.',
    outputs: ['Apparel', 'Non-wovens', 'Medical Sutures'],
    runLogic: 'Fiber necking and drawing profiles are highly dependent on crystallization kinetics.',
    parameters: [
      { name: 'Die Temperature', unit: '°C', standardVal: '260', bioVal: '220', insight: 'Protect molecular weight.' },
      { name: 'Draw Ratio', unit: ':1', standardVal: '4.0', bioVal: '2.8', insight: 'Prevent chain scission.' },
      { name: 'Quench Velocity', unit: 'm/s', standardVal: '0.8', bioVal: '0.4', insight: 'Manage cooling rate.' }
    ]
  },
  {
    id: 'thermo',
    name: 'Thermoforming',
    icon: Layers,
    description: 'Vacuum forming sheets into rigid shapes like cups and lids.',
    outputs: ['Coffee Lids', 'Food Trays', 'Clamshells'],
    runLogic: 'Biological sheets have narrow thermoforming windows compared to fossil plastics.',
    parameters: [
      { name: 'Sheet Temp', unit: '°C', standardVal: '160', bioVal: '105', insight: 'Prevent premature sag.' },
      { name: 'Vacuum Speed', unit: 's', standardVal: '0.5', bioVal: '1.2', insight: 'Gentle forming prevent tears.' },
      { name: 'Plug Force', unit: 'kN', standardVal: '5', bioVal: '3', insight: 'Control thinning.' }
    ]
  },
  {
    id: 'injection',
    name: 'Injection Molding',
    icon: Box,
    description: 'Mass production of rigid components.',
    outputs: ['Phone Cases', 'Cutlery', 'Automotive'],
    runLogic: 'Shear-sensitive materials require modified gate geometry.',
    parameters: [
      { name: 'Inj Velocity', unit: 'mm/s', standardVal: '60', bioVal: '35', insight: 'Reduce shear heat.' },
      { name: 'Pack Pressure', unit: 'bar', standardVal: '800', bioVal: '600', insight: 'Compensate shrinkage.' },
      { name: 'Cooling', unit: 's', standardVal: '10', bioVal: '20', insight: 'Ensures part rigidity.' }
    ]
  },
  {
    id: '3d',
    name: '3D Printing (FDM)',
    icon: Cpu,
    description: 'Additive manufacturing via layer deposition.',
    outputs: ['Prototyping', 'Jigs', 'Custom Labware'],
    runLogic: 'Thermal stability and bed adhesion are primary failure modes for bioplastics.',
    parameters: [
      { name: 'Nozzle Temp', unit: '°C', standardVal: '210', bioVal: '190', insight: 'Prevent oozing.' },
      { name: 'Print Speed', unit: 'mm/s', standardVal: '50', bioVal: '35', insight: 'Layer bond strength.' },
      { name: 'Retraction', unit: 'mm', standardVal: '6', bioVal: '3', insight: 'Avoid filament grinding.' }
    ]
  }
];

const Factory: React.FC<FactoryProps> = ({ initialMaterial, constraints = [] }) => {
  const [selectedProcess, setSelectedProcess] = useState<ManufacturingProcess | null>(null);
  const [materialContext, setMaterialContext] = useState(initialMaterial || 'Bio-Material');
  const [activeTab, setActiveTab] = useState<'simulate' | 'market'>('simulate');
  const [userParams, setUserParams] = useState<Record<string, number>>({});
  const [vizData, setVizData] = useState<VisualizationData | null>(null);
  const [vizLoading, setVizLoading] = useState(false);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [mfgLoading, setMfgLoading] = useState(false);
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMaterial) setMaterialContext(initialMaterial);
  }, [initialMaterial]);

  useEffect(() => {
    if (selectedProcess) {
      const initial: Record<string, number> = {};
      selectedProcess.parameters?.forEach(p => initial[p.name] = parseFloat(p.bioVal));
      setUserParams(initial);
      setVizData(null);
    }
  }, [selectedProcess]);

  useEffect(() => {
    if (vizData && plotRef.current && window.Plotly) {
      const layout = {
        ...vizData.layout,
        autosize: true,
        margin: { l: 0, r: 0, b: 0, t: 0 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        scene: {
          ...vizData.layout.scene,
          xaxis: { showgrid: true, gridcolor: '#222' },
          yaxis: { showgrid: true, gridcolor: '#222' },
          zaxis: { showgrid: true, gridcolor: '#222' }
        }
      };
      window.Plotly.newPlot(plotRef.current, vizData.data, layout, { responsive: true, displayModeBar: false });
    }
  }, [vizData]);

  const runSimulation = async () => {
    if (!selectedProcess) return;
    setVizLoading(true);
    const data = await generateMachineSimulation(selectedProcess.name, userParams);
    setVizData(data);
    setVizLoading(false);
  };

  const findMarketPartners = async () => {
    if (!selectedProcess) return;
    setMfgLoading(true);
    const results = await findManufacturers(selectedProcess.name, materialContext);
    setManufacturers(results);
    setMfgLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-20">
      {!selectedProcess ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processes.map(proc => (
            <div 
              key={proc.id} 
              onClick={() => setSelectedProcess(proc)}
              className="group bg-obsidian-800 border border-white/10 p-8 cursor-pointer hover:border-cyan-500/50 hover:bg-white/5 transition-all"
            >
              <proc.icon size={32} className="text-cyan-400 mb-6" />
              <h3 className="font-mono font-bold text-white uppercase tracking-wider mb-2">{proc.name}</h3>
              <p className="text-xs text-gray-400 font-mono leading-relaxed line-clamp-2">{proc.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-140px)]">
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-6">
              <button onClick={() => setSelectedProcess(null)} className="text-gray-500 hover:text-white"><ArrowLeft size={24} /></button>
              <h2 className="text-2xl font-bold font-mono uppercase text-white">
                {selectedProcess.name} <span className="text-white/20">/</span> <span className="text-cyan-400">{materialContext}</span>
              </h2>
            </div>
            <div className="flex bg-black/20 p-1 border border-white/10 rounded">
              <button onClick={() => setActiveTab('simulate')} className={`px-4 py-2 text-[10px] font-bold uppercase font-mono ${activeTab === 'simulate' ? 'bg-cyan-500 text-black' : 'text-gray-500'}`}>Physics Sim</button>
              <button onClick={() => setActiveTab('market')} className={`px-4 py-2 text-[10px] font-bold uppercase font-mono ${activeTab === 'market' ? 'bg-cyan-500 text-black' : 'text-gray-500'}`}>Supply Chain</button>
            </div>
          </div>

          {activeTab === 'simulate' ? (
            <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
              <div className="col-span-4 bg-obsidian-800 border border-white/10 p-6 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xs font-bold font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2"><Settings size={14}/> Parameters</h3>
                  <button onClick={() => setVizData(null)} className="text-[10px] text-cyan-500 font-bold uppercase">Reset</button>
                </div>
                <div className="space-y-8 flex-1">
                  {selectedProcess.parameters?.map((p, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-mono mb-2">
                        <span className="text-gray-400 uppercase">{p.name}</span>
                        <span className="text-cyan-400">{userParams[p.name]?.toFixed(1)} {p.unit}</span>
                      </div>
                      <input 
                        type="range" min={parseFloat(p.bioVal) * 0.5} max={parseFloat(p.bioVal) * 1.5} step={1}
                        value={userParams[p.name] || 0}
                        onChange={e => setUserParams(prev => ({...prev, [p.name]: parseFloat(e.target.value)}))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-cyan-500"
                      />
                      <p className="text-[9px] text-gray-600 mt-2 font-mono uppercase italic">{p.insight}</p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={runSimulation} disabled={vizLoading}
                  className="w-full py-4 bg-cyan-500 text-black font-bold font-mono text-xs uppercase tracking-widest mt-8 shadow-neon flex items-center justify-center gap-2"
                >
                  {vizLoading ? <Loader2 className="animate-spin" size={16}/> : <Play size={16}/>}
                  Execute Render
                </button>
              </div>

              <div className="col-span-8 bg-black/40 border border-white/10 relative flex flex-col">
                {vizLoading && (
                  <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 className="animate-spin text-cyan-500 mb-4" size={48}/>
                    <span className="font-mono text-xs uppercase text-cyan-400 animate-pulse">Computing Molecular Geometry...</span>
                  </div>
                )}
                <div ref={plotRef} className="w-full h-full" />
                {vizData?.explanation && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-white/10 p-4 backdrop-blur-md">
                    <span className="text-[10px] font-mono text-cyan-500 uppercase font-bold block mb-1">Observation</span>
                    <p className="text-xs text-gray-300 font-mono leading-relaxed">{vizData.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-obsidian-800 border border-white/10 p-8 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xs font-bold font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2"><Globe size={14}/> Verified Partners</h3>
                <button onClick={findMarketPartners} className="px-6 py-2 bg-cyan-500 text-black font-bold font-mono text-xs uppercase shadow-neon flex items-center gap-2">
                  {mfgLoading ? <Loader2 className="animate-spin" size={14}/> : <Search size={14}/>} Partner Scan
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {manufacturers.map((m, i) => (
                  <div key={i} className="p-6 bg-black/20 border border-white/5 flex justify-between items-start group hover:border-cyan-500/30 transition-all">
                    <div className="max-w-2xl">
                      <h4 className="font-mono font-bold text-white uppercase text-lg group-hover:text-cyan-400 transition-colors">{m.name}</h4>
                      <p className="text-xs text-cyan-600 font-mono mb-3 uppercase tracking-wider">{m.product} • {m.location}</p>
                      <p className="text-sm text-gray-400 font-mono leading-relaxed">{m.description}</p>
                    </div>
                    <a href={m.website} target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white"><ExternalLink size={16}/></a>
                  </div>
                ))}
                {manufacturers.length === 0 && !mfgLoading && (
                  <div className="h-full flex flex-col items-center justify-center opacity-20"><Monitor size={64}/><span className="text-xs font-mono uppercase mt-4">Awaiting Signal</span></div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Factory;