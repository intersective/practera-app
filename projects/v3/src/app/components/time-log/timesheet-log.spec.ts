import { entryIsEditable, formatLoggedHours, progressLabel, progressRatio, toMinutes, todayYmd } from './timesheet-log';

describe('timesheet log', () => {
  it('formats minutes as hours', () => {
    expect(formatLoggedHours(90)).toBe('1 h 30 min');
    expect(formatLoggedHours(60)).toBe('1 hour');
    expect(formatLoggedHours(120)).toBe('2 hours');
    expect(formatLoggedHours(15)).toBe('15 min');
  });

  it('labels progress against a target and caps the bar at the target', () => {
    expect(progressLabel(90, 180)).toBe('1 h 30 min / 3 hours');
    expect(progressRatio(90, 180)).toBe(0.5);
    expect(progressRatio(400, 180)).toBe(1);
    expect(progressLabel(30, null)).toBe('30 min');
    expect(progressRatio(30, null)).toBe(0);
  });

  it('locks submitted and approved entries and keeps drafts editable', () => {
    expect(entryIsEditable('draft')).toBe(true);
    expect(entryIsEditable('returned')).toBe(true);
    expect(entryIsEditable('submitted')).toBe(false);
    expect(entryIsEditable('approved')).toBe(false);
  });

  it('converts the stepper into minutes and defaults the date to today', () => {
    expect(toMinutes(1, 30)).toBe(90);
    expect(toMinutes(0, 45)).toBe(45);
    expect(todayYmd(new Date(2026, 9, 3))).toBe('2026-10-03');
  });
});
