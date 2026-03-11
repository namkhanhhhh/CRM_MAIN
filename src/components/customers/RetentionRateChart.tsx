import { useMemo } from 'react';
import { Customer } from '@/types/customer';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RetentionRateChartProps {
  customers: Customer[];
  bdFilter: 'all' | string;
}

export function RetentionRateChart({ customers, bdFilter }: RetentionRateChartProps) {
  const stats = useMemo(() => {
    const filtered = bdFilter === 'all' 
      ? customers 
      : customers.filter(c => c.bdAssigned === bdFilter);

    // Group customers by company to find returning ones
    const companyStats: Record<string, { 
      interactions: number; 
      hasSignedBefore: boolean;
      currentlyActive: boolean;
    }> = {};

    filtered.forEach(customer => {
      const company = customer.companyName;
      if (!companyStats[company]) {
        companyStats[company] = { 
          interactions: 0, 
          hasSignedBefore: false,
          currentlyActive: false 
        };
      }
      companyStats[company].interactions++;
      
      if (customer.status === 'Signed') {
        companyStats[company].hasSignedBefore = true;
      }
      
      // Active = in follow-up stages
      if (['Follow up', 'Approach', 'Consulting', 'Meeting Clear JD'].includes(customer.status)) {
        companyStats[company].currentlyActive = true;
      }
    });

    const companies = Object.values(companyStats);
    const totalCompanies = companies.length;
    
    // Returning = has signed before AND currently active again
    const returningCompanies = companies.filter(
      c => c.hasSignedBefore && c.currentlyActive
    ).length;

    // Multiple interactions = engaged customers
    const engagedCompanies = companies.filter(c => c.interactions > 1).length;

    const retentionRate = totalCompanies > 0 
      ? Math.round((returningCompanies / totalCompanies) * 100) 
      : 0;
    
    const engagementRate = totalCompanies > 0
      ? Math.round((engagedCompanies / totalCompanies) * 100)
      : 0;

    // Simulated monthly trend data
    const trendData = [
      { month: 'T1', rate: Math.max(0, retentionRate - 15 + Math.random() * 10) },
      { month: 'T2', rate: Math.max(0, retentionRate - 10 + Math.random() * 10) },
      { month: 'T3', rate: Math.max(0, retentionRate - 5 + Math.random() * 10) },
      { month: 'T4', rate: Math.max(0, retentionRate + Math.random() * 5) },
      { month: 'T5', rate: Math.max(0, retentionRate + 5 + Math.random() * 5) },
      { month: 'T6', rate: retentionRate },
    ].map(d => ({ ...d, rate: Math.round(d.rate) }));

    // Calculate trend
    const trend = trendData[5].rate - trendData[0].rate;

    return { 
      retentionRate, 
      engagementRate,
      returningCompanies,
      totalCompanies,
      trendData,
      trend
    };
  }, [customers, bdFilter]);

  const TrendIcon = stats.trend > 0 ? TrendingUp : stats.trend < 0 ? TrendingDown : Minus;
  const trendColor = stats.trend > 0 ? 'text-green-500' : stats.trend < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold">{stats.retentionRate}%</span>
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          </div>
          <p className="text-xs text-muted-foreground">Tỉ lệ quay lại</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <span className="text-2xl font-bold">{stats.engagementRate}%</span>
          <p className="text-xs text-muted-foreground">Tỉ lệ tương tác</p>
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-muted-foreground">
        {stats.returningCompanies}/{stats.totalCompanies} công ty quay lại
      </div>

      {/* Trend chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats.trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis domain={[0, 100]} className="text-xs" />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-popover border rounded-lg p-2 shadow-lg">
                      <p className="font-medium">Tháng {label}</p>
                      <p className="text-sm text-muted-foreground">
                        Tỉ lệ: <span className="text-foreground font-medium">{payload[0].value}%</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="rate" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary) / 0.2)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
