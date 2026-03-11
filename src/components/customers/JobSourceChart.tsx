import { useMemo } from 'react';
import { Customer, JobSource } from '@/types/customer';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, ExternalLink } from 'lucide-react';

interface JobSourceChartProps {
  customers: Customer[];
}

const SOURCE_COLORS: Record<string, string> = {
  'Facebook': '#1877F2',
  'Linkedin': '#0A66C2',
  'Thread': '#000000',
  'Itviec': '#E3383A',
  'Topdev': '#FF6B35',
  'Aniday': '#4ECDC4',
  'Job Portal': '#8B5CF6',
  'Referral': '#10B981',
  'Khác': '#94A3B8',
};

export function JobSourceChart({ customers }: JobSourceChartProps) {
  const { chartData, topSource, totalJobs } = useMemo(() => {
    // Count jobs by source
    const sourceCount: Record<string, number> = {};
    let total = 0;

    customers.forEach((c) => {
      if (c.jobSource) {
        sourceCount[c.jobSource] = (sourceCount[c.jobSource] || 0) + 1;
        total++;
      }
    });

    // Convert to chart data
    const data = Object.entries(sourceCount)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
        color: SOURCE_COLORS[name] || '#94A3B8',
      }))
      .sort((a, b) => b.value - a.value);

    const top = data.length > 0 ? data[0] : null;

    return {
      chartData: data,
      topSource: top,
      totalJobs: total,
    };
  }, [customers]);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <ExternalLink className="h-8 w-8 mb-2" />
        <p className="text-sm">Chưa có dữ liệu nguồn job</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} jobs ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Top Source Highlight */}
      {topSource && (
        <div 
          className="flex items-center justify-between p-3 rounded-lg border"
          style={{ 
            backgroundColor: `${topSource.color}10`,
            borderColor: `${topSource.color}40`
          }}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" style={{ color: topSource.color }} />
            <span className="text-sm font-medium">Nguồn job nhiều nhất</span>
          </div>
          <div className="flex items-center gap-2">
            <span 
              className="font-bold"
              style={{ color: topSource.color }}
            >
              {topSource.name}
            </span>
            <span className="text-xs text-muted-foreground">
              ({topSource.value} jobs - {topSource.percentage}%)
            </span>
          </div>
        </div>
      )}

      {/* Pie Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value) => <span className="text-xs">{value}</span>}
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Source Stats Grid - Show ALL sources */}
      <div className="grid grid-cols-3 gap-2">
        {chartData.map((source) => (
          <div 
            key={source.name}
            className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: source.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{source.name}</p>
              <p className="text-xs text-muted-foreground">{source.value} ({source.percentage}%)</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="text-center p-2 bg-muted/50 rounded-lg">
        <span className="text-xs text-muted-foreground">Tổng số job từ các nguồn: </span>
        <span className="font-bold text-sm">{totalJobs}</span>
      </div>
    </div>
  );
}
