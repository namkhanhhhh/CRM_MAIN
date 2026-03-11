import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  Calendar, 
  History,
  Eye,
  FileText,
  Trash2,
  ChevronDown,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { mockProcesses } from '@/data/processJobUserMockData';
import { ProcessRecord, ProcessStatus, ACTIVE_PROCESS_STATUSES } from '@/types/process';
import { OnboardingStatusDialog } from '@/components/processes/OnboardingStatusDialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Status icon and color mapping
const getStatusConfig = (status: ProcessStatus) => {
  const configs: Record<string, { icon: typeof CheckCircle2; color: string; bgColor: string }> = {
    'APPLIED': { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    'REJECT BY ADMIN': { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
    'CV SUBMITTED TO CLIENT': { icon: FileText, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    'INTERVIEW SCHEDULED 1ST': { icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    'INTERVIEW COMPLETED 1ST': { icon: CheckCircle2, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    'INTERVIEW SCHEDULED 2ND': { icon: Calendar, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    'INTERVIEW COMPLETED 2ND': { icon: CheckCircle2, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    'INTERVIEW SCHEDULED 3RD': { icon: Calendar, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    'INTERVIEW COMPLETED 3RD': { icon: CheckCircle2, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    'INTERVIEW SCHEDULED FINAL': { icon: Calendar, color: 'text-lime-600', bgColor: 'bg-lime-50' },
    'INTERVIEW COMPLETED FINAL': { icon: CheckCircle2, color: 'text-lime-600', bgColor: 'bg-lime-50' },
    'TEST ASSIGNED': { icon: FileText, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    'TEST COMPLETED': { icon: CheckCircle2, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
    'REFERENCE CHECK IN PROGRESS': { icon: Clock, color: 'text-teal-600', bgColor: 'bg-teal-50' },
    'REFERENCE CHECK COMPLETED': { icon: CheckCircle2, color: 'text-teal-600', bgColor: 'bg-teal-50' },
    'OFFER EXTENDED': { icon: Briefcase, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    'OFFER ACCEPTED BY CANDIDATE': { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' },
    'OFFER DECLINED BY CANDIDATE': { icon: XCircle, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    'REJECTED BY CLIENT': { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
    'CANDIDATE WITHDREW': { icon: XCircle, color: 'text-gray-600', bgColor: 'bg-gray-50' },
    'PLACEMENT CONFIRMED': { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' },
    'ONBOARDING': { icon: UserCheck, color: 'text-primary', bgColor: 'bg-primary/10' },
    'GUARANTEE PERIOD': { icon: Clock, color: 'text-violet-600', bgColor: 'bg-violet-50' },
    'PAYMENT RECEIVED': { icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    'PROCESS ON HOLD': { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    'PROCESS CANCELLED': { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  };
  
  return configs[status] || { icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted' };
};

// All statuses for dropdown
const ALL_STATUSES: ProcessStatus[] = [
  ...ACTIVE_PROCESS_STATUSES,
  'PROCESS ON HOLD',
  'PROCESS CANCELLED',
];

export default function ProcessesPage() {
  const { toast } = useToast();
  const [processes, setProcesses] = useState<ProcessRecord[]>(mockProcesses);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Onboarding dialog state
  const [onboardingDialogOpen, setOnboardingDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<ProcessRecord | null>(null);

  // Filtered processes
  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      const matchesSearch = 
        p.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [processes, searchQuery, statusFilter]);

  // Handle status change
  const handleStatusChange = (process: ProcessRecord, newStatus: ProcessStatus) => {
    if (newStatus === 'ONBOARDING') {
      setSelectedProcess(process);
      setOnboardingDialogOpen(true);
    } else {
      // Direct status update for other statuses
      setProcesses(prev => 
        prev.map(p => 
          p.id === process.id 
            ? { ...p, status: newStatus, updatedAt: new Date().toISOString() }
            : p
        )
      );
      toast({
        title: "Cập nhật thành công",
        description: `Đã chuyển trạng thái sang ${newStatus}`,
      });
    }
  };

  // Handle onboarding confirmation
  const handleOnboardingConfirm = (data: {
    onboardingDate: string;
    revenue: number;
    processNote: string;
  }) => {
    if (!selectedProcess) return;

    setProcesses(prev => 
      prev.map(p => 
        p.id === selectedProcess.id 
          ? { 
              ...p, 
              status: 'ONBOARDING' as ProcessStatus,
              onboardingDate: data.onboardingDate,
              revenue: data.revenue,
              processNote: data.processNote,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );

    toast({
      title: "Onboarding đã được xác nhận",
      description: (
        <div className="space-y-1">
          <p>Ứng viên: {selectedProcess.candidateName}</p>
          <p>Ngày onboarding: {data.onboardingDate}</p>
          {data.revenue > 0 && (
            <p>Doanh số: {new Intl.NumberFormat('vi-VN').format(data.revenue)} VNĐ</p>
          )}
          <p className="text-xs text-muted-foreground">
            Email thông báo đã được gửi đến infor@tdconsulting.vn và ketoan@tdconsulting.vn
          </p>
        </div>
      ),
    });

    setSelectedProcess(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Processes</h1>
          <p className="text-muted-foreground">Manage recruitment processes</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm tên/email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Status</SelectItem>
                  {ALL_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                </SelectContent>
              </Select>

              {/* Client Filter placeholder */}
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Client..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả Client</SelectItem>
                </SelectContent>
              </Select>

              {/* Total count */}
              <div className="flex items-center justify-end">
                <span className="text-sm text-muted-foreground">
                  Total: <span className="font-semibold">{filteredProcesses.length}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">CANDIDATE</TableHead>
                    <TableHead className="min-w-[120px]">OWNER</TableHead>
                    <TableHead className="min-w-[150px]">JOB</TableHead>
                    <TableHead className="min-w-[150px]">CLIENT</TableHead>
                    <TableHead className="w-[60px]">REASON</TableHead>
                    <TableHead className="w-[40px]">CV</TableHead>
                    <TableHead className="min-w-[220px]">STATUS</TableHead>
                    <TableHead className="min-w-[100px]">UPDATED</TableHead>
                    <TableHead className="w-[120px]">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcesses.slice(0, 20).map((process) => {
                    const statusConfig = getStatusConfig(process.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <TableRow key={process.id}>
                        {/* Candidate */}
                        <TableCell>
                          <div>
                            <p className="font-medium">{process.candidateName}</p>
                            <p className="text-xs text-muted-foreground">{process.candidateEmail}</p>
                          </div>
                        </TableCell>
                        
                        {/* Owner */}
                        <TableCell>
                          <span className="text-primary font-medium">{process.ownerName}</span>
                        </TableCell>
                        
                        {/* Job */}
                        <TableCell>
                          <div>
                            <p className="font-medium">{process.jobTitle.slice(0, 20)}...</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{process.jobCode}</span>
                              <Button variant="ghost" size="sm" className="h-5 px-2 text-xs text-primary">
                                <History className="h-3 w-3 mr-1" />
                                History
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Client */}
                        <TableCell>
                          <span className="text-sm">{process.clientName.slice(0, 20)}...</span>
                        </TableCell>
                        
                        {/* Reason */}
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                        
                        {/* CV */}
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                        
                        {/* Status Dropdown */}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                className={`w-full justify-between ${statusConfig.color}`}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <StatusIcon className="h-4 w-4 flex-shrink-0" />
                                  <span className="text-xs truncate">{process.status}</span>
                                </span>
                                <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[280px] max-h-[400px] overflow-y-auto">
                              {ALL_STATUSES.map((status) => {
                                const config = getStatusConfig(status);
                                const Icon = config.icon;
                                const isActive = process.status === status;
                                
                                return (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() => handleStatusChange(process, status)}
                                    className={`flex items-center gap-2 ${isActive ? 'bg-accent' : ''}`}
                                  >
                                    <Icon className={`h-4 w-4 ${config.color}`} />
                                    <span className={`text-xs ${config.color}`}>{status}</span>
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        
                        {/* Updated */}
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(process.updatedAt), 'dd/MM/yyyy, HH:mm')}
                          </span>
                        </TableCell>
                        
                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Status Dialog */}
        <OnboardingStatusDialog
          open={onboardingDialogOpen}
          onOpenChange={setOnboardingDialogOpen}
          process={selectedProcess}
          onConfirm={handleOnboardingConfirm}
        />
      </div>
    </MainLayout>
  );
}
