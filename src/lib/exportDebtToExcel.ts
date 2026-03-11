import * as XLSX from 'xlsx';
import {
  AccountingRecord,
  computeAmountVAT,
  computePaymentDeadline1,
  computePaymentDeadline2,
} from '@/types/accounting';

interface CompanyDebtExport {
  clientName: string;
  records: AccountingRecord[];
  totalDebt: number;
  totalPaid: number;
  endingBalance: number;
}

const formatVND = (n: number) => Math.round(n);
const formatDateVN = (d: string | null | undefined): string => {
  if (!d) return '';
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export function exportDebtToExcel(companies: CompanyDebtExport[]) {
  const wb = XLSX.utils.book_new();

  const headerRow = [
    'Tên khách hàng',
    'Nợ Phát sinh',
    'Đã Thanh toán',
    'Số dư cuối kỳ',
    'Chi tiết nợ theo case',
    'Vị trí',
    'Tên ứng viên',
    'Ngày UV Onboard',
    'Hạn thanh toán lần 1',
    'Hạn thanh toán lần 2',
    'Ghi chú',
  ];

  const rows: (string | number)[][] = [];
  rows.push(headerRow);

  for (const company of companies) {
    // First record row includes company totals
    company.records.forEach((r, idx) => {
      const vatAmount = computeAmountVAT(r);
      const paid = r.paymentAmount1 + r.paymentAmount2;
      const balance = vatAmount - paid;
      const deadline1 = computePaymentDeadline1(r);
      const deadline2 = computePaymentDeadline2(r);

      // Check if payment is done
      const dl1Display = r.paymentAmount1 > 0 && deadline1 ? 
        (paid >= vatAmount || r.paymentAmount1 >= vatAmount * 0.5 ? formatDateVN(deadline1) : formatDateVN(deadline1)) 
        : formatDateVN(deadline1);

      const row: (string | number)[] = [];

      if (idx === 0) {
        row.push(company.clientName);
        row.push(formatVND(company.totalDebt));
        row.push(company.totalPaid > 0 ? formatVND(company.totalPaid) : '');
        row.push(formatVND(company.endingBalance));
      } else {
        row.push('', '', '', '');
      }

      row.push(balance !== 0 ? formatVND(balance) : 0);
      row.push(r.jobTitle);
      row.push(r.candidateName);
      row.push(formatDateVN(r.onboardDate));
      row.push(formatDateVN(deadline1));
      row.push(formatDateVN(deadline2));
      row.push(r.note || '');

      rows.push(row);
    });

    // Empty separator row
    rows.push([]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 40 },  // Tên khách hàng
    { wch: 18 },  // Nợ Phát sinh
    { wch: 18 },  // Đã Thanh toán
    { wch: 18 },  // Số dư cuối kỳ
    { wch: 20 },  // Chi tiết nợ theo case
    { wch: 40 },  // Vị trí
    { wch: 25 },  // Tên ứng viên
    { wch: 18 },  // Ngày UV Onboard
    { wch: 22 },  // Hạn thanh toán lần 1
    { wch: 22 },  // Hạn thanh toán lần 2
    { wch: 30 },  // Ghi chú
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Công nợ');

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Cong_No_TDC_${today}.xlsx`);
}
