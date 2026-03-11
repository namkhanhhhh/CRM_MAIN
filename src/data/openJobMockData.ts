import { OpenJob, JobApplication, JobComment, Industry } from '@/types/job';

const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const getISOString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const jobTitles = [
  'Trainer',
  'Customer Service Team Leader',
  'Content Moderator',
  'Sale Specialist',
  'Graphic Designer',
  'CỬA HÀNG TRƯỞNG (STORE LEAD)',
  'Chief Accountant (Japanese Law/M&A/Accounting Consulting)',
  'Fullstack Engineer (React + Golang)',
  'AI-Native Software Engineer (Mid - Senior)',
  'Senior Backend Developer (Java)',
  'DevOps Engineer',
  'Product Manager',
  'QA Engineer',
  'iOS Developer',
  'Android Developer',
  'React Native Developer',
  'Data Analyst',
  'Business Analyst',
  'HR Manager',
  'Marketing Manager',
];

const companies = [
  'Concentrix',
  'GEAR INC VIETNAM',
  'CÔNG TY TNHH TURNKEY FBA',
  'Dat Bike',
  'M&P Asia Corporation',
  'TECHBANK',
  'VNG Corporation',
  'FPT Software',
  'VNPAY',
  'MoMo',
  'Tiki',
  'Shopee Vietnam',
  'Grab Vietnam',
  'Lazada Vietnam',
  'VinAI',
  'TMA Solutions',
  'NashTech',
  'KMS Technology',
];

const locations = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Remote',
  'Hybrid (HCM)',
  'Hybrid (HN)',
];

const salaries = [
  'Upto 30M',
  'UPTO 40M',
  '7M - 9M',
  '8M - 12M',
  '14M - 18M',
  '10M - 13M',
  '30M - 50M',
  'up to 40M Net',
  '$2000 - $2500',
  '20M - 25M',
  '25M - 35M',
  '15M - 20M',
];

const industries: Industry[] = [
  'Ecommerce',
  'IT - Phần mềm',
  'Fintech',
  'Non-IT',
  'Banking',
  'Manufacturing',
  'Retail',
];

const owners = [
  { id: 'hh-1', name: 'Nguyễn Văn A' },
  { id: 'hh-2', name: 'Trần Thị B' },
  { id: 'hh-3', name: 'Lê Văn C' },
  { id: 'hh-4', name: 'Phạm Thị D' },
  { id: 'hh-5', name: 'Hoàng Văn E' },
];

const sampleDescription = `
<h3>1. Trách nhiệm chính:</h3>
<p>Triển khai các chương trình đào tạo hướng đến khách hàng nhằm đáp ứng nhu cầu nhân sự mới, cập nhật sản phẩm và đào tạo định kỳ. Đảm bảo đội ngũ nhân sự được chuẩn bị tốt nhất về kiến thức và kỹ năng để duy trì chất lượng dịch vụ hàng đầu.</p>

<h3>2. Chi tiết nhiệm vụ:</h3>
<h4>Quản lý và dẫn dắt lớp học:</h4>
<ul>
  <li>Điều phối và hướng dẫn hằng ngày cho học viên trong môi trường đào tạo.</li>
  <li>Theo dõi tiến độ, cung cấp coaching và phản hồi phát triển để đánh giá mức độ sẵn sàng của nhân sự trước khi làm việc thực tế.</li>
  <li>Ứng dụng các phương pháp đào tạo sáng tạo và kỹ thuật học tập dành cho người lớn (Adult Learning) để tối ưu hóa hiệu quả tiếp thu.</li>
</ul>

<h4>Xây dựng và phát triển nội dung:</h4>
<ul>
  <li>Chuẩn bị và trình bày tài liệu đào tạo thông qua học tập trên lớp, demo thực hành và các hoạt động hỗ trợ.</li>
  <li>Phối hợp thiết kế tài liệu hướng dẫn công việc, bài giảng tương tác hoặc đào tạo trên máy tính (CBT).</li>
  <li>Đề xuất điều chỉnh chương trình đào tạo dựa trên phân tích nhu cầu thực tế (TNA) và phản hồi từ các bộ phận.</li>
</ul>

<h4>Đảm bảo chất lượng vận hành:</h4>
<ul>
  <li>Phối hợp với bộ phận Vận hành để chuyển giao nhân sự từ giai đoạn đào tạo sang sản xuất, đảm bảo năng lực đáp ứng như cầu kinh doanh.</li>
  <li>Duy trì kiến thức sản phẩm chuyên sâu bằng cách trực tiếp nhận cuộc gọi, quan sát làm việc (side-by-side) và tham gia các buổi họp chuyên môn.</li>
  <li>Đạt các chỉ số hiệu suất đào tạo cá nhân (KPIs).</li>
</ul>

<h4>Đánh giá và cải tiến:</h4>
<ul>
  <li>Đo lường hiệu quả đào tạo thông qua focus group, phỏng vấn và khảo sát.</li>
  <li>Tham gia xây dựng văn hóa học tập liên tục, cập nhật nhanh chóng các thay đổi về quy trình, chính sách và sản phẩm.</li>
</ul>
`;

const sampleRequirements = `
<h3>3. YÊU CẦU:</h3>
<ul>
  <li>Tốt nghiệp Cao đẳng hoặc Đại học</li>
  <li>Tối thiểu 2 năm kinh nghiệm trong vai trò Training/Coaching</li>
  <li>Có kinh nghiệm làm việc tại Contact Center hoặc BPO là lợi thế</li>
  <li>Kỹ năng giao tiếp và thuyết trình tốt</li>
  <li>Tiếng Anh giao tiếp tốt (TOEIC 600+ hoặc tương đương)</li>
  <li>Thành thạo MS Office (Word, Excel, PowerPoint)</li>
</ul>
`;

