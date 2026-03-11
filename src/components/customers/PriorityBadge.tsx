import { Priority } from '@/types/customer';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  if (priority === 'high') {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap',
          'bg-amber-50 text-amber-700 border border-amber-200',
          className
        )}
      >
        Ưu tiên
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        'bg-gray-100 text-gray-600',
        className
      )}
    >
      Bình thường
    </span>
  );
}
