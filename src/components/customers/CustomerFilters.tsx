import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, User } from 'lucide-react';
import { CustomerStatus, CustomerDomain, JobSource, Priority } from '@/types/customer';
import { bdUsers } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';

interface CustomerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  domain: string;
  onDomainChange: (value: string) => void;
  jobSource: string;
  onJobSourceChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  bdAssigned: string;
  onBdAssignedChange: (value: string) => void;
  remindFilter: string;
  onRemindFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

const statuses: CustomerStatus[] = [
  'Research', 'Addfriend/Connect', 'Approach', 'Follow up', 'Consulting',
  'Demo contract', 'Signing', 'Signed', 'Meeting Clear JD', 'Hunting',
  'Take care', 'No current need', 'Excluded', 'Rejected'
];

const domains: CustomerDomain[] = [
  'IT', 'IT - product', 'IT - outsourcing', 'Ecommerce', 'Game', 'Mobile app',
  'Non IT (Manufacturing)', 'Non IT (Logistic)', 'Non IT (FMCG)',
  'Non IT (BĐS)', 'Non IT (Retail)', 'Non-IT', 'Others'
];

const jobSources: JobSource[] = [
  'Facebook', 'Linkedin', 'Thread', 'Itviec', 'Topdev', 'Aniday',
  'Job Portal', 'Referral', 'Khác'
];

export function CustomerFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  domain,
  onDomainChange,
  jobSource,
  onJobSourceChange,
  priority,
  onPriorityChange,
  bdAssigned,
  onBdAssignedChange,
  remindFilter,
  onRemindFilterChange,
  onClearFilters,
}: CustomerFiltersProps) {
  const { currentUser } = useAuth();
  
  const hasFilters = search || status !== 'all' || domain !== 'all' || 
    jobSource !== 'all' || priority !== 'all' || bdAssigned !== 'all' || remindFilter !== 'all';

  return (
    <div className="filter-card space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Filters</h3>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <div className="space-y-1.5 xl:col-span-1">
          <label className="text-xs font-medium text-muted-foreground">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tên công ty, job..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả Status</SelectItem>
              {statuses.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Domain</label>
          <Select value={domain} onValueChange={onDomainChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả Domain</SelectItem>
              {domains.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Nguồn Job</label>
          <Select value={jobSource} onValueChange={onJobSourceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả nguồn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nguồn</SelectItem>
              {jobSources.map(js => (
                <SelectItem key={js} value={js}>{js}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Priority</label>
          <Select value={priority} onValueChange={onPriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="high">Ưu tiên</SelectItem>
              <SelectItem value="normal">Bình thường</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Remind
          </label>
          <Select value={remindFilter} onValueChange={onRemindFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="today">
                <span className="text-warning">Hôm nay</span>
              </SelectItem>
              <SelectItem value="this-week">
                <span className="text-warning/80">Trong tuần này</span>
              </SelectItem>
              <SelectItem value="overdue">
                <span className="text-destructive">Quá hạn</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">BD phụ trách</label>
          <Select value={bdAssigned} onValueChange={onBdAssignedChange}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả BD" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả BD</SelectItem>
              <SelectItem value="self">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-primary">Của tôi</span>
                </div>
              </SelectItem>
              {bdUsers.map(bd => (
                <SelectItem key={bd.id} value={bd.id}>{bd.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Xóa filter
          </Button>
        </div>
      )}
    </div>
  );
}
