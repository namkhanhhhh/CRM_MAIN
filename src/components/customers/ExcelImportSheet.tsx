import { useState, useRef } from 'react';
import { Customer, CustomerStatus, CustomerDomain, JobSource, Priority, ContactInfo } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ExcelImportSheetProps {
  onImport: (customers: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
}

interface ParsedRow {
  companyName: string;
  domain: CustomerDomain;
  status: CustomerStatus;
  priority: Priority;
  job?: string;
  jobLink?: string;
  jobSource?: JobSource;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactLinkedin?: string;
  companyNote?: string;
  remindDate?: string;
  isValid: boolean;
  errors: string[];
}

const TEMPLATE_HEADERS = [
  'Tên công ty (*)',
  'Lĩnh vực (*)',
  'Trạng thái (*)',
  'Độ ưu tiên',
  'Vị trí tuyển',
  'Link Job',
  'Nguồn Job',
  'Tên liên hệ',
  'Email liên hệ',
  'SĐT liên hệ',
  'LinkedIn liên hệ',
  'Ghi chú công ty',
  'Ngày nhắc nhở (DD/MM/YYYY)',
];

const VALID_DOMAINS: CustomerDomain[] = [
  'IT', 'IT - product', 'IT - outsourcing', 'Ecommerce', 'Game', 'Mobile app',
  'Non IT (Manufacturing)', 'Non IT (Logistic)', 'Non IT (FMCG)',
  'Non IT (BĐS)', 'Non IT (Retail)', 'Non-IT', 'Others'
];

const VALID_STATUSES: CustomerStatus[] = [
  'Research', 'Addfriend/Connect', 'Approach', 'Follow up', 'Consulting',
  'Demo contract', 'Signing', 'Signed', 'Meeting Clear JD', 'Hunting',
  'Take care', 'No current need', 'Excluded', 'Rejected'
];

const VALID_JOB_SOURCES: JobSource[] = [
  'Facebook', 'Linkedin', 'Thread', 'Itviec', 'Topdev', 'Aniday', 'Job Portal', 'Referral', 'Khác'
];

export function ExcelImportSheet({ onImport }: ExcelImportSheetProps) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent = [
      TEMPLATE_HEADERS.join(','),
      // Sample rows
      'FPT Software,IT - outsourcing,Research,high,Senior Backend Developer,https://itviec.com/fpt-123,Itviec,Nguyễn Văn A,a@fpt.com.vn,0901234567,https://linkedin.com/in/nguyenvana,Công ty lớn TOP 10 IT VN,15/02/2025',
      'Tiki Corporation,Ecommerce,Approach,normal,Frontend Developer,,Linkedin,Trần Thị B,b@tiki.vn,,,,',
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'customer_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Đã tải template',
      description: 'File mẫu đã được tải về. Mở bằng Excel và điền thông tin.',
    });
  };

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Skip header row
    const dataLines = lines.slice(1);
    
    return dataLines.map(line => {
      // Handle CSV with quoted fields
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const errors: string[] = [];
      
      // Validate required fields
      const companyName = values[0] || '';
      const domain = values[1] || '';
      const status = values[2] || '';
      const priority = (values[3] || 'normal').toLowerCase();

      if (!companyName) errors.push('Thiếu tên công ty');
      if (!domain) errors.push('Thiếu lĩnh vực');
      else if (!VALID_DOMAINS.includes(domain as CustomerDomain)) {
        errors.push(`Lĩnh vực "${domain}" không hợp lệ`);
      }
      if (!status) errors.push('Thiếu trạng thái');
      else if (!VALID_STATUSES.includes(status as CustomerStatus)) {
        errors.push(`Trạng thái "${status}" không hợp lệ`);
      }
      if (priority && !['high', 'normal'].includes(priority)) {
        errors.push('Độ ưu tiên phải là "high" hoặc "normal"');
      }

      const jobSource = values[6] || '';
      if (jobSource && !VALID_JOB_SOURCES.includes(jobSource as JobSource)) {
        errors.push(`Nguồn job "${jobSource}" không hợp lệ`);
      }

      // Parse remind date
      let remindDate: string | undefined;
      const remindDateStr = values[12] || '';
      if (remindDateStr) {
        const parts = remindDateStr.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          remindDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          errors.push('Ngày nhắc nhở không đúng định dạng DD/MM/YYYY');
        }
      }

      return {
        companyName,
        domain: domain as CustomerDomain,
        status: status as CustomerStatus,
        priority: (priority === 'high' ? 'high' : 'normal') as Priority,
        job: values[4] || undefined,
        jobLink: values[5] || undefined,
        jobSource: jobSource as JobSource || undefined,
        contactName: values[7] || undefined,
        contactEmail: values[8] || undefined,
        contactPhone: values[9] || undefined,
        contactLinkedin: values[10] || undefined,
        companyNote: values[11] || undefined,
        remindDate,
        isValid: errors.length === 0,
        errors,
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setParsedData(parsed);
      setIsLoading(false);
    };
    reader.onerror = () => {
      toast({
        title: 'Lỗi đọc file',
        description: 'Không thể đọc file. Vui lòng thử lại.',
        variant: 'destructive',
      });
      setIsLoading(false);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = () => {
    const validRows = parsedData.filter(row => row.isValid);
    if (validRows.length === 0) {
      toast({
        title: 'Không có dữ liệu hợp lệ',
        description: 'Vui lòng kiểm tra lại file và sửa các lỗi.',
        variant: 'destructive',
      });
      return;
    }

    const customers: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[] = validRows.map(row => {
      const contacts: ContactInfo[] = [];
      if (row.contactName) {
        contacts.push({
          name: row.contactName,
          email: row.contactEmail,
          phone: row.contactPhone,
          linkedin: row.contactLinkedin,
        });
      }

      return {
        date: new Date().toISOString().split('T')[0],
        remindDate: row.remindDate,
        status: row.status,
        domain: row.domain,
        companyName: row.companyName,
        companyNote: row.companyNote,
        job: row.job,
        jobLink: row.jobLink,
        jobSource: row.jobSource,
        contacts,
        priority: row.priority,
        bdAssigned: currentUser.id,
      };
    });

    onImport(customers);
    setOpen(false);
    setParsedData([]);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast({
      title: 'Import thành công',
      description: `Đã thêm ${customers.length} khách hàng vào hệ thống.`,
    });
  };

  const clearFile = () => {
    setParsedData([]);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = parsedData.filter(r => r.isValid).length;
  const invalidCount = parsedData.filter(r => !r.isValid).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Excel
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Import khách hàng từ Excel/CSV
          </SheetTitle>
          <SheetDescription>
            Tải lên file CSV để thêm nhiều khách hàng cùng lúc. Sử dụng template có sẵn để đảm bảo format đúng.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Template Download */}
          <div className="rounded-lg border border-dashed border-border p-4">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-accent p-2">
                <Download className="h-5 w-5 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Tải file mẫu</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Tải file CSV mẫu, mở bằng Excel và điền thông tin khách hàng theo format có sẵn.
                </p>
                <Button variant="link" className="h-auto p-0 mt-2" onClick={downloadTemplate}>
                  <Download className="mr-1 h-3.5 w-3.5" />
                  Tải template (.csv)
                </Button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Chọn file để import</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="flex-1"
              />
              {fileName && (
                <Button variant="ghost" size="icon" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Hỗ trợ file .csv, .xlsx (Excel)
            </p>
          </div>

          {/* Preview */}
          {parsedData.length > 0 && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  {validCount} hợp lệ
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {invalidCount} lỗi
                  </Badge>
                )}
              </div>

              {/* Error Alert */}
              {invalidCount > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Có {invalidCount} dòng lỗi</AlertTitle>
                  <AlertDescription>
                    Các dòng lỗi sẽ không được import. Kiểm tra bảng bên dưới để xem chi tiết.
                  </AlertDescription>
                </Alert>
              )}

              {/* Data Preview */}
              <div className="rounded-lg border">
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[40px]">#</TableHead>
                        <TableHead>Công ty</TableHead>
                        <TableHead>Lĩnh vực</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Lỗi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.map((row, index) => (
                        <TableRow key={index} className={!row.isValid ? 'bg-destructive/5' : ''}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{row.companyName || '-'}</TableCell>
                          <TableCell>{row.domain || '-'}</TableCell>
                          <TableCell>{row.status || '-'}</TableCell>
                          <TableCell>
                            {row.isValid ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <span className="text-xs text-destructive">
                                {row.errors.join(', ')}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={validCount === 0 || isLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import {validCount > 0 ? `(${validCount})` : ''}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
