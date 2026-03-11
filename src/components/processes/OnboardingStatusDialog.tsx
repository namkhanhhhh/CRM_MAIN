import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, UserCheck, DollarSign } from 'lucide-react';
import { ProcessRecord } from '@/types/process';

interface OnboardingStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  process: ProcessRecord | null;
  onConfirm: (data: {
    onboardingDate: string;
    revenue: number;
    processNote: string;
  }) => void;
}

export function OnboardingStatusDialog({
  open,
  onOpenChange,
  process,
  onConfirm,
}: OnboardingStatusDialogProps) {
  const [onboardingDate, setOnboardingDate] = useState('');
  const [revenue, setRevenue] = useState('');
  const [processNote, setProcessNote] = useState('');

  const handleConfirm = () => {
    if (!onboardingDate) {
      return;
    }

    const revenueValue = parseInt(revenue.replace(/[^0-9]/g, ''), 10) || 0;

    onConfirm({
      onboardingDate,
      revenue: revenueValue,
      processNote,
    });

    // Reset form
    setOnboardingDate('');
    setRevenue('');
    setProcessNote('');
    onOpenChange(false);
  };

  const formatRevenue = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return new Intl.NumberFormat('vi-VN').format(parseInt(numericValue, 10));
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRevenue(e.target.value);
    setRevenue(formatted);
  };

  if (!process) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Process Note & Status
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {process.candidateName} - <span className="text-primary">{process.jobTitle}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Process Status Badge */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Process Status</Label>
            <Badge 
              variant="outline" 
              className="flex w-fit items-center gap-2 px-3 py-2 border-primary bg-primary/5 text-primary"
            >
              <UserCheck className="h-4 w-4" />
              ONBOARDING
            </Badge>
          </div>

          {/* Onboarding Date */}
          <div className="space-y-2">
            <Label htmlFor="onboardingDate" className="text-sm font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Onboarding Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="onboardingDate"
              type="date"
              value={onboardingDate}
              onChange={(e) => setOnboardingDate(e.target.value)}
              className="w-full"
              required
            />
            <p className="text-xs text-muted-foreground">
              Ngày ứng viên bắt đầu làm việc. Email thông báo sẽ được gửi đến infor@tdconsulting.vn và ketoan@tdconsulting.vn.
            </p>
          </div>

          {/* Revenue Field - NEW */}
          <div className="space-y-2">
            <Label htmlFor="revenue" className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Doanh số (VND, chưa gồm VAT)
            </Label>
            <div className="relative">
              <Input
                id="revenue"
                type="text"
                value={revenue}
                onChange={handleRevenueChange}
                placeholder="Nhập doanh số"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                VNĐ
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Doanh số ghi nhận cho case này (không bao gồm VAT)
            </p>
          </div>

          {/* Process Note */}
          <div className="space-y-2">
            <Label htmlFor="processNote" className="text-sm font-medium">
              Process Note <span className="text-muted-foreground">(Rich text)</span>
            </Label>
            <div className="border rounded-md">
              {/* Simple toolbar simulation */}
              <div className="flex items-center gap-1 border-b px-2 py-1 bg-muted/30">
                <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 font-bold">
                  B
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 italic">
                  I
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0">
                  ☰
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0">
                  ≡
                </Button>
              </div>
              <Textarea
                id="processNote"
                value={processNote}
                onChange={(e) => setProcessNote(e.target.value)}
                placeholder="Xác nhận Ứng viên"
                className="border-0 focus-visible:ring-0 min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!onboardingDate}
            className="bg-primary hover:bg-primary/90"
          >
            Confirm Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
