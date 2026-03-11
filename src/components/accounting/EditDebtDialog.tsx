import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, User, Building2 } from 'lucide-react';
import {
  AccountingRecord,
  computeAmountVAT,
  computePaymentDeadline1,
  computePaymentDeadline2,
} from '@/types/accounting';

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';
const formatDate = (d: string | null | undefined) => d || '—';

interface Props {
  record: AccountingRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (record: AccountingRecord) => void;
}

export function EditDebtDialog({ record, open, onOpenChange, onSave }: Props) {
  const [paymentAmount1, setPaymentAmount1] = useState(0);
  const [paymentAmount2, setPaymentAmount2] = useState(0);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (record && open) {
      setPaymentAmount1(record.paymentAmount1);
      setPaymentAmount2(record.paymentAmount2);
      setNote(record.note || '');
    }
  }, [record, open]);

  if (!record) return null;

  const vatAmount = computeAmountVAT(record);
  const deadline1 = computePaymentDeadline1(record);
  const deadline2 = computePaymentDeadline2(record);
  const totalPaid = paymentAmount1 + paymentAmount2;
  const balance = vatAmount - totalPaid;

  const handleSave = () => {
    onSave({
      ...record,
      paymentAmount1,
      paymentAmount2,
      note: note || undefined,
      updatedAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa công nợ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Read-only info */}
          <div>
            <Label className="text-xs font-semibold flex items-center gap-1.5 mb-2">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              Thông tin case
            </Label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md border p-2.5">
                <div className="text-muted-foreground mb-0.5">Khách hàng</div>
                <div className="font-medium">{record.clientName}</div>
              </div>
              <div className="rounded-md border p-2.5">
                <div className="text-muted-foreground mb-0.5">Vị trí</div>
                <div className="font-medium">{record.jobTitle}</div>
              </div>
              <div className="rounded-md border p-2.5">
                <div className="text-muted-foreground mb-0.5">Ứng viên</div>
                <div className="font-medium">{record.candidateName}</div>
              </div>
              <div className="rounded-md border p-2.5">
                <div className="text-muted-foreground mb-0.5">Headhunter</div>
                <div className="font-medium">{record.ownerName}</div>
              </div>
              <div className="rounded-md border p-2.5">
                <div className="text-muted-foreground mb-0.5">Ngày Onboard</div>
                <div className="font-medium">{formatDate(record.onboardDate)}</div>
              </div>
              <div className="rounded-md border p-2.5">
                <div className="text-muted-foreground mb-0.5">Loại HĐ</div>
                <div className="font-medium">{record.contractType}</div>
              </div>
              <div className="rounded-md border p-2.5">
                <div className="text-muted-foreground mb-0.5">Hạn TT1</div>
                <div className="font-medium">{formatDate(deadline1)}</div>
              </div>
              <div className="rounded-md border p-2.5">
                <div className="text-muted-foreground mb-0.5">Hạn TT2</div>
                <div className="font-medium">{formatDate(deadline2)}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Editable: payment amounts */}
          <div>
            <Label className="text-xs font-semibold flex items-center gap-1.5 mb-2">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              Cập nhật thanh toán
            </Label>

            <div className="rounded-md border p-3 mb-3 bg-muted/30">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Nợ phát sinh</span>
                <span className="font-semibold">{formatVND(vatAmount)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tiền TT đợt 1 (VNĐ)</Label>
                <Input
                  type="number"
                  value={paymentAmount1}
                  onChange={e => setPaymentAmount1(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="text-xs">Tiền TT đợt 2 (VNĐ)</Label>
                <Input
                  type="number"
                  value={paymentAmount2}
                  onChange={e => setPaymentAmount2(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Live balance */}
            <div className="flex gap-2 mt-3">
              <div className="flex-1 rounded-md border border-green-200 p-2 text-center text-xs">
                <div className="text-muted-foreground">Đã TT</div>
                <div className="font-semibold text-green-600">{formatVND(totalPaid)}</div>
              </div>
              <div className="flex-1 rounded-md border border-destructive/30 p-2 text-center text-xs">
                <div className="text-muted-foreground">Số dư cuối kỳ</div>
                <div className={`font-semibold ${balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {formatVND(balance)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-xs">Ghi chú</Label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Nhập ghi chú công nợ..."
              className="text-xs min-h-[60px] resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
