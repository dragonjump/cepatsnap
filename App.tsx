
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Screen, MedicalRecord, EnhancementPreset } from './types';
import SplashScreen from './components/SplashScreen';
import Dashboard from './components/Dashboard';
import EnhancementScreen from './components/EnhancementScreen';
import RecordsScreen from './components/RecordsScreen';
import SettingsScreen from './components/SettingsScreen';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

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

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentImage({ file, url: URL.createObjectURL(file) });
      setScreen(Screen.ENHANCEMENT);
    }
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
      case Screen.ENHANCEMENT:
        if (currentImage) {
          return <EnhancementScreen image={currentImage} onSave={handleSaveRecord} onCancel={handleEnhancementCancel} />;
        }
        return <Dashboard onCaptureClick={handleCaptureClick} recentRecords={records.slice(0, 4)} />; // Fallback
      case Screen.RECORDS:
        return <RecordsScreen records={records} />;
      case Screen.SETTINGS:
        return <SettingsScreen />;
      case Screen.DASHBOARD:
      default:
        return <Dashboard onCaptureClick={handleCaptureClick} recentRecords={records.slice(0, 4)} />;
    }
  };

  if (screen === Screen.SPLASH) {
    return <SplashScreen onFinished={() => setScreen(Screen.DASHBOARD)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-[#1A202C]">
      <Header onSettingsClick={() => setScreen(Screen.SETTINGS)} />
      <main className="pb-24 pt-16 md:pt-20 px-4 md:px-8">
        {renderScreen()}
      </main>
      <BottomNav activeScreen={screen} setScreen={setScreen} onCaptureClick={handleCaptureClick} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default App;
