
import { GoogleGenAI, Chat } from "@google/genai";
import { AnalysisResult, NewsItem, Patent, MaterialRecipe, MaterialFamily, Manufacturer, IntelBriefing } from '../types';

const apiKey = process.env.API_KEY || '';

if (!apiKey) {
  console.warn("Material Strategy Engine: API_KEY is missing. Please set the API_KEY environment variable in Replit Secrets for the app to function.");
}

const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
**IDENTITY & CORE MISSION:**
You are the **Material Strategy Engine**, a specialized industrial intelligence designed to demystify sustainable materials.

**THE CORE FRAMEWORK (THE 3 PILLARS):**
1. **Advanced Compounding:** Polymer backbone modification.
2. **Application Engineering:** Processing at scale.
3. **System Intelligence:** Data usage (LCA, Traceability).

**THE MATERIAL ECOSYSTEM (THE 4 QUADRANTS):**
* **QUADRANT 1: BIO-BIO (Green)**: Biobased & Biodegradable.
* **QUADRANT 2: BIO-DURABLE (Rust)**: Biobased & Durable.
* **QUADRANT 3: FOSSIL-BIO (Sand)**: Fossil-based & Biodegradable.
* **QUADRANT 4: NEXT-GEN (Teal)**: Exotic / Biomimetic.

**BEHAVIORS:**
1. **REAL-TIME SEARCH:** Use Google Search for 2024-2025 data on companies/patents.
2. **MARKET FOCUS:** Focus on commercially available products and real-world companies.
3. **PLAIN TEXT:** Do not use markdown formatting (no bolding, no headers). Use clear paragraph breaks and bullet points (using hyphens) for readability.
4. **DEEP REASONING:** When analyzing complex engineering problems, think step-by-step through chemical and physical constraints.
`;

const THINKING_CONFIG = {
  thinkingBudget: 32768
};

// Helper to strip markdown and formatting artifacts
const cleanText = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')   // Remove bold
    .replace(/__(.*?)__/g, '$1')       // Remove italics
    .replace(/###\s?/g, '')            // Remove h3
    .replace(/##\s?/g, '')             // Remove h2
    .replace(/#\s?/g, '')              // Remove h1
    .replace(/^\s*[\*]\s/gm, '• ')     // Replace asterisk bullets with dots
    .replace(/^\s*-\s/gm, '• ')        // Replace dash bullets with dots
    .replace(/`/g, '')                 // Remove code ticks
    .trim();
};

// Chat Instance
let chatSession: Chat | null = null;

export const getChatResponse = async (message: string): Promise<string> => {
  try {
    if (!chatSession) {
      chatSession = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: THINKING_CONFIG
        }
      });
    }

    const result = await chatSession.sendMessage({ message });
    return cleanText(result.text || "System error: No response generated.");
  } catch (error) {
    console.error("Chat Error:", error);
    return "Error communicating with the Material Strategy Engine.";
  }
};

export const askQuadrantQuestion = async (quadrant: string, topic: string): Promise<string> => {
  try {
    const prompt = `
      Context: The user is analyzing the ${quadrant} material quadrant.
      Task: Provide a technical answer regarding: "${topic}".
      
      Keep it concise, data-driven, and focus on market realities for 2024-2025.
      Use plain text only, no markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: THINKING_CONFIG
      }
    });

    return cleanText(response.text || "No analysis generated.");
  } catch (error) {
    console.error("Quadrant Chat Error:", error);
    return "Service unavailable.";
  }
};

export const discoverEmergingPolymers = async (quadrant: string): Promise<MaterialFamily[]> => {
  try {
    const prompt = `
      Identify 3 emerging or novel polymer classes or specific high-performance grades within the "${quadrant}" material sector that are gaining traction in 2024-2025.
      Focus on materials that are cutting-edge or recently commercialized.
      
      Return ONLY a valid JSON array with this structure:
      [
        {
          "name": "Name of Material/Class",
          "description": "Brief technical description of what it is and why it is important.",
          "commonGrades": ["Example Grade 1", "Example Grade 2"]
        }
      ]
      
      Do not include markdown formatting.
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        thinkingConfig: THINKING_CONFIG
      }
    });

    const text = response.text || '[]';
    let raw: MaterialFamily[] = [];
    try {
        raw = JSON.parse(text);
    } catch (e) {
        const match = text.match(/\[[\s\S]*\]/);
        if (match) raw = JSON.parse(match[0]);
    }
    
    return Array.isArray(raw) ? raw.map(r => ({
        ...r,
        description: cleanText(r.description)
    })) : [];
  } catch (error) {
    console.error("Discovery Error:", error);
    return [];
  }
};

