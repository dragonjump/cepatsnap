
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

export const getPromptEnhancementForPreset = (preset: EnhancementPreset): string => {
  const defaultWatermark = 'Put a small text watermark at bottom right of image"CepatSnap".  You are recommended to add helpful marker , anotation , labels to help with understanding.';
  switch (preset) {
    case EnhancementPreset.WOUND:
      return defaultWatermark + 'Enhance this wound care image to improve visibility of tissue types, wound edges, and surrounding skin condition. Adjust contrast, brightness, and sharpness to better highlight granulation tissue, slough, necrotic areas, and wound boundaries for medical documentation.';
    case EnhancementPreset.DERMA:
      return defaultWatermark + ' Enhance this dermatological image to improve visibility of lesion characteristics. Adjust color balance, contrast, and sharpness to better highlight the lesion\'s color, shape, border definition, texture, and any secondary features for accurate medical assessment.';
    case EnhancementPreset.XRAY:
      return defaultWatermark + '  Enhance this X-ray image to improve visibility of bone structures and soft tissues. Adjust contrast, brightness, and sharpness to better highlight fractures, anomalies, irregularities in bone structure, and soft tissue details for diagnostic purposes.';
    case EnhancementPreset.AUTO:
    default:
      return defaultWatermark + '  Enhance this medical image to improve overall quality and visibility. Adjust contrast, brightness, color balance, and sharpness to better highlight key visual features, structures, and any notable anomalies for medical documentation and analysis.';
  }
};

export const getPromptForPreset = (preset: EnhancementPreset): string => {
  switch (preset) {
    case EnhancementPreset.WOUND:
      return 'This just a demo poc exploratory. Tell me what you see on this   image focusing on wound care. Describe key features like tissue type (e.g., granulation, slough, necrotic), wound edges, and surrounding skin condition. Provide a concise, objective description for a medical record. Do not give a diagnosis.';
    case EnhancementPreset.DERMA:
      return 'This just a demo poc exploratory. Tell me what you see on this dermatological image. Describe the lesion\'s characteristics including color, shape, border, and texture. Note any patterns or secondary features. Provide a concise, objective description for a medical record. Do not give a diagnosis.';
    case EnhancementPreset.XRAY:
      return 'This just a demo poc exploratory. Tell me what you see on this X-ray image. Describe any visible anomalies, fractures, or irregularities in bone structure or soft tissue. Provide a concise, objective description for a medical record. Do not give a diagnosis.';
    case EnhancementPreset.AUTO:
    default:
      return 'This just a demo poc exploratory. Tell me what you see on this   image. Provide a general (Wound Care, Dermatology, X-Ray Mode) but professional, objective description of its key visual features suitable for a medical record. Focus on color, structure, and any notable anomalies. Do not give a diagnosis.';
  }
};

export const generateImageAnalysis = async (imageFile: File, preset: EnhancementPreset): Promise<string> => {
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;

  try {
    if (!apiKey) {
      console.warn("generateImageAnalysis API_KEY not found, returning mock data.");
      return new Promise(resolve => setTimeout(() => resolve(`This is a mock AI analysis for the "${preset}" preset. The analysis would describe key features relevant to the selected mode. For example, in Wound Care, it might mention tissue types and wound edges. (This is a simulated response)`), 1500));
    }

    const ai = new GoogleGenAI({ apiKey });
    const imagePart = await fileToGenerativePart(imageFile);
    
    // Load all prompt types for comprehensive analysis
    const allPrompts = Object.values(EnhancementPreset).map(presetType => 
      `## ${presetType} Analysis\n${getPromptForPreset(presetType)}`
    ).join('\n\n');
    
    const textPart = { 
      text: `Please provide a comprehensive medical image analysis covering all these aspects:\n\n${allPrompts}\n\nProvide detailed analysis for each category above.` 
    };
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate AI analysis. Please check your API key and network connection.');
  }
};