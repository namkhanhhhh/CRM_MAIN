import { Customer, BDUser, Reminder, StatusHistoryEntry, CommunicationHistoryEntry, CommunicationMethod } from '@/types/customer';

export const bdUsers: BDUser[] = [
  { id: '1', name: 'Nguyễn Văn A', email: 'nguyen.a@tdconsulting.vn' },
  { id: '2', name: 'Trần Thị B', email: 'tran.b@tdconsulting.vn' },
  { id: '3', name: 'Lê Văn C', email: 'le.c@tdconsulting.vn' },
  { id: '4', name: 'Phạm Thị D', email: 'pham.d@tdconsulting.vn' },
];

// Helper to get dynamic dates relative to today
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const getRemindDateString = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

const getISOString = (daysAgo: number, hours: number = 8): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, 0, 0, 0);
  return date.toISOString();
};

// Helper to generate random data
const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const domains = [
  'IT', 'IT - product', 'IT - outsourcing', 'Ecommerce', 'Game', 
  'Mobile app', 'Non IT (Manufacturing)', 'Non IT (Logistic)', 
  'Non IT (FMCG)', 'Non IT (BĐS)', 'Non IT (Retail)', 'Non-IT', 'Others'
] as const;

const statuses = [
  'Research', 'Addfriend/Connect', 'Approach', 'Follow up', 'Consulting',
  'Demo contract', 'Working', 'Pending', 'Signing', 'Signed', 'Meeting Clear JD',
  'Hunting', 'Hiring', 'Take care', 'No current need', 'Excluded', 'Closed', 'Rejected'
] as const;

const jobSources = ['Facebook', 'Linkedin', 'Thread', 'Itviec', 'Topdev', 'Aniday', 'Job Portal', 'Referral', 'Khác'] as const;

const companyNames = [
  'VNG Corporation', 'FPT Software', 'Viettel Group', 'VNPAY', 'MoMo', 'Tiki', 'Shopee Vietnam',
  'Grab Vietnam', 'Lazada Vietnam', 'Zalo', 'VinAI', 'BAEMIN Vietnam', 'Gojek Vietnam',
  'TMA Solutions', 'NashTech', 'Axon Active', 'KMS Technology', 'Harvey Nash Vietnam',
  'Endava Vietnam', 'Bosch Vietnam', 'Intel Vietnam', 'Samsung Vietnam', 'LG Development',
  'Panasonic Vietnam', 'Canon Vietnam', 'Sony Vietnam', 'Hitachi Vietnam', 'Fujitsu Vietnam',
  'NEC Vietnam', 'Renesas Vietnam', 'Marvell Vietnam', 'Qualcomm Vietnam', 'Synopsys Vietnam',
  'Cadence Vietnam', 'Agilent Vietnam', 'Texas Instruments', 'Infineon Vietnam', 'STMicroelectronics',
  'NXP Vietnam', 'MediaTek Vietnam', 'Realtek Vietnam', 'Novatek Vietnam', 'Richtek Vietnam',
  'VinFast', 'Vinamilk', 'Masan Group', 'Techcombank', 'VPBank', 'MB Bank', 'ACB',
  'Sacombank', 'HDBank', 'TPBank', 'SeABank', 'VIB', 'MSB', 'Vietinbank', 'BIDV',
  'Vietcombank', 'Agribank', 'PVcomBank', 'LienVietPostBank', 'NCB', 'Saigonbank',
  'Garena Vietnam', 'Riot Games Vietnam', 'EA Vietnam', 'Ubisoft Vietnam', 'Unity Vietnam',
  'Epic Games Vietnam', 'Amanotes', 'Sky Mavis', 'Topebox', 'VTC Game', 'SohaGame',
  'GOSU', 'Gamota', 'VNGGames', 'Funtap', 'Fado', 'Apero', 'Adayroi', 'Sendo',
  'Haravan', 'Sapo', 'KiotViet', 'Nhanh.vn', 'Bizweb', 'Pancake', 'Caresoft',
  'Base.vn', 'Amis', 'FastWork', 'CRM Vietnam', 'Zoho Vietnam', 'Salesforce Vietnam',
  'SAP Vietnam', 'Oracle Vietnam', 'Microsoft Vietnam', 'Google Vietnam', 'AWS Vietnam',
  'IBM Vietnam', 'Cisco Vietnam', 'HP Vietnam', 'Dell Vietnam', 'Lenovo Vietnam'
];

