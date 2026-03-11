import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CustomerStatus } from '@/types/customer';
import { StatusBadge } from './StatusBadge';
import { ArrowRight } from 'lucide-react';

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  previousStatus: CustomerStatus;
  newStatus: CustomerStatus;
  onConfirm: (note?: string) => void;
}

export function StatusChangeDialog({
  open,
  onOpenChange,
  customerName,
  previousStatus,
  newStatus,
  onConfirm,
}: StatusChangeDialogProps) {
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onConfirm(note.trim() || undefined);
    setNote('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setNote('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thay đổi trạng thái</DialogTitle>
          <DialogDescription>
            Cập nhật trạng thái cho <span className="font-semibold">{customerName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status change preview */}
          <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg">
            <StatusBadge status={previousStatus} />
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <StatusBadge status={newStatus} />
          </div>

          {/* Note input */}
          <div className="space-y-2">
            <Label htmlFor="status-note">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="status-note"
              placeholder="Nhập ghi chú về lý do thay đổi trạng thái..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
