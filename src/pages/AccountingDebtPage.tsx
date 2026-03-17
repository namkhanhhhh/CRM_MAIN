import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronDown, ChevronRight, ChevronLeft, StickyNote, FileText, Plus, Pencil, X, AlertTriangle, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { mockAccountingRecords } from '@/data/accountingMockData';
import {
  AccountingRecord,
  computeAmountVAT,
  computePaymentDeadline1,
  computePaymentDeadline2,
} from '@/types/accounting';
import { cn } from '@/lib/utils';
import { AddDebtDialog } from '@/components/accounting/AddDebtDialog';
import { EditDebtDialog } from '@/components/accounting/EditDebtDialog';
import { exportDebtToExcel } from '@/lib/exportDebtToExcel';
import { toast } from 'sonner';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n));
const formatDate = (d: string | null | undefined) => d || '—';

// Month/year helpers
function getMonthYear(date: string | null): { month: number; year: number } | null {
  if (!date) return null;
  const d = new Date(date);
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

function sameMonthYear(date: string | null, month: number, year: number): boolean {
  const my = getMonthYear(date);
  if (!my) return false;
  return my.month === month && my.year === year;
}

// For a record, compute how much is expected in a given month and its status
function getMonthlyPayment(r: AccountingRecord, month: number, year: number): { 
  amount: number; 
  deadline: string | null; 
  status: 'paid' | 'urgent' | 'warning' | 'normal' 
} | null {
  const d1 = computePaymentDeadline1(r);
  const d2 = computePaymentDeadline2(r);
  const vatAmount = computeAmountVAT(r);
  const today = startOfDay(new Date());

  let amount = 0;
  let deadline: string | null = null;
  let isPaidInMonth = true; // Assume true, set to false if any installment in this month is unpaid
  let hasInstallment = false;

  const amt1 = r.paymentAmount1 || vatAmount * 0.5;
  const amt2 = r.paymentAmount2 || vatAmount * 0.5;

  if (d1 && sameMonthYear(d1, month, year)) {
    hasInstallment = true;
    amount += amt1;
    deadline = d1;
    if (!(r.paymentAmount1 > 0)) isPaidInMonth = false;
  }
  
  if (d2 && sameMonthYear(d2, month, year)) {
    hasInstallment = true;
    amount += amt2;
    if (!deadline || (d2 > deadline)) deadline = d2;
    if (!(r.paymentAmount2 > 0)) isPaidInMonth = false;
  }

  if (!hasInstallment) return null;

  let status: 'paid' | 'urgent' | 'warning' | 'normal' = 'normal';
  if (isPaidInMonth) {
    status = 'paid';
  } else if (deadline) {
    const daysLeft = differenceInDays(parseISO(deadline), today);
    if (daysLeft <= 1) status = 'urgent'; // Covers overdue, today, and tomorrow
    else if (daysLeft <= 5) status = 'warning';
  }

  return { amount, deadline, status };
}

const currentDate = new Date();
const MONTHS_LIST = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));
const currentYear = currentDate.getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

interface MonthCol { month: number; year: number; }
interface CompanyDebt {
  clientName: string;
  records: AccountingRecord[];
  totalDebt: number;
  totalPaid: number;
  endingBalance: number;
}

function getDefault3Months(): MonthCol[] {
  const now = new Date();
  const result: MonthCol[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    result.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }
  return result;
}

