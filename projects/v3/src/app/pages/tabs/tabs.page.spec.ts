import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatService } from '@v3/services/chat.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { UtilsService } from '@v3/services/utils.service';
import { IonicModule, Platform } from '@ionic/angular';
import { NotificationsService } from '@v3/services/notifications.service';
import { ReviewService } from '@v3/services/review.service';

import { TabsPage } from './tabs.page';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TabsPage ],
      providers: [
        {
          provide: Platform,
          useValue: jasmine.createSpyObj('Platform', ['is']),
        },
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', ['reviews$']),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['getUser']),
        },
        {
          provide: ChatService,
          useValue: jasmine.createSpyObj('ChatService', ['getChatList']),
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', ['getEvent']),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', [
            'getTodoItemFromEvent',
            'getChatMessage',
            'getReminderEvent',
            'notification$',
            'newMessage$',
            'getTodoItems',
            'getChatMessage',
          ]),
        },
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
