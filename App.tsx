import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Screen, MedicalRecord, EnhancementPreset } from './types';
import SplashScreen from './components/SplashScreen';
import Dashboard from './components/Dashboard';
import LiveCaptureScreen from './components/LiveCaptureScreen';
import EnhancementScreen from './components/EnhancementScreen';
import RecordsScreen from './components/RecordsScreen';
import SettingsScreen from './components/SettingsScreen';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.SPLASH);
  const [currentImage, setCurrentImage] = useState<{ file: File; url: string } | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Simulate loading initial records
    const mockRecords: MedicalRecord[] = [
      { id: 'REC-001', patientId: 'PID-8432', timestamp: new Date(Date.now() - 86400000).toISOString(), imageUrl: 'https://picsum.photos/seed/rec1/300/200', enhancedImageUrl: 'https://picsum.photos/seed/rec1e/300/200', enhancementNotes: 'AI analysis indicates healthy tissue regeneration.', status: 'Enhanced', complianceVerified: true },
      { id: 'REC-002', patientId: 'PID-1987', timestamp: new Date(Date.now() - 172800000).toISOString(), imageUrl: 'https://picsum.photos/seed/rec2/300/200', enhancedImageUrl: 'https://picsum.photos/seed/rec2e/300/200', enhancementNotes: 'Minor inflammation detected on the upper-left quadrant.', status: 'Enhanced', complianceVerified: true },
    ];
    setRecords(mockRecords);
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleLiveCaptureClick = () => {
    setScreen(Screen.LIVE_CAPTURE);
  };
  
  const handleViewRecordsClick = () => {
    setScreen(Screen.RECORDS);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentImage({ file, url: URL.createObjectURL(file) });
      setScreen(Screen.ENHANCEMENT);
    }
  };
  
  const handleImageSnap = (file: File) => {
    setCurrentImage({ file, url: URL.createObjectURL(file) });
    setScreen(Screen.ENHANCEMENT);
  };

  const handleSaveRecord = (record: Omit<MedicalRecord, 'id' | 'timestamp'>) => {
    const newRecord: MedicalRecord = {
      ...record,
      id: `REC-${String(records.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
    };
    setRecords(prev => [newRecord, ...prev]);
    setScreen(Screen.RECORDS);
    setCurrentImage(null);
  };
  
  const handleEnhancementCancel = () => {
    setCurrentImage(null);
    setScreen(Screen.DASHBOARD);
  }

  const renderScreen = () => {
    switch (screen) {
      case Screen.SPLASH:
        return <SplashScreen onFinished={() => setScreen(Screen.DASHBOARD)} />;
      case Screen.LIVE_CAPTURE:
        return <LiveCaptureScreen onImageSnap={handleImageSnap} onCancel={() => setScreen(Screen.DASHBOARD)} />;
      case Screen.ENHANCEMENT:
        if (currentImage) {
          return <EnhancementScreen image={currentImage} onSave={handleSaveRecord} onCancel={handleEnhancementCancel} />;
        }
        return <Dashboard onLiveCaptureClick={handleLiveCaptureClick} onUploadClick={handleUploadClick} onViewRecordsClick={handleViewRecordsClick} />; // Fallback
      case Screen.RECORDS:
        return <RecordsScreen records={records} />;
      case Screen.SETTINGS:
        return <SettingsScreen />;
      case Screen.DASHBOARD:
      default:
        return <Dashboard onLiveCaptureClick={handleLiveCaptureClick} onUploadClick={handleUploadClick} onViewRecordsClick={handleViewRecordsClick} />;
    }
  };

  if (screen === Screen.SPLASH) {
    return <SplashScreen onFinished={() => setScreen(Screen.DASHBOARD)} />;
  }
  
  const isFullScreen = screen === Screen.LIVE_CAPTURE;

  if (isFullScreen) {
    return renderScreen();
  }


  return (
    <div className="min-h-screen bg-[#F8FAFB] text-[#1A202C]">
      <Header onLogoClick={() => setScreen(Screen.DASHBOARD)} onSettingsClick={() => setScreen(Screen.SETTINGS)} />
      <main className="pb-24 pt-16 md:pt-20 px-4 md:px-8">
        {renderScreen()}
      </main>
      <BottomNav activeScreen={screen} setScreen={setScreen} onCaptureClick={handleLiveCaptureClick} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      <Toaster />
    </div>
  );
};

export default App;