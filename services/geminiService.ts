import { GoogleGenAI, Type } from "@google/genai";
import { TopologyData, ResourceType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for Topology Generation
const topologySchema = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          type: { type: Type.STRING, enum: Object.values(ResourceType) },
          group: { type: Type.STRING, description: "ID of parent node or 'root'" },
          status: { type: Type.STRING, enum: ['Running', 'Stopped', 'Degraded', 'OK'] },
          val: { type: Type.NUMBER, description: "Visual size weight (5-20)" }
        },
        required: ['id', 'name', 'type', 'group', 'status', 'val']
      }
    },
    links: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING },
          target: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['contains', 'connects'] }
        },
        required: ['source', 'target', 'type']
      }
    }
  },
  required: ['nodes', 'links']
};

export const generateTopologyFromPrompt = async (prompt: string): Promise<TopologyData> => {
  if (!apiKey) throw new Error("API Key not set");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate an Azure infrastructure topology based on this request: "${prompt}".
      Ensure logical hierarchy (Subscription -> RG -> VNet -> Subnet -> Resource).
      Ensure IDs are unique.
      Use 'contains' for hierarchy and 'connects' for network flow.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: topologySchema,
        systemInstruction: "You are an Azure Cloud Architect. You generate precise JSON topologies compatible with d3.js visualization."
      }
    });

    const data = JSON.parse(response.text || '{}');
    return data as TopologyData;
  } catch (error) {
    console.error("Gemini Topology Gen Error:", error);
    throw error;
  }
};

export const analyzeInfrastructure = async (topology: TopologyData, question: string): Promise<string> => {
  if (!apiKey) return "API Key missing. Cannot analyze.";

  try {
    // We don't use schema here because we want free-form text/markdown analysis
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
      Context: I have the following Azure Topology JSON:
      ${JSON.stringify(topology, null, 2)}

      User Question: ${question}

      Provide a concise, expert analysis. Format with Markdown.
      `,
      config: {
        systemInstruction: "You are a DevSecOps expert using Hyperglance. Analyze the provided JSON topology for security, cost, and performance optimization."
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error generating analysis. Please try again.";
  }
};