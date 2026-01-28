
import React, { useState, useEffect } from 'react';
import { Leaf, Droplet, Zap, RotateCcw, BarChart3, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { estimateLCA } from '../services/geminiService';
import { LCAData, MaterialRecipe } from '../types';

interface EcoImpactProps {
  recipe: MaterialRecipe;
  existingData?: LCAData;
  onUpdate: (data: LCAData) => void;
}

const EcoImpact: React.FC<EcoImpactProps> = ({ recipe, existingData, onUpdate }) => {
  const [data, setData] = useState<LCAData | null>(existingData || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!existingData && recipe) {
       runAnalysis();
    }
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    try {
        const result = await estimateLCA(recipe.name);
        setData(result);
        onUpdate(result);
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 border-dashed rounded-lg">
              <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
              <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest">Calculating Carbon Footprint...</span>
          </div>
      );
  }

  if (!data) return null;

  const maxCarbon = Math.max(...data.comparison.map(c => c.carbon), data.carbonFootprint);

  return (
    <div className="animate-fade-in">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
           {/* Key Metrics */}
           <div className="bg-obsidian-800 border border-white/10 p-6 flex items-center gap-4 group hover:border-emerald-500/30 transition-colors">
              <div className="p-3 bg-emerald-900/20 text-emerald-400 rounded-lg group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                 <Leaf size={24} />
              </div>
              <div>
                 <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">CO2 Equivalent</div>
                 <div className="text-2xl font-mono font-bold text-white">{data.carbonFootprint} <span className="text-sm text-gray-500 font-sans">kg/kg</span></div>
              </div>
           </div>

           <div className="bg-obsidian-800 border border-white/10 p-6 flex items-center gap-4 group hover:border-cyan-500/30 transition-colors">
              <div className="p-3 bg-cyan-900/20 text-cyan-400 rounded-lg group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                 <Droplet size={24} />
              </div>
              <div>
                 <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Water Usage</div>
                 <div className="text-2xl font-mono font-bold text-white">{data.waterUsage} <span className="text-sm text-gray-500 font-sans">L/kg</span></div>
              </div>
           </div>

           <div className="bg-obsidian-800 border border-white/10 p-6 flex items-center gap-4 group hover:border-amber-500/30 transition-colors">
              <div className="p-3 bg-amber-900/20 text-amber-400 rounded-lg group-hover:bg-amber-500 group-hover:text-black transition-colors">
                 <RotateCcw size={24} />
              </div>
              <div>
                 <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Circularity Score</div>
                 <div className="text-2xl font-mono font-bold text-white">{data.circularityScore}<span className="text-gray-500">/10</span></div>
              </div>
           </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Comparison Chart */}
           <div className="bg-obsidian-800 border border-white/10 p-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <BarChart3 size={14} /> Industry Benchmark (CO2)
              </h3>
              <div className="space-y-5">
                 {/* Current Material */}
                 <div>
                    <div className="flex justify-between text-xs text-emerald-400 font-bold mb-2 uppercase">
                       <span>{recipe.name} (This Project)</span>
                       <span>{data.carbonFootprint} kg</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: `${(data.carbonFootprint / maxCarbon) * 100}%` }}></div>
                    </div>
                 </div>

                 {/* Comparisons */}
                 {data.comparison.map((item, i) => (
                    <div key={i}>
                       <div className="flex justify-between text-xs text-gray-500 font-bold mb-2 uppercase">
                          <span>{item.material}</span>
                          <span>{item.carbon} kg</span>
                       </div>
                       <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-600" style={{ width: `${(item.carbon / maxCarbon) * 100}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Verdict / AI Summary */}
           <div className="bg-white/5 border border-white/10 p-8 flex flex-col">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <CheckCircle2 size={14} /> Impact Assessment
               </h3>
               <p className="text-sm text-gray-300 leading-relaxed font-mono flex-1">
                 {data.verdict}
               </p>
               <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase">
                  <AlertCircle size={12} /> Data is estimated via ML models. Lab verification required.
               </div>
           </div>
       </div>
    </div>
  );
};

export default EcoImpact;