export const findManufacturers = async (process: string, material: string): Promise<Manufacturer[]> => {
  try {
    const prompt = `
      Find real-world companies that manufacture products using ${process} with ${material} (or similar sustainable materials).
      Focus on 2024-2025 active companies and specific consumer products available on the market.
      
      Return a JSON array of objects:
      [
        {
          "name": "Company Name",
          "product": "Specific product example",
          "location": "City/Country",
          "description": "Brief description of the product and market fit.",
          "website": "Website URL"
        }
      ]
      
      Use Google Search to find real data.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    let text = response.text || '[]';
    
    // Cleanup potential markdown
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Robust extraction of JSON array
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');

    if (startIndex !== -1 && endIndex !== -1) {
      text = text.substring(startIndex, endIndex + 1);
      const results = JSON.parse(text) as Manufacturer[];
      return results.map(r => ({
        ...r,
        description: cleanText(r.description)
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Manufacturer Discovery Error:", error);
    return [];
  }
};


export const analyzeMaterial = async (input: string): Promise<AnalysisResult> => {
  try {
    const prompt = `
      Analyze the following material/product request: "${input}".
      
      Provide a structured JSON response with the following fields:
      - quadrant: One of "BIO_BIO", "BIO_DURABLE", "FOSSIL_BIO", "NEXT_GEN".
      - summary: A brief technical summary (plain text, no markdown).
      - engineeringLogic: An object with keys "compounding", "processing", "system" containing specific logic (plain text).
      - constraints: An array of strings listing key constraints (plain text).
      
      Do not include markdown formatting in the response, just raw JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        thinkingConfig: THINKING_CONFIG
      }
    });

    const text = response.text || '{}';
    let rawResult: any = {};
    try {
        rawResult = JSON.parse(text);
    } catch (e) {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) rawResult = JSON.parse(match[0]);
    }

    const safeLogic = rawResult.engineeringLogic || {};

    return {
      quadrant: rawResult.quadrant || 'NEXT_GEN',
      summary: cleanText(rawResult.summary || 'No summary available.'),
      engineeringLogic: {
        compounding: cleanText(safeLogic.compounding || 'Analysis unavailable.'),
        processing: cleanText(safeLogic.processing || 'Analysis unavailable.'),
        system: cleanText(safeLogic.system || 'Analysis unavailable.'),
      },
      constraints: Array.isArray(rawResult.constraints) ? rawResult.constraints.map(cleanText) : []
    };

  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Failed to analyze material.");
  }
};

