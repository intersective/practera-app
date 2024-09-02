import { debounce } from 'lodash';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Assessment, AssessmentService } from './../../services/assessment.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { EventAttributes } from 'ics';
import { DueDatesService } from './due-dates.service';
import { debounceTime, first, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

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
export class DueDatesComponent implements OnInit, OnDestroy {
  searchText: string;
  statusFilter: string;
  filteredItems: Assessment[];
  assessments$: BehaviorSubject<Assessment[]>;
  unsubscribe$: Subject<void> = new Subject<void>();

  searchText$: Subject<string> = new Subject<string>();

  constructor(
    private dueDatesService: DueDatesService,
    private notificationsService: NotificationsService,
    private assessmentService: AssessmentService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.assessments$ = new BehaviorSubject<Assessment[]>([]);
    this.searchText$.pipe(
      takeUntil(this.unsubscribe$),
      debounceTime(300),
    ).subscribe(() => {
      this.filterItems();
    });
  }

  ionViewDidEnter() {
    this.statusFilter = '';
    this.assessmentService.dueStatusAssessments()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((assessments) => {
        console.log('assessments', assessments);
        this.assessments$.next(assessments || []);
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

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
    this.filteredItems = this.assessments$.getValue().filter(item => {
      if (this.searchText && !item.name.toLowerCase().includes(this.searchText.toLowerCase())) {
        return false;
      }

      if (this.statusFilter && item.name !== this.statusFilter) {
        return false;
      }

      return true;
    });
  }

  // @TODO: implement goTo method
  // current API data is not sufficient to implement this method
  goTo(assessment) {
    this.assessmentService.fetchAssessment(assessment.id, 'assessment', null, null).subscribe((res) => {
      console.log('assessment', res);
      this.router.navigate(['v3', 'activity-desktop', assessment.id]);
    });
  }
}
