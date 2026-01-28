
import React from 'react';
import { FileText, TrendingUp, Users, AlertTriangle, Factory, ExternalLink, Download, ArrowRight, Share2, Printer } from 'lucide-react';
import { ResearchReportData } from '../types';

interface ResearchReportProps {
  data: ResearchReportData;
}

const ResearchReport: React.FC<ResearchReportProps> = ({ data }) => {
  return (
    <div className="max-w-5xl mx-auto p-8 animate-fade-in pb-32">
      {/* Report Header */}
      <div className="border-b-4 border-white pb-8 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest mb-4">
            <span className="bg-cyan-900/20 px-2 py-1 border border-cyan-500/30">ID: REP-{(Math.random() * 10000).toFixed(0)}</span>
            <span className="text-white/30">//</span>
            <span>Industrial Intelligence Protocol</span>
          </div>
          <h1 className="text-5xl font-bold text-white uppercase tracking-tighter leading-none mb-4 font-mono">
            {data.title}
          </h1>
          <div className="text-gray-500 font-mono text-xs uppercase tracking-widest flex items-center gap-4">
            <span>ISSUED: {new Date().toLocaleDateString()}</span>
            <span>CLASSIFICATION: PRO-LEVEL</span>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => window.print()} className="p-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
              <Printer size={18} />
           </button>
           <button className="p-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
              <Share2 size={18} />
           </button>
           <button className="bg-cyan-500 text-black px-6 py-3 text-xs font-bold uppercase tracking-widest font-mono shadow-neon hover:bg-cyan-400">
              [ EXPORT_PDF ]
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* Executive Summary */}
          <section>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-2 font-mono flex items-center gap-2">
               <FileText size={14} /> 01 // Executive Summary
            </h2>
            <p className="text-xl text-gray-200 font-mono leading-relaxed italic">
               "{data.summary}"
            </p>
          </section>

          {/* Market Trends */}
          <section>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8 border-b border-white/10 pb-2 font-mono flex items-center gap-2">
               <TrendingUp size={14} /> 02 // Strategic Market Trends
            </h2>
            <div className="grid gap-px bg-white/10 border border-white/10">
               {data.marketTrends.map((trend, i) => (
                 <div key={i} className="p-6 bg-obsidian-800 flex flex-col md:flex-row gap-6 hover:bg-white/5 transition-colors group">
                    <div className="md:w-1/3 shrink-0">
                       <span className="text-cyan-400 font-bold font-mono text-sm block mb-1 uppercase tracking-wider">{trend.trend}</span>
                    </div>
                    <div className="flex-1">
                       <p className="text-sm text-gray-400 font-mono leading-relaxed">{trend.impact}</p>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* Consumer Demand */}
          <section>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8 border-b border-white/10 pb-2 font-mono flex items-center gap-2">
               <Users size={14} /> 03 // Demand Driver Matrix
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {data.consumerDemand.map((d, i) => (
                 <div key={i} className="p-6 bg-obsidian-800 border-l-2 border-emerald-500/50">
                    <span className="text-[10px] text-emerald-500 font-bold uppercase mb-2 block tracking-widest">{d.segment}</span>
                    <p className="text-sm text-gray-200 font-mono leading-relaxed">{d.driver}</p>
                 </div>
               ))}
            </div>
          </section>

          {/* Key Players */}
          <section>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8 border-b border-white/10 pb-2 font-mono flex items-center gap-2">
               <Factory size={14} /> 04 // Sector Stakeholders
            </h2>
            <div className="space-y-4">
               {data.keyPlayers.map((p, i) => (
                 <div key={i} className="p-6 bg-black/20 border border-white/5 flex items-start gap-6 group hover:border-white/20 transition-all">
                    <div className="w-12 h-12 shrink-0 bg-white/5 flex items-center justify-center font-bold text-white font-mono border border-white/10 group-hover:border-cyan-500/50">
                       {p.name.charAt(0)}
                    </div>
                    <div>
                       <h3 className="font-bold text-white text-lg font-mono mb-2 uppercase group-hover:text-cyan-400 transition-colors">{p.name}</h3>
                       <p className="text-xs text-gray-400 font-mono leading-relaxed">{p.activity}</p>
                    </div>
                 </div>
               ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-12">
           {/* Technical Barriers */}
           <div className="bg-amber-900/10 border border-amber-500/30 p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6 font-mono flex items-center gap-2">
                 <AlertTriangle size={14} /> Critical Barriers
              </h2>
              <div className="space-y-6">
                 {data.technicalBarriers.map((b, i) => (
                   <div key={i} className="flex gap-4">
                      <span className="text-amber-500 font-mono font-bold">[{i+1}]</span>
                      <p className="text-xs text-gray-300 font-mono leading-relaxed">{b}</p>
                   </div>
                 ))}
              </div>
           </div>

           {/* Grounded Sources */}
           <div className="bg-obsidian-800 border border-white/10 p-8">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 font-mono border-b border-white/10 pb-2">Verified Sources</h2>
              <div className="space-y-4">
                 {data.sources.map((s, i) => (
                   <a key={i} href={s.url} target="_blank" rel="noreferrer" className="block p-4 bg-black/20 hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                      <div className="flex justify-between items-start gap-4">
                         <span className="text-[10px] text-gray-400 font-mono leading-tight group-hover:text-white transition-colors">{s.title}</span>
                         <ExternalLink size={12} className="text-gray-600 shrink-0 group-hover:text-cyan-400" />
                      </div>
                   </a>
                 ))}
              </div>
           </div>

           {/* Protocol Status */}
           <div className="p-6 bg-cyan-900/10 border border-cyan-500/30 rounded-none text-center">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2 font-mono">Status: Analysis_Complete</div>
              <div className="flex justify-center gap-1">
                 {[1,2,3,4,5,6,7].map(n => <div key={n} className="w-1.5 h-1.5 bg-cyan-500"></div>)}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchReport;
