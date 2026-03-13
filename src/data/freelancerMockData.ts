export interface FreelancerStats {
  id: string;
  name: string;
  email: string;
  cvToTdc: number;
  cvToClient: number;
  interview: number;
  offer: number;
  onboarding: number;
  rejected: number;
  lastActive: string;
}

export interface ReferralStat {
  id: string;
  staffName: string;
  role: string;
  count: number;
  freelancers: {
    id: string;
    name: string;
    date: string;
    email: string;
    phone: string;
    zalo: string;
    facebook: string;
    address: string;
    city: string;
    bio: string;
  }[];
}

export interface PositionStat {
  position: string;
  cvCount: number;
  company: string;
}

export interface ConversionRateStat {
  name: string;
  rate: number;
}

export const mockFreelancers: FreelancerStats[] = [
  { id: '1', name: 'Nguyễn Thị Thu Hằng', email: 'hangntt69@gmail.com', cvToTdc: 54, cvToClient: 11, interview: 1, offer: 0, onboarding: 0, rejected: 2, lastActive: '2026-03-13' },
  { id: '2', name: 'Linh Nguyen', email: 'linhnguyenthith@gmail.com', cvToTdc: 38, cvToClient: 1, interview: 1, offer: 0, onboarding: 0, rejected: 0, lastActive: '2026-03-12' },
  { id: '3', name: 'Nguyễn thị khánh linh', email: 'linhsieuxinh@gmail.com', cvToTdc: 30, cvToClient: 5, interview: 3, offer: 0, onboarding: 0, rejected: 1, lastActive: '2026-03-11' },
  { id: '4', name: 'HOÀNG THỊ BÍCH NGỌC', email: 'hoangngoc237@gmail.com', cvToTdc: 23, cvToClient: 6, interview: 1, offer: 0, onboarding: 0, rejected: 3, lastActive: '2026-03-10' },
  { id: '5', name: 'Đỗ Thị Loan', email: 'do.loan@gmail.com', cvToTdc: 17, cvToClient: 4, interview: 2, offer: 0, onboarding: 0, rejected: 0, lastActive: '2026-03-09' },
  { id: '6', name: 'Phạm Văn Hùng', email: 'hung.pham@gmail.com', cvToTdc: 15, cvToClient: 3, interview: 0, offer: 0, onboarding: 1, rejected: 0, lastActive: '2026-03-08' },
  { id: '7', name: 'Lê Thị Mai', email: 'mai.le@gmail.com', cvToTdc: 12, cvToClient: 2, interview: 1, offer: 1, onboarding: 0, rejected: 0, lastActive: '2026-03-07' },
  { id: '8', name: 'Trần Văn Đức', email: 'duc.tran@gmail.com', cvToTdc: 10, cvToClient: 0, interview: 0, offer: 0, onboarding: 0, rejected: 0, lastActive: '2026-03-06' },
  { id: '9', name: 'Vũ Thị Lan', email: 'lan.vu@gmail.com', cvToTdc: 8, cvToClient: 0, interview: 0, offer: 0, onboarding: 0, rejected: 0, lastActive: '2026-03-05' },
  { id: '10', name: 'Hoàng Văn Nam', email: 'nam.hoang@gmail.com', cvToTdc: 5, cvToClient: 1, interview: 0, offer: 0, onboarding: 0, rejected: 0, lastActive: '2026-03-04' },
  { id: '11', name: 'Trần Bình Trọng', email: 'trong.tran@gmail.com', cvToTdc: 0, cvToClient: 0, interview: 0, offer: 0, onboarding: 0, rejected: 0, lastActive: '2026-03-03' }, // Freelancer with 0 CV
];

export const mockReferrals: ReferralStat[] = [
  { 
    id: 's1', 
    staffName: 'Nguyễn Thị Hoa', 
    role: 'HR',
    count: 12, 
    freelancers: [
      { id: 'fr1', name: 'Tu Le', date: '2026-03-13', email: 'utnl3002@gmail.com', phone: '0394825558', zalo: '0394825558', facebook: '', address: '', city: 'Hồ Chí Minh', bio: 'Một chút về bản thân...' },
      { id: 'fr2', name: 'Nguyễn Thị Thu Hằng', date: '2026-03-01', email: 'hangntt69@gmail.com', phone: '0912345678', zalo: '0912345678', facebook: 'fb.com/hang', address: '123 Đường', city: 'Hà Nội', bio: 'Senior QA' },
      { id: 'fr3', name: 'Linh Nguyen', date: '2026-03-02', email: 'linhnguyenthith@gmail.com', phone: '0987654321', zalo: '0987654321', facebook: '', address: '', city: 'Đà Nẵng', bio: '' },
    ]
  },
  { 
    id: 's2', 
    staffName: 'Trần Văn Đức', 
    role: 'Sales',
    count: 9, 
    freelancers: [
      { id: 'fr4', name: 'Nguyễn thị khánh linh', date: '2026-02-15', email: 'linhsieuxinh@gmail.com', phone: '0911223344', zalo: '0911223344', facebook: '', address: '', city: 'Hà Nội', bio: '' },
      { id: 'fr5', name: 'Đỗ Thị Loan', date: '2026-02-20', email: 'do.loan@gmail.com', phone: '0922334455', zalo: '', facebook: '', address: '', city: 'Hồ Chí Minh', bio: '' },
    ]
  },
  { 
    id: 's3', 
    staffName: 'Lê Thị Mai', 
    role: 'Operations',
    count: 7, 
    freelancers: [
      { id: 'fr6', name: 'HOÀNG THỊ BÍCH NGỌC', date: '2026-02-28', email: 'hoangngoc237@gmail.com', phone: '0933445566', zalo: '0933445566', facebook: '', address: '', city: 'Hà Nội', bio: '' },
    ]
  },
  { id: 's4', staffName: 'Phạm Quốc Bảo', role: 'Marketing', count: 5, freelancers: [] },
  { id: 's5', staffName: 'Hoàng Văn Sơn', role: 'IT', count: 3, freelancers: [] },
];

export const mockConversionRates: ConversionRateStat[] = [
  { name: 'An', rate: 11 },
  { name: 'Bình', rate: 8.5 },
  { name: 'Cường', rate: 5.2 },
  { name: 'Dũng', rate: 6.8 },
  { name: 'Em', rate: 6.8 },
];

export const mockPositionStats: PositionStat[] = [
  { position: 'Java Developer', cvCount: 48, company: 'FPT Software' },
  { position: 'Business Analyst', cvCount: 42, company: 'Viettel' },
  { position: 'Project Manager', cvCount: 36, company: 'VNG Corporation' },
  { position: 'QA Engineer', cvCount: 31, company: 'TMA Solutions' },
  { position: '.NET Developer', cvCount: 28, company: 'KMS Technology' },
  { position: 'Frontend Developer', cvCount: 25, company: 'NashTech' },
  { position: 'DevOps Engineer', cvCount: 20, company: 'Axon Active' },
  { position: 'Data Engineer', cvCount: 16, company: 'VNPAY' },
  { position: 'UI/UX Designer', cvCount: 14, company: 'MoMo' },
  { position: 'Product Manager', cvCount: 10, company: 'Tiki' },
];
