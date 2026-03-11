import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Customer, CustomerStatus, StatusHistoryEntry } from '@/types/customer';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { StatusChangeDialog } from './StatusChangeDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  Building2,
  Briefcase,
  Globe,
  Link2,
  User,
  Mail,
  Phone,
  ExternalLink,
  MessageSquare,
  Target,
  FileText,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { bdUsers } from '@/data/mockData';

const statusOptions: { status: CustomerStatus; label: string }[] = [
  { status: 'Research', label: 'Research' },
  { status: 'Addfriend/Connect', label: 'Add/Connect' },
  { status: 'Approach', label: 'Approach' },
  { status: 'Follow up', label: 'Follow up' },
  { status: 'Consulting', label: 'Consulting' },
  { status: 'Demo contract', label: 'Demo contract' },
  { status: 'Signing', label: 'Signing' },
  { status: 'Signed', label: 'Signed' },
  { status: 'Meeting Clear JD', label: 'Meeting Clear JD' },
  { status: 'Hunting', label: 'Hunting' },
  { status: 'Take care', label: 'Take care' },
  { status: 'No current need', label: 'No current need' },
  { status: 'Excluded', label: 'Excluded' },
  { status: 'Rejected', label: 'Rejected' },
];

interface KanbanDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => void;
  onAddHistory: (customerId: string, entry: StatusHistoryEntry) => void;
}

export function KanbanDetailDialog({
  open,
  onOpenChange,
  customer,
  onUpdateCustomer,
  onAddHistory,
}: KanbanDetailDialogProps) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<CustomerStatus | null>(null);

  if (!customer) return null;

  const getBDName = (bdId?: string) => {
    if (!bdId) return 'Chưa phân công';
    const bd = bdUsers.find((u) => u.id === bdId);
    return bd?.name || 'Không xác định';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleStatusSelect = (newStatus: CustomerStatus) => {
    if (newStatus !== customer.status) {
      setPendingStatus(newStatus);
      setStatusDialogOpen(true);
    }
  };

  const handleStatusConfirm = (note?: string) => {
    if (!pendingStatus) return;

    const historyEntry: StatusHistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      previousStatus: customer.status,
      newStatus: pendingStatus,
      changedBy: '1',
      note,
    };
    onAddHistory(customer.id, historyEntry);
    onUpdateCustomer(customer.id, { status: pendingStatus });
    setPendingStatus(null);
  };

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    className,
  }: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    className?: string;
  }) => (
    <div className={cn('flex items-start gap-3 py-2', className)}>
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium">{value || '—'}</div>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {customer.companyName}
            </DialogTitle>
            <DialogDescription>
              Chi tiết thông tin khách hàng
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Status & Priority Section */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Trạng thái</p>
                <Select
                  value={customer.status}
                  onValueChange={handleStatusSelect}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue>
                      <StatusBadge status={customer.status} />
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s.status} value={s.status}>
                        <StatusBadge status={s.status} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Ưu tiên</p>
                <div className="h-9 flex items-center">
                  <PriorityBadge priority={customer.priority} />
                </div>
              </div>
            </div>

            {/* Main Info Section */}
            <div className="space-y-1 divide-y divide-border">
              <InfoRow
                icon={Calendar}
                label="Ngày tạo"
                value={formatDate(customer.date)}
              />
              <InfoRow
                icon={Clock}
                label="Ngày nhắc nhở"
                value={formatDate(customer.remindDate)}
              />
              <InfoRow
                icon={Globe}
                label="Domain"
                value={customer.domain}
              />
              <InfoRow
                icon={Briefcase}
                label="Job / Vị trí"
                value={
                  customer.job ? (
                    <div className="flex items-center gap-2">
                      <span>{customer.job}</span>
                      {customer.jobLink && (
                        <a
                          href={customer.jobLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 text-xs"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Xem job
                        </a>
                      )}
                    </div>
                  ) : undefined
                }
              />
              <InfoRow
                icon={Link2}
                label="Nguồn"
                value={customer.jobSource}
              />
              <InfoRow
                icon={User}
                label="BD phụ trách"
                value={getBDName(customer.bdAssigned)}
              />
            </div>

            {/* Company Note */}
            {customer.companyNote && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Ghi chú công ty
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  {customer.companyNote}
                </p>
              </div>
            )}

            {/* Contacts Section */}
            {customer.contacts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Thông tin liên hệ</h4>
                <div className="space-y-3">
                  {customer.contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted/30 rounded-lg space-y-2"
                    >
                      <p className="font-medium text-sm">{contact.name}</p>
                      <div className="grid grid-cols-1 gap-1.5 text-xs">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <a
                              href={`mailto:${contact.email}`}
                              className="hover:text-primary hover:underline"
                            >
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <a
                              href={`tel:${contact.phone}`}
                              className="hover:text-primary hover:underline"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        )}
                        {contact.linkedin && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <ExternalLink className="h-3 w-3" />
                            <a
                              href={contact.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary hover:underline truncate"
                            >
                              LinkedIn
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Step */}
            {customer.nextStep && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Bước tiếp theo
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  {customer.nextStep}
                </p>
              </div>
            )}

            {/* Communication History */}
            {customer.communicationHistory && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Lịch sử trao đổi
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">
                  {customer.communicationHistory}
                </p>
              </div>
            )}

            {/* Contract Status */}
            {customer.contractStatus && (customer.contractStatus.dealInfo || customer.contractStatus.actualRevenue) && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Thông tin hợp đồng
                </h4>
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  {customer.contractStatus.dealInfo && (
                    <div>
                      <p className="text-xs text-muted-foreground">Thông tin deal</p>
                      <p className="text-sm font-medium">{customer.contractStatus.dealInfo}</p>
                    </div>
                  )}
                  {customer.contractStatus.actualRevenue && (
                    <div>
                      <p className="text-xs text-muted-foreground">Doanh thu thực tế</p>
                      <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(customer.contractStatus.actualRevenue)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* System Metadata */}
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tạo: {formatDate(customer.createdAt)}</span>
                <span>Cập nhật: {formatDate(customer.updatedAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Status change confirmation dialog */}
      {pendingStatus && (
        <StatusChangeDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          customerName={customer.companyName}
          previousStatus={customer.status}
          newStatus={pendingStatus}
          onConfirm={handleStatusConfirm}
        />
      )}
    </>
  );
}
