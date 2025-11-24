
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
}

export interface Patent {
  title: string;
  number: string;
  assignee: string;
  snippet: string;
  url: string;
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
}

export interface Manufacturer {
  name: string;
  product: string;
  location: string;
  description: string;
  website: string;
}
