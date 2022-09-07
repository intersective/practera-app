import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatService } from '@v3/services/chat.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule, Platform } from '@ionic/angular';
import { NotificationsService } from '@v3/services/notifications.service';
import { ReviewService } from '@v3/services/review.service';

import { TabsPage } from './tabs.page';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TabsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [IonicModule.forRoot(), RouterTestingModule],
      providers: [
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', [], {
            'reviews$': of(),
          }),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            'getUser': jasmine.createSpy()
          }),
        },
        {
          provide: ChatService,
          useValue: jasmine.createSpyObj('ChatService', ['getChatList']),
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', {
            'getEvent': of(true),
          }),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', {
            'getTodoItemFromEvent': of(),
            'getReminderEvent': of(),
            'getTodoItems': of(),
            'getChatMessage': of(),
          }, {
            'notification$': of(),
            'newMessage$': of(),
          }),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
