import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FileComponent } from './file.component';
import { FilestackService } from '@shared/filestack/filestack.service';
import { Observable, of, pipe } from 'rxjs';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Apollo } from 'apollo-angular';

describe('FileComponent', () => {
  let component: FileComponent;
  let fixture: ComponentFixture<FileComponent>;
  let filestackSpy: jasmine.SpyObj<FilestackService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule, ReactiveFormsModule ],
      declarations: [ FileComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        Apollo,
        {
          provide: FilestackService,
          useValue: jasmine.createSpyObj('FilestackService', ['getFileTypes'])
        },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileComponent);
    component = fixture.componentInstance;
    filestackSpy = TestBed.inject(FilestackService) as jasmine.SpyObj<FilestackService>;
  });

  beforeEach(() => {
    filestackSpy.getFileTypes.and.returnValue('image/*');
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('when testing onInit()', () => {
    it('should get correct data for in progress submission', () => {
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

  describe('when testing onFileUploadCompleted()', () => {
    it('should get error if file upload fail', () => {
      component.onFileUploadCompleted({success: false, data: {}}, 'a');
      expect(component.errors.length).toBe(1);
    });
    it('should get correct data if file upload success when doing submission', () => {
      component.onFileUploadCompleted({
        success: true,
        data: {filename: 'abc.png'}
      });
      expect(component.errors.length).toBe(0);
      expect(component.uploadedFile).toEqual({filename: 'abc.png'});
      expect(component.innerValue).toEqual({filename: 'abc.png'});
    });
  });

  describe('when testing onChange()', () => {
    it('should get correct data when writing review answer', () => {
      component.uploadedFile = {filename: 'abc.png'};
      component.onChange('data', 'answer');
      expect(component.errors.length).toBe(0);
      expect(component.innerValue).toEqual({answer: {filename: 'abc.png'}, comment: ''});
    });
    it('should get correct data when writing review comment', () => {
      component.innerValue = {answer: {}, comment: ''};
      component.onChange('data', 'comment');
      expect(component.errors.length).toBe(0);
      expect(component.innerValue).toEqual({answer: {}, comment: 'data'});
    });
  });

  it('when testing writeValue(), it should pass data correctly', () => {
    component.writeValue('data');
    expect(component.innerValue).toEqual('data');
    component.writeValue(null);
  });
  it('when testing registerOnChange()', () => {
    component.registerOnChange(() => true);
    expect(component.propagateChange).toBeTruthy();
    component.registerOnTouched(() => true);
  });

});

