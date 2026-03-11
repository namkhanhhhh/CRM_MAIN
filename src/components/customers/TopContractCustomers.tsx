import { useMemo, useState } from 'react';
import { Customer } from '@/types/customer';
import { bdUsers } from '@/data/mockData';
import { Building2, FileText, User, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TopContractCustomersProps {
  customers: Customer[];
  bdFilter?: string;
}

interface ContractCustomer {
  customerId: string;
  companyName: string;
  domain: string;
  jobCount: number;
  bdId: string;
  bdName: string;
  signedDate: string;
}

const ITEMS_PER_PAGE = 6;

export function TopContractCustomers({ customers, bdFilter = 'all' }: TopContractCustomersProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const topCustomers = useMemo(() => {
    // Filter signed customers
    let signedCustomers = customers.filter((c) => c.status === 'Signed');
    
    // Apply BD filter if not 'all'
    if (bdFilter !== 'all') {
      signedCustomers = signedCustomers.filter((c) => c.bdAssigned === bdFilter);
    }

    // Map to ContractCustomer format - sort by job count
    const contractCustomers: ContractCustomer[] = signedCustomers.map((c) => {
      const bd = bdUsers.find((b) => b.id === c.bdAssigned);
      return {
        customerId: c.id,
        companyName: c.companyName,
        domain: c.domain,
        jobCount: c.job ? 1 : 0,
        bdId: c.bdAssigned || '',
        bdName: bd?.name || 'N/A',
        signedDate: c.updatedAt,
      };
    });

    // Sort by job count descending
    return contractCustomers.sort((a, b) => b.jobCount - a.jobCount);
  }, [customers, bdFilter]);

  const totalPages = Math.ceil(topCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return topCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [topCustomers, currentPage]);

  const totalJobs = useMemo(() => {
    return topCustomers.reduce((sum, c) => sum + c.jobCount, 0);
  }, [topCustomers]);

  const handleCustomerClick = (customerId: string) => {
    navigate(`/bd-crm/customers/${customerId}`);
  };

  if (topCustomers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <FileText className="h-8 w-8 mb-2" />
        <p className="text-sm">Chưa có hợp đồng nào được ký</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 flex-1 flex flex-col">
      {/* Total Jobs Summary */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-success/10 border border-success/20">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-success" />
          <span className="text-sm font-medium">Tổng số vị trí tuyển dụng</span>
        </div>
        <span className="text-lg font-bold text-success">{totalJobs} jobs</span>
      </div>

      {/* Customer List */}
      <div className="space-y-2 flex-1">
        {paginatedCustomers.map((customer, index) => {
          const globalRank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
          return (
            <div
              key={customer.customerId}
              onClick={() => handleCustomerClick(customer.customerId)}
              className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            >
              {/* Rank */}
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                globalRank === 1 ? 'bg-yellow-100 text-yellow-700' :
                globalRank === 2 ? 'bg-slate-100 text-slate-700' :
                globalRank === 3 ? 'bg-amber-100 text-amber-700' :
                'bg-muted text-muted-foreground'
              }`}>
                {globalRank}
              </div>

              {/* Company Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-sm truncate">{customer.companyName}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded bg-muted">{customer.domain}</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {customer.bdName}
                  </span>
                </div>
              </div>

              {/* Job Count */}
              <div className="text-right">
                <span className="font-bold text-primary text-sm">
                  {customer.jobCount} jobs
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Trang {currentPage}/{totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
