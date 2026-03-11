import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Plus, ChevronLeft, ChevronRight, ChevronDown, Filter, Eye, Edit2, Star } from 'lucide-react';
import { mockAccountingRecords } from '@/data/accountingMockData';
import {
  AccountingRecord,
  OverallStatus,
  InvoiceStatus,
  PaymentStatus,
  computeAmountNoVAT,
  computeAmountVAT,
  computeRemainingPayment,
} from '@/types/accounting';

const overallStatusOptions: OverallStatus[] = ['Doing', 'Done', 'Reject'];
const invoiceStatusOptions: InvoiceStatus[] = ['Đã xuất', 'Chưa xuất'];
const paymentStatusOptions: PaymentStatus[] = ['Pending', 'Doing', 'Done'];
const paymentStatusColors: Record<PaymentStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Doing: 'bg-blue-100 text-blue-700',
  Done: 'bg-green-100 text-green-700',
};
import { AccountingDetailDialog } from '@/components/accounting/AccountingDetailDialog';
import { AccountingEditDialog } from '@/components/accounting/AccountingEditDialog';
import { AddAccountingDialog } from '@/components/accounting/AddAccountingDialog';

const PAGE_SIZE = 15;
const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';
const formatDate = (d: string | null | undefined) => d || '—';

const statusColors: Record<OverallStatus, string> = {
  Doing: 'bg-blue-100 text-blue-700',
  Done: 'bg-green-100 text-green-700',
  Reject: 'bg-red-100 text-red-700',
};
const invoiceColors: Record<InvoiceStatus, string> = {
  'Đã xuất': 'bg-green-100 text-green-700',
  'Chưa xuất': 'bg-yellow-100 text-yellow-700',
};

export default function AccountingDataPage() {
  const [records, setRecords] = useState<AccountingRecord[]>(mockAccountingRecords);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterInvoice, setFilterInvoice] = useState<string>('all');
  const [filterStarred, setFilterStarred] = useState(false);
  const [page, setPage] = useState(1);
  const [detailRecord, setDetailRecord] = useState<AccountingRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AccountingRecord | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const updateRecord = (id: string, updates: Partial<AccountingRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
  };

  const filtered = useMemo(() => {
    return records.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = !q || r.clientName.toLowerCase().includes(q) || r.candidateName.toLowerCase().includes(q) || r.jobTitle.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || r.overallStatus === filterStatus;
      const matchInvoice = filterInvoice === 'all' || r.invoiceStatus === filterInvoice;
      const matchStar = !filterStarred || r.starred;
      return matchSearch && matchStatus && matchInvoice && matchStar;
    });
  }, [records, search, filterStatus, filterInvoice, filterStarred]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalNoVAT = filtered.reduce((s, r) => s + computeAmountNoVAT(r), 0);
  const totalRemaining = filtered.reduce((s, r) => s + Math.max(0, computeRemainingPayment(r)), 0);

  const handleAdd = (record: AccountingRecord) => {
    setRecords(prev => [record, ...prev]);
  };

  const handleEditSave = (record: AccountingRecord) => {
    setRecords(prev => prev.map(r => r.id === record.id ? record : r));
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Danh sách dữ liệu công nợ</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} bản ghi</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm py-1 px-3">
              Tổng No VAT: {formatVND(totalNoVAT)}
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3 border-destructive/30 text-destructive">
              Cần TT: {formatVND(totalRemaining)}
            </Badge>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Thêm mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm khách hàng, ứng viên, vị trí..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><Filter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả TT</SelectItem>
              <SelectItem value="Doing">Doing</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
              <SelectItem value="Reject">Reject</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterInvoice} onValueChange={v => { setFilterInvoice(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hóa đơn</SelectItem>
              <SelectItem value="Đã xuất">Đã xuất</SelectItem>
              <SelectItem value="Chưa xuất">Chưa xuất</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={filterStarred ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilterStarred(!filterStarred); setPage(1); }}
            className="gap-1"
          >
            <Star className={`h-3.5 w-3.5 ${filterStarred ? 'fill-current' : ''}`} />
            Đánh dấu
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead className="min-w-[90px]">Ngày offer</TableHead>
                    <TableHead className="min-w-[130px]">Khách hàng</TableHead>
                    <TableHead className="min-w-[130px]">Ứng viên</TableHead>
                    <TableHead className="min-w-[130px]">Vị trí</TableHead>
                    <TableHead className="min-w-[100px] text-right">No VAT</TableHead>
                    <TableHead className="min-w-[100px] text-right">VAT</TableHead>
                    <TableHead className="min-w-[100px] text-right">Cần TT</TableHead>
                    <TableHead className="min-w-[90px]">Trạng thái</TableHead>
                    <TableHead className="min-w-[90px]">Hóa đơn</TableHead>
                    <TableHead className="w-[110px] text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((r, idx) => {
                    const noVAT = computeAmountNoVAT(r);
                    const vat = computeAmountVAT(r);
                    const remaining = computeRemainingPayment(r);
                    return (
                      <TableRow key={r.id} className="text-xs">
                        <TableCell className="font-medium">{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>
                        <TableCell>{formatDate(r.offerDate)}</TableCell>
                        <TableCell className="font-medium">{r.clientName}</TableCell>
                        <TableCell>{r.candidateName}</TableCell>
                        <TableCell className="text-muted-foreground">{r.jobTitle}</TableCell>
                        <TableCell className="text-right font-medium">{formatVND(noVAT)}</TableCell>
                        <TableCell className="text-right font-medium">{formatVND(vat)}</TableCell>
                        <TableCell className={`text-right font-semibold ${remaining > 0 ? 'text-destructive' : 'text-green-600'}`}>{formatVND(remaining)}</TableCell>
                        <TableCell>
                          <Select value={r.overallStatus} onValueChange={v => updateRecord(r.id, { overallStatus: v as OverallStatus })}>
                            <SelectTrigger className="h-auto w-auto border-0 bg-transparent shadow-none p-0 focus:ring-0 [&>svg]:hidden">
                              <Badge className={`text-[10px] cursor-pointer hover:opacity-80 transition-opacity ${statusColors[r.overallStatus]}`}>
                                {r.overallStatus}
                                <ChevronDown className="h-3 w-3 ml-0.5 inline-block opacity-60" />
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {overallStatusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select value={r.invoiceStatus} onValueChange={v => updateRecord(r.id, { invoiceStatus: v as InvoiceStatus })}>
                            <SelectTrigger className="h-auto w-auto border-0 bg-transparent shadow-none p-0 focus:ring-0 [&>svg]:hidden">
                              <Badge className={`text-[10px] cursor-pointer hover:opacity-80 transition-opacity ${invoiceColors[r.invoiceStatus]}`}>
                                {r.invoiceStatus}
                                <ChevronDown className="h-3 w-3 ml-0.5 inline-block opacity-60" />
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {invoiceStatusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-0.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setDetailRecord(r); setDetailOpen(true); }}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Xem chi tiết</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditRecord(r); setEditOpen(true); }}>
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Chỉnh sửa</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateRecord(r.id, { starred: !r.starred })}
                                >
                                  <Star className={`h-3.5 w-3.5 ${r.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{r.starred ? 'Bỏ đánh dấu' : 'Đánh dấu'}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Trang {page} / {totalPages} ({filtered.length} kết quả)</span>
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

      <AccountingDetailDialog record={detailRecord} open={detailOpen} onOpenChange={setDetailOpen} />
      <AccountingEditDialog record={editRecord} open={editOpen} onOpenChange={setEditOpen} onSave={handleEditSave} />
      <AddAccountingDialog open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} />
    </MainLayout>
  );
}
