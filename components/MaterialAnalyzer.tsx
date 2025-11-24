
import React, { useState, useEffect } from 'react';
import { FlaskConical, Loader2, ArrowRight, AlertTriangle, Layers, Settings, Image as ImageIcon, Wand2, Factory, Scale, FileText, Brain, Sparkles, CheckCircle } from 'lucide-react';
import { analyzeMaterial, generateMaterialImage } from '../services/geminiService';
import { AnalysisResult, QuadrantType } from '../types';
import { SharedContext } from '../App';

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
      // If it's a JSON string (from workstation), parse it to get a nice name, otherwise use as is
      try {
          const parsed = JSON.parse(initialMaterial);
          if (parsed.name) {
              setInput(parsed.name + " (" + parsed.description + ")");
              // Auto-trigger analysis in embedded mode if it looks like a full recipe
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
            <div className="flex items-center gap-2 text-gray-400 mb-3 text-sm font-medium uppercase tracking-wide">
                <FlaskConical size={14} /> Material Analysis
            </div>
          )}
          <div className="flex gap-4">
            <div className="flex-1">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe a material concept..."
                    className="w-full text-3xl md:text-4xl font-bold text-gray-900 placeholder-gray-200 border-none outline-none bg-transparent p-0 focus:ring-0 transition-colors"
                />
                <div className="h-px w-full bg-gray-200 mt-4 group-focus-within:bg-gray-400 transition-colors" />
            </div>
            {!embeddedMode && (
                <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium disabled:opacity-50 hover:bg-gray-800 transition-all shadow-sm hover:shadow flex items-center gap-2 h-fit mt-2"
                >
                {loading ? <Loader2 className="animate-spin" size={16} /> : "Run Analysis"} <ArrowRight size={16} />
                </button>
            )}
            {embeddedMode && (
                <button 
                 type="submit"
                 disabled={loading}
                 className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2 h-fit"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Re-Validate"}
                </button>
            )}
          </div>
        </form>
      </div>

      {loading && embeddedMode && (
          <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
              <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" size={32} />
              <h3 className="text-gray-900 font-bold">Validating Logic...</h3>
              <p className="text-gray-500 text-sm mt-1">Checking thermodynamic constraints and process viability.</p>
          </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-lg mb-8 flex items-center gap-3 text-sm font-medium">
           <AlertTriangle size={18} /> {error}
        </div>
      )}

      {result && (
        <div className="animate-fade-in space-y-12">
          
          {/* Top Summary Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-gray-900"></div>
             <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Executive Summary</h3>
                   <p className="text-lg text-gray-800 leading-relaxed font-medium">{result.summary}</p>
                   <div className="mt-6 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold tracking-wide border border-gray-200">
                         {result.quadrant}
                      </span>
                      {result.constraints.length > 0 ? (
                         <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold tracking-wide border border-amber-100 flex items-center gap-1">
                           <AlertTriangle size={10} /> {result.constraints.length} Constraints Detected
                         </span>
                      ) : (
                         <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold tracking-wide border border-emerald-100 flex items-center gap-1">
                           <CheckCircle size={10} /> Commercial Viable
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
                            className="w-full aspect-square object-cover rounded-lg shadow-md border border-gray-100" 
                            />
                            <button 
                                onClick={handleGenerateImage}
                                className="absolute bottom-2 right-2 bg-white/90 text-gray-900 p-1.5 rounded-md text-xs font-bold shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Regenerate"
                            >
                                <Wand2 size={14} />
                            </button>
                        </div>
                    ) : (
                        <div 
                            onClick={handleGenerateImage}
                            className="w-full aspect-square rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-100 transition-all cursor-pointer flex flex-col items-center justify-center text-center p-4 group"
                        >
                            {imageLoading ? (
                                <Loader2 className="animate-spin text-gray-400 mb-2" />
                            ) : (
                                <ImageIcon className="text-gray-300 group-hover:text-gray-500 mb-2 transition-colors" />
                            )}
                            <span className="text-xs font-bold text-gray-500 group-hover:text-gray-700">
                                {imageLoading ? "Rendering..." : "Generate Concept"}
                            </span>
                        </div>
                    )}
                    </div>
                )}
             </div>
          </div>

          {/* 3 Pillars Grid */}
          <div>
             <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Brain size={24} className="text-gray-400" /> Engineering Logic
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layers size={20} /></div>
                      <h4 className="font-bold text-gray-900">Compounding</h4>
                   </div>
                   <p className="text-sm text-gray-600 leading-7 whitespace-pre-line">{result.engineeringLogic.compounding}</p>
                </div>

                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Settings size={20} /></div>
                      <h4 className="font-bold text-gray-900">Processing</h4>
                   </div>
                   <p className="text-sm text-gray-600 leading-7 whitespace-pre-line">{result.engineeringLogic.processing}</p>
                </div>
                
                {/* Full width constraints if needed, or another logic block */}
                <div className="md:col-span-2 p-6 bg-amber-50 border border-amber-100 rounded-xl">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><AlertTriangle size={20} /></div>
                      <h4 className="font-bold text-amber-900">Critical Constraints</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.constraints.map((c, i) => (
                         <div key={i} className="flex items-start gap-2 text-sm text-amber-900 bg-white/60 p-3 rounded-md border border-amber-100/50">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
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
