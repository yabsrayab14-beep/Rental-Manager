import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePropertyDescription = async (
  name: string,
  type: string,
  beds: number,
  baths: number,
  features: string
): Promise<string> => {
  try {
    const prompt = `Write a short, catchy rental listing description (max 80 words) for a property named "${name}". 
    Details: ${type}, ${beds} bedrooms, ${baths} bathrooms. 
    Key features: ${features}. 
    Tone: Professional yet inviting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating description. Please try again.";
  }
};

export const draftTenantMessage = async (
  tenantName: string,
  topic: string,
  tone: 'Professional' | 'Friendly' | 'Firm'
): Promise<string> => {
  try {
    const prompt = `Draft a short message (SMS/Email style, max 60 words) to a tenant named ${tenantName}.
    Topic: ${topic}.
    Tone: ${tone}.
    Do not include subject lines or placeholders.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Could not generate message.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating message.";
  }
};