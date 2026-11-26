import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TextComponent } from './text.component';
import { FormControl, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
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

  describe('read-only ownership context', () => {
    beforeEach(() => {
      component.question = {
        id: 1,
        name: 'Question',
        type: 'text',
        description: '',
        isRequired: false,
        canAnswer: true,
        canComment: false,
        audience: ['submitter', 'reviewer'],
      } as any;
      component.submissionStatus = 'feedback available';
      component.reviewStatus = 'done';
      component.doAssessment = false;
      component.doReview = false;
      component.submission = { answer: 'learner response' };
      component.review = { answer: 'reviewer response' };
    });

    it('should use ownership labels for shared feedback', () => {
      component.viewerRole = 'learner';

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Your Answer');
      expect(fixture.nativeElement.textContent).toContain("Reviewer's Answer");
      expect(fixture.nativeElement.textContent).not.toContain("Learner's Answer");
    });

    it('should show reviewer-only text without an ownership label', () => {
      component.question.audience = ['reviewer'];
      component.question.reviewerOnly = true;
      component.submission = {};
      component.isReviewerFeedbackContext = true;

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('reviewer response');
      expect(fixture.nativeElement.textContent).not.toContain("Reviewer's Answer");
      expect(fixture.nativeElement.querySelectorAll('ion-chip').length).toBe(0);
    });
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

  it('queues the latest assessment answer from native textarea input after the debounce', async () => {
    component.doAssessment = true;
    component.submissionId = 2;
    component.submissionStatus = 'in progress';
    component.question = {
      id: 3,
      name: 'Text question',
      type: 'text',
      description: '',
      isRequired: false,
      canAnswer: true,
      canComment: false,
      audience: ['submitter'],
    };
    const save = spyOn(component.submitActions$, 'next');
    fixture.detectChanges();
    await fixture.whenStable();

    const textarea: HTMLIonTextareaElement = fixture.nativeElement.querySelector('ion-textarea');
    const enterText = (value: string) => {
      textarea.value = value;
      textarea.dispatchEvent(new CustomEvent('ionInput', { detail: { value }, bubbles: true }));
    };
    const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

    scheduler.run(() => {
      enterText('first draft');
      scheduler.schedule(() => enterText('latest draft'), 200);
      scheduler.schedule(() => expect(save).not.toHaveBeenCalled(), 999);
      scheduler.schedule(() => enterText('pending edit'), 1100);
      scheduler.schedule(() => fixture.destroy(), 1200);
    });

    expect(save).toHaveBeenCalledOnceWith({
      autoSave: true,
      goBack: false,
      questionSave: { submissionId: 2, questionId: 3, answer: 'latest draft' },
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

  describe('_showSavedAnswers() - pristine check for pagination persistence', () => {
    const dummyQuestion = {
      id: 1, name: '', type: 'text', description: '',
      isRequired: true, canComment: false, canAnswer: true, choices: [], audience: []
    };

    describe('review mode', () => {
      beforeEach(() => {
        component.question = dummyQuestion;
        component.reviewStatus = 'in progress';
        component.doReview = true;
        component.review = { answer: 'saved answer', comment: 'saved comment' };
        component.control = new FormControl('');
        component.submissionStatus = '';
        component.doAssessment = false;
      });

      it('should use saved review data when control is pristine', () => {
        component.ngOnInit();

        expect(component.innerValue).toEqual(component.review);
      });

      it('should preserve control value when control is dirty', () => {
        const dirtyValue = { answer: 'user edited', comment: 'user comment' };
        component.control.setValue(dirtyValue);
        component.control.markAsDirty();

        component.ngOnInit();

        expect(component.innerValue).toEqual(dirtyValue);
      });
    });

    describe('assessment mode', () => {
      beforeEach(() => {
        component.question = dummyQuestion;
        component.submissionStatus = 'in progress';
        component.doAssessment = true;
        component.submission = { answer: 'saved submission answer' };
        component.reviewStatus = '';
        component.doReview = false;
        component.control = new FormControl('');
      });

      it('should use saved submission answer when control is pristine', () => {
        component.ngOnInit();

        expect(component.innerValue).toBe('saved submission answer');
      });

      it('should preserve control value when control is dirty', () => {
        component.control.setValue('user edited');
        component.control.markAsDirty();

        component.ngOnInit();

        expect(component.innerValue).toBe('user edited');
      });
    });

    it('should call propagateChange with innerValue', () => {
      component.question = dummyQuestion;
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission = { answer: 'test' };
      component.reviewStatus = '';
      component.doReview = false;
      component.control = new FormControl('');
      spyOn(component, 'propagateChange');

      component.ngOnInit();

      expect(component.propagateChange).toHaveBeenCalled();
    });
  });

});
