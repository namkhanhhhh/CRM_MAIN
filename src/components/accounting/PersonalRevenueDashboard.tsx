import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Cell } from 'recharts';
import { AccountingRecord, computeAmountNoVAT } from '@/types/accounting';
import { Users, Briefcase } from 'lucide-react';

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
  'hsl(220 70% 55%)', 'hsl(330 70% 55%)', 'hsl(140 60% 45%)', 'hsl(270 60% 55%)',
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

  const allPersonData = useMemo(() => {
    const filtered = records.filter(r => {
      if (r.overallStatus === 'Reject') return false;
      const dateStr = r.onboardDate || r.offerDate;
      return new Date(dateStr).getFullYear() === year;
    });

    const personMap = new Map<string, number[]>();
    filtered.forEach(r => {
      const personName = type === 'BD' ? r.bdName : r.ownerName;
      const noVAT = computeAmountNoVAT(r);
      const amount = type === 'BD'
        ? noVAT * (r.commissionRateBD / 100)
        : noVAT * ((100 - r.commissionRateBD) / 100);
      const month = new Date(r.onboardDate || r.offerDate).getMonth();

      if (!personMap.has(personName)) personMap.set(personName, new Array(12).fill(0));
      personMap.get(personName)![month] += amount;
    });

    const persons: { name: string; monthlyAmounts: number[]; total: number }[] = [];
    personMap.forEach((months, name) => {
      persons.push({ name, monthlyAmounts: months, total: months.reduce((s, v) => s + v, 0) });
    });
    persons.sort((a, b) => b.total - a.total);
    return { persons };
  }, [records, year, type]);

  const { chartData, displayTotal } = useMemo(() => {
    const { persons } = allPersonData;
    const data = persons.map(p => ({
      name: p.name,
      value: selectedMonths.reduce((s, mi) => s + p.monthlyAmounts[mi], 0),
    })).filter(d => d.value > 0);

    const total = data.reduce((s, d) => s + d.value, 0);
    return { chartData: [...data, { name: 'Tổng cộng', value: total }], displayTotal: total };
  }, [allPersonData, selectedMonths]);

  const isFiltered = selectedMonths.length !== 12;
  const rangeLabel = isFiltered
    ? (selectedMonths.length <= 4
        ? selectedMonths.map(m => `T${m + 1}`).join(', ')
        : `${selectedMonths.length} tháng`) + `/${selectedYear}`
    : `Cả năm ${selectedYear}`;

  const title = type === 'BD' ? 'Doanh số cá nhân - Bộ phận BD' : 'Doanh số cá nhân - Bộ phận HH';
  const subtitle = type === 'BD' ? 'Commission BD = No VAT × % BD được nhận' : 'Doanh thu HH = (100% - % BD) × No VAT';
  const Icon = type === 'BD' ? Briefcase : Users;
  const accentColor = type === 'BD' ? 'hsl(var(--primary))' : 'hsl(330 70% 55%)';
  const chartConfig = { value: { label: 'Doanh số', color: accentColor } };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${accentColor}20` }}>
              <Icon className="h-5 w-5" style={{ color: accentColor }} />
            </div>
            <div>
              <CardTitle className="text-base font-bold">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium">{rangeLabel}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tổng doanh số ({rangeLabel}):</span>
          <span className="text-lg font-bold font-mono" style={{ color: accentColor }}>{fmt(displayTotal)}</span>
        </div>

        {chartData.length > 1 ? (
          <ChartContainer config={chartConfig} className="h-[320px] w-full">
            <BarChart data={chartData} margin={{ top: 25, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => fmtShort(v)} />
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => <span>{fmt(Number(value))}</span>} />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.name === 'Tổng cộng' ? TOTAL_COLOR : PERSON_COLORS[index % PERSON_COLORS.length]} opacity={entry.name === 'Tổng cộng' ? 0.85 : 1} />
                ))}
                <LabelList dataKey="value" position="top" formatter={(v: number) => v > 0 ? fmtShort(v) : ''} style={{ fontSize: 10, fontWeight: 600, fill: 'hsl(var(--foreground))' }} />
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Không có dữ liệu cho {rangeLabel}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="min-w-[160px] sticky left-0 bg-muted z-20 font-semibold">
                  {type === 'BD' ? 'Nhân viên BD' : 'Nhân viên HH'}
                </TableHead>
                <TableHead className="text-right min-w-[120px] font-semibold">Tổng cộng</TableHead>
                {selectedMonths.map(mi => (
                  <TableHead key={mi} className="text-right min-w-[100px] font-semibold">T{mi + 1}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allPersonData.persons
                .filter(p => selectedMonths.some(mi => p.monthlyAmounts[mi] > 0))
                .map((person, idx) => {
                  const rangeSum = selectedMonths.reduce((s, mi) => s + person.monthlyAmounts[mi], 0);
                  return (
                    <TableRow key={person.name} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                      <TableCell className="font-medium sticky left-0 bg-inherit z-20">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PERSON_COLORS[idx % PERSON_COLORS.length] }} />
                          {person.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold" style={{ color: accentColor }}>
                        {fmtTable(rangeSum)}
                      </TableCell>
                      {selectedMonths.map(mi => (
                        <TableCell key={mi} className="text-right font-mono text-sm">
                          {person.monthlyAmounts[mi] > 0 ? fmtTable(person.monthlyAmounts[mi]) : '–'}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              <TableRow className="bg-muted font-bold border-t-2">
                <TableCell className="font-bold sticky left-0 bg-muted z-20">Tổng cộng</TableCell>
                <TableCell className="text-right font-mono text-sm font-bold" style={{ color: accentColor }}>
                  {fmtTable(displayTotal)}
                </TableCell>
                {selectedMonths.map(mi => {
                  const monthTotal = allPersonData.persons.reduce((s, p) => s + p.monthlyAmounts[mi], 0);
                  return (
                    <TableCell key={mi} className="text-right font-mono text-sm font-bold">
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
