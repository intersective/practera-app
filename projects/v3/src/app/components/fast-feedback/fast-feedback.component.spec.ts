import { CUSTOM_ELEMENTS_SCHEMA, Directive, forwardRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, flush, flushMicrotasks } from '@angular/core/testing';
import { of } from 'rxjs';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { UtilsService } from '@v3/services/utils.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { NotificationsService } from '@v3/services/notifications.service';
import { ModalController, NavParams } from '@ionic/angular';
import { FastFeedbackComponent } from './fast-feedback.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TestUtils } from '@testingv3/utils';
import { FastFeedbackService } from '@v3/services/fast-feedback.service';
import { HomeService } from '@v3/app/services/home.service';
import { RequestService } from 'request';
import { DemoService } from '@v3/app/services/demo.service';

@Directive({
  standalone: false,
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'ion-radio-group[formControlName]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupValueAccessorStub),
      multi: true
    }
  ]
})
class RadioGroupValueAccessorStub implements ControlValueAccessor {
  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
}

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
  let fastfeedbackSpy: jasmine.SpyObj<FastFeedbackService>;
  let notificationSpy: jasmine.SpyObj<NotificationsService>;
  let modalSpy: jasmine.SpyObj<ModalController>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [FastFeedbackComponent, RadioGroupValueAccessorStub],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: ModalController,
          useValue: {
            dismiss: jasmine.createSpy('dismiss')
          }
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            set: null,
            getUser: { teamId: 1 }
          })
        },
        {
          provide: FastFeedbackService,
          useValue: jasmine.createSpyObj('FastFeedbackService', ['submit', 'pullFastFeedback'])
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['alert', 'presentToast'])
        },
        {
          provide: NavParams,
          useValue: {
            get: jasmine.createSpy('get').and.callFake((key: string) => {
              if (key === 'modal') {
                return { closable: true, componentProps: {} };
              }
              return null;
            })
          }
        },
        {
          provide: HomeService,
          useValue: jasmine.createSpyObj('HomeService', {
            getProgress: of({}),
            getActivities: of([]),
            getPulseCheckStatuses: of({}),
            getPulseCheckSkills: of({})
          })
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['post', 'get'])
        },
        {
          provide: DemoService,
          useValue: jasmine.createSpyObj('DemoService', ['isDemoApp'])
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FastFeedbackComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fastfeedbackSpy = TestBed.inject(FastFeedbackService) as jasmine.SpyObj<FastFeedbackService>;
    notificationSpy = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    modalSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('when testing ngOnInit(), it should get the correct data', () => {
    component.questions = Array.from({ length: 5 }, (x, i) => {
      return {
        id: i + 1
      };
    });
    component.ngOnInit();
    expect(Object.keys(component.fastFeedbackForm.controls).length).toBe(5);
  });

  it('when testing dismiss(), it should dismiss and release lock', () => {
    const storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    component.dismiss({});
    expect(modalSpy.dismiss.calls.count()).toBe(1);
    expect(storageSpy.set).toHaveBeenCalledWith('fastFeedbackOpening', false);
  });

  it('ngOnDestroy() should release fastFeedbackOpening lock', () => {
    const storageSpy = TestBed.inject(BrowserStorageService) as jasmine.SpyObj<BrowserStorageService>;
    component.ngOnDestroy();
    expect(storageSpy.set).toHaveBeenCalledWith('fastFeedbackOpening', false);
  });

  describe('choice description details', () => {
    const questionId = 20;
    const firstChoiceId = 201;
    const secondChoiceId = 202;
    const choiceWithoutDescriptionId = 203;

    const descriptionId = (choiceId: number) =>
      `fast-feedback-choice-description-${questionId}-${choiceId}`;

    const getDescription = (choiceId: number): HTMLElement | null =>
      fixture.nativeElement.querySelector(`#${descriptionId(choiceId)}`);

    const getToggle = (choiceId: number): HTMLElement | null =>
      fixture.nativeElement.querySelector(`[aria-controls="${descriptionId(choiceId)}"]`);

    beforeEach(() => {
      component.isMobile = false;
      component.questions = [
        {
          id: questionId,
          name: 'Innovation',
          description: 'Choose the level that best describes you.',
          isRequired: true,
          choices: [
            {
              id: firstChoiceId,
              name: 'Extremely Skilled',
              description: 'I can apply this skill independently.'
            },
            {
              id: secondChoiceId,
              name: 'Very Skilled',
              description: 'I can apply this skill with occasional support.'
            },
            {
              id: choiceWithoutDescriptionId,
              name: 'Not Yet Skilled',
              description: ''
            }
          ]
        }
      ];
      fixture.detectChanges();
    });

    it('keeps descriptions rendered but collapsed until explicitly opened', () => {
      const description = getDescription(firstChoiceId);
      const toggle = getToggle(firstChoiceId);

      expect(description).withContext('description panel should have a stable DOM id').not.toBeNull();
      expect(description?.hidden).toBeTrue();
      expect(toggle).withContext('answers with descriptions should have a details button').not.toBeNull();
      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
      expect(toggle?.getAttribute('aria-label')).toBe('Show details for Extremely Skilled');
    });

    it('does not open a description when the pointer crosses an answer', () => {
      const firstChoiceItem = fixture.nativeElement.querySelector('ion-item.choice-item');

      firstChoiceItem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      fixture.detectChanges();

      expect(getDescription(firstChoiceId)?.hidden).toBeTrue();
    });

    it('opens and closes a description from its details button', () => {
      const toggle = getToggle(firstChoiceId);

      toggle?.click();
      fixture.detectChanges();

      expect(getDescription(firstChoiceId)?.hidden).toBeFalse();
      expect(toggle?.getAttribute('aria-expanded')).toBe('true');
      expect(toggle?.getAttribute('aria-label')).toBe('Hide details for Extremely Skilled');

      toggle?.click();
      fixture.detectChanges();

      expect(getDescription(firstChoiceId)?.hidden).toBeTrue();
      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    });

    it('keeps only one choice description open at a time', () => {
      getToggle(firstChoiceId)?.click();
      getToggle(secondChoiceId)?.click();
      fixture.detectChanges();

      expect(getDescription(firstChoiceId)?.hidden).toBeTrue();
      expect(getDescription(secondChoiceId)?.hidden).toBeFalse();
    });

    it('shows details buttons only for answers with descriptions', () => {
      const toggles = fixture.nativeElement.querySelectorAll('ion-button.description-toggle-btn');

      expect(toggles.length).toBe(2);
      expect(getToggle(choiceWithoutDescriptionId)).toBeNull();
      expect(getDescription(choiceWithoutDescriptionId)).toBeNull();
    });

    it('does not select an answer or bubble the click when details are toggled', () => {
      const firstChoiceItem = fixture.nativeElement.querySelector('ion-item.choice-item');
      const toggle = getToggle(firstChoiceId);
      const itemClickSpy = jasmine.createSpy('itemClick');
      const submitSpy = spyOn(component, 'submit');
      firstChoiceItem.addEventListener('click', itemClickSpy);

      expect(toggle).withContext('the details button must exist before its click can be isolated').not.toBeNull();
      toggle?.click();
      fixture.detectChanges();

      expect(component.fastFeedbackForm.get(questionId.toString())?.value).toBeNull();
      expect(itemClickSpy).not.toHaveBeenCalled();
      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('uses the explicit details button on mobile instead of answer selection', () => {
      component.isMobile = true;
      component.fastFeedbackForm.get(questionId.toString())?.setValue(firstChoiceId);
      fixture.detectChanges();

      expect(getDescription(firstChoiceId)?.hidden).toBeTrue();

      getToggle(firstChoiceId)?.click();
      fixture.detectChanges();

      expect(getDescription(firstChoiceId)?.hidden).toBeFalse();
    });
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
      component.fastFeedbackForm.setValue(Array.from({ length: 5 }, (x, i) => {
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
      // Set up fastfeedbackSpy.submit to return an Observable
      fastfeedbackSpy.submit.and.returnValue(of({}));
    });
    afterEach(() => {
      expect(fastfeedbackSpy.submit).toHaveBeenCalledTimes(1);
      expect(modalSpy.dismiss.calls.count()).toBe(1);
    });

    describe('should submit correct data', () => {
      beforeEach(() => {
        // set closable to false to test the meta.team_id path
        // Note: ngOnInit() is already called in the outer beforeEach, so we can override closable after
        component.ngOnInit();
        component.closable = false;
      });

      it('when submission answer is provided in full', fakeAsync(() => {
        component.submit();
        tick(2500);
        expect(fastfeedbackSpy.submit.calls.first().args[1]).toEqual({
          contextId: 1,
          teamId: 2,
          targetUserId: null
        });
      }));

      it('when user isn\'t in a team', fakeAsync(() => {
        component.meta.team_id = null;
        component.submit();
        tick(2500);

        expect(fastfeedbackSpy.submit.calls.first().args[1]).toEqual({
          contextId: 1,
          teamId: null,
          targetUserId: 3
        });
      }));

      it('when team_id and target_user_id is null', fakeAsync(() => {
        component.meta.team_id = null;
        component.meta.target_user_id = null;
        component.submit();
        tick(2500);
        expect(fastfeedbackSpy.submit.calls.first().args[1]).toEqual({
          contextId: 1,
          teamId: null,
          targetUserId: null
        });
      }));
    });

    describe('submit()', () => {
      it('should fail submission gracefully', fakeAsync(() => {
        const THROWN_ERROR = 'ERROR MESSAGE';
        // component.submitData.and.throwError(THROWN_ERROR);

        component.ngOnInit();
        component.submit();

        // flush all pending timers (2000ms delay + 500ms in dismiss)
        tick(2500);
        expect(component.submissionCompleted).toBeTruthy();
        expect(modalSpy.dismiss).toHaveBeenCalled();
      }));
    });
  });
});
