import React, { useRef, useEffect, useState, useCallback } from 'react';
import Icon from './Icon';

interface LiveCaptureScreenProps {
  onImageSnap: (file: File) => void;
  onCancel: () => void;
}

const LiveCaptureScreen: React.FC<LiveCaptureScreenProps> = ({ onImageSnap, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setStream(newStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please ensure you have given permission and that another app isn't using it.");
    }
  }, [stream]);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSnap = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onImageSnap(file);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-50">
      {error ? (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4 text-red-400">Camera Error</h2>
          <p className="mb-6">{error}</p>
          <button onClick={onCancel} className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">Go Back</button>
        </div>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0"></video>
          
          {/* Overlay */}
          <div className="absolute inset-0 z-10 flex flex-col justify-between">
            {/* Top Bar */}
            <div className="p-4 bg-black/30 flex justify-between items-center">
                <p className="text-sm font-semibold">Patient ID: P-12345</p>
                <div className="px-2 py-1 bg-green-500/80 rounded-full text-xs font-bold">GOOD QUALITY</div>
            </div>

            {/* Rule of Thirds Grid */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              <div className="col-span-1 row-span-1 border-r border-b border-white/20"></div>
              <div className="col-span-1 row-span-1 border-r border-b border-white/20"></div>
              <div className="col-span-1 row-span-1 border-b border-white/20"></div>
              <div className="col-span-1 row-span-1 border-r border-b border-white/20"></div>
              <div className="col-span-1 row-span-1 border-r border-b border-white/20"></div>
              <div className="col-span-1 row-span-1 border-b border-white/20"></div>
              <div className="col-span-1 row-span-1 border-r border-white/20"></div>
              <div className="col-span-1 row-span-1 border-r border-white/20"></div>
            </div>

            <div className="flex-grow flex items-center justify-center">
                 <p className="p-2 bg-black/40 rounded-lg text-sm">Hold steady for optimal lighting</p>
            </div>

            {/* Bottom Controls */}
            <div className="p-6 bg-black/30 flex items-center justify-center">
              <button onClick={handleSnap} className="w-20 h-20 rounded-full bg-white flex items-center justify-center group transform transition hover:scale-105" aria-label="Snap Picture">
                <div className="w-[70px] h-[70px] rounded-full bg-white border-4 border-black/50 group-hover:border-blue-500 transition-colors"></div>
              </button>
            </div>
          </div>
          <button onClick={onCancel} className="absolute top-4 left-4 p-3 bg-black/50 rounded-full z-20" aria-label="Cancel Capture">
              <Icon name="close" className="w-6 h-6"/>
          </button>
        </>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default LiveCaptureScreen;
