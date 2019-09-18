import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, pipe } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UtilsService } from '@services/utils.service';
import { FastFeedbackSubmitterService } from './fast-feedback-submitter.service';
import { BrowserStorageService } from '@services/storage.service';
import { NotificationService } from '@shared/notification/notification.service';
import { ModalController } from '@ionic/angular';
import { FastFeedbackComponent } from './fast-feedback.component';
import { QuestionComponent } from './question/question.component';

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

fdescribe('FastFeedbackComponent', () => {
  let component: FastFeedbackComponent;
  let fixture: ComponentFixture<FastFeedbackComponent>;
  let page: Page;
  let fastfeedbackSpy: jasmine.SpyObj<FastFeedbackSubmitterService>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, ReactiveFormsModule ],
      declarations: [ FastFeedbackComponent, QuestionComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
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
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FastFeedbackComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fastfeedbackSpy = TestBed.get(FastFeedbackSubmitterService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
