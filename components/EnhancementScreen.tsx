import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MedicalRecord, EnhancementPreset } from '../types';
import { generateImageAnalysis, getPromptForPreset, getPromptEnhancementForPreset } from '../services/geminiService';
import { enhanceImageWithNanoBanana } from '../services/nanoBananaService';
import Icon from './Icon';
import { useConversation } from '@elevenlabs/react';
import { marked } from 'marked';

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || "agent_7501k4h678mtf6qbqafw8kka11w4";

interface EnhancementScreenProps {
  image: { file: File; url: string };
  onSave: (record: Omit<MedicalRecord, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

const AnnotationTool: React.FC<{ 
  icon: 'ruler' | 'text' | 'arrow' | 'blur' | 'redact' | 'calendar' | 'doctor'; 
  label: string; 
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center p-2 space-y-1 rounded-md text-gray-600 hover:bg-blue-100 hover:text-[#0066CC] transition-colors"
  >
    <Icon name={icon} className="w-6 h-6"/>
    <span className="text-xs">{label}</span>
  </button>
);

// Function to generate medical enhancement prompts for annotation tools
const getMedicalEnhancementPrompt = (tool: 'ruler' | 'text' | 'arrow' | 'blur' | 'redact' | 'calendar' | 'doctor'): string => {
  
  const defaultWatermark = 'Put a small text watermark at bottom right of image"CepatSnap" . You are recommended to add helpful marker , anotation , labels to help with understanding.';
  switch (tool) {
    case 'ruler':
      return defaultWatermark + 'Enhance this medical image to improve measurement accuracy and dimensional clarity. Adjust contrast, brightness, and sharpness to better highlight anatomical structures, boundaries, and reference points for precise medical measurements and documentation.';
    case 'text':
      return defaultWatermark +   'Enhance this medical image to improve text readability and annotation visibility. Adjust contrast, brightness, and sharpness to better highlight anatomical structures while ensuring any text overlays, labels, or annotations remain clearly visible and readable for medical documentation.';
    case 'arrow':
      return defaultWatermark + 'Enhance this medical image to improve directional indicators and anatomical orientation. Adjust contrast, brightness, and sharpness to better highlight anatomical structures, directional markers, and spatial relationships for clear medical documentation and analysis.';
    case 'blur':
      return defaultWatermark +   'Enhance this medical image to improve focus and reduce visual noise. Adjust contrast, brightness, and sharpness to better highlight key anatomical structures while reducing background noise, artifacts, or distracting elements for clearer medical analysis and documentation.';
    case 'redact':
      return defaultWatermark + 'Enhance this medical image for privacy protection. Automatically detect and redact/censor any faces, names, personal information, or sensitive data visible in the image. Apply appropriate blurring or masking to protect patient privacy while maintaining medical diagnostic value. Add privacy compliance annotations.';
    case 'calendar':
      return defaultWatermark + 'Enhance this medical image and add current date and time stamp. Include timestamp annotation showing the current date and time when this medical image was captured or processed. Ensure the timestamp is clearly visible and properly formatted for medical documentation compliance.';
    case 'doctor':
      return defaultWatermark + 'Enhance this medical image and add doctor/physician information. Include annotation showing the attending doctor or physician name, credentials, and department. Ensure the doctor information is clearly visible and properly formatted for medical documentation and accountability.';
    default:
      return defaultWatermark + 'Enhance this medical image to improve overall quality and visibility for medical documentation.';
  }
};

const VoiceCommandPanel: React.FC<{ 
  onEnhancementRequest: (prompt: string) => void;
  analysisResult: string;
}> = ({ onEnhancementRequest, analysisResult }) => {
  const { status, startSession, endSession, error: conversationError } = useConversation({
    apiKey: ELEVENLABS_API_KEY,
    onMessage: (message) => {
      console.log('Received message:', message);
      if (message && typeof message === 'string') {
        setTranscript(prev => prev + message + '\n');
      }
    },
    onError: (error) => {
      console.error('Conversation error:', error);
    }
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');

  const handleActivate = async () => {
    setLocalError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await startSession({
        agentId: AGENT_ID,
        connectionType: 'webrtc',
        
        dynamicVariables: {
          image_info: analysisResult || 'No image analysis available yet. Please wait for AI analysis to complete.',
          current_time: new Date().toLocaleString(),
          app_context: 'CepatSnap Medical Image Enhancement Tool'
        },
        clientTools: {
          do_image_enhancement: async ({ message }) => {
            console.log('do_image_enhancement called with message:', message);
            onEnhancementRequest(message);
            return "Image enhancement request processed successfully.";
          }
        }
      });
    } catch (err: any) {
      console.error("Error activating voice session:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setLocalError("Microphone permission denied. Please allow access in your browser settings.");
      } else {
        setLocalError("Failed to start voice session. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (conversationError) {
      setLocalError(conversationError.message);
    }
  }, [conversationError]);

  // Simple auto-click after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Auto-clicking activate button after 5 seconds...');
      // handleActivate();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDeactivate = async () => {
    try {
      await endSession();
    } catch (err: any) {
      console.error("Error deactivating voice session:", err);
      setLocalError("Failed to end session cleanly. Please refresh if issues persist.");
    }
  };
  
  const isConnecting = status === 'connecting';
  const isSessionActive = ['connected', 'listening', 'speaking', 'thinking'].includes(status);
  const showStatus = !['idle', 'disconnected'].includes(status);

  return (
    <div className="p-4 bg-white rounded-lg border border-[#E2E8F0]">
       <div className="flex justify-between items-center mb-4">
         <h3 className="font-semibold text-lg text-[#1A202C]">Voice Commands</h3>
         {!isSessionActive ? (
           <button 
             onClick={handleActivate}
             disabled={isConnecting}
             className="flex items-center gap-2 px-3 py-1.5 bg-[#0066CC] text-white text-sm font-semibold rounded-md hover:bg-[#0052A3] transition-colors disabled:bg-gray-400"
           >
             <Icon name="microphone" className="w-4 h-4" />
             {isConnecting ? 'Connecting...' : 'Activate'}
           </button>
         ) : (
           <button 
             onClick={handleDeactivate}
             className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-md hover:bg-red-600 transition-colors"
           >
             <Icon name="close" className="w-4 h-4" />
             Deactivate
           </button>
         )}
       </div>

      {showStatus && (
        <div className="h-12 w-full bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
          <p className="font-medium text-[#1A202C] capitalize">{status.replace('_', ' ')}</p>
          {(status === 'listening' || status === 'speaking') && <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
        </div>
      )}
      
      {transcript && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm text-[#1A202C] mb-2">Transcript</h4>
          <div className="max-h-32 overflow-y-auto">
            <p className="text-sm text-[#718096] whitespace-pre-wrap">{transcript}</p>
          </div>
        </div>
      )}
      
      {localError && <p className="text-red-500 text-sm font-medium mt-2">{localError}</p>}
    </div>
  );
};

const EnhancementScreen: React.FC<EnhancementScreenProps> = ({ image, onSave, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [promptText, setPromptText] = useState<string>('');
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const [isPromptExpanded, setIsPromptExpanded] = useState<boolean>(false);
  const hasAnalyzedRef = useRef(false);

  // Debug: Monitor enhancedImageUrl changes
  useEffect(() => {
    console.log('enhancedImageUrl state changed:', enhancedImageUrl ? 'EXISTS' : 'NULL');
  }, [analysisResult, enhancedImageUrl]);

  // Auto-call generateImageAnalysis when image loads (only once)
  useEffect(() => {
    if (hasAnalyzedRef.current) return; // Prevent duplicate calls
    
    const autoAnalyze = async () => {
      hasAnalyzedRef.current = true; // Mark as analyzed
      setIsLoading(true);
      setError(null);
      setAnalysisResult('');
      
      try {
        const result = await generateImageAnalysis(image.file, EnhancementPreset.AUTO);
        setAnalysisResult(result);
      } catch (err: any) {
        setError(err.message);
        hasAnalyzedRef.current = false; // Reset on error to allow retry
      } finally {
        setIsLoading(false);
      }
    };

    // Call analysis when component mounts with image
    autoAnalyze();
  }, [image.file]);

  const handleEnhancement = useCallback(async (preset: EnhancementPreset) => {
    setIsLoading(true);
    setError(null);
    setEnhancedImageUrl(null);
    
    try {
      // Get the enhancement prompt for the specific preset
      const defaultPrompt = getPromptEnhancementForPreset(preset);
      
      // Use textarea content if available, otherwise use default prompt
      const prompt = promptText.trim() || defaultPrompt;
      
      // Update textarea with the prompt being used
      setPromptText(prompt);
      
      // Call nano banana service with the prompt
      console.log('Calling enhanceImageWithNanoBanana with prompt:', prompt);
      const result = await enhanceImageWithNanoBanana(image.file, prompt);
      console.log('Received result from nano banana service:', result);
      
      // Handle the structured response - only update image, preserve analysis
      if (result.imageDataUrl) {
        console.log('Setting enhanced image URL:', result.imageDataUrl.substring(0, 50) + '...');
        setEnhancedImageUrl(result.imageDataUrl);
        console.log('Enhanced image URL set successfully');
      } else {
        console.log('No imageDataUrl in result:', result);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [image.file, promptText]);

  const handleVoiceEnhancement = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setEnhancedImageUrl(null);
    
    try {
      // Update textarea with the voice prompt
      setPromptText(prompt);
      
      // Use Nano Banana API for enhancement
      const result = await enhanceImageWithNanoBanana(image.file, prompt);
      
      // Handle the structured response - only update image, preserve analysis
      if (result.imageDataUrl) {
        console.log('Voice: Setting enhanced image URL:', result.imageDataUrl.substring(0, 50) + '...');
        setEnhancedImageUrl(result.imageDataUrl);
      } else {
        console.log('Voice: No imageDataUrl in result:', result);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [image.file]);

  const handleAnnotationToolClick = useCallback(async (tool: 'ruler' | 'text' | 'arrow' | 'blur' | 'redact' | 'calendar' | 'doctor') => {
    setIsLoading(true);
    setError(null);
    setEnhancedImageUrl(null);
    
    try {
      // Generate medical enhancement prompt for the annotation tool
      const prompt = getMedicalEnhancementPrompt(tool);
      
      // Update textarea with the generated prompt
      setPromptText(prompt);
      
      // Use Nano Banana API for enhancement
      const result = await enhanceImageWithNanoBanana(image.file, prompt);
      
      // Handle the structured response - only update image, preserve analysis
      if (result.imageDataUrl) {
        console.log('Annotation: Setting enhanced image URL:', result.imageDataUrl.substring(0, 50) + '...');
        setEnhancedImageUrl(result.imageDataUrl);
      } else {
        console.log('Annotation: No imageDataUrl in result:', result);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [image.file]);

  const handleSave = () => {
    onSave({
      patientId: `PID-${Math.floor(1000 + Math.random() * 9000)}`, // mock patient ID
      imageUrl: image.url,
      enhancedImageUrl: image.url, // In a real app, this would be a different URL
      enhancementNotes: analysisResult,
      status: 'Enhanced',
      complianceVerified: true,
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* Main Image and Controls */}
      <div className="flex-grow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-[#718096]">Before</span>
            <div className="mt-2 bg-gray-200 rounded-lg overflow-hidden border-2 border-transparent">
              <img src={image.url} alt="Original" className="w-full h-auto object-contain" />
            </div>
          </div>
          <div>
            <span className="font-semibold text-[#718096]">After</span>
            {enhancedImageUrl && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Enhanced
              </span>
            )}
            <div className={`mt-2 bg-white rounded-lg overflow-hidden border-2 ${(analysisResult || enhancedImageUrl) ? 'border-[#00AA44]' : 'border-dashed border-[#E2E8F0]'} transition-all`}>
              {(() => {
                console.log('Render: enhancedImageUrl =', enhancedImageUrl ? 'EXISTS' : 'NULL', 'isLoading =', isLoading);
                return null;
              })()}
              {isLoading ? (
                <div className="aspect-square flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0066CC]"></div>
                </div>
              ) : enhancedImageUrl ? (
                <img src={enhancedImageUrl} alt="Enhanced" className="w-full h-auto object-contain" />
              ) : (
                <img src={image.url} alt="Original" className="w-full h-auto object-contain opacity-50" />
              )}
            </div>
          </div>
        </div>

        {/* AI Analysis Result */}
        {(analysisResult || isLoading || error) && (
          <div className="p-4 bg-white rounded-lg border border-[#E2E8F0]">
            <h3 className="font-semibold text-lg mb-2 text-[#1A202C]">AI Analysis</h3>
            {isLoading && <p className="text-sm text-[#718096]">Generating analysis... Please wait.</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {analysisResult && (
              <div 
                className="text-sm text-[#1A202C] markdown-content"
                dangerouslySetInnerHTML={{ 
                  __html: marked(analysisResult, {
                    breaks: true,
                    gfm: true
                  })
                }}
                style={{
                  lineHeight: '1.6'
                }}
              />
            )}
          </div>
        )}

        <VoiceCommandPanel 
          onEnhancementRequest={handleVoiceEnhancement} 
          analysisResult={analysisResult}
        />
      </div>

      {/* Control Panel */}
      <div className="lg:w-80 flex-shrink-0 space-y-6">
        {/* Enhancement Controls */}
        <div className="p-4 bg-white rounded-lg border border-[#E2E8F0]">
          <h3 className="font-semibold text-lg mb-4">Enhancement Presets</h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.values(EnhancementPreset)).map(preset => (
              <button key={preset} onClick={() => handleEnhancement(preset)} disabled={isLoading} className="p-2 text-sm text-center font-medium bg-blue-50 text-[#0066CC] rounded-md hover:bg-blue-100 disabled:bg-gray-200 disabled:text-gray-500 transition-colors">
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Annotation Tools */}
        <div className="p-4 bg-white rounded-lg border border-[#E2E8F0]">
          <h3 className="font-semibold text-lg mb-4">Annotation Tools</h3>
          <div className="grid grid-cols-3 gap-2">
            <AnnotationTool icon="ruler" label="Measure" onClick={() => handleAnnotationToolClick('ruler')}/>
            <AnnotationTool icon="text" label="Text" onClick={() => handleAnnotationToolClick('text')}/>
            <AnnotationTool icon="arrow" label="Arrow" onClick={() => handleAnnotationToolClick('arrow')}/>
            <AnnotationTool icon="blur" label="Blur" onClick={() => handleAnnotationToolClick('blur')}/>
            <AnnotationTool icon="redact" label="Redact" onClick={() => handleAnnotationToolClick('redact')}/>
            <AnnotationTool icon="calendar" label="Date/Time" onClick={() => handleAnnotationToolClick('calendar')}/>
            <AnnotationTool icon="doctor" label="Doctor" onClick={() => handleAnnotationToolClick('doctor')}/>
          </div>
        </div>

        {/* Prompt Editor */}
        <div className="p-4 bg-white rounded-lg border border-[#E2E8F0]">
          <button 
            onClick={() => setIsPromptExpanded(!isPromptExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-semibold text-lg">Enhancement Prompt</h3>
            <Icon 
              name="chevron-down" 
              className={`w-5 h-5 transition-transform duration-200 ${isPromptExpanded ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {isPromptExpanded && (
            <div className="mt-4">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Enter your enhancement prompt here, or use the preset buttons above to auto-fill..."
                className="w-full h-32 p-3 border border-[#E2E8F0] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <p className="text-xs text-[#718096] mt-2">
                This prompt will be sent to the AI for image enhancement. You can edit it or use the preset buttons above.
              </p>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <button onClick={handleSave} disabled={!analysisResult || isLoading} className="w-full py-3 px-4 bg-[#00AA44] text-white font-semibold rounded-lg shadow-sm hover:bg-[#008833] disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2">
            <Icon name="save" className="w-5 h-5"/>
            Save Enhanced
          </button>
          <button onClick={onCancel} className="w-full py-3 px-4 bg-white text-[#718096] font-semibold rounded-lg border border-[#E2E8F0] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancementScreen;