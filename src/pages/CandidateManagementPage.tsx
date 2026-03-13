import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Users,
  User,
  Briefcase,
  TrendingUp,
  Calendar,
  Search,
  ChevronRight,
  Trophy,
  BarChart3,
  Award,
  ChevronDown,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  CreditCard,
  Globe
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { 
  mockFreelancers, 
  mockReferrals, 
  mockPositionStats,
  mockConversionRates
} from "@/data/freelancerMockData";
import { cn } from "@/lib/utils";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

// Modal component to view freelancer detail from referral
function FreelancerDetailDialog({ 
  freelancer, 
  open, 
  onOpenChange 
}: { 
  freelancer: any; 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) {
  if (!freelancer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background gap-0">
        <DialogTitle className="sr-only">Chi tiết hồ sơ</DialogTitle>
        <ScrollArea className="max-h-[85vh]">
          {/* Cover Header */}
          <div className="h-32 bg-[#0ea5e9]"></div>
          
          <div className="px-8 pb-8">
            {/* Profile Section */}
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="flex items-end gap-4">
                <div className="h-24 w-24 rounded-full bg-white p-1 shadow-sm">
                  <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <User className="w-10 h-10" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">{freelancer.name}</h2>
              <p className="text-muted-foreground mb-4">User</p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {freelancer.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {freelancer.phone}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" /> Tham gia {freelancer.date}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-bold text-foreground">Chi tiết hồ sơ</h3>
              <Badge variant="secondary" className="bg-muted text-muted-foreground font-normal">Read Only</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="md:col-span-2 space-y-6">
                <Card className="shadow-xs border-muted/60">
                  <CardHeader className="pb-4 border-b border-muted/50 bg-muted/5">
                    <CardTitle className="text-base font-medium flex items-center gap-2 text-rose-600">
                      <User className="h-4 w-4" />
                      Thông tin cá nhân
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Họ và tên</label>
                        <Input readOnly value={freelancer.name} className="bg-muted/10" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Số điện thoại</label>
                        <Input readOnly value={freelancer.phone} className="bg-muted/10" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Địa chỉ</label>
                        <Input readOnly value={freelancer.address || ''} placeholder="Địa chỉ liên hệ" className="bg-muted/10" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Thành phố / Tỉnh</label>
                        <Input readOnly value={freelancer.city || ''} placeholder="VD: Hồ Chí Minh" className="bg-muted/10" />
                      </div>
                      <div className="col-span-2 space-y-1.5 mt-2">
                        <label className="text-sm font-medium text-foreground">Giới thiệu bản thân (Bio)</label>
                        <textarea 
                          readOnly 
                          value={freelancer.bio || ''} 
                          placeholder="Một chút về bản thân..."
                          className="w-full min-h-[100px] rounded-md border border-input bg-muted/10 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <Card className="shadow-xs border-muted/60">
                  <CardHeader className="pb-4 border-b border-muted/50 bg-muted/5">
                    <CardTitle className="text-base font-medium flex items-center gap-2 text-pink-600">
                      <Globe className="h-4 w-4" />
                      Mạng xã hội
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">Zalo</label>
                      <div className="flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-[#0ea5e9] text-white text-sm">
                          Z
                        </span>
                        <Input readOnly value={freelancer.zalo || ''} placeholder="Số điện thoại Zalo" className="rounded-l-none bg-muted/10" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-muted-foreground">Facebook</label>
                      <div className="flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-blue-600 text-white text-sm">
                          f
                        </span>
                        <Input readOnly value={freelancer.facebook || ''} placeholder="Link Facebook profile" className="rounded-l-none bg-muted/10" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xs border-muted/60">
                  <CardHeader className="pb-4 border-b border-muted/50 bg-muted/5">
                    <CardTitle className="text-base font-medium flex items-center gap-2 text-rose-600">
                      <CreditCard className="h-4 w-4" />
                      Thông tin ngân hàng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="p-4 bg-muted/20 border border-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground italic">Chưa cập nhật thông tin</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default function CandidateManagementPage() {
  const [period, setPeriod] = useState<string>("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllPositions, setShowAllPositions] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);

  // Filter labels
  const getPeriodLabel = () => {
    switch (period) {
      case "today": return "Hôm nay";
      case "week": return "Tuần này";
      case "month": return "Tháng này";
      case "last_month": return "Tháng trước";
      default: return "Toàn thời gian";
    }
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      totalFreelancers: 610,
      totalCVs: 468,
      onboarding: 1,
      successRate: "0.2%",
    };
  }, []);

  // Filtered freelancers
  const filteredFreelancers = useMemo(() => {
    return mockFreelancers.filter(f => {
      // Hide freelancers with 0 CVs when weekly is selected
      if (period === "week" && f.cvToTdc === 0) return false;
      
      const matchesSearch = 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [period, searchTerm]);

  // Position ranking data
  const positionData = useMemo(() => {
    const sorted = [...mockPositionStats].sort((a, b) => b.cvCount - a.cvCount);
    return showAllPositions ? sorted : sorted.slice(0, 5);
  }, [showAllPositions]);

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Freelancer Management
            </h1>
            <p className="text-muted-foreground mt-1 text-base">
              Theo dõi hiệu suất & tỷ lệ chuyển đổi của freelancer
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 justify-between w-[180px] bg-background">
                  <div className="flex items-center text-muted-foreground font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    Thời gian tạo
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[340px] p-0 flex rounded-xl border-muted/50 overflow-hidden shadow-lg" align="end">
                {/* Lựa chọn nhanh */}
                <div className="w-[140px] bg-background border-r border-muted/30 py-2">
                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">LỰA CHỌN NHANH</div>
                  <button 
                    onClick={() => { setPeriod("today"); setFilterOpen(false); }}
                    className={cn("w-full text-left px-4 py-2 text-sm transition-colors", period === "today" ? "text-primary font-medium" : "hover:bg-muted/50 text-foreground")}
                  >
                    Hôm nay
                  </button>
                  <button 
                    onClick={() => { setPeriod("week"); setFilterOpen(false); }}
                    className={cn("w-full text-left px-4 py-2 text-sm transition-colors", period === "week" ? "text-primary font-medium" : "hover:bg-muted/50 text-foreground")}
                  >
                    Tuần này
                  </button>
                  <button 
                    onClick={() => { setPeriod("month"); setFilterOpen(false); }}
                    className={cn("w-full text-left px-4 py-2 text-sm transition-colors", period === "month" ? "text-primary font-medium" : "hover:bg-muted/50 text-foreground")}
                  >
                    Tháng này
                  </button>
                  <button 
                    onClick={() => { setPeriod("last_month"); setFilterOpen(false); }}
                    className={cn("w-full text-left px-4 py-2 text-sm transition-colors", period === "last_month" ? "text-primary font-medium" : "hover:bg-muted/50 text-foreground")}
                  >
                    Tháng trước
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50 text-foreground transition-colors mt-1">
                    Tùy chọn...
                  </button>
                </div>
                {/* Chọn tháng */}
                <div className="flex-1 bg-muted/10 p-3">
                  <div className="text-xs font-semibold text-muted-foreground mb-3 text-center uppercase tracking-wider">THEO THÁNG (2026)</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <button 
                        key={i}
                        className="text-xs text-center py-1.5 rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-foreground"
                      >
                        Tháng {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Tổng Freelancer", value: stats.totalFreelancers, icon: Users, color: "blue" },
            { label: "Tổng CV đã gửi", value: stats.totalCVs, icon: Briefcase, color: "emerald" },
            { label: "Tổng Onboarding", value: stats.onboarding, icon: Trophy, color: "purple" },
            { label: "Tỷ lệ thành công", value: stats.successRate, icon: TrendingUp, color: "orange" },
          ].map((stat, i) => (
            <Card key={i} className="group relative overflow-hidden border border-muted/40 shadow-sm transition-all duration-300">
              <CardContent className="p-5 relative md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium text-muted-foreground mb-2">{stat.label}</p>
                    <p className={cn("text-3xl font-semibold tracking-tight", 
                      stat.color === 'blue' ? 'text-blue-600' : 
                      stat.color === 'emerald' ? 'text-emerald-600' : 
                      stat.color === 'purple' ? 'text-purple-600' : 
                      'text-orange-500'
                    )}>{stat.value}</p>
                  </div>
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border", 
                    stat.color === 'blue' ? 'border-blue-100 bg-blue-50 text-blue-500' : 
                    stat.color === 'emerald' ? 'border-emerald-100 bg-emerald-50 text-emerald-500' : 
                    stat.color === 'purple' ? 'border-purple-100 bg-purple-50 text-purple-500' : 
                    'border-orange-100 bg-orange-50 text-orange-500'
                  )}>
                    <stat.icon className="h-6 w-6 opacity-80" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Freelancer List Table - Full Width */}
        <Card className="border-muted/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-medium">Danh sách Freelancer</CardTitle>
              <CardDescription className="text-sm">Hiệu suất focus job của freelancer (Sắp xếp theo số lượng CV đã gửi từ cao → thấp)</CardDescription>
            </div>
            <div className="relative w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Tìm theo tên, SĐT, email..." 
                className="pl-9 h-9 text-sm focus-visible:ring-1 bg-muted/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 text-center font-medium text-sm text-muted-foreground">STT</TableHead>
                    <TableHead className="font-medium text-sm text-muted-foreground">TÊN FREELANCER</TableHead>
                    <TableHead className="text-center font-medium text-sm text-blue-600">CV TO TDC</TableHead>
                    <TableHead className="text-center font-medium text-sm text-muted-foreground">CV TO CLIENT</TableHead>
                    <TableHead className="text-center font-medium text-sm text-muted-foreground">INTERVIEW</TableHead>
                    <TableHead className="text-center font-medium text-sm text-purple-600">OFFER</TableHead>
                    <TableHead className="text-center font-medium text-sm text-emerald-600">ONBOARDING</TableHead>
                    <TableHead className="text-center font-medium text-sm text-rose-500">REJECTED</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFreelancers.length > 0 ? (
                    filteredFreelancers.map((f, i) => (
                      <TableRow key={f.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-center text-base text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-base text-foreground">{f.name}</span>
                            <span className="text-[13px] text-muted-foreground mt-0.5">{f.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md text-base">
                            {f.cvToTdc}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-medium text-base text-foreground">{f.cvToClient}</TableCell>
                        <TableCell className="text-center font-medium text-base text-foreground">{f.interview}</TableCell>
                        <TableCell className="text-center font-medium text-base text-purple-600">{f.offer}</TableCell>
                        <TableCell className="text-center font-medium text-base text-emerald-600">{f.onboarding}</TableCell>
                        <TableCell className="text-center font-medium text-base text-rose-500">{f.rejected || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        Không có freelancer nào phù hợp cho khoảng thời gian này
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="p-3 border-t flex justify-center bg-muted/5">
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs hover:text-foreground">
                Tải thêm dữ liệu <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Middle Grid: Conversion Rate & Staff Ranking side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Conversion Rate */}
          <Card className="border-muted/40 shadow-sm flex flex-col">
            <CardHeader className="pb-4 border-b border-muted/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-rose-500" />
                <CardTitle className="text-lg font-semibold text-foreground">
                  Tỷ lệ chuyển đổi
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-muted-foreground">Onboarding / CV gửi — Top 5 freelancer</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-6">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockConversionRates} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      type="number" 
                      domain={[0, 15]}
                      ticks={[0, 4, 8, 15]}
                      tickFormatter={(value) => `${value}%`}
                      axisLine={{ stroke: 'rgba(0,0,0,0.2)' }}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={60} 
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }} 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        border: '1px solid rgba(0,0,0,0.1)', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        fontSize: '12px',
                        padding: '8px 12px'
                      }}
                      formatter={(value: number) => [`${value}%`, "Tỷ lệ"]}
                    />
                    <Bar 
                      dataKey="rate" 
                      radius={[0, 4, 4, 0]} 
                      barSize={24}
                      fill="#e11d48" // Rose-600
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Staff Ranking */}
          <Card className="border-muted/40 shadow-sm flex flex-col">
            <CardHeader className="pb-4 border-b border-muted/20">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg font-semibold text-foreground">
                  Xếp hạng giới thiệu Freelancer
                </CardTitle>
              </div>
              <CardDescription className="text-sm text-muted-foreground">NV nội bộ giới thiệu Freelancer vào APEX</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-6 px-6">
              <div className="space-y-3">
                {mockReferrals.map((staff, i) => (
                  <div key={staff.id} className="flex gap-4 p-3 rounded-lg border border-transparent hover:border-muted/50 hover:bg-muted/10 transition-all">
                    {/* Rank Number */}
                    <div className="flex-shrink-0 mt-1">
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm", 
                        i === 0 ? "bg-amber-100 text-amber-600 ring-2 ring-amber-500/20" : 
                        i === 1 ? "bg-slate-200 text-slate-600 ring-1 ring-slate-400/20" : 
                        i === 2 ? "bg-orange-100 text-orange-600 ring-1 ring-orange-400/20" : 
                        "bg-muted text-muted-foreground"
                      )}>
                        {i + 1}
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 flex justify-between items-center">
                      <div className="flex flex-col">
                        <p className="font-medium text-base text-foreground">{staff.staffName}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{staff.role}</p>
                      </div>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-muted/20 transition-all text-right group min-w-[90px] justify-end focus:outline-none focus:ring-2 focus:ring-primary/20">
                            <div className="flex flex-col items-center">
                              <span className="font-semibold text-lg text-rose-600 leading-none group-hover:scale-110 transition-transform">{staff.count}</span>
                              <span className="text-xs text-muted-foreground mt-1 tracking-wide">giới thiệu</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </button>
                        </PopoverTrigger>
                          <PopoverContent align="end" className="w-80 p-0 overflow-hidden rounded-xl border-muted/50 shadow-lg">
                            <div className="bg-muted/30 px-4 py-3 border-b border-muted/50">
                              <p className="text-sm font-semibold text-foreground">Danh sách freelancer</p>
                              <p className="text-xs text-muted-foreground">Bởi {staff.staffName}</p>
                            </div>
                            <ScrollArea className="max-h-[300px]">
                              {staff.freelancers.length > 0 ? (
                                <div className="p-2 space-y-1">
                                  {staff.freelancers.map((fr) => (
                                    <div 
                                      key={fr.id} 
                                      onClick={() => setSelectedFreelancer(fr)}
                                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                                    >
                                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{fr.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{fr.date}</p>
                                      </div>
                                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-6 text-center text-muted-foreground text-sm">
                                  Chưa có người giới thiệu
                                </div>
                              )}
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Position CV Ranking */}
        <Card className="border-muted/40 shadow-sm flex flex-col">
          <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-muted/30 pt-6 px-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 text-rose-600 rounded-lg">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Vị trí được gửi CV nhiều nhất
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-0.5">Xếp hạng theo số lượng CV từ Freelancer</CardDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-foreground border-muted-foreground/30 rounded-full px-4 h-9"
                onClick={() => setShowAllPositions(!showAllPositions)}
              >
                {showAllPositions ? "Thu gọn" : "Xem thêm"} <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", showAllPositions && "rotate-180")} />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                {/* Chart Section */}
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={positionData} layout="vertical" margin={{ left: 20, right: 30, top: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="rgba(0,0,0,0.1)" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickCount={5} />
                      <YAxis 
                        dataKey="position" 
                        type="category" 
                        width={120} 
                        tick={{ fontSize: 12, fontWeight: 500, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'rgba(0,0,0,0.2)' }}
                        tickLine={{ stroke: 'rgba(0,0,0,0.2)' }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }} 
                        contentStyle={{ 
                          borderRadius: '8px', 
                          border: 'none', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          fontSize: '13px',
                          padding: '8px 14px'
                        }}
                        formatter={(value: number) => [`${value} CV`, "Số lượng"]}
                      />
                      <Bar 
                        dataKey="cvCount" 
                        radius={[0, 4, 4, 0]} 
                        barSize={32}
                      >
                        {positionData.map((entry, index) => {
                          const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={colors[index % colors.length]} 
                            />
                          )
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Table Section */}
                <div className="w-full h-full flex items-center pr-4">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-b border-muted/50 bg-muted/5">
                        <TableHead className="w-16 font-medium text-sm text-center text-muted-foreground">#</TableHead>
                        <TableHead className="font-medium text-sm text-muted-foreground text-center">Vị trí</TableHead>
                        <TableHead className="font-medium text-sm text-muted-foreground text-center">Công ty</TableHead>
                        <TableHead className="w-24 text-center font-medium text-sm text-muted-foreground">Số CV</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positionData.map((pos, idx) => {
                        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-emerald-500'];
                        return (
                          <TableRow key={idx} className="border-b border-muted-foreground/10 hover:bg-muted/10 transition-colors">
                            <TableCell className="text-center py-4">
                              <div className={cn("h-7 w-7 rounded-full text-white flex items-center justify-center font-medium text-sm mx-auto", colors[idx % colors.length])}>
                                {idx + 1}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium text-sm text-foreground">{pos.position}</TableCell>
                            <TableCell className="text-center text-muted-foreground text-sm">{pos.company || '-'}</TableCell>
                            <TableCell className="text-center text-rose-500 font-medium text-base">{pos.cvCount}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>
      
      <FreelancerDetailDialog 
        freelancer={selectedFreelancer} 
        open={!!selectedFreelancer} 
        onOpenChange={(open) => !open && setSelectedFreelancer(null)} 
      />
    </MainLayout>
  );
}