const jobs = [
  'Senior Backend Developer', 'Frontend Developer', 'Full-Stack Developer', 'DevOps Engineer',
  'iOS Developer', 'Android Developer', 'React Native Developer', 'Flutter Developer',
  'Java Developer', 'Python Developer', 'Go Developer', 'Node.js Developer', 'PHP Developer',
  'C++ Developer', 'C# Developer', 'Ruby Developer', 'Rust Developer', 'Kotlin Developer',
  'Swift Developer', 'Scala Developer', 'QA Engineer', 'Automation Tester', 'Manual Tester',
  'Security Engineer', 'Cloud Architect', 'Data Engineer', 'ML Engineer', 'AI Researcher',
  'Product Manager', 'Project Manager', 'Scrum Master', 'Business Analyst', 'Solution Architect',
  'Tech Lead', 'Engineering Manager', 'CTO', 'VP Engineering', 'Director of Engineering',
  'UX Designer', 'UI Designer', 'Product Designer', 'Graphic Designer', 'Motion Designer'
];

const contactNames = [
  'Nguyễn Văn Minh', 'Trần Thị Hoa', 'Lê Hoàng Nam', 'Phạm Thị Mai', 'Đỗ Quang Hải',
  'Vũ Thị Lan', 'Hoàng Văn Đức', 'Ngô Thị Hương', 'Đinh Văn Tùng', 'Bùi Thị Nga',
  'Lý Văn Khang', 'Dương Thị Linh', 'Phan Văn Long', 'Tạ Thị Uyên', 'Võ Văn Sơn',
  'Hồ Thị Thảo', 'Nguyễn Văn An', 'Trần Thị Bích', 'Lê Văn Cường', 'Phạm Thị Diệu'
];

