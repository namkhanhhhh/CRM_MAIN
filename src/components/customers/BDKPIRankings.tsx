import { useMemo, useState } from 'react';
import { Customer } from '@/types/customer';
import { bdUsers } from '@/data/mockData';
import { Trophy, Medal, Award, Copy, Check, Users } from 'lucide-react';
import { startOfDay, startOfMonth, parseISO, isAfter, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface BDKPIRankingsProps {
  customers: Customer[];
}

type TimeRange = 'day' | 'month';

interface BDStats {
  bdId: string;
  bdName: string;
  coldLead: number;
  formerClientApproaches: number;
  newClientApproaches: number;
  clientMeeting: number;
  newContract: number;
  newJD: number;
  totalScore: number;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case 2:
      return <Medal className="h-4 w-4 text-slate-400" />;
    case 3:
      return <Award className="h-4 w-4 text-amber-600" />;
    default:
      return <span className="text-xs font-medium text-muted-foreground w-4 text-center">{rank}</span>;
  }
};

export function BDKPIRankings({ customers }: BDKPIRankingsProps) {
  const [copied, setCopied] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  
  const { rankings, teamTotals, topByCategory } = useMemo(() => {
    const now = new Date();
    const startDate = timeRange === 'day' ? startOfDay(now) : startOfMonth(now);
    
    // Calculate stats for each BD
    const bdStatsMap: Record<string, BDStats> = {};
    
    bdUsers.forEach((bd) => {
      bdStatsMap[bd.id] = {
        bdId: bd.id,
        bdName: bd.name,
        coldLead: 0,
        formerClientApproaches: 0,
        newClientApproaches: 0,
        clientMeeting: 0,
        newContract: 0,
        newJD: 0,
        totalScore: 0,
      };
    });

    // Filter customers by time range and calculate metrics
    customers.forEach((c) => {
      if (!c.bdAssigned || !bdStatsMap[c.bdAssigned]) return;
      
      const createdAt = parseISO(c.createdAt);
      const isInRange = isAfter(createdAt, startDate) || createdAt.getTime() === startDate.getTime();
      
      if (!isInRange) return;

      const stats = bdStatsMap[c.bdAssigned];

      if (c.status === 'Research' || c.status === 'Addfriend/Connect') {
        stats.coldLead++;
      }
      if (c.status === 'Follow up') {
        stats.formerClientApproaches++;
      }
      if (c.status === 'Approach') {
        stats.newClientApproaches++;
      }
      if (c.status === 'Meeting Clear JD') {
        stats.clientMeeting++;
      }
      if (c.status === 'Signed' || c.status === 'Signing') {
        stats.newContract++;
      }
      if (c.job && (c.status === 'Signed' || c.status === 'Hunting')) {
        stats.newJD++;
      }
    });

    // Calculate total score (simple sum)
    Object.values(bdStatsMap).forEach((stats) => {
      stats.totalScore =
        stats.coldLead +
        stats.formerClientApproaches +
        stats.newClientApproaches +
        stats.clientMeeting +
        stats.newContract +
        stats.newJD;
    });

    // Sort by total score
    const sorted = Object.values(bdStatsMap).sort((a, b) => b.totalScore - a.totalScore);

    // Calculate team totals
    const totals = {
      coldLead: sorted.reduce((sum, bd) => sum + bd.coldLead, 0),
      formerClientApproaches: sorted.reduce((sum, bd) => sum + bd.formerClientApproaches, 0),
      newClientApproaches: sorted.reduce((sum, bd) => sum + bd.newClientApproaches, 0),
      clientMeeting: sorted.reduce((sum, bd) => sum + bd.clientMeeting, 0),
      newContract: sorted.reduce((sum, bd) => sum + bd.newContract, 0),
      newJD: sorted.reduce((sum, bd) => sum + bd.newJD, 0),
    };

    // Get top 3 for each category
    const getTop3 = (key: keyof BDStats) => {
      return [...sorted]
        .filter(bd => (bd[key] as number) > 0)
        .sort((a, b) => (b[key] as number) - (a[key] as number))
        .slice(0, 3)
        .map((bd, idx) => ({ rank: idx + 1, name: bd.bdName, value: bd[key] as number }));
    };

    return {
      rankings: sorted,
      teamTotals: totals,
      topByCategory: {
        coldLead: getTop3('coldLead'),
        formerClientApproaches: getTop3('formerClientApproaches'),
        newClientApproaches: getTop3('newClientApproaches'),
        clientMeeting: getTop3('clientMeeting'),
        newContract: getTop3('newContract'),
        newJD: getTop3('newJD'),
      }
    };
  }, [customers, timeRange]);

  const getTimeRangeLabel = () => {
    if (timeRange === 'day') {
      return `ngày ${format(new Date(), 'dd/MM/yyyy')}`;
    }
    return `tháng ${format(new Date(), 'MM/yyyy')}`;
  };

  const handleCopyReport = async () => {
    const dateStr = format(new Date(), 'dd/MM/yyyy');
    
    const formatRanking = (category: string, data: { rank: number; name: string; value: number }[], total: number) => {
      if (data.length === 0) return `${category}: ${total}`;
      const topList = data.map(d => `  Top ${d.rank}: ${d.name} (${d.value})`).join('\n');
      return `${category}: ${total}\n${topList}`;
    };

    const reportText = `BÁO CÁO KPI TỔNG HỢP CỦA TEAM BD – ${getTimeRangeLabel()}

${formatRanking('Cold leads', topByCategory.coldLead, teamTotals.coldLead)}
${formatRanking('Former client approaches', topByCategory.formerClientApproaches, teamTotals.formerClientApproaches)}
${formatRanking('New client approaches', topByCategory.newClientApproaches, teamTotals.newClientApproaches)}
${formatRanking('Client meeting', topByCategory.clientMeeting, teamTotals.clientMeeting)}
${formatRanking('New contract', topByCategory.newContract, teamTotals.newContract)}
${formatRanking('New JD', topByCategory.newJD, teamTotals.newJD)}`;

    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      toast.success('Đã copy báo cáo KPI!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Không thể copy báo cáo');
    }
  };

  const categories = [
    { key: 'coldLead', label: 'Cold leads', total: teamTotals.coldLead, top: topByCategory.coldLead, color: 'bg-slate-100 text-slate-700' },
    { key: 'formerClientApproaches', label: 'Former client', total: teamTotals.formerClientApproaches, top: topByCategory.formerClientApproaches, color: 'bg-blue-100 text-blue-700' },
    { key: 'newClientApproaches', label: 'New client', total: teamTotals.newClientApproaches, top: topByCategory.newClientApproaches, color: 'bg-emerald-100 text-emerald-700' },
    { key: 'clientMeeting', label: 'Meeting', total: teamTotals.clientMeeting, top: topByCategory.clientMeeting, color: 'bg-amber-100 text-amber-700' },
    { key: 'newContract', label: 'Contract', total: teamTotals.newContract, top: topByCategory.newContract, color: 'bg-green-100 text-green-700' },
    { key: 'newJD', label: 'New JD', total: teamTotals.newJD, top: topByCategory.newJD, color: 'bg-purple-100 text-purple-700' },
  ];

  const topPerformer = rankings[0];

  // Daily view - compact grid with Top 3 per category
  if (timeRange === 'day') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <TabsTrigger value="month" className="text-xs px-3 h-6">Tháng</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* KPI Categories Grid for Day view */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div key={cat.key} className={`rounded-lg p-3 ${cat.color}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">{cat.label}</span>
                <span className="text-lg font-bold">{cat.total}</span>
              </div>
              {cat.top.length > 0 ? (
                <div className="space-y-1">
                  {cat.top.map((item) => (
                    <div key={item.rank} className="flex items-center gap-1.5 text-xs">
                      {getRankIcon(item.rank)}
                      <span className="truncate flex-1">{item.name}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs opacity-60 text-center py-1">—</div>
              )}
            </div>
          ))}
        </div>

        {/* Daily Rankings Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[150px]">BD</TableHead>
                <TableHead className="text-center">Cold</TableHead>
                <TableHead className="text-center">Former</TableHead>
                <TableHead className="text-center">New</TableHead>
                <TableHead className="text-center">Meet</TableHead>
                <TableHead className="text-center">Contract</TableHead>
                <TableHead className="text-center">JD</TableHead>
                <TableHead className="text-center text-primary font-semibold">Tổng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((bd, index) => (
                <TableRow 
                  key={bd.bdId} 
                  className={index === 0 && bd.totalScore > 0 ? 'bg-yellow-50' : ''}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRankIcon(index + 1)}
                      <span className="font-medium text-sm">{bd.bdName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{bd.coldLead || '—'}</TableCell>
                  <TableCell className="text-center">{bd.formerClientApproaches || '—'}</TableCell>
                  <TableCell className="text-center">{bd.newClientApproaches || '—'}</TableCell>
                  <TableCell className="text-center">{bd.clientMeeting || '—'}</TableCell>
                  <TableCell className="text-center">{bd.newContract || '—'}</TableCell>
                  <TableCell className="text-center">{bd.newJD || '—'}</TableCell>
                  <TableCell className="text-center font-bold text-primary">{bd.totalScore}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Monthly view - full table with all BDs
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <TabsTrigger value="month" className="text-xs px-3 h-6">Tháng</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Team summary */}
      <div className="flex items-center justify-between bg-amber-50 rounded-lg px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-amber-600" />
          <span className="text-muted-foreground">Tổng đội ngũ BD</span>
        </div>
        <span className="font-bold text-amber-700">{bdUsers.length} người</span>
      </div>

      {/* Top Performer */}
      {topPerformer && topPerformer.totalScore > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Top Performer tháng này</span>
            </div>
            <span className="text-sm font-medium text-amber-600">↗ {topPerformer.totalScore} điểm</span>
          </div>
          <p className="font-semibold mt-1">{topPerformer.bdName}</p>
        </div>
      )}

      {/* Rankings Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[180px]">BD</TableHead>
              <TableHead className="text-center">Cold</TableHead>
              <TableHead className="text-center">Former</TableHead>
              <TableHead className="text-center">New</TableHead>
              <TableHead className="text-center">Meet</TableHead>
              <TableHead className="text-center">Contract</TableHead>
              <TableHead className="text-center text-primary font-semibold">Điểm</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.map((bd, index) => (
              <TableRow 
                key={bd.bdId} 
                className={index === 0 && bd.totalScore > 0 ? 'bg-yellow-50' : ''}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRankIcon(index + 1)}
                    <span className="font-medium">{bd.bdName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{bd.coldLead}</TableCell>
                <TableCell className="text-center text-primary">{bd.formerClientApproaches}</TableCell>
                <TableCell className="text-center text-primary">{bd.newClientApproaches}</TableCell>
                <TableCell className="text-center">{bd.clientMeeting}</TableCell>
                <TableCell className="text-center">{bd.newContract}</TableCell>
                <TableCell className="text-center font-bold text-primary">{bd.totalScore}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Score formula */}
      <p className="text-xs text-muted-foreground">
        Công thức điểm: Cold + Former + New + Meet + Contract + JD (tổng số lượng)
      </p>
    </div>
  );
}
