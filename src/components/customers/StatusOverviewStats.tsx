import { useMemo } from 'react';
import { Customer, CustomerStatus } from '@/types/customer';
import { 
  Phone, Users, Search, UserPlus, MessageCircle, 
  Headphones, FileText, PenTool, CheckCircle, Clock,
  Target, Heart
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatusOverviewStatsProps {
  customers: Customer[];
  bdFilter: 'all' | string;
}

const statusConfig: { status: CustomerStatus; color: string; icon: LucideIcon }[] = [
  { status: 'Research', color: 'bg-slate-500', icon: Search },
  { status: 'Approach', color: 'bg-teal-500', icon: UserPlus },
  { status: 'Follow up', color: 'bg-teal-500', icon: MessageCircle },
  { status: 'Consulting', color: 'bg-teal-500', icon: Headphones },
  { status: 'Demo contract', color: 'bg-orange-500', icon: FileText },
  { status: 'Signing', color: 'bg-orange-500', icon: PenTool },
  { status: 'Signed', color: 'bg-orange-500', icon: CheckCircle },
  { status: 'No current need', color: 'bg-orange-500', icon: Clock },
  { status: 'Hunting', color: 'bg-rose-500', icon: Target },
  { status: 'Take care', color: 'bg-rose-500', icon: Heart },
];

export function StatusOverviewStats({ customers, bdFilter }: StatusOverviewStatsProps) {
  const { statusCounts, totalPhones, totalLeads } = useMemo(() => {
    const filtered = bdFilter === 'all' 
      ? customers 
      : customers.filter(c => c.bdAssigned === bdFilter);

    const counts: Record<string, number> = {};
    statusConfig.forEach(({ status }) => {
      counts[status] = filtered.filter(c => c.status === status).length;
    });

    // Count total phone numbers collected
    const phones = filtered.reduce((acc, c) => {
      const phoneCount = c.contacts?.filter(contact => contact.phone && contact.phone.trim() !== '').length || 0;
      return acc + phoneCount;
    }, 0);

    // Total leads = total customers worked by BD
    const leads = filtered.length;

    return { statusCounts: counts, totalPhones: phones, totalLeads: leads };
  }, [customers, bdFilter]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 h-full">
      {statusConfig.map(({ status, color, icon: Icon }) => (
        <div
          key={status}
          className={`${color} rounded-lg p-3 flex flex-col items-center justify-center`}
        >
          <Icon className="h-4 w-4 text-white/80 mb-1" />
          <span className="text-xl font-bold text-white">
            {statusCounts[status] || 0}
          </span>
          <span className="text-white/90 text-xs font-medium text-center leading-tight mt-1">
            {status}
          </span>
        </div>
      ))}
      {/* Phone Number Stats */}
      <div className="bg-indigo-500 rounded-lg p-3 flex flex-col items-center justify-center">
        <Phone className="h-4 w-4 text-white/80 mb-1" />
        <span className="text-xl font-bold text-white">
          {totalPhones}
        </span>
        <span className="text-white/90 text-xs font-medium text-center leading-tight mt-1">
          Phone Number
        </span>
      </div>
      {/* Total Leads Stats */}
      <div className="bg-violet-500 rounded-lg p-3 flex flex-col items-center justify-center">
        <Users className="h-4 w-4 text-white/80 mb-1" />
        <span className="text-xl font-bold text-white">
          {totalLeads}
        </span>
        <span className="text-white/90 text-xs font-medium text-center leading-tight mt-1">
          Total Lead
        </span>
      </div>
    </div>
  );
}
