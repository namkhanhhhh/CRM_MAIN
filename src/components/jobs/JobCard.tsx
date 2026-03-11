import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Users,
  Briefcase,
  Eye,
  Copy,
} from 'lucide-react';
import { OpenJob, generateApplyLink } from '@/types/job';
import { useToast } from '@/hooks/use-toast';

interface JobCardProps {
  job: OpenJob;
  onIntroduce: () => void;
}

export function JobCard({ job, onIntroduce }: JobCardProps) {
  const { toast } = useToast();

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}${generateApplyLink(job.code, 'current-user')}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Đã sao chép link',
      description: 'Link apply đã được sao chép vào clipboard',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-pink-500 border-t border-r border-b border-border">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-pink-500" />
            <span className="font-medium text-pink-500">[{job.code}]</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-pink-500"
              onClick={handleCopyLink}
              title="Copy link apply"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 text-pink-500 text-xs">
              <Users className="h-3 w-3" />
              <span>Số lượng tuyển: {job.candidateCount}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 min-h-[48px]">
          {job.title}
        </h3>

        {/* Company & Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-4 w-4 flex-shrink-0 text-pink-400" />
            <span className="truncate">{job.clientName}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <DollarSign className="h-4 w-4" />
              <span>{job.salary}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-pink-500"></span>
              <span className="text-xs">{job.interviewRounds} vòng PV</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Bảo hành: {job.guaranteeDays} ngày</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Đăng: {new Date(job.postedAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Button
          variant="outline"
          className="flex-1 border-pink-500 text-pink-500 hover:bg-pink-50 hover:text-pink-600"
          onClick={onIntroduce}
        >
          Giới thiệu ứng viên
        </Button>
        <Button
          asChild
          className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
        >
          <Link to={`/jobs/${job.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            Xem chi tiết
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
