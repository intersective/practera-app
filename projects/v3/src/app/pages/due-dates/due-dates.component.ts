import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { Assessment, AssessmentService } from './../../services/assessment.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { EventAttributes } from 'ics';
import { DueDatesService } from './due-dates.service';
import { debounceTime, takeUntil, map } from 'rxjs/operators';
import { Router } from '@angular/router';

interface GroupedAssessments {
  month: string;
  assessments: Assessment[];
}

@Component({
  selector: 'app-due-dates',
  templateUrl: './due-dates.component.html',
  styleUrls: ['./due-dates.component.scss'],
})
export class DueDatesComponent implements OnDestroy, OnInit {
  searchText: string = '';
  statusFilter: string;
  filteredItems: Assessment[];
  assessments$: BehaviorSubject<GroupedAssessments[]> = new BehaviorSubject<GroupedAssessments[]>(null);
  filteredAssessments$: Observable<GroupedAssessments[]>;
  unsubscribe$: Subject<void> = new Subject<void>();

  searchText$: Subject<string> = new Subject<string>();
  isLoading = false;

  constructor(
    private dueDatesService: DueDatesService,
    private notificationsService: NotificationsService,
    private assessmentService: AssessmentService,
    private router: Router,
  ) {}

  ngOnInit() {
    // search changes & debounce
    this.searchText$
      .pipe(
        debounceTime(200),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(searchTerm => {
        this.filterAssessments(searchTerm);
      });

    this.filteredAssessments$ = this.assessments$.pipe(
      map(groups => {
        if (!groups) return null;
        if (!this.searchText) return groups;

        // Filter assessments based on search text
        return this.filterAssessmentGroups(groups, this.searchText);
      })
    );
  }

  ionViewDidEnter() {
    this.isLoading = true;
    this.statusFilter = '';
    this.assessmentService.dueStatusAssessments()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((assessments) => {
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
      }, () => {
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Filter assessments
   */
  private filterAssessments(searchText: string) {
    this.searchText = searchText;
    const currentValue = this.assessments$.getValue();
    if (currentValue) {
      this.assessments$.next([...currentValue]);
    }
  }

  /**
   * Filter assessment groups
   */
  private filterAssessmentGroups(groups: GroupedAssessments[], searchText: string): GroupedAssessments[] {
    if (!searchText.trim()) {
      return groups;
    }

    const searchLower = searchText.toLowerCase();

    // Filter each group's assessments
    const filteredGroups = groups.map(group => {
      const filteredAssessments = group.assessments.filter(assessment =>
        assessment.name.toLowerCase().includes(searchLower) ||
        assessment.description?.toLowerCase().includes(searchLower)
      );

      return {
        ...group,
        assessments: filteredAssessments
      };
    });

    // Remove empty groups
    return filteredGroups.filter(group => group.assessments.length > 0);
  }

  groupByDate(assessments: Assessment[]): GroupedAssessments[] {
    const grouped: { [key: string]: Assessment[] } = {};

    for (const assessment of assessments) {
      let monthYear: string;
      if (assessment.dueDate) {
        const date = new Date(assessment.dueDate);
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        monthYear = `${month} ${year}`;
      } else {
        monthYear = 'No due date';
      }

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(assessment);
    }

    const groupedArray = Object.keys(grouped).map(month => ({
      month,
      assessments: grouped[month]
    }));

    // Sort by date, "No due date" last
    groupedArray.sort((a, b) => {
      if (a.month === 'No due date') return 1;
      if (b.month === 'No due date') return -1;
      // Optional: sort by actual date if desired
      const aDate = new Date(a.assessments[0].dueDate);
      const bDate = new Date(b.assessments[0].dueDate);
      return aDate.getTime() - bDate.getTime();
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
      // Parse the due date properly
      const dueDate = new Date(event.dueDate);

      // Convert to expected format for ics library [year, month, day, hour, minute]
      // Note: ics library expects month to be 1-12 (JavaScript Date uses 0-11)
      // The ics library's start property requires number[] with 5 elements
      const dateArray: [number, number, number, number, number] = [
        dueDate.getFullYear(),
        dueDate.getMonth() + 1, // Month is 0-based in JS, but ics expects 1-12
        dueDate.getDate(),
        dueDate.getHours(),
        dueDate.getMinutes()
      ];

      const eventData: EventAttributes = {
        start: dateArray,
        duration: { hours: 1 }, // Consistent 1 hour duration, same as Google Calendar
        title: event.name,
        description: event.description || `Complete assessment: ${event.name}`,
        location: '',
        busyStatus: 'BUSY',
        organizer: { name: 'Practera', email: 'contact@practera.com' },
        alarms: [{ action: 'display', trigger: { minutes: 60, before: true } }] // Add reminder 60 min before
      };

      this.dueDatesService.createCalendarEvent(eventData);
    } catch (error) {
      console.error('Failed to create calendar event', error);
      this.notificationsService.alert({
        message: 'Failed to create iCalendar event: ' + (error.message || 'Unknown error')
      });
    }
  }

  downloadGoogleCalendar(assessment: Assessment) {
    try {
      // Format date in the required format for Google Calendar (YYYYMMDDTHHMMSS)
      const startDate = new Date(assessment.dueDate);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1); // Add 1 hour duration by default

      const googleCalendarUrl = this.dueDatesService.generateGoogleCalendarUrl({
        start: startDate,
        end: endDate,
        title: assessment.name,
        description: assessment.description || `Complete assessment: ${assessment.name}`,
        reminder: 60, // Add a reminder 60 minutes before
        organizer: { name: 'Practera', email: 'contact@practera.com' },
      });
      // Open the Google Calendar URL in a new tab
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

  goTo(assessment) {
    this.assessmentService.fetchAssessment(assessment.id, 'assessment', null, null).subscribe((res) => {
      console.log('assessment', res);
      this.router.navigate(['v3', 'activity-desktop', assessment.id]);
    });
  }
}
