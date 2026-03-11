import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import {
  Candidate,
  CandidateCategory,
  Gender,
  VisaType,
  EnglishLevel,
  EmploymentStatus,
  WorkType,
  WorkHistory,
} from "@/types/candidate";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AddCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (candidate: Omit<Candidate, "id" | "createdAt" | "updatedAt">) => void;
}

const genders: Gender[] = ["Male", "Female", "Other"];
const visaTypes: VisaType[] = ["None", "Work Permit", "Student", "Tourist", "Permanent Resident"];
const englishLevels: EnglishLevel[] = ["Basic", "Intermediate", "Advanced", "Fluent", "Native"];
const employmentStatuses: EmploymentStatus[] = ["Employed", "Seeking", "Freelance", "Unemployed"];
const workTypes: WorkType[] = ["Full-time", "Part-time", "Contract", "Remote", "Hybrid"];
const categories: CandidateCategory[] = ["Potential", "Normal", "Client-Hired"];

export function AddCandidateDialog({ open, onOpenChange, onSubmit }: AddCandidateDialogProps) {
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "" as Gender | "",
    visa: "" as VisaType | "",
    address: "",
    facebookUrl: "",
    linkedinUrl: "",
    positionApplied: "",

    // Education & Skills
    degree: "",
    major: "",
    university: "",
    graduationYear: "",
    gpa: "",
    englishLevel: "" as EnglishLevel | "",
    certificates: "",
    otherLanguages: "",
    technicalSkills: "",
    softSkills: "",

    // Career Info
    employmentStatus: "" as EmploymentStatus | "",
    experienceField: "",
    experiencePosition: "",
    preferredWorkType: "" as WorkType | "",
    noticePeriod: "",
    availableDate: "",

    // Salary & Additional
    currentSalary: "",
    expectedSalary: "",
    startWorkDate: "",
    strengths: "",
    careerGoals: "",

    // Category - New Field
    category: "Normal" as CandidateCategory,
    categoryNote: "",
  });

  const [workHistory, setWorkHistory] = useState<Omit<WorkHistory, "id">[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const candidate: Omit<Candidate, "id" | "createdAt" | "updatedAt"> = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      birthDate: formData.birthDate || undefined,
      gender: formData.gender || undefined,
      visa: formData.visa || undefined,
      address: formData.address || undefined,
      facebookUrl: formData.facebookUrl || undefined,
      linkedinUrl: formData.linkedinUrl || undefined,
      positionApplied: formData.positionApplied || undefined,
      degree: formData.degree || undefined,
      major: formData.major || undefined,
      university: formData.university || undefined,
      graduationYear: formData.graduationYear || undefined,
      gpa: formData.gpa || undefined,
      englishLevel: formData.englishLevel || undefined,
      certificates: formData.certificates || undefined,
      otherLanguages: formData.otherLanguages || undefined,
      technicalSkills: formData.technicalSkills || undefined,
      softSkills: formData.softSkills || undefined,
      employmentStatus: formData.employmentStatus || undefined,
      experienceField: formData.experienceField || undefined,
      experiencePosition: formData.experiencePosition || undefined,
      preferredWorkType: formData.preferredWorkType || undefined,
      noticePeriod: formData.noticePeriod || undefined,
      availableDate: formData.availableDate || undefined,
      currentSalary: formData.currentSalary ? parseInt(formData.currentSalary) : undefined,
      expectedSalary: formData.expectedSalary ? parseInt(formData.expectedSalary) : undefined,
      startWorkDate: formData.startWorkDate || undefined,
      strengths: formData.strengths || undefined,
      careerGoals: formData.careerGoals || undefined,
      category: formData.category,
      categoryNote: formData.category === "Potential" ? formData.categoryNote || undefined : undefined,
      workHistory: workHistory.map((w, idx) => ({ ...w, id: `wh-${idx}` })),
      createdBy: currentUser.id,
    };

    onSubmit(candidate);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "",
      visa: "",
      address: "",
      facebookUrl: "",
      linkedinUrl: "",
      positionApplied: "",
      degree: "",
      major: "",
      university: "",
      graduationYear: "",
      gpa: "",
      englishLevel: "",
      certificates: "",
      otherLanguages: "",
      technicalSkills: "",
      softSkills: "",
      employmentStatus: "",
      experienceField: "",
      experiencePosition: "",
      preferredWorkType: "",
      noticePeriod: "",
      availableDate: "",
      currentSalary: "",
      expectedSalary: "",
      startWorkDate: "",
      strengths: "",
      careerGoals: "",
      category: "Normal",
      categoryNote: "",
    });
    setWorkHistory([]);
  };

  const addWorkHistory = () => {
    setWorkHistory((prev) => [...prev, { company: "", position: "", startDate: "", endDate: "", description: "" }]);
  };

  const removeWorkHistory = (index: number) => {
    setWorkHistory((prev) => prev.filter((_, i) => i !== index));
  };

  const updateWorkHistory = (index: number, field: string, value: string) => {
    setWorkHistory((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-primary text-primary-foreground -m-6 mb-0 p-4 rounded-t-lg">
          <DialogTitle className="text-lg font-semibold">Thêm Ứng viên mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Category Selection */}
          <div className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <h4 className="text-sm font-semibold text-primary">Phân loại ứng viên</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phân loại *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as CandidateCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Potential">Tiềm năng</SelectItem>
                    <SelectItem value="Normal">Bình thường</SelectItem>
                    <SelectItem value="Client-Hired">Ứng tuyển</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.category === "Potential" && (
              <div className="space-y-2">
                <Label htmlFor="categoryNote">Ghi chú về ứng viên tiềm năng</Label>
                <Textarea
                  id="categoryNote"
                  value={formData.categoryNote}
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoryNote: e.target.value }))}
                  placeholder="Mô tả điểm nổi bật, lý do đánh giá là UV tiềm năng..."
                  rows={2}
                />
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 text-xs">
                    Sau khi lưu, thông tin UV sẽ được gửi đến kênh "potential-cv" trên Discord.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          <Separator />

          {/* Personal Info */}
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="text-sm font-semibold">Thông tin cá nhân</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Điện thoại *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="0123456789"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Ngày sinh</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Giới tính</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value as Gender }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quốc tịch / Visa</Label>
                <Select
                  value={formData.visa}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, visa: value as VisaType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại Visa" />
                  </SelectTrigger>
                  <SelectContent>
                    {visaTypes.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Link Facebook</Label>
                <Input
                  id="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, facebookUrl: e.target.value }))}
                  placeholder="https://facebook.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">Link LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="positionApplied">Vị trí ứng tuyển</Label>
              <Input
                id="positionApplied"
                value={formData.positionApplied}
                onChange={(e) => setFormData((prev) => ({ ...prev, positionApplied: e.target.value }))}
                placeholder="Full-Stack Developer"
              />
            </div>
          </div>

          {/* Education & Skills */}
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="text-sm font-semibold">Học vấn và Kỹ năng</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="degree">Bằng cấp</Label>
                <Input
                  id="degree"
                  value={formData.degree}
                  onChange={(e) => setFormData((prev) => ({ ...prev, degree: e.target.value }))}
                  placeholder="Cử nhân"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Chuyên ngành</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => setFormData((prev) => ({ ...prev, major: e.target.value }))}
                  placeholder="Công nghệ thông tin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">Trường học</Label>
              <Input
                id="university"
                value={formData.university}
                onChange={(e) => setFormData((prev) => ({ ...prev, university: e.target.value }))}
                placeholder="Đại học Bách Khoa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Niên khóa</Label>
                <Input
                  id="graduationYear"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData((prev) => ({ ...prev, graduationYear: e.target.value }))}
                  placeholder="2018-2022"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  value={formData.gpa}
                  onChange={(e) => setFormData((prev) => ({ ...prev, gpa: e.target.value }))}
                  placeholder="3.2/4.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Trình độ Tiếng Anh</Label>
              <Select
                value={formData.englishLevel}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, englishLevel: value as EnglishLevel }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trình độ" />
                </SelectTrigger>
                <SelectContent>
                  {englishLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificates">Chứng chỉ</Label>
              <Input
                id="certificates"
                value={formData.certificates}
                onChange={(e) => setFormData((prev) => ({ ...prev, certificates: e.target.value }))}
                placeholder="AWS Certified, JLPT N2..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherLanguages">Ngoại ngữ khác</Label>
              <Input
                id="otherLanguages"
                value={formData.otherLanguages}
                onChange={(e) => setFormData((prev) => ({ ...prev, otherLanguages: e.target.value }))}
                placeholder="Japanese, Korean, Chinese"
              />
              <p className="text-xs text-muted-foreground">Tách các ngôn ngữ bằng dấu phẩy</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicalSkills">Kỹ năng chuyên môn</Label>
              <Textarea
                id="technicalSkills"
                value={formData.technicalSkills}
                onChange={(e) => setFormData((prev) => ({ ...prev, technicalSkills: e.target.value }))}
                placeholder="JavaScript, React, Node.js, Python..."
                rows={2}
              />
              <p className="text-xs text-muted-foreground">Tách các kỹ năng bằng dấu phẩy</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="softSkills">Kỹ năng mềm</Label>
              <Textarea
                id="softSkills"
                value={formData.softSkills}
                onChange={(e) => setFormData((prev) => ({ ...prev, softSkills: e.target.value }))}
                placeholder="Giao tiếp, Lãnh đạo, Giải quyết vấn đề..."
                rows={2}
              />
            </div>
          </div>

          {/* Career Info */}
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="text-sm font-semibold">Thông tin nghề nghiệp</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employmentStatus">Trạng thái việc làm</Label>
                <Select
                  value={formData.employmentStatus}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, employmentStatus: value as EmploymentStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Đang làm việc, Đang tìm việc..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceField">Lĩnh vực kinh nghiệm</Label>
                <Input
                  id="experienceField"
                  value={formData.experienceField}
                  onChange={(e) => setFormData((prev) => ({ ...prev, experienceField: e.target.value }))}
                  placeholder="IT - Software, Marketing..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experiencePosition">Công việc kinh nghiệm</Label>
                <Input
                  id="experiencePosition"
                  value={formData.experiencePosition}
                  onChange={(e) => setFormData((prev) => ({ ...prev, experiencePosition: e.target.value }))}
                  placeholder="Backend Developer, Sales Manager..."
                />
              </div>
              <div className="space-y-2">
                <Label>Loại hình làm việc mong muốn</Label>
                <Select
                  value={formData.preferredWorkType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, preferredWorkType: value as WorkType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="noticePeriod">Thời gian báo trước (Notice Period)</Label>
                <Input
                  id="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData((prev) => ({ ...prev, noticePeriod: e.target.value }))}
                  placeholder="1 tháng, 2 tuần..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availableDate">Ngày có thể bắt đầu làm việc</Label>
                <Input
                  id="availableDate"
                  type="date"
                  value={formData.availableDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, availableDate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Work History */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Lịch sử nghề nghiệp</h4>
              <Button type="button" variant="outline" size="sm" onClick={addWorkHistory}>
                <Plus className="mr-1 h-4 w-4" />
                Thêm
              </Button>
            </div>

            {workHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Chưa có lịch sử làm việc</p>
            ) : (
              workHistory.map((item, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Kinh nghiệm {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorkHistory(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Công ty"
                      value={item.company}
                      onChange={(e) => updateWorkHistory(index, "company", e.target.value)}
                    />
                    <Input
                      placeholder="Vị trí"
                      value={item.position}
                      onChange={(e) => updateWorkHistory(index, "position", e.target.value)}
                    />
                    <Input
                      type="month"
                      placeholder="Bắt đầu"
                      value={item.startDate}
                      onChange={(e) => updateWorkHistory(index, "startDate", e.target.value)}
                    />
                    <Input
                      type="month"
                      placeholder="Kết thúc"
                      value={item.endDate}
                      onChange={(e) => updateWorkHistory(index, "endDate", e.target.value)}
                    />
                  </div>
                  <Textarea
                    placeholder="Mô tả công việc..."
                    value={item.description}
                    onChange={(e) => updateWorkHistory(index, "description", e.target.value)}
                    rows={2}
                  />
                </div>
              ))
            )}
          </div>

          {/* Salary & Additional */}
          <div className="space-y-4 rounded-lg border p-4">
            <h4 className="text-sm font-semibold">Lương và Thông tin bổ sung</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentSalary">Lương hiện tại</Label>
                <div className="relative">
                  <Input
                    id="currentSalary"
                    type="number"
                    value={formData.currentSalary}
                    onChange={(e) => setFormData((prev) => ({ ...prev, currentSalary: e.target.value }))}
                    placeholder="15,000,000"
                    className="pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">VND</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedSalary">Lương mong muốn</Label>
                <div className="relative">
                  <Input
                    id="expectedSalary"
                    type="number"
                    value={formData.expectedSalary}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expectedSalary: e.target.value }))}
                    placeholder="20,000,000"
                    className="pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">VND</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startWorkDate">Ngày có thể đi làm</Label>
              <Input
                id="startWorkDate"
                type="date"
                value={formData.startWorkDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startWorkDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strengths">Điểm mạnh</Label>
              <Textarea
                id="strengths"
                value={formData.strengths}
                onChange={(e) => setFormData((prev) => ({ ...prev, strengths: e.target.value }))}
                placeholder="Điểm mạnh và khả năng nổi bật của ứng viên..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="careerGoals">Mục tiêu nghề nghiệp</Label>
              <Textarea
                id="careerGoals"
                value={formData.careerGoals}
                onChange={(e) => setFormData((prev) => ({ ...prev, careerGoals: e.target.value }))}
                placeholder="Định hướng nghề nghiệp của ứng viên..."
                rows={2}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit">Thêm Ứng viên</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
