import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Customer, CustomerStatus, CustomerDomain, JobSource, Priority, StatusHistoryEntry, CommunicationHistoryEntry } from "@/types/customer";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { HistoryDialog } from "./HistoryDialog";
import { StatusChangeDialog } from "./StatusChangeDialog";
import { QuickNoteDialog } from "./QuickNoteDialog";
import { RemindCell } from "./RemindCell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreVertical, Eye, Pencil, History, Trash2, ExternalLink, MessageSquarePlus } from "lucide-react";
import { bdUsers, mockStatusHistory } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface CustomerTableProps {
  customers: Customer[];
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => void;
  statusHistory?: Record<string, StatusHistoryEntry[]>;
  communicationHistory?: Record<string, CommunicationHistoryEntry[]>;
  onAddStatusHistory?: (customerId: string, entry: StatusHistoryEntry) => void;
  onAddCommunicationHistory?: (customerId: string, entry: CommunicationHistoryEntry) => void;
}

const statuses: CustomerStatus[] = [
  "Research",
  "Addfriend/Connect",
  "Approach",
  "Follow up",
  "Consulting",
  "Demo contract",
  "Signing",
  "Signed",
  "Meeting Clear JD",
  "Hunting",
  "Take care",
  "No current need",
  "Excluded",
  "Rejected",
];

const domains: CustomerDomain[] = [
  "IT",
  "IT - product",
  "IT - outsourcing",
  "Ecommerce",
  "Game",
  "Mobile app",
  "Non IT (Manufacturing)",
  "Non IT (Logistic)",
  "Non IT (FMCG)",
  "Non IT (BĐS)",
  "Non IT (Retail)",
  "Non-IT",
  "Others",
];

const jobSources: JobSource[] = [
  "Facebook",
  "Linkedin",
  "Thread",
  "Itviec",
  "Topdev",
  "Aniday",
  "Job Portal",
  "Referral",
  "Khác",
];

