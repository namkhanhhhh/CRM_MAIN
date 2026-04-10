import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Phone,
  Palette,
  Eye,
  Save,
  Globe,
  Smartphone,
  Monitor,
  CheckCircle,
  ExternalLink,
  Copy,
  Sparkles,
  Award,
  Clock,
  Shield,
  MessageCircle,
  Linkedin,
  Facebook,
} from 'lucide-react';
import { mockHeadhunterProfiles } from '@/data/headhunterProfileMockData';
import { BRAND_COLOR_PRESETS, TEMPLATE_STYLES, HeadhunterProfile } from '@/types/headhunterProfile';

export default function HeadhunterProfilePage() {
  const { toast } = useToast();

  // Simulate current user's profile (first headhunter)
  const [profile, setProfile] = useState<HeadhunterProfile>(() => ({
    ...mockHeadhunterProfiles[0],
  }));

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const profileUrl = `${window.location.origin}/headhunter/${profile.slug}`;

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSaving(false);
    toast({
      title: '✅ Cập nhật thành công!',
      description: 'Trang cá nhân của bạn đã được lưu.',
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'Đã copy link!',
      description: profileUrl,
    });
  };

  const updateProfile = (fields: Partial<HeadhunterProfile>) => {
    setProfile(prev => ({ ...prev, ...fields }));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <User className="h-6 w-6 text-pink-500" />
              Quản lý Trang cá nhân
            </h1>
            <p className="text-muted-foreground mt-1">
              Thiết lập và tùy chỉnh trang tuyển dụng cá nhân của bạn
            </p>
          </div>
          <div className="flex items-center gap-3">
            {profile.isPublished && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                <Globe className="h-3.5 w-3.5" />
                Đã công khai
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Ẩn Preview' : 'Xem Preview'}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-pink-500 hover:bg-pink-600 text-white gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </Button>
          </div>
        </div>

        {/* Published URL bar */}
        {profile.isPublished && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100">
            <Globe className="h-5 w-5 text-pink-500" />
            <span className="text-sm text-muted-foreground">Link trang cá nhân:</span>
            <code className="text-sm font-mono text-pink-600 bg-white px-3 py-1 rounded-lg border">
              {profileUrl}
            </code>
            <Button variant="ghost" size="sm" onClick={handleCopyLink} className="gap-1.5 text-pink-600 hover:text-pink-700">
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
            <a href={`/headhunter/${profile.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="gap-1.5 text-pink-600 hover:text-pink-700">
                <ExternalLink className="h-3.5 w-3.5" />
                Mở trang
              </Button>
            </a>
          </div>
        )}

        <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Editor Section */}
          <div className="space-y-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start bg-muted/50 p-1 rounded-xl mb-4">
                <TabsTrigger value="info" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <User className="h-4 w-4" />
                  Thông tin
                </TabsTrigger>
                <TabsTrigger value="contact" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Phone className="h-4 w-4" />
                  Liên hệ
                </TabsTrigger>
                <TabsTrigger value="appearance" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Palette className="h-4 w-4" />
                  Giao diện
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Shield className="h-4 w-4" />
                  Cài đặt
                </TabsTrigger>
              </TabsList>

              {/* Tab: Thông tin cá nhân */}
              <TabsContent value="info" className="space-y-4 mt-0">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-pink-500" />
                      Thông tin cá nhân
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên</Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => updateProfile({ name: e.target.value })}
                          className="focus-visible:ring-pink-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">/headhunter/</span>
                          <Input
                            id="slug"
                            value={profile.slug}
                            onChange={(e) => updateProfile({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            className="focus-visible:ring-pink-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Tiêu đề / Chức danh</Label>
                      <Input
                        id="title"
                        value={profile.title}
                        onChange={(e) => updateProfile({ title: e.target.value })}
                        placeholder="VD: Senior IT Headhunter"
                        className="focus-visible:ring-pink-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Giới thiệu bản thân</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => updateProfile({ bio: e.target.value })}
                        rows={8}
                        placeholder="Viết giới thiệu ngắn về bản thân, kinh nghiệm, thế mạnh..."
                        className="focus-visible:ring-pink-500 resize-none"
                      />
                      <p className="text-xs text-muted-foreground">{profile.bio.length} ký tự</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yearsExp" className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Năm kinh nghiệm
                        </Label>
                        <Input
                          id="yearsExp"
                          type="number"
                          value={profile.yearsExperience}
                          onChange={(e) => updateProfile({ yearsExperience: parseInt(e.target.value) || 0 })}
                          className="focus-visible:ring-pink-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="placements" className="flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5" />
                          Tuyển thành công
                        </Label>
                        <Input
                          id="placements"
                          type="number"
                          value={profile.totalPlacements}
                          onChange={(e) => updateProfile({ totalPlacements: parseInt(e.target.value) || 0 })}
                          className="focus-visible:ring-pink-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Chuyên ngành</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.specializations.map((s, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Thông tin liên hệ */}
              <TabsContent value="contact" className="space-y-4 mt-0">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-pink-500" />
                      Thông tin liên hệ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-rose-500" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => updateProfile({ email: e.target.value })}
                          className="focus-visible:ring-pink-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-blue-500" />
                          Số điện thoại
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => updateProfile({ phone: e.target.value })}
                          className="focus-visible:ring-pink-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zalo" className="flex items-center gap-1.5">
                          <MessageCircle className="h-3.5 w-3.5 text-blue-600" />
                          Zalo
                        </Label>
                        <Input
                          id="zalo"
                          value={profile.zalo || ''}
                          onChange={(e) => updateProfile({ zalo: e.target.value })}
                          placeholder="Số Zalo"
                          className="focus-visible:ring-pink-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin" className="flex items-center gap-1.5">
                          <Linkedin className="h-3.5 w-3.5 text-blue-700" />
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          value={profile.linkedin || ''}
                          onChange={(e) => updateProfile({ linkedin: e.target.value })}
                          placeholder="https://linkedin.com/in/..."
                          className="focus-visible:ring-pink-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="flex items-center gap-1.5">
                        <Facebook className="h-3.5 w-3.5 text-blue-600" />
                        Facebook
                      </Label>
                      <Input
                        id="facebook"
                        value={profile.facebook || ''}
                        onChange={(e) => updateProfile({ facebook: e.target.value })}
                        placeholder="https://facebook.com/..."
                        className="focus-visible:ring-pink-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Giao diện */}
              <TabsContent value="appearance" className="space-y-4 mt-0">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Palette className="h-4 w-4 text-pink-500" />
                      Tùy chỉnh giao diện
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Brand Color */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Màu chủ đạo (Brand Color)</Label>
                      <div className="grid grid-cols-6 gap-3">
                        {BRAND_COLOR_PRESETS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => updateProfile({ brandColor: color.value })}
                            className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all hover:scale-105 ${
                              profile.brandColor === color.value
                                ? 'bg-muted ring-2 ring-offset-2 ring-pink-500'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <div
                              className="h-10 w-10 rounded-full shadow-md transition-transform"
                              style={{ backgroundColor: color.value }}
                            />
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {color.name}
                            </span>
                            {profile.brandColor === color.value && (
                              <div className="absolute -top-1 -right-1 h-5 w-5 bg-pink-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3.5 w-3.5 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <Label className="text-xs text-muted-foreground">Hoặc nhập mã màu:</Label>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-8 w-8 rounded-lg border-2 border-muted shadow-sm"
                            style={{ backgroundColor: profile.brandColor }}
                          />
                          <Input
                            value={profile.brandColor}
                            onChange={(e) => updateProfile({ brandColor: e.target.value })}
                            className="w-32 font-mono text-sm focus-visible:ring-pink-500"
                            placeholder="#e11d48"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Template Style */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Kiểu template</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {TEMPLATE_STYLES.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => updateProfile({ templateStyle: style.id })}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                              profile.templateStyle === style.id
                                ? 'border-pink-500 bg-pink-50/50 shadow-sm'
                                : 'border-muted hover:border-muted-foreground/30'
                            }`}
                          >
                            <div className="font-semibold text-sm mb-1">{style.name}</div>
                            <div className="text-xs text-muted-foreground">{style.description}</div>
                            {profile.templateStyle === style.id && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="h-5 w-5 text-pink-500" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Cài đặt */}
              <TabsContent value="settings" className="space-y-4 mt-0">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4 text-pink-500" />
                      Cài đặt trang
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
                      <div>
                        <div className="font-medium text-sm">Công khai trang cá nhân</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Khi bật, ứng viên có thể truy cập trang cá nhân của bạn qua link
                        </div>
                      </div>
                      <Switch
                        checked={profile.isPublished}
                        onCheckedChange={(checked) => updateProfile({ isPublished: checked })}
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-sm text-amber-800">Mẹo tối ưu trang cá nhân</div>
                          <ul className="mt-2 space-y-1 text-xs text-amber-700">
                            <li>• Thêm ảnh đại diện chuyên nghiệp</li>
                            <li>• Viết bio rõ ràng, nêu bật thế mạnh</li>
                            <li>• Cập nhật đầy đủ thông tin liên hệ</li>
                            <li>• Ghim các job nổi bật lên đầu trang</li>
                            <li>• Chọn brand color phù hợp với phong cách</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Xem trước
                </h3>
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1.5 rounded-md transition-colors ${
                      previewMode === 'desktop' ? 'bg-white shadow-sm text-pink-600' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-1.5 rounded-md transition-colors ${
                      previewMode === 'mobile' ? 'bg-white shadow-sm text-pink-600' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div
                className={`bg-white rounded-2xl border-2 border-muted shadow-lg overflow-y-auto overflow-x-hidden transition-all scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-transparent flex flex-col ${
                  previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : 'w-full'
                }`}
                style={{ height: 'calc(100vh - 180px)', minHeight: '500px', maxHeight: '800px' }}
              >
                {/* Preview: Hero */}
                <div
                  className="relative shrink-0 h-32 sm:h-44"
                  style={{
                    background: `linear-gradient(135deg, ${profile.brandColor}, ${profile.brandColor}dd, ${profile.brandColor}88)`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/30 to-transparent" />
                </div>

                {/* Preview: Profile Info */}
                <div className="px-5 sm:px-8 relative flex-1 pb-8">
                  <div className="flex flex-col items-start mb-4">
                    <div
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl sm:rounded-3xl border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl sm:text-3xl font-bold -mt-10 sm:-mt-12 mb-3 bg-background"
                      style={{ backgroundColor: profile.brandColor }}
                    >
                      {profile.name.split(' ').slice(-1)[0]?.[0] || 'H'}
                    </div>
                    <div className="w-full">
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground">{profile.name}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">{profile.title}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 sm:gap-6 py-4 border-y mb-5">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold" style={{ color: profile.brandColor }}>
                        {profile.totalPlacements}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Tuyển thành công</div>
                    </div>
                    <div className="text-center border-l pl-4 sm:pl-6 border-muted">
                      <div className="text-lg sm:text-xl font-bold" style={{ color: profile.brandColor }}>
                        {profile.yearsExperience}+
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Năm kinh nghiệm</div>
                    </div>
                    <div className="text-center border-l pl-4 sm:pl-6 border-muted">
                      <div className="text-lg sm:text-xl font-bold" style={{ color: profile.brandColor }}>
                        {profile.specializations.length}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">Chuyên ngành</div>
                    </div>
                  </div>

                  {/* Bio preview */}
                  <div className="text-xs text-muted-foreground whitespace-pre-line mb-4 line-clamp-5">
                    {profile.bio}
                  </div>

                  {/* Contact icons preview */}
                  <div className="flex gap-2 mb-4">
                    {profile.email && (
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${profile.brandColor}15` }}>
                        <Mail className="h-3.5 w-3.5" style={{ color: profile.brandColor }} />
                      </div>
                    )}
                    {profile.phone && (
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${profile.brandColor}15` }}>
                        <Phone className="h-3.5 w-3.5" style={{ color: profile.brandColor }} />
                      </div>
                    )}
                    {profile.zalo && (
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${profile.brandColor}15` }}>
                        <MessageCircle className="h-3.5 w-3.5" style={{ color: profile.brandColor }} />
                      </div>
                    )}
                    {profile.linkedin && (
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${profile.brandColor}15` }}>
                        <Linkedin className="h-3.5 w-3.5" style={{ color: profile.brandColor }} />
                      </div>
                    )}
                    {profile.facebook && (
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${profile.brandColor}15` }}>
                        <Facebook className="h-3.5 w-3.5" style={{ color: profile.brandColor }} />
                      </div>
                    )}
                  </div>

                  {/* Jobs placeholder */}
                  <div className="space-y-2 mb-6">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5" style={{ color: profile.brandColor }}>
                      <Sparkles className="h-3.5 w-3.5" />
                      Jobs nổi bật
                    </h3>
                    {[1, 2].map(i => (
                      <div key={i} className="p-3 rounded-xl border bg-muted/30">
                        <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-2 bg-muted rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
