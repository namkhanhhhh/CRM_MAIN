export type CandidateType = 'Nội bộ' | 'CTV' | 'Intern' | 'Freelancer';

export type ContractType = 'Cá nhân' | 'Công ty';

export type PaymentStatus = 'Pending' | 'Doing' | 'Done';

export type OverallStatus = 'Reject' | 'Doing' | 'Done';

export type InvoiceStatus = 'Đã xuất' | 'Chưa xuất';

export interface AccountingRecord {
  id: string;
  offerDate: string;
  clientName: string;
  jobTitle: string;
  candidateName: string;
  ownerName: string; // Headhunter phụ trách

  candidateType: CandidateType;
  bdName: string;
  rate: number;
  candidateSalary: number;
  onboardDate?: string;
  contractType: ContractType;

  // Commission rates (percentage-based)
  commissionRateBD: number; // % BD (mặc định 20%)
  commissionRateHH: number; // % Headhunter (mặc định 80%)
  commissionRateCTV: number; // % CTV

  // Commission amounts (fixed VND)
  commissionAmountIntern: number; // Tiền hoa hồng Intern
  commissionAmountFreelancer: number; // Tiền hoa hồng Freelancer
  commissionAmountInternal: number; // Tiền hoa hồng Nội bộ

  // Payment schedule
  paymentDays1: number;
  paymentDays2: number;
  paymentAmount1: number;
  paymentAmount2: number;
  refund: number;

  warrantyDays: number;

  overallStatus: OverallStatus;
  invoiceStatus: InvoiceStatus;
  ctvPaymentStatus: PaymentStatus;
  note?: string;
  starred?: boolean;

  createdAt: string;
  updatedAt: string;
}

// --- Computed fields ---

export const computePaymentDeadline1 = (r: AccountingRecord): string | null => {
  if (!r.onboardDate) return null;
  const d = new Date(r.onboardDate);
  d.setDate(d.getDate() + r.paymentDays1);
  return d.toISOString().split('T')[0];
};

export const computePaymentDeadline2 = (r: AccountingRecord): string | null => {
  if (!r.onboardDate) return null;
  const d = new Date(r.onboardDate);
  d.setDate(d.getDate() + r.paymentDays2);
  return d.toISOString().split('T')[0];
};

export const computeAmountNoVAT = (r: AccountingRecord): number => {
  return r.candidateSalary * r.rate;
};

export const computeAmountVAT = (r: AccountingRecord): number => {
  const noVAT = computeAmountNoVAT(r);
  return r.contractType === 'Công ty' ? noVAT * 1.08 : noVAT;
};

export const computeRemainingPayment = (r: AccountingRecord): number => {
  const vat = computeAmountVAT(r);
  return vat - r.paymentAmount1 - r.paymentAmount2 - r.refund;
};

export const computeWarrantyEndDate = (r: AccountingRecord): string | null => {
  if (!r.onboardDate) return null;
  const d = new Date(r.onboardDate);
  d.setDate(d.getDate() + r.warrantyDays);
  return d.toISOString().split('T')[0];
};

export const computeBDCommission = (r: AccountingRecord): number => {
  return computeAmountNoVAT(r) * (r.commissionRateBD / 100);
};

export const computeHHCommission = (r: AccountingRecord): number => {
  return computeAmountNoVAT(r) * (r.commissionRateHH / 100);
};

export const computeHHRevenue = (r: AccountingRecord): number => {
  return computeHHCommission(r);
};

export const computeCTVCommission = (r: AccountingRecord): number => {
  return r.candidateSalary * (r.commissionRateCTV / 100);
};

export const computeCTVPaymentDate = (r: AccountingRecord): string | null => {
  const warrantyEnd = computeWarrantyEndDate(r);
  if (!warrantyEnd) return null;
  const d = new Date(warrantyEnd);
  d.setDate(d.getDate() + 3);
  return d.toISOString().split('T')[0];
};

export const computeExpectedNetRevenue = (r: AccountingRecord): number => {
  return computeAmountNoVAT(r) - r.refund;
};

export const computeActualNetRevenue = (r: AccountingRecord): number => {
  const paid = r.paymentAmount1 + r.paymentAmount2;
  return r.contractType === 'Công ty' ? paid / 1.08 : paid;
};

export const computeTotalCommissions = (r: AccountingRecord): number => {
  const noVAT = computeAmountNoVAT(r);
  return (
    noVAT * (r.commissionRateBD / 100) +
    noVAT * (r.commissionRateHH / 100) +
    r.candidateSalary * (r.commissionRateCTV / 100) +
    r.commissionAmountIntern +
    r.commissionAmountFreelancer +
    r.commissionAmountInternal
  );
};

export const computeExpectedGrossProfit = (r: AccountingRecord): number => {
  return computeExpectedNetRevenue(r) - computeTotalCommissions(r);
};

export const computeActualGrossProfit = (r: AccountingRecord): number => {
  return computeActualNetRevenue(r) - computeTotalCommissions(r);
};
