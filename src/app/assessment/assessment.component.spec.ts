import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentComponent } from './assessment.component';

describe('AssessmentComponent', () => {
  let component: AssessmentComponent;
  let fixture: ComponentFixture<AssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssessmentComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list unanswered question compulsoryQuestionsAnswered', () => {
    expect(component.compulsoryQuestionsAnswered).toBeDefined();

    component.assessment = {
      name: 'test',
      description: 'test',
      isForTeam: false,
      groups: [{
        name: 'test groups',
        description: 'test groups description',
        questions: [
          {
            id: 123,
            name: 'test',
            description: 'test',
            canAnswer: true,
            canComment: false,
            type: 'moderated',
            isRequired: true,
            audience: ['participant', 'mentor']
          },
          {
            id: 124,
            name: 'test',
            description: 'test',
            canAnswer: true,
            canComment: false,
            type: 'moderated',
            isRequired: true,
            audience: ['participant', 'mentor']
          }
        ],
      }],
    };

    const answers = {
      "Assessment": {
        "id": 1,
        "context_id": 1,
        "in_progress": false
      },
      "AssessmentSubmission": {
        "id": 1
      },
      "AssessmentSubmissionAnswer": [
        {
          "assessment_question_id": 123,
          "answer": null
        },
        {
          "assessment_question_id": 124,
          "answer": null
        }
      ]
    };

    const unansweredCompulsoryQuestion = component.compulsoryQuestionsAnswered(answers);
    console.log('unansweredCompulsoryQuestion::', unansweredCompulsoryQuestion);
  });
});
