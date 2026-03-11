import { useState, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanyNameInputProps {
  value: string;
  onChange: (value: string) => void;
  existingCompanies: string[];
}

// Normalize text for comparison: lowercase, remove extra spaces, remove common prefixes
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    // Remove common business prefixes/suffixes for comparison
    .replace(/^(công ty|cty|cthh|tnhh|cp|cổ phần|limited|ltd|inc|corp|corporation|company|group)\s*/gi, '')
    .replace(/\s*(công ty|cty|cthh|tnhh|cp|cổ phần|limited|ltd|inc|corp|corporation|company|group)$/gi, '');
};

// Extract keywords from a company name
const extractKeywords = (text: string): string[] => {
  const normalized = normalizeText(text);
  return normalized.split(/\s+/).filter(word => word.length >= 2);
};

export function CompanyNameInput({ value, onChange, existingCompanies }: CompanyNameInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find matching companies
  const matchingCompanies = useMemo(() => {
    if (!value || value.length < 2) return [];

    const inputNormalized = normalizeText(value);
    const inputKeywords = extractKeywords(value);

    return existingCompanies.filter(company => {
      const companyNormalized = normalizeText(company);
      const companyKeywords = extractKeywords(company);

      // Check 1: Direct substring match (normalized)
      if (companyNormalized.includes(inputNormalized) || inputNormalized.includes(companyNormalized)) {
        return true;
      }

      // Check 2: Any input keyword matches any company keyword
      for (const inputKw of inputKeywords) {
        for (const companyKw of companyKeywords) {
          // Exact keyword match or one contains the other
          if (inputKw === companyKw || 
              (inputKw.length >= 3 && companyKw.includes(inputKw)) ||
              (companyKw.length >= 3 && inputKw.includes(companyKw))) {
            return true;
          }
        }
      }

      return false;
    });
  }, [value, existingCompanies]);

  // Check for exact duplicate (case-insensitive, normalized)
  const isDuplicate = useMemo(() => {
    if (!value) return false;
    const inputNormalized = normalizeText(value);
    return existingCompanies.some(company => normalizeText(company) === inputNormalized);
  }, [value, existingCompanies]);

  const handleSelectCompany = (company: string) => {
    onChange(company);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const showDropdown = isFocused && matchingCompanies.length > 0 && value.length >= 2;

  return (
    <div className="space-y-2">
      <Label htmlFor="companyName">Tên công ty *</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id="companyName"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow click on dropdown items
            setTimeout(() => setIsFocused(false), 200);
          }}
          placeholder="Nhập tên công ty"
          className={cn(
            isDuplicate && "border-destructive focus-visible:ring-destructive"
          )}
          required
          autoComplete="off"
        />
        
        {/* Dropdown list of matching companies */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-md">
            <div className="p-2 border-b bg-muted/50">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-destructive" />
                Tìm thấy {matchingCompanies.length} công ty tương tự
              </p>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {matchingCompanies.slice(0, 10).map((company, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectCompany(company);
                  }}
                >
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{company}</span>
                </div>
              ))}
              {matchingCompanies.length > 10 && (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  và {matchingCompanies.length - 10} công ty khác...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Warning only shows when exact duplicate is detected */}
      {isDuplicate && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Tên công ty này đã tồn tại trong hệ thống. Vui lòng chọn tên khác.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
