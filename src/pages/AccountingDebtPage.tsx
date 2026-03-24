import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronDown, ChevronRight, ChevronLeft, StickyNote, FileText, Plus, Pencil, X, AlertTriangle, Download, MoreHorizontal } from 'lucide-react';
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
  status: 'urgent' | 'warning' | 'normal' 
} | null {
  const d1 = computePaymentDeadline1(r);
  const d2 = computePaymentDeadline2(r);
  const vatAmount = computeAmountVAT(r);
  const today = startOfDay(new Date());

  let unpaidAmount = 0;
  let deadline: string | null = null;
  let hasInstallment = false;

  const expected1 = vatAmount * 0.5;
  const expected2 = vatAmount * 0.5;

  if (d1 && sameMonthYear(d1, month, year)) {
    hasInstallment = true;
    if ((r.paymentAmount1 || 0) < expected1) {
      unpaidAmount += (expected1 - (r.paymentAmount1 || 0));
      deadline = d1;
    }
  }
  
  if (d2 && sameMonthYear(d2, month, year)) {
    hasInstallment = true;
    if ((r.paymentAmount2 || 0) < expected2) {
      unpaidAmount += (expected2 - (r.paymentAmount2 || 0));
      if (!deadline || d2 > deadline) deadline = d2;
    }
  }

  if (!hasInstallment || unpaidAmount <= 0) return null;

  let status: 'urgent' | 'warning' | 'normal' = 'normal';
  if (deadline) {
    const daysLeft = differenceInDays(parseISO(deadline), today);
    if (daysLeft <= 1) status = 'urgent';
    else if (daysLeft <= 5) status = 'warning';
  }

  return { amount: unpaidAmount, deadline, status };
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
        const paid = (r.paymentAmount1 || 0) + (r.paymentAmount2 || 0);
        return Math.round(debt - paid) > 0;
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

  // Total columns = 5 fixed + 2*3 monthly + 1 (action) + selection
  const colSpan = isSelectionMode ? (5 + monthCols.length * 2 + 1 + 1) : (5 + monthCols.length * 2 + 1);

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center flex-wrap gap-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Công nợ</h1>
              <p className="text-sm text-slate-500">{companyDebts.length} khách hàng</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-sm py-1.5 px-3 bg-white border-slate-200">
                <span className="text-slate-500 mr-1">Nợ phát sinh:</span>
                <span className="font-bold text-slate-800">{formatVND(grandTotalDebt)}</span>
              </Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-3 bg-green-50 border-green-200">
                <span className="text-slate-500 mr-1">Đã TT:</span>
                <span className="font-bold text-green-700">{formatVND(grandTotalPaid)}</span>
              </Badge>
              <Badge variant="outline" className="text-sm py-1.5 px-3 border-red-200 bg-red-50 text-red-600">
                <span className="text-slate-500 mr-1">Dư cuối kỳ:</span>
                <span className="font-bold">{formatVND(grandEndingBalance)}</span>
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isSelectionMode ? (
              <>
                <Button onClick={cancelSelection} variant="ghost" className="h-10 text-slate-500 text-sm font-semibold">Hủy</Button>
                <Button onClick={handleExport} className="h-10 bg-green-600 hover:bg-green-700 text-sm font-semibold shadow-sm px-4">
                  <Download className="h-4 w-4 mr-2" /> Xác nhận Xuất ({selectedCases.size})
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleExport} variant="outline" className="h-10 border-pink-200 text-pink-700 hover:bg-pink-50 text-sm font-semibold shadow-sm px-5 bg-white rounded-full transition-all">
                  <Download className="h-4 w-4 mr-2" /> Xuất Excel
                </Button>
                <Button onClick={() => setAddOpen(true)} className="h-10 text-sm font-semibold shadow-sm px-5 bg-pink-600 hover:bg-pink-700 text-white rounded-full transition-all">
                  <Plus className="h-4 w-4 mr-2" /> Thêm công nợ
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-4 flex-wrap my-2">
          <div className="relative flex-1 min-w-[300px] max-w-lg group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-400 group-focus-within:text-pink-600 transition-colors" />
            <Input
              placeholder="Tìm khách hàng, vị trí, nhân viên..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-11 h-11 text-sm shadow-sm border-pink-100 bg-pink-50/50 rounded-full focus-visible:ring-pink-500 transition-all"
            />
          </div>

          {/* Month pickers for 3 columns */}
          <div className="flex items-center gap-2 flex-wrap rounded-full bg-white border border-pink-100 shadow-sm p-1.5">
            <span className="text-sm text-pink-600 font-semibold px-3">Lọc theo tháng:</span>
            {monthCols.map((mc, idx) => (
              <div key={idx} className="flex items-center gap-1.5 border border-pink-100 rounded-full px-4 bg-pink-50/50 h-9 transition-colors hover:border-pink-300">
                <Select value={String(mc.month)} onValueChange={v => updateMonthCol(idx, 'month', Number(v))}>
                  <SelectTrigger className="h-full w-[80px] border-0 bg-transparent shadow-none p-0 text-sm font-bold text-pink-700 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS_LIST.map(m => (
                      <SelectItem key={m.value} value={String(m.value)} className="text-sm">{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-pink-300 font-medium">/</span>
                <Select value={String(mc.year)} onValueChange={v => updateMonthCol(idx, 'year', Number(v))}>
                  <SelectTrigger className="h-full w-[60px] border-0 bg-transparent shadow-none p-0 text-sm font-semibold text-slate-700 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => (
                      <SelectItem key={y} value={String(y)} className="text-sm">{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <Button variant="ghost" onClick={resetMonths} className="h-9 px-4 text-xs font-semibold text-pink-600 hover:text-pink-800 hover:bg-pink-100 rounded-full ml-1 transition-all">
              <X className="h-3.5 w-3.5 mr-1" /> Mặc định
            </Button>
          </div>
        </div>

        {/* Debt Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {/* Row 1: Group header "Dự kiến thu công nợ theo tháng" */}
                <TableRow className="bg-pink-100/80 hover:bg-pink-100/80 border-b border-pink-200">
                  {/* empty cells for fixed columns */}
                  <TableHead className="w-[32px] border-r border-pink-200" rowSpan={2}></TableHead>
                  {isSelectionMode && <TableHead className="w-[40px] border-r border-pink-200" rowSpan={2}></TableHead>}
                  <TableHead className="min-w-[180px] border-r border-pink-200 text-pink-900" rowSpan={2}>
                    <span className="font-bold text-[13px]">Tên khách hàng</span>
                  </TableHead>
                  <TableHead className="w-[80px] text-center border-r border-pink-200 text-pink-900" rowSpan={2}>
                    <span className="font-bold text-[13px]">Số case</span>
                  </TableHead>
                  <TableHead className="min-w-[130px] text-right border-r border-pink-200 text-pink-900" rowSpan={2}>
                    <span className="font-bold text-[13px]">Nợ phát sinh</span>
                  </TableHead>
                  {/* Monthly group spanning */}
                  <TableHead
                    colSpan={monthCols.length * 2}
                    className="text-center border-l border-r border-b border-pink-200 font-bold text-[14px] py-3 text-pink-900"
                  >
                    Dự kiến thu công nợ theo tháng
                  </TableHead>
                  <TableHead className="w-[48px] text-center border-l border-pink-200 text-pink-900" rowSpan={2}>
                    <span className="font-bold text-[13px] block">Trạng thái</span>
                  </TableHead>
                </TableRow>
                {/* Row 2: Per-month sub-headers */}
                <TableRow className="bg-pink-50/60 hover:bg-pink-50/60">
                  {monthCols.map((mc, idx) => (
                    <React.Fragment key={idx}>
                      <TableHead className={cn("min-w-[110px] text-center border-l border-b border-pink-200", idx === 0 && "border-l-2")}>
                        <div className="font-bold text-pink-800 text-[13px] mb-0.5 whitespace-nowrap">Tháng {mc.month}/{mc.year}</div>
                        <div className="text-[11px] font-semibold text-pink-600/80 mt-1">Số tiền</div>
                      </TableHead>
                      <TableHead className="min-w-[110px] text-center border-r border-b border-pink-200">
                        <div className="text-[11px] font-semibold text-pink-600/80 mt-5">Ngày đến hạn dự kiến</div>
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
                  <TableRow className="bg-pink-100/60 font-bold border-t border-pink-200 hover:bg-pink-100/60">
                    <TableCell></TableCell>
                    {isSelectionMode && <TableCell></TableCell>}
                    <TableCell className="font-bold text-pink-900 uppercase text-[13px] text-center" colSpan={2}>TỔNG</TableCell>
                    <TableCell className="text-right font-bold text-sm text-pink-900">
                      {formatVND(grandTotalDebt)}
                    </TableCell>
                    {monthCols.map((_mc, idx) => (
                      <React.Fragment key={idx}>
                        <TableCell className="text-center font-bold text-sm border-l border-pink-200 text-pink-900">
                          {monthlyTotals[idx] > 0 ? formatVND(monthlyTotals[idx]) : ''}
                        </TableCell>
                        <TableCell className="border-r border-pink-200"></TableCell>
                      </React.Fragment>
                    ))}
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
        className="cursor-pointer bg-pink-50/30 hover:bg-pink-50/60 transition-colors border-y border-pink-100"
        onClick={onToggle}
      >
        <TableCell className="text-center w-[32px] border-r border-pink-100">
          {isExpanded
            ? <ChevronDown className="h-4 w-4 text-pink-500 mx-auto" />
            : <ChevronRight className="h-4 w-4 text-pink-400 mx-auto" />
          }
        </TableCell>
        {isSelectionMode && (
          <TableCell className="text-center w-[40px] border-r border-pink-100" onClick={e => e.stopPropagation()}>
            <Checkbox
              checked={isCompanySelected ? true : isCompanyPartial ? 'indeterminate' : false}
              onCheckedChange={() => onToggleCompany(company)}
            />
          </TableCell>
        )}
        <TableCell className="font-bold text-pink-900/90 text-[14px] italic border-r border-pink-100">
          {company.clientName}
        </TableCell>
        <TableCell className="text-center border-r border-pink-100">
          <span className="text-[13px] font-medium text-pink-800/80">{company.records.length}</span>
        </TableCell>
        <TableCell className="text-right border-r border-pink-100">
          <span className="font-bold text-pink-800">{formatVND(company.totalDebt)}</span>
        </TableCell>
        {monthCols.map((mc, idx) => (
          <React.Fragment key={idx}>
            <TableCell className="text-center border-l border-pink-100">
              {companyMonthlyTotals[idx] > 0
                ? <span className="font-bold text-red-500/90">{formatVND(companyMonthlyTotals[idx])}</span>
                : null}
            </TableCell>
            <TableCell className="border-r border-pink-100"></TableCell>
          </React.Fragment>
        ))}
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
    <TableRow className="bg-white hover:bg-slate-50 transition-colors text-[13px] border-b border-slate-100 border-l border-l-transparent">
      <TableCell className="w-[32px] border-r border-slate-200"></TableCell>
      {isSelectionMode && (
        <TableCell className="text-center w-[40px] border-r border-slate-200">
          <Checkbox checked={isSelected} onCheckedChange={onToggle} />
        </TableCell>
      )}
      <TableCell className="border-r border-slate-200 py-2.5 px-3">
        <div className="flex flex-col gap-1">
          <div className="text-slate-800">{r.jobTitle}</div>
        </div>
      </TableCell>
      <TableCell className="border-r border-slate-200 py-2.5 px-3 text-center">
        <div className="text-slate-800">{r.candidateName}</div>
      </TableCell>
      <TableCell className={`text-right border-r border-slate-200 py-2.5 px-3 font-medium ${balance > 0 ? 'text-red-600' : 'text-slate-800'}`}>
        {formatVND(balance)}
      </TableCell>
      {monthCols.map((mc, idx) => {
        const mp = getMonthlyPayment(r, mc.month, mc.year);
        if (!mp) return (
          <React.Fragment key={idx}>
            <TableCell className="border-l border-slate-200 py-2.5 px-3"></TableCell>
            <TableCell className="border-r border-slate-200 py-2.5 px-3"></TableCell>
          </React.Fragment>
        );

        const { amount, deadline, status } = mp;

        let bgColorClass = "bg-transparent";
        if (status === 'urgent') bgColorClass = "bg-red-100/50";
        if (status === 'warning') bgColorClass = "bg-yellow-100/50";

        return (
          <React.Fragment key={idx}>
            <TableCell className={`text-center border-l border-slate-200 py-2.5 px-3 ${bgColorClass}`}>
              <span className={cn(
                "font-semibold",
                status === 'urgent' ? "text-red-700" :
                status === 'warning' ? "text-yellow-700" : "text-slate-700"
              )}>
                {formatVND(amount)}
              </span>
            </TableCell>
            <TableCell className={`text-center border-r border-slate-200 py-2.5 px-3 ${bgColorClass}`}>
              <span className={cn(
                "font-medium",
                status === 'urgent' ? "text-red-700" :
                status === 'warning' ? "text-yellow-700" : "text-slate-600"
              )}>
                {formatDate(deadline)}
              </span>
            </TableCell>
          </React.Fragment>
        );
      })}
      <TableCell className="text-center w-[48px]">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative hover:bg-slate-200">
              <MoreHorizontal className="h-4 w-4 text-slate-600" />
              {r.note && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 border border-white" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end" onClick={e => e.stopPropagation()}>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <Pencil className="h-3.5 w-3.5 text-blue-600" /> Chỉnh sửa
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs" onClick={e => onEdit(r, e)}>
                  Mở form sửa chi tiết
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <FileText className="h-3.5 w-3.5 text-amber-500" /> Ghi chú nhanh
                </div>
                <Textarea
                  placeholder="Nhập ghi chú..."
                  value={r.note || ''}
                  onChange={e => onUpdateNote(r.id, e.target.value)}
                  className="text-xs min-h-[60px] resize-none"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </TableCell>
    </TableRow>
  );
}
