import { useState, useMemo } from 'react';
import { Customer } from '@/types/customer';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { startOfDay, startOfWeek, startOfMonth, isAfter, parseISO, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

interface BDReportStatsProps {
  customers: Customer[];
  bdFilter: 'all' | string;
  compact?: boolean;
}

type TimeRange = 'day' | 'week' | 'month';

export function BDReportStats({ customers, bdFilter, compact = false }: BDReportStatsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [copied, setCopied] = useState(false);

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'day':
        return `ngày ${format(new Date(), 'dd/MM/yyyy')}`;
      case 'week':
        return `tuần ${format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'dd/MM')} - ${format(new Date(), 'dd/MM/yyyy')}`;
      case 'month':
        return `tháng ${format(new Date(), 'MM/yyyy')}`;
    }
  };

  const handleCopyReport = async () => {
    const reportText = `Em xin phép gửi báo cáo ${getTimeRangeLabel()} ạ
Cold leads: ${stats.coldLead}
Former client approaches: ${stats.formerClientApproaches}
New client approaches: ${stats.newClientApproaches}
Client meeting: ${stats.clientMeeting}
New contract: ${stats.newContract}
New JD: ${stats.newJD}`;

    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      toast.success('Đã copy báo cáo!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Không thể copy báo cáo');
    }
  };
  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'day':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
    }

    // Filter by BD first
    const bdFiltered = bdFilter === 'all' 
      ? customers 
      : customers.filter(c => c.bdAssigned === bdFilter);

    const filteredCustomers = bdFiltered.filter((c) => {
      const createdAt = parseISO(c.createdAt);
      return isAfter(createdAt, startDate) || createdAt.getTime() === startDate.getTime();
    });

    // Cold lead: Tổng số lead được nhập liệu trong khoảng thời gian
    const coldLead = filteredCustomers.filter(
      (c) => c.status === 'Research' || c.status === 'Addfriend/Connect'
    ).length;

    // Former client approaches: Số khách hàng cũ được follow up (Status "Follow up")
    const formerClientApproaches = filteredCustomers.filter(
      (c) => c.status === 'Follow up'
    ).length;

    // New client approaches: Số khách hàng mới được approach (Status "Approach")
    const newClientApproaches = filteredCustomers.filter(
      (c) => c.status === 'Approach'
    ).length;

    // Client Meeting: Số meeting clear JD với khách hàng (Status "Meeting Clear JD")
    const clientMeeting = filteredCustomers.filter(
      (c) => c.status === 'Meeting Clear JD'
    ).length;

    // New contract: Số hợp đồng được ký (Status "Signed" hoặc "Signing")
    const newContract = filteredCustomers.filter(
      (c) => c.status === 'Signed' || c.status === 'Signing'
    ).length;

    // New JD: Số JD được mở mới từ khách hàng (có job và đã ký hoặc đang hunting)
    const newJD = filteredCustomers.filter(
      (c) => c.job && (c.status === 'Signed' || c.status === 'Hunting')
    ).length;

    return {
      coldLead,
      formerClientApproaches,
      newClientApproaches,
      clientMeeting,
      newContract,
      newJD,
    };
  }, [customers, timeRange]);

  const statItems = [
    { label: 'Cold lead', value: stats.coldLead, color: 'bg-slate-100 text-slate-700' },
    { label: 'Former client approaches', value: stats.formerClientApproaches, color: 'bg-blue-100 text-blue-700' },
    { label: 'New client approaches', value: stats.newClientApproaches, color: 'bg-emerald-100 text-emerald-700' },
    { label: 'Client Meeting', value: stats.clientMeeting, color: 'bg-amber-100 text-amber-700' },
    { label: 'New contract', value: stats.newContract, color: 'bg-green-100 text-green-700' },
    { label: 'New JD', value: stats.newJD, color: 'bg-purple-100 text-purple-700' },
  ];

  if (compact) {
    return (
      <div className="flex flex-col h-full gap-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyReport}
            className="h-8 gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Đã copy' : 'Copy báo cáo'}
          </Button>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList className="h-8">
              <TabsTrigger value="day" className="text-xs px-3 h-6">Ngày</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3 h-6">Tuần</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3 h-6">Tháng</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
          {statItems.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg p-3 flex flex-col items-center justify-center ${item.color}`}
            >
              <p className="text-xl font-bold">{item.value}</p>
              <p className="text-xs font-medium mt-1 leading-tight text-center">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
          <TabsList className="h-8">
            <TabsTrigger value="day" className="text-xs px-3 h-6">Ngày</TabsTrigger>
            <TabsTrigger value="week" className="text-xs px-3 h-6">Tuần</TabsTrigger>
            <TabsTrigger value="month" className="text-xs px-3 h-6">Tháng</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statItems.map((item) => (
          <div
            key={item.label}
            className={`rounded-lg p-3 text-center ${item.color}`}
          >
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs font-medium mt-1 leading-tight">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
