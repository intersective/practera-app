import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiTeamMemberSelectorComponent } from './multi-team-member-selector.component';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { Subject } from 'rxjs';

describe('MultiTeamMemberSelectorComponent', () => {
  let component: MultiTeamMemberSelectorComponent;
  let fixture: ComponentFixture<MultiTeamMemberSelectorComponent>;
  let utilsSpy: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [MultiTeamMemberSelectorComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiTeamMemberSelectorComponent);
    component = fixture.componentInstance;
    utilsSpy = TestBed.inject(UtilsService);

    component.control = new FormControl();
    component.submitActions$ = new Subject<any>();
    component.question = { audience: [] };
    component.submission = {};
    component.review = {};
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('ngOnInit()', () => {
    it('should call _showSavedAnswers()', () => {
      // use "any" to bypass ts restriction on type (not recommended, for acceptable for internal implementation)
      spyOn<any>(component, '_showSavedAnswers');
      component.ngOnInit();
      expect((component as any)._showSavedAnswers).toHaveBeenCalled();
    });
  });

  describe('onChange()', () => {
    it('should update innerValue and call propagateChange when type is not provided', () => {
      spyOn(component, 'propagateChange');
      utilsSpy.addOrRemove = jasmine.createSpy('addOrRemove').and.returnValue(['value1', 'value2']);
      component.control = new FormControl();

      component.onChange('value1');

      expect(component.innerValue).toEqual(['value1', 'value2']);
      expect(component.propagateChange).toHaveBeenCalledWith(['value1', 'value2']);
    });

    it('should update innerValue and call propagateChange when type is "comment"', () => {
      spyOn(component, 'propagateChange');
      component.control = new FormControl();
      component.innerValue = {
        answer: [],
        comment: ''
      };

      component.onChange('new comment', 'comment');

      expect(component.innerValue).toEqual({
        answer: [],
        comment: 'new comment'
      });
      expect(component.propagateChange).toHaveBeenCalledWith({
        answer: [],
        comment: 'new comment'
      });
    });

    it('should update innerValue and call propagateChange when type is not "comment"', () => {
      spyOn(component, 'propagateChange');
      utilsSpy.addOrRemove = jasmine.createSpy('addOrRemove').and.returnValue(['value1']);
      component.control = new FormControl();
      component.innerValue = {
        answer: [],
        comment: ''
      };

      component.onChange('value1', 'answer');

      expect(component.innerValue).toEqual({
        answer: ['value1'],
        comment: ''
      });
      expect(component.propagateChange).toHaveBeenCalledWith({
        answer: ['value1'],
        comment: ''
      });
    });

    it('should set errors and call submitActions$.next()', () => {
      spyOn(component.submitActions$, 'next');
      component.control = new FormControl('', Validators.required);

      component.onChange('value1');

      expect(component.errors).toContain('This question is required');
      expect(component.submitActions$.next).toHaveBeenCalledWith({
        saveInProgress: true,
        goBack: false,
      });
    });
  });

  describe('writeValue()', () => {
    it('should set innerValue when a value is provided', () => {
      const value = {
        answer: ['value1', 'value2'],
        comment: 'a comment',
      };

      component.writeValue(value);
      expect(component.innerValue).toEqual(JSON.stringify(value));
    });

    it('should not update innerValue when the value is undefined or null', () => {
      component.innerValue = 'initialValue';

      component.writeValue(undefined);
      expect(component.innerValue).toEqual('initialValue');

      component.writeValue(null);
      expect(component.innerValue).toEqual('initialValue');
    });
  });

  describe('_showSavedAnswers()', () => {
    it('should set innerValue and propagate changes for in-progress review', () => {
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review.answer = ['answer1'];
      component.review.comment = 'comment1';

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual({
        answer: ['answer1'],
        comment: 'comment1',
      });
      expect(component.control.value).toEqual({
        answer: ['answer1'],
        comment: 'comment1',
      });
    });

    it('should set innerValue and propagate changes for in-progress submission', () => {
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission.answer = ['answer1'];

      component['_showSavedAnswers']();

      expect(component.innerValue).toEqual(['answer1']);
      expect(component.control.value).toEqual(['answer1']);
    });
  });

  describe('audienceContainReviewer()', () => {
    it('should return true if question audience contains more than one audience and includes reviewer', () => {
      component.question.audience = ['student', 'reviewer'];
      expect(component.audienceContainReviewer()).toBeTruthy();
    });

    it('should return false if question audience does not contain more than one audience or does not include reviewer', () => {
      component.question.audience = ['student'];
      expect(component.audienceContainReviewer()).toBeFalsy();
    });
  });
});
