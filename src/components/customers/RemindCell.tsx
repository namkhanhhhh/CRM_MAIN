import { differenceInDays, format, isToday, isBefore, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RemindMilestone } from '@/types/customer';

interface RemindCellProps {
  remindDate?: string;
  startDate: string;
}

export function getRemindMilestone(startDate: string, remindDate?: string): RemindMilestone | null {
  if (!remindDate) return null;
  
  const start = new Date(startDate);
  const remind = new Date(remindDate);
  const diff = differenceInDays(remind, start);
  
  if (diff <= 7) return 7;
  if (diff <= 15) return 15;
  if (diff <= 30) return 30;
  return 30;
}

export function getRemindStatus(remindDate: string): 'overdue' | 'today' | 'upcoming' | 'normal' {
  const today = startOfDay(new Date());
  const remind = startOfDay(new Date(remindDate));
  
  if (isBefore(remind, today)) return 'overdue';
  if (isToday(remind)) return 'today';
  
  const daysUntil = differenceInDays(remind, today);
  if (daysUntil <= 3) return 'upcoming';
  return 'normal';
}

export function RemindCell({ remindDate, startDate }: RemindCellProps) {
  if (!remindDate) {
    return <span className="text-muted-foreground">-</span>;
  }

  const milestone = getRemindMilestone(startDate, remindDate);
  const status = getRemindStatus(remindDate);
  
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateStr;
    }
  };

  const statusStyles = {
    overdue: 'text-destructive bg-destructive/10',
    today: 'text-yellow-600 bg-yellow-500/10',
    upcoming: 'text-orange-600 bg-orange-500/10',
    normal: 'text-muted-foreground bg-muted',
  };

  const milestoneStyles = {
    7: 'bg-blue-500/20 text-blue-700',
    15: 'bg-purple-500/20 text-purple-700',
    30: 'bg-emerald-500/20 text-emerald-700',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={cn(
        'font-medium text-sm px-2 py-0.5 rounded',
        statusStyles[status]
      )}>
        {formatDate(remindDate)}
      </span>
      {milestone && (
        <Badge 
          variant="outline" 
          className={cn(
            'text-[10px] px-1.5 py-0 h-4 font-medium border-0',
            milestoneStyles[milestone]
          )}
        >
          {milestone} ngày
        </Badge>
      )}
    </div>
  );
}
