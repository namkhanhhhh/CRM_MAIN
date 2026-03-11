import { useState } from 'react';
import { Customer, ContactInfo, CommunicationMethod, CommunicationHistoryEntry } from '@/types/customer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Phone, Mail, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface QuickNoteDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (customerId: string, entry: CommunicationHistoryEntry) => void;
}

const communicationMethods: { value: CommunicationMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'message', label: 'Nhắn tin', icon: <MessageSquare className="h-4 w-4" /> },
  { value: 'call', label: 'Gọi điện', icon: <Phone className="h-4 w-4" /> },
  { value: 'email', label: 'Gửi Mail', icon: <Mail className="h-4 w-4" /> },
  { value: 'meeting', label: 'Gặp mặt trực tiếp', icon: <Users className="h-4 w-4" /> },
];

export function QuickNoteDialog({
  customer,
  open,
  onOpenChange,
  onSubmit,
}: QuickNoteDialogProps) {
  const { currentUser } = useAuth();
  const [contactName, setContactName] = useState('');
  const [method, setMethod] = useState<CommunicationMethod>('message');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!customer || !contactName || !note.trim()) return;

    const entry: CommunicationHistoryEntry = {
      id: `comm-${customer.id}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      bdId: currentUser.id,
      contactName,
      method,
      note: note.trim(),
    };

    onSubmit(customer.id, entry);
    handleClose();
  };

  const handleClose = () => {
    setContactName('');
    setMethod('message');
    setNote('');
    onOpenChange(false);
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Note nhanh - {customer.companyName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contact Selection */}
          <div className="space-y-2">
            <Label>Đối tượng liên hệ</Label>
            <Select value={contactName} onValueChange={setContactName}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn người liên hệ" />
              </SelectTrigger>
              <SelectContent>
                {customer.contacts.map((contact, index) => (
                  <SelectItem key={index} value={contact.name}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Communication Method */}
          <div className="space-y-2">
            <Label>Phương thức trao đổi</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as CommunicationMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {communicationMethods.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex items-center gap-2">
                      {m.icon}
                      {m.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note Content */}
          <div className="space-y-2">
            <Label>Nội dung ghi chú</Label>
            <Textarea
              placeholder="Nhập nội dung ghi chú nhanh..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!contactName || !note.trim()}>
            Lưu ghi chú
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function getCommunicationMethodLabel(method: CommunicationMethod): string {
  const labels: Record<CommunicationMethod, string> = {
    message: 'Nhắn tin',
    call: 'Gọi điện',
    email: 'Gửi Mail',
    meeting: 'Gặp mặt',
  };
  return labels[method];
}

export function getCommunicationMethodIcon(method: CommunicationMethod) {
  const icons: Record<CommunicationMethod, React.ReactNode> = {
    message: <MessageSquare className="h-4 w-4" />,
    call: <Phone className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />,
    meeting: <Users className="h-4 w-4" />,
  };
  return icons[method];
}
