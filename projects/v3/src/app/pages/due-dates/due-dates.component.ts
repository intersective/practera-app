import { Component } from '@angular/core';
import { NotificationService } from '@app/shared/notification/notification.service';
import { EventAttributes } from 'ics';
import { DueDatesService } from './due-dates.service';

interface CalendarEvent {
  dueDate: Date;
  name: string;
  description: string;
  location?: string;
}

@Component({
  selector: 'app-due-dates',
  templateUrl: './due-dates.component.html',
  styleUrls: ['./due-dates.component.scss'],
})
export class DueDatesComponent {
  assessmentDueDates: { name: string, status: string, dueDate: string }[] = [
    { name: 'Assessment 1', status: 'In Progress', dueDate: '2022-01-01' },
    { name: 'Assessment 2', status: 'Pending Review', dueDate: '2022-02-01' },
    { name: 'Assessment 3', status: 'Not Started', dueDate: '2022-03-01' }
  ];

  searchText: string;
  statusFilter: string;
  filteredItems: { name: string, status: string, dueDate: string }[];

  constructor(
    private dueDatesService: DueDatesService,
    private notificationsService: NotificationService,
  ) { }

  downloadiCal(event: any) {
    const eventData: EventAttributes = {
      start: event.dueDate,
      duration: { hours: 1, minutes: 30 },
      title: event.name,
      description: event.description,
      location: event.location || 'Sydney',
      url: event.url,
      geo: { lat: -33.8688, lon: 151.2093 },
      status: event.status,
      busyStatus: 'BUSY',
      organizer: { name: 'Practera', email: 'contact@practera.com' },
    };

    this.dueDatesService.createCalendarEvent(eventData);
  }

  downloadGoogleCalendar(event: CalendarEvent | any) {
    try {
      const googleCalendarUrl = this.dueDatesService.generateGoogleCalendarUrl({
        start: event.dueDate,
        duration: 90,
        title: event.name,
        description: event.description,
        location: event.location || 'Sydney',
      });

      const newWindow = window.open(googleCalendarUrl, '_blank');
      if (!newWindow) {
        this.notificationsService.alert({
          message: 'Please allow pop-ups for this website',
        });
      }
    } catch (error) {
      console.error('Failed to generate calendar URL', error);
      this.notificationsService.alert({
        message: 'Failed to generate Google calendar URL',
      });
    }
  }
  filterItems() {
    this.filteredItems = this.assessmentDueDates.filter(item => {
      if (this.searchText && !item.name.toLowerCase().includes(this.searchText.toLowerCase())) {
        return false;
      }

      if (this.statusFilter && item.status !== this.statusFilter) {
        return false;
      }

      return true;
    });
  }
}