// Generate 100 sample customers with diverse data
const generateMockCustomers = (): Customer[] => {
  const customers: Customer[] = [];
  
  // Pre-define distribution for better chart visualization
  // Domain distribution - more IT-related for realistic data
  const domainDistribution = [
    { domain: 'IT - product', weight: 20 },
    { domain: 'IT - outsourcing', weight: 15 },
    { domain: 'IT', weight: 10 },
    { domain: 'Ecommerce', weight: 12 },
    { domain: 'Game', weight: 8 },
    { domain: 'Mobile app', weight: 10 },
    { domain: 'Non IT (Manufacturing)', weight: 5 },
    { domain: 'Non IT (Logistic)', weight: 5 },
    { domain: 'Non IT (FMCG)', weight: 5 },
    { domain: 'Non IT (BĐS)', weight: 3 },
    { domain: 'Non IT (Retail)', weight: 4 },
    { domain: 'Non-IT', weight: 2 },
    { domain: 'Others', weight: 1 },
  ];

  // Status distribution with higher success rates for certain domains
  const getStatusForDomain = (domain: string, index: number): string => {
    const successDomains = ['IT - product', 'IT - outsourcing', 'Ecommerce'];
    const isSuccessDomain = successDomains.includes(domain);
    
    // Create varied distribution
    if (index % 10 === 0) return 'Signed'; // 10% signed
    if (index % 8 === 0 && isSuccessDomain) return 'Signed'; // Extra signed for success domains
    if (index % 7 === 0) return 'Signing';
    if (index % 6 === 0) return 'Demo contract';
    if (index % 5 === 0) return 'Consulting';
    if (index % 4 === 0) return 'Follow up';
    if (index % 3 === 0) return 'Approach';
    if (index % 15 === 0) return 'Meeting Clear JD';
    if (index % 20 === 0) return 'Hunting';
    if (index % 25 === 0) return 'No current need';
    if (index % 30 === 0) return 'Excluded';
    if (index % 35 === 0) return 'Rejected';
    if (index % 12 === 0) return 'Take care';
    return randomFromArray(['Research', 'Addfriend/Connect', 'Approach', 'Follow up']);
  };

  // Generate customers with varied dates for sales cycle analysis
  for (let i = 1; i <= 100; i++) {
    const domainIndex = i % domainDistribution.length;
    const domain = domainDistribution[domainIndex].domain as typeof domains[number];
    const bdId = String((i % 4) + 1);
    
    // Varied days ago for sales cycle - signed customers should have longer cycles
    let daysAgo: number;
    let status: typeof statuses[number];
    
    // Generate TODAY data for daily KPI reporting (first 20 customers)
    if (i <= 20) {
      daysAgo = 0; // Today
      // Distribute statuses for daily KPI: Cold Lead, Former, New, Meeting, Contract, JD
      if (i <= 6) {
        status = randomFromArray(['Research', 'Addfriend/Connect']); // Cold leads
      } else if (i <= 10) {
        status = 'Follow up'; // Former client approaches
      } else if (i <= 15) {
        status = 'Approach'; // New client approaches
      } else if (i <= 17) {
        status = 'Meeting Clear JD'; // Client meeting
      } else if (i <= 19) {
        status = randomFromArray(['Signing', 'Signed']); // New contract
      } else {
        status = 'Hunting'; // New JD (with job)
      }
    } else {
      // Rest of customers with normal distribution
      status = getStatusForDomain(domain, i) as typeof statuses[number];
      
      if (status === 'Signed') {
        daysAgo = 30 + Math.floor(Math.random() * 60); // 30-90 days for signed
      } else if (['Signing', 'Demo contract', 'Consulting'].includes(status)) {
        daysAgo = 15 + Math.floor(Math.random() * 30); // 15-45 days for late stages
      } else if (['Follow up', 'Approach'].includes(status)) {
        // Create TODAY, UPCOMING, OVERDUE cases
        if (i % 10 === 1) daysAgo = 7; // TODAY - 7 day milestone
        else if (i % 10 === 2) daysAgo = 15; // TODAY - 15 day milestone
        else if (i % 10 === 3) daysAgo = 30; // TODAY - 30 day milestone
        else if (i % 10 === 4) daysAgo = 5; // UPCOMING - 2 days to 7-day
        else if (i % 10 === 5) daysAgo = 6; // UPCOMING - 1 day to 7-day
        else if (i % 10 === 6) daysAgo = 13; // UPCOMING - 2 days to 15-day
        else if (i % 10 === 7) daysAgo = 20; // OVERDUE - past 7 and 15 day
        else if (i % 10 === 8) daysAgo = 25; // OVERDUE - past all
        else daysAgo = Math.floor(Math.random() * 10) + 1;
      } else {
        daysAgo = Math.floor(Math.random() * 45) + 1;
      }
    }

    const cycleLength = status === 'Signed' ? Math.floor(Math.random() * 30) + 5 : 0;
    
    // Generate job link based on job source
    const jobSource = jobSources[i % jobSources.length] as typeof jobSources[number];
    const getJobLink = (source: string, index: number): string | undefined => {
      const jobSlug = jobs[(index - 1) % jobs.length].toLowerCase().replace(/\s+/g, '-');
      switch (source) {
        case 'Itviec':
          return `https://itviec.com/it-jobs/${jobSlug}-${index}`;
        case 'Topdev':
          return `https://topdev.vn/viec-lam/${jobSlug}-${index}`;
        case 'Linkedin':
          return `https://linkedin.com/jobs/view/${1000000 + index}`;
        case 'Facebook':
          return `https://facebook.com/jobs/${index}`;
        case 'Aniday':
          return `https://aniday.com/job/${jobSlug}-${index}`;
        default:
          return i % 3 === 0 ? `https://topcv.vn/viec-lam/${jobSlug}-${index}` : undefined;
      }
    };

    // Generate remind date based on status
    let remindDate: string | undefined;
    if (['Approach', 'Follow up'].includes(status)) {
      // Create varied remind scenarios
      if (i % 10 === 1) remindDate = getRemindDateString(0); // TODAY
      else if (i % 10 === 2) remindDate = getRemindDateString(0); // TODAY
      else if (i % 10 === 3) remindDate = getRemindDateString(1); // UPCOMING - tomorrow
      else if (i % 10 === 4) remindDate = getRemindDateString(2); // UPCOMING - 2 days
      else if (i % 10 === 5) remindDate = getRemindDateString(3); // UPCOMING - 3 days
      else if (i % 10 === 6) remindDate = getRemindDateString(5); // normal
      else if (i % 10 === 7) remindDate = getRemindDateString(-2); // OVERDUE - 2 days ago
      else if (i % 10 === 8) remindDate = getRemindDateString(-5); // OVERDUE - 5 days ago
      else if (i % 10 === 9) remindDate = getRemindDateString(-1); // OVERDUE - yesterday
      else remindDate = getRemindDateString(7); // normal - 7 days from now
    }

    const customer: Customer = {
      id: String(i),
      date: getDateString(daysAgo),
      remindDate,
      status,
      domain,
      companyName: companyNames[(i - 1) % companyNames.length],
      job: jobs[(i - 1) % jobs.length],
      jobLink: getJobLink(jobSource, i),
      jobSource: jobSource,
      contacts: [
        {
          name: contactNames[i % contactNames.length],
          email: `contact${i}@example.com`,
          phone: `09${String(i).padStart(8, '0')}`,
          linkedin: `https://linkedin.com/in/contact${i}`
        }
      ],
      priority: i % 3 === 0 ? 'high' : 'normal',
      bdAssigned: bdId,
      communicationHistory: i % 2 === 0 ? `Lịch sử giao tiếp khách hàng ${i}` : undefined,
      nextStep: i % 2 === 1 ? `Bước tiếp theo cho khách hàng ${i}` : undefined,
      createdAt: getISOString(daysAgo, 8),
      updatedAt: getISOString(daysAgo - cycleLength > 0 ? daysAgo - cycleLength : 1, 16),
      ...(status === 'Signed' && {
        contractStatus: {
          dealInfo: `Deal với ${companyNames[(i - 1) % companyNames.length]}`,
          actualRevenue: (Math.floor(Math.random() * 10) + 1) * 10000000
        }
      })
    };

    customers.push(customer);
  }

  return customers;
};

