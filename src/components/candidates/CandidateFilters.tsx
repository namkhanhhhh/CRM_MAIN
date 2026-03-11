import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface CandidateFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  positionFilter: string;
  onPositionChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  positions: string[];
}

export function CandidateFilters({
  searchTerm,
  onSearchChange,
  positionFilter,
  onPositionChange,
  categoryFilter,
  onCategoryChange,
  positions,
}: CandidateFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên, email, SĐT..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={positionFilter} onValueChange={onPositionChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Vị trí ứng tuyển" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả vị trí</SelectItem>
          {positions.map((position) => (
            <SelectItem key={position} value={position}>
              {position}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Phân loại" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả phân loại</SelectItem>
          <SelectItem value="Potential">Tiềm năng</SelectItem>
          <SelectItem value="Normal">Bình thường</SelectItem>
          <SelectItem value="Client-Hired">Ứng tuyển</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
