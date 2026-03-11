import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  AccountingRecord,
  CandidateType,
  ContractType,
  OverallStatus,
  InvoiceStatus,
  PaymentStatus,
} from '@/types/accounting';

const candidateTypes: CandidateType[] = ['Nội bộ', 'CTV', 'Intern', 'Freelancer'];
const contractTypes: ContractType[] = ['Cá nhân', 'Công ty'];
const overallStatuses: OverallStatus[] = ['Doing', 'Done', 'Reject'];
const invoiceStatuses: InvoiceStatus[] = ['Đã xuất', 'Chưa xuất'];
const paymentStatuses: PaymentStatus[] = ['Pending', 'Doing', 'Done'];

interface Props {
  record: AccountingRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (record: AccountingRecord) => void;
}

export function AccountingEditDialog({ record, open, onOpenChange, onSave }: Props) {
  const [form, setForm] = useState<AccountingRecord | null>(null);

  const currentForm = form?.id === record?.id ? form : record;
  if (!currentForm) return null;

  const set = (key: string, value: any) => {
    setForm({ ...currentForm, [key]: value });
  };

  const handleSave = () => {
    if (!currentForm) return;
    onSave({ ...currentForm, updatedAt: new Date().toISOString() });
    onOpenChange(false);
    setForm(null);
  };

  const r = currentForm;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setForm(null); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa — {r.candidateName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Thông tin chung</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Ngày nhận Offer</Label>
                <Input type="date" value={r.offerDate} onChange={e => set('offerDate', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Ngày đi làm</Label>
                <Input type="date" value={r.onboardDate || ''} onChange={e => set('onboardDate', e.target.value || undefined)} />
              </div>
              <div>
                <Label className="text-xs">Khách hàng</Label>
                <Input value={r.clientName} onChange={e => set('clientName', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Vị trí</Label>
                <Input value={r.jobTitle} onChange={e => set('jobTitle', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Ứng viên</Label>
                <Input value={r.candidateName} onChange={e => set('candidateName', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Headhunter phụ trách</Label>
                <Input value={r.ownerName} onChange={e => set('ownerName', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Loại UV</Label>
                <Select value={r.candidateType} onValueChange={v => set('candidateType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{candidateTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">BD phụ trách</Label>
                <Input value={r.bdName} onChange={e => set('bdName', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Rate</Label>
                <Input type="number" step="0.1" value={r.rate} onChange={e => set('rate', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Lương UV</Label>
                <Input type="number" value={r.candidateSalary} onChange={e => set('candidateSalary', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Loại HĐ</Label>
                <Select value={r.contractType} onValueChange={v => set('contractType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{contractTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Hoa hồng</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">% BD</Label>
                <Input type="number" value={r.commissionRateBD} onChange={e => set('commissionRateBD', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">% Headhunter</Label>
                <Input type="number" value={r.commissionRateHH} onChange={e => set('commissionRateHH', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">% CTV</Label>
                <Input type="number" value={r.commissionRateCTV} onChange={e => set('commissionRateCTV', parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Intern (VNĐ)</Label>
                <Input type="number" value={r.commissionAmountIntern} onChange={e => set('commissionAmountIntern', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Freelancer (VNĐ)</Label>
                <Input type="number" value={r.commissionAmountFreelancer} onChange={e => set('commissionAmountFreelancer', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Nội bộ (VNĐ)</Label>
                <Input type="number" value={r.commissionAmountInternal} onChange={e => set('commissionAmountInternal', parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Thanh toán & Bảo hành</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Số ngày TT lần 1</Label>
                <Input type="number" value={r.paymentDays1} onChange={e => set('paymentDays1', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Số ngày TT lần 2</Label>
                <Input type="number" value={r.paymentDays2} onChange={e => set('paymentDays2', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Tiền TT Đợt 1</Label>
                <Input type="number" value={r.paymentAmount1} onChange={e => set('paymentAmount1', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Tiền TT Đợt 2</Label>
                <Input type="number" value={r.paymentAmount2} onChange={e => set('paymentAmount2', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Refund</Label>
                <Input type="number" value={r.refund} onChange={e => set('refund', parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Số ngày bảo hành</Label>
                <Input type="number" value={r.warrantyDays} onChange={e => set('warrantyDays', parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Trạng thái</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Trạng thái tổng</Label>
                <Select value={r.overallStatus} onValueChange={v => set('overallStatus', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{overallStatuses.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Hóa đơn</Label>
                <Select value={r.invoiceStatus} onValueChange={v => set('invoiceStatus', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{invoiceStatuses.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">TT CTV</Label>
                <Select value={r.ctvPaymentStatus} onValueChange={v => set('ctvPaymentStatus', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{paymentStatuses.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setForm(null); }}>Hủy</Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
