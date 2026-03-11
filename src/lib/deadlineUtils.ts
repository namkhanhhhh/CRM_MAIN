/** Returns 'danger' if overdue/today, 'warning' if within 7 days, 'normal' otherwise */
export function getDeadlineStatus(date: string | null | undefined): 'normal' | 'warning' | 'danger' {
  if (!date) return 'normal';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 0) return 'danger';
  if (diffDays <= 7) return 'warning';
  return 'normal';
}
