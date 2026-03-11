export type CandidateCategory = 'Potential' | 'Normal' | 'Client-Hired';

export type Gender = 'Male' | 'Female' | 'Other';

export type VisaType = 'None' | 'Work Permit' | 'Student' | 'Tourist' | 'Permanent Resident';

export type EnglishLevel = 'Basic' | 'Intermediate' | 'Advanced' | 'Fluent' | 'Native';

export type EmploymentStatus = 'Employed' | 'Seeking' | 'Freelance' | 'Unemployed';

export type WorkType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Hybrid';

export interface WorkHistory {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Candidate {
  id: string;
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  birthDate?: string;
  gender?: Gender;
  visa?: VisaType;
  address?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  
  // Position Applied
  positionApplied?: string;
  
  // Education & Skills
  degree?: string;
  major?: string;
  university?: string;
  graduationYear?: string;
  gpa?: string;
  englishLevel?: EnglishLevel;
  certificates?: string;
  otherLanguages?: string;
  technicalSkills?: string;
  softSkills?: string;
  
  // Career Info
  employmentStatus?: EmploymentStatus;
  experienceField?: string;
  experiencePosition?: string;
  preferredWorkType?: WorkType;
  noticePeriod?: string;
  availableDate?: string;
  
  // Work History
  workHistory: WorkHistory[];
  
  // Salary & Additional
  currentSalary?: number;
  expectedSalary?: number;
  startWorkDate?: string;
  strengths?: string;
  careerGoals?: string;
  
  // New Category Field
  category: CandidateCategory;
  categoryNote?: string; // Notes for Potential candidates
  
  // CV File
  cvUrl?: string;
  cvFileName?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
