import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CustomerStatus, CustomerDomain, JobSource, Priority, Customer } from '@/types/customer';
import { bdUsers } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { useCustomerData } from '@/context/CustomerDataContext';
import { Plus, Trash2 } from 'lucide-react';
import { CompanyNameInput } from './CompanyNameInput';
import { JobCountInput } from './JobCountInput';
import { JobInfoForm, JobInfo } from './JobInfoForm';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const statuses: CustomerStatus[] = [
  'Research', 'Addfriend/Connect', 'Approach', 'Follow up', 'Consulting',
  'Demo contract', 'Signing', 'Signed', 'Meeting Clear JD', 'Hunting',
  'Take care', 'No current need', 'Excluded'
];

const domains: CustomerDomain[] = [
  'IT', 'IT - product', 'IT - outsourcing', 'Ecommerce', 'Game', 'Mobile app',
  'Non IT (Manufacturing)', 'Non IT (Logistic)', 'Non IT (FMCG)',
  'Non IT (BĐS)', 'Non IT (Retail)', 'Non-IT', 'Others'
];

export function AddCustomerDialog({ open, onOpenChange, onSubmit }: AddCustomerDialogProps) {
  const { currentUser } = useAuth();
  const { customers } = useCustomerData();

  // Get list of existing company names for duplicate checking
  const existingCompanyNames = useMemo(() => {
    return customers.map(c => c.companyName);
  }, [customers]);

  const [formData, setFormData] = useState({
    companyName: '',
    status: 'Research' as CustomerStatus,
    domain: 'IT' as CustomerDomain,
    companyNote: '',
    priority: 'normal' as Priority,
    bdAssigned: currentUser.id,
    nextStep: '',
    contacts: [{ name: '', phone: '', email: '', linkedin: '' }],
  });

  const [jobCount, setJobCount] = useState(1);
  const [jobs, setJobs] = useState<JobInfo[]>([{ job: '', jobLink: '', jobSource: '' }]);

  // Filter BD users: only show current user and admin
  const availableBdUsers = bdUsers.filter(bd => bd.id === currentUser.id || bd.id === '1');

  // Check if company name is duplicate
  const isDuplicateCompany = useMemo(() => {
    if (!formData.companyName) return false;
    const normalizedInput = formData.companyName.toLowerCase().trim();
    return existingCompanyNames.some(name => 
      name.toLowerCase().trim() === normalizedInput
    );
  }, [formData.companyName, existingCompanyNames]);

  // Update jobs array when count changes
  const handleJobCountChange = (count: number) => {
    setJobCount(count);
    setJobs(prev => {
      if (count > prev.length) {
        // Add new empty jobs
        const newJobs = [...prev];
        for (let i = prev.length; i < count; i++) {
          newJobs.push({ job: '', jobLink: '', jobSource: '' });
        }
        return newJobs;
      } else {
        // Remove extra jobs
        return prev.slice(0, count);
      }
    });
  };

  const handleJobChange = (index: number, data: JobInfo) => {
    setJobs(prev => prev.map((job, i) => i === index ? data : job));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isDuplicateCompany) {
      return; // Don't submit if duplicate
    }
    
    const today = new Date().toISOString().split('T')[0];
    let remindDate: string | undefined;
    
    // Calculate remind date for Approach and Follow up status
    if (formData.status === 'Approach' || formData.status === 'Follow up') {
      const remind = new Date();
      remind.setDate(remind.getDate() + 7);
      remindDate = remind.toISOString().split('T')[0];
    }

    // Use first job for the main customer record (for backwards compatibility)
    const firstJob = jobs[0];

    onSubmit({
      date: today,
      remindDate,
      status: formData.status,
      domain: formData.domain,
      companyName: formData.companyName,
      companyNote: formData.companyNote || undefined,
      job: firstJob?.job || undefined,
      jobLink: firstJob?.jobLink || undefined,
      jobSource: (firstJob?.jobSource as JobSource) || undefined,
      contacts: formData.contacts.filter(c => c.name),
      priority: formData.priority,
      bdAssigned: formData.bdAssigned || undefined,
      nextStep: formData.nextStep || undefined,
    });

    // Reset form
    setFormData({
      companyName: '',
      status: 'Research',
      domain: 'IT',
      companyNote: '',
      priority: 'normal',
      bdAssigned: currentUser.id,
      nextStep: '',
      contacts: [{ name: '', phone: '', email: '', linkedin: '' }],
    });
    setJobCount(1);
    setJobs([{ job: '', jobLink: '', jobSource: '' }]);
    onOpenChange(false);
  };

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

  const updateContact = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm khách hàng mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Thông tin công ty</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <CompanyNameInput
                value={formData.companyName}
                onChange={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
                existingCompanies={existingCompanyNames}
              />

              <div className="space-y-2">
                <Label>Domain *</Label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status *</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyNote">Ghi chú công ty</Label>
              <Textarea
                id="companyNote"
                value={formData.companyNote}
                onChange={(e) => setFormData(prev => ({ ...prev, companyNote: e.target.value }))}
                placeholder="Ghi chú về công ty..."
                rows={2}
              />
            </div>
          </div>

          {/* Job Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Thông tin Job</h4>
            
            <JobCountInput
              value={jobCount}
              onChange={handleJobCountChange}
              min={1}
              max={10}
            />

            <div className="space-y-3">
              {jobs.map((job, index) => (
                <JobInfoForm
                  key={index}
                  index={index}
                  data={job}
                  onChange={handleJobChange}
                  showIndex={jobs.length > 1}
                />
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Thông tin liên hệ</h4>
              <Button type="button" variant="outline" size="sm" onClick={addContact}>
                <Plus className="mr-1 h-4 w-4" />
                Thêm liên hệ
              </Button>
            </div>

            {formData.contacts.map((contact, index) => (
              <div key={index} className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
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
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Họ tên"
                    value={contact.name}
                    onChange={(e) => updateContact(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Số điện thoại"
                    value={contact.phone}
                    onChange={(e) => updateContact(index, 'phone', e.target.value)}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => updateContact(index, 'email', e.target.value)}
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    value={contact.linkedin}
                    onChange={(e) => updateContact(index, 'linkedin', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Assignment */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Phân công</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>BD phụ trách</Label>
                <Select
                  value={formData.bdAssigned}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, bdAssigned: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn BD" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBdUsers.map(bd => (
                      <SelectItem key={bd.id} value={bd.id}>
                        {bd.name} {bd.id === currentUser.id ? '(Tôi)' : '(Admin)'}
                      </SelectItem>
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
                  placeholder="VD: Gửi mail giới thiệu"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isDuplicateCompany}>
              Thêm khách hàng
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
