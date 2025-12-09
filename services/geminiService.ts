import { GoogleGenAI } from "@google/genai";
import { LogEntry } from "../types";

export const generateDailySummary = async (logs: LogEntry[]): Promise<string> => {
  // Safety check for process.env in browser environment
  const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : null;

  if (!apiKey) {
    return "API Key not configured. Unable to generate AI summary.";
  }

  // Filter logs for today only to make the summary relevant
  const today = new Date().toDateString();
  const todaysLogs = logs.filter(l => new Date(l.timestamp).toDateString() === today);

  if (todaysLogs.length === 0) {
    return "No logs submitted today to analyze.";
  }

  // Prepare a text representation of the data
  const dataText = todaysLogs.map(l => 
    `- Teacher: ${l.teacherName}, Activity: ${l.activityType}, Description: ${l.description}`
  ).join('\n');

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are an assistant to a School Principal. 
        Analyze the following daily activity logs from teachers.
        Provide a concise, professional executive summary (max 3 sentences) highlighting:
        1. Key activities done today.
        2. Any anomalies (e.g., many free periods or office work).
        3. General sentiment or productivity level.

        Here are the logs:
        ${dataText}
      `,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service.";
  }
};

export const generateLogFeedback = async (activity: string, description: string, notes: string): Promise<string> => {
  const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : null;

  if (!apiKey) {
    return "API Key missing. AI feedback unavailable.";
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a helpful teaching assistant coach.
        A teacher has logged an activity:
        Activity Type: ${activity}
        Description: ${description}
        Self Reflection/Notes: ${notes}

        Provide a brief, encouraging, and constructive feedback (max 2 sentences) based on their reflection.
        Focus on professional growth or well-being.
      `,
    });

    return response.text || "No feedback generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI service unavailable.";
  }
};