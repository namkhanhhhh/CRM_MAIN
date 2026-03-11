import { useState, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Plus } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CustomReminderType, CUSTOM_REMINDER_STATUSES, CUSTOM_REMINDER_STATUS_COLORS } from '@/types/customer';
import { useCustomerData } from '@/context/CustomerDataContext';

interface CreateCustomReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCustomReminderDialog({ open, onOpenChange }: CreateCustomReminderDialogProps) {
  const { customers, addCustomReminder } = useCustomerData();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [reminderType, setReminderType] = useState<CustomReminderType>('Follow up');
  const [note, setNote] = useState('');
  const [dateMode, setDateMode] = useState<'pick' | 'days'>('pick');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [daysFromNow, setDaysFromNow] = useState('');

  const eligibleCustomers = useMemo(() =>
    customers.filter(c => CUSTOM_REMINDER_STATUSES.includes(c.status))
      .sort((a, b) => a.companyName.localeCompare(b.companyName)),
    [customers]
  );

  // Auto-set reminder type when customer changes
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer && CUSTOM_REMINDER_STATUSES.includes(customer.status)) {
      setReminderType(customer.status);
    }
  };

  const computedDate = useMemo(() => {
    if (dateMode === 'pick') return selectedDate;
    const days = parseInt(daysFromNow);
    if (isNaN(days) || days <= 0) return undefined;
    return addDays(new Date(), days);
  }, [dateMode, selectedDate, daysFromNow]);

  const handleSubmit = () => {
    if (!selectedCustomerId || !computedDate || !note.trim()) return;
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    addCustomReminder({
      id: `custom-${Date.now()}`,
      customerId: selectedCustomerId,
      customerName: customer.companyName,
      remindDate: format(computedDate, 'yyyy-MM-dd'),
      note: note.trim(),
      type: reminderType,
      createdBy: '1',
      createdAt: new Date().toISOString(),
      isCompleted: false,
    });

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setSelectedCustomerId('');
    setReminderType('Follow up');
    setNote('');
    setSelectedDate(undefined);
    setDaysFromNow('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Tạo lịch nhắc nhở
          </DialogTitle>
          <DialogDescription>
            Tạo lịch nhắc nhở tùy chỉnh cho khách hàng từ Follow up trở đi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Customer Select */}
          <div className="space-y-2">
            <Label>Khách hàng <span className="text-destructive">*</span></Label>
            <Select value={selectedCustomerId} onValueChange={handleCustomerChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khách hàng..." />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {eligibleCustomers.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <span>{c.companyName}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({c.status})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reminder Type - Status based */}
          <div className="space-y-2">
            <Label>Loại nhắc nhở (Status)</Label>
            <Select value={reminderType} onValueChange={(v) => setReminderType(v as CustomReminderType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUSTOM_REMINDER_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2.5 h-2.5 rounded-full', CUSTOM_REMINDER_STATUS_COLORS[status] || 'bg-muted')} />
                      {status}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection Mode */}
          <div className="space-y-2">
            <Label>Ngày nhắc nhở <span className="text-destructive">*</span></Label>
            <Tabs value={dateMode} onValueChange={(v) => setDateMode(v as 'pick' | 'days')}>
              <TabsList className="w-full">
                <TabsTrigger value="pick" className="flex-1">Chọn ngày cụ thể</TabsTrigger>
                <TabsTrigger value="days" className="flex-1">Nhập số ngày</TabsTrigger>
              </TabsList>
            </Tabs>

            {dateMode === 'pick' ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left', !selectedDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi }) : 'Chọn ngày...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="number" min="1" placeholder="Nhập số ngày..."
                  value={daysFromNow} onChange={(e) => setDaysFromNow(e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">ngày từ hôm nay</span>
              </div>
            )}

            {computedDate && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                Ngày nhắc: <span className="font-medium text-foreground">{format(computedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}</span>
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Ghi chú <span className="text-destructive">*</span></Label>
            <Textarea placeholder="Nội dung nhắc nhở, mục đích liên hệ..." value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={!selectedCustomerId || !computedDate || !note.trim()} className="gap-1">
            <Plus className="h-4 w-4" />
            Tạo nhắc nhở
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}