export function CustomerTable({ 
  customers, 
  onUpdateCustomer, 
  statusHistory = {},
  communicationHistory = {},
  onAddStatusHistory,
  onAddCommunicationHistory 
}: CustomerTableProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [quickNoteCustomer, setQuickNoteCustomer] = useState<Customer | null>(null);
  
  // Status change dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    customer: Customer;
    newStatus: CustomerStatus;
  } | null>(null);

  const getBdName = (bdId?: string) => {
    if (!bdId) return "-";
    const bd = bdUsers.find((u) => u.id === bdId);
    return bd?.name || "-";
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd/MM/yyyy", { locale: vi });
    } catch {
      return dateStr;
    }
  };

  const canEdit = (customer: Customer) => customer.bdAssigned === currentUser.id;

  const handleStatusChange = (customer: Customer, newStatus: CustomerStatus) => {
    if (!canEdit(customer)) {
      toast({
        title: "Không có quyền",
        description: "Bạn chỉ có thể chỉnh sửa khách hàng do mình phụ trách",
        variant: "destructive",
      });
      return;
    }

    if (newStatus === customer.status) return;

    // Show note dialog
    setPendingStatusChange({ customer, newStatus });
    setStatusDialogOpen(true);
  };

  const handleStatusConfirm = (note?: string) => {
    if (!pendingStatusChange || !onAddStatusHistory) return;

    const { customer, newStatus } = pendingStatusChange;

    // Track status change in history with note
    const newEntry: StatusHistoryEntry = {
      id: `h${customer.id}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      previousStatus: customer.status,
      newStatus: newStatus,
      changedBy: currentUser.id,
      note,
    };
    onAddStatusHistory(customer.id, newEntry);

    // Update customer
    let updates: Partial<Customer> = { status: newStatus };
    if (newStatus === "Approach" || newStatus === "Follow up") {
      const remind = new Date();
      remind.setDate(remind.getDate() + 7);
      updates.remindDate = remind.toISOString().split("T")[0];
    }

    onUpdateCustomer(customer.id, updates);
    setPendingStatusChange(null);
  };

  const handleInlineUpdate = (customer: Customer, field: keyof Customer, value: string) => {
    if (!canEdit(customer)) {
      toast({
        title: "Không có quyền",
        description: "Bạn chỉ có thể chỉnh sửa khách hàng do mình phụ trách",
        variant: "destructive",
      });
      return;
    }

    // For status changes, use the dialog flow
    if (field === "status") {
      handleStatusChange(customer, value as CustomerStatus);
      return;
    }

    onUpdateCustomer(customer.id, { [field]: value });
  };

  const handleQuickNote = (customer: Customer) => {
    if (!canEdit(customer)) {
      toast({
        title: "Không có quyền",
        description: "Bạn chỉ có thể thêm ghi chú cho khách hàng do mình phụ trách",
        variant: "destructive",
      });
      return;
    }
    setQuickNoteCustomer(customer);
    setQuickNoteOpen(true);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[60px] text-center">No.</TableHead>
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">Remind</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Domain</TableHead>
            <TableHead className="text-center">Company Name</TableHead>
            <TableHead className="text-center">Job</TableHead>
            <TableHead className="text-center">Nguồn</TableHead>
            <TableHead className="text-center">Priority</TableHead>
            <TableHead className="w-[70px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                Không tìm thấy khách hàng nào
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer, index) => {
              const isEditable = canEdit(customer);

              return (
                <TableRow key={customer.id} className="animate-fade-in">
                  <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>
                  <TableCell className="text-center whitespace-nowrap text-muted-foreground">
                    {formatDate(customer.date)}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <RemindCell remindDate={customer.remindDate} startDate={customer.date} />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center min-w-[120px]">
                      {isEditable ? (
                        <Select
                          value={customer.status}
                          onValueChange={(value) => handleInlineUpdate(customer, "status", value)}
                        >
                          <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:hidden">
                            <StatusBadge status={customer.status} />
                          </SelectTrigger>
                          <SelectContent align="center">
                            {statuses.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                <StatusBadge status={s} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <StatusBadge status={customer.status} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center min-w-[100px]">
                      {isEditable ? (
                        <Select
                          value={customer.domain}
                          onValueChange={(value) => handleInlineUpdate(customer, "domain", value)}
                        >
                          <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:hidden">
                            <span className="text-sm text-foreground">{customer.domain}</span>
                          </SelectTrigger>
                          <SelectContent align="center">
                            {domains.map((d) => (
                              <SelectItem key={d} value={d} className="text-xs">
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">{customer.domain}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/bd-crm/customers/${customer.id}`)}
                    >
                      {customer.companyName}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {customer.job ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-muted-foreground text-sm">{customer.job}</span>
                        {customer.jobLink && (
                          <a
                            href={customer.jobLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="Xem job trên nền tảng"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center min-w-[80px]">
                      {isEditable && customer.jobSource ? (
                        <Select
                          value={customer.jobSource}
                          onValueChange={(value) => handleInlineUpdate(customer, "jobSource", value)}
                        >
                          <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:hidden">
                            <span className="text-sm text-foreground">{customer.jobSource}</span>
                          </SelectTrigger>
                          <SelectContent align="center">
                            {jobSources.map((js) => (
                              <SelectItem key={js} value={js} className="text-xs">
                                {js}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">{customer.jobSource || "-"}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center min-w-[90px]">
                      {isEditable ? (
                        <Select
                          value={customer.priority}
                          onValueChange={(value) => handleInlineUpdate(customer, "priority", value)}
                        >
                          <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:hidden">
                            <PriorityBadge priority={customer.priority} />
                          </SelectTrigger>
                          <SelectContent align="center">
                            <SelectItem value="normal" className="text-xs">
                              <PriorityBadge priority="normal" />
                            </SelectItem>
                            <SelectItem value="high" className="text-xs">
                              <PriorityBadge priority="high" />
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <PriorityBadge priority={customer.priority} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 mx-auto">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/bd-crm/customers/${customer.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        {isEditable && (
                          <>
                            <DropdownMenuItem onClick={() => navigate(`/bd-crm/customers/${customer.id}/edit`)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickNote(customer)}>
                              <MessageSquarePlus className="mr-2 h-4 w-4" />
                              Note nhanh
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => {
                          setSelectedCustomer(customer);
                          setHistoryDialogOpen(true);
                        }}>
                          <History className="mr-2 h-4 w-4" />
                          Lịch sử
                        </DropdownMenuItem>
                        {customer.contacts[0]?.linkedin && (
                          <DropdownMenuItem asChild>
                            <a href={customer.contacts[0].linkedin} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              LinkedIn
                            </a>
                          </DropdownMenuItem>
                        )}
                        {isEditable && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* History Dialog with Tabs */}
      <HistoryDialog
        customer={selectedCustomer}
        statusHistory={selectedCustomer ? (statusHistory[selectedCustomer.id] || []) : []}
        communicationHistory={selectedCustomer ? (communicationHistory[selectedCustomer.id] || []) : []}
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
      />

      {/* Quick Note Dialog */}
      {onAddCommunicationHistory && (
        <QuickNoteDialog
          customer={quickNoteCustomer}
          open={quickNoteOpen}
          onOpenChange={setQuickNoteOpen}
          onSubmit={onAddCommunicationHistory}
        />
      )}

      {/* Status Change Dialog */}
      {pendingStatusChange && (
        <StatusChangeDialog
          open={statusDialogOpen}
          onOpenChange={(open) => {
            setStatusDialogOpen(open);
            if (!open) setPendingStatusChange(null);
          }}
          customerName={pendingStatusChange.customer.companyName}
          previousStatus={pendingStatusChange.customer.status}
          newStatus={pendingStatusChange.newStatus}
          onConfirm={handleStatusConfirm}
        />
      )}
    </div>
  );
}
