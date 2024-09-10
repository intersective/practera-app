import { debounce } from 'lodash';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Assessment, AssessmentService } from './../../services/assessment.service';
import { Component, OnDestroy } from '@angular/core';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { EventAttributes, convertTimestampToArray } from 'ics';
import { DueDatesService } from './due-dates.service';
import { debounceTime, first, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

interface CalendarEvent {
  dueDate: Date;
  name: string;
  description: string;
  location?: string;
}

interface GroupedAssessments {
  month: string;
  assessments: Assessment[];
}

@Component({
  selector: 'app-due-dates',
  templateUrl: './due-dates.component.html',
  styleUrls: ['./due-dates.component.scss'],
})
export class DueDatesComponent implements OnDestroy {
  searchText: string;
  statusFilter: string;
  filteredItems: Assessment[];
  assessments$: BehaviorSubject<GroupedAssessments[]> = new BehaviorSubject<GroupedAssessments[]>(null);
  unsubscribe$: Subject<void> = new Subject<void>();

  searchText$: Subject<string> = new Subject<string>();
  isLoading = false;

  constructor(
    private dueDatesService: DueDatesService,
    private notificationsService: NotificationsService,
    private assessmentService: AssessmentService,
    private router: Router,
  ) {}

  ionViewDidEnter() {
    this.isLoading = true;
    this.statusFilter = '';
    this.assessmentService.dueStatusAssessments()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (assessments) => {
          if (assessments?.length) {
            const sortedAssessments = assessments.sort((a, b) => {
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });

            const groupedAssessments = this.groupByDate(sortedAssessments);
            this.assessments$.next(groupedAssessments);
          } else {
            this.assessments$.next([]);
          }

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  groupByDate(assessments: Assessment[]): GroupedAssessments[] {
    const grouped = assessments.reduce((groups, assessment) => {
      const date = new Date(assessment.dueDate);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const monthYear = assessment.dueDate ? `${month} ${year}` : 'No due date';  // Group by Month Year (e.g., "September 2024")

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }

      groups[monthYear].push(assessment);
      return groups;
    }, {});

    // Convert grouped object to an array of { month, assessments }
    const groupedArray = Object.keys(grouped).map(month => ({
      month,
      assessments: grouped[month]
    }));

    // Sort the array to ensure "No due date" is always the last group
    groupedArray.sort((a, b) => {
      if (a.month === 'No due date') return 1;
      if (b.month === 'No due date') return -1;
      return 0;
    });

    return groupedArray;
  }

  convertDateTimeString(dateTimeString: string): number[] {
    const [datePart, timePart] = dateTimeString.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, _seconds] = timePart.split(':').map(Number);
    return [year, month, day, hours, minutes];
  }

  downloadiCal(event: Assessment) {
    try {
      const [year, month, day, hour, minutes] = this.convertDateTimeString(event.dueDate);
      const eventData: EventAttributes = {
        start: [year, month, day, hour, minutes],
        // start: dateArray,
        duration: { hours: 1, minutes: 30 },
        title: event.name,
        description: event.description,
        // location: event.location || 'Sydney',
        location: '',
        // url: /* event.url || */ '',
        // status: event.status,
        busyStatus: 'BUSY',
        organizer: { name: 'Practera', email: 'contact@practera.com' },
      };

      this.dueDatesService.createCalendarEvent(eventData);
    } catch (error) {
      console.error('Failed to create calendar event', error);
      this.notificationsService.alert({
        message: 'Failed to create calendar event',
      });
    }
  }

  downloadGoogleCalendar(assessment: Assessment) {
    try {
      const googleCalendarUrl = this.dueDatesService.generateGoogleCalendarUrl({
        start: new Date(assessment.dueDate),
        // duration: 90,
        title: assessment.name,
        description: assessment.description,
        // location: assessment?.location || 'Sydney',
        organizer: { name: 'Practera', email: 'contact@practera.com' },
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

  /* filterItems() {
    this.filteredItems = this.assessments$.getValue().filter(item => {
      if (this.searchText && !item.name.toLowerCase().includes(this.searchText.toLowerCase())) {
        return false;
      }

      if (this.statusFilter && item.name !== this.statusFilter) {
        return false;
      }

      return true;
    });
  } */

  // @TODO: implement goTo method
  // current API data is not sufficient to implement this method
  goTo(assessment) {
    this.assessmentService.fetchAssessment(assessment.id, 'assessment', null, null).subscribe((res) => {
      this.router.navigate(['v3', 'activity-desktop', assessment.id]);
    });
  }

  addToCalendar() {
    // this.modalCtrl.create({
    //   component: AddToCalendarComponent,
    //   componentProps: {
    //     assessments: this.assessments$.getValue(),
    //   },
    // }).then(modal => {
    //   modal.present();
    // });
  }
}
