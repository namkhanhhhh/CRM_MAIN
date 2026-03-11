import { useMemo } from 'react';
import { Customer } from '@/types/customer';
import { differenceInDays, parseISO } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Clock } from 'lucide-react';

interface SalesCycleChartProps {
  customers: Customer[];
  bdFilter: 'all' | string;
}

const COLORS = [
  '#22c55e', // green-500 - fast
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#f97316', // orange-500
  '#ef4444', // red-500 - slow
];

export function SalesCycleChart({ customers, bdFilter }: SalesCycleChartProps) {
  const stats = useMemo(() => {
    const filtered = bdFilter === 'all' 
      ? customers 
      : customers.filter(c => c.bdAssigned === bdFilter);

    // Only consider signed customers for cycle calculation
    const signedCustomers = filtered.filter(c => c.status === 'Signed');
    
    if (signedCustomers.length === 0) {
      return { avgDays: 0, distribution: [], totalSigned: 0 };
    }

    // Calculate days from creation to now (simulating signed date)
    const cycles = signedCustomers.map(c => {
      const created = parseISO(c.createdAt);
      const updated = parseISO(c.updatedAt);
      return differenceInDays(updated, created);
    });

    const avgDays = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);

    // Distribution by cycle length
    const distribution = [
      { name: '< 7 ngày', value: cycles.filter(d => d < 7).length, color: COLORS[0] },
      { name: '7-14 ngày', value: cycles.filter(d => d >= 7 && d < 14).length, color: COLORS[1] },
      { name: '14-30 ngày', value: cycles.filter(d => d >= 14 && d < 30).length, color: COLORS[2] },
      { name: '30-60 ngày', value: cycles.filter(d => d >= 30 && d < 60).length, color: COLORS[3] },
      { name: '> 60 ngày', value: cycles.filter(d => d >= 60).length, color: COLORS[4] },
    ].filter(d => d.value > 0);

    return { avgDays, distribution, totalSigned: signedCustomers.length };
  }, [customers, bdFilter]);

  if (stats.totalSigned === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Chưa có deal thành công</p>
        <p className="text-sm">để tính chu kỳ sales</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Average cycle stat */}
      <div className="flex items-center justify-center gap-3 mb-4 p-4 bg-muted/50 rounded-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-3xl font-bold text-primary">{stats.avgDays}</p>
          <p className="text-sm text-muted-foreground">ngày trung bình</p>
        </div>
        <div className="ml-4 pl-4 border-l">
          <p className="text-2xl font-semibold text-foreground">{stats.totalSigned}</p>
          <p className="text-sm text-muted-foreground">deal thành công</p>
        </div>
      </div>

      {/* Distribution chart */}
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stats.distribution}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={2}
              stroke="hsl(var(--background))"
            >
              {stats.distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border rounded-lg p-3 shadow-lg">
                      <p className="font-medium text-foreground">{data.name}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{data.value}</span> deal ({Math.round((data.value / stats.totalSigned) * 100)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              layout="horizontal" 
              align="center"
              verticalAlign="bottom"
              iconType="circle"
              iconSize={10}
              formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
              wrapperStyle={{ paddingTop: 16 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
