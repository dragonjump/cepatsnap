import React, { useEffect, useRef } from 'react';
import Icon from './Icon';

interface SplashScreenProps {
  onFinished: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  // Fix: Changed NodeJS.Timeout to ReturnType<typeof setTimeout> for browser compatibility.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFinish = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onFinished();
  };

  useEffect(() => {
    timerRef.current = setTimeout(handleFinish, 3000); // 3-second splash screen
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFinished]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div
        onClick={handleFinish}
        className="flex flex-col items-center justify-center cursor-pointer"
        role="button"
        aria-label="Start CepatSnap"
        tabIndex={0}
      >
        <div className="relative flex items-center justify-center w-40 h-40">
          <div className="absolute w-24 h-24 text-[#0066CC]">
            <Icon name="camera" className="w-full h-full" />
          </div>
          <div className="absolute w-12 h-12 text-yellow-400">
            <Icon name="lightning" className="w-full h-full" />
          </div>
          <div className="absolute w-12 h-12 text-[#0066CC] animate-ping">
            <Icon name="pulse-cross" className="w-full h-full opacity-75" />
          </div>
        </div>

        <div className="text-center mt-4">
          <h1 className="text-4xl font-bold text-[#0066CC]">CepatSnap</h1>
          <p className="text-[#718096] mt-2">Dokumentasi medis dalam sekejap</p>
          <p className="text-sm text-gray-400 mt-1">Medical documentation in a snap</p>
        </div>
      </div>

      <div className="absolute bottom-10 text-center">
        <p className="text-sm text-[#718096]">Powered by Gemini and 11Labs</p>
      </div>
    </div>
  );
};

export default SplashScreen;
