
import React, { useState, useCallback } from 'react';
import { MedicalRecord, EnhancementPreset } from '../types';
import { generateImageAnalysis } from '../services/geminiService';
import Icon from './Icon';

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

const VoiceAssistant: React.FC = () => (
    <div className="fixed bottom-6 right-6 z-50">
        <button className="w-16 h-16 bg-[#0066CC] rounded-full flex items-center justify-center text-white shadow-xl hover:bg-[#0052A3] transition-all transform hover:scale-110">
            <Icon name="microphone" className="w-8 h-8"/>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066CC] opacity-75"></span>
        </button>
    </div>
);


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
      <VoiceAssistant />
    </div>
  );
};

export default EnhancementScreen;
