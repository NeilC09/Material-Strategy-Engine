
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AnalysisResult, NewsItem, Patent, MaterialRecipe, MaterialFamily, Manufacturer, IntelBriefing, ChatMessage, VisualizationData, LCAData, ResearchReportData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
# SYSTEM ROLE: HYBRID MATERIAL STRATEGY ENGINE
**OBJECTIVE:** You are a senior industrial intelligence for the "Mega Materials Strategy Design Program."

## 🏭 PROCESS LOGIC
Enforce specific "Knobs" (Inputs) and "Care-Abouts" (Outputs) for:
1. FIBER SPINNING: Knobs: Zone Temps, Draw Ratio, Quench. Outputs: Tenacity, Denier.
2. INJECTION MOLDING: Knobs: Velocity, Pack Pressure, Cool Time. Outputs: Tolerance, Flash.
3. THERMOFORMING: Knobs: Sheet Temp, Vacuum, Cycle Time. Outputs: Wall Thinning, Sag.
4. FOAMING: Knobs: Gas Saturation, Depressurization. Outputs: Cell Density.
5. BIO-ASSEMBLY: Knobs: C:N Ratio, RH, CO2. Outputs: Modulus.

## 📰 GROUNDING
Use Google Search for all market intel, PFAS regulations, and patent searches.
`;

const DESIGNER_SYSTEM_INSTRUCTION = `
# SYSTEM ROLE: CMF & INDUSTRIAL DESIGN EXPERT
**OBJECTIVE:** You are a specialized aesthetic consultant for physical product design.
**TONE:** Sophisticated, sensory, trend-aware (CMF), and user-centric.

## 🎨 FOCUS AREAS
1. **Sensory:** Tactility, acoustics, thermal haptics, light interaction (translucency, scattering).
2. **Aesthetics:** Surface finish (EDM texture, polish), color trends (Pantone/NCS), aging (patina).
3. **Storytelling:** Marketing narratives, user emotional connection.

When asked about materials, focus on *experience* rather than just *properties*.
`;

const VISUALIZATION_SYSTEM_INSTRUCTION = `
You are a 3D Geometry Engine for manufacturing simulations. 
Output Plotly.js JSON data ONLY. No markdown.

GEOMETRY STRATEGIES:
1. FIBER SPINNING: 
   - A vertical tapered tube (mesh3d or surface). 
   - Radius R(z) = R_die * exp(-k*z). 
   - Color: Temperature (Red to Cyan).
2. THERMOFORMING: 
   - A surface grid deforming into a cavity. 
   - Center Z depth increases. 
   - Color: Wall thickness (Thinner at base).
3. INJECTION MOLDING: 
   - Parabolic flow front in a 3D volume.
4. BIO-ASSEMBLY: 
   - Branching hyphal network (scatter3d lines).

CONSTRAINTS:
- LOW POLY: Max 12x12 grid.
- ROUNDED: 2 decimal places.
- NO EXPLANTION outside JSON.

