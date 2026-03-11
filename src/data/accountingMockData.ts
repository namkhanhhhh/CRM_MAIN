import { AccountingRecord, CandidateType, ContractType, OverallStatus, InvoiceStatus, PaymentStatus } from '@/types/accounting';

const getDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const companies = ['VNG Corporation', 'FPT Software', 'Viettel Group', 'VNPAY', 'MoMo', 'Tiki', 'Shopee Vietnam', 'Grab Vietnam', 'KMS Technology', 'NashTech'];
const jobs = ['Senior Backend Developer', 'Frontend Developer', 'DevOps Engineer', 'iOS Developer', 'QA Engineer', 'Product Manager', 'Java Developer', 'Python Developer', 'Flutter Developer', 'React Native Developer'];
const candidates = ['Nguyễn Nam Khánh', 'Trần Thị Hương', 'Lê Văn Minh', 'Phạm Thị Lan', 'Đỗ Quang Hải', 'Vũ Thị Mai', 'Hoàng Văn Đức', 'Ngô Thị Hoa', 'Đinh Văn Tùng', 'Bùi Thị Nga', 'Lý Văn Khang', 'Dương Thị Linh', 'Phan Văn Long', 'Tạ Thị Uyên', 'Võ Văn Sơn'];
const owners = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D'];
const bds = ['Nguyễn BD1', 'Trần BD2', 'Lê BD3', 'Phạm BD4'];
const candidateTypes: CandidateType[] = ['Nội bộ', 'CTV', 'Intern', 'Freelancer'];
const contractTypes: ContractType[] = ['Cá nhân', 'Công ty'];
const overallStatuses: OverallStatus[] = ['Doing', 'Done', 'Reject'];
const invoiceStatuses: InvoiceStatus[] = ['Đã xuất', 'Chưa xuất'];
const paymentStatuses: PaymentStatus[] = ['Pending', 'Doing', 'Done'];

export const mockAccountingRecords: AccountingRecord[] = Array.from({ length: 40 }, (_, i) => {
  const salary = (Math.floor(Math.random() * 40) + 10) * 1000000;
  const rate = [0.8, 1, 1.2, 1.5, 2][i % 5];
  const noVAT = salary * rate;
  const ct = contractTypes[i % 2];
  const status = overallStatuses[i % 3];
  const payAmt1 = status !== 'Reject' ? Math.round(noVAT * (ct === 'Công ty' ? 1.08 : 1) * 0.5) : 0;
  const payAmt2 = status === 'Done' ? Math.round(noVAT * (ct === 'Công ty' ? 1.08 : 1) * 0.5) : 0;

  return {
    id: `acc-${i + 1}`,
    offerDate: getDateStr(60 + i * 2),
    clientName: companies[i % companies.length],
    jobTitle: jobs[i % jobs.length],
    candidateName: candidates[i % candidates.length],
    ownerName: owners[i % owners.length],
    candidateType: candidateTypes[i % candidateTypes.length],
    bdName: bds[i % bds.length],
    rate,
    candidateSalary: salary,
    onboardDate: status !== 'Reject' ? getDateStr(30 + i) : undefined,
    contractType: ct,
    commissionRateBD: 20,
    commissionRateHH: 80,
    commissionRateCTV: [5, 8, 10, 3][i % 4],
    commissionAmountIntern: [2000000, 3000000, 0, 1000000][i % 4],
    commissionAmountFreelancer: [5000000, 0, 8000000, 3000000][i % 4],
    commissionAmountInternal: [3000000, 5000000, 2000000, 4000000][i % 4],
    paymentDays1: [30, 45, 60][i % 3],
    paymentDays2: [60, 90, 120][i % 3],
    paymentAmount1: payAmt1,
    paymentAmount2: payAmt2,
    refund: i % 7 === 0 ? Math.round(noVAT * 0.1) : 0,
    warrantyDays: [60, 90, 120][i % 3],
    overallStatus: status,
    invoiceStatus: invoiceStatuses[i % 2],
    ctvPaymentStatus: paymentStatuses[i % 3],
    createdAt: getDateStr(60 + i * 2),
    updatedAt: getDateStr(i),
  };
});
