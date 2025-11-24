
import React, { useState, useEffect } from 'react';
import { FlaskConical, Loader2, ArrowRight, AlertTriangle, Layers, Settings, Image as ImageIcon, Wand2, Factory, Scale, FileText, Brain, Sparkles, CheckCircle2 } from 'lucide-react';
import { analyzeMaterial, generateMaterialImage } from '../services/geminiService';
import { AnalysisResult, QuadrantType, SharedContext } from '../types';

interface MaterialAnalyzerProps {
  onNavigate: (tab: string, data?: SharedContext) => void;
  initialMaterial?: string;
  embeddedMode?: boolean;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

const MaterialAnalyzer: React.FC<MaterialAnalyzerProps> = ({ onNavigate, initialMaterial, embeddedMode = false, onAnalysisComplete }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (initialMaterial) {
      try {
          const parsed = JSON.parse(initialMaterial);
          if (parsed.name) {
              setInput(parsed.name + " (" + parsed.description + ")");
              if (embeddedMode && !result && !loading) {
                  triggerAnalysis(parsed.name + " " + parsed.description);
              }
          } else {
              setInput(initialMaterial);
          }
      } catch (e) {
          setInput(initialMaterial);
      }
    }
  }, [initialMaterial]);

  const triggerAnalysis = async (query: string) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const analysis = await analyzeMaterial(query);
      if (analysis.quadrant) {
          analysis.quadrant = analysis.quadrant.replace('_', '-') as unknown as QuadrantType;
      }
      setResult(analysis);
      if (onAnalysisComplete) {
          onAnalysisComplete(analysis);
      }
    } catch (err) {
      setError("Failed to generate analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await triggerAnalysis(input);
  };

  const handleGenerateImage = async () => {
    if (!input) return;
    setImageLoading(true);
    try {
      const img = await generateMaterialImage(input);
      setGeneratedImage(img);
    } catch (e) { console.error(e); }
    setImageLoading(false);
  };

  return (
    <div className={`max-w-5xl mx-auto ${embeddedMode ? '' : 'animate-fade-in pb-20'}`}>
      {/* Header / Input Section */}
      <div className="mb-12">
        <form onSubmit={handleAnalyze} className="group relative">
          {!embeddedMode && (
            <h1 className="text-4xl font-bold text-white mb-4 font-mono uppercase tracking-tight">Deep Validation</h1>
          )}
          <div className="flex gap-4 border-b border-white/20 pb-2 focus-within:border-cyan-400 focus-within:shadow-glow transition-all">
            <div className="flex-1">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter material name..."
                    className="w-full text-2xl font-bold text-white placeholder-gray-600 bg-transparent p-0 outline-none font-mono uppercase"
                />
            </div>
            {!embeddedMode && (
                <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="text-white text-sm font-bold uppercase tracking-widest hover:text-cyan-400 transition-colors flex items-center gap-2"
                >
                {loading ? <Loader2 className="animate-spin text-cyan-400" size={16} /> : "EXECUTE"}
                </button>
            )}
            {embeddedMode && (
                <button 
                 type="submit"
                 disabled={loading}
                 className="bg-cyan-500 text-black px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors flex items-center gap-2 shadow-neon"
                >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : "VALIDATE_AGAIN"}
                </button>
            )}
          </div>
        </form>
      </div>

      {loading && embeddedMode && (
          <div className="py-20 text-center bg-white/5 border border-white/10">
              <Loader2 className="animate-spin mx-auto text-cyan-500 mb-4" size={32} />
              <h3 className="text-white font-bold font-mono uppercase tracking-widest text-sm">Checking Constraints...</h3>
          </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 text-red-400 border border-red-500/30 mb-8 flex items-center gap-3 text-sm font-mono">
           <AlertTriangle size={18} /> {error}
        </div>
      )}

      {result && (
        <div className="animate-fade-in space-y-8">
          
          {/* Top Summary Card */}
          <div className="bg-obsidian-800 border border-white/10 p-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-glow"></div>
             <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 font-mono">Executive Summary</h3>
                   <p className="text-lg text-gray-200 leading-relaxed font-mono">{result.summary}</p>
                   <div className="mt-8 flex flex-wrap gap-4">
                      <span className="px-3 py-1 bg-white/5 text-gray-300 border border-white/10 text-xs font-bold uppercase tracking-widest font-mono">
                         {result.quadrant}
                      </span>
                      {result.constraints.length > 0 ? (
                         <span className="px-3 py-1 bg-amber-900/20 text-amber-500 border border-amber-500/30 text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-2">
                           <AlertTriangle size={12} /> {result.constraints.length} Constraints
                         </span>
                      ) : (
                         <span className="px-3 py-1 bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold uppercase tracking-widest font-mono flex items-center gap-2 shadow-glow">
                           <CheckCircle2 size={12} /> Viable
                         </span>
                      )}
                   </div>
                </div>
                
                {/* Image Generation Slot */}
                {!embeddedMode && (
                    <div className="w-full md:w-64 flex-shrink-0">
                    {generatedImage ? (
                        <div className="relative group">
                            <img 
                            src={generatedImage} 
                            alt="Generated Material" 
                            className="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-500" 
                            />
                            <button 
                                onClick={handleGenerateImage}
                                className="absolute bottom-2 right-2 bg-black text-white p-2 text-xs font-bold border border-white/20 hover:bg-cyan-500 hover:text-black transition-colors uppercase font-mono"
                            >
                                REGEN
                            </button>
                        </div>
                    ) : (
                        <div 
                            onClick={handleGenerateImage}
                            className="w-full aspect-square bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:shadow-glow transition-all cursor-pointer flex flex-col items-center justify-center text-center p-4 group"
                        >
                            {imageLoading ? (
                                <Loader2 className="animate-spin text-cyan-500 mb-2" />
                            ) : (
                                <ImageIcon className="text-gray-600 group-hover:text-cyan-400 mb-2 transition-colors" />
                            )}
                            <span className="text-xs font-bold text-gray-500 group-hover:text-cyan-400 font-mono uppercase">
                                {imageLoading ? "RENDERING..." : "VISUALIZE"}
                            </span>
                        </div>
                    )}
                    </div>
                )}
             </div>
          </div>

          {/* 3 Pillars Grid */}
          <div>
             <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 font-mono uppercase tracking-widest">
                <Brain size={16} /> Logic Core
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-obsidian-800 border border-white/10">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="text-cyan-400"><Layers size={16} /></div>
                      <h4 className="font-bold text-white text-sm font-mono uppercase">Compounding</h4>
                   </div>
                   <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line font-mono">{result.engineeringLogic.compounding}</p>
                </div>

                <div className="p-6 bg-obsidian-800 border border-white/10">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="text-cyan-400"><Settings size={16} /></div>
                      <h4 className="font-bold text-white text-sm font-mono uppercase">Processing</h4>
                   </div>
                   <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line font-mono">{result.engineeringLogic.processing}</p>
                </div>
                
                <div className="md:col-span-2 p-6 bg-amber-900/10 border border-amber-500/20">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="text-amber-500"><AlertTriangle size={16} /></div>
                      <h4 className="font-bold text-amber-500 text-sm font-mono uppercase">Critical Constraints</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.constraints.map((c, i) => (
                         <div key={i} className="flex items-start gap-3 text-sm text-gray-300 font-mono">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 shrink-0"></span>
                            <span>{c}</span>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialAnalyzer;
