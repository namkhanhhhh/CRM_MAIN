import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Upload,
  FileText,
  User,
  Mail,
  Phone,
  CheckCircle,
  Shield,
  Layers,
  Send,
  AlertCircle,
} from 'lucide-react';
import { getOpenJobByCode, getHeadhunterById } from '@/data/openJobMockData';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export default function CandidateApplyPage() {
  const { headhunterSlug, jobCode } = useParams<{ headhunterSlug: string; jobCode: string }>();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    note: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Find job by code
  const job = useMemo(() => {
    if (!jobCode) return null;
    return getOpenJobByCode(jobCode.toUpperCase());
  }, [jobCode]);

  // Find headhunter - in real app, lookup by slug
  const headhunter = useMemo(() => {
    // Mock: map slug to headhunter
    const slugToId: Record<string, string> = {
      'nguyenvana': 'hh-1',
      'tranthib': 'hh-2',
      'levanc': 'hh-3',
      'phamthid': 'hh-4',
      'hoangvane': 'hh-5',
    };
    const hhId = slugToId[headhunterSlug || ''];
    return hhId ? getHeadhunterById(hhId) : null;
  }, [headhunterSlug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    
    if (!file) {
      setCvFile(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError('Chỉ chấp nhận file PDF, DOC, DOCX');
      setCvFile(null);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File không được vượt quá 10MB');
      setCvFile(null);
      return;
    }

    setCvFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cvFile) {
      setFileError('Vui lòng upload CV của bạn');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: 'Đã gửi thành công!',
      description: 'CV của bạn đã được gửi đến nhà tuyển dụng.',
    });
  };

  // Invalid link
  if (!job || !headhunter) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Link không hợp lệ</h2>
            <p className="text-muted-foreground">
              Link ứng tuyển này không tồn tại hoặc đã hết hạn. 
              Vui lòng liên hệ nhà tuyển dụng để nhận link mới.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ứng tuyển thành công!</h2>
            <p className="text-muted-foreground mb-4">
              CV của bạn đã được gửi đến <strong>{headhunter.name}</strong> tại TD Consulting.
              Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
            <div className="bg-muted rounded-lg p-4 text-left">
              <p className="text-sm font-medium">{job.title}</p>
              <p className="text-sm text-muted-foreground">{job.clientName}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Gradient Top Bar */}
      <div className="h-24 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400" />
      
      {/* Job Header Card - Overlapping the gradient */}
      <div className="bg-background flex-1">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Header Card */}
          <div className="bg-card rounded-xl shadow-lg -mt-12 p-6 md:p-8 border">
            {/* Job Code + Title */}
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">
              <span className="text-pink-600">[{job.code}]</span> {job.title}
            </h1>
            
            {/* Key Info Badges */}
            <div className="flex flex-wrap gap-6 md:gap-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Salary</p>
                  <p className="font-semibold text-pink-600">{job.salary}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-semibold text-pink-600">{job.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-semibold text-pink-600">{job.industry}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Job Type</p>
                  <p className="font-semibold text-pink-600">{job.jobType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
            {/* Job Description - Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Description */}
              <div className="space-y-4">
                <div 
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: job.description + job.requirements + job.benefits }}
                />
              </div>

              {/* Working Info */}
              <div className="border-t pt-6 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-pink-500" />
                  Thông tin làm việc
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Địa điểm:</strong> {job.workingLocation}</p>
                  <p><strong>Thời gian:</strong> {job.workingTime}</p>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* Apply Now Button */}
              <Button 
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-6 text-base rounded-full shadow-md"
                onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Apply now
              </Button>

              {/* Owner Info */}
              <Card className="border shadow-sm">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-white border-2 border-pink-200 flex items-center justify-center">
                      <span className="text-pink-600 font-bold text-sm">TD</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Owner Info</p>
                      <p className="text-sm text-muted-foreground">TD Consulting</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email */}
              <Card className="border shadow-sm">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-white border-2 border-pink-200 flex items-center justify-center">
                      <span className="text-pink-600 font-bold text-sm">TD</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">infor@tdconsulting.vn</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Apply Form */}
              <Card id="apply-form" className="border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-pink-600">
                    <Send className="h-5 w-5" />
                    Ứng tuyển ngay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm">
                        Họ và tên <span className="text-pink-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Nguyễn Văn A"
                        required
                        className="focus-visible:ring-pink-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">
                        Email <span className="text-pink-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                        required
                        className="focus-visible:ring-pink-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">
                        Số điện thoại <span className="text-pink-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="0901234567"
                        required
                        className="focus-visible:ring-pink-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cv" className="text-sm">
                        Upload CV <span className="text-pink-500">*</span>
                      </Label>
                      <div className="border-2 border-dashed border-pink-200 rounded-lg p-4 text-center hover:border-pink-400 hover:bg-pink-50/50 transition-colors">
                        <input
                          type="file"
                          id="cv"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                        />
                        <label htmlFor="cv" className="cursor-pointer">
                          {cvFile ? (
                            <div className="flex items-center justify-center gap-2 text-pink-600">
                              <FileText className="h-5 w-5" />
                              <span className="text-sm font-medium">{cvFile.name}</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-6 w-6 mx-auto mb-2 text-pink-400" />
                              <p className="text-sm text-muted-foreground">
                                Kéo thả hoặc click để upload
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PDF, DOC, DOCX (tối đa 10MB)
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                      {fileError && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {fileError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="note" className="text-sm">Ghi chú (không bắt buộc)</Label>
                      <Textarea
                        id="note"
                        value={formData.note}
                        onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                        placeholder="Thông tin thêm về bạn..."
                        rows={3}
                        className="focus-visible:ring-pink-500"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        'Đang gửi...'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Gửi đơn ứng tuyển
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 border-t py-6">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 TD Consulting. Đối tác tuyển dụng tin cậy của bạn.</p>
        </div>
      </footer>
    </div>
  );
}
