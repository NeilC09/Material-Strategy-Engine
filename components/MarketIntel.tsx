
import React, { useState, useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { Globe, MapPin, ExternalLink, Factory, Leaf, Search, Loader2, ShieldCheck, Droplet, Microscope, Navigation, Filter, X, Zap } from 'lucide-react';
import { searchMarketIntel } from '../services/geminiService';
import { NewsItem, QuadrantType } from '../types';

interface CompanyNode {
  id: string;
  name: string;
  location: string;
  coords: [number, number]; // Lat, Long
  quadrant: QuadrantType;
  product: string;
  strategy: string;
  website?: string;
}

// Expanded Global Dataset - Real World Bio-Material Innovators
const companies: CompanyNode[] = [
  // --- NORTH AMERICA ---
  { id: 'bolt', name: 'Bolt Threads', location: 'Emeryville, CA', coords: [37.8313, -122.2852], quadrant: QuadrantType.NEXT_GEN, product: 'Mylo / B-Silk', strategy: 'Mycelium leather and spider silk proteins via fermentation.' },
  { id: 'sway', name: 'Sway', location: 'Monterey, CA', coords: [36.6002, -121.8947], quadrant: QuadrantType.BIO_BIO, product: 'Seaweed Packaging', strategy: 'Home compostable thin films from regenerative seaweed.' },
  { id: 'mycoworks', name: 'MycoWorks', location: 'Emeryville, CA', coords: [37.8393, -122.2912], quadrant: QuadrantType.NEXT_GEN, product: 'Reishi', strategy: 'Fine mycelium leather grown in trays.' },
  { id: 'nfw', name: 'Natural Fiber Welding', location: 'Peoria, IL', coords: [40.6936, -89.5890], quadrant: QuadrantType.BIO_BIO, product: 'Mirum', strategy: 'Plant-based leather without plastics or synthetic binders.' },
  { id: 'checkerspot', name: 'Checkerspot', location: 'Alameda, CA', coords: [37.7652, -122.2416], quadrant: QuadrantType.NEXT_GEN, product: 'WNDR Alpine', strategy: 'Algae oil converted into rigid polyurethane foam cores.' },
  { id: 'bucha', name: 'Bucha Bio', location: 'Houston, TX', coords: [29.7604, -95.3698], quadrant: QuadrantType.BIO_BIO, product: 'Shorai', strategy: 'Bacterial nanocellulose composites.' },
  { id: 'keel', name: 'Keel Labs', location: 'Morrisville, NC', coords: [35.8235, -78.8256], quadrant: QuadrantType.BIO_BIO, product: 'Kelsun', strategy: 'Yarn derived from abundant seaweed polymers.' },
  { id: 'loliware', name: 'Loliware', location: 'San Francisco, CA', coords: [37.7749, -122.4194], quadrant: QuadrantType.BIO_BIO, product: 'Seaweed Straws', strategy: 'Edible and hyper-compostable utensils.' },
  { id: 'livingink', name: 'Living Ink', location: 'Aurora, CO', coords: [39.7294, -104.8319], quadrant: QuadrantType.BIO_BIO, product: 'Algae Ink', strategy: 'Carbon negative black pigment from algae waste.' },
  { id: 'huue', name: 'Huue', location: 'Berkeley, CA', coords: [37.8715, -122.2730], quadrant: QuadrantType.NEXT_GEN, product: 'Bio-Indigo', strategy: 'Biosynthetic indigo dye for denim.' },
  { id: 'danimer', name: 'Danimer Scientific', location: 'Bainbridge, GA', coords: [30.9038, -84.5755], quadrant: QuadrantType.BIO_BIO, product: 'Nodax PHA', strategy: 'Canola oil fermentation into PHA.' },
  { id: 'newlight', name: 'Newlight Tech', location: 'Huntington Beach, CA', coords: [33.6603, -117.9992], quadrant: QuadrantType.NEXT_GEN, product: 'AirCarbon', strategy: 'Methane capture to PHB.' },
  { id: 'ecovative', name: 'Ecovative', location: 'Green Island, NY', coords: [42.7427, -73.6936], quadrant: QuadrantType.NEXT_GEN, product: 'Mycelium Foundry', strategy: 'Aerial mycelium tech for foams and bacon.' },
  { id: 'cruzfoam', name: 'Cruz Foam', location: 'Santa Cruz, CA', coords: [36.9741, -122.0308], quadrant: QuadrantType.BIO_BIO, product: 'Chitin Foam', strategy: 'Shrimp shell waste into EPS alternative.' },
  { id: 'mango', name: 'Mango Materials', location: 'San Francisco, CA', coords: [37.7749, -122.4194], quadrant: QuadrantType.BIO_BIO, product: 'YOPP PHA', strategy: 'Methane-fed bacteria producing PHA pellets.' },
  { id: 'natureworks', name: 'NatureWorks', location: 'Minnetonka, MN', coords: [44.9778, -93.2650], quadrant: QuadrantType.BIO_BIO, product: 'Ingeo PLA', strategy: 'World\'s largest PLA producer.' },
  { id: 'origin', name: 'Origin Materials', location: 'West Sacramento, CA', coords: [38.5805, -121.5302], quadrant: QuadrantType.BIO_DURABLE, product: 'Carbon Negative PET', strategy: 'Wood residue to paraxylene.' },
  { id: 'ginko', name: 'Ginkgo Bioworks', location: 'Boston, MA', coords: [42.3601, -71.0589], quadrant: QuadrantType.NEXT_GEN, product: 'Cell Engineering', strategy: 'The platform for bio-design.' },
  { id: 'modern', name: 'Modern Meadow', location: 'Nutley, NJ', coords: [40.8223, -74.1599], quadrant: QuadrantType.NEXT_GEN, product: 'Bio-Freas', strategy: 'Bio-collagen proteins.' },
  { id: 'footprint', name: 'Footprint', location: 'Gilbert, AZ', coords: [33.3528, -111.7890], quadrant: QuadrantType.BIO_BIO, product: 'Fiber Cups', strategy: 'Molded fiber technology to eliminate single-use plastic.' },

  // --- EUROPE ---
  { id: 'notpla', name: 'Notpla', location: 'London, UK', coords: [51.5323, -0.0555], quadrant: QuadrantType.BIO_BIO, product: 'Ooho', strategy: 'Edible seaweed membranes for liquids.' },
  { id: 'paboco', name: 'Paboco', location: 'Slangerup, Denmark', coords: [55.8456, 12.1729], quadrant: QuadrantType.BIO_BIO, product: 'Paper Bottle', strategy: 'Bio-barrier coated paper bottles.' },
  { id: 'mogu', name: 'Mogu', location: 'Inarzo, Italy', coords: [45.7866, 8.6700], quadrant: QuadrantType.NEXT_GEN, product: 'Fungal Flooring', strategy: 'Mycelium acoustic panels and floors.' },
  { id: 'vegea', name: 'Vegea', location: 'Milan, Italy', coords: [45.4642, 9.1900], quadrant: QuadrantType.BIO_BIO, product: 'Wine Leather', strategy: 'Grape marc (wine waste) into leather alternative.' },
  { id: 'ananas', name: 'Ananas Anam', location: 'London, UK', coords: [51.5074, -0.1278], quadrant: QuadrantType.BIO_BIO, product: 'Piñatex', strategy: 'Pineapple leaf fibers.' },
  { id: 'amsilk', name: 'AMSilk', location: 'Munich, Germany', coords: [48.1351, 11.5820], quadrant: QuadrantType.NEXT_GEN, product: 'Biosteel', strategy: 'Recombinant spider silk proteins.' },
  { id: 'traceless', name: 'Traceless', location: 'Hamburg, Germany', coords: [53.5511, 9.9937], quadrant: QuadrantType.BIO_BIO, product: 'Plant Plastic', strategy: 'Agricultural residues into compostable granulate.' },
  { id: 'xampla', name: 'Xampla', location: 'Cambridge, UK', coords: [52.2053, 0.1218], quadrant: QuadrantType.BIO_BIO, product: 'Plant Protein Film', strategy: 'Supramolecular plant protein structures.' },
  { id: 'bcomp', name: 'Bcomp', location: 'Fribourg, Switzerland', coords: [46.8065, 7.1620], quadrant: QuadrantType.BIO_BIO, product: 'Amplitex', strategy: 'High performance flax composites for automotive.' },
  { id: 'spinnova', name: 'Spinnova', location: 'Jyväskylä, Finland', coords: [62.2426, 25.7473], quadrant: QuadrantType.BIO_BIO, product: 'Wood Fiber', strategy: 'Mechanical pulping of wood into textile fiber without harmful chemicals.' },
  { id: 'infinited', name: 'Infinited Fiber', location: 'Espoo, Finland', coords: [60.2055, 24.6559], quadrant: QuadrantType.BIO_DURABLE, product: 'Infinna', strategy: 'Regenerated cellulose from textile waste.' },
  { id: 'renewcell', name: 'Renewcell', location: 'Sundsvall, Sweden', coords: [62.3908, 17.3069], quadrant: QuadrantType.BIO_DURABLE, product: 'Circulose', strategy: 'Dissolving pulp from recycled cotton.' },
  { id: 'colorifix', name: 'Colorifix', location: 'Norwich, UK', coords: [52.6309, 1.2974], quadrant: QuadrantType.NEXT_GEN, product: 'DNA Dye', strategy: 'Microbes engineered to produce pigment.' },
  { id: 'carbios', name: 'Carbios', location: 'Clermont-Ferrand, France', coords: [45.7772, 3.0870], quadrant: QuadrantType.FOSSIL_BIO, product: 'Enzymatic Recycling', strategy: 'Enzymes that depolymerize PET indefinitely.' },
  { id: 'sulapac', name: 'Sulapac', location: 'Helsinki, Finland', coords: [60.1699, 24.9384], quadrant: QuadrantType.BIO_BIO, product: 'Wood Injection', strategy: 'Wood chips bound with plant based binders for injection molding.' },
  { id: 'avantium', name: 'Avantium', location: 'Amsterdam, NL', coords: [52.3676, 4.9041], quadrant: QuadrantType.BIO_DURABLE, product: 'PEF', strategy: 'Furanics based barrier polymer.' },
  { id: 'shellworks', name: 'The Shellworks', location: 'London, UK', coords: [51.5074, -0.11], quadrant: QuadrantType.NEXT_GEN, product: 'Vivomer', strategy: 'Bacterial cellulose packaging.' },
  { id: 'pili', name: 'Pili', location: 'Paris, France', coords: [48.8566, 2.3522], quadrant: QuadrantType.NEXT_GEN, product: 'Bio-Pigment', strategy: 'Fermented dyes to replace petrochemical colors.' },
  { id: 'basf', name: 'BASF', location: 'Ludwigshafen, DE', coords: [49.4875, 8.4660], quadrant: QuadrantType.FOSSIL_BIO, product: 'Ecoflex', strategy: 'PBAT standards for compostability.' },

  // --- ASIA ---
  { id: 'banofi', name: 'Banofi Leather', location: 'Kolkata, India', coords: [22.5726, 88.3639], quadrant: QuadrantType.BIO_BIO, product: 'Banana Leather', strategy: 'Upcycling banana crop waste into leather alternative.' },
  { id: 'spiber', name: 'Spiber', location: 'Tsuruoka, Japan', coords: [38.7236, 139.8256], quadrant: QuadrantType.NEXT_GEN, product: 'Brewed Protein', strategy: 'Fermented structural proteins for fibers.' },
  { id: 'bluepha', name: 'Bluepha', location: 'Beijing, China', coords: [39.9042, 116.4074], quadrant: QuadrantType.BIO_BIO, product: 'Bluepha PHA', strategy: 'Seawater fermentation of PHA.' },
  { id: 'kaneka', name: 'Kaneka', location: 'Osaka, Japan', coords: [34.6937, 135.5023], quadrant: QuadrantType.BIO_BIO, product: 'PHBH', strategy: 'Flexible PHA for home composting.' },
  { id: 'mitsubishi', name: 'Mitsubishi Chemical', location: 'Tokyo, Japan', coords: [35.6762, 139.6503], quadrant: QuadrantType.FOSSIL_BIO, product: 'BioPBS', strategy: 'Bio-succinic acid polyesters.' },
  { id: 'cj', name: 'CJ Biomaterials', location: 'Seoul, South Korea', coords: [37.5665, 126.9780], quadrant: QuadrantType.BIO_BIO, product: 'Amorphous PHA', strategy: 'Toughness modifier for PLA.' },
  { id: 'rwdc', name: 'RWDC Industries', location: 'Singapore', coords: [1.3521, 103.8198], quadrant: QuadrantType.BIO_BIO, product: 'Solon', strategy: 'PHA for replacing PP drinking straws.' },
  
  // --- SOUTH AMERICA ---
  { id: 'braskem', name: 'Braskem', location: 'São Paulo, Brazil', coords: [-23.5505, -46.6333], quadrant: QuadrantType.BIO_DURABLE, product: 'I\'m Green', strategy: 'Sugarcane ethanol to polyethylene.' },
  { id: 'polybion', name: 'Polybion', location: 'Guanajuato, Mexico', coords: [21.0190, -101.2574], quadrant: QuadrantType.NEXT_GEN, product: 'Celium', strategy: 'Bacterial cellulose leather grown on fruit waste.' },
  { id: 'desserto', name: 'Desserto', location: 'Guadalajara, Mexico', coords: [20.6597, -103.3496], quadrant: QuadrantType.BIO_BIO, product: 'Cactus Leather', strategy: 'Nopal cactus based vegan leather.' },

  // --- MIDDLE EAST / AFRICA / OCEANIA ---
  { id: 'ubq', name: 'UBQ Materials', location: 'Tel Aviv, Israel', coords: [32.0853, 34.7818], quadrant: QuadrantType.FOSSIL_BIO, product: 'UBQ', strategy: 'Converting unsorted household waste into thermoplastic.' },
  { id: 'tipa', name: 'Tipa', location: 'Hod Hasharon, Israel', coords: [32.1564, 34.8890], quadrant: QuadrantType.FOSSIL_BIO, product: 'Tipa Film', strategy: 'High performance compostable flexible films.' },
  { id: 'greatwrap', name: 'Great Wrap', location: 'Melbourne, Australia', coords: [-37.8136, 144.9631], quadrant: QuadrantType.BIO_BIO, product: 'Potato Wrap', strategy: 'Pallet wrap from potato waste.' },
  { id: 'samsara', name: 'Samsara Eco', location: 'Canberra, Australia', coords: [-35.2809, 149.1300], quadrant: QuadrantType.NEXT_GEN, product: 'Enzymatic Recycling', strategy: 'Infinite recycling of plastics via enzymes.' },
];

const MarketIntel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyNode | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | QuadrantType>('ALL');
  const [search, setSearch] = useState('');
  
  // Globe Refs
  const focusRef = useRef<[number, number]>([0, 0]);
  const phiRef = useRef(0);

  const filteredCompanies = companies.filter(c => {
    const matchesFilter = filter === 'ALL' || c.quadrant === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.product.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Globe Initialization
  useEffect(() => {
    let phi = 0;
    let width = 0;
    const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1],
      markerColor: [0.1, 0.1, 0.1],
      glowColor: [0.9, 0.9, 0.9],
      opacity: 0.85,
      markers: filteredCompanies.map(c => ({
        location: c.coords,
        size: selectedCompany?.id === c.id ? 0.08 : 0.03,
      })),
      onRender: (state) => {
        // Auto rotation logic
        if (!selectedCompany) {
            phi += 0.002;
        } else {
            // Smooth fly-to logic
            const targetPhi = -1 * (focusRef.current[1] * Math.PI) / 180 - Math.PI / 2;
            const dist = targetPhi - phi;
            phi += dist * 0.05;
        }
        state.phi = phi;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [selectedCompany, filteredCompanies]);

  const handleSelect = async (company: CompanyNode) => {
    setSelectedCompany(company);
    focusRef.current = company.coords;
    
    setLoading(true);
    try {
      const results = await searchMarketIntel(`Latest business news and partnerships for ${company.name} ${company.product} sustainable materials 2024 2025`);
      setNews(results);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const getQuadrantIcon = (type: QuadrantType) => {
    switch (type) {
      case QuadrantType.BIO_BIO: return <Leaf size={14} className="text-emerald-600" />;
      case QuadrantType.BIO_DURABLE: return <ShieldCheck size={14} className="text-orange-600" />;
      case QuadrantType.FOSSIL_BIO: return <Droplet size={14} className="text-amber-600" />;
      case QuadrantType.NEXT_GEN: return <Microscope size={14} className="text-teal-600" />;
    }
  };

  const getQuadrantColor = (type: QuadrantType) => {
    switch (type) {
      case QuadrantType.BIO_BIO: return 'bg-emerald-500';
      case QuadrantType.BIO_DURABLE: return 'bg-orange-500';
      case QuadrantType.FOSSIL_BIO: return 'bg-amber-500';
      case QuadrantType.NEXT_GEN: return 'bg-teal-500';
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col animate-fade-in relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      
      {/* 3D Globe Canvas */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-gray-50/30">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', maxWidth: '800px', aspectRatio: '1' }}
          className="cursor-move"
        />
      </div>

      {/* Header / Filters Overlay */}
      <div className="absolute top-6 left-6 right-6 z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pointer-events-none">
        <div className="pointer-events-auto">
            <div className="flex items-center gap-2 text-indigo-600 mb-1 font-bold text-sm uppercase tracking-wider">
               <Globe size={16} /> Planetary Intelligence
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Global Strategy Map</h1>
        </div>
        
        <div className="flex flex-wrap gap-2 pointer-events-auto bg-white/80 backdrop-blur-md p-2 rounded-xl border border-gray-200 shadow-sm">
           <button 
             onClick={() => setFilter('ALL')}
             className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === 'ALL' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
           >
             ALL
           </button>
           <button 
             onClick={() => setFilter(QuadrantType.BIO_BIO)}
             className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${filter === QuadrantType.BIO_BIO ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-100'}`}
           >
             <div className="w-2 h-2 rounded-full bg-emerald-500"></div> BIO-BIO
           </button>
           <button 
             onClick={() => setFilter(QuadrantType.BIO_DURABLE)}
             className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${filter === QuadrantType.BIO_DURABLE ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}
           >
             <div className="w-2 h-2 rounded-full bg-orange-500"></div> DURABLE
           </button>
           <button 
             onClick={() => setFilter(QuadrantType.NEXT_GEN)}
             className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${filter === QuadrantType.NEXT_GEN ? 'bg-teal-100 text-teal-700' : 'text-gray-500 hover:bg-gray-100'}`}
           >
             <div className="w-2 h-2 rounded-full bg-teal-500"></div> NEXT-GEN
           </button>
        </div>
      </div>

      {/* Search Bar Overlay */}
      <div className="absolute top-28 left-6 z-20 w-64 pointer-events-auto">
         <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Find company..."
               className="w-full bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
         </div>
      </div>

      {/* Right Sidebar: Company List */}
      <div className="absolute right-6 top-24 bottom-6 w-80 bg-white/90 backdrop-blur-xl border border-white/50 shadow-notion rounded-2xl flex flex-col z-20 overflow-hidden">
         <div className="p-4 border-b border-gray-100 bg-white/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
               <Navigation size={14} /> {filteredCompanies.length} Active Players
            </h3>
            {search && (
               <button onClick={() => setSearch('')} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                  <X size={12} /> Clear
               </button>
            )}
         </div>
         
         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredCompanies.map(c => (
               <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group ${
                     selectedCompany?.id === c.id 
                       ? 'bg-white shadow-md ring-1 ring-gray-200 scale-[1.02] z-10' 
                       : 'hover:bg-white/60 hover:scale-[1.02]'
                  }`}
               >
                  <div className={`w-1.5 h-8 rounded-full ${getQuadrantColor(c.quadrant)}`}></div>
                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between">
                        <div className="font-bold text-gray-800 text-sm truncate">{c.name}</div>
                        {selectedCompany?.id === c.id && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>}
                     </div>
                     <div className="text-[10px] text-gray-500 truncate">{c.location}</div>
                  </div>
               </button>
            ))}
         </div>
      </div>

      {/* Floating Detail Card (Bottom Left) */}
      {selectedCompany && (
         <div className="absolute left-6 bottom-6 w-96 bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-6 animate-fade-in z-30">
            <button 
              onClick={() => setSelectedCompany(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1"
            >
               <X size={16} />
            </button>
            
            <div className="flex items-center gap-3 mb-5">
               <div className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-100 text-indigo-600">
                  <Factory size={24} />
               </div>
               <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-none mb-1">{selectedCompany.name}</h2>
                  <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                     <MapPin size={10} /> {selectedCompany.location}
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase mb-1">
                        {getQuadrantIcon(selectedCompany.quadrant)} Quadrant
                     </div>
                     <div className="text-xs font-bold text-gray-800">{selectedCompany.quadrant}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                     <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Core Product</div>
                     <div className="text-xs font-bold text-gray-800 truncate" title={selectedCompany.product}>{selectedCompany.product}</div>
                  </div>
               </div>

               <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Strategic Focus</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedCompany.strategy}</p>
               </div>

               <div>
                  <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                        <Zap size={10} /> Live Intelligence Feed
                     </div>
                     {loading && <Loader2 size={12} className="animate-spin text-indigo-500" />}
                  </div>
                  
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                     {!loading && news.length === 0 && (
                        <div className="text-xs text-gray-400 italic p-2 text-center">Select to load intel.</div>
                     )}
                     {news.map((n, i) => (
                        <a key={i} href={n.url} target="_blank" rel="noreferrer" className="block p-2.5 bg-white rounded-lg border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all group">
                           <div className="text-xs font-medium text-gray-800 line-clamp-1 group-hover:text-indigo-600">{n.title}</div>
                           <div className="flex justify-between mt-1">
                              <div className="text-[10px] text-gray-400">{n.source}</div>
                              <ExternalLink size={10} className="text-gray-300 group-hover:text-indigo-400" />
                           </div>
                        </a>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default MarketIntel;
