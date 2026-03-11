import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, addMonths, subMonths, setMonth, setYear } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Customer, CustomReminder } from '@/types/customer';

interface MilestoneItemBasic {
  customer: Customer;
  scheduleType: string;
  dueDate: Date;
}

interface ScheduleCalendarDialogProps {
  customers: Customer[];
  customReminders: CustomReminder[];
  milestoneItems: MilestoneItemBasic[];
  onDateSelect: (date: Date) => void;
  onDayClick: (date: Date) => void;
  selectedDate: Date | null;
}

interface DayInfo {
  date: Date;
  milestoneCount: number;
  customCount: number;
  totalCount: number;
  hasOverdue: boolean;
  hasToday: boolean;
}

export function ScheduleCalendarDialog({ customers, customReminders, milestoneItems, onDateSelect, onDayClick, selectedDate }: ScheduleCalendarDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dayCounts = useMemo(() => {
    const counts: Map<string, DayInfo> = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach(day => {
      counts.set(format(day, 'yyyy-MM-dd'), {
        date: day, milestoneCount: 0, customCount: 0, totalCount: 0,
        hasOverdue: false, hasToday: false,
      });
    });

    // Count milestone items
    milestoneItems.forEach(item => {
      const dayKey = format(item.dueDate, 'yyyy-MM-dd');
      const info = counts.get(dayKey);
      if (info) {
        info.milestoneCount++;
        info.totalCount++;
        if (isSameDay(item.dueDate, today)) info.hasToday = true;
        else if (item.dueDate < today) info.hasOverdue = true;
      }
    });

    // Count custom reminders
    customReminders.filter(r => !r.isCompleted).forEach(r => {
      const dayKey = r.remindDate;
      const info = counts.get(dayKey);
      if (info) {
        info.customCount++;
        info.totalCount++;
        const remindDate = parseISO(r.remindDate);
        if (isSameDay(remindDate, today)) info.hasToday = true;
        else if (remindDate < today) info.hasOverdue = true;
      }
    });

    return counts;
  }, [milestoneItems, customReminders, currentMonth]);

  const todayCount = useMemo(() => {
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    return dayCounts.get(todayKey)?.totalCount || 0;
  }, [dayCounts]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const handleDayClick = (day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const info = dayCounts.get(dayKey);
    if (info && info.totalCount > 0) {
      onDayClick(day);
    } else {
      onDateSelect(day);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          Lịch nhắc nhở
          {todayCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-warning text-warning-foreground">{todayCount}</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Lịch nhắc nhở
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Navigation */}
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Select value={currentMonth.getMonth().toString()} onValueChange={(v) => setCurrentMonth(prev => setMonth(prev, parseInt(v)))}>
                <SelectTrigger className="w-[110px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent>{monthNames.map((name, i) => <SelectItem key={i} value={i.toString()}>{name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={currentMonth.getFullYear().toString()} onValueChange={(v) => setCurrentMonth(prev => setYear(prev, parseInt(v)))}>
                <SelectTrigger className="w-[80px] h-8"><SelectValue /></SelectTrigger>
                <SelectContent>{yearOptions.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">{day}</div>
            ))}
            {Array.from({ length: adjustedStartDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {daysInMonth.map(day => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const info = dayCounts.get(dayKey);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={dayKey}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'aspect-square flex flex-col items-center justify-center rounded-md text-sm transition-colors relative',
                    'hover:bg-accent',
                    isToday && 'ring-2 ring-primary ring-offset-1',
                    isSelected && 'bg-primary text-primary-foreground',
                    info?.hasOverdue && info.totalCount > 0 && !isSelected && 'bg-destructive/10',
                    info?.hasToday && info.totalCount > 0 && !isSelected && 'bg-warning/10',
                  )}
                >
                  <span className={cn('text-sm', isSelected && 'font-semibold')}>{format(day, 'd')}</span>
                  {info && info.totalCount > 0 && (
                    <div className="flex items-center gap-0.5">
                      {info.milestoneCount > 0 && (
                        <span className={cn('w-1.5 h-1.5 rounded-full bg-blue-500', isSelected && 'bg-primary-foreground')} />
                      )}
                      {info.customCount > 0 && (
                        <span className={cn('w-1.5 h-1.5 rounded-full bg-amber-500', isSelected && 'bg-primary-foreground')} />
                      )}
                      <span className={cn(
                        'text-[10px] font-medium ml-0.5',
                        info.hasOverdue && 'text-destructive',
                        info.hasToday && !info.hasOverdue && 'text-warning',
                        !info.hasOverdue && !info.hasToday && 'text-muted-foreground',
                        isSelected && 'text-primary-foreground'
                      )}>
                        {info.totalCount}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t">
            <div className="flex flex-wrap gap-4 text-xs justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-destructive/30" />
                <span className="text-muted-foreground">Quá hạn</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-warning/30" />
                <span className="text-muted-foreground">Hôm nay</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Mốc</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Custom</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Nhấn vào ngày có lịch để xem chi tiết
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}