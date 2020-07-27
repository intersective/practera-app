import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TextComponent } from './text.component';
import { Observable, of, pipe } from 'rxjs';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UtilsService } from '@services/utils.service';
import { Apollo } from 'apollo-angular';

describe('TextComponent', () => {
  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule, ReactiveFormsModule ],
      declarations: [ TextComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        Apollo,
        UtilsService
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextComponent);
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
      component.submission = {answer: 'abc'};
      component.reviewStatus = 'not started';
      component.doReview = false;
      component.review = {};
      component.control = new FormControl('');
      fixture.detectChanges();
      expect(component.innerValue).toEqual(component.submission.answer);
      expect(component.control.value).toEqual(component.submission.answer);
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
      component.submission = {answer: 'abc'};
      component.reviewStatus = 'in progress';
      component.doReview = true;
      component.review = {
        comment: 'asdf',
        answer: {name: 'abc'}
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
      component.answer = 'answer';
      component.comment = 'comment';
    });
    it('should get correct data when writing submission answer', () => {
      component.onChange();
      expect(component.innerValue).toEqual(component.answer);
    });
    it('should get correct data when writing review answer', () => {
      component.innerValue = {answer: '', comment: ''};
      component.onChange('answer');
      expect(component.innerValue).toEqual({answer: component.answer, comment: ''});
    });
    it('should get correct data when writing review comment', () => {
      component.onChange('comment');
      expect(component.innerValue).toEqual({answer: '', comment: component.comment});
    });
  });

  it('when testing writeValue(), it should pass data correctly', () => {
    component.writeValue({data: 'data'});
    expect(component.innerValue).toEqual({data: 'data'});
    component.writeValue(null);
  });
  it('when testing registerOnChange()', () => {
    component.registerOnChange(() => true);
    expect(component.propagateChange).toBeTruthy();
    component.registerOnTouched(() => true);
  });

});

