// Nano Banana API service for image enhancement using Google GenAI streamGenerateContent
import toast from 'react-hot-toast';

export interface NanoBananaResponse {
  success: boolean;
  enhancedImageUrl?: string;
  analysis?: string;
  error?: string;
}

// Helper function to convert File to base64 data URL
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper function to process stream response
async function processStreamResponse(response: Response): Promise<{text: string, imageDataUrl?: string}> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body reader available");
  }

  let result = '';
  const decoder = new TextDecoder();
  let accumulatedText = '';
  let enhancedImageDataUrl = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      result += chunk;
    }
  } finally {
    reader.releaseLock();
  }

  // Process the complete response
  console.log('Complete response received:', result);
  
  try {
    // Try to parse the complete response as JSON
    const parsed = JSON.parse(result);
    console.log('Parsed response:', parsed);
    
    // Handle array response structure
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item.candidates?.[0]?.content?.parts) {
          for (const part of item.candidates[0].content.parts) {
            if (part.text) {
              accumulatedText += part.text;
              // Show toast for text content (only for longer chunks to avoid spam)
              if (part.text.length > 3) {
                console.log('Showing toast for:', part.text);
                toast.success(`AI: ${part.text}`, {
                  duration: 1500,
                  position: 'top-right',
                  style: {
                    background: '#10B981',
                    color: '#fff',
                  }
                });
              }
            }
            if (part.inlineData) {
              const { mimeType, data } = part.inlineData;
              enhancedImageDataUrl = `data:${mimeType};base64,${data}`;
              console.log('Found inlineData image:', mimeType, 'data length:', data.length);
            }
          }
        }
      }
    } else {
      // Handle single response structure
      if (parsed.candidates?.[0]?.content?.parts) {
        for (const part of parsed.candidates[0].content.parts) {
          if (part.text) {
            accumulatedText += part.text;
            // Show toast for text content (only for longer chunks to avoid spam)
            if (part.text.length > 3) {
              console.log('Showing toast for:', part.text);
              toast.success(`AI: ${part.text}`, {
                duration: 1500,
                position: 'top-right',
                style: {
                  background: '#10B981',
                  color: '#fff',
                }
              });
            }
          }
          if (part.inlineData) {
            const { mimeType, data } = part.inlineData;
            enhancedImageDataUrl = `data:${mimeType};base64,${data}`;
            console.log('Found inlineData image (single):', mimeType, 'data length:', data.length);
          }
        }
      }
    }
  } catch (e) {
    console.error('Error parsing response:', e);
    console.log('Raw response:', result);
  }

  // Return enhanced image if available, otherwise return accumulated text
  if (enhancedImageDataUrl) {
    console.log('Enhanced image generated, showing success toast');
    toast.success('🎉 Enhanced image generated successfully!', {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#059669',
        color: '#fff',
      }
    });
    return {
      text: accumulatedText || 'Enhanced image generated successfully.',
      imageDataUrl: enhancedImageDataUrl
    };
  }
  
  return {
    text: accumulatedText || 'No content found in response'
  };
}

export const enhanceImageWithNanoBanana = async (
  imageFile: File, 
  prompt: string
): Promise<{text: string, imageDataUrl?: string}> => {
  try {
    // Test toast to ensure toast system is working
    console.log('Starting nano banana enhancement...');
    toast.success('🚀 Starting image enhancement...', {
      duration: 2000,
      position: 'top-right',
      style: {
        background: '#3B82F6',
        color: '#fff',
      }
    });
    
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;
    
    // Convert image file to data URL first
    const imageDataUrl = await fileToDataUrl(imageFile);
    
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found, returning mock data.");
      console.log('Mock data - imageDataUrl:', imageDataUrl.substring(0, 50) + '...');
      return new Promise(resolve => 
        setTimeout(() => 
          resolve({
            text: `Mock Nano Banana enhancement with prompt: "${prompt}". This would be the actual AI enhancement result from Google GenAI API.`,
            imageDataUrl: imageDataUrl // Use the original image as mock enhanced image
          }), 
          2000
        )
      );
    }
    const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
      throw new Error("Invalid image data URL format");
    }
    const [, mimeType, base64Data] = match;

    // Create request payload matching the bash script format
    const requestPayload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Please enhance the image :> ${prompt}`
            },
            {
              inlineData: { 
                mimeType, 
                data: base64Data 
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"]
      }
    };

    // Call Google GenAI streamGenerateContent API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:streamGenerateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await processStreamResponse(response);
    
  } catch (error) {
    console.error('Error calling Google GenAI streamGenerateContent API:', error);
    
    // Fallback to mock response for development
    return new Promise(async resolve => {
      const fallbackImageDataUrl = await fileToDataUrl(imageFile);
      setTimeout(() => 
        resolve({
          text: `Mock Nano Banana enhancement with prompt: "${prompt}". This would be the actual AI analysis result from Google GenAI API.`,
          imageDataUrl: fallbackImageDataUrl // Use the original image as mock enhanced image
        }), 
        2000
      );
    });
  }
};
