import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/types/customer';
import { ReminderMilestoneType, getNextMilestone, getMilestoneLabel, getMilestoneDays, isFinalMilestone } from '@/types/reminder';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CheckCircle, Calendar, ArrowRight, Clock, PartyPopper } from 'lucide-react';

interface RemindConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  currentMilestone: ReminderMilestoneType;
  reminderNumber: number;
  onConfirm: (note: string, nextRemindDate: Date | null, nextMilestone: ReminderMilestoneType | null) => void;
}

export function RemindConfirmDialog({
  open,
  onOpenChange,
  customer,
  currentMilestone,
  reminderNumber,
  onConfirm,
}: RemindConfirmDialogProps) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!customer) return null;

  const isFinal = isFinalMilestone(currentMilestone);
  const nextMilestone = getNextMilestone(currentMilestone);
  const nextDays = nextMilestone ? getMilestoneDays(nextMilestone) : 0;
  const today = new Date();
  const nextRemindDate = nextMilestone ? addDays(today, nextDays) : null;

  const handleSubmit = () => {
    if (!note.trim()) return;
    setIsSubmitting(true);
    onConfirm(note.trim(), nextRemindDate, nextMilestone);
    setNote('');
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setNote('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Xác nhận Remind
          </DialogTitle>
          <DialogDescription>
            Ghi lại thông tin cuộc remind và thiết lập mốc tiếp theo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Customer Info */}
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{customer.companyName}</span>
              <Badge variant="outline">{customer.status}</Badge>
            </div>
            {customer.job && (
              <p className="text-sm text-muted-foreground">Job: {customer.job}</p>
            )}
          </div>

          {/* Current Milestone Info */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Mốc hiện tại</p>
              <p className="font-medium">{getMilestoneLabel(currentMilestone)}</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              Remind lần #{reminderNumber}
            </Badge>
          </div>

          {/* Next Schedule Preview */}
          {isFinal ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <PartyPopper className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-700 dark:text-green-400">Hoàn thành chu kỳ remind!</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-500">
                Đây là mốc cuối cùng (30 ngày). Sau khi xác nhận, khách hàng sẽ được xóa khỏi danh sách nhắc nhở.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">Mốc tiếp theo</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {getMilestoneLabel(currentMilestone)}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {nextMilestone && getMilestoneLabel(nextMilestone)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ngày remind tiếp:</span>
                <span className="font-medium">
                  {nextRemindDate && format(nextRemindDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                (Sau {nextDays} ngày kể từ hôm nay)
              </p>
            </div>
          )}

          {/* Note Input */}
          <div className="space-y-2">
            <Label htmlFor="remind-note">
              Ghi chú cuộc remind <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="remind-note"
              placeholder="Nhập nội dung cuộc remind, kết quả trao đổi, các thông tin quan trọng..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Ghi chú sẽ được lưu vào lịch sử remind của khách hàng
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!note.trim() || isSubmitting}
            className={isFinal ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {isFinal ? (
              <>
                <PartyPopper className="h-4 w-4 mr-2" />
                Hoàn thành
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Xác nhận Remind
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
