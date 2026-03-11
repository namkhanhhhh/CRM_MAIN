import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  Briefcase,
  GitBranch,
  DollarSign,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  Info,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  mockJobs,
  mockProcesses,
  mockSystemUsers,
  getJobStats,
  getUserStats,
  getProcessStats,
  getRevenueStats,
} from "@/data/processJobUserMockData";
import { ACTIVE_PROCESS_STATUSES, PROCESS_STATUS_CATEGORIES } from "@/types/process";

// Chart colors
const COLORS = {
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  destructive: "hsl(var(--destructive))",
  warning: "hsl(var(--warning))",
  info: "hsl(var(--info))",
  muted: "hsl(var(--muted))",
};

const PIE_COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];

// Category labels in Vietnamese with status details
const CATEGORY_LABELS: Record<string, { label: string; statuses: string[] }> = {
  Application: {
    label: "Ứng tuyển",
    statuses: ["APPLIED", "REJECT BY ADMIN", "CV SUBMITTED TO CLIENT"],
  },
  Interview: {
    label: "Phỏng vấn",
    statuses: [
      "INTERVIEW SCHEDULED 1ST",
      "INTERVIEW COMPLETED 1ST",
      "INTERVIEW SCHEDULED 2ND",
      "INTERVIEW COMPLETED 2ND",
      "INTERVIEW SCHEDULED 3RD",
      "INTERVIEW COMPLETED 3RD",
      "INTERVIEW SCHEDULED FINAL",
      "INTERVIEW COMPLETED FINAL",
    ],
  },
  Assessment: {
    label: "Đánh giá",
    statuses: ["TEST ASSIGNED", "TEST COMPLETED", "REFERENCE CHECK IN PROGRESS", "REFERENCE CHECK COMPLETED"],
  },
  Offer: {
    label: "Đề nghị",
    statuses: ["OFFER EXTENDED", "OFFER ACCEPTED BY CANDIDATE", "OFFER DECLINED BY CANDIDATE"],
  },
  Outcome: {
    label: "Kết quả",
    statuses: ["REJECTED BY CLIENT", "CANDIDATE WITHDREW", "PLACEMENT CONFIRMED"],
  },
  Completion: {
    label: "Hoàn tất",
    statuses: ["ONBOARDING", "GUARANTEE PERIOD", "PAYMENT RECEIVED"],
  },
};