export const mockCustomers: Customer[] = generateMockCustomers();

export const mockReminders: Reminder[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'LG Electronics Development Vietnam',
    remindDate: '2025-01-26',
    status: 'Approach',
    message: 'Cần follow up với khách hàng - đã 7 ngày kể từ lần tiếp cận cuối',
    isRead: false
  },
  {
    id: '2',
    customerId: '3',
    customerName: 'Airquay Vina',
    remindDate: '2025-01-26',
    status: 'Follow up',
    message: 'Reminder: Tiếp tục follow up khách hàng Airquay Vina',
    isRead: false
  },
  {
    id: '3',
    customerId: '6',
    customerName: 'ATI JSC',
    remindDate: '2025-01-27',
    status: 'Approach',
    message: 'Cần tiếp tục approach khách hàng ATI JSC',
    isRead: true
  }
];

// Mock status history data - keyed by customer ID
export const mockStatusHistory: Record<string, StatusHistoryEntry[]> = {
  '1': [
    {
      id: 'h1-1',
      timestamp: '2025-01-19T08:00:00Z',
      previousStatus: 'Research',
      newStatus: 'Addfriend/Connect',
      changedBy: '1',
      note: 'Tìm thấy contact trên LinkedIn, bắt đầu kết nối'
    },
    {
      id: 'h1-2',
      timestamp: '2025-01-19T10:00:00Z',
      previousStatus: 'Addfriend/Connect',
      newStatus: 'Approach',
      changedBy: '1',
      note: 'Đã gửi tin nhắn giới thiệu dịch vụ, chờ phản hồi'
    }
  ],
  '3': [
    {
      id: 'h3-1',
      timestamp: '2025-01-19T08:00:00Z',
      previousStatus: 'Research',
      newStatus: 'Approach',
      changedBy: '1',
    },
    {
      id: 'h3-2',
      timestamp: '2025-01-20T09:30:00Z',
      previousStatus: 'Approach',
      newStatus: 'Follow up',
      changedBy: '1',
      note: 'Khách hàng phản hồi, đang dùng headhunt bên khác nhưng quan tâm dịch vụ'
    },
    {
      id: 'h3-3',
      timestamp: '2025-01-21T14:00:00Z',
      previousStatus: 'Follow up',
      newStatus: 'Follow up',
      changedBy: '1',
      note: 'Đã kết nối Zalo, hẹn liên hệ lại sau 1 tháng'
    }
  ],
  '4': [
    {
      id: 'h4-1',
      timestamp: '2025-01-19T08:00:00Z',
      previousStatus: 'Research',
      newStatus: 'Approach',
      changedBy: '3',
    },
    {
      id: 'h4-2',
      timestamp: '2025-01-20T10:00:00Z',
      previousStatus: 'Approach',
      newStatus: 'Consulting',
      changedBy: '3',
      note: 'Khách hàng quan tâm, đã gửi thông tin dịch vụ'
    },
    {
      id: 'h4-3',
      timestamp: '2025-01-21T11:00:00Z',
      previousStatus: 'Consulting',
      newStatus: 'Demo contract',
      changedBy: '3',
    },
    {
      id: 'h4-4',
      timestamp: '2025-01-22T14:00:00Z',
      previousStatus: 'Demo contract',
      newStatus: 'Signing',
      changedBy: '3',
      note: 'Đã gửi hợp đồng, chờ khách hàng ký'
    },
    {
      id: 'h4-5',
      timestamp: '2025-01-22T16:00:00Z',
      previousStatus: 'Signing',
      newStatus: 'Signed',
      changedBy: '3',
      note: 'Ký HĐ headhunt thành công!'
    }
  ],
  '7': [
    {
      id: 'h7-1',
      timestamp: '2025-01-21T10:00:00Z',
      previousStatus: 'Research',
      newStatus: 'Approach',
      changedBy: '1',
    },
    {
      id: 'h7-2',
      timestamp: '2025-01-22T11:00:00Z',
      previousStatus: 'Approach',
      newStatus: 'Consulting',
      changedBy: '1',
      note: 'Đã trao đổi về nhu cầu tuyển dụng Game Developer'
    },
    {
      id: 'h7-3',
      timestamp: '2025-01-23T15:00:00Z',
      previousStatus: 'Consulting',
      newStatus: 'Demo contract',
      changedBy: '1',
      note: 'Đã demo dịch vụ, khách hàng quan tâm, chuẩn bị gửi proposal'
    }
  ]
};

