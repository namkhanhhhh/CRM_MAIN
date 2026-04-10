export interface HeadhunterProfile {
  id: string;
  userId: string;
  name: string;
  title: string; // e.g. "Senior IT Headhunter"
  bio: string; // Giới thiệu bản thân
  avatarUrl?: string;
  coverImageUrl?: string;

  // Contact info
  email: string;
  phone: string;
  zalo?: string;
  linkedin?: string;
  facebook?: string;

  // Brand customization
  brandColor: string; // HEX color
  slug: string; // URL slug cho trang cá nhân, e.g. "nguyen-van-a"

  // Stats
  totalPlacements: number;
  yearsExperience: number;
  specializations: string[]; // e.g. ["IT", "Fintech", "Ecommerce"]

  // Template config
  templateStyle: 'modern' | 'classic' | 'minimal';
  isPublished: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface HeadhunterPageJob {
  id: string;
  profileId: string;
  jobId: string; // Reference to OpenJob
  isHighlighted: boolean; // Jobs nổi bật - ghim đầu trang
  addedAt: string;
  displayOrder: number;
}

// Brand color presets
export const BRAND_COLOR_PRESETS = [
  { name: 'Rose', value: '#e11d48' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Slate', value: '#475569' },
];

export const TEMPLATE_STYLES = [
  {
    id: 'modern' as const,
    name: 'Modern',
    description: 'Gradient hero, card layout, hiện đại',
  },
  {
    id: 'classic' as const,
    name: 'Classic',
    description: 'Truyền thống, chuyên nghiệp, trang nhã',
  },
  {
    id: 'minimal' as const,
    name: 'Minimal',
    description: 'Tối giản, tập trung vào nội dung',
  },
];