JSON SCHEMA:
{
  "data": [{"type": "surface", "z": [[...]], "colorscale": "Plasma"}],
  "layout": {"paper_bgcolor": "rgba(0,0,0,0)", "plot_bgcolor": "rgba(0,0,0,0)", "scene": {"xaxis": {"color": "#fff"}}},
  "explanation": "Short summary."
}
`;

const MODEL_TEXT = 'gemini-3-flash-preview';
const MODEL_PRO = 'gemini-3-pro-preview';

function cleanJsonText(text: string): string {
  if (!text) return '{}';
  
  // 1. Try to extract from markdown code blocks
  const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (markdownMatch) {
    return markdownMatch[1].trim();
  }

  // 2. Locate the outermost JSON object/array
  const firstCurly = text.indexOf('{');
  const firstSquare = text.indexOf('[');
  
  let startIndex = -1;
  if (firstCurly !== -1 && firstSquare !== -1) {
    startIndex = Math.min(firstCurly, firstSquare);
  } else {
    startIndex = firstCurly !== -1 ? firstCurly : firstSquare;
  }

  if (startIndex === -1) return text.trim();

  const lastCurly = text.lastIndexOf('}');
  const lastSquare = text.lastIndexOf(']');
  const endIndex = Math.max(lastCurly, lastSquare);

  if (endIndex === -1 || endIndex < startIndex) return text.trim();

  return text.substring(startIndex, endIndex + 1);
}

function ensureArray<T>(val: any): T[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim()) as unknown as T[];
  return [];
}

export async function getChatResponse(message: string, mode: 'engineering' | 'design' = 'engineering'): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: message,
      config: { systemInstruction: mode === 'design' ? DESIGNER_SYSTEM_INSTRUCTION : SYSTEM_INSTRUCTION }
    });
    return response.text || "No response.";
  } catch (error) {
    return "API Error. Check configuration.";
  }
}

export async function generateResearchReport(query: string): Promise<ResearchReportData> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: `Generate a structured industrial intelligence report for: ${query}. Use Google Search to find 2024-2025 trends, consumer demand metrics, and technical barriers. Return raw JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            marketTrends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { trend: { type: Type.STRING }, impact: { type: Type.STRING } }
              }
            },
            consumerDemand: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { segment: { type: Type.STRING }, driver: { type: Type.STRING } }
              }
            },
            technicalBarriers: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyPlayers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, activity: { type: Type.STRING } }
              }
            },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, url: { type: Type.STRING } }
              }
            }
          }
        }
      }
    });
    const data = JSON.parse(cleanJsonText(response.text));
    return {
      ...data,
      marketTrends: ensureArray(data.marketTrends),
      consumerDemand: ensureArray(data.consumerDemand),
      technicalBarriers: ensureArray(data.technicalBarriers),
      keyPlayers: ensureArray(data.keyPlayers),
      sources: ensureArray(data.sources),
    };
  } catch (error) {
    console.error("Research Report Error:", error);
    throw error;
  }
}

export async function analyzeMaterial(materialName: string): Promise<AnalysisResult> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `Analyze ${materialName}. Ensure "constraints" is a string array. Return raw JSON: { quadrant, summary, engineeringLogic: { compounding, processing, system }, constraints: string[] }`,
      config: { responseMimeType: 'application/json', systemInstruction: SYSTEM_INSTRUCTION }
    });
    const data = JSON.parse(cleanJsonText(response.text || '{}'));
    return {
      ...data,
      constraints: ensureArray(data.constraints)
    };
  } catch (error) {
    console.error("Analysis Parse Error:", error);
    throw error;
  }
}

export async function generateMaterialImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `Photorealistic industrial material close-up, studio lighting, macro photography, 8k texture: ${prompt}.`,
    });
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    return part ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : '';
  } catch { return ''; }
}

export async function estimateLCA(materialName: string): Promise<LCAData> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `Estimate Life Cycle Assessment (LCA) data for: ${materialName}. 
      Compare against: ABS, Aluminum, PET.
      JSON Schema: { carbonFootprint: number (kgCO2e/kg), waterUsage: number (L/kg), energyConsumption: number (MJ/kg), circularityScore: number (0-10), comparison: [{ material: string, carbon: number }], verdict: string }`,
      config: { responseMimeType: 'application/json' }
    });
    const data = JSON.parse(cleanJsonText(response.text || '{}'));
    return {
      ...data,
      comparison: ensureArray(data.comparison)
    };
  } catch {
    return { carbonFootprint: 0, waterUsage: 0, energyConsumption: 0, circularityScore: 0, comparison: [], verdict: "LCA Data Unavailable" };
  }
}

export async function generateCMFDescription(materialName: string, finish: string, color: string): Promise<string> {
   const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `Describe the aesthetic properties of ${materialName} with a ${finish} finish in ${color}. Focus on light interaction, texture, and haptics. Keep it under 30 words.`
   });
   return response.text || "";
}

export async function searchMarketIntel(query: string): Promise<NewsItem[]> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: query,
      config: { tools: [{ googleSearch: {} }] }
    });
    const text = cleanJsonText(response.text || '[]');
    try { return ensureArray(JSON.parse(text)); } catch { return []; }
  } catch { return []; }
}

export async function getDailyIntelBriefing(): Promise<IntelBriefing> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: "Daily bioplastics and PFAS regulatory briefing. Return JSON with commercialMoves, researchBreakthroughs, and policyUpdates as arrays.",
      config: { tools: [{ googleSearch: {} }], responseMimeType: 'application/json' }
    });
    const data = JSON.parse(cleanJsonText(response.text));
    return {
      ...data,
      commercialMoves: ensureArray(data.commercialMoves),
      researchBreakthroughs: ensureArray(data.researchBreakthroughs),
      policyUpdates: ensureArray(data.policyUpdates),
    };
  } catch {
    return { date: new Date().toDateString(), summary: "Offline", commercialMoves: [], researchBreakthroughs: [], policyUpdates: [] };
  }
}

