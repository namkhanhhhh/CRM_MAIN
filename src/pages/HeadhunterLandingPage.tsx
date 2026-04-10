import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Building2,
  Briefcase,
  Star,
  Award,
  Clock,
  ExternalLink,
  Search,
  MessageCircle,
  Linkedin,
  Facebook,
  ChevronRight,
  Sparkles,
  Users,
  Globe,
  ArrowRight,
  Send,
  Heart,
  Shield,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { getProfileBySlug, getPageJobsByProfileId } from '@/data/headhunterProfileMockData';
import { mockOpenJobs } from '@/data/openJobMockData';
import { HeadhunterProfile } from '@/types/headhunterProfile';
import { OpenJob } from '@/types/job';

export default function HeadhunterLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const profile = useMemo(() => {
    if (!slug) return null;
    return getProfileBySlug(slug);
  }, [slug]);

  const pageJobs = useMemo(() => {
    if (!profile) return [];
    const pJobs = getPageJobsByProfileId(profile.id);
    return pJobs
      .map(pj => {
        const job = mockOpenJobs.find(j => j.id === pj.jobId);
        return job ? { ...pj, job } : null;
      })
      .filter(Boolean) as Array<{ job: OpenJob; isHighlighted: boolean; id: string }>;
  }, [profile]);

  const highlightedJobs = useMemo(() => pageJobs.filter(pj => pj.isHighlighted), [pageJobs]);
  const allDisplayJobs = useMemo(() => pageJobs.filter(pj => !pj.isHighlighted), [pageJobs]);

  const industries = useMemo(() => {
    const set = new Set(pageJobs.map(pj => pj.job.industry));
    return Array.from(set);
  }, [pageJobs]);

  const filteredJobs = useMemo(() => {
    return allDisplayJobs.filter(pj => {
      const matchesSearch =
        !searchTerm ||
        pj.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pj.job.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = selectedIndustry === 'all' || pj.job.industry === selectedIndustry;
      return matchesSearch && matchesIndustry;
    });
  }, [allDisplayJobs, searchTerm, selectedIndustry]);

  // Not found
  if (!profile || !profile.isPublished) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-0">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Trang không tồn tại</h2>
            <p className="text-muted-foreground text-sm">
              Trang cá nhân này không tồn tại hoặc chưa được công khai.
              <br />
              Vui lòng kiểm tra lại link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bc = profile.brandColor;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* === HERO SECTION === */}
      <header className="relative overflow-hidden">
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${bc} 0%, ${bc}cc 40%, ${bc}88 70%, ${bc}44 100%)`,
          }}
        />
        {/* Decorative circles */}
        <div
          className="absolute -top-20 -right-20 h-80 w-80 rounded-full opacity-10"
          style={{ backgroundColor: '#fff' }}
        />
        <div
          className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full opacity-10"
          style={{ backgroundColor: '#fff' }}
        />
        <div
          className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full opacity-5"
          style={{ backgroundColor: '#fff' }}
        />

        <div className="relative z-10 container max-w-6xl mx-auto px-4 pt-12 pb-20">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
                TD
              </div>
              <span className="text-white/90 font-semibold text-lg">TD Consulting</span>
            </div>
            <Badge className="bg-white/15 backdrop-blur-sm text-white border-white/20 gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Đối tác tuyển dụng tin cậy
            </Badge>
          </div>

          {/* Profile Info */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="h-32 w-32 rounded-3xl bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-white text-5xl font-bold shadow-2xl">
                {profile.name.split(' ').slice(-1)[0]?.[0] || 'H'}
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5" style={{ color: bc }} />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-sm">
                {profile.name}
              </h1>
              <p className="text-white/80 text-lg mb-6">{profile.title}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <div className="text-2xl font-bold">{profile.totalPlacements}+</div>
                  <div className="text-white/70 text-xs">Tuyển thành công</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <div className="text-2xl font-bold">{profile.yearsExperience}+</div>
                  <div className="text-white/70 text-xs">Năm kinh nghiệm</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <div className="text-2xl font-bold">{pageJobs.length}</div>
                  <div className="text-white/70 text-xs">Vị trí đang tuyển</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 35C840 40 960 50 1080 52C1200 54 1320 48 1380 45L1440 42V80H0V60Z"
              fill="rgb(248 250 252)"
            />
          </svg>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <div className="container max-w-6xl mx-auto px-4 -mt-2">
        {/* About & Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Bio */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${bc}15` }}>
                    <Users className="h-4 w-4" style={{ color: bc }} />
                  </div>
                  Giới thiệu
                </h2>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </div>

                {/* Specializations */}
                <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t">
                  {profile.specializations.map((s, i) => (
                    <Badge
                      key={i}
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: `${bc}10`,
                        color: bc,
                        border: `1px solid ${bc}25`,
                      }}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Card */}
          <div>
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${bc}15` }}>
                    <MessageCircle className="h-4 w-4" style={{ color: bc }} />
                  </div>
                  Liên hệ
                </h2>

                <div className="space-y-3">
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${bc}10` }}>
                        <Mail className="h-4.5 w-4.5" style={{ color: bc }} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Email</div>
                        <div className="text-sm font-medium truncate group-hover:underline">{profile.email}</div>
                      </div>
                    </a>
                  )}

                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${bc}10` }}>
                        <Phone className="h-4.5 w-4.5" style={{ color: bc }} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Điện thoại</div>
                        <div className="text-sm font-medium group-hover:underline">{profile.phone}</div>
                      </div>
                    </a>
                  )}

                  {profile.zalo && (
                    <a
                      href={`https://zalo.me/${profile.zalo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50">
                        <MessageCircle className="h-4.5 w-4.5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Zalo</div>
                        <div className="text-sm font-medium group-hover:underline">{profile.zalo}</div>
                      </div>
                    </a>
                  )}

                  {/* Social links */}
                  <div className="flex gap-2 pt-2">
                    {profile.linkedin && (
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
                      >
                        <Linkedin className="h-4.5 w-4.5 text-blue-700" />
                      </a>
                    )}
                    {profile.facebook && (
                      <a
                        href={profile.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
                      >
                        <Facebook className="h-4.5 w-4.5 text-blue-600" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* === HIGHLIGHTED JOBS === */}
        {highlightedJobs.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${bc}15` }}
              >
                <Sparkles className="h-5 w-5" style={{ color: bc }} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Vị trí nổi bật</h2>
                <p className="text-sm text-muted-foreground">Các cơ hội hấp dẫn đang được ưu tiên tuyển dụng</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {highlightedJobs.map((pj) => (
                <HighlightedJobCard key={pj.id} job={pj.job} brandColor={bc} slug={profile.slug} />
              ))}
            </div>
          </div>
        )}

        {/* === ALL JOBS === */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${bc}15` }}
            >
              <Briefcase className="h-5 w-5" style={{ color: bc }} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Tất cả vị trí đang tuyển</h2>
              <p className="text-sm text-muted-foreground">{pageJobs.length} vị trí đang mở</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm vị trí, công ty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-muted bg-white shadow-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedIndustry('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedIndustry === 'all'
                    ? 'text-white shadow-md'
                    : 'bg-white border text-muted-foreground hover:border-pink-200'
                }`}
                style={selectedIndustry === 'all' ? { backgroundColor: bc } : {}}
              >
                Tất cả
              </button>
              {industries.map(ind => (
                <button
                  key={ind}
                  onClick={() => setSelectedIndustry(ind)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedIndustry === ind
                      ? 'text-white shadow-md'
                      : 'bg-white border text-muted-foreground hover:border-pink-200'
                  }`}
                  style={selectedIndustry === ind ? { backgroundColor: bc } : {}}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Job list */}
          <div className="space-y-3">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">Không tìm thấy vị trí phù hợp</p>
              </div>
            ) : (
              filteredJobs.map((pj) => (
                <NormalJobCard key={pj.id} job={pj.job} brandColor={bc} slug={profile.slug} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* === FOOTER === */}
      <footer className="border-t bg-white">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: bc }}
              >
                TD
              </div>
              <div>
                <div className="font-semibold text-sm">TD Consulting</div>
                <div className="text-xs text-muted-foreground">Đối tác tuyển dụng tin cậy của bạn</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} TD Consulting. Trang cá nhân của {profile.name}.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// === SUB COMPONENTS ===

