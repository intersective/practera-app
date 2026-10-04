/** Display helpers for the time log. Hours are stored as minutes. */

export function formatLoggedHours(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours && rest) return `${hours} h ${rest} min`;
  if (hours === 1) return '1 hour';
  if (hours) return `${hours} hours`;
  if (rest === 1) return '1 min';
  return `${rest} min`;
}

export function progressRatio(approvedMinutes: number, targetMinutes: number | null | undefined): number {
  if (!targetMinutes || targetMinutes <= 0) return 0;
  return Math.min(1, approvedMinutes / targetMinutes);
}

export function progressLabel(approvedMinutes: number, targetMinutes: number | null | undefined): string {
  const approved = formatLoggedHours(approvedMinutes);
  if (!targetMinutes || targetMinutes <= 0) return approved;
  return `${approved} / ${formatLoggedHours(targetMinutes)}`;
}

export function todayYmd(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function entryIsEditable(status: string): boolean {
  return status === 'draft' || status === 'returned';
}

export function toMinutes(hours: number, minutes: number): number {
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  return Math.round(h * 60 + m);
}
