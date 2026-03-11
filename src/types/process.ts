export type ProcessStatus =
  | 'APPLIED'
  | 'REJECT BY ADMIN'
  | 'CV SUBMITTED TO CLIENT'
  | 'INTERVIEW SCHEDULED 1ST'
  | 'INTERVIEW COMPLETED 1ST'
  | 'INTERVIEW SCHEDULED 2ND'
  | 'INTERVIEW COMPLETED 2ND'
  | 'INTERVIEW SCHEDULED 3RD'
  | 'INTERVIEW COMPLETED 3RD'
  | 'INTERVIEW SCHEDULED FINAL'
  | 'INTERVIEW COMPLETED FINAL'
  | 'TEST ASSIGNED'
  | 'TEST COMPLETED'
  | 'REFERENCE CHECK IN PROGRESS'
  | 'REFERENCE CHECK COMPLETED'
  | 'OFFER EXTENDED'
  | 'OFFER ACCEPTED BY CANDIDATE'
  | 'OFFER DECLINED BY CANDIDATE'
  | 'REJECTED BY CLIENT'
  | 'CANDIDATE WITHDREW'
  | 'PLACEMENT CONFIRMED'
  | 'ONBOARDING'
  | 'GUARANTEE PERIOD'
  | 'PAYMENT RECEIVED'
  | 'PROCESS ON HOLD'
  | 'PROCESS CANCELLED';

export type JobStatus = 'Open' | 'Cancelled';

export type UserStatus = 'Approved' | 'Banned';

export interface ProcessRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  jobCode: string;
  clientId: string;
  clientName: string;
  ownerId: string;
  ownerName: string;
  status: ProcessStatus;
  onboardingDate?: string;
  revenue?: number; // VND, chưa gồm VAT
  processNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobRecord {
  id: string;
  title: string;
  code: string;
  clientId: string;
  clientName: string;
  status: JobStatus;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Recruiter' | 'BD' | 'Manager';
  status: UserStatus;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

// Active statuses for process statistics (excluding On hold and Cancelled)
export const ACTIVE_PROCESS_STATUSES: ProcessStatus[] = [
  'APPLIED',
  'REJECT BY ADMIN',
  'CV SUBMITTED TO CLIENT',
  'INTERVIEW SCHEDULED 1ST',
  'INTERVIEW COMPLETED 1ST',
  'INTERVIEW SCHEDULED 2ND',
  'INTERVIEW COMPLETED 2ND',
  'INTERVIEW SCHEDULED 3RD',
  'INTERVIEW COMPLETED 3RD',
  'INTERVIEW SCHEDULED FINAL',
  'INTERVIEW COMPLETED FINAL',
  'TEST ASSIGNED',
  'TEST COMPLETED',
  'REFERENCE CHECK IN PROGRESS',
  'REFERENCE CHECK COMPLETED',
  'OFFER EXTENDED',
  'OFFER ACCEPTED BY CANDIDATE',
  'OFFER DECLINED BY CANDIDATE',
  'REJECTED BY CLIENT',
  'CANDIDATE WITHDREW',
  'PLACEMENT CONFIRMED',
  'ONBOARDING',
  'GUARANTEE PERIOD',
  'PAYMENT RECEIVED',
];

// Process status categories for chart display
export const PROCESS_STATUS_CATEGORIES = {
  'Application': ['APPLIED', 'REJECT BY ADMIN', 'CV SUBMITTED TO CLIENT'],
  'Interview': [
    'INTERVIEW SCHEDULED 1ST', 'INTERVIEW COMPLETED 1ST',
    'INTERVIEW SCHEDULED 2ND', 'INTERVIEW COMPLETED 2ND',
    'INTERVIEW SCHEDULED 3RD', 'INTERVIEW COMPLETED 3RD',
    'INTERVIEW SCHEDULED FINAL', 'INTERVIEW COMPLETED FINAL',
  ],
  'Assessment': ['TEST ASSIGNED', 'TEST COMPLETED', 'REFERENCE CHECK IN PROGRESS', 'REFERENCE CHECK COMPLETED'],
  'Offer': ['OFFER EXTENDED', 'OFFER ACCEPTED BY CANDIDATE', 'OFFER DECLINED BY CANDIDATE'],
  'Outcome': ['REJECTED BY CLIENT', 'CANDIDATE WITHDREW', 'PLACEMENT CONFIRMED'],
  'Completion': ['ONBOARDING', 'GUARANTEE PERIOD', 'PAYMENT RECEIVED'],
};
