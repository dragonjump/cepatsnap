
import React from 'react';
import { Screen } from '../types';
import Icon from './Icon';

interface BottomNavProps {
  activeScreen: Screen;
  setScreen: (screen: Screen) => void;
  onCaptureClick: () => void;
}

const NavItem: React.FC<{
  iconName: 'home' | 'records';
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ iconName, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors ${
      isActive ? 'text-[#0066CC]' : 'text-[#718096] hover:text-[#1A202C]'
    }`}
  >
    <Icon name={iconName} className="w-6 h-6 mb-1" />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setScreen, onCaptureClick }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-20 bg-white/90 backdrop-blur-sm border-t border-[#E2E8F0] md:hidden">
      <NavItem
        iconName="home"
        label="Dashboard"
        isActive={activeScreen === Screen.DASHBOARD}
        onClick={() => setScreen(Screen.DASHBOARD)}
      />
      
      <button onClick={onCaptureClick} className="relative bottom-4 flex items-center justify-center w-32 h-16 rounded-full bg-[#0066CC] text-white shadow-lg shadow-[#0066CC]/50 transform hover:scale-105 transition-transform">
        <Icon name="camera" className="w-8 h-8" />
        <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-pulse"></div>
      </button>

      <NavItem
        iconName="records"
        label="Records"
        isActive={activeScreen === Screen.RECORDS}
        onClick={() => setScreen(Screen.RECORDS)}
      />
    </nav>
  );
};

export default BottomNav;
