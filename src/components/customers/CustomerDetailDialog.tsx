import { Customer } from '@/types/customer';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Calendar,
  Phone,
  Mail,
  Linkedin,
  Briefcase,
  User,
  MessageSquare,
  ArrowRight,
  DollarSign,
  Clock,
} from 'lucide-react';
import { bdUsers } from '@/data/mockData';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface CustomerDetailDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailDialog({
  customer,
  open,
  onOpenChange,
}: CustomerDetailDialogProps) {
  if (!customer) return null;

  const bdName = customer.bdAssigned
    ? bdUsers.find((u) => u.id === customer.bdAssigned)?.name
    : null;

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            {customer.companyName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={customer.status} />
            <PriorityBadge priority={customer.priority} />
            <Badge variant="outline">{customer.domain}</Badge>
            {customer.jobSource && (
              <Badge variant="secondary">{customer.jobSource}</Badge>
            )}
          </div>

          <Separator />

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Ngày tạo
              </div>
              <div className="font-medium">{formatDate(customer.date)}</div>
            </div>

            {customer.remindDate && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Remind Date
                </div>
                <div className="font-medium text-warning">
                  {formatDate(customer.remindDate)}
                </div>
              </div>
            )}

            {bdName && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  BD phụ trách
                </div>
                <div className="font-medium">{bdName}</div>
              </div>
            )}

            {customer.job && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  Job đang tuyển
                </div>
                <div className="font-medium flex items-center gap-2">
                  {customer.job}
                  {customer.jobLink && (
                    <a
                      href={customer.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 text-xs"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      Xem job
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {customer.companyNote && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Ghi chú công ty</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {customer.companyNote}
                </p>
              </div>
            </>
          )}

          {/* Contacts */}
          {customer.contacts.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Thông tin liên hệ</h4>
                <div className="space-y-3">
                  {customer.contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-border p-4 space-y-2"
                    >
                      <div className="font-medium">{contact.name}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <Phone className="h-4 w-4" />
                            {contact.phone}
                          </a>
                        )}
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <Mail className="h-4 w-4" />
                            {contact.email}
                          </a>
                        )}
                        {contact.linkedin && (
                          <a
                            href={contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-info hover:underline"
                          >
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Communication History */}
          {customer.communicationHistory && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Lịch sử giao tiếp
                </h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {customer.communicationHistory}
                </p>
              </div>
            </>
          )}

          {/* Next Step */}
          {customer.nextStep && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Bước tiếp theo
                </h4>
                <p className="text-sm font-medium text-primary bg-accent p-3 rounded-lg">
                  {customer.nextStep}
                </p>
              </div>
            </>
          )}

          {/* Contract Status */}
          {customer.contractStatus && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Thông tin hợp đồng
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-success/5 p-4 rounded-lg border border-success/20">
                  {customer.contractStatus.dealInfo && (
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Thông tin deal
                      </div>
                      <div className="font-medium">
                        {customer.contractStatus.dealInfo}
                      </div>
                    </div>
                  )}
                  {customer.contractStatus.actualRevenue && (
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Doanh thu thực tế
                      </div>
                      <div className="font-medium text-success">
                        {formatCurrency(customer.contractStatus.actualRevenue)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            <Button>Chỉnh sửa</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
