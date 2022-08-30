import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { AnimationsService } from '../services/animations.service';
import { NotificationsService } from '../services/notifications.service';
import { BrowserStorageService } from '../services/storage.service';
import { UtilsService } from '../services/utils.service';

import { PersonalisedHeaderComponent } from './personalised-header.component';

describe('PersonalisedHeaderComponent', () => {
  let component: PersonalisedHeaderComponent;
  let fixture: ComponentFixture<PersonalisedHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalisedHeaderComponent ],
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
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', ['']),
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', ['']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['']),
        },
        {
          provide: NotificationsService,
          useValue: jasmine.createSpyObj('NotificationsService', ['']),
        },
      ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalisedHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
