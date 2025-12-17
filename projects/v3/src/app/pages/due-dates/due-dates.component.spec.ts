import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { DueDatesComponent } from './due-dates.component';
import { DueDatesService } from './due-dates.service';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { AssessmentService } from '@v3/app/services/assessment.service';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('DueDatesComponent', () => {
  let component: DueDatesComponent;
  let fixture: ComponentFixture<DueDatesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DueDatesComponent ],
      imports: [IonicModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: UtilsService, useClass: TestUtils },
        {
          provide: DueDatesService,
          useValue: jasmine.createSpyObj('DueDatesService', ['createCalendarEvent']),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['alert']),
        },
        {
          provide: AssessmentService,
          useValue: jasmine.createSpyObj('AssessmentService', {
            'dueStatusAssessments': of([]),
          }),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DueDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
