
import React, { useState, useEffect } from 'react';
import { Sparkles, Wand2, Loader2, Save, TestTube2, Image as ImageIcon, Factory, FileText, CheckCircle2, FlaskConical, ArrowRight } from 'lucide-react';
import { generateMaterialRecipe, generateMaterialImage } from '../services/geminiService';
import { MaterialRecipe } from '../types';
import { SharedContext } from '../App';

interface InnovationLabProps {
  onSave: (recipe: MaterialRecipe, image?: string) => void;
  onNavigate: (tab: string, data?: SharedContext) => void;
  initialProblem?: string;
  embeddedMode?: boolean; // New prop for workstation integration
}

const InnovationLab: React.FC<InnovationLabProps> = ({ onSave, onNavigate, initialProblem, embeddedMode = false }) => {
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<MaterialRecipe | null>(null);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (initialProblem) {
      setProblem(initialProblem);
    }
  }, [initialProblem]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;
    setLoading(true);
    setRecipe(null);
    setImage(null);

    try {
      const [rec, img] = await Promise.all([
        generateMaterialRecipe(problem),
        generateMaterialImage(problem)
      ]);
      setRecipe(rec);
      setImage(img);
      // Auto-save to parent workstation state if in embedded mode
      if (embeddedMode) {
          onSave(rec, img);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className={`max-w-5xl mx-auto ${embeddedMode ? '' : 'animate-fade-in pb-20'}`}>
      {!embeddedMode && (
        <div className="mb-10">
            <div className="flex items-center gap-2 text-indigo-600 mb-2 font-medium">
            <Sparkles size={18} /> Innovation Engine
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Generative Material Design</h1>
            <p className="text-gray-500 max-w-2xl">
            Describe a problem or application. The engine will invent a formulation, define commercial potential, and render a prototype.
            </p>
        </div>
      )}

      {/* Input Section */}
      <form onSubmit={handleGenerate} className="relative mb-12 group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-2 flex gap-2 items-center">
           <input 
             value={problem}
             onChange={(e) => setProblem(e.target.value)}
             placeholder="Describe target application (e.g. 'Heat resistant bio-plastic for coffee cups')"
             className="flex-1 text-lg px-4 py-3 outline-none text-gray-900 placeholder-gray-400 bg-transparent"
             autoFocus={!embeddedMode}
           />
           <button 
             type="submit"
             disabled={!problem.trim() || loading}
             className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-50"
           >
             {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
             Generate
           </button>
        </div>
      </form>

      {/* Results Section */}
      {loading && (
         <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <div className="inline-block p-4 bg-white rounded-full mb-4 relative shadow-sm border border-gray-100">
               <Loader2 className="animate-spin text-indigo-600" size={32} />
               <Sparkles className="absolute top-0 right-0 text-purple-500 animate-pulse" size={16} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Synthesizing Formulation...</h3>
            <div className="flex justify-center gap-8 mt-6 text-xs font-medium text-gray-400">
                <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Analyzing Market Fit</span>
                <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin text-indigo-500" /> Defining Chemistry</span>
                <span className="flex items-center gap-2"><ImageIcon size={14} /> Rendering Prototype</span>
            </div>
         </div>
      )}

      {recipe && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
           
           {/* Left: Visuals & Core Info */}
           <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
                 {image ? (
                    <img src={image} alt="Generated Material" className="w-full aspect-square object-cover rounded-xl" />
                 ) : (
                    <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center flex-col gap-2 text-gray-400">
                       <ImageIcon size={32} />
                       <span className="text-xs font-bold">No Render Available</span>
                    </div>
                 )}
                 <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                       <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded tracking-wider">{recipe.quadrant}</span>
                       <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Eco-Score: {recipe.sustainabilityScore}/100
                       </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{recipe.name}</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">{recipe.description}</p>
                 </div>
              </div>

              {!embeddedMode && (
                  <button 
                    onClick={() => onSave(recipe, image || undefined)}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                        <Save size={16} /> Save to Registry
                  </button>
              )}
           </div>

           {/* Right: Engineering Blueprint */}
           <div className="lg:col-span-2 space-y-6">
              {/* Recipe Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full opacity-50 pointer-events-none"></div>
                 <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <TestTube2 size={20} className="text-indigo-500" /> Formulation Recipe
                 </h3>
                 <div className="space-y-3 relative z-10">
                    {recipe.ingredients.map((ing, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                          <div>
                             <span className="font-bold text-gray-900 block">{ing.name}</span>
                             <span className="text-xs text-gray-500">{ing.function}</span>
                          </div>
                          <span className="text-lg font-mono font-bold text-indigo-600">{ing.percentage}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Commercial Potential */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                 <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-600" /> Commercial Applications
                 </h3>
                 <div className="grid grid-cols-2 gap-4">
                    {recipe.applications.map((app, i) => (
                       <div key={i} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow flex items-center gap-3">
                          <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
                             {i + 1}
                          </div>
                          <span className="text-gray-800 font-medium text-sm">{app}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Properties */}
              <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg">
                 <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <FileText size={20} /> Predicted Properties
                 </h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {recipe.properties.map((prop, i) => (
                       <div key={i}>
                          <div className="text-xs text-gray-400 uppercase font-bold mb-1">{prop.name}</div>
                          <div className="text-xl font-mono font-medium">{prop.value}</div>
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

export default InnovationLab;
