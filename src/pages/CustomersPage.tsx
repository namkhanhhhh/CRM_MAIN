import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerKanban } from '@/components/customers/CustomerKanban';
import { AddCustomerDialog } from '@/components/customers/AddCustomerDialog';
import { ExcelImportSheet } from '@/components/customers/ExcelImportSheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Customer, StatusHistoryEntry, CommunicationHistoryEntry } from '@/types/customer';
import { Plus, Building2, BarChart3, LayoutList, Kanban } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCustomerData } from '@/context/CustomerDataContext';
import { isToday, isBefore, startOfDay, endOfWeek, isWithinInterval, startOfWeek } from 'date-fns';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

export default function CustomersPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    customers, 
    setCustomers, 
    statusHistory, 
    communicationHistory, 
    addStatusHistory, 
    addCommunicationHistory,
    updateCustomer 
  } = useCustomerData();
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [addOpen, setAddOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [domain, setDomain] = useState('all');
  const [jobSource, setJobSource] = useState('all');
  const [priority, setPriority] = useState('all');
  const [bdAssigned, setBdAssigned] = useState('all');
  const [remindFilter, setRemindFilter] = useState('all');

  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter((customer) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        customer.companyName.toLowerCase().includes(searchLower) ||
        customer.job?.toLowerCase().includes(searchLower) ||
        customer.contacts.some(
          (c) =>
            c.name.toLowerCase().includes(searchLower) ||
            c.email?.toLowerCase().includes(searchLower)
        );

      const matchesStatus = status === 'all' || customer.status === status;
      const matchesDomain = domain === 'all' || customer.domain === domain;
      const matchesJobSource = jobSource === 'all' || customer.jobSource === jobSource;
      const matchesPriority = priority === 'all' || customer.priority === priority;
      
      // BD filter with "self" option
      let matchesBd = true;
      if (bdAssigned === 'self') {
        matchesBd = customer.bdAssigned === currentUser.id;
      } else if (bdAssigned !== 'all') {
        matchesBd = customer.bdAssigned === bdAssigned;
      }

      // Remind filter
      let matchesRemind = true;
      if (remindFilter !== 'all' && customer.remindDate) {
        const today = startOfDay(new Date());
        const remindDate = startOfDay(new Date(customer.remindDate));
        
        if (remindFilter === 'today') {
          matchesRemind = isToday(remindDate);
        } else if (remindFilter === 'this-week') {
          const weekStart = startOfWeek(today, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
          matchesRemind = isWithinInterval(remindDate, { start: weekStart, end: weekEnd });
        } else if (remindFilter === 'overdue') {
          matchesRemind = isBefore(remindDate, today);
        }
      } else if (remindFilter !== 'all') {
        matchesRemind = false;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDomain &&
        matchesJobSource &&
        matchesPriority &&
        matchesBd &&
        matchesRemind
      );
    });

    // Sort by earliest remind date first
    filtered.sort((a, b) => {
      if (!a.remindDate && !b.remindDate) return 0;
      if (!a.remindDate) return 1;
      if (!b.remindDate) return -1;
      return new Date(a.remindDate).getTime() - new Date(b.remindDate).getTime();
    });

    return filtered;
  }, [customers, search, status, domain, jobSource, priority, bdAssigned, remindFilter, currentUser.id]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  // Reset to page 1 when filters change
  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setDomain('all');
    setJobSource('all');
    setPriority('all');
    setBdAssigned('all');
    setRemindFilter('all');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const handleUpdateCustomer = (id: string, updates: Partial<Customer>) => {
    updateCustomer(id, updates);
    toast({
      title: 'Đã cập nhật',
      description: 'Thông tin khách hàng đã được cập nhật',
    });
  };

  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    toast({
      title: 'Thêm thành công',
      description: `Đã thêm khách hàng ${customerData.companyName}`,
    });
  };

  const handleImportCustomers = (importedCustomers: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const newCustomers: Customer[] = importedCustomers.map((data, index) => ({
      ...data,
      id: (Date.now() + index).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    setCustomers((prev) => [...newCustomers, ...prev]);
  };

  const handleAddStatusHistory = (customerId: string, entry: StatusHistoryEntry) => {
    addStatusHistory(customerId, entry);
  };

  const handleAddCommunicationHistory = (customerId: string, entry: CommunicationHistoryEntry) => {
    addCommunicationHistory(customerId, entry);
    toast({
      title: 'Đã lưu ghi chú',
      description: 'Ghi chú trao đổi đã được lưu vào lịch sử',
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <Building2 className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Customer Management
              </h1>
              <p className="text-muted-foreground">
                Quản lý và theo dõi quan hệ khách hàng cho BD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'kanban')}>
              <TabsList>
                <TabsTrigger value="table" className="gap-1.5">
                  <LayoutList className="h-4 w-4" />
                  Bảng
                </TabsTrigger>
                <TabsTrigger value="kanban" className="gap-1.5">
                  <Kanban className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <ExcelImportSheet onImport={handleImportCustomers} />
            <Button variant="outline" onClick={() => navigate('/bd-crm/stats')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Thống kê
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm khách hàng
            </Button>
          </div>
        </div>

        {/* Filters */}
        <CustomerFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          domain={domain}
          onDomainChange={setDomain}
          jobSource={jobSource}
          onJobSourceChange={setJobSource}
          priority={priority}
          onPriorityChange={setPriority}
          bdAssigned={bdAssigned}
          onBdAssignedChange={setBdAssigned}
          remindFilter={remindFilter}
          onRemindFilterChange={setRemindFilter}
          onClearFilters={clearFilters}
        />

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          Hiển thị <span className="font-medium text-foreground">{filteredCustomers.length}</span> / {customers.length} khách hàng
        </div>

        {/* View */}
        {viewMode === 'table' ? (
          <CustomerTable
            customers={paginatedCustomers}
            onUpdateCustomer={handleUpdateCustomer}
            statusHistory={statusHistory}
            communicationHistory={communicationHistory}
            onAddStatusHistory={handleAddStatusHistory}
            onAddCommunicationHistory={handleAddCommunicationHistory}
          />
        ) : (
          <CustomerKanban
            customers={paginatedCustomers}
            onUpdateCustomer={handleUpdateCustomer}
            statusHistory={statusHistory}
            onAddHistory={handleAddStatusHistory}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Trang {currentPage} / {totalPages} ({filteredCustomers.length} kết quả)
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Dialogs */}
        <AddCustomerDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          onSubmit={handleAddCustomer}
        />
      </div>
    </MainLayout>
  );
}
