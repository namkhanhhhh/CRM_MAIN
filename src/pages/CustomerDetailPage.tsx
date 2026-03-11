import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge } from '@/components/customers/StatusBadge';
import { PriorityBadge } from '@/components/customers/PriorityBadge';
import { getCommunicationMethodLabel, getCommunicationMethodIcon } from '@/components/customers/QuickNoteDialog';
import { bdUsers } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { useCustomerData } from '@/context/CustomerDataContext';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  ArrowLeft, 
  Pencil, 
  Building2, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Linkedin,
  History,
  Clock,
  ArrowRight,
  Users
} from 'lucide-react';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { customers, statusHistory, communicationHistory } = useCustomerData();

  const customer = customers.find(c => c.id === id);
  const customerStatusHistory = id ? (statusHistory[id] || []) : [];
  const customerCommunicationHistory = id ? (communicationHistory[id] || []) : [];

  if (!customer) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy khách hàng</h1>
          <Button onClick={() => navigate('/bd-crm/customers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
        </div>
      </MainLayout>
    );
  }

  const bdName = customer.bdAssigned 
    ? bdUsers.find(u => u.id === customer.bdAssigned)?.name || '-'
    : '-';

  const canEdit = customer.bdAssigned === currentUser.id;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateStr;
    }
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

  const getBdName = (bdId: string) => {
    const bd = bdUsers.find(u => u.id === bdId);
    return bd?.name || 'Không xác định';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/bd-crm/customers')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{customer.companyName}</h1>
                <StatusBadge status={customer.status} />
                <PriorityBadge priority={customer.priority} />
              </div>
              <p className="text-muted-foreground">{customer.domain}</p>
            </div>
          </div>

          {canEdit && (
            <Button onClick={() => navigate(`/bd-crm/customers/${id}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4" />
                  Thông tin Account
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tạo</p>
                  <p className="font-medium">{formatDate(customer.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày nhắc nhở</p>
                  <p className="font-medium text-warning">{formatDate(customer.remindDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Job</p>
                  <p className="font-medium">{customer.job || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nguồn Job</p>
                  <p className="font-medium">{customer.jobSource || '-'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Ghi chú công ty</p>
                  <p className="font-medium">{customer.companyNote || '-'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Thông tin liên hệ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customer.contacts.length === 0 ? (
                  <p className="text-muted-foreground">Chưa có thông tin liên hệ</p>
                ) : (
                  <div className="space-y-4">
                    {customer.contacts.map((contact, index) => (
                      <div key={index} className="rounded-lg border border-border p-4">
                        <p className="font-semibold mb-3">{contact.name}</p>
                        <div className="grid gap-2 sm:grid-cols-2 text-sm">
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          {contact.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                                {contact.email}
                              </a>
                            </div>
                          )}
                          {contact.linkedin && (
                            <div className="flex items-center gap-2 sm:col-span-2">
                              <Linkedin className="h-4 w-4 text-muted-foreground" />
                              <a 
                                href={contact.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline truncate"
                              >
                                {contact.linkedin}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* History Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="h-4 w-4" />
                  Lịch sử
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="communication" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="communication" className="gap-1.5">
                      Lịch sử trao đổi
                    </TabsTrigger>
                    <TabsTrigger value="status" className="gap-1.5">
                      Thay đổi trạng thái
                    </TabsTrigger>
                  </TabsList>

                  {/* Communication History Tab */}
                  <TabsContent value="communication" className="mt-4">
                    <ScrollArea className="max-h-[400px]">
                      {customerCommunicationHistory.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                          Chưa có lịch sử trao đổi
                        </div>
                      ) : (
                        <div className="space-y-4 pr-4">
                          {customerCommunicationHistory.map((entry) => {
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

                  {/* Status History Tab */}
                  <TabsContent value="status" className="mt-4">
                    <ScrollArea className="max-h-[400px]">
                      {customerStatusHistory.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                          Chưa có lịch sử thay đổi trạng thái
                        </div>
                      ) : (
                        <div className="space-y-4 pr-4">
                          {customerStatusHistory.map((entry) => {
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
                                    <p className="text-sm text-muted-foreground">{entry.note}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  BD phụ trách
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{bdName}</p>
              </CardContent>
            </Card>

            {/* Metadata Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Thông tin hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày tạo</span>
                  <span>{formatDate(customer.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cập nhật lần cuối</span>
                  <span>{formatDate(customer.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
