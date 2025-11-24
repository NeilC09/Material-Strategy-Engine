
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, NewsItem, Patent, MaterialRecipe, MaterialFamily, Manufacturer, IntelBriefing, ChatMessage, VisualizationData } from '../types';

const apiKey = process.env.API_KEY || '';

if (!apiKey) {
  console.warn("Material Strategy Engine: API_KEY is missing. Please set the API_KEY environment variable for the app to function.");
}

const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
# SYSTEM ROLE: HYBRID MATERIAL STRATEGY ENGINE

**OBJECTIVE:** You are a dual-mode intelligence for the "Mega Materials Strategy Design Program." You must dynamically switch between two personas based on the user's request.

---

## 🧠 MODE A: SENIOR PROCESS & APPLICATION ENGINEER (AS2D ENGINE)
**TRIGGER:** Default mode. Use this when the user is interacting with the Dashboard, Factory Sliders, or requesting textual analysis/JSON data.

**CORE DIRECTIVE:** Do not accept generic parameters. When a user selects a process, you must enforce the definition of specific **"Knobs"** (Process Inputs) and calculate the resulting **"Care-Abouts"** (Application Outputs) based on the physics defined below.

### 🏭 MODULE 1: PROCESS DEFINITIONS & LOGIC

#### 1. FIBER SPINNING (Melt Spinning)
* **Context:** Apparel, Non-wovens.
* **REQUIRED KNOBS (Inputs):**
    * \`Zone Temps [Z1, Z2, Z3, Die]\` (°C): Profile matters. (e.g., Reverse profile for PLA to prevent feed throat bridging).
    * \`Spin Pack Pressure\` (bar): Proxy for filter clogging/viscosity changes.
    * \`Quench Air\` (Velocity m/s & Temp °C): Controls crystallinity rate.
    * \`Godet Speeds\` (m/min): $S_1$ (Feed), $S_2$ (Draw), $S_3$ (Relax).
    * \`Calculated Draw Ratio (DR)\`: $S_2 / S_1$.
* **ENGINEERING LOGIC:**
    * IF \`DR\` is high (>4) AND \`Quench\` is low: Risk of **"Fused Filaments"**.
    * IF \`Relaxation\` is <2%: Predict High **"Boiling Water Shrinkage (BWS)"**.
* **OUTPUT METRICS:** Denier (DPF), Tenacity (g/den), Elongation (%).

#### 2. INJECTION MOLDING
* **Context:** Rigid parts (Casings, Cutlery).
* **REQUIRED KNOBS (Inputs):**
    * \`Barrel Profile\` (Rear, Middle, Front, Nozzle).
    * \`Injection Velocity\` (mm/s): Controls shear rate.
    * \`Pack & Hold Pressure\` (% of Inj Press): Critical for compensation.
    * \`Cooling Time\` (sec): Dominates cycle time.
    * \`Back Pressure\` (bar): Controls melt homogeneity.
* **ENGINEERING LOGIC:**
    * IF \`Inj Velocity\` is too high: Predict **"Shear Burn/Splay"** (especially for PHAs).
    * IF \`Hold Pressure\` < 50% of \`P_inj\`: Predict **"Sink Marks"** or **"High Shrinkage"**.
    * IF \`Clamp Force\` < \`Cavity Pressure\` * Area: Predict **"Flash"**.
* **OUTPUT METRICS:** Dimensional Tolerance, Weld Line Strength, Surface Finish.

#### 3. BLOWN FILM
* **Context:** Compost bags, Mulch film.
* **REQUIRED KNOBS (Inputs):**
    * \`Blow-Up Ratio (BUR)\`: Target 2.5:1.
    * \`Take-Up Speed\` (m/min).
    * \`Frost Line Height (FLH)\` (mm): Distance to solidification.
    * \`Die Gap\` (mm).
* **ENGINEERING LOGIC:**
    * IF \`BUR\` < 2.0: Low **"TD Tear Strength"** (Bag splits easily sideways).
    * IF \`FLH\` is unstable (bouncing): Predict **"Gauge Variation"** (Uneven thickness).
    * IF \`Die Temp\` is too low: Predict **"Melt Fracture/Sharkskin"**.
* **OUTPUT METRICS:** Dart Drop Impact, Elmendorf Tear (MD/TD), Haze/Gloss.

#### 4. POLYMER FOAMING (Supercritical)
* **Context:** Shoe soles, Insulation.
* **REQUIRED KNOBS (Inputs):**
    * \`Saturation Pressure\` (MPa): Gas loading ($CO_2/N_2$).
    * \`Depressurization Rate\` (dP/dt): Nucleation trigger.
    * \`Soaking Temp\` (°C).
* **ENGINEERING LOGIC:**
    * IF \`dP/dt\` is SLOW: Low cell density, large bubbles (Poor insulation).
    * IF \`Soaking Temp\` > \`Tg\` + 50°C: Foam collapse (Coalescence).
* **OUTPUT METRICS:** Cell Density (cells/cm³), Void Fraction (%), Compression Set.

#### 5. BIO-ASSEMBLY (Mycelium)
* **Context:** Packaging, Structural bio-materials.
* **REQUIRED KNOBS (Inputs):**
    * \`Substrate C:N Ratio\`: (e.g., 30:1).
    * \`Inoculation Rate\` (wt%).
    * \`Growth Environment\`: Temp (°C), RH (%), $CO_2$ (ppm).
    * \`Baking Temp\` (Inactivation).
* **ENGINEERING LOGIC:**
    * IF \`$CO_2\` > 5000ppm: Predict **"Stifled Growth"** (Need more Air Exchange).
    * IF \`RH\` < 85%: Predict **"Desiccation/Premature Dormancy"**.
* **OUTPUT METRICS:** Compressive Modulus, Water Uptake, Density.

#### 6. 📰 LATEST INTELLIGENCE FEED
* **Trigger:** When asked for "Research", "News", "Updates", or "Intel".
* **Source:** Use Google Search Grounding.
* **Format:** List top 5 relevant articles with Title, Source, Date, and a 1-sentence technical summary.
`;

