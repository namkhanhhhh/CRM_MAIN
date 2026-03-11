import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface InlineSelectProps<T extends string> {
  value: T;
  options: T[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
  renderValue?: (value: T) => React.ReactNode;
}

export function InlineSelect<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  className,
  renderValue,
}: InlineSelectProps<T>) {
  if (disabled) {
    return (
      <span className={cn("text-muted-foreground", className)}>
        {renderValue ? renderValue(value) : value}
      </span>
    );
  }

  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger 
        className={cn(
          "h-7 w-auto min-w-[100px] border-dashed bg-transparent text-xs",
          className
        )}
      >
        <SelectValue>
          {renderValue ? renderValue(value) : value}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt} className="text-xs">
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
