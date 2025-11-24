import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Wand2, Loader2, Save, TestTube2, Image as ImageIcon, Factory, FileText, CheckCircle2, FlaskConical, ArrowRight, FileUp, ChefHat, ScrollText, Lightbulb, Scan } from 'lucide-react';
import { generateMaterialRecipe, generateMaterialImage, extractRecipeFromPatent } from '../services/geminiService';
import { MaterialRecipe } from '../types';
import { SharedContext } from '../App';

interface InnovationLabProps {
  onSave: (recipe: MaterialRecipe, image?: string) => void;
  onNavigate: (tab: string, data?: SharedContext) => void;
  initialProblem?: string;
  embeddedMode?: boolean; 
}

const InnovationLab: React.FC<InnovationLabProps> = ({ onSave, onNavigate, initialProblem, embeddedMode = false }) => {
  const [mode, setMode] = useState<'generate' | 'extract'>('generate');
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<MaterialRecipe | null>(null);
  const [image, setImage] = useState<string | null>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
      if (embeddedMode) onSave(rec, img);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setLoading(true);
    setRecipe(null);
    setImage(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
         const base64 = (reader.result as string).split(',')[1];
         const rec = await extractRecipeFromPatent(base64);
         setRecipe(rec);
         const img = await generateMaterialImage(rec.description);
         setImage(img);
         if (embeddedMode) onSave(rec, img);
         setLoading(false);
      };
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-6xl mx-auto ${embeddedMode ? '' : 'animate-fade-in pb-20'}`}>
      {!embeddedMode && (
        <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-4 font-mono uppercase tracking-tight">Generative Design</h1>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="flex gap-px bg-white/10 border border-white/10 mb-8">
        <button 
          onClick={() => setMode('generate')}
          className={`flex-1 py-6 transition-all flex flex-col items-center gap-3 group ${mode === 'generate' ? 'bg-cyan-900/20 border-b-2 border-cyan-400' : 'bg-obsidian-800 hover:bg-white/5 border-b-2 border-transparent'}`}
        >
          <Sparkles size={20} className={mode === 'generate' ? 'text-cyan-400' : 'text-gray-500 group-hover:text-white'} />
          <div className="text-center">
            <div className={`text-sm font-bold uppercase tracking-widest ${mode === 'generate' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>Generative Synthesis</div>
            <div className="text-[10px] font-mono text-gray-600 mt-1">TEXT_TO_MAT</div>
          </div>
        </button>
        <button 
          onClick={() => setMode('extract')}
          className={`flex-1 py-6 transition-all flex flex-col items-center gap-3 group ${mode === 'extract' ? 'bg-cyan-900/20 border-b-2 border-cyan-400' : 'bg-obsidian-800 hover:bg-white/5 border-b-2 border-transparent'}`}
        >
          <Scan size={20} className={mode === 'extract' ? 'text-cyan-400' : 'text-gray-500 group-hover:text-white'} />
          <div className="text-center">
            <div className={`text-sm font-bold uppercase tracking-widest ${mode === 'extract' ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}>Reverse Engineering</div>
            <div className="text-[10px] font-mono text-gray-600 mt-1">PATENT_DECONSTRUCTION</div>
          </div>
        </button>
      </div>

      {/* Input Section - Generative */}
      {mode === 'generate' && (
        <form onSubmit={handleGenerate} className="mb-12">
            <div className="relative bg-obsidian-800 border border-white/10 p-2 flex gap-4 items-center focus-within:border-cyan-500/50 transition-colors focus-within:shadow-glow">
            <div className="pl-4 text-cyan-500 font-mono">{'>'}</div>
            <input 
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Input target application parameters..."
                className="flex-1 text-lg px-0 py-4 outline-none text-white placeholder-gray-600 bg-transparent font-mono"
                autoFocus={!embeddedMode}
            />
            <button 
                type="submit"
                disabled={!problem.trim() || loading}
                className="bg-cyan-500 text-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center gap-2 disabled:opacity-50 shadow-neon"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={16} />}
                RUN
            </button>
            </div>
        </form>
      )}

      {/* Input Section - Extraction */}
      {mode === 'extract' && (
        <div className="mb-12">
            <div 
                onClick={() => fileRef.current?.click()}
                className="border border-white/10 bg-white/5 hover:bg-cyan-900/10 hover:border-cyan-500/30 transition-all h-32 flex flex-col items-center justify-center cursor-pointer relative group"
            >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(34,211,238,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
                <input type="file" accept=".pdf" className="hidden" ref={fileRef} onChange={handleFileChange} />
                {file ? (
                    <div className="flex flex-col items-center z-10">
                        <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm bg-cyan-900/20 px-4 py-2 border border-cyan-500/30">
                            <FileText size={16} /> {file.name}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-gray-500 group-hover:text-cyan-400 z-10">
                        <FileUp size={24} className="mb-2" />
                        <span className="font-bold font-mono uppercase tracking-widest text-xs">Upload PDF Document</span>
                    </div>
                )}
            </div>
            
            {file && (
                <button 
                    onClick={handleExtract}
                    disabled={loading}
                    className="w-full mt-4 bg-cyan-500 text-black py-4 font-bold hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 font-mono uppercase tracking-widest text-sm shadow-neon"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Factory size={16} />}
                    Initiate Extraction
                </button>
            )}
        </div>
      )}

      {/* Results Section */}
      {loading && (
         <div className="text-center py-32 border border-dashed border-white/10">
            <div className="inline-block mb-6">
               <Loader2 className="animate-spin text-cyan-500 w-12 h-12" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono uppercase tracking-widest animate-pulse">
                PROCESSING DATA STREAM...
            </h3>
         </div>
      )}

      {recipe && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
           
           {/* Left: Visuals & Core Info */}
           <div className="space-y-6">
              <div className="bg-obsidian-800 border border-white/10 p-1">
                 {image ? (
                    <img src={image} alt="Generated Material" className="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                 ) : (
                    <div className="w-full aspect-square bg-white/5 flex items-center justify-center flex-col gap-2 text-gray-600">
                       <ImageIcon size={32} />
                       <span className="text-xs font-mono">NO_RENDER</span>
                    </div>
                 )}
                 <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                       <span className="px-2 py-1 bg-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-widest border border-white/10">{recipe.quadrant}</span>
                       <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
                          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                          SCORE: {recipe.sustainabilityScore}
                       </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 font-mono uppercase">{recipe.name}</h2>
                    <p className="text-sm text-gray-400 leading-relaxed font-mono">{recipe.description}</p>
                 </div>
              </div>

              {!embeddedMode && (
                  <button 
                    onClick={() => onSave(recipe, image || undefined)}
                    className="w-full py-4 bg-cyan-500 text-black font-bold text-sm hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 font-mono uppercase tracking-widest shadow-neon"
                  >
                        <Save size={16} /> Add to Registry
                  </button>
              )}
           </div>

           {/* Right: Engineering Blueprint */}
           <div className="lg:col-span-2 space-y-6">
              {/* Recipe Card */}
              <div className="bg-obsidian-800 border border-white/10 p-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TestTube2 size={100} />
                 </div>
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2 font-mono">
                    <span className="text-white">01.</span> Formulation Matrix
                 </h3>
                 <div className="space-y-px bg-white/10 border border-white/10">
                    {recipe.ingredients.map((ing, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-obsidian-800 hover:bg-white/5 transition-colors group">
                          <div>
                             <span className="font-bold text-white block font-mono group-hover:text-cyan-400 transition-colors">{ing.name}</span>
                             <span className="text-xs text-gray-500 uppercase tracking-wide">{ing.function}</span>
                          </div>
                          <span className="text-xl font-mono font-bold text-white/80">{ing.percentage}</span>
                       </div>
                    ))}
                 </div>
              </div>
              
              {/* Processing Steps */}
              {recipe.processingSteps && recipe.processingSteps.length > 0 && (
                  <div className="bg-obsidian-800 border border-white/10 p-8">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2 font-mono">
                          <span className="text-white">02.</span> Processing Logic
                      </h3>
                      <div className="space-y-4">
                          {recipe.processingSteps.map((step, i) => (
                              <div key={i} className="flex gap-6 items-start font-mono text-sm">
                                  <div className="text-gray-600 font-bold">
                                      {(i + 1).toString().padStart(2, '0')}
                                  </div>
                                  <p className="text-gray-300 leading-relaxed border-b border-white/5 pb-4 w-full">{step}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Variations */}
              {recipe.variations && recipe.variations.length > 0 && (
                  <div className="bg-gradient-to-br from-cyan-900/20 to-obsidian-800 border border-cyan-500/30 p-8">
                      <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2 font-mono">
                          <Lightbulb size={14} /> Variations
                      </h3>
                      <div className="grid gap-4">
                          {recipe.variations.map((variant, i) => (
                              <div key={i} className="bg-obsidian-900/50 p-4 border border-white/10 hover:border-cyan-500/50 transition-colors">
                                  <span className="font-bold text-white text-sm block mb-1 font-mono">{variant.name}</span>
                                  <p className="text-xs text-gray-400 font-mono">{variant.description}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Properties */}
              <div className="bg-white/5 border border-white/10 p-8">
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2 font-mono">
                    <FileText size={14} /> Predicted Properties
                 </h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {recipe.properties.map((prop, i) => (
                       <div key={i}>
                          <div className="text-[10px] text-gray-500 uppercase font-bold mb-2 tracking-widest">{prop.name}</div>
                          <div className="text-xl font-mono font-bold text-white">{prop.value}</div>
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