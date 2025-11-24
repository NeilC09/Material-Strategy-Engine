
import React, { useState } from 'react';
import { Hammer, Download, FileCheck, AlertCircle, Check } from 'lucide-react';

const ProTools: React.FC = () => {
  const [selectedMaterial, setSelectedMaterial] = useState('PLA Blend');
  const [region, setRegion] = useState('EU');

  const handleExportCAD = () => {
    // Mock download
    const data = {
      material: selectedMaterial,
      properties: {
        density: 1.24,
        youngsModulus: 3.5,
        poissonsRatio: 0.36
      },
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedMaterial.replace(' ', '_')}_props.mat`;
    a.click();
  };

  const regulations = [
    { id: 'EN13432', name: 'EN 13432 (Industrial Compost)', status: selectedMaterial.includes('PLA') ? 'pass' : 'fail' },
    { id: 'FDA21', name: 'FDA 21 CFR (Food Contact)', status: 'check' },
    { id: 'OKHome', name: 'TUV OK Compost Home', status: selectedMaterial.includes('PHA') ? 'pass' : 'fail' },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
           <Hammer className="text-gray-600" size={32} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Pro Tools</h2>
        <p className="text-gray-500 mt-2">
          Engineering exports and regulatory compliance checkers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CAD EXPORT */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
           <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
             <Download className="text-blue-600" /> Export to CAD
           </h3>
           <p className="text-gray-600 text-sm mb-8 leading-relaxed">
             Download material property files compatible with SolidWorks, Rhino, and Ansys.
           </p>
           
           <div className="mb-8">
             <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Select Material Definition</label>
             <div className="relative">
                <select 
                    className="w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-100 outline-none appearance-none"
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                >
                <option>PLA Blend (High Impact)</option>
                <option>PHA/Starch Composite</option>
                <option>Recycled PP + Wood Fiber</option>
                </select>
             </div>
           </div>

           <button 
             onClick={handleExportCAD}
             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
           >
             <Download size={18} /> Download .MAT File
           </button>
        </div>

        {/* REGULATORY CHECKER */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
           <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
             <FileCheck className="text-emerald-600" /> Compliance Checker
           </h3>
           
           <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setRegion('EU')}
                className={`flex-1 py-2 rounded-lg border font-medium transition-all ${region === 'EU' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                EU (CEN)
              </button>
              <button 
                onClick={() => setRegion('US')}
                className={`flex-1 py-2 rounded-lg border font-medium transition-all ${region === 'US' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                US (ASTM)
              </button>
           </div>

           <div className="space-y-3">
              {regulations.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                   <span className="text-gray-700 text-sm font-medium">{reg.name}</span>
                   {reg.status === 'pass' && <span className="text-green-600 flex items-center gap-1 text-xs font-bold bg-green-50 px-2 py-1 rounded-md border border-green-100"><Check size={14} /> PASS</span>}
                   {reg.status === 'fail' && <span className="text-red-600 flex items-center gap-1 text-xs font-bold bg-red-50 px-2 py-1 rounded-md border border-red-100"><AlertCircle size={14} /> FAIL</span>}
                   {reg.status === 'check' && <span className="text-amber-600 flex items-center gap-1 text-xs font-bold bg-amber-50 px-2 py-1 rounded-md border border-amber-100">REQUIRES TEST</span>}
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProTools;
