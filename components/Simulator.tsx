
import React, { useState, useEffect } from 'react';
import { Factory as FactoryIcon, Settings, ArrowLeft, Box, Wind, Layers, Droplet, Cog, Cpu, Thermometer, Activity, Zap, Clock, Gauge, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { ManufacturingProcess } from '../types';

interface FactoryProps {
  initialMaterial?: string;
}

const processes: ManufacturingProcess[] = [
  {
    id: 'injection',
    name: 'Injection Molding',
    icon: Box,
    description: 'High-volume production of complex rigid parts.',
    outputs: ['Phone Cases', 'Cutlery', 'Automotive Trim', 'Medical Devices'],
    runLogic: 'Bio-polymers like PHA and PLA are shear-sensitive. Unlike Polypropylene, they degrade rapidly if dwell time is too long. You must lower the barrel temperature profile and increase back pressure slightly to ensure melt homogeneity without burning.',
    parameters: [
      { name: 'Melt Temp', unit: '°C', standardVal: '230 - 250', bioVal: '180 - 200', insight: 'Lower temp prevents thermal degradation.' },
      { name: 'Mold Temp', unit: '°C', standardVal: '20 - 40', bioVal: '40 - 60', insight: 'Warm mold promotes crystallization in PHA.' },
      { name: 'Back Pressure', unit: 'bar', standardVal: '50', bioVal: '70', insight: 'Ensures mixing without high shear.' }
    ]
  },
  {
    id: 'film',
    name: 'Blown Film',
    icon: Wind,
    description: 'Continuous extrusion of thin, flexible films.',
    outputs: ['Compost Bags', 'Ag Mulch Film', 'Food Packaging', 'Shopping Bags'],
    runLogic: 'Melt strength is the killer here. Bio-materials often lack the elasticity to hold a stable bubble. You must run the line slower and use "Dual-Lip" air rings to freeze the bubble immediately upon exit. Expect lower draw-down ratios.',
    parameters: [
      { name: 'Die Gap', unit: 'mm', standardVal: '0.8', bioVal: '1.2', insight: 'Wider gap reduces shear heat at exit.' },
      { name: 'Blow-Up Ratio', unit: 'ratio', standardVal: '1:3', bioVal: '1:2', insight: 'Lower ratio prevents bubble collapse.' },
      { name: 'Frost Line', unit: 'height', standardVal: 'High', bioVal: 'Low', insight: 'Lock in geometry immediately.' }
    ]
  },
  {
    id: 'thermo',
    name: 'Thermoforming',
    icon: Layers,
    description: 'Heating a sheet and vacuum forming it over a mold.',
    outputs: ['Coffee Lids', 'Clamshells', 'Yogurt Cups', 'Trays'],
    runLogic: 'The processing window is extremely narrow. PLA sags rapidly once it passes its Glass Transition (Tg ~60°C). You cannot rely on standard heating banks; you need "Sag Bands" or precise zoning to keep the sheet tensioned before forming.',
    parameters: [
      { name: 'Sheet Temp', unit: '°C', standardVal: '150', bioVal: '90 - 110', insight: 'Prevent sheet sagging and tearing.' },
      { name: 'Cycle Time', unit: 'sec', standardVal: '3.0', bioVal: '5.0', insight: 'Bio-materials set slower in the mold.' },
      { name: 'Plug Material', unit: 'type', standardVal: 'Nylon', bioVal: 'Syntactic Foam', insight: 'Prevents chilling the sheet too fast.' }
    ]
  },
  {
    id: 'foam',
    name: 'Foaming',
    icon: Droplet,
    description: 'Creating lightweight cellular structures using gas injection.',
    outputs: ['Shoe Soles', 'Insulation', 'Protective Packaging', 'Yoga Mats'],
    runLogic: 'Gas containment is difficult. CO2 solubility in bioplastics is high, but it diffuses out too fast, causing foam collapse. You need a high crystallization rate to "freeze" the cell walls before the gas escapes.',
    parameters: [
      { name: 'Gas Load', unit: '%', standardVal: '5.0', bioVal: '2.5', insight: 'Lower gas to prevent cell rupture.' },
      { name: 'Melt Strength', unit: 'cN', standardVal: 'High', bioVal: 'Low (add branchers)', insight: 'Additives needed to hold bubble structure.' },
      { name: 'Cooling Rate', unit: 'rate', standardVal: 'Medium', bioVal: 'Rapid', insight: 'Freeze foam structure instantly.' }
    ]
  },
  {
    id: 'fiber',
    name: 'Fiber Spinning',
    icon: Cog,
    description: 'Extruding filaments for textiles and non-wovens.',
    outputs: ['Apparel', 'Teabags', 'Wipes', 'Carpets'],
    runLogic: 'Moisture is the enemy. Even 50ppm of water will cause hydrolysis in the extruder, breaking the polymer chains. The fiber will snap during drawing. Extensive pre-drying (4-6 hours) is mandatory before the hopper.',
    parameters: [
      { name: 'Moisture', unit: 'ppm', standardVal: '<200', bioVal: '<50', insight: 'Critical to prevent chain scission.' },
      { name: 'Draw Ratio', unit: 'ratio', standardVal: '4:1', bioVal: '2.5:1', insight: 'Gentler stretching avoids breakage.' },
      { name: 'Quench Air', unit: 'm/s', standardVal: '0.5', bioVal: '0.2', insight: 'Low turbulence prevents filament flutter.' }
    ]
  },
  {
    id: 'compression',
    name: 'Compression Molding',
    icon: Layers,
    description: 'Squeezing material into shape using heat and pressure.',
    outputs: ['Car Door Panels', 'Composite Boards', 'Dinnerware', 'Gaskets'],
    runLogic: 'This is often used for composites (e.g., Hemp + PLA). The challenge is "wetting out" the fiber without burning it. Natural fibers act as insulators, so the center of the part cooks slower than the skin. Cycle times must increase.',
    parameters: [
      { name: 'Press Temp', unit: '°C', standardVal: '200', bioVal: '170', insight: 'Protect natural fibers from scorching.' },
      { name: 'Hold Time', unit: 'min', standardVal: '1.0', bioVal: '2.5', insight: 'Allow heat to penetrate core.' },
      { name: 'Degassing', unit: 'cycles', standardVal: '1', bioVal: '3', insight: 'Release moisture steam from fibers.' }
    ]
  },
  {
    id: '3d',
    name: '3D Printing (FDM)',
    icon: Cpu,
    description: 'Additive manufacturing layer by layer.',
    outputs: ['Prototypes', 'Custom Jigs', 'Medical Scaffolds', 'Spare Parts'],
    runLogic: 'Heat creep is the main failure mode. Bio-filaments soften way before the nozzle, clogging the throat tube. You need aggressive heatsink cooling. Also, bed adhesion is tricky—PHA warps significantly as it crystallizes.',
    parameters: [
      { name: 'Nozzle Temp', unit: '°C', standardVal: '210', bioVal: '195', insight: 'Prevent stringing and oozing.' },
      { name: 'Bed Temp', unit: '°C', standardVal: '60', bioVal: '0 - 40', insight: 'Keep PHA amorphous on first layer.' },
      { name: 'Retraction', unit: 'mm', standardVal: '5.0', bioVal: '2.0', insight: 'Prevent soft filament grinding.' }
    ]
  },
  {
    id: 'bio',
    name: 'Bio-Assembly',
    icon: Thermometer,
    description: 'Growing materials using living organisms.',
    outputs: ['Mycelium Packaging', 'Bacterial Leather', 'Bio-Cement', 'Scaffolds'],
    runLogic: 'This is farming, not manufacturing. You are managing life support systems. Parameters are biological, not mechanical. The risk is contamination—Trichoderma (green mold) will outcompete your material if sterility is breached.',
    parameters: [
      { name: 'Humidity', unit: '%', standardVal: 'N/A', bioVal: '90+', insight: 'Essential for hyphal network growth.' },
      { name: 'Incubation', unit: 'days', standardVal: 'Min', bioVal: '5 - 14', insight: 'Growth takes time vs instant plastic.' },
      { name: 'Sterilization', unit: 'temp', standardVal: 'N/A', bioVal: '121°C', insight: 'Substrate must be pasteurized first.' }
    ]
  }
];

const Factory: React.FC<FactoryProps> = ({ initialMaterial }) => {
  const [selectedProcess, setSelectedProcess] = useState<ManufacturingProcess | null>(null);
  const [materialContext, setMaterialContext] = useState(initialMaterial || 'Generic Bio-Material');

  useEffect(() => {
    if (initialMaterial) setMaterialContext(initialMaterial);
  }, [initialMaterial]);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-gray-900 text-white rounded-lg">
             <FactoryIcon size={24} />
           </div>
           <div>
             <h1 className="text-2xl font-bold text-gray-900">The Factory</h1>
             <p className="text-gray-500 text-sm">Virtual Manufacturing Floor • Process Logic Simulator</p>
           </div>
        </div>
        {materialContext && (
          <div className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm">
            <Settings size={14} /> Running: {materialContext}
          </div>
        )}
      </div>

      {!selectedProcess ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processes.map((proc) => (
            <div 
              key={proc.id}
              onClick={() => setSelectedProcess(proc)}
              className="group bg-white border border-gray-200 rounded-xl p-6 cursor-pointer hover:shadow-notion hover:-translate-y-1 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <proc.icon size={64} className="text-gray-900" />
              </div>
              <div className="mb-4 p-2 bg-gray-50 rounded-lg w-fit">
                 <proc.icon size={24} className="text-gray-700" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{proc.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">{proc.description}</p>
              
              <div className="flex flex-wrap gap-1.5 mt-auto">
                 {proc.outputs.slice(0, 2).map(out => (
                    <span key={out} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">{out}</span>
                 ))}
                 {proc.outputs.length > 2 && <span className="text-[10px] text-gray-400 py-1">+ {proc.outputs.length - 2} more</span>}
              </div>
            </div>
          ))}
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

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Overview & Outputs */}
              <div className="space-y-6">
                 <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gray-900"></div>
                    <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4">
                       <selectedProcess.icon size={40} className="text-gray-900" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProcess.name}</h2>
                    <p className="text-sm text-gray-500">{selectedProcess.description}</p>
                 </div>

                 <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Box size={14} /> Typical Outputs
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {selectedProcess.outputs.map((out, i) => (
                          <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                             {out}
                          </span>
                       ))}
                    </div>
                 </div>

                 <div className="bg-indigo-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10">
                       <Activity size={100} />
                    </div>
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Activity size={18} /> Bio-Logic</h3>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                       {selectedProcess.runLogic}
                    </p>
                 </div>
              </div>

              {/* Right Column: Parameters Dashboard */}
              <div className="lg:col-span-2 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                       <Gauge size={20} className="text-gray-400" /> Process Control Parameters
                    </h3>
                    <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                       <span className="flex items-center gap-1.5 text-gray-400"><div className="w-2 h-2 rounded-full bg-gray-300"></div> Standard</span>
                       <span className="flex items-center gap-1.5 text-indigo-600"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Bio-Optimized</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    {selectedProcess.parameters?.map((param, idx) => (
                       <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className="flex justify-between items-start mb-6">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                                   {idx === 0 ? <Thermometer size={20} /> : idx === 1 ? <Clock size={20} /> : <Zap size={20} />}
                                </div>
                                <div>
                                   <h4 className="font-bold text-gray-900">{param.name}</h4>
                                   <span className="text-xs text-gray-400 font-mono">{param.unit}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100">
                                <Info size={10} /> Insight
                             </div>
                          </div>

                          {/* Comparison Bar */}
                          <div className="flex items-center gap-4 mb-6">
                             <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100 text-center opacity-70">
                                <div className="text-xs text-gray-400 uppercase font-bold mb-1">Standard</div>
                                <div className="text-xl font-mono font-medium text-gray-600">{param.standardVal}</div>
                             </div>
                             <div className="text-gray-300">
                                <ArrowLeft size={20} className="rotate-180" />
                             </div>
                             <div className="flex-1 bg-indigo-50 rounded-lg p-4 border border-indigo-100 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                <div className="text-xs text-indigo-400 uppercase font-bold mb-1">Bio-Run</div>
                                <div className="text-xl font-mono font-bold text-indigo-700">{param.bioVal}</div>
                             </div>
                          </div>

                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg italic border border-gray-100">
                             "{param.insight}"
                          </p>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Factory;
