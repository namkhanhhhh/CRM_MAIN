import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronDown, ChevronRight, ChevronLeft, StickyNote, FileText, Plus, Pencil, CalendarIcon, X, AlertTriangle, Download } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { mockAccountingRecords } from '@/data/accountingMockData';
import {
  AccountingRecord,
  computeAmountVAT,
  computePaymentDeadline1,
  computePaymentDeadline2,
} from '@/types/accounting';
import { getDeadlineStatus } from '@/lib/deadlineUtils';
import { cn } from '@/lib/utils';
import { AddDebtDialog } from '@/components/accounting/AddDebtDialog';
import { EditDebtDialog } from '@/components/accounting/EditDebtDialog';
import { exportDebtToExcel } from '@/lib/exportDebtToExcel';
import { toast } from 'sonner';

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';
const formatDate = (d: string | null | undefined) => d || '—';

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }));
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => ({ value: String(currentYear - 2 + i), label: String(currentYear - 2 + i) }));

interface CompanyDebt {
  clientName: string;
  records: AccountingRecord[];
  totalDebt: number;
  totalPaid: number;
  endingBalance: number;
}

export default function AccountingDebtPage() {
  const [records, setRecords] = useState<AccountingRecord[]>(mockAccountingRecords);
  const [search, setSearch] = useState('');
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Date filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

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

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setFilterMonth('');
    setFilterYear('');
    setPage(1);
  };

  const hasFilters = dateFrom || dateTo || filterMonth || filterYear;

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
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      return;
    }

    if (selectedCases.size === 0) {
      toast.error('Vui lòng chọn ít nhất một case để xuất');
      return;
    }

    // Build export data from selected cases
    const selectedCompanies: { clientName: string; records: AccountingRecord[]; totalDebt: number; totalPaid: number; endingBalance: number }[] = [];

    companyDebts.forEach(company => {
      const selectedRecs = company.records.filter(r => selectedCases.has(r.id));
      if (selectedRecs.length === 0) return;
      const totalDebt = selectedRecs.reduce((sum, r) => sum + computeAmountVAT(r), 0);
      const totalPaid = selectedRecs.reduce((sum, r) => sum + r.paymentAmount1 + r.paymentAmount2, 0);
      selectedCompanies.push({
        clientName: company.clientName,
        records: selectedRecs,
        totalDebt,
        totalPaid,
        endingBalance: totalDebt - totalPaid,
      });
    });

    if (selectedCompanies.length === 0) {
      toast.error('Không có dữ liệu để xuất');
      return;
    }

    exportDebtToExcel(selectedCompanies);
    toast.success(`Đã xuất Excel cho ${selectedCases.size} case`);
    setIsSelectionMode(false);
    setSelectedCases(new Set());
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedCases(new Set());
  };

  const companyDebts = useMemo(() => {
    const activeRecords = records.filter(r => r.overallStatus !== 'Reject');

    const q = search.toLowerCase();
    let filtered = activeRecords.filter(r => {
      if (!q) return true;
      return r.clientName.toLowerCase().includes(q) || r.jobTitle.toLowerCase().includes(q) || r.ownerName.toLowerCase().includes(q);
    });

    // Date range filter (based on onboardDate)
    filtered = filtered.filter(r => {
      const refDate = r.onboardDate || r.offerDate;
      if (!refDate) return true;

      if (dateFrom && refDate < dateFrom) return false;
      if (dateTo && refDate > dateTo) return false;

      if (filterMonth || filterYear) {
        const d = new Date(refDate);
        if (filterMonth && (d.getMonth() + 1) !== parseInt(filterMonth)) return false;
        if (filterYear && d.getFullYear() !== parseInt(filterYear)) return false;
      }

      return true;
    });

    const grouped = new Map<string, AccountingRecord[]>();
    filtered.forEach(r => {
      const existing = grouped.get(r.clientName) || [];
      existing.push(r);
      grouped.set(r.clientName, existing);
    });

    const debts: CompanyDebt[] = [];
    grouped.forEach((recs, clientName) => {
      // Filter out individual records where balance is 0
      const activeRecs = recs.filter(r => {
        const debt = computeAmountVAT(r);
        const paid = r.paymentAmount1 + r.paymentAmount2;
        return (debt - paid) !== 0;
      });
      if (activeRecs.length === 0) return; // skip company if all records are settled
      const totalDebt = activeRecs.reduce((sum, r) => sum + computeAmountVAT(r), 0);
      const totalPaid = activeRecs.reduce((sum, r) => sum + r.paymentAmount1 + r.paymentAmount2, 0);
      const endingBalance = totalDebt - totalPaid;
      debts.push({ clientName, records: activeRecs, totalDebt, totalPaid, endingBalance });
    });

    debts.sort((a, b) => b.endingBalance - a.endingBalance);
    return debts;
  }, [records, search, dateFrom, dateTo, filterMonth, filterYear]);

  const totalPages = Math.max(1, Math.ceil(companyDebts.length / PAGE_SIZE));
  const pagedDebts = companyDebts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const grandTotalDebt = companyDebts.reduce((s, c) => s + c.totalDebt, 0);
  const grandTotalPaid = companyDebts.reduce((s, c) => s + c.totalPaid, 0);
  const grandEndingBalance = companyDebts.reduce((s, c) => s + c.endingBalance, 0);

  const toggleExpand = (name: string) => {
    setExpandedCompanies(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Công nợ</h1>
            <p className="text-sm text-muted-foreground">{companyDebts.length} khách hàng</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-sm py-1.5 px-3">
              <span className="text-muted-foreground mr-1">Nợ phát sinh:</span>
              <span className="font-semibold">{formatVND(grandTotalDebt)}</span>
            </Badge>
            <Badge variant="outline" className="text-sm py-1.5 px-3 border-green-300">
              <span className="text-muted-foreground mr-1">Đã TT:</span>
              <span className="font-semibold text-green-600">{formatVND(grandTotalPaid)}</span>
            </Badge>
            <Badge variant="outline" className="text-sm py-1.5 px-3 border-destructive/40">
              <span className="text-muted-foreground mr-1">Dư cuối kỳ:</span>
              <span className="font-semibold text-destructive">{formatVND(grandEndingBalance)}</span>
            </Badge>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-end gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm khách hàng, vị trí, nhân viên..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>

          <div className="flex items-end gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Từ ngày</label>
              <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="w-[140px] h-10 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Đến ngày</label>
              <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="w-[140px] h-10 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tháng</label>
              <Select value={filterMonth} onValueChange={v => { setFilterMonth(v); setPage(1); }}>
                <SelectTrigger className="w-[110px] h-10"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Năm</label>
              <Select value={filterYear} onValueChange={v => { setFilterYear(v); setPage(1); }}>
                <SelectTrigger className="w-[90px] h-10"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 px-2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4 mr-1" /> Xóa lọc
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {isSelectionMode ? (
              <>
                <Button onClick={cancelSelection} variant="ghost" className="h-10 text-muted-foreground">
                  Hủy
                </Button>
                <Button onClick={handleExport} className="h-10 bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-1" />
                  Xác nhận Xuất ({selectedCases.size})
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleExport} variant="outline" className="h-10 border-primary/40 text-primary hover:bg-primary/5">
                  <Download className="h-4 w-4 mr-1" />
                  Xuất Excel
                </Button>
                <Button onClick={() => setAddOpen(true)} className="h-10">
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
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[40px]"></TableHead>
                  {isSelectionMode && <TableHead className="w-[40px]"></TableHead>}
                  <TableHead className="min-w-[180px]">Khách hàng</TableHead>
                  <TableHead className="min-w-[80px] text-center">Số case</TableHead>
                  <TableHead className="min-w-[130px] text-right">Nợ phát sinh</TableHead>
                  <TableHead className="min-w-[130px] text-right">Đã thanh toán</TableHead>
                  <TableHead className="min-w-[130px] text-right">Số dư cuối kỳ</TableHead>
                  <TableHead className="min-w-[100px] text-center">Onboard</TableHead>
                  <TableHead className="min-w-[100px] text-center">Hạn TT1</TableHead>
                  <TableHead className="min-w-[100px] text-center">Hạn TT2</TableHead>
                  <TableHead className="min-w-[60px] text-center">Ghi chú</TableHead>
                  <TableHead className="min-w-[50px] text-center"></TableHead>
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
                    />
                  );
                })}
                {pagedDebts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isSelectionMode ? 12 : 11} className="text-center py-8 text-muted-foreground">
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
  company,
  isExpanded,
  onToggle,
  onUpdateNote,
  onEdit,
  selectedCases,
  onToggleCase,
  onToggleCompany,
  isCompanySelected,
  isCompanyPartial,
  isSelectionMode,
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
}) {
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
        <TableCell className="text-right font-medium">{formatVND(company.totalDebt)}</TableCell>
        <TableCell className="text-right font-medium text-green-600">{formatVND(company.totalPaid)}</TableCell>
        <TableCell className={`text-right font-bold ${company.endingBalance > 0 ? 'text-destructive' : 'text-green-600'}`}>
          {formatVND(company.endingBalance)}
        </TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
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
        />
      ))}
    </>
  );
}

