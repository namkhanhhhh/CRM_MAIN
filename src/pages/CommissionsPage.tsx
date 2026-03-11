import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Search, Edit2, Download, CalendarRange, RotateCcw, Eye } from 'lucide-react';
import { mockAccountingRecords } from '@/data/accountingMockData';
import { computeBDCommission, computeHHCommission } from '@/types/accounting';
import { toast } from 'sonner';

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';

// Reusing constants for Month filtering
const MONTH_LABELS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];
const ALL_MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

interface StaffTarget {
  name: string;
  type: 'BD' | 'HH';
  kpi: number;
  bonusRate: number;
}

export default function CommissionsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonths, setSelectedMonths] = useState<number[]>(ALL_MONTHS);
  const [search, setSearch] = useState('');
  
  const [staffTargets, setStaffTargets] = useState<Record<string, StaffTarget>>(() => {
    try {
      const saved = localStorage.getItem('apex_staff_targets_v5');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('apex_staff_targets_v5', JSON.stringify(staffTargets));
  }, [staffTargets]);

  const [editStaff, setEditStaff] = useState<StaffTarget | null>(null);
  const [viewCasesStaff, setViewCasesStaff] = useState<{name: string, type: 'BD' | 'HH'} | null>(null);

  // Month filtering logic
  const toggleMonth = (m: number) => {
    setSelectedMonths(prev => {
      if (prev.includes(m)) {
        const next = prev.filter(x => x !== m);
        return next.length === 0 ? [m] : next;
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


  const staffData = useMemo(() => {
    const staffMap = new Map<string, {name: string, type: 'BD' | 'HH'}>();
    mockAccountingRecords.forEach(r => {
      if (r.overallStatus !== 'Reject') {
        if (r.bdName) staffMap.set(r.bdName, { name: r.bdName, type: 'BD' });
        if (r.ownerName) staffMap.set(r.ownerName, { name: r.ownerName, type: 'HH' });
      }
    });
    
    const year = Number(selectedYear);
    return Array.from(staffMap.values()).map(s => {
      const target = staffTargets[s.name] || { name: s.name, type: s.type, kpi: 0, bonusRate: 0 };
      
      const revenue = mockAccountingRecords
        .filter(r => {
          if (r.overallStatus === 'Reject') return false;
          const dateStr = r.onboardDate || r.offerDate;
          if (!dateStr) return false;
          
          const d = new Date(dateStr);
          if (d.getFullYear() !== year) return false;
          if (!selectedMonths.includes(d.getMonth())) return false;
          
          return s.type === 'BD' ? r.bdName === s.name : r.ownerName === s.name;
        })
        .reduce((sum, r) => sum + (s.type === 'BD' ? computeBDCommission(r) : computeHHCommission(r)), 0);

      const bonus = revenue > target.kpi ? (revenue - target.kpi) * (target.bonusRate / 100) : 0;
      return { ...s, revenue, target, bonus };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [selectedYear, selectedMonths, staffTargets]);

  const filtered = useMemo(() => {
    return staffData.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  }, [staffData, search]);

  const detailedCases = useMemo(() => {
    if (!viewCasesStaff) return [];
    const year = Number(selectedYear);
    return mockAccountingRecords.filter(r => {
      if (r.overallStatus === 'Reject') return false;
      const dateStr = r.onboardDate || r.offerDate;
      if (!dateStr) return false;
      
      const d = new Date(dateStr);
      if (d.getFullYear() !== year) return false;
      if (!selectedMonths.includes(d.getMonth())) return false;
      
      return viewCasesStaff.type === 'BD' ? r.bdName === viewCasesStaff.name : r.ownerName === viewCasesStaff.name;
    });
  }, [viewCasesStaff, selectedYear, selectedMonths]);

  const handleSave = () => {
    if (editStaff) {
      setStaffTargets(prev => ({ ...prev, [editStaff.name]: editStaff }));
      setEditStaff(null);
      toast.success('Đã cập nhật KPI thành công');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hoa hồng nhân sự</h1>
            <p className="text-sm text-muted-foreground">Hoa hồng = (Doanh số cá nhân thực hiện - KPI cá nhân) * Tỷ lệ</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear, currentYear - 1, currentYear - 2].map(y => <SelectItem key={y} value={String(y)}>Năm {y}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Multi-select month picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[140px] justify-start px-3">
                  <CalendarRange className="h-4 w-4 text-muted-foreground" />
                  {monthSummaryLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-3" align="end">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Chọn tháng</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={selectAll}>
                      Chọn tất cả
                    </Button>
                  </div>
                  <div className="flex gap-1.5">
                    {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
                      <Button key={q} variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => selectQ(i)}>
                        {q}
                      </Button>
                    ))}
                  </div>
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
              <Button variant="ghost" size="icon" onClick={handleReset} title="Reset">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}

            <Button variant="outline">
              <Download className="h-4 w-4 mr-1" /> Xuất Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm nhân sự..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9" 
            />
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead className="min-w-[150px] text-center">Nhân sự</TableHead>
                  <TableHead className="min-w-[100px] text-center">Chức vụ</TableHead>
                  <TableHead className="min-w-[150px] text-center">Doanh số cá nhân</TableHead>
                  <TableHead className="min-w-[150px] text-center">KPI Cá nhân</TableHead>
                  <TableHead className="min-w-[100px] text-center">Tỷ lệ (%)</TableHead>
                  <TableHead className="min-w-[150px] text-center">Hoa hồng</TableHead>
                  <TableHead className="w-[120px] text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s, idx) => (
                  <TableRow key={`${s.name}-${s.type}`}>
                    <TableCell className="font-medium text-center">{idx + 1}</TableCell>
                    <TableCell className="font-semibold text-center">{s.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={s.type === 'BD' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-purple-600 bg-purple-50 border-purple-200'}>
                        {s.type === 'BD' ? 'BD' : 'Headhunter'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">{formatVND(s.revenue)}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{formatVND(s.target.kpi)}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{s.target.bonusRate}%</TableCell>
                    <TableCell className="text-center font-bold text-green-600">{formatVND(s.bonus)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setViewCasesStaff({name: s.name, type: s.type})} title="Xem chi tiết các case">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setEditStaff(s.target)} title="Chỉnh sửa KPI">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy nhân sự
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={!!editStaff} onOpenChange={o => !o && setEditStaff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật KPI & Tỷ lệ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nhân sự</Label>
              <Input value={editStaff?.name || ''} disabled className="bg-muted font-semibold text-primary" />
            </div>
            <div className="space-y-2">
              <Label>Chức vụ</Label>
              <Input value={editStaff?.type === 'BD' ? 'BD' : 'Headhunter'} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>KPI Cá nhân (VNĐ)</Label>
              <Input 
                type="number" 
                value={editStaff?.kpi} 
                onChange={e => setEditStaff(prev => prev ? {...prev, kpi: Number(e.target.value)} : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tỷ lệ Hoa hồng (%)</Label>
              <Input 
                type="number" 
                value={editStaff?.bonusRate} 
                onChange={e => setEditStaff(prev => prev ? {...prev, bonusRate: Number(e.target.value)} : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStaff(null)}>Hủy</Button>
            <Button onClick={handleSave}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewCasesStaff} onOpenChange={o => !o && setViewCasesStaff(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Chi tiết doanh số phụ trách - <span className="text-primary">{viewCasesStaff?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="border rounded-lg overflow-x-auto max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="min-w-[120px] text-center">Khách hàng</TableHead>
                    <TableHead className="min-w-[150px] text-center">Vị trí</TableHead>
                    <TableHead className="min-w-[120px] text-center">Ứng viên</TableHead>
                    <TableHead className="min-w-[100px] text-center">Trạng thái</TableHead>
                    <TableHead className="min-w-[120px] text-center">Hoa hồng ghi nhận</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailedCases.map((r, i) => {
                    const commissionAmount = viewCasesStaff?.type === 'BD' ? computeBDCommission(r) : computeHHCommission(r);
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-semibold text-center">{r.clientName}</TableCell>
                        <TableCell className="text-center">{r.jobTitle}</TableCell>
                        <TableCell className="text-center">{r.candidateName}</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={`
                              ${r.overallStatus === 'Done' ? 'text-green-600 bg-green-50 border-green-200' : ''}
                              ${r.overallStatus === 'Doing' ? 'text-blue-600 bg-blue-50 border-blue-200' : ''}
                              ${r.overallStatus !== 'Done' && r.overallStatus !== 'Doing' ? 'bg-slate-50' : ''}
                            `}
                          >
                            {r.overallStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-primary">
                          {formatVND(commissionAmount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {detailedCases.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Không có dữ liệu trong khoảng thời gian này
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
