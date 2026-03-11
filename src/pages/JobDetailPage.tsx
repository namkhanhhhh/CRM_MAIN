import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Users,
  Briefcase,
  Download,
  Edit,
  Trash2,
  FileText,
  MessageSquare,
  Send,
  Layers,
  Link2,
  Copy,
  Check,
} from 'lucide-react';
import { 
  getOpenJobById, 
  getApplicationsByJobId, 
  getCommentsByJobId,
} from '@/data/openJobMockData';
import { generateApplyLink } from '@/types/job';
import { IntroduceCandidateDialog } from '@/components/jobs/IntroduceCandidateDialog';
import { CopyApplyLinkDialog } from '@/components/jobs/CopyApplyLinkDialog';
import { MatchingCandidatesDialog } from '@/components/jobs/MatchingCandidatesDialog';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [commentText, setCommentText] = useState('');
  const [introduceDialogOpen, setIntroduceDialogOpen] = useState(false);
  const [copyLinkDialogOpen, setCopyLinkDialogOpen] = useState(false);
  const [matchingDialogOpen, setMatchingDialogOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  const job = useMemo(() => getOpenJobById(id || ''), [id]);
  const applications = useMemo(() => getApplicationsByJobId(id || ''), [id]);
  const comments = useMemo(() => getCommentsByJobId(id || ''), [id]);

  if (!job) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy công việc</p>
          <Button asChild className="mt-4">
            <Link to="/jobs/open">Quay lại danh sách</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    toast({
      title: 'Đã gửi bình luận',
      description: 'Bình luận của bạn đã được thêm.',
    });
    setCommentText('');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/jobs/open" className="flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Open Jobs
          </Link>
          <span>&gt;</span>
          <span className="text-foreground font-medium">{job.title}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs border-foreground">
                Đang mở
              </Badge>
              <span className="text-pink-500 font-medium">#{job.code}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{job.clientName}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1 text-green-600 font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>{job.salary}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{job.interviewRounds} vòng</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - JD */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Mô tả công việc
                </CardTitle>
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                  <Download className="h-4 w-4 mr-2" />
                  Download JD
                </Button>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.description + job.requirements + job.benefits }}
                />
              </CardContent>
            </Card>

            {/* JD Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  JD chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line text-sm text-muted-foreground">
                  {job.jdDetails}
                </div>
              </CardContent>
            </Card>

            {/* Applied Candidates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Ứng viên đã apply
                  <Badge variant="secondary" className="ml-2">{applications.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có ứng viên nào apply cho công việc này.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div 
                        key={app.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{app.candidateName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{app.candidateName}</p>
                            <p className="text-sm text-muted-foreground">{app.candidateEmail}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={app.status === 'Pending' ? 'secondary' : 'default'}>
                            {app.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Bình luận ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Comment Input */}
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">K</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      placeholder="Viết bình luận..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{commentText.length}/2000</span>
                      <Button 
                        size="sm" 
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Gửi
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Comments List */}
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có bình luận nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{comment.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Quick Info */}
          <div className="space-y-4">
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-6"
                onClick={() => setIntroduceDialogOpen(true)}
              >
                Giới thiệu ứng viên
              </Button>
              <Button 
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-6"
                onClick={() => setMatchingDialogOpen(true)}
              >
                Ứng viên phù hợp
              </Button>
            </div>

            {/* Quick Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Thông tin nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">MỨC LƯƠNG</p>
                    <p className="font-medium">{job.salary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100">
                    <MapPin className="h-4 w-4 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ĐỊA ĐIỂM</p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
                    <Layers className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">NGÀNH NGHỀ</p>
                    <p className="font-medium">{job.industry}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
                    <Briefcase className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">LOẠI</p>
                    <p className="font-medium">{job.jobType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Fee */}
            {job.serviceFee && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Phí dịch vụ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{job.serviceFee}</p>
                </CardContent>
              </Card>
            )}

            {/* Apply Link Card - Special Display */}
            <Card className="border-2 border-dashed border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <Link2 className="h-5 w-5" />
                  <span className="font-semibold text-sm uppercase tracking-wide">Link Apply của bạn</span>
                </div>
                <div className="bg-white rounded-lg border border-amber-200 p-3 flex items-center gap-3">
                  <code className="flex-1 text-sm text-amber-800 font-mono break-all">
                    {`${window.location.origin}${generateApplyLink(job.code, 'nguyenvana')}`}
                  </code>
                  <Button
                    size="sm"
                    variant={linkCopied ? "default" : "outline"}
                    className={linkCopied ? "bg-green-500 hover:bg-green-500 text-white" : "border-amber-400 text-amber-700 hover:bg-amber-50"}
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${generateApplyLink(job.code, 'nguyenvana')}`);
                      setLinkCopied(true);
                      toast({ title: 'Đã sao chép!', description: 'Link apply đã được copy vào clipboard' });
                      setTimeout(() => setLinkCopied(false), 2000);
                    }}
                  >
                    {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-amber-400 text-amber-700 hover:bg-amber-100"
                    onClick={() => window.open(generateApplyLink(job.code, 'nguyenvana'), '_blank')}
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Xem trước
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Gửi link này cho ứng viên qua Zalo, Facebook, Email. CV sẽ tự động gán vào tài khoản của bạn.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <IntroduceCandidateDialog
        open={introduceDialogOpen}
        onOpenChange={setIntroduceDialogOpen}
        job={job}
      />

      <CopyApplyLinkDialog
        open={copyLinkDialogOpen}
        onOpenChange={setCopyLinkDialogOpen}
        job={job}
      />

      <MatchingCandidatesDialog
        open={matchingDialogOpen}
        onOpenChange={setMatchingDialogOpen}
        job={job}
      />
    </MainLayout>
  );
}
