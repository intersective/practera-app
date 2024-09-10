import { Injectable } from '@angular/core';
import { createEvent, EventAttributes } from 'ics';

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

  generateGoogleCalendarUrl(event: {
    start?: Date;
    duration?: number;
    title: string | number | boolean;
    description?: string | number | boolean;
    location?: string | number | boolean;
    organizer?: { name: string; email: string };
  }): string {
    event.duration = event.duration || 60; // 1 hour default duration
    const startTime = this.formatDate(event.start);
    const endTime = this.formatDate(new Date(event.start.getTime() + event.duration * 60000));

    let url = `https://calendar.google.com/calendar/render?action=TEMPLATE`;
    url += `&text=${encodeURIComponent(event.title)}`;
    if (event.start) {
      url += `&dates=${startTime}/${endTime}`;
    }

    if (event.description) {
      url += `&details=${encodeURIComponent(event.description)}`;
    }

    if (event.location) {
      url += `&location=${encodeURIComponent(event.location)}`;
    }
    // url += `&organizer=${encodeURIComponent(event.organizer.toString())}`;
    url += `&sprop=&sprop=name:`;

    return url;
  }

  formatDate(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  }
}
