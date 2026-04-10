import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Briefcase,
  Star,
  Plus,
  Trash2,
  Search,
  Copy,
  ExternalLink,
  GripVertical,
  MapPin,
  DollarSign,
  Building2,
  Eye,
  Pin,
  ArrowUpDown,
  Link2,
  Sparkles,
  Send,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { mockOpenJobs } from '@/data/openJobMockData';
import {
  mockHeadhunterProfiles,
  mockHeadhunterPageJobs,
  getPageJobsByProfileId,
} from '@/data/headhunterProfileMockData';
import { HeadhunterPageJob } from '@/types/headhunterProfile';
import { OpenJob } from '@/types/job';

export default function HeadhunterJobsPage() {
  const { toast } = useToast();

  // Simulate current user's profile
  const currentProfile = mockHeadhunterProfiles[0];

  const [pageJobs, setPageJobs] = useState<HeadhunterPageJob[]>(() =>
    getPageJobsByProfileId(currentProfile.id)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addSearchTerm, setAddSearchTerm] = useState('');
  const [sendLinkDialogOpen, setSendLinkDialogOpen] = useState(false);
  const [selectedJobForLink, setSelectedJobForLink] = useState<OpenJob | null>(null);
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

  // Get full job details for page jobs
  const pageJobsWithDetails = useMemo(() => {
    return pageJobs.map(pj => {
      const job = mockOpenJobs.find(j => j.id === pj.jobId);
      return { ...pj, job };
    }).filter(pj => pj.job);
  }, [pageJobs]);

  // Highlighted jobs
  const highlightedJobs = useMemo(() =>
    pageJobsWithDetails.filter(pj => pj.isHighlighted),
    [pageJobsWithDetails]
  );

  // Normal jobs
  const normalJobs = useMemo(() =>
    pageJobsWithDetails.filter(pj => !pj.isHighlighted),
    [pageJobsWithDetails]
  );

  // Filtered for display
  const filteredHighlighted = useMemo(() => {
    if (!searchTerm) return highlightedJobs;
    return highlightedJobs.filter(pj =>
      pj.job!.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pj.job!.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pj.job!.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [highlightedJobs, searchTerm]);

  const filteredNormal = useMemo(() => {
    if (!searchTerm) return normalJobs;
    return normalJobs.filter(pj =>
      pj.job!.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pj.job!.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pj.job!.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [normalJobs, searchTerm]);

  // Available jobs to add (not already on page, must be Open)
  const availableJobs = useMemo(() => {
    const pageJobIds = new Set(pageJobs.map(pj => pj.jobId));
    return mockOpenJobs
      .filter(j => j.status === 'Open' && !pageJobIds.has(j.id))
      .filter(j =>
        !addSearchTerm ||
        j.title.toLowerCase().includes(addSearchTerm.toLowerCase()) ||
        j.clientName.toLowerCase().includes(addSearchTerm.toLowerCase()) ||
        j.code.toLowerCase().includes(addSearchTerm.toLowerCase())
      );
  }, [pageJobs, addSearchTerm]);

  const handleAddJob = (job: OpenJob) => {
    const newPageJob: HeadhunterPageJob = {
      id: `hpj-new-${Date.now()}`,
      profileId: currentProfile.id,
      jobId: job.id,
      isHighlighted: false,
      addedAt: new Date().toISOString(),
      displayOrder: pageJobs.length + 1,
    };
    setPageJobs(prev => [...prev, newPageJob]);
    toast({
      title: 'Đã thêm job!',
      description: `${job.code} - ${job.title} đã được thêm vào trang cá nhân.`,
    });
  };

  const handleRemoveJob = (pageJobId: string) => {
    setPageJobs(prev => prev.filter(pj => pj.id !== pageJobId));
    toast({
      title: 'Đã xóa job',
      description: 'Job đã được gỡ khỏi trang cá nhân.',
    });
  };

  const handleToggleHighlight = (pageJobId: string) => {
    setPageJobs(prev =>
      prev.map(pj =>
        pj.id === pageJobId ? { ...pj, isHighlighted: !pj.isHighlighted } : pj
      )
    );
  };

  const generatePersonalizedLink = (job: OpenJob) => {
    return `${window.location.origin}/apply/${currentProfile.slug}/${job.code.toLowerCase()}`;
  };

  const handleCopyLink = (job: OpenJob) => {
    const link = generatePersonalizedLink(job);
    navigator.clipboard.writeText(link);
    setCopiedJobId(job.id);
    setTimeout(() => setCopiedJobId(null), 2000);
    toast({
      title: 'Đã copy link!',
      description: link,
    });
  };

  const handleSendLink = (job: OpenJob) => {
    setSelectedJobForLink(job);
    setSendLinkDialogOpen(true);
  };

  const brandColor = currentProfile.brandColor;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-pink-500" />
              Quản lý Jobs trên Trang cá nhân
            </h1>
            <p className="text-muted-foreground mt-1">
              Thêm, gỡ, ghim nổi bật các Job hiển thị trên trang tuyển dụng cá nhân
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 py-1.5 px-3">
              <Briefcase className="h-3.5 w-3.5" />
              {pageJobs.length} jobs trên trang
            </Badge>
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1.5 py-1.5 px-3">
              <Star className="h-3.5 w-3.5" />
              {highlightedJobs.length} nổi bật
            </Badge>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-pink-500 hover:bg-pink-600 text-white gap-2">
                  <Plus className="h-4 w-4" />
                  Thêm Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-pink-500" />
                    Thêm Job vào trang cá nhân
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên job, mã job, khách hàng..."
                      value={addSearchTerm}
                      onChange={(e) => setAddSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                    {availableJobs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Không tìm thấy job phù hợp</p>
                      </div>
                    ) : (
                      availableJobs.slice(0, 20).map(job => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between p-3 rounded-xl border hover:border-pink-200 hover:bg-pink-50/30 transition-all group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {job.code}
                              </Badge>
                              <Badge
                                className="text-[10px]"
                                style={{
                                  backgroundColor: `${brandColor}15`,
                                  color: brandColor,
                                  border: `1px solid ${brandColor}30`,
                                }}
                              >
                                {job.industry}
                              </Badge>
                            </div>
                            <h4 className="text-sm font-semibold truncate">{job.title}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {job.clientName}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.location}
                              </span>
                              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                <DollarSign className="h-3 w-3" />
                                {job.salary}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddJob(job)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 text-pink-600 border-pink-200 hover:bg-pink-50"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Thêm
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm job trên trang cá nhân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Highlighted Jobs Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Star className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Jobs nổi bật (Highlight)</h2>
              <p className="text-xs text-muted-foreground">Hiển thị ở đầu trang cá nhân, thu hút ứng viên</p>
            </div>
          </div>

          {filteredHighlighted.length === 0 ? (
            <div className="p-6 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/30 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-amber-300" />
              <p className="text-sm text-muted-foreground">
                Chưa có job nổi bật. Bật "Highlight" cho job bên dưới để ghim lên đầu trang.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredHighlighted.map((pj) => (
                <JobPageCard
                  key={pj.id}
                  pageJob={pj}
                  job={pj.job!}
                  brandColor={brandColor}
                  isHighlighted={true}
                  copiedJobId={copiedJobId}
                  onToggleHighlight={() => handleToggleHighlight(pj.id)}
                  onRemove={() => handleRemoveJob(pj.id)}
                  onCopyLink={() => handleCopyLink(pj.job!)}
                  onSendLink={() => handleSendLink(pj.job!)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Normal Jobs Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Danh sách Jobs trên trang</h2>
              <p className="text-xs text-muted-foreground">Các job hiển thị trên trang cá nhân của bạn</p>
            </div>
          </div>

          {filteredNormal.length === 0 ? (
            <div className="p-6 rounded-xl border-2 border-dashed border-muted text-center">
              <Briefcase className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Không tìm thấy job phù hợp' : 'Chưa có job nào. Bấm "Thêm Job" để bắt đầu.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredNormal.map((pj) => (
                <JobPageCard
                  key={pj.id}
                  pageJob={pj}
                  job={pj.job!}
                  brandColor={brandColor}
                  isHighlighted={false}
                  copiedJobId={copiedJobId}
                  onToggleHighlight={() => handleToggleHighlight(pj.id)}
                  onRemove={() => handleRemoveJob(pj.id)}
                  onCopyLink={() => handleCopyLink(pj.job!)}
                  onSendLink={() => handleSendLink(pj.job!)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Send Link Dialog */}
      <Dialog open={sendLinkDialogOpen} onOpenChange={setSendLinkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-pink-500" />
              Gửi link cá nhân hóa
            </DialogTitle>
          </DialogHeader>
          {selectedJobForLink && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/50 border">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {selectedJobForLink.code}
                  </Badge>
                </div>
                <h4 className="text-sm font-semibold">{selectedJobForLink.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedJobForLink.clientName}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Link ứng tuyển cá nhân hóa</label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={generatePersonalizedLink(selectedJobForLink)}
                    className="text-xs font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(selectedJobForLink)}
                    className="gap-1 shrink-0"
                  >
                    {copiedJobId === selectedJobForLink.id ? (
                      <><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Đã copy</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /> Copy</>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
                <p className="font-medium mb-1">💡 Cách sử dụng:</p>
                <ul className="space-y-0.5">
                  <li>• Gửi link này cho ứng viên qua Zalo, Email, LinkedIn...</li>
                  <li>• Ứng viên click vào sẽ thấy thông tin Job + Profile của bạn</li>
                  <li>• CV ứng tuyển sẽ tự động gắn với tài khoản Headhunter của bạn</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

// Sub-component: Job card on personal page management
function JobPageCard({
  pageJob,
  job,
  brandColor,
  isHighlighted,
  copiedJobId,
  onToggleHighlight,
  onRemove,
  onCopyLink,
  onSendLink,
}: {
  pageJob: HeadhunterPageJob;
  job: OpenJob;
  brandColor: string;
  isHighlighted: boolean;
  copiedJobId: string | null;
  onToggleHighlight: () => void;
  onRemove: () => void;
  onCopyLink: () => void;
  onSendLink: () => void;
}) {
  return (
    <Card
      className={`border transition-all hover:shadow-md group ${
        isHighlighted
          ? 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-white'
          : 'hover:border-pink-200'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              {job.code}
            </Badge>
            <Badge
              className="text-[10px]"
              style={{
                backgroundColor: `${brandColor}15`,
                color: brandColor,
                border: `1px solid ${brandColor}30`,
              }}
            >
              {job.industry}
            </Badge>
            {isHighlighted && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] gap-0.5">
                <Star className="h-2.5 w-2.5" />
                Nổi bật
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleHighlight}
              className={`p-1.5 rounded-lg transition-colors ${
                isHighlighted
                  ? 'text-amber-500 hover:text-amber-600 bg-amber-100'
                  : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50'
              }`}
              title={isHighlighted ? 'Bỏ ghim nổi bật' : 'Ghim nổi bật'}
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Gỡ khỏi trang"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h4 className="text-sm font-semibold mb-2 line-clamp-1">{job.title}</h4>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {job.clientName}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs mb-3">
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            <DollarSign className="h-3 w-3" />
            {job.salary}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            {job.jobType}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={onCopyLink}
            className="flex-1 gap-1.5 text-xs h-8"
          >
            {copiedJobId === job.id ? (
              <><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Đã copy</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy link</>
            )}
          </Button>
          <Button
            size="sm"
            onClick={onSendLink}
            className="flex-1 gap-1.5 text-xs h-8 text-white"
            style={{ backgroundColor: brandColor }}
          >
            <Send className="h-3.5 w-3.5" />
            Gửi link
          </Button>
          <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
