
import React, { useState } from 'react';
import { MedicalRecord } from '../types';
import Icon from './Icon';

const RecordCard: React.FC<{ record: MedicalRecord }> = ({ record }) => {
  const formattedDate = new Date(record.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-lg shadow-md border border-[#E2E8F0] overflow-hidden transition-shadow hover:shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <img
          src={record.enhancedImageUrl || record.imageUrl}
          alt={`Medical record ${record.id}`}
          className="w-full h-48 object-cover"
        />
        <div className="p-4 flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg text-[#1A202C]">{record.id}</p>
                <p className="text-sm text-[#718096]">Patient: {record.patientId}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  record.status === 'Enhanced'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {record.status}
              </span>
            </div>
            <p className="text-sm text-[#718096] mt-2">{formattedDate}</p>
            <p className="mt-4 text-sm text-[#1A202C] line-clamp-2">
              <strong>Notes:</strong> {record.enhancementNotes}
            </p>
          </div>
          <div className="mt-4 flex justify-between items-center text-xs text-[#718096]">
            {record.complianceVerified && (
              <div className="flex items-center gap-1 text-green-600">
                <Icon name="check" className="w-4 h-4" />
                <span>HIPAA Verified</span>
              </div>
            )}
             <button className="font-semibold text-[#0066CC] hover:underline">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecordsScreen: React.FC<{ records: MedicalRecord[] }> = ({ records }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(true);

  const filteredRecords = records.filter(
    (record) =>
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      {showToast && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg relative mb-6 flex items-start" role="alert">
          <Icon name="settings" className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-blue-500"/>
          <div>
            <strong className="font-bold">This feature is under development.</strong>
            <span className="block sm:inline ml-1">All records shown are mock data for demonstration purposes only.</span>
          </div>
          <button onClick={() => setShowToast(false)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close">
            <Icon name="close" className="w-4 h-4 text-blue-500"/>
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-[#1A202C]">Patient Records</h2>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:outline-none"
            />
          </div>
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}>
              <Icon name="grid" className={`w-5 h-5 ${viewMode === 'grid' ? 'text-[#0066CC]' : 'text-gray-500'}`} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow' : ''}`}>
              <Icon name="list" className={`w-5 h-5 ${viewMode === 'list' ? 'text-[#0066CC]' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>
      </div>

      {filteredRecords.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {filteredRecords.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-[#718096]">No records found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default RecordsScreen;
