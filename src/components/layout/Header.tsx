import { useState } from 'react';
import { Bell, Moon, LogOut, ChevronDown, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { mockReminders } from '@/data/mockData';
import { Reminder } from '@/types/customer';
import { StatusBadge } from '@/components/customers/StatusBadge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Reminder[]>(mockReminders);
  const [open, setOpen] = useState(false);

  const unreadCount = reminders.filter((r) => !r.isRead).length;

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Quá hạn ${Math.abs(diffDays)} ngày`;
    }
    if (diffDays === 0) {
      return 'Đúng hạn hôm nay';
    }
    if (diffDays === 1) {
      return 'Còn 1 ngày nữa';
    }
    if (diffDays <= 3) {
      return `Còn ${diffDays} ngày nữa`;
    }
    if (diffDays <= 7) {
      return `Còn ${diffDays} ngày`;
    }
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };

  const getDateColor = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-destructive'; // Quá hạn
    if (diffDays === 0) return 'text-warning'; // Đúng hạn hôm nay
    if (diffDays <= 3) return 'text-orange-500'; // Sắp đến hạn
    return 'text-muted-foreground'; // Còn nhiều thời gian
  };

  const getStatusIcon = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '🔴'; // Quá hạn
    if (diffDays === 0) return '🟡'; // Đúng hạn
    if (diffDays <= 3) return '🟠'; // Sắp đến
    return '🟢'; // An toàn
  };

  const handleMarkAsRead = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isRead: true } : r))
    );
  };

  const handleViewCustomer = (customerId: string) => {
    navigate(`/bd-crm/customers/${customerId}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9">
          <span className="sr-only">Toggle menu</span>
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Auto logout:</span>
          <Badge variant="secondary" className="bg-success text-success-foreground">
            1d
          </Badge>
        </div>

        <Button variant="ghost" size="icon" className="relative">
          <Moon className="h-5 w-5" />
        </Button>

        {/* Reminder Notification */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-semibold">Nhắc nhở Follow-up</h3>
              <p className="text-xs text-muted-foreground">
                {unreadCount} reminder chưa đọc
              </p>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {reminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mb-2" />
                  <p className="text-sm">Không có reminder nào</p>
                </div>
              ) : (
                reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={cn(
                      'border-b border-border p-4 transition-colors hover:bg-muted/50 cursor-pointer',
                      !reminder.isRead && 'bg-accent/30'
                    )}
                    onClick={() => handleViewCustomer(reminder.customerId)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{getStatusIcon(reminder.remindDate)}</span>
                          <span className="font-medium text-sm">
                            {reminder.customerName}
                          </span>
                          <StatusBadge status={reminder.status} className="text-[10px] px-1.5 py-0.5" />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {reminder.message}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <Clock className="h-3 w-3" />
                          <p className={cn('text-xs font-semibold', getDateColor(reminder.remindDate))}>
                            {getDateLabel(reminder.remindDate)}
                          </p>
                        </div>
                      </div>
                      {!reminder.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(reminder.id);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {reminders.length > 0 && (
              <div className="border-t border-border p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    navigate('/bd-crm/customers');
                    setOpen(false);
                  }}
                >
                  Xem tất cả reminders
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  NK
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Nam Khánh</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
