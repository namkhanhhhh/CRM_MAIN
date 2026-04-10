import { HeadhunterProfile, HeadhunterPageJob } from '@/types/headhunterProfile';

const getISOString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const mockHeadhunterProfiles: HeadhunterProfile[] = [
  {
    id: 'hp-1',
    userId: 'hh-1',
    name: 'Nguyễn Văn A',
    title: 'Senior IT Headhunter | Chuyên gia tuyển dụng công nghệ',
    bio: `Với hơn 5 năm kinh nghiệm trong lĩnh vực headhunt IT, tôi đã kết nối thành công hàng trăm ứng viên với các cơ hội việc làm hàng đầu. Chuyên tuyển dụng các vị trí Senior Developer, Tech Lead, và Management trong ngành công nghệ.\n\n🎯 Cam kết:\n• Tư vấn miễn phí về lộ trình sự nghiệp\n• Kết nối với các doanh nghiệp hàng đầu\n• Hỗ trợ đàm phán lương và phúc lợi\n• Phản hồi nhanh trong 24h`,
    email: 'nguyen.a@tdconsulting.vn',
    phone: '0901234567',
    zalo: '0901234567',
    linkedin: 'https://linkedin.com/in/nguyenvana',
    facebook: 'https://facebook.com/nguyenvana.headhunt',
    brandColor: '#ff008a',
    slug: 'nguyen-van-a',
    totalPlacements: 156,
    yearsExperience: 5,
    specializations: ['IT - Phần mềm', 'Fintech', 'Ecommerce'],
    templateStyle: 'modern',
    isPublished: true,
    createdAt: getISOString(180),
    updatedAt: getISOString(1),
  },
  {
    id: 'hp-2',
    userId: 'hh-2',
    name: 'Trần Thị B',
    title: 'Headhunter | Non-IT Recruitment Specialist',
    bio: `Tôi chuyên tuyển dụng các vị trí trong lĩnh vực Manufacturing, Logistics và FMCG. Với mạng lưới rộng lớn trong ngành, tôi luôn tìm được ứng viên phù hợp nhất cho doanh nghiệp.\n\n✨ Thế mạnh:\n• Mạng lưới 5000+ ứng viên trong ngành Non-IT\n• Am hiểu sâu về thị trường lao động sản xuất\n• Tỉ lệ match thành công 85%`,
    email: 'tran.b@tdconsulting.vn',
    phone: '0912345678',
    zalo: '0912345678',
    linkedin: 'https://linkedin.com/in/tranthib',
    brandColor: '#3b82f6',
    slug: 'tran-thi-b',
    totalPlacements: 89,
    yearsExperience: 3,
    specializations: ['Manufacturing', 'Logistics', 'Retail'],
    templateStyle: 'classic',
    isPublished: true,
    createdAt: getISOString(120),
    updatedAt: getISOString(3),
  },
  {
    id: 'hp-3',
    userId: 'hh-3',
    name: 'Lê Văn C',
    title: 'Tech Headhunter | Fullstack & DevOps Specialist',
    bio: `Từng là Software Engineer trước khi chuyển sang Headhunt, tôi hiểu rõ yêu cầu kỹ thuật và văn hóa tech company. Chuyên kết nối Developer tài năng với startup và tech company hàng đầu Việt Nam.`,
    email: 'le.c@tdconsulting.vn',
    phone: '0923456789',
    linkedin: 'https://linkedin.com/in/levanc',
    brandColor: '#10b981',
    slug: 'le-van-c',
    totalPlacements: 67,
    yearsExperience: 2,
    specializations: ['IT - Phần mềm', 'IT - Phần cứng'],
    templateStyle: 'minimal',
    isPublished: false,
    createdAt: getISOString(90),
    updatedAt: getISOString(7),
  },
  {
    id: 'hp-4',
    userId: 'hh-4',
    name: 'Phạm Thị D',
    title: 'Banking & Fintech Headhunter',
    bio: `Chuyên gia tuyển dụng trong lĩnh vực Ngân hàng và Fintech. Kết nối các chuyên gia tài chính với cơ hội nghề nghiệp hấp dẫn.`,
    email: 'pham.d@tdconsulting.vn',
    phone: '0934567890',
    zalo: '0934567890',
    brandColor: '#6366f1',
    slug: 'pham-thi-d',
    totalPlacements: 45,
    yearsExperience: 2,
    specializations: ['Banking', 'Fintech'],
    templateStyle: 'modern',
    isPublished: true,
    createdAt: getISOString(60),
    updatedAt: getISOString(5),
  },
  {
    id: 'hp-5',
    userId: 'hh-5',
    name: 'Hoàng Văn E',
    title: 'Senior Headhunter | Multi-industry Expert',
    bio: `Với kinh nghiệm đa ngành, tôi tự tin kết nối ứng viên chất lượng với mọi lĩnh vực từ IT, Ecommerce đến Healthcare.`,
    email: 'hoang.e@tdconsulting.vn',
    phone: '0945678901',
    linkedin: 'https://linkedin.com/in/hoangvane',
    facebook: 'https://facebook.com/hoangvane',
    brandColor: '#f97316',
    slug: 'hoang-van-e',
    totalPlacements: 112,
    yearsExperience: 4,
    specializations: ['IT - Phần mềm', 'Ecommerce', 'Healthcare'],
    templateStyle: 'modern',
    isPublished: true,
    createdAt: getISOString(150),
    updatedAt: getISOString(2),
  },
];

