import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JobSource } from '@/types/customer';
import { Briefcase } from 'lucide-react';

const jobSources: JobSource[] = [
  'Facebook', 'Linkedin', 'Thread', 'Itviec', 'Topdev', 'Aniday',
  'Job Portal', 'Referral', 'Khác'
];

export interface JobInfo {
  job: string;
  jobLink: string;
  jobSource: JobSource | '';
}

interface JobInfoFormProps {
  index: number;
  data: JobInfo;
  onChange: (index: number, data: JobInfo) => void;
  showIndex?: boolean;
}

export function JobInfoForm({ index, data, onChange, showIndex = true }: JobInfoFormProps) {
  const handleChange = (field: keyof JobInfo, value: string) => {
    onChange(index, { ...data, [field]: value });
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      {showIndex && (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span>Job {index + 1}</span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`job-${index}`}>Tên Job</Label>
          <Input
            id={`job-${index}`}
            value={data.job}
            onChange={(e) => handleChange('job', e.target.value)}
            placeholder="VD: Frontend Developer"
          />
        </div>

        <div className="space-y-2">
          <Label>Nguồn Job</Label>
          <Select
            value={data.jobSource}
            onValueChange={(value) => handleChange('jobSource', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn nguồn" />
            </SelectTrigger>
            <SelectContent>
              {jobSources.map(js => (
                <SelectItem key={js} value={js}>{js}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`jobLink-${index}`}>Link Job (TopCV, ITviec...)</Label>
        <Input
          id={`jobLink-${index}`}
          value={data.jobLink}
          onChange={(e) => handleChange('jobLink', e.target.value)}
          placeholder="https://itviec.com/... hoặc https://topcv.vn/..."
          type="url"
        />
      </div>
    </div>
  );
}
