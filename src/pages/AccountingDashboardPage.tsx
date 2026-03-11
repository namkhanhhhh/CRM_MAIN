import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { mockAccountingRecords } from '@/data/accountingMockData';
import { computeAmountVAT } from '@/types/accounting';
import { TrendingUp, Target, CalendarRange, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import PersonalRevenueDashboard from '@/components/accounting/PersonalRevenueDashboard';

const KPI_DEFAULT = 500_000_000;

const fmt = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v);

const fmtShort = (v: number) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(v);

const MONTH_LABELS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const ALL_MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

interface MonthlyData {
  month: string;
  monthIdx: number;
  total: number;
  invoiced: number;
  notInvoiced: number;
  kpi: number;
  kpiRemaining: number;
  achievement: number;
}

export default function AccountingDashboardPage() {
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const set = new Set<number>();
    mockAccountingRecords.forEach(r => {
      if (r.onboardDate) set.add(new Date(r.onboardDate).getFullYear());
      set.add(new Date(r.offerDate).getFullYear());
    });
    set.add(currentYear);
    return Array.from(set).sort((a, b) => b - a);
  }, [currentYear]);

  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonths, setSelectedMonths] = useState<number[]>(ALL_MONTHS);

  const toggleMonth = (m: number) => {
    setSelectedMonths(prev => {
      if (prev.includes(m)) {
        const next = prev.filter(x => x !== m);
        return next.length === 0 ? [m] : next; // keep at least 1
      }
      return [...prev, m].sort((a, b) => a - b);
    });
  };

  const selectAll = () => setSelectedMonths(ALL_MONTHS);
  const selectQ = (q: number) => {
    const start = q * 3;
    setSelectedMonths([start, start + 1, start + 2]);
  };

  const isFiltered = selectedMonths.length !== 12;

  const handleReset = () => setSelectedMonths(ALL_MONTHS);

  const monthSummaryLabel = useMemo(() => {
    if (!isFiltered) return 'Cả năm';
    if (selectedMonths.length <= 4) return selectedMonths.map(m => `T${m + 1}`).join(', ');
    return `${selectedMonths.length} tháng`;
  }, [selectedMonths, isFiltered]);

  const rangeLabel = isFiltered
    ? `${monthSummaryLabel}/${selectedYear}`
    : `Năm ${selectedYear}`;

  // All 12 months data
  const allMonthlyData: MonthlyData[] = useMemo(() => {
    const year = Number(selectedYear);
    const buckets: { total: number; invoiced: number; notInvoiced: number }[] =
      Array.from({ length: 12 }, () => ({ total: 0, invoiced: 0, notInvoiced: 0 }));

    mockAccountingRecords.forEach(r => {
      if (r.overallStatus === 'Reject') return;
      const dateStr = r.onboardDate || r.offerDate;
      const d = new Date(dateStr);
      if (d.getFullYear() !== year) return;

      const amount = computeAmountVAT(r);
      const m = d.getMonth();
      buckets[m].total += amount;
      if (r.invoiceStatus === 'Đã xuất') {
        buckets[m].invoiced += amount;
      } else {
        buckets[m].notInvoiced += amount;
      }
    });

    return buckets.map((b, i) => ({
      month: MONTH_LABELS[i],
      monthIdx: i,
      total: b.total,
      invoiced: b.invoiced,
      notInvoiced: b.notInvoiced,
      kpi: KPI_DEFAULT,
      kpiRemaining: Math.max(0, KPI_DEFAULT - b.total),
      achievement: KPI_DEFAULT > 0 ? Math.round((b.total / KPI_DEFAULT) * 100) : 0,
    }));
  }, [selectedYear]);

  // Filtered by selected months
  const monthlyData = useMemo(() => {
    return allMonthlyData.filter(m => selectedMonths.includes(m.monthIdx));
  }, [allMonthlyData, selectedMonths]);

  const rangeTotal = useMemo(() => {
    return monthlyData.reduce(
      (acc, m) => ({
        total: acc.total + m.total,
        invoiced: acc.invoiced + m.invoiced,
        notInvoiced: acc.notInvoiced + m.notInvoiced,
      }),
      { total: 0, invoiced: 0, notInvoiced: 0 }
    );
  }, [monthlyData]);

  const chartConfig = {
    invoiced: { label: 'Đã xuất HĐ', color: 'hsl(var(--success))' },
    notInvoiced: { label: 'Chưa xuất HĐ', color: 'hsl(var(--warning))' },
    kpiRemaining: { label: 'KPI còn lại', color: 'hsl(250 55% 65%)' },
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header + Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard doanh thu</h1>
              <p className="text-sm text-muted-foreground">Theo dõi doanh thu và KPI hàng tháng</p>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">KPI/tháng:</span>
              <Badge variant="outline" className="font-mono">{fmt(KPI_DEFAULT)}</Badge>
            </div>
          </div>

          {/* Filter bar */}
          <Card className="border-dashed">
            <CardContent className="flex flex-wrap items-center gap-3 p-3">
              <CalendarRange className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-muted-foreground shrink-0">Lọc:</span>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue placeholder="Năm" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Multi-select month picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 min-w-[140px] justify-start">
                    <CalendarRange className="h-3.5 w-3.5" />
                    {monthSummaryLabel}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-3" align="start">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Chọn tháng</span>
                      <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={selectAll}>
                        Chọn tất cả
                      </Button>
                    </div>

                    {/* Quick quarter selectors */}
                    <div className="flex gap-1.5">
                      {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
                        <Button
                          key={q}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs flex-1"
                          onClick={() => selectQ(i)}
                        >
                          {q}
                        </Button>
                      ))}
                    </div>

                    {/* Month grid */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {MONTH_LABELS.map((label, i) => {
                        const checked = selectedMonths.includes(i);
                        return (
                          <button
                            key={i}
                            onClick={() => toggleMonth(i)}
                            className={`flex items-center justify-center h-8 rounded-md text-xs font-medium transition-colors border ${
                              checked
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background text-muted-foreground border-border hover:bg-muted'
                            }`}
                          >
                            T{i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {isFiltered && (
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={handleReset}>
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              )}

              {isFiltered && (
                <Badge variant="secondary" className="text-xs ml-auto">
                  {rangeLabel}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs text-muted-foreground">Tổng doanh thu ({rangeLabel})</p>
                <p className="text-xl font-bold text-foreground">{fmt(rangeTotal.total)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs text-muted-foreground">Đã xuất hóa đơn</p>
                <p className="text-xl font-bold text-success">{fmt(rangeTotal.invoiced)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs text-muted-foreground">Chưa xuất hóa đơn</p>
                <p className="text-xl font-bold text-warning">{fmt(rangeTotal.notInvoiced)}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Biểu đồ doanh thu theo tháng — {rangeLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) => v.replace('Tháng ', 'T')}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        if (name === 'kpiRemaining') return null;
                        const label = name === 'invoiced' ? 'Đã xuất HĐ' : 'Chưa xuất HĐ';
                        return <span>{label}: {fmt(Number(value))}</span>;
                      }}
                    />
                  }
                />
                <Legend
                  formatter={(value) =>
                    value === 'invoiced' ? 'Đã xuất HĐ' : value === 'notInvoiced' ? 'Chưa xuất HĐ' : 'KPI (mục tiêu)'
                  }
                />
                <Bar dataKey="invoiced" stackId="a" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="notInvoiced" stackId="a" fill="hsl(var(--warning))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="kpiRemaining" stackId="a" fill="hsl(250 55% 65%)" opacity={0.35} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Bảng chi tiết doanh thu — {rangeLabel}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="min-w-[180px] sticky left-0 bg-muted z-20 font-semibold">Chỉ số</TableHead>
                  {monthlyData.map((m) => (
                    <TableHead key={m.monthIdx} className="text-center min-w-[100px]">T{m.monthIdx + 1}</TableHead>
                  ))}
                  <TableHead className="text-center min-w-[120px] font-bold">Tổng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* KPI row */}
                <TableRow className="bg-primary/5">
                  <TableCell className="font-semibold sticky left-0 bg-primary/5 z-20">KPI</TableCell>
                  {monthlyData.map((m) => (
                    <TableCell key={m.monthIdx} className="text-center font-mono text-xs">{fmtShort(m.kpi)}</TableCell>
                  ))}
                  <TableCell className="text-center font-mono text-xs font-bold">{fmtShort(KPI_DEFAULT * monthlyData.length)}</TableCell>
                </TableRow>
                {/* Total revenue row */}
                <TableRow>
                  <TableCell className="font-semibold sticky left-0 bg-background z-20">Tổng doanh thu</TableCell>
                  {monthlyData.map((m) => {
                    const bg = m.total === 0
                      ? 'bg-destructive/20 text-destructive'
                      : m.achievement >= 100
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning';
                    return (
                      <TableCell key={m.monthIdx} className={`text-center font-mono text-xs font-semibold ${bg}`}>
                        {fmtShort(m.total)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-mono text-xs font-bold bg-muted/50">{fmtShort(rangeTotal.total)}</TableCell>
                </TableRow>
                {/* Invoiced row */}
                <TableRow>
                  <TableCell className="sticky left-0 bg-background z-20 text-sm">- Đã xuất hóa đơn</TableCell>
                  {monthlyData.map((m) => {
                    const bg = m.invoiced > 0 ? 'bg-success/15 text-success' : '';
                    return (
                      <TableCell key={m.monthIdx} className={`text-center font-mono text-xs ${bg}`}>
                        {fmtShort(m.invoiced)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-mono text-xs font-bold bg-success/15 text-success">{fmtShort(rangeTotal.invoiced)}</TableCell>
                </TableRow>
                {/* Not invoiced row */}
                <TableRow>
                  <TableCell className="sticky left-0 bg-background z-20 text-sm">- Chưa xuất hóa đơn</TableCell>
                  {monthlyData.map((m) => {
                    const bg = m.notInvoiced > 0 ? 'bg-warning/15 text-warning' : '';
                    return (
                      <TableCell key={m.monthIdx} className={`text-center font-mono text-xs ${bg}`}>
                        {fmtShort(m.notInvoiced)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-mono text-xs font-bold bg-warning/15 text-warning">{fmtShort(rangeTotal.notInvoiced)}</TableCell>
                </TableRow>
                {/* Achievement row */}
                <TableRow className="bg-muted/30">
                  <TableCell className="font-semibold sticky left-0 bg-muted/30 z-20">% Đạt KPI</TableCell>
                  {monthlyData.map((m) => (
                    <TableCell key={m.monthIdx} className="text-center font-mono text-xs font-semibold">
                      <span className={m.achievement >= 100 ? 'text-success' : m.achievement >= 70 ? 'text-warning' : 'text-destructive'}>
                        {m.achievement}%
                      </span>
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-mono text-xs font-bold">
                    {monthlyData.length > 0
                      ? `${Math.round((rangeTotal.total / (KPI_DEFAULT * monthlyData.length)) * 100)}%`
                      : '0%'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* BD Personal Revenue Dashboard */}
        <PersonalRevenueDashboard
          type="BD"
          records={mockAccountingRecords}
          selectedYear={selectedYear}
          selectedMonths={selectedMonths}
        />

        <PersonalRevenueDashboard
          type="HH"
          records={mockAccountingRecords}
          selectedYear={selectedYear}
          selectedMonths={selectedMonths}
        />
      </div>
    </MainLayout>
  );
}
