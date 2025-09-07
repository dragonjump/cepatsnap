export enum Screen {
  SPLASH = 'SPLASH',
  DASHBOARD = 'DASHBOARD',
  CAPTURE = 'CAPTURE',
  LIVE_CAPTURE = 'LIVE_CAPTURE',
  ENHANCEMENT = 'ENHANCEMENT',
  ANNOTATION = 'ANNOTATION',
  RECORDS = 'RECORDS',
  SETTINGS = 'SETTINGS',
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  timestamp: string;
  imageUrl: string;
  enhancedImageUrl?: string;
  enhancementNotes: string;
  status: 'Pending' | 'Enhanced';
  complianceVerified: boolean;
}

export enum EnhancementPreset {
  AUTO = 'Auto Enhance',
  WOUND = 'Wound Care',
  DERMA = 'Dermatology',
  XRAY = 'X-Ray Mode',
}