import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Minus, Plus, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface JobCountInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function JobCountInput({ value, onChange, min = 1, max = 10 }: JobCountInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const validateAndUpdate = (newValue: string) => {
    setInputValue(newValue);
    setError(null);

    // Empty check
    if (newValue.trim() === '') {
      setError('Vui lòng nhập số lượng job');
      return;
    }

    // Check if it's a valid number
    if (!/^\d+$/.test(newValue)) {
      setError('Chỉ được nhập số nguyên dương');
      return;
    }

    const num = parseInt(newValue, 10);

    // Check minimum
    if (num < min) {
      setError(`Số lượng tối thiểu là ${min}`);
      return;
    }

    // Check maximum
    if (num > max) {
      setError(`Số lượng tối đa là ${max}`);
      return;
    }

    onChange(num);
  };

  const handleIncrement = () => {
    const newValue = Math.min(value + 1, max);
    onChange(newValue);
    setError(null);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - 1, min);
    onChange(newValue);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <Label>Số lượng Job</Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={handleDecrement}
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => validateAndUpdate(e.target.value)}
          className="w-20 text-center"
          placeholder="1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={handleIncrement}
          disabled={value >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          (Tối đa {max} jobs)
        </span>
      </div>
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
