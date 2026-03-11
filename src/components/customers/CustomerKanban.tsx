import { useState } from 'react';
import { Customer, CustomerStatus, StatusHistoryEntry } from '@/types/customer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PriorityBadge } from './PriorityBadge';
import { StatusChangeDialog } from './StatusChangeDialog';
import { KanbanDetailDialog } from './KanbanDetailDialog';
import { Clock, Briefcase, User, Calendar, ExternalLink } from 'lucide-react';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { bdUsers } from '@/data/mockData';

const statusColumns: { status: CustomerStatus; label: string; color: string }[] = [
  { status: 'Research', label: 'Research', color: 'bg-slate-500' },
  { status: 'Addfriend/Connect', label: 'Add/Connect', color: 'bg-blue-500' },
  { status: 'Approach', label: 'Approach', color: 'bg-cyan-500' },
  { status: 'Follow up', label: 'Follow up', color: 'bg-yellow-500' },
  { status: 'Consulting', label: 'Consulting', color: 'bg-orange-500' },
  { status: 'Demo contract', label: 'Demo', color: 'bg-purple-500' },
  { status: 'Signing', label: 'Signing', color: 'bg-pink-500' },
  { status: 'Signed', label: 'Signed', color: 'bg-green-500' },
  { status: 'Meeting Clear JD', label: 'Meeting JD', color: 'bg-teal-500' },
  { status: 'Hunting', label: 'Hunting', color: 'bg-indigo-500' },
  { status: 'Take care', label: 'Take care', color: 'bg-amber-500' },
  { status: 'No current need', label: 'No need', color: 'bg-gray-400' },
  { status: 'Excluded', label: 'Excluded', color: 'bg-red-400' },
  { status: 'Rejected', label: 'Rejected', color: 'bg-red-600' },
];

interface CustomerKanbanProps {
  customers: Customer[];
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => void;
  statusHistory: Record<string, StatusHistoryEntry[]>;
  onAddHistory: (customerId: string, entry: StatusHistoryEntry) => void;
}

export function CustomerKanban({
  customers,
  onUpdateCustomer,
  statusHistory,
  onAddHistory,
}: CustomerKanbanProps) {
  const [draggedCustomer, setDraggedCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    customer: Customer;
    newStatus: CustomerStatus;
  } | null>(null);

  const getCustomersByStatus = (status: CustomerStatus) => {
    return customers.filter((c) => c.status === status);
  };

  const getReminderInfo = (customer: Customer) => {
    if (!customer.remindDate) return null;
    
    const remindDate = new Date(customer.remindDate);
    const today = new Date();
    const daysUntil = differenceInDays(remindDate, today);

    if (isPast(remindDate) && !isToday(remindDate)) {
      return { label: 'Quá hạn', className: 'text-destructive bg-destructive/10' };
    }
    if (isToday(remindDate)) {
      return { label: 'Hôm nay', className: 'text-warning bg-warning/10' };
    }
    if (daysUntil <= 3) {
      return { label: `${daysUntil} ngày nữa`, className: 'text-orange-600 bg-orange-100' };
    }
    return { label: format(remindDate, 'dd/MM', { locale: vi }), className: 'text-muted-foreground bg-muted' };
  };

  const handleDragStart = (e: React.DragEvent, customer: Customer) => {
    setDraggedCustomer(customer);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: CustomerStatus) => {
    e.preventDefault();
    if (!draggedCustomer || draggedCustomer.status === newStatus) {
      setDraggedCustomer(null);
      return;
    }

    // Show status change dialog with note option
    setPendingStatusChange({
      customer: draggedCustomer,
      newStatus: newStatus,
    });
    setStatusDialogOpen(true);
    setDraggedCustomer(null);
  };

  const handleStatusConfirm = (note?: string) => {
    if (!pendingStatusChange) return;

    const historyEntry: StatusHistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      previousStatus: pendingStatusChange.customer.status,
      newStatus: pendingStatusChange.newStatus,
      changedBy: '1',
      note,
    };
    onAddHistory(pendingStatusChange.customer.id, historyEntry);
    onUpdateCustomer(pendingStatusChange.customer.id, { status: pendingStatusChange.newStatus });
    setPendingStatusChange(null);
  };

  const handleCardClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailDialogOpen(true);
  };

  const getBDName = (bdId?: string) => {
    if (!bdId) return 'Chưa phân công';
    const bd = bdUsers.find((u) => u.id === bdId);
    return bd?.name || 'Không xác định';
  };

  return (
    <>
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4" style={{ minWidth: `${statusColumns.length * 280}px` }}>
          {statusColumns.map((column) => {
            const columnCustomers = getCustomersByStatus(column.status);
            
            return (
              <div
                key={column.status}
                className="flex-shrink-0 w-[260px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={cn('w-3 h-3 rounded-full', column.color)} />
                  <span className="font-medium text-sm">{column.label}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {columnCustomers.length}
                  </Badge>
                </div>

                {/* Column Content */}
                <div className="space-y-3 min-h-[200px] rounded-lg bg-muted/30 p-2">
                  {columnCustomers.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
                      Không có khách hàng
                    </div>
                  ) : (
                    columnCustomers.map((customer) => {
                      const reminderInfo = getReminderInfo(customer);

                      return (
                        <Card
                          key={customer.id}
                          className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                          draggable
                          onDragStart={(e) => handleDragStart(e, customer)}
                          onClick={() => handleCardClick(customer)}
                        >
                          <CardContent className="p-3 space-y-2">
                            {/* Header with reminder badge */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm truncate">
                                  {customer.companyName}
                                </h4>
                              </div>
                              {reminderInfo && (
                                <Badge 
                                  variant="outline" 
                                  className={cn('text-[10px] shrink-0 flex items-center gap-1', reminderInfo.className)}
                                >
                                  <Clock className="h-3 w-3" />
                                  {reminderInfo.label}
                                </Badge>
                              )}
                            </div>

                            {/* Job info */}
                            {customer.job && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Briefcase className="h-3 w-3 shrink-0" />
                                <span className="truncate">{customer.job}</span>
                                {customer.jobLink && (
                                  <a
                                    href={customer.jobLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Xem job trên nền tảng"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Contact */}
                            {customer.contacts[0] && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate">{customer.contacts[0].name}</span>
                              </div>
                            )}

                            {/* Date & BD */}
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(customer.date), 'dd/MM/yy')}
                              </div>
                              <span className="truncate max-w-[80px]">
                                {getBDName(customer.bdAssigned)}
                              </span>
                            </div>

                            {/* Priority */}
                            <div className="flex items-center pt-1">
                              <PriorityBadge priority={customer.priority} />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Detail Dialog */}
      <KanbanDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        customer={selectedCustomer}
        onUpdateCustomer={onUpdateCustomer}
        onAddHistory={onAddHistory}
      />

      {/* Status Change Dialog (for drag & drop) */}
      {pendingStatusChange && (
        <StatusChangeDialog
          open={statusDialogOpen}
          onOpenChange={(open) => {
            setStatusDialogOpen(open);
            if (!open) setPendingStatusChange(null);
          }}
          customerName={pendingStatusChange.customer.companyName}
          previousStatus={pendingStatusChange.customer.status}
          newStatus={pendingStatusChange.newStatus}
          onConfirm={handleStatusConfirm}
        />
      )}
    </>
  );
}
