
import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, ShieldAlert, FlaskConical, Gavel, ArrowRight, Loader2 } from 'lucide-react';
import { searchMarketIntel } from '../services/geminiService';
import { NewsItem } from '../types';

const ResearchFeed: React.FC = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Specialized query for the Research Feed as requested
      const results = await searchMarketIntel(
        "latest regulatory updates on PFAS bans (EU REACH, EPA), 3M Novec replacements, and new material science breakthroughs in sustainable polymers 2024-2025"
      );
      setItems(results);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
               <Newspaper size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Research Feed</h1>
          </div>
          <p className="text-gray-500 max-w-2xl">
            Live surveillance of <span className="font-semibold text-gray-700">PFAS Regulatory Actions</span> and <span className="font-semibold text-gray-700">Material Breakthroughs</span>. 
            Powered by Gemini Grounding with Google Search.
          </p>
        </div>
        
        <button 
          onClick={fetchNews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm font-bold hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Intel
        </button>
      </div>

      {/* Feed Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
             <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Loader2 className="animate-spin text-indigo-500 w-10 h-10 mx-auto mb-4" />
                <h3 className="text-gray-900 font-bold">Scanning Global Sources...</h3>
                <p className="text-sm text-gray-500 mt-2">Analyzing regulatory filings and scientific journals.</p>
             </div>
          ) : items.length === 0 ? (
             <div className="py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500">No recent updates found. Try refreshing.</p>
             </div>
          ) : (
             items.map((item, index) => (
                <a 
                  key={index} 
                  href={item.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-200 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 group-hover:bg-indigo-400 transition-colors"></div>
                  
                  <div className="flex justify-between items-start gap-4 mb-3">
                     <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        <Newspaper size={12} /> {item.source || "Web Source"}
                     </div>
                     <ExternalLink size={16} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-700 leading-tight">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed text-sm mb-4">
                    {item.snippet}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                     <span className="flex items-center gap-1"><ShieldAlert size={12} /> Regulatory Watch</span>
                     <span className="flex items-center gap-1"><FlaskConical size={12} /> Material Science</span>
                  </div>
                </a>
             ))
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
           {/* Watchlist Card */}
           <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <ShieldAlert size={16} className="text-red-500" /> Critical Watchlist
              </h3>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <span className="text-sm font-bold text-red-900">PFAS (Forever Chems)</span>
                    <span className="text-xs font-bold text-red-600 bg-white px-2 py-1 rounded border border-red-100">HIGH RISK</span>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <span className="text-sm font-bold text-amber-900">Fluoropolymers</span>
                    <span className="text-xs font-bold text-amber-600 bg-white px-2 py-1 rounded border border-amber-100">UNDER REVIEW</span>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm font-bold text-gray-700">Bisphenols (BPA)</span>
                    <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">RESTRICTED</span>
                 </div>
              </div>
           </div>

           {/* Topics Card */}
           <div className="bg-indigo-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 opacity-10">
                 <Gavel size={120} />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Gavel size={16} /> Regulatory Radar
              </h3>
              <ul className="space-y-3 text-sm text-indigo-100">
                 <li className="flex items-start gap-2">
                    <ArrowRight size={14} className="mt-1 shrink-0 text-indigo-400" />
                    <span>EU REACH Restriction Proposal timeline updates.</span>
                 </li>
                 <li className="flex items-start gap-2">
                    <ArrowRight size={14} className="mt-1 shrink-0 text-indigo-400" />
                    <span>EPA Reporting Requirements for PFAS usage.</span>
                 </li>
                 <li className="flex items-start gap-2">
                    <ArrowRight size={14} className="mt-1 shrink-0 text-indigo-400" />
                    <span>State-level bans (Maine, Minnesota, California).</span>
                 </li>
              </ul>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ResearchFeed;
