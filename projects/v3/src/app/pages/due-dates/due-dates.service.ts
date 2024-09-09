import { Injectable } from '@angular/core';
import { createEvent, EventAttributes } from 'ics';

@Injectable({
  providedIn: 'root'
})
export class DueDatesService {

  constructor() { }

  createCalendarEvent(eventData: EventAttributes) {
    return createEvent(eventData, (error, value) => {
      if (error) {
        console.error('Failed to create event:', error);
        return;
      }
      const blob = new Blob([value], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'event.ics';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  generateGoogleCalendarUrl(event: {
    start: Date;
    duration: number;
    title: string | number | boolean;
    description: string | number | boolean;
    location: string | number | boolean;
  }): string {
    const startTime = this.formatDate(event.start);
    const endTime = this.formatDate(new Date(event.start.getTime() + event.duration * 60000));

    let url = `https://calendar.google.com/calendar/render?action=TEMPLATE`;
    url += `&text=${encodeURIComponent(event.title)}`;
    url += `&dates=${startTime}/${endTime}`;
    url += `&details=${encodeURIComponent(event.description)}`;
    url += `&location=${encodeURIComponent(event.location)}`;
    url += `&sprop=&sprop=name:`;

    return url;
  }

  formatDate(date: Date): string {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  }
}
