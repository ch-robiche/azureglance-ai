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

// Schemas for Analysis
const costAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    estimatedMonthlyCost: { type: Type.NUMBER },
    currency: { type: Type.STRING },
    potentialSavings: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    topCostDrivers: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ['estimatedMonthlyCost', 'currency', 'potentialSavings', 'summary']
};

const securityAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    securityScore: { type: Type.NUMBER, description: "0-100 score" },
    criticalRisksCount: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    topRisks: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ['securityScore', 'criticalRisksCount', 'summary']
};

export const generateCostAnalysis = async (topology: TopologyData): Promise<any> => {
  if (!apiKey) return { estimatedMonthlyCost: 0, currency: 'USD', summary: 'API Key missing', potentialSavings: 0 };

  try {
    // Create a lightweight summary to avoid token limits
    const payload = {
      totalCost: topology.totalCost,
      currency: topology.currency,
      resourceCount: topology.nodes.length,
      // Only send top 30 most expensive items for analysis
      topCostItems: topology.rawCostItems?.slice(0, 30) || [],
      // Send simplified nodes for context (types and counts)
      nodeTypes: topology.nodes.map(n => ({ type: n.type, status: n.status }))
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the ACTUAL monthly cost for this Azure infrastructure: ${JSON.stringify(payload)}. 
            The total cost is ${payload.totalCost} ${payload.currency}.
            Analyze the provided 'topCostItems' to identify the main cost drivers.
            Identify potential savings (e.g. suggest reservations for always-on VMs, check for unused resources).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: costAnalysisSchema,
        systemInstruction: "You are an Azure FinOps expert. Analyze the provided ACTUAL cost data. Do not estimate from scratch, use the provided totals."
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Cost Analysis Error:", error);
    return { estimatedMonthlyCost: 0, currency: 'USD', summary: 'Analysis Failed', potentialSavings: 0 };
  }
};

export const generateSecurityAnalysis = async (topology: TopologyData): Promise<any> => {
  if (!apiKey) return { securityScore: 0, criticalRisksCount: 0, summary: 'API Key missing' };

  try {
    // Simplify topology for security analysis - remove cost items
    const payload = {
      nodes: topology.nodes.map(n => ({
        id: n.id,
        type: n.type,
        name: n.name,
        status: n.status,
        location: n.location,
        isPublic: n.properties?.publicIp ? true : false // Heuristic
      })),
      links: topology.links
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the security posture of this Azure infrastructure: ${JSON.stringify(payload)}. 
            Calculate a security score (0-100). Identify critical risks (e.g. public IPs, unencrypted data, missing firewalls).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: securityAnalysisSchema,
        systemInstruction: "You are an Azure Security expert (CISSP). Evaluate the topology strictly."
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Security Analysis Error:", error);
    return { securityScore: 0, criticalRisksCount: 0, summary: 'Analysis Failed' };
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