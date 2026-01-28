
import React, { useState } from 'react';
import { Palette, Layers, Download, Image as ImageIcon, Loader2, Sparkles, Droplet, Sun, Grid, MousePointer2, Check } from 'lucide-react';
import { generateMaterialImage, generateCMFDescription } from '../services/geminiService';
import { MaterialRecipe, CMFVariant } from '../types';

interface CMFStudioProps {
  recipe: MaterialRecipe;
  onUpdateVariants: (variants: CMFVariant[]) => void;
  existingVariants?: CMFVariant[];
}

const FINISHES = ['Matte', 'Satin', 'Gloss', 'High-Gloss', 'Translucent', 'Metallic', 'Iridescent'];
const TEXTURES = ['Smooth', 'Sandblasted', 'Brushed', 'Knurled', 'Perforated', 'Fabric-like', 'Leather-grain'];

const PRESET_COLORS = [
  { name: 'Raw', hex: '#e5e5e5' },
  { name: 'Charcoal', hex: '#333333' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Moss', hex: '#65a30d' },
  { name: 'Clay', hex: '#be8a5e' },
  { name: 'Midnight', hex: '#1e3a8a' },
  { name: 'Crimson', hex: '#9f1239' },
];

const CMFStudio: React.FC<CMFStudioProps> = ({ recipe, onUpdateVariants, existingVariants = [] }) => {
  const [variants, setVariants] = useState<CMFVariant[]>(existingVariants);
  const [loading, setLoading] = useState(false);
  
  // Selection State
  const [selectedFinish, setSelectedFinish] = useState(FINISHES[0]);
  const [selectedTexture, setSelectedTexture] = useState(TEXTURES[0]);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [customHex, setCustomHex] = useState('');
  const [isCustomColor, setIsCustomColor] = useState(false);

  // Derived state
  const activeColorHex = isCustomColor ? customHex : selectedColor.hex;
  const activeColorName = isCustomColor ? (customHex || 'Custom') : selectedColor.name;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Construct a rich prompt for the image generator
      const prompt = `Close up texture of ${recipe.name}, ${selectedFinish} optical finish, ${selectedTexture} surface texture, color hex code ${activeColorHex}, photorealistic, studio lighting, product design visualization, macro photography, 8k resolution`;
      
      const compositeFinishName = `${selectedFinish} ${selectedTexture}`;

      const [img, desc] = await Promise.all([
        generateMaterialImage(prompt),
        generateCMFDescription(recipe.name, compositeFinishName, activeColorName)
      ]);

      const newVariant: CMFVariant = {
        id: Date.now().toString(),
        name: `${activeColorName} / ${selectedFinish}`,
        finish: compositeFinishName,
        color: activeColorHex,
        imageUrl: img,
        description: desc
      };

      const updated = [newVariant, ...variants];
      setVariants(updated);
      onUpdateVariants(updated);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleExport = () => {
      const exportData = {
          material: recipe.name,
          variants: variants.map(v => ({
              id: v.id,
              name: v.name,
              finish: v.finish,
              baseColor: v.color,
              aestheticNotes: v.description,
              generatedDate: new Date().toISOString()
          })),
          timestamp: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recipe.name.replace(/\s+/g, '_')}_CMF_Deck.json`;
      a.click();
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Controls Column */}
          <div className="bg-obsidian-800 border border-white/10 p-6 space-y-8 h-fit">
             {/* 1. Color Selection */}
             <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Palette size={14} /> Base Color
                </h3>
                <div className="grid grid-cols-4 gap-3 mb-4">
                   {PRESET_COLORS.map(c => (
                      <button
                        key={c.name}
                        onClick={() => { setSelectedColor(c); setIsCustomColor(false); }}
                        className={`aspect-square rounded-full border-2 transition-transform hover:scale-110 relative ${(!isCustomColor && selectedColor.name === c.name) ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                         {(!isCustomColor && selectedColor.name === c.name) && <div className="absolute inset-0 flex items-center justify-center"><Check size={12} className="text-white drop-shadow-md" /></div>}
                      </button>
                   ))}
                </div>
                
                {/* Custom Hex Input */}
                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg border border-white/5">
                    <span className="text-xs font-mono text-gray-500">#</span>
                    <input 
                       type="text" 
                       value={customHex}
                       onChange={(e) => { setCustomHex(e.target.value); setIsCustomColor(true); }}
                       placeholder="HEX CODE"
                       className="bg-transparent text-xs font-mono text-white focus:outline-none w-full uppercase"
                       maxLength={7}
                    />
                    <div 
                        className="w-4 h-4 rounded-sm border border-white/10" 
                        style={{ backgroundColor: isCustomColor && customHex ? (customHex.startsWith('#') ? customHex : `#${customHex}`) : 'transparent' }}
                    ></div>
                </div>
             </div>

             {/* 2. Finish & Texture */}
             <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Layers size={14} /> Finish & Texture
                </h3>
                
                <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Optical Finish</label>
                <div className="flex flex-wrap gap-2 mb-4">
                   {FINISHES.map(f => (
                      <button
                        key={f}
                        onClick={() => setSelectedFinish(f)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase border rounded-md transition-all ${
                            selectedFinish === f 
                            ? 'bg-indigo-600 text-white border-indigo-400' 
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                        }`}
                      >
                         {f}
                      </button>
                   ))}
                </div>

                <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Tactile Texture</label>
                <div className="flex flex-wrap gap-2">
                   {TEXTURES.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTexture(t)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase border rounded-md transition-all ${
                            selectedTexture === t 
                            ? 'bg-cyan-600 text-white border-cyan-400' 
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                        }`}
                      >
                         {t}
                      </button>
                   ))}
                </div>
             </div>

             <div className="pt-4 border-t border-white/10 space-y-3">
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    Visualize Variant
                </button>

                <button 
                  onClick={handleExport}
                  disabled={variants.length === 0}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase disabled:opacity-30 p-2"
                >
                    <Download size={14} /> Export CMF Deck (.json)
                </button>
             </div>
          </div>

          {/* Gallery / Visualization Area */}
          <div className="xl:col-span-2 flex flex-col">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Grid size={14} /> Generated Assets
                 </h3>
                 <span className="text-[10px] font-mono text-gray-600">{variants.length} VARIANTS SAVED</span>
             </div>
             
             <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                {/* Empty State */}
                {variants.length === 0 && !loading && (
                    <div className="col-span-2 aspect-video bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center text-gray-600">
                        <Palette size={48} className="mb-4 opacity-20" />
                        <span className="text-xs font-mono uppercase tracking-widest">Select parameters to generate visualization</span>
                    </div>
                )}

                {/* Loading State Placeholder */}
                {loading && (
                    <div className="aspect-square bg-black/40 border border-white/10 flex flex-col items-center justify-center animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10"></div>
                        <Loader2 className="animate-spin text-cyan-400 mb-2" size={32} />
                        <span className="text-[10px] font-mono text-cyan-500 uppercase">Rendering...</span>
                    </div>
                )}

                {/* Rendered Variants */}
                {variants.map(v => (
                    <div key={v.id} className="group relative bg-obsidian-800 border border-white/10 overflow-hidden flex flex-col h-full">
                        <div className="relative aspect-square overflow-hidden">
                            {v.imageUrl ? (
                                <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700">
                                    <ImageIcon size={24} />
                                </div>
                            )}
                            
                            {/* Overlay Info */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-6 flex flex-col justify-end">
                                <span className="text-cyan-400 font-bold text-sm uppercase mb-1 tracking-wider">{v.finish}</span>
                                <p className="text-gray-300 text-xs leading-relaxed line-clamp-3 font-mono">{v.description}</p>
                            </div>
                        </div>
                        
                        {/* Always visible footer */}
                        <div className="p-3 border-t border-white/5 bg-white/5 flex justify-between items-center mt-auto">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: v.color }}></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{v.name.split('/')[0]}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[10px] text-gray-500 uppercase">{v.finish.split(' ')[0]}</span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

export default CMFStudio;
