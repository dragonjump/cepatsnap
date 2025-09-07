
import React, { useState, useMemo } from 'react';
import { MedicalRecord } from '../types';
import Icon from './Icon';

const RecordCard: React.FC<{ record: MedicalRecord }> = ({ record }) => (
  <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] overflow-hidden group transition-all hover:shadow-md">
    <img src={record.imageUrl} alt={`Record for ${record.patientId}`} className="w-full h-40 object-cover" />
    <div className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-sm text-[#1A202C]">{record.patientId}</p>
          <p className="text-xs text-[#718096]">{new Date(record.timestamp).toLocaleString()}</p>
        </div>
        {record.complianceVerified && (
          <div className="flex items-center gap-1 text-xs text-[#00AA44] bg-[#00AA44]/10 px-2 py-1 rounded-full">
            <Icon name="check" className="w-4 h-4" />
            <span>Verified</span>
          </div>
        )}
      </div>
      <p className="text-sm mt-2 text-[#1A202C] line-clamp-2">{record.enhancementNotes}</p>
    </div>
  </div>
);

const RecordRow: React.FC<{ record: MedicalRecord }> = ({ record }) => (
  <tr className="border-b border-[#E2E8F0] hover:bg-gray-50">
    <td className="p-4">
      <img src={record.imageUrl} alt={`Record for ${record.patientId}`} className="w-16 h-12 object-cover rounded-md" />
    </td>
    <td className="p-4 font-semibold text-[#1A202C]">{record.patientId}</td>
    <td className="p-4 text-[#718096]">{new Date(record.timestamp).toLocaleDateString()}</td>
    <td className="p-4">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${record.status === 'Enhanced' ? 'bg-[#00AA44]/10 text-[#00AA44]' : 'bg-yellow-100 text-yellow-800'}`}>
        {record.status}
      </span>
    </td>
    <td className="p-4">
      <button className="text-[#0066CC] hover:underline text-sm font-medium">Details</button>
    </td>
  </tr>
);

const RecordsScreen: React.FC<{ records: MedicalRecord[] }> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredRecords = useMemo(() => {
    return records.filter(record =>
      record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.enhancementNotes.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#1A202C]">Medical Records</h2>
      
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 bg-white rounded-lg border border-[#E2E8F0]">
        <div className="relative w-full md:w-auto flex-grow">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Patient ID or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#0066CC] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#718096]">View:</span>
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-[#0066CC]/10 text-[#0066CC]' : 'text-gray-500 hover:bg-gray-100'}`}>
            <Icon name="grid" className="w-5 h-5" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-[#0066CC]/10 text-[#0066CC]' : 'text-gray-500 hover:bg-gray-100'}`}>
            <Icon name="list" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecords.map(record => <RecordCard key={record.id} record={record} />)}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs text-[#718096] uppercase">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Patient ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => <RecordRow key={record.id} record={record} />)}
            </tbody>
          </table>
        </div>
      )}
      {filteredRecords.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-[#E2E8F0]">
            <p className="text-[#718096]">No records found for your search.</p>
        </div>
      )}
    </div>
  );
};

export default RecordsScreen;
