import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Building2, Briefcase, User, CalendarDays, Check, ChevronsUpDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AccountingRecord,
  computeAmountVAT,
  computePaymentDeadline1,
  computePaymentDeadline2,
} from '@/types/accounting';
import { getDeadlineStatus } from '@/lib/deadlineUtils';

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';
const formatDate = (d: string | null | undefined) => d || '—';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (record: AccountingRecord) => void;
  existingRecords: AccountingRecord[];
}

export function AddDebtDialog({ open, onOpenChange, onAdd, existingRecords }: Props) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [paymentAmount1, setPaymentAmount1] = useState(0);
  const [paymentAmount2, setPaymentAmount2] = useState(0);
  const [note, setNote] = useState('');
  const [companyPopoverOpen, setCompanyPopoverOpen] = useState(false);

  const companies = useMemo(() => {
    const set = new Set(existingRecords.map(r => r.clientName));
    return Array.from(set).sort();
  }, [existingRecords]);

  const companyRecords = useMemo(() => {
    if (!selectedCompany) return [];
    return existingRecords.filter(r => r.clientName === selectedCompany && r.overallStatus !== 'Reject');
  }, [existingRecords, selectedCompany]);

  const selectedRecord = useMemo(() => {
    if (!selectedRecordId) return null;
    return existingRecords.find(r => r.id === selectedRecordId) || null;
  }, [existingRecords, selectedRecordId]);

  const vatAmount = selectedRecord ? computeAmountVAT(selectedRecord) : 0;
  const deadline1 = selectedRecord ? computePaymentDeadline1(selectedRecord) : null;
  const deadline2 = selectedRecord ? computePaymentDeadline2(selectedRecord) : null;
  const totalPaid = paymentAmount1 + paymentAmount2;
  const balance = vatAmount - totalPaid;

  const deadline1Status = getDeadlineStatus(deadline1);
  const deadline2Status = getDeadlineStatus(deadline2);

  const handleCompanyChange = (company: string) => {
    setSelectedCompany(company);
    setSelectedRecordId('');
    setPaymentAmount1(0);
    setPaymentAmount2(0);
    setCompanyPopoverOpen(false);
  };

  const handleRecordChange = (recordId: string) => {
    setSelectedRecordId(recordId);
    const rec = existingRecords.find(r => r.id === recordId);
    if (rec) {
      setPaymentAmount1(rec.paymentAmount1);
      setPaymentAmount2(rec.paymentAmount2);
    }
  };

  const handleSubmit = () => {
    if (!selectedRecord) return;
    const updated: AccountingRecord = {
      ...selectedRecord,
      paymentAmount1,
      paymentAmount2,
      note: note || selectedRecord.note,
      updatedAt: new Date().toISOString(),
    };
    onAdd(updated);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedCompany('');
    setSelectedRecordId('');
    setPaymentAmount1(0);
    setPaymentAmount2(0);
    setNote('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm công nợ mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Searchable Company */}
          <div>
            <Label className="text-xs font-semibold flex items-center gap-1.5 mb-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              Bước 1: Chọn công ty
            </Label>
            <Popover open={companyPopoverOpen} onOpenChange={setCompanyPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={companyPopoverOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedCompany || 'Tìm và chọn công ty...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Nhập tên công ty..." />
                  <CommandList>
                    <CommandEmpty>Không tìm thấy công ty.</CommandEmpty>
                    <CommandGroup>
                      {companies.map(c => (
                        <CommandItem
                          key={c}
                          value={c}
                          onSelect={() => handleCompanyChange(c)}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedCompany === c ? "opacity-100" : "opacity-0")} />
                          {c}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Step 2: Select Position */}
          {selectedCompany && (
            <div>
              <Label className="text-xs font-semibold flex items-center gap-1.5 mb-1.5">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                Bước 2: Chọn vị trí tuyển dụng
              </Label>
              {companyRecords.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">Không có vị trí nào đang hoạt động cho công ty này.</p>
              ) : (
                <Select value={selectedRecordId} onValueChange={handleRecordChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vị trí..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companyRecords.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.jobTitle} — {r.candidateName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Auto-filled info */}
          {selectedRecord && (
            <>
              <Separator />
              <div>
                <Label className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                  <User className="h-3.5 w-3.5 text-primary" />
                  Thông tin tự động
                </Label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border p-2.5">
                    <div className="text-muted-foreground mb-0.5">Ứng viên</div>
                    <div className="font-medium">{selectedRecord.candidateName}</div>
                  </div>
                  <div className="rounded-md border p-2.5">
                    <div className="text-muted-foreground mb-0.5">Headhunter</div>
                    <div className="font-medium">{selectedRecord.ownerName}</div>
                  </div>
                  <div className="rounded-md border p-2.5">
                    <div className="text-muted-foreground mb-0.5">Ngày Onboard</div>
                    <div className="font-medium">{formatDate(selectedRecord.onboardDate)}</div>
                  </div>
                  <div className="rounded-md border p-2.5">
                    <div className="text-muted-foreground mb-0.5">Loại HĐ</div>
                    <div className="font-medium">{selectedRecord.contractType}</div>
                  </div>
                  <DeadlineCell label="Hạn TT1" date={deadline1} status={deadline1Status} />
                  <DeadlineCell label="Hạn TT2" date={deadline2} status={deadline2Status} />
                </div>
              </div>

              <Separator />

              {/* Financial summary */}
              <div>
                <Label className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  Thông tin công nợ
                </Label>

                <div className="rounded-md border p-3 mb-3 bg-muted/30">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Nợ phát sinh (tự động)</span>
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
                <Label className="text-xs">Ghi chú công nợ</Label>
                <Textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  className="text-xs min-h-[60px] resize-none"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); resetForm(); }}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={!selectedRecord}>Thêm công nợ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeadlineCell({ label, date, status }: { label: string; date: string | null; status: 'normal' | 'warning' | 'danger' }) {
  const borderClass = status === 'danger' ? 'border-destructive bg-destructive/10' : status === 'warning' ? 'border-yellow-400 bg-yellow-50' : 'border';
  const textClass = status === 'danger' ? 'text-destructive font-semibold' : status === 'warning' ? 'text-yellow-700 font-semibold' : 'font-medium';

  return (
    <div className={cn("rounded-md p-2.5", borderClass)}>
      <div className="text-muted-foreground mb-0.5 flex items-center gap-1">
        {label}
        {status !== 'normal' && <AlertTriangle className={cn("h-3 w-3", status === 'danger' ? 'text-destructive' : 'text-yellow-500')} />}
      </div>
      <div className={textClass}>{date || '—'}</div>
    </div>
  );
}
