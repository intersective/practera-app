import { TestBed } from '@angular/core/testing';

import { DueDatesService } from './due-dates.service';

describe('DueDatesService', () => {
  let service: DueDatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DueDatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format date to compact google/ics style', () => {
    const date = new Date('2026-03-01T10:30:45.000Z');
    const formatted = service.formatDate(date);

    expect(formatted).toBe('20260301T103045Z');
  });

  it('should build google calendar URL with provided end date and location/reminder', () => {
    const url = service.generateGoogleCalendarUrl({
      start: new Date('2026-03-01T10:00:00'),
      end: new Date('2026-03-01T11:00:00'),
      title: 'Due Date',
      description: 'Assessment description',
      location: 'Online',
      reminder: 60,
    });

    expect(url).toContain('https://calendar.google.com/calendar/render?action=TEMPLATE');
    expect(url).toContain('text=Due%20Date');
    expect(url).toContain('location=Online');
    expect(url).toContain('reminders=reminder_60_minutes');
  });

  it('should default google calendar end time to +1 hour when no end date', () => {
    const url = service.generateGoogleCalendarUrl({
      start: new Date('2026-03-01T10:00:00'),
      title: 'Due Date',
      description: 'Assessment description',
    });

    expect(url).toContain('dates=');
    expect(url).toContain('/');
  });

  it('should call downloadCalendarEvent when createEvent succeeds', () => {
    const downloadSpy = spyOn<any>(service, 'downloadCalendarEvent');
    service.icsCreateEvent = ((event: any, callback: any) => {
      callback(null, 'BEGIN:VCALENDAR...');
      return undefined as any;
    }) as any;

    service.createCalendarEvent({
      title: 'Assessment',
      start: [2026, 3, 1, 10, 0],
    } as any);

    expect(downloadSpy).toHaveBeenCalledWith('BEGIN:VCALENDAR...', 'Assessment');
  });

  it('should throw error when createEvent callback receives error', () => {
    service.icsCreateEvent = ((event: any, callback: any) => {
      callback({ message: 'failed' }, null);
      return undefined as any;
    }) as any;

    expect(() => service.createCalendarEvent({
      title: 'Assessment',
      start: [2026, 3, 1, 10, 0],
    } as any)).toThrowError('Failed to create event: failed');
  });
});