const VISUALIZATION_SYSTEM_INSTRUCTION = `
You are a 3D Visualization Engine.
Your goal is to generate Plotly.js JSON data for manufacturing simulations.

CRITICAL CONSTRAINTS:
1. OUTPUT JSON ONLY. No markdown, no explanations outside the JSON object.
2. LOW RESOLUTION: Max 10x10 grids for surfaces. Max 20 points for scatters.
3. ROUND NUMBERS: 2 decimal places max.

REQUIRED JSON STRUCTURE:
{
  "data": [
    {
      "type": "surface",
      "z": [[1, 2], [3, 4]],
      "colorscale": "Viridis",
      "name": "Process Geometry"
    }
  ],
  "layout": {
    "title": { "text": "Simulation Title", "font": { "color": "#fff" } },
    "paper_bgcolor": "rgba(0,0,0,0)",
    "plot_bgcolor": "rgba(0,0,0,0)",
    "scene": {
       "xaxis": { "title": "X", "color": "#fff" },
       "yaxis": { "title": "Y", "color": "#fff" },
       "zaxis": { "title": "Z", "color": "#fff" }
    }
  },
  "explanation": "Short 1-sentence engineering summary."
}
`;

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to clean Markdown JSON blocks
function cleanJsonText(text: string): string {
  if (!text) return '{}';
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json/, '').replace(/```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```/, '').replace(/```$/, '');
  }
  return clean.trim();
}

// --- SERVICE FUNCTIONS ---

export async function getChatResponse(message: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "System Error: Unable to process request.";
  }
}

export async function analyzeMaterial(materialName: string): Promise<AnalysisResult> {
  const prompt = `Analyze the material "${materialName}" for a material science dashboard.
  Return a JSON object with:
  - quadrant: "BIO_BIO", "BIO_DURABLE", "FOSSIL_BIO", or "NEXT_GEN"
  - summary: A technical executive summary (2 sentences).
  - engineeringLogic: { compounding: string, processing: string, system: string } (Technical details)
  - constraints: string[] (List of 3-5 critical manufacturing risks)
  
  Do not return markdown formatting, just the raw JSON string.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
}