const MONTH_NAMES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function AccountingDebtPage() {
  const [records, setRecords] = useState<AccountingRecord[]>(mockAccountingRecords);
  const [search, setSearch] = useState('');
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Month columns selector (3 months)
  const [monthCols, setMonthCols] = useState<MonthCol[]>(getDefault3Months());

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AccountingRecord | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const updateNote = (id: string, note: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, note } : r));
  };

  const handleAdd = (record: AccountingRecord) => {
    setRecords(prev => [record, ...prev]);
  };

  const handleEdit = (record: AccountingRecord) => {
    setRecords(prev => prev.map(r => r.id === record.id ? record : r));
  };

  const openEdit = (r: AccountingRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditRecord(r);
    setEditOpen(true);
  };

  // Selection helpers
  const toggleCase = (id: string) => {
    setSelectedCases(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleCompany = (company: CompanyDebt) => {
    setSelectedCases(prev => {
      const next = new Set(prev);
      const allSelected = company.records.every(r => prev.has(r.id));
      company.records.forEach(r => {
        if (allSelected) next.delete(r.id); else next.add(r.id);
      });
      return next;
    });
  };

  const isCompanySelected = (company: CompanyDebt) =>
    company.records.length > 0 && company.records.every(r => selectedCases.has(r.id));

  const isCompanyPartial = (company: CompanyDebt) =>
    company.records.some(r => selectedCases.has(r.id)) && !isCompanySelected(company);

  const handleExport = () => {
    if (!isSelectionMode) { setIsSelectionMode(true); return; }
    if (selectedCases.size === 0) { toast.error('Vui lòng chọn ít nhất một case để xuất'); return; }
    const selectedCompanies: { clientName: string; records: AccountingRecord[]; totalDebt: number; totalPaid: number; endingBalance: number }[] = [];
    companyDebts.forEach(company => {
      const selectedRecs = company.records.filter(r => selectedCases.has(r.id));
      if (selectedRecs.length === 0) return;
      const totalDebt = selectedRecs.reduce((sum, r) => sum + computeAmountVAT(r), 0);
      const totalPaid = selectedRecs.reduce((sum, r) => sum + r.paymentAmount1 + r.paymentAmount2, 0);
      selectedCompanies.push({ clientName: company.clientName, records: selectedRecs, totalDebt, totalPaid, endingBalance: totalDebt - totalPaid });
    });
    if (selectedCompanies.length === 0) { toast.error('Không có dữ liệu để xuất'); return; }
    exportDebtToExcel(selectedCompanies);
    toast.success(`Đã xuất Excel cho ${selectedCases.size} case`);
    setIsSelectionMode(false);
    setSelectedCases(new Set());
  };

  const cancelSelection = () => { setIsSelectionMode(false); setSelectedCases(new Set()); };

  const companyDebts = useMemo(() => {
    const activeRecords = records.filter(r => r.overallStatus !== 'Reject');
    const q = search.toLowerCase();
    let filtered = activeRecords.filter(r => {
      if (!q) return true;
      return r.clientName.toLowerCase().includes(q) || r.jobTitle.toLowerCase().includes(q) || r.ownerName.toLowerCase().includes(q);
    });

    const grouped = new Map<string, AccountingRecord[]>();
    filtered.forEach(r => {
      const existing = grouped.get(r.clientName) || [];
      existing.push(r);
      grouped.set(r.clientName, existing);
    });

    const debts: CompanyDebt[] = [];
    grouped.forEach((recs, clientName) => {
      const activeRecs = recs.filter(r => {
        const debt = computeAmountVAT(r);
        const paid = r.paymentAmount1 + r.paymentAmount2;
        return (debt - paid) !== 0;
      });
      if (activeRecs.length === 0) return;
      const totalDebt = activeRecs.reduce((sum, r) => sum + computeAmountVAT(r), 0);
      const totalPaid = activeRecs.reduce((sum, r) => sum + r.paymentAmount1 + r.paymentAmount2, 0);
      const endingBalance = totalDebt - totalPaid;
      debts.push({ clientName, records: activeRecs, totalDebt, totalPaid, endingBalance });
    });

    debts.sort((a, b) => b.endingBalance - a.endingBalance);
    return debts;
  }, [records, search]);

  const totalPages = Math.max(1, Math.ceil(companyDebts.length / PAGE_SIZE));
  const pagedDebts = companyDebts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const grandTotalDebt = companyDebts.reduce((s, c) => s + c.totalDebt, 0);
  const grandTotalPaid = companyDebts.reduce((s, c) => s + c.totalPaid, 0);
  const grandEndingBalance = companyDebts.reduce((s, c) => s + c.endingBalance, 0);

  // Monthly totals for footer
  const monthlyTotals = monthCols.map(mc => {
    let total = 0;
    companyDebts.forEach(company => {
      company.records.forEach(r => {
        const mp = getMonthlyPayment(r, mc.month, mc.year);
        if (mp) total += mp.amount;
      });
    });
    return total;
  });

  const toggleExpand = (name: string) => {
    setExpandedCompanies(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  // Month column selector handlers
  const updateMonthCol = (idx: number, field: 'month' | 'year', val: number) => {
    setMonthCols(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const resetMonths = () => setMonthCols(getDefault3Months());

  // Total columns = 5 fixed + 2*3 monthly + 2 (note + edit) + selection
  const colSpan = isSelectionMode ? (5 + monthCols.length * 2 + 2 + 1) : (5 + monthCols.length * 2 + 2);

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Công nợ</h1>
            <p className="text-sm text-muted-foreground">{companyDebts.length} khách hàng</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-sm py-1.5 px-3">
              <span className="text-muted-foreground mr-1">Nợ phát sinh:</span>
              <span className="font-semibold">{formatVND(grandTotalDebt)} ₫</span>
            </Badge>
            <Badge variant="outline" className="text-sm py-1.5 px-3 border-green-300">
              <span className="text-muted-foreground mr-1">Đã TT:</span>
              <span className="font-semibold text-green-600">{formatVND(grandTotalPaid)} ₫</span>
            </Badge>
            <Badge variant="outline" className="text-sm py-1.5 px-3 border-destructive/40 text-destructive">
              <span className="text-muted-foreground mr-1">Dư cuối kỳ:</span>
              <span className="font-bold">{formatVND(grandEndingBalance)} ₫</span>
            </Badge>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm khách hàng, vị trí, nhân viên..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>

          {/* Month pickers for 3 columns */}
          <div className="flex items-center gap-2 flex-wrap rounded-lg">
            <span className="text-xs text-muted-foreground font-medium">Lọc theo tháng:</span>
            {monthCols.map((mc, idx) => (
              <div key={idx} className="flex items-center gap-1 border rounded-md px-2 py-1 bg-muted/20">
                <Select value={String(mc.month)} onValueChange={v => updateMonthCol(idx, 'month', Number(v))}>
                  <SelectTrigger className="h-6 w-[80px] border-0 bg-transparent shadow-none p-0 text-xs font-semibold text-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS_LIST.map(m => (
                      <SelectItem key={m.value} value={String(m.value)} className="text-xs">{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">/</span>
                <Select value={String(mc.year)} onValueChange={v => updateMonthCol(idx, 'year', Number(v))}>
                  <SelectTrigger className="h-6 w-[60px] border-0 bg-transparent shadow-none p-0 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => (
                      <SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={resetMonths} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5 mr-1" /> Mặc định
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {isSelectionMode ? (
              <>
                <Button onClick={cancelSelection} variant="ghost" className="h-9 text-muted-foreground">Hủy</Button>
                <Button onClick={handleExport} className="h-9 bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-1" /> Xác nhận Xuất ({selectedCases.size})
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleExport} variant="outline" className="h-9 border-primary/40 text-primary hover:bg-primary/5">
                  <Download className="h-4 w-4 mr-1" /> Xuất Excel
                </Button>
                <Button onClick={() => setAddOpen(true)} className="h-9">
                  <Plus className="h-4 w-4 mr-1" /> Thêm công nợ
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Debt Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {/* Row 1: Group header "Dự kiến thu công nợ theo tháng" */}
                <TableRow className="bg-muted/50 border-b-0">
                  {/* empty cells for fixed columns */}
                  <TableHead className="w-[50px] border-r" rowSpan={2}></TableHead>
                  {isSelectionMode && <TableHead className="w-[40px] border-r" rowSpan={2}></TableHead>}
                  <TableHead className="min-w-[180px] border-r" rowSpan={2}>
                    <span className="font-semibold text-foreground">Khách hàng</span>
                  </TableHead>
                  <TableHead className="w-[70px] text-center border-r" rowSpan={2}>
                    <span className="font-semibold text-foreground">Số case</span>
                  </TableHead>
                  <TableHead className="min-w-[120px] text-right border-r" rowSpan={2}>
                    <span className="font-semibold text-foreground">Nợ phát sinh</span>
                  </TableHead>
                  {/* Monthly group spanning */}
                  <TableHead
                    colSpan={monthCols.length * 2}
                    className="text-center border-l border-r border-b font-bold text-xs py-2 uppercase tracking-wide text-primary bg-primary/5"
                  >
                    Dự kiến thu công nợ theo tháng
                  </TableHead>
                  <TableHead className="w-[50px] text-center border-l" rowSpan={2}></TableHead>
                  <TableHead className="w-[50px] text-center" rowSpan={2}></TableHead>
                </TableRow>
                {/* Row 2: Per-month sub-headers */}
                <TableRow className="bg-muted/50">
                  {monthCols.map((mc, idx) => (
                    <React.Fragment key={idx}>
                      <TableHead className={cn("min-w-[110px] text-center border-l border-b", idx === 0 && "border-l-2")}>
                        <div className="font-semibold text-xs mb-0.5 whitespace-nowrap">Tháng {mc.month}/{mc.year}</div>
                        <div className="text-[10px] font-medium text-muted-foreground">Số tiền</div>
                      </TableHead>
                      <TableHead className="min-w-[110px] text-center border-r border-b">
                        <div className="text-[10px] font-medium text-muted-foreground mt-4">Ngày đến hạn dự kiến</div>
                      </TableHead>
                    </React.Fragment>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {pagedDebts.map(company => {
                  const isExpanded = expandedCompanies.has(company.clientName);
                  return (
                    <CompanyDebtRow
                      key={company.clientName}
                      company={company}
                      isExpanded={isExpanded}
                      onToggle={() => toggleExpand(company.clientName)}
                      onUpdateNote={updateNote}
                      onEdit={openEdit}
                      selectedCases={selectedCases}
                      onToggleCase={toggleCase}
                      onToggleCompany={toggleCompany}
                      isCompanySelected={isCompanySelected(company)}
                      isCompanyPartial={isCompanyPartial(company)}
                      isSelectionMode={isSelectionMode}
                      monthCols={monthCols}
                    />
                  );
                })}

                {/* TỔNG row */}
                {pagedDebts.length > 0 && (
                  <TableRow className="bg-muted font-bold">
                    <TableCell></TableCell>
                    {isSelectionMode && <TableCell></TableCell>}
                    <TableCell className="font-semibold text-foreground uppercase text-xs">Tổng cộng</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold text-sm">
                      {formatVND(grandTotalDebt)} ₫
                    </TableCell>
                    {monthCols.map((_mc, idx) => (
                      <React.Fragment key={idx}>
                        <TableCell className="text-center font-bold text-sm border-l">
                          {monthlyTotals[idx] > 0 ? formatVND(monthlyTotals[idx]) : ''}
                        </TableCell>
                        <TableCell className="border-r"></TableCell>
                      </React.Fragment>
                    ))}
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}

                {pagedDebts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={colSpan} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy dữ liệu công nợ
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Trang {page} / {totalPages} ({companyDebts.length} khách hàng)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Trước
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Tiếp <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <AddDebtDialog open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} existingRecords={records} />
      <EditDebtDialog record={editRecord} open={editOpen} onOpenChange={setEditOpen} onSave={handleEdit} />
    </MainLayout>
  );
}

function CompanyDebtRow({
  company, isExpanded, onToggle, onUpdateNote, onEdit,
  selectedCases, onToggleCase, onToggleCompany,
  isCompanySelected, isCompanyPartial, isSelectionMode, monthCols,
}: {
  company: CompanyDebt;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateNote: (id: string, note: string) => void;
  onEdit: (r: AccountingRecord, e: React.MouseEvent) => void;
  selectedCases: Set<string>;
  onToggleCase: (id: string) => void;
  onToggleCompany: (company: CompanyDebt) => void;
  isCompanySelected: boolean;
  isCompanyPartial: boolean;
  isSelectionMode: boolean;
  monthCols: MonthCol[];
}) {
  // Company-level monthly totals
  const companyMonthlyTotals = monthCols.map(mc => {
    let total = 0;
    company.records.forEach(r => {
      const mp = getMonthlyPayment(r, mc.month, mc.year);
      if (mp) total += mp.amount;
    });
    return total;
  });

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/60 transition-colors font-medium"
        onClick={onToggle}
      >
        <TableCell className="text-center">
          {isExpanded
            ? <ChevronDown className="h-4 w-4 text-muted-foreground mx-auto" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground mx-auto" />
          }
        </TableCell>
        {isSelectionMode && (
          <TableCell className="text-center" onClick={e => e.stopPropagation()}>
            <Checkbox
              checked={isCompanySelected ? true : isCompanyPartial ? 'indeterminate' : false}
              onCheckedChange={() => onToggleCompany(company)}
            />
          </TableCell>
        )}
        <TableCell className="font-semibold text-foreground">{company.clientName}</TableCell>
        <TableCell className="text-center">
          <Badge variant="secondary" className="text-xs">{company.records.length}</Badge>
        </TableCell>
        <TableCell className="text-right font-medium">{formatVND(company.totalDebt)} ₫</TableCell>
        {monthCols.map((mc, idx) => (
          <React.Fragment key={idx}>
            <TableCell className="text-center border-l">
              {companyMonthlyTotals[idx] > 0
                ? <span className="font-semibold text-primary">{formatVND(companyMonthlyTotals[idx])}</span>
                : null}
            </TableCell>
            <TableCell className="border-r"></TableCell>
          </React.Fragment>
        ))}
        <TableCell></TableCell>
        <TableCell></TableCell>
      </TableRow>

      {isExpanded && company.records.map(r => (
        <CaseDebtRow
          key={r.id}
          record={r}
          onUpdateNote={onUpdateNote}
          onEdit={onEdit}
          isSelected={selectedCases.has(r.id)}
          onToggle={() => onToggleCase(r.id)}
          isSelectionMode={isSelectionMode}
          monthCols={monthCols}
        />
      ))}
    </>
  );
}

function CaseDebtRow({
  record: r, onUpdateNote, onEdit, isSelected, onToggle, isSelectionMode, monthCols,
}: {
  record: AccountingRecord;
  onUpdateNote: (id: string, note: string) => void;
  onEdit: (r: AccountingRecord, e: React.MouseEvent) => void;
  isSelected: boolean;
  onToggle: () => void;
  isSelectionMode: boolean;
  monthCols: MonthCol[];
}) {
  const vatAmount = computeAmountVAT(r);
  const paid = r.paymentAmount1 + r.paymentAmount2;
  const balance = vatAmount - paid;

  return (
    <TableRow className="bg-muted/20 text-xs border-l-2 border-l-primary/20">
      <TableCell></TableCell>
      {isSelectionMode && (
        <TableCell className="text-center">
          <Checkbox checked={isSelected} onCheckedChange={onToggle} />
        </TableCell>
      )}
      <TableCell>
        <div className="pl-4 py-1">
          <div className="font-semibold text-foreground text-xs uppercase leading-tight">{r.jobTitle}</div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold border border-primary/20">
              UV: {r.candidateName}
            </span>
            <span className="text-muted-foreground text-[10px]">Onboard: {formatDate(r.onboardDate)}</span>
          </div>
        </div>
      </TableCell>
      <TableCell></TableCell>
      <TableCell className={`text-right font-semibold ${balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
        {formatVND(balance)} ₫
      </TableCell>
      {monthCols.map((mc, idx) => {
        const mp = getMonthlyPayment(r, mc.month, mc.year);
        if (!mp) return (
          <React.Fragment key={idx}>
            <TableCell className="border-l"></TableCell>
            <TableCell className="border-r bg-muted/5"></TableCell>
          </React.Fragment>
        );

        const { amount, deadline, status } = mp;

        return (
          <React.Fragment key={idx}>
            <TableCell className={cn(
               "text-center border-l",
               status === 'paid' && "bg-green-50/50"
            )}>
              <span className={cn(
                "font-medium",
                status === 'paid' ? "text-green-600" : 
                status === 'urgent' ? "text-destructive font-bold" :
                status === 'warning' ? "text-yellow-600 font-bold" : "text-foreground"
              )}>
                {formatVND(amount)}
              </span>
            </TableCell>
            <TableCell className={cn(
              "text-center border-r",
              status === 'paid' ? "bg-green-50/50" : "bg-muted/5"
            )}>
              <div className="flex flex-col items-center">
                <span className={cn(
                  "text-xs font-bold leading-none",
                  status === 'paid' ? "text-green-600" :
                  status === 'urgent' ? "text-destructive" :
                  status === 'warning' ? "text-yellow-600" : "text-slate-600"
                )}>
                  {deadline}
                </span>
                {status === 'paid' ? (
                  <span className="text-[8px] font-bold uppercase text-green-600 mt-1 px-1 bg-green-100 rounded">Đã trả</span>
                ) : status === 'urgent' ? (
                  <span className="text-[8px] font-bold uppercase text-destructive mt-1 px-1 bg-red-100 rounded">Quá hạn/Sắp hạn</span>
                ) : status === 'warning' ? (
                  <span className="text-[8px] font-bold uppercase text-amber-600 mt-1 px-1 bg-yellow-100 rounded">Gần hạn</span>
                ) : null}
              </div>
            </TableCell>
          </React.Fragment>
        );
      })}
      <TableCell className="text-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 relative">
              <StickyNote className={`h-3.5 w-3.5 ${r.note ? 'text-amber-500' : 'text-muted-foreground'}`} />
              {r.note && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" onClick={e => e.stopPropagation()}>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <FileText className="h-3.5 w-3.5" /> Ghi chú
              </div>
              <Textarea
                placeholder="Nhập ghi chú..."
                value={r.note || ''}
                onChange={e => onUpdateNote(r.id, e.target.value)}
                className="text-xs min-h-[60px] resize-none"
              />
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell className="text-center">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => onEdit(r, e)}>
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
