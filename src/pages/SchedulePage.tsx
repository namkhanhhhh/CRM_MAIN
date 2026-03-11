import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Customer, CustomerStatus, MILESTONE_STATUSES, CUSTOM_REMINDER_STATUSES, CUSTOM_REMINDER_STATUS_COLORS, CustomReminder } from "@/types/customer";
import { ReminderMilestoneType, isFinalMilestone } from "@/types/reminder";
import { Calendar, Clock, AlertTriangle, CheckCircle, Bell, ChevronRight, CheckCheck, Search, X, Plus } from "lucide-react";
import { format, differenceInDays, addDays, parseISO, isSameDay, isWithinInterval } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCustomerData } from "@/context/CustomerDataContext";
import { ScheduleCalendarDialog } from "@/components/schedule/ScheduleCalendarDialog";
import { DateRangeFilter } from "@/components/schedule/DateRangeFilter";
import { RemindConfirmDialog } from "@/components/schedule/RemindConfirmDialog";
import { CreateCustomReminderDialog } from "@/components/schedule/CreateCustomReminderDialog";
import { DaySchedulePopup, DayItem, MilestoneItem, CustomItem } from "@/components/schedule/DaySchedulePopup";
import { bdUsers } from "@/data/mockData";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

type ScheduleType = "7-day" | "15-day" | "30-day";
type ReminderCategory = "all" | "milestone" | "custom";

interface ScheduleItem {
  customer: Customer;
  scheduleType: ScheduleType;
  dueDate: Date;
  startDate: Date;
  daysRemaining: number;
  status: "overdue" | "today" | "upcoming" | "future";
  reminderCount: number;
  category: "milestone";
}

interface CustomScheduleItem {
  customer: Customer;
  reminder: CustomReminder;
  dueDate: Date;
  daysRemaining: number;
  status: "overdue" | "today" | "upcoming" | "future";
  category: "custom";
}

type AnyScheduleItem = ScheduleItem | CustomScheduleItem;

const getScheduleLabel = (type: ScheduleType): string => {
  switch (type) {
    case "7-day": return "Nhắc nhở 7 ngày";
    case "15-day": return "Nhắc nhở 15 ngày";
    case "30-day": return "Nhắc nhở 30 ngày";
  }
};

const getScheduleDays = (type: ScheduleType): number => {
  switch (type) {
    case "7-day": return 7;
    case "15-day": return 15;
    case "30-day": return 30;
  }
};

const computeStatus = (daysRemaining: number): "overdue" | "today" | "upcoming" | "future" => {
  if (daysRemaining < 0) return "overdue";
  if (daysRemaining === 0) return "today";
  if (daysRemaining <= 3) return "upcoming";
  return "future";
};

