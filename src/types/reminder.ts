export type ReminderMilestoneType = '7-day' | '15-day' | '30-day';

export interface ReminderHistoryEntry {
  id: string;
  customerId: string;
  timestamp: string;
  milestoneType: ReminderMilestoneType;
  reminderNumber: number; // 1, 2, 3... lần remind thứ mấy
  performedBy: string; // BD id
  note: string;
  nextRemindDate?: string; // Ngày remind tiếp theo
}

export interface ReminderSchedule {
  customerId: string;
  currentMilestone: ReminderMilestoneType | null; // null = hoàn thành chu kỳ
  lastRemindDate?: string;
  nextRemindDate: string;
  reminderCount: number;
}

// Mapping mốc tiếp theo: 7 → 15, 15 → 30, 30 → null (hoàn thành)
export const getNextMilestone = (current: ReminderMilestoneType): ReminderMilestoneType | null => {
  switch (current) {
    case '7-day':
      return '15-day';
    case '15-day':
      return '30-day';
    case '30-day':
      return null; // Hoàn thành chu kỳ remind, xóa khỏi danh sách
  }
};

// Kiểm tra xem mốc hiện tại có phải mốc cuối không
export const isFinalMilestone = (milestone: ReminderMilestoneType): boolean => {
  return milestone === '30-day';
};

export const getMilestoneDays = (milestone: ReminderMilestoneType): number => {
  switch (milestone) {
    case '7-day':
      return 7;
    case '15-day':
      return 15;
    case '30-day':
      return 30;
  }
};

export const getMilestoneLabel = (milestone: ReminderMilestoneType): string => {
  switch (milestone) {
    case '7-day':
      return 'Mốc 7 ngày';
    case '15-day':
      return 'Mốc 15 ngày';
    case '30-day':
      return 'Mốc 30 ngày';
  }
};
