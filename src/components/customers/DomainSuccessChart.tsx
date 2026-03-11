import { useMemo } from 'react';
import { Customer } from '@/types/customer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

interface DomainSuccessChartProps {
  customers: Customer[];
  bdFilter: 'all' | string;
}

const COLORS = [
  '#22c55e', // green-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
];

export function DomainSuccessChart({ customers, bdFilter }: DomainSuccessChartProps) {
  const data = useMemo(() => {
    const filtered = bdFilter === 'all' 
      ? customers 
      : customers.filter(c => c.bdAssigned === bdFilter);

    // Group by domain
    const domainStats: Record<string, { total: number; success: number }> = {};
    
    filtered.forEach(customer => {
      const domain = customer.domain;
      if (!domainStats[domain]) {
        domainStats[domain] = { total: 0, success: 0 };
      }
      domainStats[domain].total++;
      
      // Success = Signed status
      if (customer.status === 'Signed') {
        domainStats[domain].success++;
      }
    });

    // Calculate success rate and sort
    return Object.entries(domainStats)
      .map(([domain, stats]) => ({
        domain: domain.length > 18 ? domain.substring(0, 15) + '...' : domain,
        fullDomain: domain,
        total: stats.total,
        success: stats.success,
        rate: stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 8);
  }, [customers, bdFilter]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Chưa có dữ liệu
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ top: 5, right: 50, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            dataKey="domain" 
            type="category" 
            width={120} 
            tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-popover border rounded-lg p-3 shadow-lg">
                    <p className="font-medium text-foreground">{data.fullDomain}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tỉ lệ thành công: <span className="text-primary font-semibold">{data.rate}%</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {data.success}/{data.total} khách hàng
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="rate" radius={[0, 6, 6, 0]} barSize={24}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList 
              dataKey="rate" 
              position="right" 
              formatter={(v: number) => `${v}%`}
              style={{ fontSize: 11, fontWeight: 500, fill: 'hsl(var(--foreground))' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
