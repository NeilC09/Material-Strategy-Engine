
import React, { useState, useEffect } from 'react';
import { Sparkles, FlaskConical, Factory, ChevronRight, Save, Layers, AlertTriangle, CheckCircle2, Sliders, Terminal, Activity } from 'lucide-react';
import InnovationLab from './InnovationLab';
import MaterialAnalyzer from './MaterialAnalyzer';
import FactorySimulator from './Factory';
import { ProjectState, MaterialRecipe, AnalysisResult, SharedContext } from '../types';

interface WorkstationProps {
  onNavigate: (tab: string, data?: SharedContext) => void;
  onSaveToLibrary: (recipe: MaterialRecipe, image?: string) => void;
  initialContext?: SharedContext;
}

const Workstation: React.FC<WorkstationProps> = ({ onNavigate, onSaveToLibrary, initialContext }) => {
  const [activeStep, setActiveStep] = useState<'design' | 'analyze' | 'build'>('design');
  
  // Unified Project State
  const [project, setProject] = useState<ProjectState>({
    id: Date.now().toString(),
    name: 'Untitled Project',
    status: 'ideation',
    lastModified: new Date(),
  });

  // Handle initialization from Context (e.g. coming from Dashboard)
  useEffect(() => {
    if (initialContext) {
      if (initialContext.workstationStep) {
        setActiveStep(initialContext.workstationStep);
      }
      if (initialContext.material) {
        setProject(prev => ({
          ...prev,
          name: initialContext.material || 'Untitled Project',
          // If jumping straight to build, assume it's ready for simulation (or at least selected)
          status: initialContext.workstationStep === 'build' ? 'production_ready' : 'ideation'
        }));
      }
    }
  }, [initialContext]);

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

  const steps = [
    { id: 'design', label: '01 // DESIGN', icon: Sparkles },
    { id: 'analyze', label: '02 // VALIDATE', icon: FlaskConical },
    { id: 'build', label: '03 // MANUFACTURE', icon: Factory },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-obsidian-900 text-gray-200">
      
      {/* 1. Workstation Header (Project DNA) */}
      <div className="bg-obsidian-900 border-b border-white/10 px-8 py-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
           {/* Project Icon */}
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
                 {project.recipe && (
                    <span className="flex items-center gap-1 text-cyan-500">
                       <Terminal size={10} /> Formula Locked
                    </span>
                 )}
              </div>
           </div>
        </div>

        {/* Workflow Stepper */}
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

        {/* Global Actions */}
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

      {/* 2. Main Workspace Content */}
      <div className="flex-1 overflow-hidden relative bg-obsidian-900">
         <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
            <div className="max-w-7xl mx-auto p-8 pb-32">
               
               {/* STEP 1: INNOVATION LAB */}
               <div className={activeStep === 'design' ? 'block animate-fade-in' : 'hidden'}>
                  <div className="mb-12 border-l-2 border-cyan-500 pl-6">
                    <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase">Formulation Matrix</h2>
                    <p className="text-gray-400 font-mono text-sm">
                       Initialize generative design sequence. Define parameters for synthesis.
                    </p>
                  </div>
                  <InnovationLab 
                     onSave={handleRecipeUpdate} 
                     onNavigate={onNavigate} 
                     initialProblem={project.name !== 'Untitled Project' ? project.name : ''}
                     embeddedMode={true}
                  />
               </div>

               {/* STEP 2: LOGIC LAB (ANALYZER) */}
               <div className={activeStep === 'analyze' ? 'block animate-fade-in' : 'hidden'}>
                   <div className="mb-12 border-l-2 border-cyan-500 pl-6">
                     <h2 className="text-3xl font-bold text-white mb-2 font-mono uppercase">Validation Logic</h2>
                     <p className="text-gray-400 font-mono text-sm">
                        Stress-test formulation against thermodynamic and mechanical constraints.
                     </p>
                     {!project.recipe && (
                        <div className="flex items-center gap-2 mt-4 text-amber-500 text-xs font-bold font-mono uppercase">
                           <AlertTriangle size={14} /> No formulation detected. Return to Step 01.
                        </div>
                     )}
                  </div>
                  <MaterialAnalyzer 
                     onNavigate={onNavigate} 
                     initialMaterial={project.recipe ? JSON.stringify(project.recipe) : project.name}
                     embeddedMode={true}
                     onAnalysisComplete={handleAnalysisUpdate}
                  />
               </div>

               {/* STEP 3: THE FACTORY */}
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

      {/* 3. Context Footer (Persistent Data) */}
      {project.recipe && (
         <div className="bg-obsidian-800 border-t border-white/10 p-4 shrink-0 z-20 flex items-center justify-between font-mono">
            <div className="flex items-center gap-8">
               <div>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Active Formula</div>
                  <div className="text-cyan-400 font-bold">{project.recipe.name}</div>
               </div>
               
               <div className="h-8 w-px bg-white/10"></div>

               <div className="flex gap-8">
                  {project.recipe.properties.slice(0, 3).map((prop, i) => (
                     <div key={i}>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{prop.name}</div>
                        <div className="text-white text-sm">{prop.value}</div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="flex items-center gap-4">
               {project.analysis?.constraints.length ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-bold uppercase">
                     <AlertTriangle size={12} /> {project.analysis.constraints.length} Risk Factors
                  </div>
               ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold uppercase">
                     <CheckCircle2 size={12} /> Systems Nominal
                  </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
};

export default Workstation;
