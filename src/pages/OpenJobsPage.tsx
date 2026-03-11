import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter,
  Building2,
  Briefcase,
  Download,
  CheckSquare,
  XSquare,
} from 'lucide-react';
import { mockOpenJobs } from '@/data/openJobMockData';
import { Industry, OpenJob } from '@/types/job';
import { JobCard } from '@/components/jobs/JobCard';
import { IntroduceCandidateDialog } from '@/components/jobs/IntroduceCandidateDialog';
import { exportJobsToExcel } from '@/lib/exportJobsToExcel';
import { useToast } from '@/hooks/use-toast';

const industries: Industry[] = [
  'IT - Phần mềm',
  'IT - Phần cứng',
  'Ecommerce',
  'Fintech',
  'Banking',
  'Manufacturing',
  'Logistics',
  'Retail',
  'Healthcare',
  'Education',
  'Consulting',
  'Non-IT',
  'Khác',
];

export default function OpenJobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [introduceDialogOpen, setIntroduceDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<OpenJob | null>(null);
  const [exportMode, setExportMode] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const openJobs = useMemo(() => {
    return mockOpenJobs.filter(job => job.status === 'Open');
  }, []);

  const clients = useMemo(() => {
    const uniqueClients = [...new Set(openJobs.map(job => job.clientName))];
    return uniqueClients.sort();
  }, [openJobs]);

  const filteredJobs = useMemo(() => {
    return openJobs.filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesIndustry = industryFilter === 'all' || job.industry === industryFilter;
      const matchesClient = clientFilter === 'all' || job.clientName === clientFilter;
      
      return matchesSearch && matchesIndustry && matchesClient;
    });
  }, [openJobs, searchTerm, industryFilter, clientFilter]);

  const handleIntroduce = (job: OpenJob) => {
    setSelectedJob(job);
    setIntroduceDialogOpen(true);
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedJobIds.size === filteredJobs.length) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(filteredJobs.map(j => j.id)));
    }
  };

  const handleExportSelected = () => {
    const jobsToExport = filteredJobs.filter(j => selectedJobIds.has(j.id));
    if (jobsToExport.length === 0) {
      toast({ title: 'Chưa chọn job nào', description: 'Vui lòng tích chọn ít nhất 1 job để xuất.', variant: 'destructive' });
      return;
    }
    exportJobsToExcel(jobsToExport);
    toast({ title: 'Xuất thành công', description: `Đã xuất ${jobsToExport.length} job(s) ra file Excel.` });
  };

  const handleExportAll = () => {
    exportJobsToExcel(filteredJobs);
    toast({ title: 'Xuất thành công', description: `Đã xuất tất cả ${filteredJobs.length} job(s) ra file Excel.` });
  };

  const handleToggleExportMode = () => {
    if (exportMode) {
      setSelectedJobIds(new Set());
    }
    setExportMode(!exportMode);
  };

  const allSelected = filteredJobs.length > 0 && selectedJobIds.size === filteredJobs.length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Open Jobs</h1>
            <p className="text-muted-foreground">
              Các công việc đang tuyển dụng • {filteredJobs.length} công việc
            </p>
          </div>
          <div className="flex items-center gap-2">
            {exportMode ? (
              <>
                <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                  {allSelected ? <XSquare className="h-4 w-4 mr-1" /> : <CheckSquare className="h-4 w-4 mr-1" />}
                  {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleExportSelected}
                  disabled={selectedJobIds.size === 0}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Xuất đã chọn ({selectedJobIds.size})
                </Button>
                <Button variant="ghost" size="sm" onClick={handleToggleExportMode}>
                  Huỷ
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleToggleExportMode}>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Chọn & Xuất
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleExportAll}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Xuất tất cả
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên vị trí, mã job..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>

          <Select value={industryFilter} onValueChange={setIndustryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả ngành" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ngành</SelectItem>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[200px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Chọn khách hàng..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khách hàng</SelectItem>
              {clients.map(client => (
                <SelectItem key={client} value={client}>{client}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Export mode info bar */}
        {exportMode && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 border border-accent text-sm text-foreground">
            <CheckSquare className="h-5 w-5 text-green-600" />
            <span>
              Đang ở chế độ chọn xuất — tích vào các job muốn xuất, sau đó bấm <strong>"Xuất đã chọn"</strong>.
            </span>
            <span className="ml-auto font-semibold text-green-600">{selectedJobIds.size} đã chọn</span>
          </div>
        )}

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map(job => (
            <div key={job.id} className="relative">
              {exportMode && (
                <button
                  type="button"
                  className="absolute -top-2 -left-2 z-10 flex items-center justify-center h-7 w-7 rounded-full border-2 border-background shadow-md transition-colors bg-background hover:scale-110"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleJobSelection(job.id); }}
                >
                  {selectedJobIds.has(job.id) ? (
                    <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l3 3 5-5"/></svg>
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/40" />
                  )}
                </button>
              )}
              <div
                className={`transition-all ${exportMode ? 'cursor-pointer' : ''} ${exportMode && selectedJobIds.has(job.id) ? 'ring-2 ring-green-500 rounded-lg scale-[0.98]' : ''}`}
                onClick={exportMode ? (e) => { e.preventDefault(); toggleJobSelection(job.id); } : undefined}
              >
                <JobCard 
                  job={job} 
                  onIntroduce={() => handleIntroduce(job)}
                />
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Không tìm thấy công việc nào phù hợp</p>
          </div>
        )}
      </div>

      {/* Introduce Candidate Dialog */}
      <IntroduceCandidateDialog
        open={introduceDialogOpen}
        onOpenChange={setIntroduceDialogOpen}
        job={selectedJob}
      />
    </MainLayout>
  );
}
