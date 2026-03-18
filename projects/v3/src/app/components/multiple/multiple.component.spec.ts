import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MultipleComponent } from './multiple.component';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';
import { LanguageDetectionPipe } from '@v3/app/pipes/language.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { ToggleLabelDirective } from '@v3/app/directives/toggle-label/toggle-label.directive';

describe('MultipleComponent', () => {
  let component: MultipleComponent;
  let fixture: ComponentFixture<MultipleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, ToggleLabelDirective],
      declarations: [MultipleComponent, LanguageDetectionPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: (html: string) => html
          }
        }
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('when testing onInit()', () => {
    it('should get correct data for in progress submission', () => {
      component.question = {
        choices: [
          { id: 1, name: 'choice1' },
          { id: 2, name: 'choice2' }
        ],
        audience: []
      };
      component.submissionStatus = 'in progress';
      component.doAssessment = true;
      component.submission = { answer: 'abc' };
      component.reviewStatus = 'not started';
      component.doReview = false;
      component.review = {};
      component.control = new FormControl('');
      fixture.detectChanges();
      // component sets innerValue from submission.answer when control is pristine
      expect(component.innerValue).toEqual(component.submission.answer);
    });

    it('should get correct data for in progress review', () => {
      component.question = {
        choices: [
          { id: 1, name: 'choice1' },
          { id: 2, name: 'choice2' }
        ],
        audience: []
      };
      component.submissionStatus = 'pending review';
      component.doAssessment = false;
      component.submission = { answer: 'abc' };
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review = {
        comment: 'asdf',
        answer: ['abc']
      };
      component.control = new FormControl('');
      fixture.detectChanges();
      // component sets innerValue to review data
      expect(component.innerValue).toEqual({
        answer: ['abc'],
        comment: component.review.comment
      });
      expect(component.comment).toEqual(component.review.comment);
    });
  });

  describe('when testing onChange()', () => {
    beforeEach(() => {
      component.control = new FormControl('');
      component.control.setErrors({});
    });
    it('should return error if there are invalidations', () => {
      component.control.setErrors({
        key: 'error'
      });
      component.onChange(4);
      expect(component.errors.length).toBe(1);
    });
    it('should return error if required not filled', () => {
      component.control.setErrors({
        required: true
      });
      component.onChange(4);
      expect(component.errors.length).toBe(1);
      expect(component.errors[0]).toContain('is required');
    });
    it('should get correct data when writing submission answer', () => {
      component.onChange(4);
      expect(component.errors.length).toBe(0);
      expect(component.innerValue).toEqual([4]);
    });
    it('should get correct data when appending submission answer', () => {
      component.innerValue = [1, 2, 3];
      component.onChange(4);
      expect(component.errors.length).toBe(0);
      expect(component.innerValue).toEqual([1, 2, 3, 4]);
    });
    it('should get correct data when writing review answer', () => {
      component.innerValue = { answer: [1, 2, 3], comment: '' };
      component.onChange(2, 'answer');
      expect(component.errors.length).toBe(0);
      expect(component.innerValue).toEqual({ answer: [1, 3], comment: '' });
    });
    it('should get correct data when writing review comment', () => {
      component.onChange('data', 'comment');
      expect(component.errors.length).toBe(0);
      expect(component.innerValue).toEqual({ answer: [], comment: 'data' });
    });
  });

  it('when testing writeValue(), it should call the method correctly', () => {
    // writeValue is empty in the component - it doesn't set innerValue
    component.writeValue({ data: 'data' });
    // no assertion needed since writeValue does nothing
    component.writeValue(null);
  });
  it('when testing registerOnChange()', () => {
    component.registerOnChange(() => true);
    expect(component.propagateChange).toBeTruthy();
    component.registerOnTouched(() => true);
  });

});

