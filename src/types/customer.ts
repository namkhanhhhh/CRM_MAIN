export type CustomerStatus = 
  | 'Research'
  | 'Addfriend/Connect'
  | 'Approach'
  | 'Follow up'
  | 'Consulting'
  | 'Demo contract'
  | 'Working'
  | 'Pending'
  | 'Signing'
  | 'Signed'
  | 'Meeting Clear JD'
  | 'Hunting'
  | 'Hiring'
  | 'Take care'
  | 'No current need'
  | 'Excluded'
  | 'Closed'
  | 'Rejected';

export type CustomerDomain = 
  | 'IT'
  | 'IT - product'
  | 'IT - outsourcing'
  | 'Ecommerce'
  | 'Game'
  | 'Mobile app'
  | 'Non IT (Manufacturing)'
  | 'Non IT (Logistic)'
  | 'Non IT (FMCG)'
  | 'Non IT (BĐS)'
  | 'Non IT (Retail)'
  | 'Non-IT'
  | 'Others';

export type JobSource = 
  | 'Facebook'
  | 'Linkedin'
  | 'Thread'
  | 'Itviec'
  | 'Topdev'
  | 'Aniday'
  | 'Job Portal'
  | 'Referral'
  | 'Khác';

export type Priority = 'high' | 'normal';

export interface ContactInfo {
  name: string;
  linkedin?: string;
  phone?: string;
  email?: string;
}

export interface ContractStatus {
  dealInfo?: string;
  actualRevenue?: number;
}

export interface Customer {
  id: string;
  date: string;
  remindDate?: string;
  status: CustomerStatus;
  domain: CustomerDomain;
  companyName: string;
  companyNote?: string;
  job?: string;
  jobLink?: string;
  jobSource?: JobSource;
  contacts: ContactInfo[];
  contractStatus?: ContractStatus;
  priority: Priority;
  bdAssigned?: string;
  communicationHistory?: string;
  nextStep?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BDUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Reminder {
  id: string;
  customerId: string;
  customerName: string;
  remindDate: string;
  status: CustomerStatus;
  message: string;
  isRead: boolean;
}

export interface StatusHistoryEntry {
  id: string;
  timestamp: string;
  previousStatus: CustomerStatus;
  newStatus: CustomerStatus;
  changedBy: string;
  note?: string;
}

export type CommunicationMethod = 'message' | 'call' | 'email' | 'meeting';

export interface CommunicationHistoryEntry {
  id: string;
  timestamp: string;
  bdId: string;
  contactName: string;
  method: CommunicationMethod;
  note: string;
}

export type RemindMilestone = 7 | 15 | 30;

export type CustomReminderType = CustomerStatus;

export interface CustomReminder {
  id: string;
  customerId: string;
  customerName: string;
  remindDate: string;
  note: string;
  type: CustomReminderType;
  createdBy: string; // BD id
  createdAt: string;
  isCompleted: boolean;
  completedAt?: string;
}

// Statuses that use milestone reminders (7/15/30)
export const MILESTONE_STATUSES: CustomerStatus[] = ['Research', 'Addfriend/Connect', 'Approach'];

// Statuses that use custom reminders (Follow up trở xuống)
export const CUSTOM_REMINDER_STATUSES: CustomerStatus[] = [
  'Follow up', 'Consulting', 'Demo contract', 'Working', 'Pending',
  'Signing', 'Signed', 'Meeting Clear JD', 'Hunting', 'Hiring',
  'Take care', 'No current need', 'Excluded', 'Closed', 'Rejected',
];

// Color mapping for custom reminder status types
export const CUSTOM_REMINDER_STATUS_COLORS: Record<string, string> = {
  'Follow up': 'bg-orange-500',
  'Consulting': 'bg-purple-500',
  'Demo contract': 'bg-pink-500',
  'Working': 'bg-violet-500',
  'Pending': 'bg-yellow-500',
  'Signing': 'bg-cyan-500',
  'Signed': 'bg-green-500',
  'Meeting Clear JD': 'bg-teal-500',
  'Hunting': 'bg-emerald-500',
  'Hiring': 'bg-lime-500',
  'Take care': 'bg-sky-500',
  'No current need': 'bg-gray-400',
  'Excluded': 'bg-red-500',
  'Closed': 'bg-stone-500',
  'Rejected': 'bg-red-600',
};
