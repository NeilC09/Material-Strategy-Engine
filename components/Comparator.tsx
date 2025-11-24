import React, { useState } from 'react';
import { Scale } from 'lucide-react';

const materials = {
  'PLA': { cost: 2.5, strength: 60, bio: 100 },
  'PP': { cost: 1.2, strength: 35, bio: 0 },
  'PHA': { cost: 5.5, strength: 25, bio: 100 },
  'Bio-PET': { cost: 2.8, strength: 75, bio: 0 }
};

const Comparator: React.FC<{initialMaterial?: string}> = ({ initialMaterial }) => {
  const [matA, setMatA] = useState('PLA');
  const [matB, setMatB] = useState('PP');

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
       <div className="flex items-center gap-2 mb-8 text-gray-400">
         <Scale size={20} />
         <h2 className="text-xl font-semibold text-gray-900">Comparator</h2>
       </div>

       <div className="bg-white border border-gray-200 rounded-lg shadow-card overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 p-4 text-sm font-medium text-gray-500">
             <div>Metric</div>
             <div>
                <select 
                   value={matA} onChange={e => setMatA(e.target.value)} 
                   className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer"
                >
                   {Object.keys(materials).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
             </div>
             <div>
                <select 
                   value={matB} onChange={e => setMatB(e.target.value)} 
                   className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer"
                >
                   {Object.keys(materials).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
             </div>
          </div>

          {[
             { label: 'Cost ($/kg)', key: 'cost', unit: '$' },
             { label: 'Tensile Strength (MPa)', key: 'strength', unit: ' MPa' },
             { label: 'Biodegradability', key: 'bio', unit: '%' }
          ].map((row, i) => (
             <div key={i} className="grid grid-cols-3 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <div className="text-sm text-gray-500">{row.label}</div>
                <div className="text-sm font-mono text-gray-900">
                   {materials[matA as keyof typeof materials][row.key as 'cost' | 'strength' | 'bio']}{row.unit.replace('$','')}
                </div>
                <div className="text-sm font-mono text-gray-900">
                   {materials[matB as keyof typeof materials][row.key as 'cost' | 'strength' | 'bio']}{row.unit.replace('$','')}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default Comparator;