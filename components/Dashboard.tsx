
import React from 'react';
import Icon from './Icon';
import { MedicalRecord } from '../types';

interface DashboardProps {
  onCaptureClick: () => void;
  recentRecords: MedicalRecord[];
}

const StatsCard: React.FC<{ title: string; value: string; icon: 'camera' | 'check' | 'save' }> = ({ title, value, icon }) => (
  <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-[#E2E8F0]">
    <div className={`p-3 rounded-full bg-[#0066CC]/10 text-[#0066CC]`}>
      <Icon name={icon} className="w-6 h-6" />
    </div>
    <div className="ml-4">
      <p className="text-sm text-[#718096]">{title}</p>
      <p className="text-xl font-bold text-[#1A202C]">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onCaptureClick, recentRecords }) => {
  return (
    <div className="space-y-8">
      <section>
        <div className="p-6 bg-white rounded-xl shadow-md border border-[#E2E8F0]">
          <h2 className="text-2xl font-semibold text-[#1A202C] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={onCaptureClick} className="flex flex-col items-center justify-center p-4 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors shadow-lg shadow-[#0066CC]/30">
              <Icon name="camera" className="w-10 h-10 mb-2" />
              <span className="font-semibold">Capture Image</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-white text-[#1A202C] rounded-lg border border-[#E2E8F0] hover:bg-gray-50 transition-colors">
              <Icon name="records" className="w-10 h-10 mb-2 text-[#0066CC]" />
              <span className="font-semibold">View Records</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-[#FF6B35]/10 text-[#FF6B35] rounded-lg border border-[#FF6B35]/30 hover:bg-[#FF6B35]/20 transition-colors">
              <Icon name="lightning" className="w-10 h-10 mb-2" />
              <span className="font-semibold">Emergency Doc</span>
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Daily Captures" value="42" icon="camera" />
        <StatsCard title="Time Saved" value="~1.5h" icon="save" />
        <StatsCard title="Compliance" value="99.8%" icon="check" />
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-[#1A202C] mb-4">Recent Images</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recentRecords.map(record => (
            <div key={record.id} className="relative group overflow-hidden rounded-lg shadow-sm border border-[#E2E8F0]">
              <img src={record.imageUrl} alt={`Record ${record.id}`} className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                <p className="text-xs font-bold">{record.patientId}</p>
                <p className="text-xs">{new Date(record.timestamp).toLocaleDateString()}</p>
              </div>
              <div className="absolute top-2 right-2 p-1 rounded-full bg-[#00AA44]/80 text-white">
                <Icon name="check" className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
