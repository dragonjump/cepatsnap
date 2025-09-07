
import React from 'react';
import Icon from './Icon';

const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-[#E2E8F0]">
    <h3 className="text-xl font-semibold text-[#1A202C] border-b border-[#E2E8F0] pb-3 mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Toggle: React.FC<{ label: string; description: string; enabled: boolean; onToggle: () => void }> = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium text-[#1A202C]">{label}</p>
      <p className="text-sm text-[#718096]">{description}</p>
    </div>
    <button onClick={onToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-[#0066CC]' : 'bg-gray-200'}`}>
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const SettingsScreen: React.FC = () => {
  const [autoRedact, setAutoRedact] = React.useState(true);
  const [highQuality, setHighQuality] = React.useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-[#1A202C]">Settings & Compliance</h2>
      
      <SettingSection title="Profile">
        <div className="flex items-center space-x-4">
          <img src="https://i.pravatar.cc/64" alt="User" className="w-16 h-16 rounded-full" />
          <div>
            <p className="text-lg font-semibold">Dr. Amelia Chen</p>
            <p className="text-[#718096]">General Dermatology</p>
            <p className="text-sm text-[#0066CC]">Central City Medical Clinic</p>
          </div>
        </div>
        <button className="text-[#0066CC] font-semibold text-sm hover:underline">Edit Profile</button>
      </SettingSection>

      <SettingSection title="Image Quality">
        <div>
          <label htmlFor="resolution" className="block text-sm font-medium text-[#1A202C]">Default Resolution</label>
          <select id="resolution" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-[#E2E8F0] focus:outline-none focus:ring-[#0066CC] focus:border-[#0066CC] sm:text-sm rounded-md">
            <option>Standard (1920x1080)</option>
            <option>High (3840x2160)</option>
            <option>Original</option>
          </select>
        </div>
        <Toggle 
          label="High Quality Previews"
          description="Use higher resolution for enhancement previews"
          enabled={highQuality}
          onToggle={() => setHighQuality(!highQuality)}
        />
      </SettingSection>

      <SettingSection title="Privacy & Security">
        <Toggle 
          label="Auto-redaction"
          description="Automatically blur faces and identifiable marks"
          enabled={autoRedact}
          onToggle={() => setAutoRedact(!autoRedact)}
        />
        <div className="flex justify-between items-center">
          <p className="font-medium">Encryption</p>
          <span className="text-sm font-semibold text-[#00AA44]">End-to-End Enabled</span>
        </div>
        <button className="text-[#0066CC] font-semibold text-sm hover:underline">Access Audit Log</button>
      </SettingSection>

      <SettingSection title="Compliance">
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Icon name="check" className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">HIPAA Compliant</p>
              <p className="text-sm text-green-700">Your account meets all compliance standards.</p>
            </div>
          </div>
          <a href="#" className="text-sm font-semibold text-green-800 hover:underline">View Certificate</a>
        </div>
      </SettingSection>
    </div>
  );
};

export default SettingsScreen;