export async function askQuadrantQuestion(quadrantTitle: string, question: string): Promise<string> {
  return getChatResponse(`[Context: ${quadrantTitle}] ${question}`);
}

export async function discoverEmergingPolymers(quadrantTitle: string): Promise<MaterialFamily[]> {
  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents: `List 3 emerging polymer families in ${quadrantTitle}. commonGrades MUST be a JSON string array. JSON: [{name, description, commonGrades: string[], readiness}]`,
    config: { responseMimeType: 'application/json' }
  });
  const data = JSON.parse(cleanJsonText(response.text || '[]'));
  return ensureArray(data).map((item: any) => ({
    ...item,
    commonGrades: ensureArray(item.commonGrades)
  }));
}

export async function findManufacturers(process: string, material: string): Promise<Manufacturer[]> {
  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents: `Find 4 manufacturers for ${process} of ${material}. Return a JSON array of objects.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  return ensureArray(JSON.parse(cleanJsonText(response.text)));
}

export async function generateMaterialRecipe(problem: string): Promise<MaterialRecipe> {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: `Generate recipe for: ${problem}. Ensure ingredients, properties, applications, and processingSteps are JSON arrays.`,
    config: { responseMimeType: 'application/json', systemInstruction: SYSTEM_INSTRUCTION }
  });
  const data = JSON.parse(cleanJsonText(response.text));
  return {
    ...data,
    ingredients: ensureArray(data.ingredients),
    properties: ensureArray(data.properties),
    applications: ensureArray(data.applications),
    processingSteps: ensureArray(data.processingSteps),
    variations: ensureArray(data.variations)
  };
}

export async function extractRecipeFromPatent(base64: string): Promise<MaterialRecipe> {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: [{ inlineData: { mimeType: 'application/pdf', data: base64 } }, { text: "Extract recipe JSON. Ensure all list fields are arrays." }],
    config: { responseMimeType: 'application/json' }
  });
  const data = JSON.parse(cleanJsonText(response.text));
  return {
    ...data,
    ingredients: ensureArray(data.ingredients),
    properties: ensureArray(data.properties),
    applications: ensureArray(data.applications),
    processingSteps: ensureArray(data.processingSteps),
    variations: ensureArray(data.variations)
  };
}

export async function searchPatents(query: string): Promise<Patent[]> {
  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents: `Search patents: ${query}. Return a JSON array of objects.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  return ensureArray(JSON.parse(cleanJsonText(response.text)));
}

export async function analyzePatentPdf(base64: string): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: [{ inlineData: { mimeType: 'application/pdf', data: base64 } }, { text: "Analyze strategy JSON. Ensure constraints is an array." }],
    config: { responseMimeType: 'application/json' }
  });
  const data = JSON.parse(cleanJsonText(response.text));
  return {
    ...data,
    constraints: ensureArray(data.constraints)
  };
}

export async function chatWithPatentContext(message: string, base64: string, history: ChatMessage[]): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents: [{ inlineData: { mimeType: 'application/pdf', data: base64 } }, { text: message }]
  });
  return response.text || "Error.";
}

export async function generateMachineSimulation(processName: string, parameters: Record<string, number>): Promise<VisualizationData> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: `Simulate ${processName} with ${JSON.stringify(parameters)}. Output Plotly JSON ONLY.`,
      config: { systemInstruction: VISUALIZATION_SYSTEM_INSTRUCTION }
    });
    
    const result = JSON.parse(cleanJsonText(response.text));
    if (!result.data) throw new Error("Missing data");
    return {
      ...result,
      data: ensureArray(result.data)
    };
  } catch (error) {
    console.error("Simulation Error:", error);
    return {
      data: [{ type: 'scatter3d', x: [0, 1], y: [0, 1], z: [0, 1], mode: 'lines', line: { color: '#06b6d4' } }],
      layout: { paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', title: { text: "Fallback Render", font: { color: '#fff' } } },
      explanation: "Complex physics triggered a safety fallback. Try simplifying parameters."
    };
  }
}