function CaseDebtRow({
  record: r,
  onUpdateNote,
  onEdit,
  isSelected,
  onToggle,
  isSelectionMode,
}: {
  record: AccountingRecord;
  onUpdateNote: (id: string, note: string) => void;
  onEdit: (r: AccountingRecord, e: React.MouseEvent) => void;
  isSelected: boolean;
  onToggle: () => void;
  isSelectionMode: boolean;
}) {
  const vatAmount = computeAmountVAT(r);
  const paid = r.paymentAmount1 + r.paymentAmount2;
  const balance = vatAmount - paid;
  const deadline1 = computePaymentDeadline1(r);
  const deadline2 = computePaymentDeadline2(r);

  return (
    <TableRow className="bg-muted/20 text-xs border-l-2 border-l-primary/20">
      <TableCell></TableCell>
      {isSelectionMode && (
        <TableCell className="text-center">
          <Checkbox checked={isSelected} onCheckedChange={onToggle} />
        </TableCell>
      )}
      <TableCell>
        <div className="pl-4 space-y-1">
          <div className="font-medium text-foreground">{r.jobTitle}</div>
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-xs">
            <span className="text-muted-foreground">UV:</span>
            <span className="font-semibold text-primary">{r.candidateName}</span>
          </div>
        </div>
      </TableCell>
      <TableCell></TableCell>
      <TableCell className="text-right text-muted-foreground">{formatVND(vatAmount)}</TableCell>
      <TableCell className="text-right text-green-600">{formatVND(paid)}</TableCell>
      <TableCell className={`text-right font-semibold ${balance > 0 ? 'text-destructive' : 'text-green-600'}`}>
        {formatVND(balance)}
      </TableCell>
      <TableCell className="text-center text-muted-foreground">{formatDate(r.onboardDate)}</TableCell>
      <DeadlineTableCell date={deadline1} />
      <DeadlineTableCell date={deadline2} />
      <TableCell className="text-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 relative">
              <StickyNote className={`h-3.5 w-3.5 ${r.note ? 'text-amber-500' : 'text-muted-foreground'}`} />
              {r.note && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-500" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" onClick={e => e.stopPropagation()}>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <FileText className="h-3.5 w-3.5" />
                Ghi chú
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

function DeadlineTableCell({ date }: { date: string | null }) {
  const status = getDeadlineStatus(date);
  return (
    <TableCell className="text-center">
      {status === 'danger' ? (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive text-destructive-foreground font-bold text-xs">
          <AlertTriangle className="h-3.5 w-3.5" />
          {date || '—'}
        </span>
      ) : status === 'warning' ? (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 font-bold text-xs">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
          {date || '—'}
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">{date || '—'}</span>
      )}
    </TableCell>
  );
}