export async function generateMaterialImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `Generate a photorealistic material close-up: ${prompt}. Cinematic lighting, macro photography style.`,
    });
    
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    return ''; 
  } catch (error) {
    console.error("Image Gen Error:", error);
    return '';
  }
}

export async function searchMarketIntel(query: string): Promise<NewsItem[]> {
  try {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Find the latest technical news and market updates regarding: ${query}. Return a JSON array of 5 items with { title, url, snippet, source }. ensure the response is strictly valid JSON format.`,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let text = cleanJsonText(response.text || '[]');
    
    try {
        return JSON.parse(text);
    } catch {
        if (chunks) {
            return chunks.map((c: any) => ({
                title: c.web?.title || "Update",
                url: c.web?.uri || "#",
                snippet: "Source from Google Search",
                source: "Web"
            }));
        }
        return [];
    }
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
}

export async function getDailyIntelBriefing(): Promise<IntelBriefing> {
  const query = "Latest executive news in Bioplastics, PFAS regulations, and Polymer Science 2024-2025";
  try {
      const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: `Generate a daily intelligence briefing based on: ${query}. 
          Return a JSON object with:
          - date: string (Today's date)
          - summary: string (Executive summary)
          - commercialMoves: NewsItem[] (Business/M&A)
          - researchBreakthroughs: NewsItem[] (Science/Tech)
          - policyUpdates: NewsItem[] (Gov/Legal)
          
          NewsItem structure: { title, url, snippet, source }
          Ensure the response is strict JSON without markdown formatting.`,
          config: {
              tools: [{ googleSearch: {} }],
          }
      });
      
      const text = cleanJsonText(response.text || '{}');
      return JSON.parse(text);
  } catch (error) {
      console.error(error);
      return { date: new Date().toDateString(), summary: "Failed to load intel.", commercialMoves: [], researchBreakthroughs: [], policyUpdates: []};
  }
}

export async function askQuadrantQuestion(quadrantTitle: string, question: string): Promise<string> {
    return getChatResponse(`[Context: ${quadrantTitle} Sector] ${question}`);
}

export async function discoverEmergingPolymers(quadrantTitle: string): Promise<MaterialFamily[]> {
    const prompt = `Identify 3 emerging, cutting-edge material families in the ${quadrantTitle} sector that are not yet mainstream. 
    Return JSON: [{ name, description, commonGrades: string[], readiness: number (0-100), innovators: string[] }]`;
    
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '[]');
    } catch (e) {
        return [];
    }
}

export async function findManufacturers(process: string, material: string): Promise<Manufacturer[]> {
    const prompt = `Find top 4 global manufacturers or suppliers who specialize in ${process} of ${material}.
    Return JSON: [{ name, product, location, description, website }]. Ensure strict JSON format.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
            }
        });
        const text = cleanJsonText(response.text || '[]');
        return JSON.parse(text);
    } catch (e) {
        return [];
    }
}

