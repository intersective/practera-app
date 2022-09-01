import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChatService } from '@app/chat/chat.service';
import { BrowserStorageService } from '@app/services/storage.service';
import { UtilsService } from '@app/services/utils.service';
import { IonicModule, Platform } from '@ionic/angular';
import { NotificationsService } from '@v3/app/services/notifications.service';
import { ReviewService } from '@v3/app/services/review.service';

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
          useValue: jasmine.createSpyObj('Platform', ['']),
        },
        {
          provide: ReviewService,
          useValue: jasmine.createSpyObj('ReviewService', ['']),
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['']),
        },
        {
          provide: ChatService,
          useValue: jasmine.createSpyObj('ChatService', ['']),
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', ['']),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['']),
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
