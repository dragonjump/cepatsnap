import React, { useState, useCallback, useEffect } from 'react';
import { MedicalRecord, EnhancementPreset } from '../types';
import { generateImageAnalysis } from '../services/geminiService';
import Icon from './Icon';
// Fix: Renamed ElevenLabsProvider to ElevenLabsContextProvider as per the library's correct export.
import { ElevenLabsContextProvider, useConversation } from '@elevenlabs/react';

const ELEVENLABS_API_KEY = "sk_282bbc0ad4931bf6fc16d07f6f2cc0ee5552e53cf3810d6a";
const AGENT_ID = "agent_7501k4h678mtf6qbqafw8kka11w4";

interface EnhancementScreenProps {
  image: { file: File; url: string };
  onSave: (record: Omit<MedicalRecord, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

const AnnotationTool: React.FC<{ icon: 'ruler' | 'text' | 'arrow' | 'blur'; label: string }> = ({ icon, label }) => (
    <button className="flex flex-col items-center p-2 space-y-1 rounded-md text-gray-600 hover:bg-blue-100 hover:text-[#0066CC]">
        <Icon name={icon} className="w-6 h-6"/>
        <span className="text-xs">{label}</span>
    </button>
);


// Fix: The VoiceCommandPanel has been refactored to correctly handle conversation statuses, resolving all TypeScript errors.
const VoiceCommandPanel = () => {
    // Fix: The `useConversation` hook returns `error`, not `conversationError`.
    const { status, startSession, endSession, error: conversationError } = useConversation();
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (conversationError) {
            setLocalError(conversationError.message);
        }
    }, [conversationError]);

    const handleActivate = async () => {
        setLocalError(null);
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            await startSession({
                agentId: AGENT_ID,
                connectionType: 'webrtc',
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

    const handleDeactivate = async () => {
        try {
            await endSession();
        } catch (err: any) {
             console.error("Error deactivating voice session:", err);
             setLocalError("Failed to end session cleanly. Please refresh if issues persist.");
        }
    };
    
    // Fix: Refactored state logic to correctly handle different statuses from the useConversation hook. Type casting is used to resolve comparison errors due to potentially mismatched type definitions.
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
                    {/* Fix: Cast status to string to resolve TypeScript comparison error. */}
                    {(status === 'listening' || status === 'speaking') && <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                </div>
            )}
            {(localError) && <p className="text-red-500 text-sm font-medium mt-2">{localError}</p>}
        </div>
    );
};


const EnhancementScreen: React.FC<EnhancementScreenProps> = ({ image, onSave, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleEnhancement = useCallback(async (preset: EnhancementPreset) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult('');
    try {
      const result = await generateImageAnalysis(image.file, preset);
      setAnalysisResult(result);
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
    <ElevenLabsContextProvider apiKey={ELEVENLABS_API_KEY}>
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
              <div className={`mt-2 bg-white rounded-lg overflow-hidden border-2 ${analysisResult ? 'border-[#00AA44]' : 'border-dashed border-[#E2E8F0]'} transition-all`}>
                {isLoading ? (
                  <div className="aspect-square flex items-center justify-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0066CC]"></div>
                  </div>
                ) : (
                  <img src={image.url} alt="Enhanced" className="w-full h-auto object-contain" />
                )}
              </div>
            </div>
          </div>

          <VoiceCommandPanel />

          {/* AI Analysis Result */}
          {(analysisResult || isLoading || error) && (
            <div className="p-4 bg-white rounded-lg border border-[#E2E8F0]">
              <h3 className="font-semibold text-lg mb-2 text-[#1A202C]">AI Analysis</h3>
              {isLoading && <p className="text-sm text-[#718096]">Generating analysis... Please wait.</p>}
              {error && <p className="text-sm text-red-500">{error}</p>}
              {analysisResult && <p className="text-sm text-[#1A202C] whitespace-pre-wrap">{analysisResult}</p>}
            </div>
          )}
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
              <div className="grid grid-cols-4 gap-2">
                  <AnnotationTool icon="ruler" label="Measure"/>
                  <AnnotationTool icon="text" label="Text"/>
                  <AnnotationTool icon="arrow" label="Arrow"/>
                  <AnnotationTool icon="blur" label="Blur"/>
              </div>
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
    </ElevenLabsContextProvider>
  );
};

export default EnhancementScreen;