const sampleBenefits = `
<h3>4. QUYỀN LỢI:</h3>
<ul>
  <li>Mức lương cạnh tranh + thưởng hiệu suất</li>
  <li>BHXH, BHYT, BHTN theo quy định</li>
  <li>Bảo hiểm sức khỏe cao cấp cho nhân viên</li>
  <li>13 ngày phép năm + nghỉ lễ theo quy định</li>
  <li>Cơ hội đào tạo và phát triển nghề nghiệp</li>
  <li>Môi trường làm việc quốc tế, năng động</li>
</ul>
`;

const generateMockOpenJobs = (): OpenJob[] => {
  const jobs: OpenJob[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const owner = owners[i % owners.length];
    const company = companies[i % companies.length];
    const title = jobTitles[i % jobTitles.length];
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    
    jobs.push({
      id: `job-${i}`,
      code: `TDC${String(476 - i + 1).padStart(5, '0')}`,
      title,
      clientId: `client-${i % companies.length + 1}`,
      clientName: company,
      salary: salaries[i % salaries.length],
      location: locations[i % locations.length],
      interviewRounds: (i % 4) + 2, // 2-5 vòng
      guaranteeDays: [30, 60, 90][i % 3],
      industry: industries[i % industries.length],
      jobType: 'Full-time',
      status: i % 10 === 0 ? 'Closed' : 'Open',
      candidateCount: Math.floor(Math.random() * 5) + 1,
      appliedCount: Math.floor(Math.random() * 30),
      ownerId: owner.id,
      ownerName: owner.name,
      description: sampleDescription,
      requirements: sampleRequirements,
      benefits: sampleBenefits,
      workingTime: '5 ngày/tuần, xoay ca linh hoạt (Sẵn sàng làm việc trong môi trường 24/7).',
      workingLocation: `Tòa nhà QTSC1, Công viên phần mềm Quang Trung, Quận 12, TP. Hồ Chí Minh.`,
      jdDetails: `Phụ cấp ăn uống: 500.000 VNĐ/tháng.
Thưởng KPI: Từ 900.000 – 1.200.000 VNĐ/tháng.
Thời gian làm việc: "Xoay ca, nhưng có thể làm giờ hành chính nhiều hơn, linh động. 1 tuần làm 5 ngày off 2 ngày linh hoạt"
Giờ hành chính: 9h-18h Thứ hai đến thứ bảy"`,
      serviceFee: '15% lương gross tháng đầu',
      createdAt: getISOString(daysAgo + 10),
      updatedAt: getISOString(daysAgo),
      postedAt: getDateString(daysAgo),
    });
  }
  
  return jobs;
};

const generateMockApplications = (): JobApplication[] => {
  const applications: JobApplication[] = [];
  const candidateNames = [
    'Đinh Văn Đức Hoàn',
    'Nguyễn Thị Mai',
    'Trần Văn Minh',
    'Lê Thị Hương',
    'Phạm Văn Tùng',
  ];
  
  for (let i = 1; i <= 20; i++) {
    const owner = owners[i % owners.length];
    const candidateName = candidateNames[i % candidateNames.length];
    
    applications.push({
      id: `app-${i}`,
      jobId: `job-${(i % 10) + 1}`,
      jobCode: `TDC${String(476 - (i % 10)).padStart(5, '0')}`,
      candidateId: `cand-${i}`,
      candidateName,
      candidateEmail: `${candidateName.toLowerCase().replace(/\s+/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@gmail.com`,
      candidatePhone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
      cvUrl: `/uploads/cv-${i}.pdf`,
      cvFileName: `CV_${candidateName.replace(/\s+/g, '_')}.pdf`,
      headhunterId: owner.id,
      headhunterName: owner.name,
      status: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Processed'][i % 5] as JobApplication['status'],
      appliedAt: getISOString(Math.floor(Math.random() * 7)),
      source: 'Apply Link',
    });
  }
  
  return applications;
};

const generateMockComments = (): JobComment[] => {
  const comments: JobComment[] = [];
  
  for (let i = 1; i <= 10; i++) {
    const owner = owners[i % owners.length];
    
    comments.push({
      id: `comment-${i}`,
      jobId: `job-${(i % 5) + 1}`,
      userId: owner.id,
      userName: owner.name,
      content: `Bình luận về job này - ${i}. Thông tin bổ sung cho team.`,
      createdAt: getISOString(Math.floor(Math.random() * 7)),
    });
  }
  
  return comments;
};

export const mockOpenJobs = generateMockOpenJobs();
export const mockJobApplications = generateMockApplications();
export const mockJobComments = generateMockComments();

export const getOpenJobById = (id: string): OpenJob | undefined => {
  return mockOpenJobs.find(job => job.id === id);
};

export const getOpenJobByCode = (code: string): OpenJob | undefined => {
  return mockOpenJobs.find(job => job.code.toLowerCase() === code.toLowerCase());
};

export const getApplicationsByJobId = (jobId: string): JobApplication[] => {
  return mockJobApplications.filter(app => app.jobId === jobId);
};

export const getCommentsByJobId = (jobId: string): JobComment[] => {
  return mockJobComments.filter(comment => comment.jobId === jobId);
};

export const getHeadhunterById = (id: string) => {
  return owners.find(o => o.id === id);
};
