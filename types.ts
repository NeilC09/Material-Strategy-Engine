
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

export interface ResearchReportData {
  title: string;
  summary: string;
  marketTrends: { trend: string; impact: string }[];
  consumerDemand: { segment: string; driver: string }[];
  technicalBarriers: string[];
  keyPlayers: { name: string; activity: string }[];
  sources: { title: string; url: string }[];
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
  processingSteps?: string[];
  variations?: { name: string; description: string }[];
}

export interface LibraryItem extends MaterialRecipe {
  id: string;
  dateCreated: Date;
  image?: string; // Base64
  category: string;
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

// NEW: LCA Data for EcoImpact
export interface LCAData {
  carbonFootprint: number; // kg CO2e / kg
  waterUsage: number; // L / kg
  circularityScore: number; // 0-10
  energyConsumption: number; // MJ / kg
  comparison: {
     material: string;
     carbon: number; // relative % or absolute
  }[];
  verdict: string;
}

// NEW: CMF Data
export interface CMFVariant {
  id: string;
  name: string;
  finish: string; // Relaxed from union type to string to support combinations (e.g. "Matte Sandblasted")
  color: string;
  description: string;
  imageUrl?: string;
}

export interface ProjectState {
  id: string;
  name: string;
  status: 'ideation' | 'analyzing' | 'production_ready';
  lastModified: Date;
  recipe?: MaterialRecipe;
  analysis?: AnalysisResult;
  image?: string;
  selectedProcess?: string;
  lca?: LCAData;
  cmfVariants?: CMFVariant[];
}

export interface SharedContext {
  material?: string;
  query?: string;
  problem?: string;
  workstationStep?: 'design' | 'analyze' | 'build';
  researchReport?: ResearchReportData;
}

export interface VisualizationData {
  data: any[];
  layout: any;
  explanation?: string;
}