export default function SchedulePage() {
  const navigate = useNavigate();
  const {
    customers, reminderHistory, reminderSchedules, customReminders,
    addReminderHistory, updateReminderSchedule, updateCustomer, completeCustomReminder,
  } = useCustomerData();

  const [activeTab, setActiveTab] = useState<"all" | ScheduleType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "overdue" | "today" | "upcoming">("all");
  const [categoryFilter, setCategoryFilter] = useState<ReminderCategory>("all");
  const [bdFilter, setBdFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [searchKeyword, setSearchKeyword] = useState("");

  const [remindDialogOpen, setRemindDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [createReminderOpen, setCreateReminderOpen] = useState(false);
  const [dayPopupOpen, setDayPopupOpen] = useState(false);
  const [dayPopupDate, setDayPopupDate] = useState<Date | null>(null);
  const [dayPopupItems, setDayPopupItems] = useState<DayItem[]>([]);

  // Generate milestone schedule items
  const milestoneItems = useMemo(() => {
    const items: ScheduleItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    customers
      .filter((customer) => MILESTONE_STATUSES.includes(customer.status))
      .forEach((customer) => {
        const customSchedule = reminderSchedules[customer.id];
        const customerReminderHistory = reminderHistory[customer.id] || [];
        const reminderCount = customerReminderHistory.length;

        if (customSchedule) {
          if (customSchedule.currentMilestone === null) return;
          const dueDate = parseISO(customSchedule.nextRemindDate);
          const daysRemaining = differenceInDays(dueDate, today);
          items.push({
            customer, scheduleType: customSchedule.currentMilestone,
            dueDate, startDate: customSchedule.lastRemindDate ? parseISO(customSchedule.lastRemindDate) : parseISO(customer.date),
            daysRemaining, status: computeStatus(daysRemaining), reminderCount: customSchedule.reminderCount, category: "milestone",
          });
        } else {
          const startDate = parseISO(customer.date);
          (["7-day", "15-day", "30-day"] as ScheduleType[]).forEach((scheduleType) => {
            const dueDate = addDays(startDate, getScheduleDays(scheduleType));
            const daysRemaining = differenceInDays(dueDate, today);
            items.push({
              customer, scheduleType, dueDate, startDate, daysRemaining,
              status: computeStatus(daysRemaining), reminderCount, category: "milestone",
            });
          });
        }
      });

    return items;
  }, [customers, reminderSchedules, reminderHistory]);

  // Generate custom schedule items
  const customItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return customReminders
      .filter(r => !r.isCompleted)
      .map((reminder): CustomScheduleItem | null => {
        const customer = customers.find(c => c.id === reminder.customerId);
        if (!customer) return null;
        const dueDate = parseISO(reminder.remindDate);
        const daysRemaining = differenceInDays(dueDate, today);
        return {
          customer, reminder, dueDate, daysRemaining,
          status: computeStatus(daysRemaining), category: "custom",
        };
      })
      .filter((item): item is CustomScheduleItem => item !== null);
  }, [customReminders, customers]);

  // Combine all items
  const allItems = useMemo(() => {
    const combined: AnyScheduleItem[] = [...milestoneItems, ...customItems];
    return combined.sort((a, b) => {
      const statusOrder = { overdue: 0, today: 1, upcoming: 2, future: 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }, [milestoneItems, customItems]);

  const filteredItems = useMemo(() => {
    let items = allItems;

    // Category filter
    if (categoryFilter !== "all") {
      items = items.filter(i => i.category === categoryFilter);
    }

    // Milestone tab filter (only applies to milestone items)
    if (activeTab !== "all") {
      items = items.filter(i => i.category === "milestone" && (i as ScheduleItem).scheduleType === activeTab);
    }

    if (statusFilter !== "all") {
      items = items.filter(i => i.status === statusFilter);
    }

    // BD filter
    if (bdFilter !== "all") {
      items = items.filter(i => i.customer.bdAssigned === bdFilter);
    }

    if (dateRange.start) {
      items = items.filter(i => {
        if (dateRange.end) return isWithinInterval(i.dueDate, { start: dateRange.start!, end: dateRange.end });
        return isSameDay(i.dueDate, dateRange.start!);
      });
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      items = items.filter(i => i.customer.companyName.toLowerCase().includes(keyword));
    }

    return items;
  }, [allItems, activeTab, statusFilter, categoryFilter, bdFilter, dateRange, searchKeyword]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const resetPage = () => setCurrentPage(1);

  const stats = useMemo(() => ({
    total: allItems.length,
    overdue: allItems.filter(i => i.status === "overdue").length,
    today: allItems.filter(i => i.status === "today").length,
    upcoming: allItems.filter(i => i.status === "upcoming").length,
    milestone: milestoneItems.length,
    custom: customItems.length,
  }), [allItems, milestoneItems, customItems]);

  const handleRemindClick = (item: ScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setRemindDialogOpen(true);
  };

  const handleCompleteCustom = (reminderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    completeCustomReminder(reminderId);
  };

  const handleRemindConfirm = (note: string, nextRemindDate: Date | null, nextMilestone: ReminderMilestoneType | null) => {
    if (!selectedItem) return;
    const customerId = selectedItem.customer.id;
    const now = new Date().toISOString();
    const newReminderCount = selectedItem.reminderCount + 1;
    const isFinal = isFinalMilestone(selectedItem.scheduleType as ReminderMilestoneType);

    addReminderHistory(customerId, {
      id: `reminder-${customerId}-${Date.now()}`, customerId, timestamp: now,
      milestoneType: selectedItem.scheduleType as ReminderMilestoneType,
      reminderNumber: newReminderCount, performedBy: "1", note,
      nextRemindDate: nextRemindDate ? format(nextRemindDate, "yyyy-MM-dd") : undefined,
    });

    if (isFinal) {
      updateReminderSchedule(customerId, {
        customerId, currentMilestone: null as any,
        lastRemindDate: format(new Date(), "yyyy-MM-dd"), nextRemindDate: "", reminderCount: newReminderCount,
      });
      updateCustomer(customerId, { remindDate: undefined });
    } else if (nextMilestone && nextRemindDate) {
      updateReminderSchedule(customerId, {
        customerId, currentMilestone: nextMilestone,
        lastRemindDate: format(new Date(), "yyyy-MM-dd"),
        nextRemindDate: format(nextRemindDate, "yyyy-MM-dd"), reminderCount: newReminderCount,
      });
      updateCustomer(customerId, { remindDate: format(nextRemindDate, "yyyy-MM-dd") });
    }
    setSelectedItem(null);
  };

  const handleCalendarDateSelect = (date: Date) => {
    setDateRange({ start: date, end: date });
    resetPage();
  };

  const handleCalendarDayClick = (date: Date) => {
    // Build items for this day
    const dayItems: DayItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Milestone items on this day
    milestoneItems.forEach(item => {
      if (isSameDay(item.dueDate, date)) {
        dayItems.push({ type: 'milestone', customer: item.customer, scheduleType: item.scheduleType, status: item.status });
      }
    });

    // Custom items on this day
    customItems.forEach(item => {
      if (isSameDay(item.dueDate, date)) {
        dayItems.push({ type: 'custom', reminder: item.reminder, customer: item.customer });
      }
    });

    setDayPopupDate(date);
    setDayPopupItems(dayItems);
    setDayPopupOpen(true);
  };

  const getStatusBadge = (status: AnyScheduleItem["status"], daysRemaining: number) => {
    switch (status) {
      case "overdue":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Quá hạn {Math.abs(daysRemaining)} ngày</Badge>;
      case "today":
        return <Badge className="gap-1 bg-warning text-warning-foreground hover:bg-warning/90"><Clock className="h-3 w-3" />Hôm nay</Badge>;
      case "upcoming":
        return <Badge className="gap-1 bg-orange-500 hover:bg-orange-600 text-white"><Bell className="h-3 w-3" />Còn {daysRemaining} ngày</Badge>;
      case "future":
        return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" />Còn {daysRemaining} ngày</Badge>;
    }
  };

  const getScheduleTypeBadge = (type: ScheduleType) => {
    const colors = {
      "7-day": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      "15-day": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      "30-day": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    };
    return <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", colors[type])}>{getScheduleLabel(type)}</span>;
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <Calendar className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Schedule</h1>
              <p className="text-muted-foreground">Lịch nhắc nhở theo dõi khách hàng</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setCreateReminderOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo nhắc nhở
            </Button>
            <ScheduleCalendarDialog
              customers={customers}
              customReminders={customReminders}
              milestoneItems={milestoneItems}
              onDateSelect={handleCalendarDateSelect}
              onDayClick={handleCalendarDayClick}
              selectedDate={dateRange.start}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng lịch nhắc</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">Mốc: {stats.milestone} · Custom: {stats.custom}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quá hạn</p>
                  <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hôm nay</p>
                  <p className="text-2xl font-bold text-warning">{stats.today}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sắp đến hạn</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.upcoming}</p>
                </div>
                <Bell className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Row 1: Search, BD filter, and category tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm công ty..."
                  value={searchKeyword}
                  onChange={(e) => { setSearchKeyword(e.target.value); resetPage(); }}
                  className="pl-9 pr-9"
                />
                {searchKeyword && (
                  <button onClick={() => { setSearchKeyword(""); resetPage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Select value={bdFilter} onValueChange={(v) => { setBdFilter(v); resetPage(); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tất cả BD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả BD</SelectItem>
                  {bdUsers.map(bd => (
                    <SelectItem key={bd.id} value={bd.id}>{bd.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category + Milestone tabs */}
            <div className="flex items-center gap-2">
              <Tabs value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v as ReminderCategory); if (v === "custom") setActiveTab("all"); resetPage(); }}>
                <TabsList>
                  <TabsTrigger value="all">Tất cả</TabsTrigger>
                  <TabsTrigger value="milestone">Mốc ({stats.milestone})</TabsTrigger>
                  <TabsTrigger value="custom">Custom ({stats.custom})</TabsTrigger>
                </TabsList>
              </Tabs>
              {categoryFilter !== "custom" && (
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); resetPage(); }}>
                  <TabsList>
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    <TabsTrigger value="7-day">7 ngày</TabsTrigger>
                    <TabsTrigger value="15-day">15 ngày</TabsTrigger>
                    <TabsTrigger value="30-day">30 ngày</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
          </div>

          {/* Row 2: Date Range + Status */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <DateRangeFilter dateRange={dateRange} onDateRangeChange={(s, e) => { setDateRange({ start: s, end: e }); resetPage(); }} />
            <div className="flex items-center gap-2 sm:ml-auto">
              <span className="text-sm text-muted-foreground">Trạng thái:</span>
              <div className="flex gap-1">
                {[
                  { key: "all", label: "Tất cả", active: "bg-primary text-primary-foreground", inactive: "bg-muted text-muted-foreground hover:bg-accent" },
                  { key: "overdue", label: `Quá hạn (${stats.overdue})`, active: "bg-destructive text-destructive-foreground", inactive: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
                  { key: "today", label: `Hôm nay (${stats.today})`, active: "bg-warning text-warning-foreground", inactive: "bg-warning/10 text-warning hover:bg-warning/20" },
                  { key: "upcoming", label: `Sắp tới (${stats.upcoming})`, active: "bg-orange-500 text-white", inactive: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" },
                ].map(({ key, label, active, inactive }) => (
                  <button key={key} onClick={() => { setStatusFilter(key as typeof statusFilter); resetPage(); }}
                    className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors", statusFilter === key ? active : inactive)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Danh sách nhắc nhở ({filteredItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Không có lịch nhắc nhở nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedItems.map((item, index) => {
                  const isCustom = item.category === "custom";
                  const customItem = isCustom ? item as CustomScheduleItem : null;
                  const milestoneItem = !isCustom ? item as ScheduleItem : null;
                  const statusColor = isCustom ? (CUSTOM_REMINDER_STATUS_COLORS[customItem!.reminder.type] || 'bg-muted') : null;

                  return (
                    <div
                      key={isCustom ? customItem!.reminder.id : `${milestoneItem!.customer.id}-${milestoneItem!.scheduleType}-${index}`}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-accent/50 cursor-pointer",
                        item.status === "overdue" && "border-destructive/50 bg-destructive/5",
                        item.status === "today" && "border-warning/50 bg-warning/5",
                        item.status === "upcoming" && "border-orange-500/50 bg-orange-500/5",
                        isCustom && "border-l-4 border-l-amber-500",
                      )}
                      onClick={() => navigate(`/bd-crm/customers/${item.customer.id}`)}
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold text-foreground">{item.customer.companyName}</span>
                          {isCustom ? (
                            <>
                              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium text-white", statusColor)}>
                                {customItem!.reminder.type}
                              </span>
                              <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:text-amber-400">Custom</Badge>
                            </>
                          ) : (
                            <>
                              {getScheduleTypeBadge(milestoneItem!.scheduleType)}
                              {milestoneItem!.reminderCount > 0 && (
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <CheckCheck className="h-3 w-3" />Đã remind {milestoneItem!.reminderCount} lần
                                </Badge>
                              )}
                            </>
                          )}
                          <Badge variant="outline" className="text-xs">{item.customer.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          {isCustom ? (
                            <>
                              <span className="line-clamp-1 max-w-xs">{customItem!.reminder.note}</span>
                              <span>•</span>
                            </>
                          ) : (
                            <>
                              <span>Bắt đầu: {format(milestoneItem!.startDate, "dd/MM/yyyy", { locale: vi })}</span>
                              <span>→</span>
                            </>
                          )}
                          <span>Đến hạn: {format(item.dueDate, "dd/MM/yyyy", { locale: vi })}</span>
                          {item.customer.bdAssigned && (
                            <>
                              <span>•</span>
                              <span>BD: {bdUsers.find(b => b.id === item.customer.bdAssigned)?.name || item.customer.bdAssigned}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(item.status, item.daysRemaining)}
                        {isCustom ? (
                          <Button variant="outline" size="sm" className="gap-1" onClick={(e) => handleCompleteCustom(customItem!.reminder.id, e)}>
                            <CheckCircle className="h-4 w-4" />Hoàn thành
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="gap-1" onClick={(e) => handleRemindClick(milestoneItem!, e)}>
                            <CheckCircle className="h-4 w-4" />Xác nhận remind
                          </Button>
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground">Trang {currentPage} / {totalPages} ({filteredItems.length} kết quả)</p>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {getPageNumbers().map((page, idx) => (
                          <PaginationItem key={idx}>
                            {page === "ellipsis" ? <PaginationEllipsis /> : (
                              <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink>
                            )}
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RemindConfirmDialog
        open={remindDialogOpen}
        onOpenChange={setRemindDialogOpen}
        customer={selectedItem?.customer || null}
        currentMilestone={(selectedItem?.scheduleType as ReminderMilestoneType) || "7-day"}
        reminderNumber={(selectedItem?.reminderCount || 0) + 1}
        onConfirm={handleRemindConfirm}
      />

      <CreateCustomReminderDialog open={createReminderOpen} onOpenChange={setCreateReminderOpen} />

      <DaySchedulePopup open={dayPopupOpen} onOpenChange={setDayPopupOpen} date={dayPopupDate} items={dayPopupItems} />
    </MainLayout>
  );
}