
import React, { useState, useEffect } from 'react';
import { Sparkles, FlaskConical, Factory, ChevronRight, Save, Layers, AlertTriangle, CheckCircle2, Sliders, Terminal, Activity, Palette, Leaf, BarChart2 } from 'lucide-react';
import InnovationLab from './InnovationLab';
import MaterialAnalyzer from './MaterialAnalyzer';
import FactorySimulator from './Factory';
import CMFStudio from './CMFStudio';
import EcoImpact from './EcoImpact';
import { ProjectState, MaterialRecipe, AnalysisResult, SharedContext, CMFVariant, LCAData } from '../types';

interface WorkstationProps {
  onNavigate: (tab: string, data?: SharedContext) => void;
  onSaveToLibrary: (recipe: MaterialRecipe, image?: string) => void;
  initialContext?: SharedContext;
}

const Workstation: React.FC<WorkstationProps> = ({ onNavigate, onSaveToLibrary, initialContext }) => {
  const [activeStep, setActiveStep] = useState<'design' | 'analyze' | 'build'>('design');
  const [subTab, setSubTab] = useState<'form' | 'cmf' | 'logic' | 'eco'>('form');

  // Unified Project State
  const [project, setProject] = useState<ProjectState>({
    id: Date.now().toString(),
    name: 'Untitled Project',
    status: 'ideation',
    lastModified: new Date(),
  });

  // Handle initialization
  useEffect(() => {
    if (initialContext) {
      if (initialContext.workstationStep) {
        setActiveStep(initialContext.workstationStep);
      }
      if (initialContext.material) {
        setProject(prev => ({
          ...prev,
          name: initialContext.material || 'Untitled Project',
          status: initialContext.workstationStep === 'build' ? 'production_ready' : 'ideation'
        }));
      }
    }
  }, [initialContext]);

  // Reset subtabs when changing main steps
  useEffect(() => {
     if (activeStep === 'design') setSubTab('form');
     if (activeStep === 'analyze') setSubTab('logic');
  }, [activeStep]);

  const handleRecipeUpdate = (recipe: MaterialRecipe, image?: string) => {
    setProject(prev => ({
      ...prev,
      name: recipe.name,
      recipe: recipe,
      image: image,
      status: 'analyzing'
    }));
  };

  const handleAnalysisUpdate = (result: AnalysisResult) => {
    setProject(prev => ({
      ...prev,
      analysis: result,
      status: 'production_ready'
    }));
  };

  const handleCMFUpdate = (variants: CMFVariant[]) => {
      setProject(prev => ({ ...prev, cmfVariants: variants }));
  };

  const handleLCAUpdate = (data: LCAData) => {
      setProject(prev => ({ ...prev, lca: data }));
  };

  const steps = [
    { id: 'design', label: '01 // DESIGN', icon: Sparkles },
    { id: 'analyze', label: '02 // VALIDATE', icon: FlaskConical },
    { id: 'build', label: '03 // MANUFACTURE', icon: Factory },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-obsidian-900 text-gray-200">
      
      {/* 1. Header */}
      <div className="bg-obsidian-900 border-b border-white/10 px-8 py-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
           <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shadow-glow">
              {activeStep === 'design' && <Sparkles size={20} />}
              {activeStep === 'analyze' && <FlaskConical size={20} />}
              {activeStep === 'build' && <Factory size={20} />}
           </div>
           
           <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-lg font-bold text-white tracking-widest uppercase font-mono">{project.name}</h1>
                 <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border font-mono ${
                    project.status === 'ideation' ? 'bg-white/5 text-gray-400 border-white/10' :
                    project.status === 'analyzing' ? 'bg-cyan-900/20 text-cyan-400 border-cyan-500/30' :
                    'bg-emerald-900/20 text-emerald-400 border-emerald-500/30'
                 }`}>
                    {project.status.replace('_', ' ')}
                 </span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-wider">
                 <span className="flex items-center gap-1"><Activity size={10} /> Workstation Active</span>
              </div>
           </div>
        </div>

        {/* Stepper */}
        <div className="flex bg-black/20 p-1 border border-white/10">
           {steps.map((step) => {
              const isActive = activeStep === step.id;
              return (
                 <button
                   key={step.id}
                   onClick={() => setActiveStep(step.id as any)}
                   className={`flex items-center gap-3 px-6 py-2 text-xs font-bold transition-all font-mono tracking-wider border border-transparent ${
                      isActive 
                        ? 'bg-cyan-900/10 text-cyan-400 border-cyan-500/30 shadow-glow' 
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                   }`}
                 >
                    <step.icon size={14} />
                    {step.label}
                 </button>
              );
           })}
        </div>

        {/* Actions */}
        <div>
           <button 
             onClick={() => project.recipe && onSaveToLibrary(project.recipe, project.image)}
             disabled={!project.recipe}
             className="bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all font-mono shadow-neon"
           >
              <Save size={14} /> Save Project
           </button>
        </div>
      </div>

      {/* 2. Workspace */}
      <div className="flex-1 overflow-hidden relative bg-obsidian-900">
         <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
            <div className="max-w-7xl mx-auto p-8 pb-32">
               
               {/* STEP 1: DESIGN */}
               <div className={activeStep === 'design' ? 'block animate-fade-in' : 'hidden'}>
                  {/* Subtabs for Design */}
                  <div className="flex items-center gap-6 mb-12 border-b border-white/10 pb-1">
                      <button 
                         onClick={() => setSubTab('form')}
                         className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${subTab === 'form' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-white'}`}
                      >
                         <Sparkles size={16} /> Formulation
                      </button>
                      <button 
                         onClick={() => setSubTab('cmf')}
                         disabled={!project.recipe}
                         className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${subTab === 'cmf' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-500 hover:text-white'}`}
                      >
                         <Palette size={16} /> CMF Studio
                      </button>
                  </div>

                  {subTab === 'form' && (
                      <InnovationLab 
                         onSave={handleRecipeUpdate} 
                         onNavigate={onNavigate} 
                         initialProblem={project.name !== 'Untitled Project' ? project.name : ''}
                         embeddedMode={true}
                      />
                  )}

                  {subTab === 'cmf' && project.recipe && (
                      <CMFStudio 
                         recipe={project.recipe}
                         onUpdateVariants={handleCMFUpdate}
                         existingVariants={project.cmfVariants}
                      />
                  )}
                  {subTab === 'cmf' && !project.recipe && (
                      <div className="py-20 text-center border border-dashed border-white/10 rounded-lg bg-white/5">
                          <Palette className="mx-auto text-gray-600 mb-4" size={48} />
                          <h3 className="text-gray-300 font-mono text-sm uppercase">Studio Locked</h3>
                          <p className="text-gray-500 text-xs mt-2">Generate a material formulation to access CMF tools.</p>
                      </div>
                  )}
               </div>

               {/* STEP 2: ANALYZE */}
               <div className={activeStep === 'analyze' ? 'block animate-fade-in' : 'hidden'}>
                   <div className="flex items-center gap-6 mb-12 border-b border-white/10 pb-1">
                      <button 
                         onClick={() => setSubTab('logic')}
                         className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${subTab === 'logic' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-white'}`}
                      >
                         <Activity size={16} /> Engineering Logic
                      </button>
                      <button 
                         onClick={() => setSubTab('eco')}
                         disabled={!project.recipe}
                         className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${subTab === 'eco' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-500 hover:text-white'}`}
                      >
                         <Leaf size={16} /> Eco Impact
                      </button>
                  </div>

                  {subTab === 'logic' && (
                      <>
                        {!project.recipe && (
                            <div className="flex items-center gap-2 mb-8 text-amber-500 text-xs font-bold font-mono uppercase">
                            <AlertTriangle size={14} /> No formulation detected. Return to Step 01.
                            </div>
                        )}
                        <MaterialAnalyzer 
                            onNavigate={onNavigate} 
                            initialMaterial={project.recipe ? JSON.stringify(project.recipe) : project.name}
                            embeddedMode={true}
                            onAnalysisComplete={handleAnalysisUpdate}
                        />
                      </>
                  )}

                  {subTab === 'eco' && project.recipe && (
                      <EcoImpact 
                          recipe={project.recipe}
                          existingData={project.lca}
                          onUpdate={handleLCAUpdate}
                      />
                  )}
                  {subTab === 'eco' && !project.recipe && (
                      <div className="py-20 text-center border border-dashed border-white/10 rounded-lg bg-white/5">
                          <Leaf className="mx-auto text-gray-600 mb-4" size={48} />
                          <h3 className="text-gray-300 font-mono text-sm uppercase">LCA Unavailable</h3>
                          <p className="text-gray-500 text-xs mt-2">Generate a material formulation to calculate impact.</p>
                      </div>
                  )}
               </div>

               {/* STEP 3: MANUFACTURE */}
               <div className={activeStep === 'build' ? 'block animate-fade-in' : 'hidden'}>
                  <div className="mb-12 border-l-2 border-cyan-500 pl-6">
                     <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase">Process Simulation</h2>
                     <p className="text-gray-400 font-mono text-sm">
                        Virtual manufacturing environment. Run rheology and thermal cycle tests.
                     </p>
                  </div>
                  <FactorySimulator 
                     initialMaterial={project.recipe ? project.recipe.name : project.name}
                     onNavigate={onNavigate}
                     constraints={project.analysis?.constraints} 
                  />
               </div>

            </div>
         </div>
      </div>
    </div>
  );
};

export default Workstation;
