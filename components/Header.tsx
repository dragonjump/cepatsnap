
import React from 'react';
import Icon from './Icon';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b border-[#E2E8F0]">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Icon name="logo" className="w-8 h-8 text-[#0066CC]" />
          <span className="text-xl font-bold text-[#0066CC]">CepatSnap</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onSettingsClick} className="p-2 text-[#718096] hover:text-[#1A202C] transition-colors">
            <Icon name="settings" className="w-6 h-6" />
          </button>
          <div className="w-8 h-8 bg-gray-200 rounded-full">
            <img src="https://i.pravatar.cc/32" alt="User profile" className="rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
