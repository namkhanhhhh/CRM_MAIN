import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell, Legend } from 'recharts';
import { AccountingRecord, computeAmountNoVAT } from '@/types/accounting';
import { Users, Briefcase, Gift } from 'lucide-react';

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);

const fmtShort = (v: number) => {
  if (v === 0) return '0';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v);
};

const fmtTable = (v: number) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v);

const PERSON_COLORS = [
  'hsl(220 70% 55%)', 'hsl(330 70% 55%)', 'hsl(20 80% 60%)', 'hsl(270 60% 55%)',
  'hsl(35 85% 55%)', 'hsl(180 60% 45%)', 'hsl(0 70% 55%)', 'hsl(50 80% 50%)',
  'hsl(200 70% 50%)', 'hsl(15 75% 55%)',
];

const TOTAL_COLOR = 'hsl(250 55% 60%)';

interface PersonalRevenueDashboardProps {
  type: 'BD' | 'HH';
  records: AccountingRecord[];
  selectedYear: string;
  selectedMonths: number[];
}

export default function PersonalRevenueDashboard({ type, records, selectedYear, selectedMonths }: PersonalRevenueDashboardProps) {
  const year = Number(selectedYear);

  const { staffTargets, hotBonuses } = useMemo(() => {
    let targets: Record<string, any> = {};
    let bonuses: Record<string, number> = {};
    try {
      targets = JSON.parse(localStorage.getItem('apex_staff_targets_v5') || '{}');
      bonuses = JSON.parse(localStorage.getItem('apex_hot_bonuses_v5') || '{}');
      
      // Inject dummy sample data if empty so user can see it on the dashboard without configuring first
      if (Object.keys(targets).length === 0) {
        targets = {
          'Nguyễn BD1': { kpi: 50_000_000, bonusRate: 5 },
          'Trần BD2': { kpi: 30_000_000, bonusRate: 5 },
          'Nguyễn Văn A': { kpi: 100_000_000, bonusRate: 8, isLead: true, teamBonusRate: 2, teamMembers: ['Trần Thị B', 'Lê Văn C'] },
          'Trần Thị B': { kpi: 50_000_000, bonusRate: 5 },
        };
        bonuses = {
          'acc-1': 1000000,
          'acc-2': 500000,
          'acc-5': 2000000,
          'acc-10': 3000000
        };
      }
    } catch (e) {
      console.warn('Could load data', e);
    }
    return { staffTargets: targets, hotBonuses: bonuses };
  }, []);

  const allPersonData = useMemo(() => {
    const filtered = records.filter(r => {
      if (r.overallStatus === 'Reject') return false;
      const dateStr = r.onboardDate || r.offerDate;
      return new Date(dateStr).getFullYear() === year;
    });

    const personMap = new Map<string, { monthlyRevenue: number[], hotBonusesByMonth: number[] }>();
    filtered.forEach(r => {
      const personName = type === 'BD' ? r.bdName : r.ownerName;
      if (!personName) return;

      const noVAT = computeAmountNoVAT(r);
      const rev = type === 'BD'
        ? noVAT * (r.commissionRateBD / 100)
        : noVAT * ((100 - r.commissionRateBD) / 100);
      
      const month = new Date(r.onboardDate || r.offerDate).getMonth();
      const hot = r.overallStatus === 'Done' ? (hotBonuses[r.id] || 0) : 0;

      if (!personMap.has(personName)) {
        personMap.set(personName, {
          monthlyRevenue: new Array(12).fill(0),
          hotBonusesByMonth: new Array(12).fill(0)
        });
      }
      const data = personMap.get(personName)!;
      data.monthlyRevenue[month] += rev;
      data.hotBonusesByMonth[month] += hot;
    });

    // 2. Calculate Final Commissions including personal bonus and team bonus
    const persons: { 
      name: string; 
      monthlyRevenue: number[]; 
      totalRevenue: number;
      totalCommission: number;
      commissionDetails: { personal: number; hot: number; team: number };
    }[] = [];

    // First pass: basic person data & personal bonus
    personMap.forEach((data, name) => {
      const totalRevenue = data.monthlyRevenue.reduce((s, v) => s + v, 0);
      const totalHot = data.hotBonusesByMonth.reduce((s, v) => s + v, 0);
      
      const target = staffTargets[name] || { kpi: 0, bonusRate: 0 };
      const personalBonus = totalRevenue > target.kpi ? (totalRevenue - target.kpi) * (target.bonusRate / 100) : 0;
      
      persons.push({ 
        name, 
        monthlyRevenue: data.monthlyRevenue, 
        totalRevenue,
        totalCommission: personalBonus + totalHot,
        commissionDetails: { personal: personalBonus, hot: totalHot, team: 0 }
      });
    });

    // Second pass: team bonuses
    persons.forEach(p => {
      const target = staffTargets[p.name];
      if (target?.isLead && target?.teamMembers) {
        const teamRevenue = persons
          .filter(x => target.teamMembers.includes(x.name))
          .reduce((sum, x) => sum + x.totalRevenue, 0);
        const teamBonus = teamRevenue * ((target.teamBonusRate || 0) / 100);
        p.commissionDetails.team = teamBonus;
        p.totalCommission += teamBonus;
      }
    });

    persons.sort((a, b) => b.totalRevenue - a.totalRevenue);
    return { persons };
  }, [records, year, type, staffTargets, hotBonuses]);

  const { chartData, displayTotalRev, displayTotalComm } = useMemo(() => {
    const { persons } = allPersonData;
    const data = persons.map(p => {
      // For personal bars, we calculate revenue and commission for selected months
      const revenue = selectedMonths.reduce((s, mi) => s + p.monthlyRevenue[mi], 0);
      
      const target = staffTargets[p.name] || { kpi: 0, bonusRate: 0 };
      const personalBonus = revenue > target.kpi ? (revenue - target.kpi) * (target.bonusRate / 100) : 0;

      // Filtered hot bonuses
      const hotBonus = records
        .filter(r => {
          if (r.overallStatus !== 'Done') return false;
          const personName = type === 'BD' ? r.bdName : r.ownerName;
          if (personName !== p.name) return false;
          const date = new Date(r.onboardDate || r.offerDate);
          return date.getFullYear() === year && selectedMonths.includes(date.getMonth());
        })
        .reduce((sum, r) => sum + (hotBonuses[r.id] || 0), 0);
      
      // Team bonus in this window
      let teamBonus = 0;
      if (target.isLead && target.teamMembers) {
        const teamRevenue = persons.reduce((sum, other) => {
          if (target.teamMembers.includes(other.name)) {
            return sum + selectedMonths.reduce((s, mi) => s + other.monthlyRevenue[mi], 0);
          }
          return sum;
        }, 0);
        teamBonus = teamRevenue * ((target.teamBonusRate || 0) / 100);
      }

      const commission = personalBonus + hotBonus + teamBonus;

      return {
        name: p.name,
        revenue,
        commission,
        value: revenue + commission, // for sorting if needed
      };
    }).filter(d => d.revenue > 0);

    const totalRev = data.reduce((s, d) => s + d.revenue, 0);
    const totalComm = data.reduce((s, d) => s + d.commission, 0);

    return { 
      chartData: [...data, { name: 'Tổng cộng', revenue: totalRev, commission: totalComm }], 
      displayTotalRev: totalRev,
      displayTotalComm: totalComm
    };
  }, [allPersonData, selectedMonths, records, year, type, staffTargets, hotBonuses]);

  const isFiltered = selectedMonths.length !== 12;
  const rangeLabel = isFiltered
    ? (selectedMonths.length <= 4
        ? selectedMonths.map(m => `T${m + 1}`).join(', ')
        : `${selectedMonths.length} tháng`) + `/${selectedYear}`
    : `Cả năm ${selectedYear}`;

  const title = type === 'BD' ? 'Doanh số cá nhân - Bộ phận BD' : 'Doanh số cá nhân - Bộ phận HH';
  const subtitle = type === 'BD' ? 'Cột gồm: Doanh số BD (dưới) + Hoa hồng thưởng (trên)' : 'Cột gồm: Doanh thu HH (dưới) + Hoa hồng thưởng (trên)';
  const Icon = type === 'BD' ? Briefcase : Users;
  const accentColor = type === 'BD' ? 'hsl(220 70% 55%)' : 'hsl(330 70% 55%)';
  const commColor = 'hsl(140 60% 45%)'; // Success green for commission

  const chartConfig = { 
    revenue: { label: 'Doanh số', color: accentColor },
    commission: { label: 'Hoa hồng thưởng', color: commColor }
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="pb-4 border-b bg-muted/20">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full shadow-sm" style={{ backgroundColor: `${accentColor}15` }}>
              <Icon className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium bg-background px-2 py-1 rounded-md border shadow-sm">{rangeLabel}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-background to-primary/5">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Tổng doanh số cá nhân</p>
                <p className="text-2xl font-bold tracking-tight" style={{ color: accentColor }}>{fmt(displayTotalRev)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full shadow-sm" style={{ backgroundColor: `${accentColor}15` }}>
                <Icon className="h-6 w-6" style={{ color: accentColor }} />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-gradient-to-br from-background to-emerald-500/5">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Đã thưởng hoa hồng</p>
                <p className="text-2xl font-bold tracking-tight text-emerald-600">{fmt(displayTotalComm)}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 shadow-sm">
                <Gift className="h-6 w-6 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {chartData.length > 1 ? (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart data={chartData} margin={{ top: 25, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }} 
                interval={0} 
                textAnchor="middle"
                height={40}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                tickFormatter={(v: number) => fmtShort(v)} 
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip 
                cursor={{fill: 'var(--muted)', opacity: 0.2}}
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-medium">{name === 'revenue' ? 'Doanh số' : 'Hoa hồng'}:</span>
                        <span className="text-xs font-bold">{fmt(Number(value))}</span>
                      </div>
                    )} 
                  />
                } 
              />

              <Bar dataKey="revenue" stackId="a" radius={[0, 0, 0, 0]} maxBarSize={45}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`rev-${entry.name}`} 
                    fill={entry.name === 'Tổng cộng' ? TOTAL_COLOR : PERSON_COLORS[index % PERSON_COLORS.length]} 
                  />
                ))}
              </Bar>
              <Bar dataKey="commission" stackId="a" radius={[4, 4, 0, 0]} maxBarSize={45}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`comm-${entry.name}`} 
                    fill={entry.name === 'Tổng cộng' ? 'hsl(140 60% 40%)' : 'hsl(140 60% 45%)'} 
                    fillOpacity={0.8}
                  />
                ))}
                <LabelList 
                  dataKey="commission" 
                  position="top" 
                  content={(props: any) => {
                    const { x, y, width, value, index } = props;
                    const total = chartData[index].revenue + chartData[index].commission;
                    if (total === 0) return null;
                    return (
                      <text x={x + width / 2} y={y - 8} textAnchor="middle" style={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--foreground))' }}>
                        {fmtShort(total)}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm bg-muted/10 rounded-lg border border-dashed">
            Không có dữ liệu cho {rangeLabel}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b">
                <TableHead className="min-w-[160px] sticky left-0 bg-muted/80 backdrop-blur-sm z-20 font-semibold text-foreground">
                  {type === 'BD' ? 'Nhân viên BD' : 'Nhân viên HH'}
                </TableHead>
                <TableHead className="text-right min-w-[120px] font-semibold text-foreground">Doanh số</TableHead>
                <TableHead className="text-right min-w-[120px] font-semibold text-foreground">Hoa hồng</TableHead>
                {selectedMonths.map(mi => (
                  <TableHead key={mi} className="text-right min-w-[100px] font-medium text-muted-foreground">T{mi + 1}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPersonData.persons
                .filter(p => selectedMonths.some(mi => p.monthlyRevenue[mi] > 0))
                .map((person, idx) => {
                  const rangeSumRev = selectedMonths.reduce((s, mi) => s + person.monthlyRevenue[mi], 0);
                  
                  // Re-calculate commission for table row as well
                  const target = staffTargets[person.name] || { kpi: 0, bonusRate: 0 };
                  const personalBonus = rangeSumRev > target.kpi ? (rangeSumRev - target.kpi) * (target.bonusRate / 100) : 0;
                  const hotBonus = records
                    .filter(r => {
                      if (r.overallStatus !== 'Done') return false;
                      const personName = type === 'BD' ? r.bdName : r.ownerName;
                      if (personName !== person.name) return false;
                      const date = new Date(r.onboardDate || r.offerDate);
                      return date.getFullYear() === year && selectedMonths.includes(date.getMonth());
                    })
                    .reduce((sum, r) => sum + (hotBonuses[r.id] || 0), 0);
                  
                  let teamBonus = 0;
                  if (target.isLead && target.teamMembers) {
                    const teamRevenue = allPersonData.persons.reduce((sum, other) => {
                      if (target.teamMembers.includes(other.name)) {
                        return sum + selectedMonths.reduce((s, mi) => s + other.monthlyRevenue[mi], 0);
                      }
                      return sum;
                    }, 0);
                    teamBonus = teamRevenue * ((target.teamBonusRate || 0) / 100);
                  }
                  const rangeSumComm = personalBonus + hotBonus + teamBonus;

                  return (
                    <TableRow key={person.name} className={`${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'} border-b hover:bg-muted/50 transition-colors`}>
                      <TableCell className="font-medium sticky left-0 bg-inherit z-20">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PERSON_COLORS[idx % PERSON_COLORS.length] }} />
                          {person.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-slate-700">
                        {fmtTable(rangeSumRev)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-green-600">
                        {fmtTable(rangeSumComm)}
                      </TableCell>
                      {selectedMonths.map(mi => (
                        <TableCell key={mi} className="text-right font-mono text-xs text-muted-foreground">
                          {person.monthlyRevenue[mi] > 0 ? fmtTable(person.monthlyRevenue[mi]) : '–'}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              <TableRow className="bg-muted/50 font-bold border-none">
                <TableCell className="font-bold sticky left-0 bg-muted/80 backdrop-blur-sm z-20 text-foreground">Tổng cộng</TableCell>
                <TableCell className="text-right font-mono text-sm font-bold" style={{ color: accentColor }}>
                  {fmtTable(displayTotalRev)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-bold text-green-600">
                  {fmtTable(displayTotalComm)}
                </TableCell>
                {selectedMonths.map(mi => {
                  const monthTotal = allPersonData.persons.reduce((s, p) => s + p.monthlyRevenue[mi], 0);
                  return (
                    <TableCell key={mi} className="text-right font-mono text-sm font-bold text-foreground">
                      {monthTotal > 0 ? fmtTable(monthTotal) : '0'}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>

          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
