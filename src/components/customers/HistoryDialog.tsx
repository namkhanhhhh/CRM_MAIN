import { Customer, StatusHistoryEntry, CommunicationHistoryEntry } from '@/types/customer';
import { StatusBadge } from './StatusBadge';
import { getCommunicationMethodLabel, getCommunicationMethodIcon } from './QuickNoteDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Clock, User, MessageSquare, History, Users } from 'lucide-react';
import { bdUsers } from '@/data/mockData';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface HistoryDialogProps {
  customer: Customer | null;
  statusHistory: StatusHistoryEntry[];
  communicationHistory: CommunicationHistoryEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HistoryDialog({
  customer,
  statusHistory,
  communicationHistory,
  open,
  onOpenChange,
}: HistoryDialogProps) {
  if (!customer) return null;

  const getBdName = (bdId: string) => {
    const bd = bdUsers.find((u) => u.id === bdId);
    return bd?.name || 'Không xác định';
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return {
        full: format(date, "HH:mm - dd/MM/yyyy", { locale: vi }),
        relative: formatDistanceToNow(date, { addSuffix: true, locale: vi }),
      };
    } catch {
      return { full: timestamp, relative: '' };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Lịch sử
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{customer.companyName}</p>
        </DialogHeader>

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status" className="gap-1.5">
              <ArrowRight className="h-4 w-4" />
              Thay đổi trạng thái
            </TabsTrigger>
            <TabsTrigger value="communication" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Trao đổi
            </TabsTrigger>
          </TabsList>

          {/* Status History Tab */}
          <TabsContent value="status" className="mt-4">
            <ScrollArea className="max-h-[50vh]">
              {statusHistory.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Chưa có lịch sử thay đổi trạng thái
                </div>
              ) : (
                <div className="space-y-4 pr-4">
                  {statusHistory.map((entry) => {
                    const time = formatTimestamp(entry.timestamp);
                    return (
                      <div
                        key={entry.id}
                        className="relative border-l-2 border-primary/20 pl-4 pb-4 last:pb-0"
                      >
                        <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-primary" />
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          <span>{time.full}</span>
                          <span className="text-muted-foreground/60">({time.relative})</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <StatusBadge status={entry.previousStatus} />
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <StatusBadge status={entry.newStatus} />
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <User className="h-3 w-3" />
                          <span>Người thực hiện: <span className="font-medium text-foreground">{getBdName(entry.changedBy)}</span></span>
                        </div>

                        {entry.note && (
                          <div className="mt-2 p-2 bg-muted rounded-md">
                            <div className="flex items-start gap-2 text-sm">
                              <MessageSquare className="h-3 w-3 mt-1 text-muted-foreground" />
                              <span className="text-muted-foreground">{entry.note}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Communication History Tab */}
          <TabsContent value="communication" className="mt-4">
            <ScrollArea className="max-h-[50vh]">
              {communicationHistory.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Chưa có lịch sử trao đổi
                </div>
              ) : (
                <div className="space-y-4 pr-4">
                  {communicationHistory.map((entry) => {
                    const time = formatTimestamp(entry.timestamp);
                    return (
                      <div
                        key={entry.id}
                        className="relative border-l-2 border-info/20 pl-4 pb-4 last:pb-0"
                      >
                        <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-info" />
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          <span>{time.full}</span>
                          <span className="text-muted-foreground/60">({time.relative})</span>
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1.5 text-sm">
                            {getCommunicationMethodIcon(entry.method)}
                            <span className="font-medium">{getCommunicationMethodLabel(entry.method)}</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {entry.contactName}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <User className="h-3 w-3" />
                          <span>BD thực hiện: <span className="font-medium text-foreground">{getBdName(entry.bdId)}</span></span>
                        </div>

                        <div className="mt-2 p-2 bg-muted rounded-md">
                          <p className="text-sm text-foreground">{entry.note}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
