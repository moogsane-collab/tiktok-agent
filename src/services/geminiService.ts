import { GoogleGenAI, Type } from "@google/genai";
import { Video, BrandBible, HookAnalysis, CreativeBrief } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const analyzeHook = async (video: Video): Promise<HookAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analiza este video de TikTok:
    Hook (texto): "${video.hook}"
    Descripción visual: "${video.visualDescription}"
    Métricas: ${video.views} vistas.
    
    Dime:
    1. Score de 1-100.
    2. Tipo de hook (Confrontacional, Pregunta, Promesa, Dolor, etc).
    3. Por qué funciona (análisis de texto y visual).
    4. Elemento clave de viralidad.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          type: { type: Type.STRING },
          explanation: { type: Type.STRING },
          keyElement: { type: Type.STRING },
        },
        required: ["score", "type", "explanation", "keyElement"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const generateBrief = async (video: Video, bible: BrandBible): Promise<CreativeBrief> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera un brief creativo para un video de TikTok basado en este video viral:
    Hook original: "${video.hook}"
    Métricas: ${video.views} vistas.
    
    Usa esta Brand Bible:
    Nombre: ${bible.name}
    Tono: ${bible.tone.join(", ")}
    Misión: ${bible.mission}
    
    El brief debe incluir: concepto, hook exacto, guión, instrucciones visuales, audio, CTA y hashtags.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          concept: { type: Type.STRING },
          hook: { type: Type.STRING },
          script: { type: Type.STRING },
          visuals: { type: Type.STRING },
          audio: { type: Type.STRING },
          cta: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["concept", "hook", "script", "visuals", "audio", "cta", "hashtags"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};

export const generateBrandBible = async (keyword: string): Promise<BrandBible> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Genera una Brand Bible para una marca de TikTok en el nicho de: ${keyword}.
    Incluye nombre, tagline, misión, avatar del cliente, tono, pilares de contenido y hashtags principales.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          tagline: { type: Type.STRING },
          mission: { type: Type.STRING },
          avatar: { type: Type.STRING },
          tone: { type: Type.ARRAY, items: { type: Type.STRING } },
          pillars: { type: Type.ARRAY, items: { type: Type.STRING } },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["name", "tagline", "mission", "avatar", "tone", "pillars", "hashtags"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
};
