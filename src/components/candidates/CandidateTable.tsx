import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, FileText } from 'lucide-react';
import { Candidate } from '@/types/candidate';
import { CategoryBadge } from './CategoryBadge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CandidateTableProps {
  candidates: Candidate[];
  onDelete?: (candidate: Candidate) => void;
}

export function CandidateTable({ candidates, onDelete }: CandidateTableProps) {
  const navigate = useNavigate();
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-center font-semibold">TÊN</TableHead>
            <TableHead className="text-center font-semibold">EMAIL</TableHead>
            <TableHead className="text-center font-semibold">ĐIỆN THOẠI</TableHead>
            <TableHead className="text-center font-semibold">ĐỊA CHỈ</TableHead>
            <TableHead className="text-center font-semibold">PHÂN LOẠI</TableHead>
            <TableHead className="text-center font-semibold">VỊ TRÍ ỨNG TUYỂN</TableHead>
            <TableHead className="text-center font-semibold">THAO TÁC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Không có ứng viên nào
              </TableCell>
            </TableRow>
          ) : (
            candidates.map((candidate) => (
              <TableRow key={candidate.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-center">
                  {candidate.fullName}
                </TableCell>
                <TableCell className="text-center">
                  <a href={`mailto:${candidate.email}`} className="text-primary hover:underline">
                    {candidate.email}
                  </a>
                </TableCell>
                <TableCell className="text-center">{candidate.phone}</TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {candidate.address || '-'}
                </TableCell>
                <TableCell className="text-center">
                  <CategoryBadge category={candidate.category} />
                </TableCell>
                <TableCell className="text-center">
                  {candidate.positionApplied ? (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      {candidate.positionApplied}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    {candidate.cvUrl && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xem CV</TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => navigate(`/candidates/database/${candidate.id}`)}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xem chi tiết</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => onDelete?.(candidate)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Xóa</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
