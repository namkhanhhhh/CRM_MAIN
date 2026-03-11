import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (start: Date | null, end: Date | null) => void;
}

export function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  const handleTodayClick = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onDateRangeChange(today, today);
  };

  const handleClearFilter = () => {
    onDateRangeChange(null, null);
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      if (dateRange.end && date > dateRange.end) {
        onDateRangeChange(date, null);
      } else {
        onDateRangeChange(date, dateRange.end);
      }
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      if (dateRange.start && date < dateRange.start) {
        onDateRangeChange(date, dateRange.start);
      } else {
        onDateRangeChange(dateRange.start, date);
      }
    }
  };

  const hasFilter = dateRange.start || dateRange.end;
  const isSingleDay = dateRange.start && dateRange.end && isSameDay(dateRange.start, dateRange.end);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Lọc ngày:</span>
      
      {/* Today Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleTodayClick}
        className={cn(
          isSingleDay && dateRange.start && isSameDay(dateRange.start, new Date()) && 'bg-primary text-primary-foreground'
        )}
      >
        Hôm nay
      </Button>

      {/* Start Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'gap-2 min-w-[130px]',
              dateRange.start && 'border-primary'
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {dateRange.start ? format(dateRange.start, 'dd/MM/yyyy') : 'Từ ngày'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange.start || undefined}
            onSelect={handleStartDateSelect}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <span className="text-muted-foreground">→</span>

      {/* End Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'gap-2 min-w-[130px]',
              dateRange.end && 'border-primary'
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {dateRange.end ? format(dateRange.end, 'dd/MM/yyyy') : 'Đến ngày'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateRange.end || undefined}
            onSelect={handleEndDateSelect}
            disabled={(date) => dateRange.start ? date < dateRange.start : false}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filter */}
      {hasFilter && (
        <Button variant="ghost" size="sm" onClick={handleClearFilter} className="gap-1 text-muted-foreground">
          <X className="h-4 w-4" />
          Xóa lọc
        </Button>
      )}

      {/* Filter Info */}
      {hasFilter && (
        <span className="text-sm text-muted-foreground">
          {isSingleDay 
            ? `(${format(dateRange.start!, 'dd/MM/yyyy', { locale: vi })})`
            : dateRange.start && dateRange.end
              ? `(${format(dateRange.start, 'dd/MM')} - ${format(dateRange.end, 'dd/MM')})`
              : ''
          }
        </span>
      )}
    </div>
  );
}
