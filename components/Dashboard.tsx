import React, { useState, useEffect } from 'react';
import Icon from './Icon';

interface DashboardProps {
  onLiveCaptureClick: () => void;
  onUploadClick: () => void;
  onViewRecordsClick: () => void;
}

const workflowSteps: { icon: 'microphone' | 'camera' | 'ruler' | 'save'; text: string }[] = [
  { icon: 'microphone', text: '“Add a 2cm measurement...”' },
  { icon: 'camera', text: 'Capturing clear, enhanced image...' },
  { icon: 'ruler', text: 'Applying annotation overlay...' },
  { icon: 'save', text: 'Saved to patient record.' },
];

const Dashboard: React.FC<DashboardProps> = ({ onLiveCaptureClick, onUploadClick, onViewRecordsClick }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep + 1) % workflowSteps.length);
    }, 2500); // Change step every 2.5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-10rem)] py-8">
      
      {/* Animated Hero Visual */}
      <div className="w-full max-w-sm h-72 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {workflowSteps.map((step, index) => (
          <div
            key={step.icon}
            className={`absolute inset-0 p-6 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
              index === currentStep ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-5 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-center w-24 h-24 bg-[#0066CC]/10 rounded-full mb-4">
              <Icon name={step.icon} className="w-12 h-12 text-[#0066CC]" />
            </div>
            <p className="font-semibold text-lg text-[#1A202C]">{step.text}</p>
          </div>
        ))}
      </div>
      
      {/* Hero Text */}
      <h1 className="text-3xl md:text-4xl font-bold text-[#1A202C] mt-8">
        AI-Powered Documentation, Instantly.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-[#718096]">
        Capture, enhance, and annotate medical images with just your voice. Streamline your workflow in seconds.
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={onLiveCaptureClick}
          className="flex items-center gap-2 w-full sm:w-auto justify-center px-8 py-4 bg-[#0066CC] text-white font-semibold rounded-lg shadow-lg shadow-[#0066CC]/30 hover:bg-[#0052A3] transition-colors transform hover:scale-105"
        >
          <Icon name="camera" className="w-6 h-6" />
          Live Capture
        </button>
        <button
          onClick={onUploadClick}
          className="w-full sm:w-auto px-8 py-4 font-semibold text-[#718096] bg-white rounded-lg border border-[#E2E8F0] hover:bg-gray-50 transition-colors"
        >
          Edit Captures
        </button>
      </div>
       <div className="mt-4">
        <button
          onClick={onViewRecordsClick}
          className="font-semibold text-sm text-[#718096] hover:text-[#0066CC] transition-colors"
        >
          or View Patient Records
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
