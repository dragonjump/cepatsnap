
import { GoogleGenAI } from "@google/genai";
import { EnhancementPreset } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const getPromptForPreset = (preset: EnhancementPreset): string => {
  switch (preset) {
    case EnhancementPreset.WOUND:
      return 'Analyze this medical image focusing on wound care. Describe key features like tissue type (e.g., granulation, slough, necrotic), wound edges, and surrounding skin condition. Provide a concise, objective description for a medical record. Do not give a diagnosis.';
    case EnhancementPreset.DERMA:
      return 'Analyze this dermatological image. Describe the lesion\'s characteristics including color, shape, border, and texture. Note any patterns or secondary features. Provide a concise, objective description for a medical record. Do not give a diagnosis.';
    case EnhancementPreset.XRAY:
      return 'Analyze this X-ray image. Describe any visible anomalies, fractures, or irregularities in bone structure or soft tissue. Provide a concise, objective description for a medical record. Do not give a diagnosis.';
    case EnhancementPreset.AUTO:
    default:
      return 'Analyze this medical image. Provide a general but professional, objective description of its key visual features suitable for a medical record. Focus on color, structure, and any notable anomalies. Do not give a diagnosis.';
  }
};

export const generateImageAnalysis = async (imageFile: File, preset: EnhancementPreset): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      console.warn("API_KEY not found, returning mock data.");
      return new Promise(resolve => setTimeout(() => resolve(`This is a mock AI analysis for the "${preset}" preset. The analysis would describe key features relevant to the selected mode. For example, in Wound Care, it might mention tissue types and wound edges. (This is a simulated response)`), 1500));
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = { text: getPromptForPreset(preset) };
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate AI analysis. Please check your API key and network connection.');
  }
};
