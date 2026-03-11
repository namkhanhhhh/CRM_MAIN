import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, FileText, ExternalLink } from 'lucide-react';
import { OpenJob } from '@/types/job';

interface MatchingCandidate {
  id: string;
  name: string;
  position: string;
  email: string;
  matchPercentage: number;
  cvUrl: string;
}

// Mock data for matching candidates
const mockMatchingCandidates: MatchingCandidate[] = [
  {
    id: '1',
    name: 'Quan Huynh',
    position: 'Product Owner (Games)',
    email: 'quanhuynh0405@gmail.com',
    matchPercentage: 75,
    cvUrl: '#',
  },
  {
    id: '2',
    name: 'Trần Quốc Thịnh',
    position: 'Senior Game Designer/Product Owner',
    email: 'thinhtran250489@gmail.com',
    matchPercentage: 70,
    cvUrl: '#',
  },
  {
    id: '3',
    name: 'Nguyễn Đức Tiến',
    position: 'Game Producer - Project Manager',
    email: 'duc.tien.6c11@gmail.com',
    matchPercentage: 70,
    cvUrl: '#',
  },
  {
    id: '4',
    name: 'Huỳnh Giáo Kỹ',
    position: 'GAME PRODUCT OWNER / PRODUCTION LEAD',
    email: 'ky.huynh@gmail.com',
    matchPercentage: 70,
    cvUrl: '#',
  },
  {
    id: '5',
    name: 'Lê Văn Minh',
    position: 'Product Manager - Gaming',
    email: 'minh.le@gmail.com',
    matchPercentage: 65,
    cvUrl: '#',
  },
];

interface MatchingCandidatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: OpenJob | null;
}

export function MatchingCandidatesDialog({
  open,
  onOpenChange,
  job,
}: MatchingCandidatesDialogProps) {
  if (!job) return null;

  const candidates = mockMatchingCandidates;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="bg-pink-500 text-white p-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Users className="h-5 w-5" />
            Ứng viên phù hợp
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Job Info */}
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">Vị trí:</span>{' '}
              <span className="font-medium">{job.title}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Công ty: {job.clientName}
            </p>
          </div>

          {/* Count */}
          <p className="text-sm">
            Tìm thấy <span className="text-pink-500 font-semibold">{candidates.length}</span> ứng viên phù hợp
          </p>

          {/* Candidates List */}
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="border-b border-border pb-4 last:border-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {candidate.name}
                        </span>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          {candidate.matchPercentage}% phù hợp
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {candidate.position}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {candidate.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Xem CV
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Close Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