export async function generateMaterialRecipe(problemStatement: string): Promise<MaterialRecipe> {
    const prompt = `Generate a detailed material formulation recipe to solve this problem: "${problemStatement}".
    Return JSON object: {
        name: string,
        quadrant: "BIO_BIO" | "BIO_DURABLE" | "FOSSIL_BIO" | "NEXT_GEN",
        description: string,
        ingredients: [{ name, percentage, function }],
        properties: [{ name, value }],
        sustainabilityScore: number (0-100),
        applications: string[],
        processingSteps: string[] (Detailed manufacturing steps),
        variations: [{ name, description }] (Alternative formulation options)
    }`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { 
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json' 
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export async function extractRecipeFromPatent(base64Pdf: string): Promise<MaterialRecipe> {
    const prompt = `Analyze this patent PDF. Extract the "Best Mode" formulation or the primary invention recipe.
    Return JSON object: {
        name: string (Patent Title/ID),
        quadrant: "NEXT_GEN",
        description: string (Abstract summary),
        ingredients: [{ name, percentage, function }],
        properties: [{ name, value }] (Claims data),
        sustainabilityScore: number (Estimate 0-100),
        applications: string[],
        processingSteps: string[] (Method of manufacture),
        variations: [{ name, description }] (Embodiments)
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { inlineData: { mimeType: 'application/pdf', data: base64Pdf } },
                { text: prompt }
            ],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export async function searchPatents(query: string): Promise<Patent[]> {
    const prompt = `Search for recent patents related to: ${query}. 
    Return JSON array: [{ title, number, assignee, snippet, url }]. Ensure strict JSON output.`;
    
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
            }
        });
        const text = cleanJsonText(response.text || '[]');
        return JSON.parse(text);
    } catch (e) {
        return [];
    }
}

export async function analyzePatentPdf(base64Pdf: string): Promise<AnalysisResult> {
    const prompt = `Analyze this patent document. Deconstruct the invention strategy.
    Return JSON: AnalysisResult structure (quadrant, summary, engineeringLogic, constraints)`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { inlineData: { mimeType: 'application/pdf', data: base64Pdf } },
                { text: prompt }
            ],
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        throw e;
    }
}

export async function chatWithPatentContext(message: string, base64Pdf: string, history: ChatMessage[]): Promise<string> {
    const context = history.map(m => `${m.role}: ${m.content}`).join('\n');
    const prompt = `Context: ${context}\nUser Question: ${message}\nAnswer based on the attached patent PDF.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { inlineData: { mimeType: 'application/pdf', data: base64Pdf } },
                { text: prompt }
            ]
        });
        return response.text || "No response generated.";
    } catch (e) {
        return "Error analyzing document.";
    }
}

// NEW: 3D Visualization Generator
export async function generateMachineSimulation(processName: string, parameters: Record<string, number>): Promise<VisualizationData> {
    const prompt = `Generate a 3D visualization for "${processName}" with parameters: ${JSON.stringify(parameters)}.
    
    IMPORTANT TO PREVENT ERRORS:
    - Use VERY LOW RESOLUTION grids (e.g. 10x10).
    - Round all numbers to 2 decimal places.
    - Keep JSON size small.
    
    STRICTLY return a JSON object with two keys:
    1. 'data': Array of Plotly trace objects (surface, mesh3d, scatter3d).
    2. 'layout': Plotly layout object (dark transparent bg).
    3. 'explanation': 1 sentence summary.

    DO NOT return Python code. Return raw JSON data.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: { 
                responseMimeType: 'application/json',
                systemInstruction: VISUALIZATION_SYSTEM_INSTRUCTION, // Use the lightweight instruction
                maxOutputTokens: 8192 
            }
        });
        
        let text = response.text || '{}';
        const result = JSON.parse(text);
        
        // Safety check for valid plotly structure
        if (!result.data || !Array.isArray(result.data)) {
             // Fallback if data is missing but layout exists (rare, but avoids crash)
             if (result.layout) {
                 result.data = [];
                 result.explanation = result.explanation || "No visual data generated.";
             } else {
                 throw new Error("Invalid visualization format");
             }
        }
        
        return result;
    } catch (error) {
        console.error("3D Sim Error:", error);
        // Fallback to prevent crash
        return {
            data: [],
            layout: { 
                title: { text: "Simulation Data Error - Try simplifying parameters" },
                paper_bgcolor: 'rgba(0,0,0,0)', 
                plot_bgcolor: 'rgba(0,0,0,0)'
            },
            explanation: "The AI generated data was too complex to parse. Please try again."
        };
    }
}
