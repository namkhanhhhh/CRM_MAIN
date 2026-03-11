import { ProcessRecord, JobRecord, SystemUser, ProcessStatus, ACTIVE_PROCESS_STATUSES } from '@/types/process';

// Helper to get dynamic dates
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const getISOString = (daysAgo: number, hours: number = 8): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

// Random helper
const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Candidate names
const candidateNames = [
  'Nguyễn Nam Khánh', 'Trần Thị Hương', 'Lê Văn Minh', 'Phạm Thị Lan', 'Đỗ Quang Hải',
  'Vũ Thị Mai', 'Hoàng Văn Đức', 'Ngô Thị Hoa', 'Đinh Văn Tùng', 'Bùi Thị Nga',
  'Lý Văn Khang', 'Dương Thị Linh', 'Phan Văn Long', 'Tạ Thị Uyên', 'Võ Văn Sơn',
  'Hồ Thị Thảo', 'Nguyễn Văn An', 'Trần Thị Bích', 'Lê Văn Cường', 'Phạm Thị Diệu',
  'Nguyễn Minh Tuấn', 'Trần Hoàng Nam', 'Lê Thị Thu', 'Phạm Văn Đạt', 'Đỗ Thị Hằng'
];

const companyNames = [
  'VNG Corporation', 'FPT Software', 'Viettel Group', 'VNPAY', 'MoMo', 'Tiki', 'Shopee Vietnam',
  'Grab Vietnam', 'Lazada Vietnam', 'Zalo', 'VinAI', 'BAEMIN Vietnam', 'Gojek Vietnam',
  'TMA Solutions', 'NashTech', 'Axon Active', 'KMS Technology', 'Harvey Nash Vietnam'
];

const jobTitles = [
  'Senior Backend Developer', 'Frontend Developer', 'Full-Stack Developer', 'DevOps Engineer',
  'iOS Developer', 'Android Developer', 'React Native Developer', 'Flutter Developer',
  'Java Developer', 'Python Developer', 'QA Engineer', 'Product Manager', 'Tech Lead'
];

const ownerNames = [
  { id: '1', name: 'Nguyễn Văn A' },
  { id: '2', name: 'Trần Thị B' },
  { id: '3', name: 'Lê Văn C' },
  { id: '4', name: 'Phạm Thị D' },
];

// Generate mock jobs
const generateMockJobs = (): JobRecord[] => {
  const jobs: JobRecord[] = [];
  
  for (let i = 1; i <= 250; i++) {
    const owner = ownerNames[i % ownerNames.length];
    const company = companyNames[i % companyNames.length];
    const jobTitle = jobTitles[i % jobTitles.length];
    const daysAgo = Math.floor(Math.random() * 90) + 1;
    
    // 88% Open, 12% Cancelled
    const status: 'Open' | 'Cancelled' = i % 8 === 0 ? 'Cancelled' : 'Open';
    
    jobs.push({
      id: `job-${i}`,
      title: jobTitle,
      code: `TDC${String(i).padStart(5, '0')}`,
      clientId: `client-${i % 18 + 1}`,
      clientName: company,
      status,
      ownerId: owner.id,
      ownerName: owner.name,
      createdAt: getISOString(daysAgo, 9),
      updatedAt: getISOString(Math.max(1, daysAgo - 5), 14),
    });
  }
  
  return jobs;
};

