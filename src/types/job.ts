export type JobStatus = 'Open' | 'Closed' | 'Cancelled' | 'On Hold';

export type Industry = 
  | 'IT - Phần mềm'
  | 'IT - Phần cứng'
  | 'Ecommerce'
  | 'Fintech'
  | 'Banking'
  | 'Manufacturing'
  | 'Logistics'
  | 'Retail'
  | 'Healthcare'
  | 'Education'
  | 'Consulting'
  | 'Non-IT'
  | 'Khác';

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';

export interface OpenJob {
  id: string;
  code: string; // TDC00476
  title: string;
  clientId: string;
  clientName: string;
  salary: string; // "Upto 30M", "8M - 12M", "$2000 - $2500"
  location: string;
  interviewRounds: number; // Số vòng PV
  guaranteeDays: number; // Bảo hành 30/60/90 ngày
  industry: Industry;
  jobType: JobType;
  status: JobStatus;
  candidateCount: number; // Số lượng tuyển
  appliedCount: number; // Số ứng viên đã apply
  ownerId: string;
  ownerName: string;
  description: string; // Mô tả công việc (HTML/Markdown)
  requirements: string; // Yêu cầu
  benefits: string; // Quyền lợi
  workingTime: string;
  workingLocation: string;
  jdDetails: string; // JD chi tiết bổ sung
  serviceFee?: string; // Phí dịch vụ
  createdAt: string;
  updatedAt: string;
  postedAt: string; // Ngày đăng
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobCode: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  cvUrl: string;
  cvFileName: string;
  headhunterId: string; // Headhunter sở hữu link
  headhunterName: string;
  note?: string;
  status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected' | 'Processed';
  appliedAt: string;
  source: 'Apply Link' | 'Direct' | 'Referral';
}

export interface JobComment {
  id: string;
  jobId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

// Generate apply link for headhunter
export const generateApplyLink = (jobCode: string, headhunterId: string): string => {
  // Format: /apply/{headhunter-slug}/{job-code}
  return `/apply/${headhunterId}/${jobCode.toLowerCase()}`;
};
