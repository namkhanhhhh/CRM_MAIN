import { Badge } from '@/components/ui/badge';
import { CandidateCategory } from '@/types/candidate';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: CandidateCategory;
  className?: string;
}

const categoryConfig: Record<CandidateCategory, { 
  label: string; 
  className: string;
}> = {
  'Potential': { 
    label: 'Tiềm năng', 
    className: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200',
  },
  'Normal': { 
    label: 'Bình thường', 
    className: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
  },
  'Client-Hired': { 
    label: 'Ứng tuyển', 
    className: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
  }
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
