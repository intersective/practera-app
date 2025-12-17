import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { TextComponent } from './text.component';
import { FormControl, FormsModule } from '@angular/forms';
import { IonicModule, IonTextarea } from '@ionic/angular';
import { Subject, of } from 'rxjs';
import { DebugElement } from '@angular/core';
import { LanguageDetectionPipe } from '@v3/app/pipes/language.pipe';
import { UtilsService } from '@v3/services/utils.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TestUtils } from '@testingv3/utils';

describe('TextComponent', () => {
  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), FormsModule],
      declarations: [TextComponent, LanguageDetectionPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: UtilsService, useClass: TestUtils },
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: (val: string) => val,
            sanitize: (ctx: any, val: string) => val,
          },
        },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
    component.answer = new FormControl('');
    component.comment = new FormControl('');
    component.submitActions$ = new Subject<any>();
    component.control = new FormControl('');

    // Mock console.log to avoid test output
    spyOn(console, 'log');
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('when testing onInit()', () => {
    const dummyQuestion = {
      id: 1,
      name: '',
      type: '',
      description: '',
      isRequired: true,
      canComment: false,
      canAnswer: true,
      choices: [
        {
          id: 1,
          name: 'choice1',
        },
        {
          id: 2,
          name: 'choice2'
        },
      ],
      audience: []
    };
    it('should get correct data for in progress submission', () => {
      component.question = dummyQuestion;
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission = { answer: 'abc' };
      component.reviewStatus = 'not started';
      component.doReview = false;
      component.review = {};
      component.control = new FormControl('');
      fixture.detectChanges();
      expect(component.innerValue).toEqual(component.submission.answer);
      expect(component.control.value).toEqual(component.submission.answer);
    });

    it('should get correct data for in progress review', () => {
      component.question = dummyQuestion;
      component.submissionStatus = 'pending review';
      component.doAssessment = false;
      component.submission = { answer: 'abc' };
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review = {
        comment: 'asdf',
        answer: { name: 'abc' }
      };
      component.control = new FormControl('');
      fixture.detectChanges();
      expect(component.innerValue).toEqual(component.review);
      expect(component.comment).toEqual(component.review.comment);
      expect(component.control.value).toEqual(component.review);
    });
  });

  describe('when testing onChange()', () => {
    beforeEach(() => {
      component.answer.setValue('answer');
      component.comment.setValue('comment');
    });
    it('should get correct data when writing submission answer', () => {
      component.onChange();
      expect(component.innerValue).toBe(component.answer);
    });
    it('should get correct data when writing review answer', () => {
      component.innerValue = { answer: '', comment: '' };
      component.doReview = true;
      component.onChange('answer');
      expect(component.innerValue.answer).toBe(component.answer);
      expect(component.innerValue.comment).toEqual('');
    });
    it('should get correct data when writing review comment', () => {
      component.innerValue = { answer: '', comment: '' };
      component.doReview = true;
      component.onChange('comment');
      expect(component.innerValue.comment).toBe(component.comment);
    });
  });

  it('when testing writeValue(), it should pass data correctly', () => {
    component.writeValue({ data: 'data' });
    expect(component.innerValue).toEqual({ data: 'data' });
    component.writeValue(null);
  });
  it('when testing registerOnChange()', () => {
    component.registerOnChange(() => true);
    expect(component.propagateChange).toBeTruthy();
    component.registerOnTouched(() => true);
  });

  describe('when testing triggerSave()', () => {
    beforeEach(() => {
      spyOn(component.submitActions$, 'next');
    });

    it('should trigger save for review mode', () => {
      component.doReview = true;
      component.doAssessment = false;
      component.reviewId = 1;
      component.submissionId = 2;
      component.question = {
        id: 3,
        name: 'test',
        type: 'text',
        description: 'test',
        isRequired: false,
        canComment: true,
        canAnswer: true,
        audience: []
      };
      component.innerValue = { answer: 'test answer', comment: 'test comment' };

      component.triggerSave();

      expect(component.submitActions$.next).toHaveBeenCalledWith({
        autoSave: true,
        goBack: false,
        reviewSave: {
          reviewId: 1,
          submissionId: 2,
          questionId: 3,
          answer: 'test answer',
          comment: 'test comment'
        }
      });
    });

    it('should trigger save for assessment mode', () => {
      component.doReview = false;
      component.doAssessment = true;
      component.submissionId = 2;
      component.question = {
        id: 3,
        name: 'test',
        type: 'text',
        description: 'test',
        isRequired: false,
        canComment: true,
        canAnswer: true,
        audience: []
      };
      component.answer = new FormControl('test answer');

      component.triggerSave();

      expect(component.submitActions$.next).toHaveBeenCalledWith({
        autoSave: true,
        goBack: false,
        questionSave: {
          submissionId: 2,
          questionId: 3,
          answer: component.answer
        }
      });
    });

    it('should trigger save for both review and assessment mode', () => {
      component.doReview = true;
      component.doAssessment = true;
      component.reviewId = 1;
      component.submissionId = 2;
      component.question = {
        id: 3,
        name: 'test',
        type: 'text',
        description: 'test',
        isRequired: false,
        canComment: true,
        canAnswer: true,
        audience: []
      };
      component.innerValue = { answer: 'test answer', comment: 'test comment' };
      component.answer = new FormControl('test answer');

      component.triggerSave();

      expect(component.submitActions$.next).toHaveBeenCalledWith({
        autoSave: true,
        goBack: false,
        reviewSave: {
          reviewId: 1,
          submissionId: 2,
          questionId: 3,
          answer: 'test answer',
          comment: 'test comment'
        },
        questionSave: {
          submissionId: 2,
          questionId: 3,
          answer: component.answer
        }
      });
    });
  });

  describe('when testing ngAfterViewInit()', () => {
    it('should set up auto-save subscription when answerRef is available', fakeAsync(() => {
      // create a mock input event with a proper target value
      const mockInputEvent = { target: { value: 'test' } };

      component.answerRef = { ionInput: of(mockInputEvent) } as any;
      spyOn(component, 'triggerSave');

      component.ngAfterViewInit();
      tick(900);

      expect(component.subcriptions.length).toBeGreaterThan(0);
    }));

    it('should not set up subscription when answerRef is not available', () => {
      component.answerRef = null;
      component.ngAfterViewInit();
      expect(component.subcriptions.length).toBe(0);
    });
  });

  describe('when testing ngOnDestroy()', () => {
    it('should unsubscribe all subscriptions', () => {
      const mockSubscription1 = jasmine.createSpyObj('Subscription', ['unsubscribe'], { closed: false });
      const mockSubscription2 = jasmine.createSpyObj('Subscription', ['unsubscribe'], { closed: true });

      component.subcriptions = [mockSubscription1, mockSubscription2] as any;

      component.ngOnDestroy();

      expect(mockSubscription1.unsubscribe).toHaveBeenCalled();
      expect(mockSubscription2.unsubscribe).not.toHaveBeenCalled();
    });
  });

  describe('when testing onFocus()', () => {
    it('should handle IE/Edge text reversal for empty textarea', () => {
      const mockTextarea = {
        value: '',
        setSelectionRange: jasmine.createSpy('setSelectionRange')
      };
      const mockEvent = {
        target: { firstChild: mockTextarea }
      };

      // use proper Edge userAgent format that matches the regex /edge\//i
      spyOnProperty(window.navigator, 'userAgent', 'get').and.returnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edge/91.0.864.59');

      component.onFocus(mockEvent);

      expect(mockTextarea.setSelectionRange).toHaveBeenCalled();
    });

    it('should handle IE/Edge text reversal for textarea with existing text', () => {
      const mockTextarea = {
        value: 'existing text',
        setSelectionRange: jasmine.createSpy('setSelectionRange')
      };
      const mockEvent = {
        target: { firstChild: mockTextarea }
      };

      // use proper Edge userAgent format that matches the regex /edge\//i
      spyOnProperty(window.navigator, 'userAgent', 'get').and.returnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/91.0.864.59');

      component.onFocus(mockEvent);

      expect(mockTextarea.setSelectionRange).toHaveBeenCalled();
      expect(mockTextarea.value).toBe('existing text');
    });

    it('should not handle text reversal for non-IE/Edge browsers', () => {
      const mockTextarea = {
        value: 'existing text',
        setSelectionRange: jasmine.createSpy('setSelectionRange')
      };
      const mockEvent = {
        target: { firstChild: mockTextarea }
      };

      spyOnProperty(window.navigator, 'userAgent', 'get').and.returnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      component.onFocus(mockEvent);

      expect(mockTextarea.setSelectionRange).not.toHaveBeenCalled();
    });
  });

  describe('when testing audienceContainReviewer()', () => {
    it('should return true when audience contains reviewer and has multiple audiences', () => {
      component.question = {
        audience: ['student', 'reviewer'],
        id: 1,
        name: 'test',
        type: 'text',
        description: 'test',
        isRequired: false,
        canComment: true,
        canAnswer: true
      };

      expect(component.audienceContainReviewer()).toBe(true);
    });

    it('should return false when audience contains reviewer but only one audience', () => {
      component.question = {
        audience: ['reviewer'],
        id: 1,
        name: 'test',
        type: 'text',
        description: 'test',
        isRequired: false,
        canComment: true,
        canAnswer: true
      };

      expect(component.audienceContainReviewer()).toBe(false);
    });

    it('should return false when audience does not contain reviewer', () => {
      component.question = {
        audience: ['student', 'mentor'],
        id: 1,
        name: 'test',
        type: 'text',
        description: 'test',
        isRequired: false,
        canComment: true,
        canAnswer: true
      };

      expect(component.audienceContainReviewer()).toBe(false);
    });
  });

  describe('when testing _showSavedAnswers() edge cases', () => {
    const dummyQuestion = {
      id: 1,
      name: '',
      type: '',
      description: '',
      isRequired: true,
      canComment: false,
      canAnswer: true,
      choices: [],
      audience: []
    };

    it('should handle review with "not start" status', () => {
      component.question = dummyQuestion;
      component.submissionStatus = 'pending review';
      component.doAssessment = false;
      component.submission = { answer: 'abc' };
      component.reviewStatus = 'not start';
      component.doReview = true;
      component.review = {
        comment: 'test comment',
        answer: 'test answer'
      };
      component.control = new FormControl('');

      // Use ngOnInit to trigger _showSavedAnswers()
      component.ngOnInit();

      expect(component.innerValue.comment).toEqual('test comment');
      expect(component.innerValue.answer).toEqual('test answer');
      // note: component.comment and component.answer become strings after _showSavedAnswers
      expect(component.comment as any).toEqual('test comment');
      expect(component.answer as any).toEqual('test answer');
    });

    it('should not set values when conditions are not met', () => {
      component.question = dummyQuestion;
      component.submissionStatus = 'submitted';
      component.doAssessment = false;
      component.reviewStatus = 'completed';
      component.doReview = false;
      component.control = new FormControl('test');
      component.innerValue = 'original';

      component.ngOnInit();

      // innerValue remains unchanged since no conditions were met
      expect(component.innerValue).toBe('original');
    });

    it('should handle missing review data gracefully', () => {
      component.question = dummyQuestion;
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review = {};
      component.control = new FormControl('');

      component.ngOnInit();

      expect(component.innerValue).toEqual({ answer: undefined, comment: undefined });
    });

    it('should handle missing submission data gracefully', () => {
      component.question = dummyQuestion;
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission = {};
      component.control = new FormControl('');

      component.ngOnInit();

      expect(component.innerValue).toBeUndefined();
    });
  });

  describe('when testing onChange() edge cases', () => {
    it('should handle onChange when innerValue is not initialized for review', () => {
      component.innerValue = null;
      component.doReview = true;
      const answerControl = new FormControl('new answer');
      component.answer = answerControl as any;
      component.onChange('answer');

      // component stores the FormControl reference, not its value
      expect(component.innerValue.answer).toBe(answerControl);
      expect(component.innerValue.comment).toEqual('');
    });

    it('should propagate changes correctly', () => {
      spyOn(component, 'propagateChange');
      component.answer = new FormControl('test') as any;
      component.doReview = false;

      component.onChange();

      expect(component.propagateChange).toHaveBeenCalledWith(component.answer);
    });
  });

  describe('when testing writeValue() edge cases', () => {
    it('should not set innerValue when value is null', () => {
      component.innerValue = 'existing';
      component.writeValue(null);
      expect(component.innerValue).toBe('existing');
    });

    it('should not set innerValue when value is undefined', () => {
      component.innerValue = 'existing';
      component.writeValue(undefined);
      expect(component.innerValue).toBe('existing');
    });

    it('should not set innerValue when value is empty string', () => {
      component.innerValue = 'existing';
      component.writeValue('');
      expect(component.innerValue).toBe('existing');
    });
  });

});

