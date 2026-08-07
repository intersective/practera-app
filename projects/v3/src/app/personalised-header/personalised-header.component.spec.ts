import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';
import { AnimationsService } from '../services/animations.service';
import { NotificationsService } from '../services/notifications.service';
import { BrowserStorageService } from '../services/storage.service';
import { UtilsService } from '../services/utils.service';

import { PersonalisedHeaderComponent } from './personalised-header.component';

describe('PersonalisedHeaderComponent', () => {
  let component: PersonalisedHeaderComponent;
  let fixture: ComponentFixture<PersonalisedHeaderComponent>;

  const mockModalSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
  mockModalSpy.onDidDismiss.and.returnValue(Promise.resolve({ data: {} }));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonalisedHeaderComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ModalController,
          useValue: jasmine.createSpyObj('ModalController', {
            'create': Promise.resolve(mockModalSpy),
            'dismiss': Promise.resolve()
          }),
        },
        {
          provide: AnimationsService,
          useValue: {
            enterAnimation: jasmine.createSpy('enterAnimation'),
            leaveAnimation: jasmine.createSpy('leaveAnimation')
          },
        },
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj('BrowserStorageService', {
            'getUser': { name: 'Test User', image: '' },
            'get': { supportEmail: 'test@example.com' }
          }),
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', {
            'isMobile': false,
            'getEvent': of({}),
            'checkIsPracteraSupportEmail': undefined
          }),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', {
            'navigate': Promise.resolve(true)
          }),
        },
        {
          provide: NotificationsService,
          useValue: {
            notification$: new Subject()
          },
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

  it('should expose the accessWidget custom trigger before notifications', () => {
    const accessibilityButton: HTMLElement = fixture.nativeElement.querySelector('.accessibility-btn');
    const notificationButton: HTMLElement = fixture.nativeElement.querySelector('.notify-btn');
    const icon: HTMLElement = accessibilityButton.querySelector('ion-icon');

    expect(accessibilityButton).toBeTruthy();
    expect(accessibilityButton.getAttribute('aria-label')).toBe('Open accessibility options');
    expect(accessibilityButton.getAttribute('data-acsb-custom-trigger')).toBe('true');
    expect(icon.getAttribute('name')).toBe('accessibility-outline');
    expect(accessibilityButton.compareDocumentPosition(notificationButton) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
  });
});
