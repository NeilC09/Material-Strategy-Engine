
export enum QuadrantType {
  BIO_BIO = 'BIO_BIO',
  BIO_DURABLE = 'BIO_DURABLE',
  FOSSIL_BIO = 'FOSSIL_BIO',
  NEXT_GEN = 'NEXT_GEN',
}

export interface QuadrantInfo {
  id: QuadrantType;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  definition: string;
  logic: string;
  players: string[];
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface AnalysisResult {
  quadrant: QuadrantType;
  summary: string;
  engineeringLogic: {
    compounding: string;
    processing: string;
    system: string;
  };
  constraints: string[];
}

export interface NewsItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date?: string;
}

export interface IntelBriefing {
  date: string;
  summary: string;
  commercialMoves: NewsItem[];
  researchBreakthroughs: NewsItem[];
  policyUpdates: NewsItem[];
}

export interface Patent {
  title: string;
  number: string;
  assignee: string;
  snippet: string;
  url: string;
  date?: string;
}

export interface MaterialProperty {
  name: string;
  density: number; // g/cm3
  tensileStrength: number; // MPa
  elongation: number; // %
  cost: number; // $/kg
  carbonFootprint: number; // kg CO2e/kg
  waterUsage: number; // L/kg
  biodegradability: number; // 0-100 score
}

export interface ProcessParameter {
  name: string;
  unit: string;
  standardVal: string;
  bioVal: string;
  insight: string;
}

export interface ManufacturingProcess {
  id: string;
  name: string;
  icon: any;
  description: string;
  outputs: string[];
  runLogic: string; // General description of process
  parameters?: ProcessParameter[];
}

export interface MaterialRecipe {
  name: string;
  quadrant: QuadrantType;
  description: string;
  ingredients: { name: string; percentage: string; function: string }[];
  properties: { name: string; value: string }[];
  sustainabilityScore: number;
  applications: string[];
  // NEW: Fields for Patent Extraction
  processingSteps?: string[]; // "How to Cook"
  variations?: { name: string; description: string }[]; // "Chef's Notes"
}

export interface LibraryItem extends MaterialRecipe {
  id: string;
  dateCreated: Date;
  image?: string; // Base64
  category: string; // e.g., "Mycelium Composites"
}

export interface MaterialFamily {
  name: string;
  description: string;
  commonGrades: string[];
  readiness?: number; // 0-100
  innovators?: string[];
}

export interface Manufacturer {
  name: string;
  product: string;
  location: string;
  description: string;
  website: string;
}

// NEW: Unified Project State for Workstation
export interface ProjectState {
  id: string;
  name: string;
  status: 'ideation' | 'analyzing' | 'production_ready';
  lastModified: Date;
  recipe?: MaterialRecipe;
  analysis?: AnalysisResult;
  image?: string;
  selectedProcess?: string;
}

export interface SharedContext {
  material?: string; // For Analyzer and Factory
  query?: string;    // For Patents
  problem?: string;  // For Innovation Lab
  workstationStep?: 'design' | 'analyze' | 'build'; // To navigate directly to a specific lab
}

// NEW: 3D Visualization Data Structure for Plotly
export interface VisualizationData {
  data: any[]; // Plotly Data Array
  layout: any; // Plotly Layout Object
  explanation?: string;
}
