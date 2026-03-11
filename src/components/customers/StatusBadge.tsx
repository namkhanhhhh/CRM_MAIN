import { CustomerStatus } from '@/types/customer';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

const statusConfig: Record<CustomerStatus, { bg: string; text: string; border: string }> = {
  'Research': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Addfriend/Connect': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Approach': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Follow up': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'Consulting': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Demo contract': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  'Working': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  'Pending': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'Signing': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Signed': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'Meeting Clear JD': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'Hunting': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Hiring': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  'Take care': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  'No current need': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  'Excluded': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'Closed': { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' },
  'Rejected': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig['Research'];

  return (
    <span
      className={cn(
        'status-badge border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {status}
    </span>
  );
}
