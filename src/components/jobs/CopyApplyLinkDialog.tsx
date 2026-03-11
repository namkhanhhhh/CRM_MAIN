import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Copy, 
  Check,
  Link as LinkIcon,
  Briefcase,
  Building2,
  User,
  ExternalLink,
} from 'lucide-react';
import { OpenJob, generateApplyLink } from '@/types/job';

interface CopyApplyLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: OpenJob | null;
}

export function CopyApplyLinkDialog({
  open,
  onOpenChange,
  job,
}: CopyApplyLinkDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Mock current headhunter - in real app, get from auth context
  const currentHeadhunter = {
    id: 'hh-1',
    name: 'Nguyễn Văn A',
    slug: 'nguyenvana',
  };

  if (!job) return null;

  // Generate the apply link for this headhunter
  const applyPath = `/apply/${currentHeadhunter.slug}/${job.code.toLowerCase()}`;
  const fullApplyLink = `${window.location.origin}${applyPath}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullApplyLink);
      setCopied(true);
      toast({
        title: 'Đã sao chép!',
        description: 'Link apply đã được sao chép vào clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Không thể sao chép link. Vui lòng thử lại.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenPreview = () => {
    window.open(applyPath, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Lấy Link Apply cho Ứng viên
          </DialogTitle>
          <DialogDescription>
            Link này được gắn với tài khoản của bạn. Khi ứng viên apply qua link này, 
            CV sẽ tự động được gán cho bạn.
          </DialogDescription>
        </DialogHeader>

        {/* Job & Headhunter Info */}
        <div className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{job.title}</span>
              <span className="text-muted-foreground">({job.code})</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{job.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Headhunter: <strong className="text-foreground">{currentHeadhunter.name}</strong></span>
            </div>
          </div>

          {/* Apply Link */}
          <div className="space-y-2">
            <Label>Link Apply của bạn</Label>
            <div className="flex gap-2">
              <Input 
                value={fullApplyLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button 
                onClick={handleCopy}
                className={copied ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Đã chép
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Sao chép
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview Button */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleOpenPreview}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Xem trước trang Apply
          </Button>

          {/* Instructions */}
          <div className="bg-muted rounded-lg p-4 text-sm">
            <h4 className="font-medium text-foreground mb-2">Hướng dẫn sử dụng:</h4>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>Sao chép link và gửi cho ứng viên qua Zalo, Facebook, Email...</li>
              <li>Ứng viên sẽ xem được JD và upload CV trực tiếp</li>
              <li>CV sẽ tự động xuất hiện trong dashboard của bạn</li>
              <li>Không cần tìm kiếm hay upload lại CV thủ công</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
