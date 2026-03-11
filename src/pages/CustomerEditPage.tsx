import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockCustomers, bdUsers } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { CustomerStatus, CustomerDomain, JobSource, Priority, ContactInfo } from '@/types/customer';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

const statuses: CustomerStatus[] = [
  'Research', 'Addfriend/Connect', 'Approach', 'Follow up', 'Consulting',
  'Demo contract', 'Signing', 'Signed', 'Meeting Clear JD', 'Hunting',
  'Take care', 'No current need', 'Excluded', 'Rejected'
];

const domains: CustomerDomain[] = [
  'IT', 'IT - product', 'IT - outsourcing', 'Ecommerce', 'Game', 'Mobile app',
  'Non IT (Manufacturing)', 'Non IT (Logistic)', 'Non IT (FMCG)',
  'Non IT (BĐS)', 'Non IT (Retail)', 'Non-IT', 'Others'
];

const jobSources: JobSource[] = [
  'Facebook', 'Linkedin', 'Thread', 'Itviec', 'Topdev', 'Aniday',
  'Job Portal', 'Referral', 'Khác'
];

export default function CustomerEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const customer = mockCustomers.find(c => c.id === id);

  const [formData, setFormData] = useState({
    companyName: '',
    status: 'Research' as CustomerStatus,
    domain: 'IT' as CustomerDomain,
    job: '',
    jobLink: '',
    jobSource: '' as JobSource | '',
    companyNote: '',
    priority: 'normal' as Priority,
    bdAssigned: '',
    nextStep: '',
    communicationHistory: '',
    remindDate: '',
    contacts: [{ name: '', phone: '', email: '', linkedin: '' }] as ContactInfo[],
    dealInfo: '',
    actualRevenue: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        companyName: customer.companyName,
        status: customer.status,
        domain: customer.domain,
        job: customer.job || '',
        jobLink: customer.jobLink || '',
        jobSource: customer.jobSource || '',
        companyNote: customer.companyNote || '',
        priority: customer.priority,
        bdAssigned: customer.bdAssigned || '',
        nextStep: customer.nextStep || '',
        communicationHistory: customer.communicationHistory || '',
        remindDate: customer.remindDate || '',
        contacts: customer.contacts.length > 0 
          ? customer.contacts 
          : [{ name: '', phone: '', email: '', linkedin: '' }],
        dealInfo: customer.contractStatus?.dealInfo || '',
        actualRevenue: customer.contractStatus?.actualRevenue?.toString() || '',
      });
    }
  }, [customer]);

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

  const canEdit = customer.bdAssigned === currentUser.id;

  if (!canEdit) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h1 className="text-2xl font-bold mb-4">Không có quyền chỉnh sửa</h1>
          <p className="text-muted-foreground mb-4">
            Bạn chỉ có thể chỉnh sửa khách hàng do mình phụ trách
          </p>
          <Button onClick={() => navigate(`/bd-crm/customers/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </MainLayout>
    );
  }

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', phone: '', email: '', linkedin: '' }]
    }));
  };

  const removeContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const updateContact = (index: number, field: keyof ContactInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In real app, this would update the database
    toast({
      title: 'Cập nhật thành công',
      description: `Đã cập nhật thông tin khách hàng ${formData.companyName}`,
    });
    
    navigate(`/bd-crm/customers/${id}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/bd-crm/customers/${id}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chỉnh sửa: {customer.companyName}</h1>
            <p className="text-muted-foreground">Cập nhật thông tin khách hàng</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin công ty</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Tên công ty *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Domain</Label>
                    <Select
                      value={formData.domain}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, domain: value as CustomerDomain }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as CustomerStatus }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Priority }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Bình thường</SelectItem>
                        <SelectItem value="high">Ưu tiên</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remindDate">Ngày nhắc nhở</Label>
                    <Input
                      id="remindDate"
                      type="date"
                      value={formData.remindDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, remindDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyNote">Ghi chú công ty</Label>
                  <Textarea
                    id="companyNote"
                    value={formData.companyNote}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyNote: e.target.value }))}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Job Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin Job</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job">Tên Job</Label>
                  <Input
                    id="job"
                    value={formData.job}
                    onChange={(e) => setFormData(prev => ({ ...prev, job: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobLink">Link Job (TopCV, ITviec...)</Label>
                  <Input
                    id="jobLink"
                    value={formData.jobLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, jobLink: e.target.value }))}
                    placeholder="https://itviec.com/... hoặc https://topcv.vn/..."
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nguồn Job</Label>
                  <Select
                    value={formData.jobSource}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, jobSource: value as JobSource }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nguồn" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobSources.map(js => (
                        <SelectItem key={js} value={js}>{js}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextStep">Bước tiếp theo</Label>
                  <Input
                    id="nextStep"
                    value={formData.nextStep}
                    onChange={(e) => setFormData(prev => ({ ...prev, nextStep: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="communicationHistory">Lịch sử trao đổi</Label>
                  <Textarea
                    id="communicationHistory"
                    value={formData.communicationHistory}
                    onChange={(e) => setFormData(prev => ({ ...prev, communicationHistory: e.target.value }))}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contacts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Thông tin liên hệ</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addContact}>
                  <Plus className="mr-1 h-4 w-4" />
                  Thêm liên hệ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.contacts.map((contact, index) => (
                  <div key={index} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Liên hệ {index + 1}</span>
                      {formData.contacts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContact(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Input
                        placeholder="Họ tên"
                        value={contact.name}
                        onChange={(e) => updateContact(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Số điện thoại"
                        value={contact.phone || ''}
                        onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={contact.email || ''}
                        onChange={(e) => updateContact(index, 'email', e.target.value)}
                      />
                      <Input
                        placeholder="LinkedIn URL"
                        value={contact.linkedin || ''}
                        onChange={(e) => updateContact(index, 'linkedin', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contract Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin hợp đồng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dealInfo">Thông tin deal</Label>
                  <Input
                    id="dealInfo"
                    value={formData.dealInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, dealInfo: e.target.value }))}
                    placeholder="VD: Ký HĐ headhunt"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actualRevenue">Doanh thu thực tế (VNĐ)</Label>
                  <Input
                    id="actualRevenue"
                    type="number"
                    value={formData.actualRevenue}
                    onChange={(e) => setFormData(prev => ({ ...prev, actualRevenue: e.target.value }))}
                    placeholder="50000000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(`/bd-crm/customers/${id}`)}>
              Hủy
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
