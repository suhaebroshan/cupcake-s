
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MODEL_FAST, MODEL_SMART } from "../constants";
import { AgentFileAction, AgentTask } from "../types";

// Initialize Google GenAI Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fallback model constant
const MODEL_FALLBACK = "gemini-2.5-flash";

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to extract JSON from potential markdown or text
function extractJSON(text: string): any {
  if (!text) return null;
  let cleanText = text.trim();
  
  // Try to find JSON code block
  const codeBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    cleanText = codeBlockMatch[1].trim();
  }

  // If no code block, try to find the first { or [ and the last } or ]
  const firstOpen = cleanText.search(/[{[]/);
  
  if (firstOpen !== -1) {
      // Find the last matching bracket
      const lastIndex = cleanText.lastIndexOf(cleanText[firstOpen] === '{' ? '}' : ']');
      if (lastIndex !== -1 && lastIndex > firstOpen) {
          cleanText = cleanText.substring(firstOpen, lastIndex + 1);
      }
  }

  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse failed, attempting fallback cleanup", e);
    try {
        // Remove trailing commas
        return JSON.parse(cleanText.replace(/,(\s*[}\]])/g, '$1'));
    } catch (e2) {
        console.warn("Could not parse JSON even after cleanup. Raw text:", text.substring(0, 200));
        return null; 
    }
  }
}

// 1. ENHANCE PROMPT (Gemini 2.5 Flash)
export const enhancePrompt = async (userPrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `You are a HIGH-VELOCITY Technical Product Manager. 
      Refine the following user request into a detailed technical specification for a React single-page app.
      
      CRITICAL INSTRUCTIONS:
      - List ALL specific features required.
      - Mention the UI library: Tailwind CSS + Lucide Icons.
      - Specify the folder structure (e.g., src/components, src/pages, src/hooks).
      - If the user asks for a "dashboard", specify the exact widgets (charts, stats cards, tables).
      - ENSURE THE APP LOOKS MODERN AND "PRO" (Dark mode default, nice gradients).
      
      User Request: ${userPrompt}`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || userPrompt;
  } catch (error) {
    console.error("Enhance failed:", error);
    return userPrompt;
  }
};

// 2. PLANNER (Gemini 3 Pro with Thinking -> Fallback to Flash)
export const generatePlan = async (userPrompt: string): Promise<AgentTask[]> => {
  const taskSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      tasks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: "Very granular task title" },
          },
          required: ["id", "title"]
        }
      }
    },
    required: ["tasks"]
  };

  const promptText = `Create a comprehensive build plan for: ${userPrompt}. 
      
      CRITICAL PLANNING RULES:
      1. **Granularity is Key**: Do NOT create generic tasks like "Build Components". Break it down.
         - BAD: "Build UI", "Create Components".
         - GOOD: "Create Sidebar", "Create Header", "Create DashboardStats", "Create UserProfile", "Create SettingsForm".
      2. **Completeness**: ensure every feature mentioned in the prompt has a corresponding task.
      3. **Dependencies**:
         - Step 1 MUST be: "Setup Project Infrastructure (Tailwind, Lucide, Routing)".
         - Then Layout Components.
         - Then Feature Components (break these down!).
         - Then Pages that assemble the components.
      
      Scale:
      - Simple app: 5-8 tasks.
      - Complex app: 12-20 tasks.
      
      Generate as many steps as necessary to build a COMPLETE, IMPRESSIVE application.`;

  // Attempt 1: Smart Model with Thinking
  try {
    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: taskSchema,
        thinkingConfig: { thinkingBudget: 4096 } 
      }
    });

    const json = extractJSON(response.text);
    if (!json || !json.tasks || !Array.isArray(json.tasks)) throw new Error("Invalid plan format");
    return json.tasks.map((t: any) => ({ id: t.id, title: t.title, status: 'pending' }));

  } catch (error) {
    console.warn("Planning with Smart model failed, switching to Fallback...", error);

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FALLBACK,
            contents: promptText,
            config: {
                responseMimeType: "application/json",
                responseSchema: taskSchema
            }
        });
        
        const json = extractJSON(response.text);
        if (!json || !json.tasks || !Array.isArray(json.tasks)) throw new Error("Invalid fallback plan format");
        return json.tasks.map((t: any) => ({ id: t.id, title: t.title, status: 'pending' }));

    } catch (fallbackError) {
        console.error("Planning completely failed", fallbackError);
        return [
            { id: "1", title: "Setup Project Infrastructure", status: "pending" },
            { id: "2", title: "Create Layout Components", status: "pending" },
            { id: "3", title: "Implement Dashboard Features", status: "pending" }
        ];
    }
  }
};

// 3. EXECUTOR (Gemini 3 Pro -> Fallback to Flash)
export const executeStep = async (
  task: string, 
  allFiles: Record<string, any>, 
  userOriginalPrompt: string,
  onChunk?: (chunkText: string) => void
): Promise<AgentFileAction[]> => {
  
  // Create a file listing to save tokens, only include full content of small/relevant files if needed
  const fileNames = Object.keys(allFiles).join(", ");
  
  const actionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      actions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, enum: ["create", "update", "delete"] },
            path: { type: Type.STRING, description: "File path e.g., 'src/components/Button.tsx'" },
            content: { type: Type.STRING, description: "COMPLETE file content. No placeholders." }
          },
          required: ["action", "path", "content"]
        }
      }
    },
    required: ["actions"]
  };

  const prompt = `
  PROJECT GOAL: ${userOriginalPrompt}
  CURRENT TASK: ${task}
  EXISTING FILES: ${fileNames}
  
  YOU ARE A SENIOR REACT ENGINEER.
  
  CRITICAL CODING RULES:
  1. **NO PATH ALIASES**: Use relative paths (e.g., '../../components/Button') for imports. DO NOT use '@/' or '~/' as they break the preview engine.
  2. **ROUTING**: Always use 'HashRouter' from 'react-router-dom', NOT 'BrowserRouter'.
  3. **ICONS**: Use 'lucide-react' for icons.
  4. **STYLING**: Use Tailwind CSS for everything. Make it look modern (rounded-xl, shadows, gradients).
  5. **COMPLETENESS**: 
     - If you create a component, generate the FULL code. No "TODO: implement logic".
     - If you import a component that doesn't exist yet, YOU MUST CREATE IT in this same step.
  6. **BOOTSTRAP**: If this is the first task, you MUST create 'src/App.tsx' and 'src/index.tsx'.
     - 'src/index.tsx' must import './index.css' (even if empty) and render to document.getElementById('root').
  
  Return a JSON object with the list of file actions.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: MODEL_SMART,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: actionSchema,
        maxOutputTokens: 20000, // High limit for multiple files
        thinkingConfig: { thinkingBudget: 8192 } 
      }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
            fullText += text;
            if (onChunk) onChunk(text);
        }
    }
    const json = extractJSON(fullText);
    return json?.actions || [];

  } catch (error) {
    console.warn("Execution with Smart model failed, switching to Fallback...", error);
    if (onChunk) onChunk("\n[System] Switching to fallback model for stability...\n");

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FALLBACK,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: actionSchema
            }
        });
        
        if (onChunk) onChunk(response.text);
        const json = extractJSON(response.text);
        return json?.actions || [];
    } catch (fallbackError) {
        console.error("Execution completely failed", fallbackError);
        throw fallbackError;
    }
  }
};

// 4. ONE-SHOT CODE (Fallback/Console use)
export const generateCode = async (prompt: string, files: Record<string, any> = {}): Promise<string> => {
  return "<!-- Use the agent for full project generation -->";
};
