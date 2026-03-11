import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AccountingRecord,
  computePaymentDeadline1,
  computePaymentDeadline2,
  computeAmountNoVAT,
  computeAmountVAT,
  computeRemainingPayment,
  computeWarrantyEndDate,
  computeBDCommission,
  computeHHCommission,
  computeCTVCommission,
  computeCTVPaymentDate,
  computeExpectedNetRevenue,
  computeActualNetRevenue,
  computeExpectedGrossProfit,
  computeActualGrossProfit,
} from '@/types/accounting';

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';
const formatDate = (d: string | null | undefined) => d || '—';

const statusColors: Record<string, string> = {
  Doing: 'bg-blue-100 text-blue-700',
  Done: 'bg-green-100 text-green-700',
  Reject: 'bg-red-100 text-red-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  'Đã xuất': 'bg-green-100 text-green-700',
  'Chưa xuất': 'bg-yellow-100 text-yellow-700',
};

function InfoRow({ label, value, highlight }: { label: string; value: string | React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-red-600' : ''}`}>{value}</span>
    </div>
  );
}

interface Props {
  record: AccountingRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountingDetailDialog({ record, open, onOpenChange }: Props) {
  if (!record) return null;
  const r = record;
  const noVAT = computeAmountNoVAT(r);
  const vat = computeAmountVAT(r);
  const remaining = computeRemainingPayment(r);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết công nợ — {r.candidateName}
            <Badge className={`text-[10px] ${statusColors[r.overallStatus]}`}>{r.overallStatus}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Thông tin chung */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Thông tin chung</h4>
            <div className="bg-muted/30 rounded-lg p-3 space-y-0.5">
              <InfoRow label="Ngày nhận Offer" value={formatDate(r.offerDate)} />
              <InfoRow label="Khách hàng" value={r.clientName} />
              <InfoRow label="Vị trí" value={r.jobTitle} />
              <InfoRow label="Ứng viên" value={r.candidateName} />
              <InfoRow label="Headhunter phụ trách" value={r.ownerName} />
              <InfoRow label="Loại UV" value={<Badge variant="outline" className="text-[10px]">{r.candidateType}</Badge>} />
              <InfoRow label="BD phụ trách" value={r.bdName} />
              <InfoRow label="Rate" value={r.rate.toString()} />
              <InfoRow label="Lương UV" value={formatVND(r.candidateSalary)} />
              <InfoRow label="Ngày đi làm" value={formatDate(r.onboardDate)} />
              <InfoRow label="Loại HĐ" value={<Badge variant="outline" className="text-[10px]">{r.contractType}</Badge>} />
              <InfoRow label="Số ngày bảo hành" value={`${r.warrantyDays} ngày`} />
            </div>
          </div>

          <Separator />

          {/* Hoa hồng */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Hoa hồng</h4>
            <div className="grid grid-cols-2 gap-x-6 bg-muted/30 rounded-lg p-3">
              <InfoRow label="BD (%)" value={`${r.commissionRateBD}%`} />
              <InfoRow label="Headhunter (%)" value={`${r.commissionRateHH}%`} />
              <InfoRow label="CTV (%)" value={`${r.commissionRateCTV}%`} />
              <InfoRow label="Intern (VNĐ)" value={formatVND(r.commissionAmountIntern)} />
              <InfoRow label="Freelancer (VNĐ)" value={formatVND(r.commissionAmountFreelancer)} />
              <InfoRow label="Nội bộ (VNĐ)" value={formatVND(r.commissionAmountInternal)} />
            </div>
          </div>

          <Separator />

          {/* Thanh toán */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Thanh toán</h4>
            <div className="bg-muted/30 rounded-lg p-3 space-y-0.5">
              <InfoRow label="Số ngày TT lần 1" value={`${r.paymentDays1} ngày`} />
              <InfoRow label="Hạn TT Đợt 1" value={formatDate(computePaymentDeadline1(r))} />
              <InfoRow label="Tiền TT Đợt 1" value={formatVND(r.paymentAmount1)} />
              <InfoRow label="Số ngày TT lần 2" value={`${r.paymentDays2} ngày`} />
              <InfoRow label="Hạn TT Đợt 2" value={formatDate(computePaymentDeadline2(r))} />
              <InfoRow label="Tiền TT Đợt 2" value={formatVND(r.paymentAmount2)} />
              <InfoRow label="Refund" value={r.refund > 0 ? formatVND(r.refund) : '—'} />
            </div>
          </div>

          <Separator />

          {/* Tài chính */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tài chính</h4>
            <div className="bg-muted/30 rounded-lg p-3 space-y-0.5">
              <InfoRow label="Thành tiền (No VAT)" value={formatVND(noVAT)} />
              <InfoRow label="Thành tiền (VAT)" value={formatVND(vat)} />
              <InfoRow label="Cần thanh toán" value={formatVND(remaining)} highlight={remaining > 0} />
              <InfoRow label="Bảo hành đến" value={formatDate(computeWarrantyEndDate(r))} />
              <InfoRow label="Commission BD" value={formatVND(computeBDCommission(r))} />
              <InfoRow label="Doanh thu Headhunter" value={formatVND(computeHHCommission(r))} />
              <InfoRow label="Commission CTV" value={formatVND(computeCTVCommission(r))} />
              <InfoRow label="Ngày TT CTV" value={formatDate(computeCTVPaymentDate(r))} />
              <InfoRow label="TT CTV" value={<Badge className={`text-[10px] ${statusColors[r.ctvPaymentStatus]}`}>{r.ctvPaymentStatus}</Badge>} />
            </div>
          </div>

          <Separator />

          {/* Doanh thu & Lợi nhuận */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Doanh thu & Lợi nhuận</h4>
            <div className="grid grid-cols-2 gap-x-6 bg-muted/30 rounded-lg p-3">
              <InfoRow label="DT thuần (Dự kiến)" value={formatVND(computeExpectedNetRevenue(r))} />
              <InfoRow label="DT thuần (Thực tế)" value={formatVND(computeActualNetRevenue(r))} />
              <InfoRow label="LN gộp (Dự kiến)" value={formatVND(computeExpectedGrossProfit(r))} />
              <InfoRow label="LN gộp (Thực tế)" value={formatVND(computeActualGrossProfit(r))} />
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Hóa đơn:</span>
            <Badge className={`text-[10px] ${statusColors[r.invoiceStatus]}`}>{r.invoiceStatus}</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
