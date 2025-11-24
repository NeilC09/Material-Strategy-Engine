
import React, { useState } from 'react';
import { Sparkles, FlaskConical, Factory, ChevronRight, Save, Layers, AlertTriangle, CheckCircle2, Sliders } from 'lucide-react';
import InnovationLab from './InnovationLab';
import MaterialAnalyzer from './MaterialAnalyzer';
import FactorySimulator from './Factory';
import { ProjectState, MaterialRecipe, AnalysisResult } from '../types';
import { SharedContext } from '../App';

interface WorkstationProps {
  onNavigate: (tab: string, data?: SharedContext) => void;
  onSaveToLibrary: (recipe: MaterialRecipe, image?: string) => void;
}

const Workstation: React.FC<WorkstationProps> = ({ onNavigate, onSaveToLibrary }) => {
  const [activeStep, setActiveStep] = useState<'design' | 'analyze' | 'build'>('design');
  
  // Unified Project State
  const [project, setProject] = useState<ProjectState>({
    id: Date.now().toString(),
    name: 'Untitled Project',
    status: 'ideation',
    lastModified: new Date(),
  });

  // Handlers to update state from child components
  const handleRecipeUpdate = (recipe: MaterialRecipe, image?: string) => {
    setProject(prev => ({
      ...prev,
      name: recipe.name,
      recipe: recipe,
      image: image,
      status: 'analyzing'
    }));
    // Auto-advance to analysis after generation
    // setActiveStep('analyze'); 
  };

  const handleAnalysisUpdate = (result: AnalysisResult) => {
    setProject(prev => ({
      ...prev,
      analysis: result,
      status: 'production_ready'
    }));
  };

  const steps = [
    { id: 'design', label: '1. Formulation', icon: Sparkles, desc: 'Generative Design' },
    { id: 'analyze', label: '2. Validation', icon: FlaskConical, desc: 'Logic & Constraints' },
    { id: 'build', label: '3. Production', icon: Factory, desc: 'Process Simulation' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      
      {/* 1. Workstation Header (Project DNA) */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
           {/* Project Icon */}
           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              {activeStep === 'design' && <Sparkles size={24} />}
              {activeStep === 'analyze' && <FlaskConical size={24} />}
              {activeStep === 'build' && <Factory size={24} />}
           </div>
           
           <div>
              <div className="flex items-center gap-2">
                 <h1 className="text-xl font-bold text-gray-900 tracking-tight">{project.name}</h1>
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    project.status === 'ideation' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                    project.status === 'analyzing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                 }`}>
                    {project.status.replace('_', ' ')}
                 </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                 <span className="flex items-center gap-1"><Layers size={12} /> Workstation Active</span>
                 {project.recipe && (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                       <CheckCircle2 size={12} /> Recipe Locked
                    </span>
                 )}
              </div>
           </div>
        </div>

        {/* Workflow Stepper */}
        <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-200/60">
           {steps.map((step) => {
              const isActive = activeStep === step.id;
              const isComplete = (step.id === 'design' && project.recipe) || (step.id === 'analyze' && project.analysis);
              
              return (
                 <button
                   key={step.id}
                   onClick={() => setActiveStep(step.id as any)}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                   }`}
                 >
                    <step.icon size={16} className={isActive ? 'text-indigo-600' : isComplete ? 'text-emerald-500' : 'text-gray-400'} />
                    <div>
                       <div className="leading-none">{step.label}</div>
                    </div>
                 </button>
              );
           })}
        </div>

        {/* Global Actions */}
        <div>
           <button 
             onClick={() => project.recipe && onSaveToLibrary(project.recipe, project.image)}
             disabled={!project.recipe}
             className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all"
           >
              <Save size={16} /> Save Project
           </button>
        </div>
      </div>

      {/* 2. Main Workspace Content */}
      <div className="flex-1 overflow-hidden relative">
         <div className="absolute inset-0 overflow-y-auto scroll-smooth">
            <div className="max-w-7xl mx-auto p-8 pb-32">
               
               {/* STEP 1: INNOVATION LAB */}
               <div className={activeStep === 'design' ? 'block animate-fade-in' : 'hidden'}>
                  <div className="mb-8 flex items-end justify-between border-b border-gray-200 pb-6">
                     <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Formulation & Design</h2>
                        <p className="text-gray-500 max-w-2xl">
                           Define the core chemistry and target properties. The generative engine will construct a candidate recipe.
                        </p>
                     </div>
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
                   <div className="mb-8 flex items-end justify-between border-b border-gray-200 pb-6">
                     <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Logic & Validation</h2>
                        <p className="text-gray-500 max-w-2xl">
                           Stress-test the formulation against engineering constraints. Identify thermal, mechanical, and supply chain risks.
                        </p>
                     </div>
                     {!project.recipe && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-sm font-medium">
                           <AlertTriangle size={16} /> No formulation detected. Go back to Step 1.
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
                  <div className="mb-8 flex items-end justify-between border-b border-gray-200 pb-6">
                     <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Process Simulation</h2>
                        <p className="text-gray-500 max-w-2xl">
                           Virtual manufacturing trials. See how the material behaves in injection molding, extrusion, or 3D printing.
                        </p>
                     </div>
                  </div>
                  <FactorySimulator 
                     initialMaterial={project.recipe ? project.recipe.name : project.name}
                     onNavigate={onNavigate}
                     constraints={project.analysis?.constraints} // Pass constraints to factory!
                  />
               </div>

            </div>
         </div>
      </div>

      {/* 3. Context Footer (Persistent Data) */}
      {project.recipe && (
         <div className="bg-white border-t border-gray-200 p-4 shrink-0 z-20 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-8">
               <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Active Formula</div>
                  <div className="font-mono font-bold text-indigo-600">{project.recipe.name}</div>
               </div>
               
               <div className="h-8 w-px bg-gray-200"></div>

               <div className="flex gap-6">
                  {project.recipe.properties.slice(0, 3).map((prop, i) => (
                     <div key={i}>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{prop.name}</div>
                        <div className="font-mono font-medium text-gray-800 text-sm">{prop.value}</div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="flex items-center gap-4">
               {project.analysis?.constraints.length ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-100">
                     <AlertTriangle size={12} /> {project.analysis.constraints.length} Constraints Active
                  </div>
               ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-400 rounded-full text-xs font-bold border border-gray-100">
                     <CheckCircle2 size={12} /> System Nominal
                  </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
};

export default Workstation;