// Jobs added to personal page — headhunter manually adds these
export const mockHeadhunterPageJobs: HeadhunterPageJob[] = [
  // Nguyễn Văn A's page jobs
  { id: 'hpj-1', profileId: 'hp-1', jobId: 'job-1', isHighlighted: true, addedAt: getISOString(5), displayOrder: 1 },
  { id: 'hpj-2', profileId: 'hp-1', jobId: 'job-2', isHighlighted: true, addedAt: getISOString(4), displayOrder: 2 },
  { id: 'hpj-3', profileId: 'hp-1', jobId: 'job-3', isHighlighted: false, addedAt: getISOString(3), displayOrder: 3 },
  { id: 'hpj-4', profileId: 'hp-1', jobId: 'job-6', isHighlighted: false, addedAt: getISOString(2), displayOrder: 4 },
  { id: 'hpj-5', profileId: 'hp-1', jobId: 'job-11', isHighlighted: false, addedAt: getISOString(1), displayOrder: 5 },
  { id: 'hpj-6', profileId: 'hp-1', jobId: 'job-16', isHighlighted: false, addedAt: getISOString(1), displayOrder: 6 },
  { id: 'hpj-7', profileId: 'hp-1', jobId: 'job-21', isHighlighted: false, addedAt: getISOString(0), displayOrder: 7 },

  // Trần Thị B's page jobs
  { id: 'hpj-8', profileId: 'hp-2', jobId: 'job-4', isHighlighted: true, addedAt: getISOString(3), displayOrder: 1 },
  { id: 'hpj-9', profileId: 'hp-2', jobId: 'job-5', isHighlighted: false, addedAt: getISOString(2), displayOrder: 2 },
  { id: 'hpj-10', profileId: 'hp-2', jobId: 'job-7', isHighlighted: false, addedAt: getISOString(1), displayOrder: 3 },

  // Lê Văn C's page jobs
  { id: 'hpj-11', profileId: 'hp-3', jobId: 'job-8', isHighlighted: true, addedAt: getISOString(5), displayOrder: 1 },
  { id: 'hpj-12', profileId: 'hp-3', jobId: 'job-9', isHighlighted: false, addedAt: getISOString(4), displayOrder: 2 },

  // Phạm Thị D
  { id: 'hpj-13', profileId: 'hp-4', jobId: 'job-12', isHighlighted: true, addedAt: getISOString(2), displayOrder: 1 },
  { id: 'hpj-14', profileId: 'hp-4', jobId: 'job-13', isHighlighted: false, addedAt: getISOString(1), displayOrder: 2 },

  // Hoàng Văn E
  { id: 'hpj-15', profileId: 'hp-5', jobId: 'job-14', isHighlighted: true, addedAt: getISOString(3), displayOrder: 1 },
  { id: 'hpj-16', profileId: 'hp-5', jobId: 'job-15', isHighlighted: true, addedAt: getISOString(2), displayOrder: 2 },
  { id: 'hpj-17', profileId: 'hp-5', jobId: 'job-17', isHighlighted: false, addedAt: getISOString(1), displayOrder: 3 },
  { id: 'hpj-18', profileId: 'hp-5', jobId: 'job-18', isHighlighted: false, addedAt: getISOString(0), displayOrder: 4 },
];

// Helper functions
export const getProfileByUserId = (userId: string): HeadhunterProfile | undefined => {
  return mockHeadhunterProfiles.find(p => p.userId === userId);
};

export const getProfileBySlug = (slug: string): HeadhunterProfile | undefined => {
  return mockHeadhunterProfiles.find(p => p.slug === slug);
};

export const getPageJobsByProfileId = (profileId: string): HeadhunterPageJob[] => {
  return mockHeadhunterPageJobs
    .filter(pj => pj.profileId === profileId)
    .sort((a, b) => {
      // Highlighted first, then by display order
      if (a.isHighlighted !== b.isHighlighted) return a.isHighlighted ? -1 : 1;
      return a.displayOrder - b.displayOrder;
    });
};