// Mock communication history data - keyed by customer ID
const communicationMethods: CommunicationMethod[] = ['message', 'call', 'email', 'meeting'];

export const mockCommunicationHistory: Record<string, CommunicationHistoryEntry[]> = {
  '1': [
    {
      id: 'comm-1-1',
      timestamp: getISOString(5, 10),
      bdId: '1',
      contactName: 'Nguyễn Văn Minh',
      method: 'message',
      note: 'Đã gửi tin nhắn giới thiệu dịch vụ headhunt qua LinkedIn. Khách hàng đã xem tin nhắn.'
    },
    {
      id: 'comm-1-2',
      timestamp: getISOString(3, 14),
      bdId: '1',
      contactName: 'Nguyễn Văn Minh',
      method: 'call',
      note: 'Gọi điện trao đổi chi tiết về nhu cầu tuyển dụng. Khách hàng đang tìm Senior Backend Developer.'
    }
  ],
  '3': [
    {
      id: 'comm-3-1',
      timestamp: getISOString(7, 9),
      bdId: '1',
      contactName: 'Lê Hoàng Nam',
      method: 'email',
      note: 'Gửi email giới thiệu profile công ty và các dịch vụ headhunt.'
    },
    {
      id: 'comm-3-2',
      timestamp: getISOString(4, 15),
      bdId: '1',
      contactName: 'Lê Hoàng Nam',
      method: 'meeting',
      note: 'Gặp mặt trực tiếp tại văn phòng khách hàng. Đã trình bày portfolio và thảo luận về quy trình tuyển dụng.'
    },
    {
      id: 'comm-3-3',
      timestamp: getISOString(1, 11),
      bdId: '1',
      contactName: 'Lê Hoàng Nam',
      method: 'call',
      note: 'Follow up sau buổi meeting. Khách hàng cần thời gian để thảo luận nội bộ.'
    }
  ],
  '4': [
    {
      id: 'comm-4-1',
      timestamp: getISOString(10, 8),
      bdId: '3',
      contactName: 'Phạm Thị Mai',
      method: 'message',
      note: 'Gửi tin nhắn qua Zalo giới thiệu dịch vụ.'
    },
    {
      id: 'comm-4-2',
      timestamp: getISOString(8, 16),
      bdId: '3',
      contactName: 'Phạm Thị Mai',
      method: 'call',
      note: 'Trao đổi chi tiết về các vị trí cần tuyển và mức fee.'
    }
  ],
  '7': [
    {
      id: 'comm-7-1',
      timestamp: getISOString(6, 10),
      bdId: '1',
      contactName: 'Đỗ Quang Hải',
      method: 'email',
      note: 'Gửi email proposal chi tiết về dịch vụ tuyển dụng Game Developer.'
    }
  ]
};
