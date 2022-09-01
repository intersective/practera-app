import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '@app/chat/chat.service';
import { BrowserStorageService } from '@app/services/storage.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { AnimationsService } from '@v3/app/services/animations.service';
import { ReviewService } from '@v3/app/services/review.service';

import { V3Page } from './v3.page';

describe('V3Page', () => {
  let component: V3Page;
  let fixture: ComponentFixture<V3Page>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ V3Page ],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', ['']),
        },
        {
          provide: AnimationsService,
          useValue: jasmine.createSpyObj('AnimationsService', ['']),
        },
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', ['']),
        },
        {
          provide: ActivatedRoute,
          useValue: jasmine.createSpyObj('ActivatedRoute', ['']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['']),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['']),
        },
        {
          provide: ChatService,
          useValue: jasmine.createSpyObj('ChatService', ['']),
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
