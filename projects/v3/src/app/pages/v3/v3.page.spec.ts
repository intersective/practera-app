import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '@v3/services/chat.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { ActivatedRouteStub } from '@testingv3/activated-route-stub';
import { MockRouter } from '@testingv3/mocked.service';
import { AnimationsService } from '@v3/services/animations.service';
import { ReviewService } from '@v3/services/review.service';
import { of } from 'rxjs';

import { V3Page } from './v3.page';
import { RouterTestingModule } from '@angular/router/testing';

describe('V3Page', () => {
  let component: V3Page;
  let fixture: ComponentFixture<V3Page>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ V3Page ],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['create']),
        },
        {
          provide: AnimationsService,
          useValue: jasmine.createSpyObj('AnimationsService', [
            'enterAnimation',
            'leaveAnimation',
          ]),
        },
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', ['getReviews'], {
            'reviews$': of(),
          }),
        },
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub({}),
        },
        {
          provide: Router,
          useClass: MockRouter
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            getUser: jasmine.createSpy()
          }),
        },
        {
          provide: ChatService,
          useValue: jasmine.createSpyObj('ChatService', [
            'getChatList',
          ]),
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(V3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
