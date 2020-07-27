import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Observable, of, pipe } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UtilsService } from '@services/utils.service';
import { FastFeedbackSubmitterService } from './fast-feedback-submitter.service';
import { BrowserStorageService } from '@services/storage.service';
import { NotificationService } from '@shared/notification/notification.service';
import { ModalController } from '@ionic/angular';
import { FastFeedbackComponent } from './fast-feedback.component';
import { QuestionComponent } from './question/question.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { MockNewRelicService } from '@testing/mocked.service';
import { Apollo } from 'apollo-angular';

class Page {
  get questions() {
    return this.queryAll<HTMLElement>('question');
  }
  fixture: ComponentFixture<FastFeedbackComponent>;

  constructor(fixture: ComponentFixture<FastFeedbackComponent>) {
    this.fixture = fixture;
  }
  private query<T>(selector: string): T {
    return this.fixture.nativeElement.querySelector(selector);
  }
  private queryAll<T>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }
}

describe('FastFeedbackComponent', () => {
  let component: FastFeedbackComponent;
  let fixture: ComponentFixture<FastFeedbackComponent>;
  let page: Page;
  let fastfeedbackSpy: jasmine.SpyObj<FastFeedbackSubmitterService>;
  let notificationSpy: jasmine.SpyObj<NotificationService>;
  let modalSpy: jasmine.SpyObj<ModalController>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, ReactiveFormsModule ],
      declarations: [ FastFeedbackComponent, QuestionComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        Apollo,
        {
          provide: FastFeedbackSubmitterService,
          useValue: jasmine.createSpyObj('FastFeedbackSubmitterService', ['submit'])
        },
        UtilsService,
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('NotificationService', ['alert'])
        },
        {
          provide: ModalController,
          useValue: {
            dismiss: jasmine.createSpy('dismiss')
          }
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['set'])
        },
        {
          provide: NewRelicService,
          useClass: MockNewRelicService
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FastFeedbackComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fastfeedbackSpy = TestBed.inject(FastFeedbackSubmitterService) as jasmine.SpyObj<FastFeedbackSubmitterService>;
    notificationSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    modalSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('when testing ngOnInit(), it should get the correct data', () => {
    component.questions = Array.from({length: 5}, (x, i) => {
      return {
        id: i + 1
      };
    });
    component.ngOnInit();
    expect(Object.keys(component.fastFeedbackForm.controls).length).toBe(5);
    expect(component.newRelicTracer).toBeTruthy();
  });

  it('when testing dismiss(), it should dismiss', () => {
    component.dismiss({});
    expect(modalSpy.dismiss.calls.count()).toBe(1);
  });

  describe('when testing submit()', () => {
    beforeEach(() => {
      component.fastFeedbackForm = new FormGroup({
        0: new FormControl(''),
        1: new FormControl(''),
        2: new FormControl(''),
        3: new FormControl(''),
        4: new FormControl('')
      });
      component.fastFeedbackForm.setValue(Array.from({length: 5}, (x, i) => {
        return {
          answer: i + 2,
          questionId: i + 1
        };
      }));
      component.meta = {
        context_id: 1,
        team_id: 2,
        target_user_id: 3,
        team_name: 'team',
        assessment_name: 'asmt'
      };
      fastfeedbackSpy.submit.and.returnValue(of({}));
    });
    afterEach(() => {
      expect(fastfeedbackSpy.submit.calls.count()).toBe(1);
      expect(modalSpy.dismiss.calls.count()).toBe(1);
    });

    describe('should submit correct data', () => {
      beforeEach(() => {
        component.ngOnInit();
      });

      it('when submission answer is provided in full', fakeAsync(() => {
        component.submit();
        tick(2500);
        expect(fastfeedbackSpy.submit.calls.first().args[1]).toEqual({
          context_id: 1,
          team_id: 2
        });
      }));

      it('when user isn\'t in a team', fakeAsync(() => {
        component.meta.team_id = null;
        component.submit();
        tick(2500);

        expect(fastfeedbackSpy.submit.calls.first().args[1]).toEqual({
          context_id: 1,
          target_user_id: 3
        });
      }));

      it('when team_id and target_user_id is null', fakeAsync(() => {
        component.meta.team_id = null;
        component.meta.target_user_id = null;
        component.submit();
        tick(2500);
        expect(fastfeedbackSpy.submit.calls.first().args[1]).toEqual({
          context_id: 1
        });
      }));

    });
  });
});
