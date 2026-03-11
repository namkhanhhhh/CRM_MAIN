import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AccountingRecord, CandidateType, ContractType, OverallStatus, InvoiceStatus, PaymentStatus } from '@/types/accounting';

const candidateTypes: CandidateType[] = ['Nội bộ', 'CTV', 'Intern', 'Freelancer'];
const contractTypes: ContractType[] = ['Cá nhân', 'Công ty'];
const overallStatuses: OverallStatus[] = ['Doing', 'Done', 'Reject'];
const invoiceStatuses: InvoiceStatus[] = ['Đã xuất', 'Chưa xuất'];
const paymentStatuses: PaymentStatus[] = ['Pending', 'Doing', 'Done'];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (record: AccountingRecord) => void;
}

export function AddAccountingDialog({ open, onOpenChange, onAdd }: Props) {
  const [form, setForm] = useState({
    offerDate: new Date().toISOString().split('T')[0],
    clientName: '',
    jobTitle: '',
    candidateName: '',
    ownerName: '',
    candidateType: 'Nội bộ' as CandidateType,
    bdName: '',
    rate: 1,
    candidateSalary: 0,
    onboardDate: '',
    contractType: 'Cá nhân' as ContractType,
    commissionRateBD: 20,
    commissionRateHH: 80,
    commissionRateCTV: 5,
    commissionAmountIntern: 0,
    commissionAmountFreelancer: 0,
    commissionAmountInternal: 0,
    paymentDays1: 30,
    paymentDays2: 60,
    warrantyDays: 60,
    overallStatus: 'Doing' as OverallStatus,
    invoiceStatus: 'Chưa xuất' as InvoiceStatus,
    ctvPaymentStatus: 'Pending' as PaymentStatus,
  });

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.clientName || !form.candidateName || !form.jobTitle) return;
    const now = new Date().toISOString();
    const record: AccountingRecord = {
      id: `acc-${Date.now()}`,
      ...form,
      onboardDate: form.onboardDate || undefined,
      paymentAmount1: 0,
      paymentAmount2: 0,
      refund: 0,
      overallStatus: form.overallStatus,
      invoiceStatus: form.invoiceStatus,
      ctvPaymentStatus: form.ctvPaymentStatus,
      createdAt: now,
      updatedAt: now,
    };
    onAdd(record);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm bản ghi công nợ mới</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Ngày nhận Offer</Label>
            <Input type="date" value={form.offerDate} onChange={e => set('offerDate', e.target.value)} />
          </div>
          <div>
            <Label>Khách hàng *</Label>
            <Input value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Tên khách hàng" />
          </div>
          <div>
            <Label>Vị trí tuyển dụng *</Label>
            <Input value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} placeholder="Vị trí" />
          </div>
          <div>
            <Label>Ứng viên *</Label>
            <Input value={form.candidateName} onChange={e => set('candidateName', e.target.value)} placeholder="Họ tên UV" />
          </div>
          <div>
            <Label>Headhunter phụ trách</Label>
            <Input value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="Headhunter" />
          </div>
          <div>
            <Label>Loại UV</Label>
            <Select value={form.candidateType} onValueChange={v => set('candidateType', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {candidateTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>BD phụ trách</Label>
            <Input value={form.bdName} onChange={e => set('bdName', e.target.value)} placeholder="BD" />
          </div>
          <div>
            <Label>Rate</Label>
            <Input type="number" step="0.1" value={form.rate} onChange={e => set('rate', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Lương UV</Label>
            <Input type="number" value={form.candidateSalary} onChange={e => set('candidateSalary', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Ngày đi làm</Label>
            <Input type="date" value={form.onboardDate} onChange={e => set('onboardDate', e.target.value)} />
          </div>
          <div>
            <Label>Loại HĐ</Label>
            <Select value={form.contractType} onValueChange={v => set('contractType', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {contractTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>% Hoa hồng BD</Label>
            <Input type="number" value={form.commissionRateBD} onChange={e => set('commissionRateBD', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <Label>% Hoa hồng Headhunter</Label>
            <Input type="number" value={form.commissionRateHH} onChange={e => set('commissionRateHH', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <Label>% Hoa hồng CTV</Label>
            <Input type="number" value={form.commissionRateCTV} onChange={e => set('commissionRateCTV', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <Label>HH Intern (VNĐ)</Label>
            <Input type="number" value={form.commissionAmountIntern} onChange={e => set('commissionAmountIntern', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label>HH Freelancer (VNĐ)</Label>
            <Input type="number" value={form.commissionAmountFreelancer} onChange={e => set('commissionAmountFreelancer', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label>HH Nội bộ (VNĐ)</Label>
            <Input type="number" value={form.commissionAmountInternal} onChange={e => set('commissionAmountInternal', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Số ngày TT lần 1</Label>
            <Input type="number" value={form.paymentDays1} onChange={e => set('paymentDays1', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Số ngày TT lần 2</Label>
            <Input type="number" value={form.paymentDays2} onChange={e => set('paymentDays2', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Số ngày bảo hành</Label>
            <Input type="number" value={form.warrantyDays} onChange={e => set('warrantyDays', parseInt(e.target.value) || 0)} />
          </div>
          <div>
            <Label>Trạng thái tổng</Label>
            <Select value={form.overallStatus} onValueChange={v => set('overallStatus', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {overallStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Trạng thái hóa đơn</Label>
            <Select value={form.invoiceStatus} onValueChange={v => set('invoiceStatus', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {invoiceStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Trạng thái TT CTV</Label>
            <Select value={form.ctvPaymentStatus} onValueChange={v => set('ctvPaymentStatus', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit}>Thêm mới</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
