import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Customer, CustomReminder, CUSTOM_REMINDER_STATUS_COLORS } from '@/types/customer';

interface MilestoneItem {
  type: 'milestone';
  customer: Customer;
  scheduleType: string;
  status: string;
}

interface CustomItem {
  type: 'custom';
  reminder: CustomReminder;
  customer?: Customer;
}

type DayItem = MilestoneItem | CustomItem;

interface DaySchedulePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  items: DayItem[];
}

export type { DayItem, MilestoneItem, CustomItem };

export function DaySchedulePopup({ open, onOpenChange, date, items }: DaySchedulePopupProps) {
  if (!date) return null;

  const milestoneItems = items.filter((i): i is MilestoneItem => i.type === 'milestone');
  const customItems = items.filter((i): i is CustomItem => i.type === 'custom');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Lịch trình ngày {format(date, 'EEEE, dd/MM/yyyy', { locale: vi })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">Không có lịch nhắc nhở nào</p>
          ) : (
            <>
              {milestoneItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Nhắc nhở mốc ({milestoneItems.length})
                  </h4>
                  {milestoneItems.map((item, idx) => {
                    const colors: Record<string, string> = {
                      '7-day': 'border-l-blue-500',
                      '15-day': 'border-l-purple-500',
                      '30-day': 'border-l-emerald-500',
                    };
                    return (
                      <div key={idx} className={cn('p-3 rounded-lg border border-l-4 bg-muted/30', colors[item.scheduleType] || 'border-l-muted')}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{item.customer.companyName}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px]">{item.customer.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {item.scheduleType === '7-day' ? '7 ngày' : item.scheduleType === '15-day' ? '15 ngày' : '30 ngày'}
                          </Badge>
                          {item.customer.bdAssigned && (
                            <span className="text-[11px] text-muted-foreground">BD: {item.customer.bdAssigned}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {customItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    Nhắc nhở tùy chỉnh ({customItems.length})
                  </h4>
                  {customItems.map((item, idx) => {
                    const color = CUSTOM_REMINDER_STATUS_COLORS[item.reminder.type] || 'bg-muted';
                    return (
                      <div key={idx} className="p-3 rounded-lg border border-l-4 border-l-amber-500 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{item.reminder.customerName}</span>
                          </div>
                          <Badge className={cn('text-[10px] text-white', color)}>
                            {item.reminder.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{item.reminder.note}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}