export default function CandidateManagementPage() {
  const [revenuePeriod, setRevenuePeriod] = useState<"month" | "quarter" | "year">("month");

  // Statistics
  const userStats = useMemo(() => getUserStats(), []);
  const jobStats = useMemo(() => getJobStats(), []);
  const processStats = useMemo(() => getProcessStats(), []);
  const revenueStats = useMemo(() => getRevenueStats(revenuePeriod), [revenuePeriod]);

  // Pie chart data for Users
  const userPieData = [
    { name: "Approved", value: userStats.approved, color: "#10b981" },
    { name: "Banned", value: userStats.banned, color: "#ef4444" },
  ];

  // Pie chart data for Jobs
  const jobPieData = [
    { name: "Open", value: jobStats.open, color: "#3b82f6" },
    { name: "Cancelled", value: jobStats.cancelled, color: "#6b7280" },
  ];

  // Bar chart data for Process statuses grouped by category
  const processBarData = useMemo(() => {
    const data: { category: string; categoryKey: string; count: number }[] = [];

    Object.entries(PROCESS_STATUS_CATEGORIES).forEach(([category, statuses]) => {
      const count = statuses.reduce((sum, status) => {
        return sum + (processStats.statusCounts[status] || 0);
      }, 0);
      data.push({
        category: CATEGORY_LABELS[category]?.label || category,
        categoryKey: category,
        count,
      });
    });

    return data;
  }, [processStats]);

  // Detailed process status data for table
  const processStatusDetails = useMemo(() => {
    return ACTIVE_PROCESS_STATUSES.map((status) => ({
      status,
      count: processStats.statusCounts[status] || 0,
    })).filter((item) => item.count > 0);
  }, [processStats]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getPeriodLabel = (period: "month" | "quarter" | "year") => {
    const now = new Date();
    switch (period) {
      case "month":
        return `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;
      case "quarter":
        return `Quý ${Math.floor(now.getMonth() / 3) + 1}/${now.getFullYear()}`;
      case "year":
        return `Năm ${now.getFullYear()}`;
    }
  };

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const categoryInfo = CATEGORY_LABELS[data.categoryKey];

      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 max-w-[280px]">
          <p className="font-semibold text-sm mb-2">
            {categoryInfo?.label || data.category}: {data.count} quy trình
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground mb-1">Bao gồm các status:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {categoryInfo?.statuses.map((status) => (
                <li key={status} className="text-xs">
                  {status}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Quản lý Kinh doanh</h1>
              <p className="text-muted-foreground">Thống kê tổng quan hệ thống tuyển dụng</p>
            </div>
          </div>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Users Card */}
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Khách hàng Hoạt động</p>
                <p className="text-3xl font-bold">{userStats.approved}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-destructive">{userStats.banned} Banned</span>
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <UserCheck className="h-6 w-6 text-success" />
              </div>
            </CardContent>
          </Card>

          {/* Jobs Card */}
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Jobs đang mở</p>
                <p className="text-3xl font-bold">{jobStats.open}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-muted-foreground">{jobStats.cancelled} Cancelled</span>
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-info/10">
                <Briefcase className="h-6 w-6 text-info" />
              </div>
            </CardContent>
          </Card>

          {/* Active Processes Card */}
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Quy trình đang xử lý</p>
                <p className="text-3xl font-bold">{processStats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Đang hoạt động</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <GitBranch className="h-6 w-6 text-warning" />
              </div>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">Doanh số ({getPeriodLabel(revenuePeriod)})</p>
                <p className="text-2xl font-bold">{formatCurrency(revenueStats.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">{revenueStats.caseCount} case đã ghi nhận</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Users Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Phân bổ Khách hàng theo Trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {userPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <span className="text-sm">Approved: {userStats.approved}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <span className="text-sm">Banned: {userStats.banned}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jobs Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-info" />
                Phân bổ Jobs theo Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jobPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {jobPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-info" />
                  <span className="text-sm">Open: {jobStats.open}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                  <span className="text-sm">Cancelled: {jobStats.cancelled}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Period */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  Doanh số ghi nhận
                </CardTitle>
                <Select value={revenuePeriod} onValueChange={(v) => setRevenuePeriod(v as any)}>
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Tháng</SelectItem>
                    <SelectItem value="quarter">Quý</SelectItem>
                    <SelectItem value="year">Năm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-[250px]">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-4">
                  <TrendingUp className="h-10 w-10 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-emerald-600">{formatCurrency(revenueStats.totalRevenue)}</p>
                <p className="text-sm text-muted-foreground mt-2">{getPeriodLabel(revenuePeriod)}</p>
                <p className="text-sm text-muted-foreground">{revenueStats.caseCount} case đã ONBOARDING</p>
              </div>
              <div className="mt-4 text-center text-xs text-muted-foreground">
                <Calendar className="inline h-3 w-3 mr-1" />
                Dữ liệu từ các ứng viên đã ONBOARDING
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Status Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-warning" />
              Thống kê Quy trình theo Status
              <Badge variant="secondary" className="ml-2">
                Không bao gồm On Hold & Cancelled
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart with Legend */}
              <div className="space-y-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processBarData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Legend */}
                <div className="border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Chú thích các nhóm trạng thái</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(CATEGORY_LABELS).map(([key, { label, statuses }]) => (
                      <TooltipProvider key={key}>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-help">
                              <div className="h-2.5 w-2.5 rounded-sm bg-primary flex-shrink-0" />
                              <span className="font-medium">{label}</span>
                              <span className="text-muted-foreground">({statuses.length})</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[250px]">
                            <p className="font-medium mb-1">{label}</p>
                            <ul className="text-xs space-y-0.5">
                              {statuses.map((s) => (
                                <li key={s}>• {s}</li>
                              ))}
                            </ul>
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Details Table */}
              <div className="h-[420px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">Status</th>
                      <th className="text-right py-2 px-3 font-medium">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processStatusDetails.map((item, index) => (
                      <tr key={item.status} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                        <td className="py-2 px-3">
                          <span className="text-xs">{item.status}</span>
                        </td>
                        <td className="text-right py-2 px-3 font-medium">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t font-semibold">
                    <tr>
                      <td className="py-2 px-3">Tổng cộng</td>
                      <td className="text-right py-2 px-3">{processStats.total}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
