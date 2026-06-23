import { Injectable } from '@angular/core';
import { createEvent, EventAttributes } from 'ics';

export interface GoogleCalendarParams {
  start: Date;
  end?: Date;
  title: string;
  description?: string;
  location?: string;
  reminder?: number; // minutes before event
  organizer?: {
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DueDatesService {
  constructor() { }

  createCalendarEvent(eventData: EventAttributes): void {
    return createEvent(eventData, (error, value) => {
      if (error) {
        throw new Error('Failed to create event: ' + error.message);
      }
      this.downloadCalendarEvent(value, eventData.title);
    });
  }

  private downloadCalendarEvent(value: string, title: string) {
    const blob = new Blob([value], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = title + '.ics';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Format dates for Google Calendar URL
  private googleCompactDateTime(date: Date): string {
    const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
    return date.getFullYear() +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds());
  }

  generateGoogleCalendarUrl(params: GoogleCalendarParams): string {
    const startDateTime = this.googleCompactDateTime(params.start);
    let endDateTime = startDateTime;

    if (params.end) {
      endDateTime = this.googleCompactDateTime(params.end);
    } else {
      // Default to 1 hour duration if no end date provided
      const endDate = new Date(params.start);
      endDate.setHours(endDate.getHours() + 1);
      endDateTime = this.googleCompactDateTime(endDate);
    }

    // Encode parameters
    const text = encodeURIComponent(params.title || '');
    const details = encodeURIComponent(params.description || '');
    const location = encodeURIComponent(params.location || '');

    // Build URL
    let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startDateTime}/${endDateTime}&details=${details}`;

    if (location) {
      url += `&location=${location}`;
    }

    // Add reminder if specified (in minutes)
    if (params.reminder) {
      url += `&reminders=reminder_${params.reminder}_minutes`;
    }

    return url;
  }

  formatDate(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  }
}
