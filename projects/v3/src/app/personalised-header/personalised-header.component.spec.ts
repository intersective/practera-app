import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular/lazy';
import { CUSTOM_ELEMENTS_SCHEMA, NgZone, provideZonelessChangeDetection } from '@angular/core';
import { of, Subject } from 'rxjs';
import { AnimationsService } from '../services/animations.service';
import { NotificationsService } from '../services/notifications.service';
import { BROWSER_STORAGE, BrowserStorageService } from '../services/storage.service';
import { UtilsService } from '../services/utils.service';

import { PersonalisedHeaderComponent } from './personalised-header.component';

describe('PersonalisedHeaderComponent', () => {
  let component: PersonalisedHeaderComponent;
  let fixture: ComponentFixture<PersonalisedHeaderComponent>;

  let storageService: BrowserStorageService;
  let modalController: jasmine.SpyObj<ModalController>;
  let modal: jasmine.SpyObj<HTMLIonModalElement>;
  let router: jasmine.SpyObj<Router>;
  let utils: jasmine.SpyObj<UtilsService>;

  function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
  }

  function settingsButton(): HTMLElement {
    return fixture.nativeElement.querySelector('.avatar-btn');
  }

  beforeEach(async () => {
    const data = new Map<string, string>();
    await TestBed.configureTestingModule({
      declarations: [ PersonalisedHeaderComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: AnimationsService,
          useValue: {
            enterAnimation: jasmine.createSpy('enterAnimation'),
            leaveAnimation: jasmine.createSpy('leaveAnimation')
          },
        },
        BrowserStorageService,
        {
          provide: BROWSER_STORAGE,
          useValue: {
            getItem: (key: string) => data.get(key) ?? null,
            setItem: (key: string, value: string) => data.set(key, value),
            removeItem: (key: string) => data.delete(key),
            clear: () => data.clear(),
          },
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

    storageService = TestBed.inject(BrowserStorageService);
    storageService.setUser({ name: 'Test User', image: '' });
    utils = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    modal = jasmine.createSpyObj<HTMLIonModalElement>('Modal', ['present']);
    modal.present.and.returnValue(Promise.resolve());
    modalController = jasmine.createSpyObj<ModalController>('ModalController', ['create']);
    modalController.create.and.returnValue(Promise.resolve(modal));
    fixture = TestBed.createComponent(PersonalisedHeaderComponent);
    component = fixture.componentInstance;
    (component as any).modalController = modalController;
    fixture.detectChanges();
    // Angular stability does not include Stencil's asynchronous component hydration.
    await customElements.whenDefined('ion-button');
    const buttons: HTMLIonButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('ion-button'));
    await Promise.all(buttons.map(button => button.componentOnReady()));
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the accessWidget custom trigger before notifications', () => {
    const accessibilityButton: HTMLElement = fixture.nativeElement.querySelector('.accessibility-btn');

    expect(accessibilityButton).withContext('accessWidget must have a visible header trigger').toBeTruthy();
    if (!accessibilityButton) {
      return;
    }

    const notificationButton: HTMLElement = fixture.nativeElement.querySelector('.notify-btn');
    const icon: HTMLElement = accessibilityButton.querySelector('ion-icon');
    const nativeButton: HTMLButtonElement = accessibilityButton.shadowRoot.querySelector('button');

    expect(nativeButton.getAttribute('aria-label')).toBe('Open accessibility options');
    expect(accessibilityButton.getAttribute('data-acsb-custom-trigger')).toBe('true');
    expect(icon.getAttribute('name')).toBe('accessibility-outline');
    expect(accessibilityButton.compareDocumentPosition(notificationButton) & Node.DOCUMENT_POSITION_FOLLOWING)
      .toBeTruthy();
  });

  it('refreshes the header avatar when Settings updates the cached user outside Angular', async () => {
    TestBed.inject(NgZone).runOutsideAngular(() => {
      storageService.setUser({ avatar: 'https://example.com/new.png', image: 'https://example.com/new.png' });
    });
    await fixture.whenStable();

    const image: HTMLImageElement = settingsButton().querySelector('img');
    expect(image?.getAttribute('src')).toBe('https://example.com/new.png');
    expect(settingsButton().querySelector('ion-icon[name="person-circle"]')).toBeNull();
  });

  it('replaces an existing avatar with a refreshed signed URL without a reload', async () => {
    storageService.setUser({ image: 'https://example.com/avatar?signature=old' });
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();
    TestBed.inject(NgZone).runOutsideAngular(() => {
      storageService.setUser({ image: 'https://example.com/avatar?signature=new' });
    });
    await fixture.whenStable();

    expect(settingsButton().querySelector('img').getAttribute('src'))
      .toBe('https://example.com/avatar?signature=new');
  });

  it('clears the rendered loading state after presentation so Settings can open again', async () => {
    const presentation = deferred<void>();
    modal.present.and.returnValue(presentation.promise);
    const settings = spyOn(component, 'settings').and.callThrough();
    settingsButton().click();
    await fixture.whenStable();
    expect(settingsButton().classList.contains('loading-overlay')).toBeTrue();
    expect(settingsButton().getAttribute('aria-busy')).toBe('true');

    presentation.resolve();
    await settings.calls.mostRecent().returnValue;
    await fixture.whenStable();
    expect(settingsButton().classList.contains('loading-overlay')).toBeFalse();
    expect(settingsButton().getAttribute('aria-busy')).toBe('false');

    settingsButton().click();
    await fixture.whenStable();
    expect(modalController.create).toHaveBeenCalledTimes(2);
  });

  it('ignores repeated requests while Settings is opening', async () => {
    const creation = deferred<HTMLIonModalElement>();
    modalController.create.and.returnValue(creation.promise);
    const opening = component.settings();
    const repeated = component.settings();
    creation.resolve(modal);
    await repeated;
    expect(modalController.create).toHaveBeenCalledTimes(1);
    await opening;
  });

  it('restores the rendered Settings button after modal creation fails', async () => {
    const creation = deferred<HTMLIonModalElement>();
    modalController.create.and.returnValue(creation.promise);
    const opening = component.settings();
    const rejected = expectAsync(opening).toBeRejectedWithError('create failed');
    await fixture.whenStable();
    creation.reject(new Error('create failed'));
    await rejected;
    await fixture.whenStable();
    expect(component.isLoadingSetting).toBeFalse();
    expect(settingsButton().getAttribute('aria-busy')).toBe('false');
  });

  it('restores the rendered Settings button after presentation fails', async () => {
    const presentation = deferred<void>();
    modal.present.and.returnValue(presentation.promise);
    const opening = component.settings();
    const rejected = expectAsync(opening).toBeRejectedWithError('present failed');
    await fixture.whenStable();
    presentation.reject(new Error('present failed'));
    await rejected;
    await fixture.whenStable();
    expect(settingsButton().getAttribute('aria-busy')).toBe('false');
    expect(settingsButton().classList.contains('loading-overlay')).toBeFalse();
  });

  for (const navigationResult of [true, false]) {
    it(`restores Settings after mobile navigation resolves ${navigationResult}`, async () => {
      utils.isMobile.and.returnValue(true);
      const navigation = deferred<boolean>();
      router.navigate.and.returnValue(navigation.promise);
      const opening = component.settings();
      await fixture.whenStable();
      expect(settingsButton().getAttribute('aria-busy')).toBe('true');
      navigation.resolve(navigationResult);
      expect(await opening).toBe(navigationResult);
      await fixture.whenStable();
      expect(component.isLoadingSetting).toBeFalse();
      expect(settingsButton().getAttribute('aria-busy')).toBe('false');
      expect(modalController.create).not.toHaveBeenCalled();
    });
  }

  it('restores Settings after mobile navigation fails', async () => {
    utils.isMobile.and.returnValue(true);
    const navigation = deferred<boolean>();
    router.navigate.and.returnValue(navigation.promise);
    const opening = component.settings();
    const rejected = expectAsync(opening).toBeRejectedWithError('navigation failed');
    await fixture.whenStable();
    expect(settingsButton().getAttribute('aria-busy')).toBe('true');
    navigation.reject(new Error('navigation failed'));
    await rejected;
    await fixture.whenStable();
    expect(component.isLoadingSetting).toBeFalse();
    expect(settingsButton().getAttribute('aria-busy')).toBe('false');
  });
});