// Generate mock processes
const generateMockProcesses = (): ProcessRecord[] => {
  const processes: ProcessRecord[] = [];
  const activeStatuses = ACTIVE_PROCESS_STATUSES;
  
  // Status distribution for realistic data
  const statusDistribution: ProcessStatus[] = [
    // More in early stages
    ...Array(15).fill('APPLIED'),
    ...Array(5).fill('REJECT BY ADMIN'),
    ...Array(20).fill('CV SUBMITTED TO CLIENT'),
    ...Array(12).fill('INTERVIEW SCHEDULED 1ST'),
    ...Array(10).fill('INTERVIEW COMPLETED 1ST'),
    ...Array(8).fill('INTERVIEW SCHEDULED 2ND'),
    ...Array(6).fill('INTERVIEW COMPLETED 2ND'),
    ...Array(3).fill('INTERVIEW SCHEDULED 3RD'),
    ...Array(2).fill('INTERVIEW COMPLETED 3RD'),
    ...Array(5).fill('INTERVIEW SCHEDULED FINAL'),
    ...Array(4).fill('INTERVIEW COMPLETED FINAL'),
    ...Array(6).fill('TEST ASSIGNED'),
    ...Array(5).fill('TEST COMPLETED'),
    ...Array(3).fill('REFERENCE CHECK IN PROGRESS'),
    ...Array(3).fill('REFERENCE CHECK COMPLETED'),
    ...Array(8).fill('OFFER EXTENDED'),
    ...Array(6).fill('OFFER ACCEPTED BY CANDIDATE'),
    ...Array(4).fill('OFFER DECLINED BY CANDIDATE'),
    ...Array(10).fill('REJECTED BY CLIENT'),
    ...Array(5).fill('CANDIDATE WITHDREW'),
    ...Array(8).fill('PLACEMENT CONFIRMED'),
    ...Array(12).fill('ONBOARDING'),
    ...Array(6).fill('GUARANTEE PERIOD'),
    ...Array(8).fill('PAYMENT RECEIVED'),
    // Some on hold and cancelled
    ...Array(10).fill('PROCESS ON HOLD'),
    ...Array(8).fill('PROCESS CANCELLED'),
  ];
  
  for (let i = 1; i <= 200; i++) {
    const owner = ownerNames[i % ownerNames.length];
    const company = companyNames[i % companyNames.length];
    const jobTitle = jobTitles[i % jobTitles.length];
    const candidateName = candidateNames[i % candidateNames.length];
    const daysAgo = Math.floor(Math.random() * 60) + 1;
    
    const status = statusDistribution[i % statusDistribution.length];
    
    // Generate revenue for ONBOARDING+ statuses
    const hasRevenue = ['ONBOARDING', 'GUARANTEE PERIOD', 'PAYMENT RECEIVED'].includes(status);
    const revenue = hasRevenue ? (Math.floor(Math.random() * 50) + 10) * 1000000 : undefined; // 10M - 60M VND
    
    // Generate onboarding date for ONBOARDING+ statuses
    const onboardingDate = hasRevenue ? getDateString(Math.floor(Math.random() * 30)) : undefined;
    
    processes.push({
      id: `process-${i}`,
      candidateId: `candidate-${i}`,
      candidateName,
      candidateEmail: `${candidateName.toLowerCase().replace(/\s+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@gmail.com`,
      jobId: `job-${(i % 50) + 1}`,
      jobTitle,
      jobCode: `TDC${String((i % 50) + 1).padStart(5, '0')}`,
      clientId: `client-${i % 18 + 1}`,
      clientName: company,
      ownerId: owner.id,
      ownerName: `${owner.name} (Admin)`,
      status,
      onboardingDate,
      revenue,
      processNote: hasRevenue ? 'Xác nhận ứng viên' : undefined,
      createdAt: getISOString(daysAgo, 9),
      updatedAt: getISOString(Math.max(1, daysAgo - 3), 11),
    });
  }
  
  return processes;
};

// Generate mock system users
const generateMockUsers = (): SystemUser[] => {
  const users: SystemUser[] = [];
  const roles: ('Admin' | 'Recruiter' | 'BD' | 'Manager')[] = ['Admin', 'Recruiter', 'BD', 'Manager'];
  
  const allNames = [
    ...candidateNames,
    'Nguyễn Thị Hạnh', 'Trần Văn Phúc', 'Lê Thị Kim', 'Phạm Văn Hùng', 'Đỗ Thị Loan'
  ];
  
  for (let i = 1; i <= 32; i++) {
    const name = allNames[i % allNames.length];
    const role = roles[i % roles.length];
    const daysAgo = Math.floor(Math.random() * 180) + 30;
    
    // 90% Approved, 10% Banned (some pending approval simulation)
    const status: 'Approved' | 'Banned' = i % 10 === 0 ? 'Banned' : 'Approved';
    
    users.push({
      id: `user-${i}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@tdconsulting.vn`,
      role,
      status,
      createdAt: getISOString(daysAgo, 9),
      lastLoginAt: status === 'Approved' ? getISOString(Math.floor(Math.random() * 7), 10) : undefined,
    });
  }
  
  return users;
};

export const mockJobs: JobRecord[] = generateMockJobs();
export const mockProcesses: ProcessRecord[] = generateMockProcesses();
export const mockSystemUsers: SystemUser[] = generateMockUsers();

// Helper functions for statistics
export const getJobStats = () => {
  const open = mockJobs.filter(j => j.status === 'Open').length;
  const cancelled = mockJobs.filter(j => j.status === 'Cancelled').length;
  return { open, cancelled, total: mockJobs.length };
};

export const getUserStats = () => {
  const approved = mockSystemUsers.filter(u => u.status === 'Approved').length;
  const banned = mockSystemUsers.filter(u => u.status === 'Banned').length;
  return { approved, banned, total: mockSystemUsers.length };
};

export const getProcessStats = () => {
  // Exclude On hold and Cancelled
  const activeProcesses = mockProcesses.filter(
    p => !['PROCESS ON HOLD', 'PROCESS CANCELLED'].includes(p.status)
  );
  
  const statusCounts: Record<string, number> = {};
  activeProcesses.forEach(p => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });
  
  return {
    total: activeProcesses.length,
    statusCounts,
  };
};

export const getRevenueStats = (period: 'month' | 'quarter' | 'year' = 'month') => {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
  }
  
  const relevantProcesses = mockProcesses.filter(p => {
    if (!p.onboardingDate || !p.revenue) return false;
    const onboardingDate = new Date(p.onboardingDate);
    return onboardingDate >= startDate && onboardingDate <= now;
  });
  
  const totalRevenue = relevantProcesses.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const caseCount = relevantProcesses.length;
  
  return {
    totalRevenue,
    caseCount,
    period,
    processes: relevantProcesses,
  };
};