export const generateMaterialRecipe = async (problemStatement: string): Promise<MaterialRecipe> => {
  try {
    const prompt = `
      Act as a Chief Technology Officer in Material Science.
      Invent a novel sustainable material solution for this problem: "${problemStatement}".
      
      Generate a commercial "Material Profile".
      
      Return ONLY valid JSON matching this structure:
      {
        "name": "Trade Name",
        "quadrant": "BIO_BIO" | "BIO_DURABLE" | "FOSSIL_BIO" | "NEXT_GEN",
        "description": "Technical description of the composite.",
        "ingredients": [ {"name": "Ingredient", "percentage": "XX%", "function": "Why it is here"} ],
        "properties": [ {"name": "Property", "value": "Value"} ],
        "sustainabilityScore": 85,
        "applications": ["App 1", "App 2", "App 3"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        thinkingConfig: THINKING_CONFIG
      }
    });

    const text = response.text || '{}';
    let rawResult: any = {};
    try {
        rawResult = JSON.parse(text);
    } catch(e) {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) rawResult = JSON.parse(match[0]);
    }
    
    return {
      ...rawResult,
      name: rawResult.name || 'Unnamed Material',
      quadrant: rawResult.quadrant || 'NEXT_GEN',
      description: cleanText(rawResult.description || ''),
      ingredients: Array.isArray(rawResult.ingredients) ? rawResult.ingredients.map((i: any) => ({ ...i, function: cleanText(i.function) })) : [],
      properties: Array.isArray(rawResult.properties) ? rawResult.properties : [],
      sustainabilityScore: rawResult.sustainabilityScore || 0,
      applications: Array.isArray(rawResult.applications) ? rawResult.applications : [],
    };
  } catch (error) {
    console.error("Recipe Generation Error:", error);
    throw new Error("Failed to generate recipe.");
  }
};

export const generateMaterialImage = async (description: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `Photorealistic product design render of: ${description}. Focus on showing accurate material texture, surface finish, and physical form factor. Cinematic studio lighting, macro details, 8k resolution, raw material aesthetics.`,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '4:3',
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64ImageBytes) {
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return '';
  } catch (error) {
    console.error("Image Gen Error:", error);
    return '';
  }
};

export const searchMarketIntel = async (query: string): Promise<NewsItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find the latest technical news, patents, or market updates regarding: "${query}". Return a summary of the top 3-5 findings. Focus on 2024-2025 data.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a market intelligence researcher. Extract URLs and sources explicitly.",
      }
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const items: NewsItem[] = [];

    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        items.push({
          title: chunk.web.title || 'Unknown Source',
          url: chunk.web.uri || '#',
          snippet: 'Web Source',
          source: 'Google Search'
        });
      }
    });
    
    if (items.length === 0 && response.text) {
         items.push({
             title: "Generated Summary",
             url: "#",
             snippet: cleanText(response.text.substring(0, 200) + "..."),
             source: "Gemini Analysis"
         });
    }

    return items;
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
};

export const getDailyIntelBriefing = async (): Promise<IntelBriefing> => {
    try {
        const prompt = `
          Act as an Editor-in-Chief for a Material Science publication.
          Perform a broad search for the latest news in "Biomaterials", "Sustainable Polymers", "Bio-startups", and "Material Science Research" from the last 7 days (or recent 2024-2025 news).
          
          Synthesize the findings into a structured "Daily Briefing".
          Categorize the news into three specific arrays:
          1. commercialMoves: Funding, M&A, startups, product launches.
          2. researchBreakthroughs: Academic papers, university discoveries, new technologies.
          3. policyUpdates: Regulations, bans, government grants (EU/US/Asia).
          
          Return valid JSON:
          {
             "date": "Today's Date",
             "summary": "A 1-sentence executive summary of the day's vibe.",
             "commercialMoves": [ {"title": "...", "snippet": "...", "source": "...", "url": "..."} ],
             "researchBreakthroughs": [ {"title": "...", "snippet": "...", "source": "...", "url": "..."} ],
             "policyUpdates": [ {"title": "...", "snippet": "...", "source": "...", "url": "..."} ]
          }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
                thinkingConfig: THINKING_CONFIG
            }
        });

        const text = response.text || '{}';
        let raw: any = {};
        try {
            raw = JSON.parse(text);
        } catch (e) {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) raw = JSON.parse(match[0]);
        }

        // Helper to map and clean
        const mapItems = (arr: any[]) => Array.isArray(arr) ? arr.map(i => ({
            title: cleanText(i.title || 'Untitled'),
            snippet: cleanText(i.snippet || ''),
            source: cleanText(i.source || 'Web'),
            url: i.url || '#'
        })) : [];

        // Extract grounding links if JSON urls are empty (fallback)
        // Note: With responseMimeType=JSON and googleSearch, Gemini 3 Pro usually populates the fields correctly from the tool usage.
        
        return {
            date: raw.date || new Date().toLocaleDateString(),
            summary: cleanText(raw.summary || 'Daily briefing ready.'),
            commercialMoves: mapItems(raw.commercialMoves),
            researchBreakthroughs: mapItems(raw.researchBreakthroughs),
            policyUpdates: mapItems(raw.policyUpdates)
        };

    } catch (error) {
        console.error("Briefing Error:", error);
        throw new Error("Failed to generate briefing.");
    }
};

