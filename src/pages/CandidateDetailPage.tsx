import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { mockCandidates } from '@/data/candidateMockData';
import { CategoryBadge } from '@/components/candidates/CategoryBadge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function CandidateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const candidate = mockCandidates.find(c => c.id === id);

  if (!candidate) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">Không tìm thấy ứng viên</p>
          <Button variant="link" onClick={() => navigate('/candidates/database')}>
            Quay lại danh sách
          </Button>
        </div>
      </MainLayout>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate('/candidates/database')}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Button>

        {/* Header Section - matches reference layout */}
        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-semibold text-primary">
                  {candidate.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-foreground">{candidate.fullName}</h1>
                {candidate.positionApplied && (
                  <p className="text-muted-foreground">
                    Vị trí mong muốn: <span className="text-foreground">{candidate.positionApplied}</span>
                  </p>
                )}
                <Button variant="link" className="p-0 h-auto text-primary gap-1">
                  Xem CV
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Cập nhật</Button>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                Xóa
              </Button>
            </div>
          </div>
          
          {/* Status row - below header info */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Trạng thái:</span>
              <Badge variant="outline">{candidate.employmentStatus === 'Seeking' ? 'Sàng lọc' : 'Đang xử lý'}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Ngày ứng tuyển:</span>
              <span className="font-medium">{formatDateTime(candidate.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Classification Section - Separate card for long notes */}
        <div className="bg-muted/30 rounded-lg p-4 border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Thông tin phân loại</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Phân loại</p>
              <CategoryBadge category={candidate.category} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Thời gian phân loại</p>
              <p className="font-medium text-foreground">{formatDateTime(candidate.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ghi chú phân loại</p>
              <p className="text-foreground">{candidate.categoryNote || '-'}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Personal Info */}
        <div className="px-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Thông tin cá nhân</h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            <InfoItem 
              label="Giới tính" 
              value={
                candidate.gender === 'Male' ? 'Nam' : 
                candidate.gender === 'Female' ? 'Nữ' : 
                candidate.gender === 'Other' ? 'Khác' : undefined
              } 
            />
            <InfoItem label="Email" value={candidate.email} isLink />
            <InfoItem label="Số điện thoại" value={candidate.phone} />
            <InfoItem label="LinkedIn" value={candidate.linkedinUrl} isLink />
            <InfoItem label="Địa chỉ" value={candidate.address} />
            <InfoItem label="Facebook" value={candidate.facebookUrl} isLink />
            <InfoItem label="Ngày sinh" value={formatDate(candidate.birthDate)} />
            <InfoItem 
              label="Visa" 
              value={candidate.visa === 'None' ? 'Không có' : candidate.visa} 
            />
          </div>
        </div>

        {/* Work History */}
        {candidate.workHistory && candidate.workHistory.length > 0 && (
          <>
            <Separator />
            <div className="px-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Lịch sử nghề nghiệp</h2>
              <div className="space-y-4">
                {candidate.workHistory.map((work) => (
                  <div key={work.id} className="border-l-4 border-primary/30 pl-4 py-2">
                    <h3 className="font-medium text-foreground">{work.position}</h3>
                    <p className="text-sm text-muted-foreground">{work.company}</p>
                    <p className="text-sm text-muted-foreground">
                      {work.startDate} - {work.endDate || 'Hiện tại'}
                    </p>
                    {work.description && (
                      <p className="text-sm text-foreground mt-2">{work.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Career Info */}
        {(candidate.employmentStatus || candidate.experienceField || candidate.preferredWorkType) && (
          <>
            <Separator />
            <div className="px-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Thông tin nghề nghiệp</h2>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <InfoItem 
                  label="Tình trạng việc làm" 
                  value={
                    candidate.employmentStatus === 'Employed' ? 'Đang làm việc' :
                    candidate.employmentStatus === 'Seeking' ? 'Đang tìm việc' :
                    candidate.employmentStatus === 'Freelance' ? 'Freelance' :
                    candidate.employmentStatus === 'Unemployed' ? 'Chưa có việc' : undefined
                  } 
                />
                <InfoItem label="Lĩnh vực kinh nghiệm" value={candidate.experienceField} />
                <InfoItem label="Vị trí kinh nghiệm" value={candidate.experiencePosition} />
                <InfoItem label="Loại công việc mong muốn" value={candidate.preferredWorkType} />
                <InfoItem label="Thời gian thông báo" value={candidate.noticePeriod} />
                <InfoItem label="Ngày có thể bắt đầu" value={formatDate(candidate.availableDate)} />
              </div>
            </div>
          </>
        )}

        {/* Education */}
        {(candidate.degree || candidate.university) && (
          <>
            <Separator />
            <div className="px-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Học vấn</h2>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <InfoItem label="Trình độ học vấn cao nhất" value={candidate.degree} />
                <InfoItem label="Tên trường" value={candidate.university} />
                <InfoItem label="Chuyên ngành" value={candidate.major} />
                <InfoItem label="Thời gian học" value={candidate.graduationYear} />
                <InfoItem label="GPA" value={candidate.gpa} />
              </div>
            </div>
          </>
        )}

        {/* Skills */}
        {(candidate.technicalSkills || candidate.softSkills || candidate.englishLevel) && (
          <>
            <Separator />
            <div className="px-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Kỹ năng</h2>
              
              {candidate.technicalSkills && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Kỹ năng kỹ thuật</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.technicalSkills.split(',').map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="bg-muted">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {candidate.softSkills && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Kỹ năng mềm</p>
                  <div className="flex flex-wrap gap-2">
                    {candidate.softSkills.split(',').map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="bg-accent text-accent-foreground">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-12 gap-y-4 mt-4">
                <InfoItem label="Trình độ tiếng Anh" value={candidate.englishLevel} />
                <InfoItem label="Ngôn ngữ khác" value={candidate.otherLanguages} />
                <InfoItem label="Chứng chỉ" value={candidate.certificates} />
              </div>
            </div>
          </>
        )}

        {/* Salary & Goals */}
        {(candidate.currentSalary || candidate.expectedSalary || candidate.strengths || candidate.careerGoals) && (
          <>
            <Separator />
            <div className="px-6 pb-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Mức lương & Mục tiêu</h2>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <InfoItem 
                  label="Lương hiện tại" 
                  value={candidate.currentSalary ? `${candidate.currentSalary.toLocaleString('vi-VN')} VND` : undefined} 
                />
                <InfoItem 
                  label="Lương mong muốn" 
                  value={candidate.expectedSalary ? `${candidate.expectedSalary.toLocaleString('vi-VN')} VND` : undefined} 
                />
              </div>
              {candidate.strengths && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-1">Điểm mạnh</p>
                  <p className="text-foreground">{candidate.strengths}</p>
                </div>
              )}
              {candidate.careerGoals && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-1">Mục tiêu nghề nghiệp</p>
                  <p className="text-foreground">{candidate.careerGoals}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

function InfoItem({ 
  label, 
  value, 
  isLink = false 
}: { 
  label: string; 
  value?: string | null; 
  isLink?: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {isLink && value ? (
        <a 
          href={value.startsWith('http') ? value : `mailto:${value}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="font-medium text-foreground">{value || '-'}</p>
      )}
    </div>
  );
}