function HighlightedJobCard({ job, brandColor, slug }: { job: OpenJob; brandColor: string; slug: string }) {
  return (
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
      {/* Color accent top */}
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${brandColor}, ${brandColor}88)` }} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono rounded-lg">
              {job.code}
            </Badge>
            <Badge
              className="text-[10px] rounded-lg"
              style={{
                backgroundColor: `${brandColor}12`,
                color: brandColor,
                border: `1px solid ${brandColor}25`,
              }}
            >
              {job.industry}
            </Badge>
          </div>
          <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-[10px] gap-0.5 rounded-lg">
            <Star className="h-2.5 w-2.5 fill-amber-400" />
            HOT
          </Badge>
        </div>

        <Link to={`/apply/${slug}/${job.code.toLowerCase()}`}>
          <h3 className="text-base font-bold mb-3 hover:underline decoration-1 underline-offset-4 line-clamp-2" style={{ color: brandColor }}>
            {job.title}
          </h3>
        </Link>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground">{job.clientName}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              {job.jobType}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: brandColor }}>
            <DollarSign className="h-4 w-4" />
            {job.salary}
          </div>
        </div>

        <Link to={`/apply/${slug}/${job.code.toLowerCase()}#apply-form`}>
          <Button
            className="w-full rounded-xl font-semibold text-white gap-2 shadow-md hover:shadow-lg transition-all"
            style={{ backgroundColor: brandColor }}
          >
            <Send className="h-4 w-4" />
            Ứng tuyển ngay
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function NormalJobCard({ job, brandColor, slug }: { job: OpenJob; brandColor: string; slug: string }) {
  return (
    <Card className="border shadow-sm rounded-xl overflow-hidden group hover:shadow-md hover:border-pink-100 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Company Icon */}
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
            style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
          >
            {job.clientName.substring(0, 2).toUpperCase()}
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="outline" className="text-[9px] font-mono rounded px-1.5">
                {job.code}
              </Badge>
              <Badge
                className="text-[9px] rounded px-1.5"
                style={{
                  backgroundColor: `${brandColor}10`,
                  color: brandColor,
                  border: `1px solid ${brandColor}20`,
                }}
              >
                {job.industry}
              </Badge>
            </div>
            <Link to={`/apply/${slug}/${job.code.toLowerCase()}`}>
              <h4 className="text-sm font-semibold truncate hover:underline decoration-1 underline-offset-2">
                {job.title}
              </h4>
            </Link>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {job.clientName}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
              <span className="flex items-center gap-1 font-semibold" style={{ color: brandColor }}>
                <DollarSign className="h-3 w-3" />
                {job.salary}
              </span>
            </div>
          </div>

          {/* Apply button */}
          <Link to={`/apply/${slug}/${job.code.toLowerCase()}#apply-form`}>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap"
              style={{ borderColor: `${brandColor}40`, color: brandColor }}
            >
              Ứng tuyển
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