export const searchPatents = async (company: string): Promise<Patent[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find recent patents assigned to "${company}". List the top 3-5 most relevant patents.
      
      Return ONLY a valid JSON array of objects. 
      JSON Format: [{"title": "...", "number": "...", "assignee": "...", "snippet": "...", "url": "..."}]
      
      Do not use numbered lists. Do not include markdown formatting.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    let text = response.text || '[]';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');

    if (startIndex !== -1 && endIndex !== -1) {
      text = text.substring(startIndex, endIndex + 1);
      const patents = JSON.parse(text) as Patent[];
      return patents.map(p => ({
        ...p,
        title: cleanText(p.title),
        snippet: cleanText(p.snippet)
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Patent Search Error:", error);
    return [];
  }
};

export const analyzePatentPdf = async (base64Pdf: string): Promise<AnalysisResult> => {
  try {
    const prompt = `
      Analyze this patent document.
      Deconstruct the invention using the "3 Pillar Strategy":
      1. Advanced Compounding
      2. Application Engineering
      3. System Intelligence
      
      Also classify it into one of the 4 Quadrants.
      
      Return a valid JSON response matching this structure:
      {
        "quadrant": "BIO_BIO",
        "summary": "Brief summary string",
        "engineeringLogic": {
            "compounding": "String details",
            "processing": "String details",
            "system": "String details"
        },
        "constraints": ["Constraint 1", "Constraint 2"]
      }
      Use plain text for all string fields.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Pdf
            }
          },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        thinkingConfig: THINKING_CONFIG
      }
    });

    const text = response.text || '{}';
    let rawResult: any = {};
    try {
        rawResult = JSON.parse(text);
    } catch (e) {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) rawResult = JSON.parse(match[0]);
    }

    const safeLogic = rawResult.engineeringLogic || {};

    return {
        quadrant: rawResult.quadrant || 'NEXT_GEN',
        summary: cleanText(rawResult.summary || 'No summary available.'),
        engineeringLogic: {
            compounding: cleanText(safeLogic.compounding || 'Details not extracted.'),
            processing: cleanText(safeLogic.processing || 'Details not extracted.'),
            system: cleanText(safeLogic.system || 'Details not extracted.'),
        },
        constraints: Array.isArray(rawResult.constraints) ? rawResult.constraints.map(cleanText) : []
    };

  } catch (error) {
    console.error("PDF Analysis Error:", error);
    throw new Error("Failed to analyze PDF.");
  }
};

export const chatWithPatentContext = async (message: string, base64Pdf: string, history: any[]): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: [
        {
          role: 'user',
          parts: [
             { inlineData: { mimeType: 'application/pdf', data: base64Pdf } },
             { text: "You are an expert patent analyst. Use this PDF to answer questions. Use plain text only." }
          ]
        },
        {
           role: 'model',
           parts: [{ text: "Understood. I have analyzed the patent PDF. What would you like to know?" }]
        },
        ...history
      ],
      config: {
        thinkingConfig: THINKING_CONFIG
      }
    });

    const result = await chat.sendMessage({ message });
    return cleanText(result.text || "No response.");
  } catch (error) {
    console.error("Patent Chat Error:", error);
    return "Error analyzing patent context.";
  }
};