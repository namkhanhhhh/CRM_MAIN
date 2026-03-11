import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Plus, 
  Building2, 
  Briefcase,
  FileText,
} from 'lucide-react';
import { OpenJob } from '@/types/job';

interface Candidate {
  id: string;
  name: string;
  position?: string;
  email: string;
  hasCV: boolean;
}

const mockCandidates: Candidate[] = [
  { id: '1', name: 'Đinh Văn Đức Hoàn', position: 'Chưa có vị trí', email: 'hoandinh.ptit023@gmail.com', hasCV: true },
  { id: '2', name: 'Đinh Văn Đức Hoàn', position: 'Chưa có vị trí', email: 'hoandinh.ptit02@gmail.com', hasCV: false },
  { id: '3', name: 'Nguyễn Thị Mai', position: 'Frontend Developer', email: 'mai.nguyen@gmail.com', hasCV: true },
  { id: '4', name: 'Trần Văn Minh', position: 'Backend Developer', email: 'minh.tran@gmail.com', hasCV: true },
];

interface IntroduceCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: OpenJob | null;
}

export function IntroduceCandidateDialog({
  open,
  onOpenChange,
  job,
}: IntroduceCandidateDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCandidates = mockCandidates.filter(
    c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-primary">
            Giới thiệu Ứng viên
          </DialogTitle>
        </DialogHeader>

        {/* Job Info */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Công việc: {job.title}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Công ty: {job.clientName}</span>
          </div>
        </div>

        <Separator />

        {/* Add New Candidate */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Thêm Ứng viên mới</h4>
          <Button 
            variant="outline" 
            className="w-full border-dashed"
            onClick={() => {
              // TODO: Navigate to add candidate
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm Ứng viên
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">hoặc</span>
          <Separator className="flex-1" />
        </div>

        {/* Search Existing Candidates */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Chọn từ danh sách có sẵn</h4>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{candidate.name}</p>
                    <p className="text-xs text-muted-foreground">{candidate.position}</p>
                    <p className="text-xs text-muted-foreground">{candidate.email}</p>
                    {candidate.hasCV && (
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Có CV
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
