import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AchievementPopUpComponent } from './achievement-pop-up.component';
import { ModalController } from '@ionic/angular';
import { UtilsService } from '@v3/services/utils.service';

class AchievementModalPage {
  fixture: ComponentFixture<AchievementPopUpComponent>;

  constructor(fixture: ComponentFixture<AchievementPopUpComponent>) {
    this.fixture = fixture;
  }

  get badge() {
    return this.query<HTMLElement>('#achievementBadgePopup');
  }
  //// query helpers ////
  private query<T>(selector: string): T {
    return this.fixture.nativeElement.querySelector(selector);
  }
  private queryAll<T>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }
}

describe('AchievementPopUpComponent', () => {
  let component: AchievementPopUpComponent;
  let fixture: ComponentFixture<AchievementPopUpComponent>;
  let page: AchievementModalPage;
  let modalCtrlSpy: jasmine.SpyObj<ModalController>;

  // Set achievement immediately after component creation, before any Zone-triggered
  // auto CD pass can run (waitForAsync + compileComponents resolving can trigger one).
  // This ensures the initial LView snapshot for achievement?.name is always 'achieve',
  // so no test's detectChanges() call sees a null → 'achieve' transition (NG0100).
  const defaultAchievement = {
    id: 1,
    name: 'achieve',
    description: '',
    type: 'badge',
    badge: 'badge',
  };

  beforeEach(waitForAsync(() => {
    modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [ AchievementPopUpComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: ModalController,
          useValue: modalCtrlSpy
        },
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', [ 'isMobile' ])
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AchievementPopUpComponent);
    component = fixture.componentInstance;
    component.achievement = { ...defaultAchievement };
    page = new AchievementModalPage(fixture);
  }));

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  describe('ionViewDidEnter()', () => {
    // detectChanges() runs here after achievement is already set (from outer beforeEach),
    // so NG0100 cannot occur. The .el mocks are required because CUSTOM_ELEMENTS_SCHEMA
    // returns an ElementRef for ion-content / ion-button (no Ionic directive wrapper),
    // while ionViewDidEnter() accesses the Ionic-specific .el property.
    beforeEach(waitForAsync(() => {
      fixture.detectChanges();
      return fixture.whenStable().then(() => {
        component.achievementBadgePopup = {
          el: fixture.nativeElement.querySelector('ion-content'),
        } as any;
        component.dismissButton = {
          el: fixture.nativeElement.querySelector('ion-button[dismiss]') ||
              fixture.nativeElement.querySelector('ion-button'),
        } as any;
      });
    }));

    it('should prepare accessibility controls', () => {
      component.ionViewDidEnter();
      const event = new KeyboardEvent('keydown', {
        code: 'Tab',
        key: 'Tab',
      });

      spyOn(component.achievementName.nativeElement, 'focus');
      spyOn(component.badgeImage.nativeElement, 'focus');
      spyOn(component.dismissButton.el, 'focus');

      component.achievementBadgePopup.el.dispatchEvent(event);
      expect(component.achievementName.nativeElement.focus).toHaveBeenCalled();

      component.achievementBadgePopup.el.dispatchEvent(event);
      expect(component.dismissButton.el.focus).toHaveBeenCalled();

      component.achievementBadgePopup.el.dispatchEvent(event);
      expect(component.badgeImage.nativeElement.focus).toHaveBeenCalled();
    });

    it('should not trigger "navigation" if no tab pressed', () => {
      component.ionViewDidEnter();
      const event = new KeyboardEvent('keydown', {
        code: 'Shift',
        key: 'Shift',
      });

      spyOn(component.achievementName.nativeElement, 'focus');
      spyOn(component.badgeImage.nativeElement, 'focus');
      spyOn(component.dismissButton.el, 'focus');

      component.achievementBadgePopup.el.dispatchEvent(event);
      expect(component.achievementName.nativeElement.focus).not.toHaveBeenCalled();
      expect(component.badgeImage.nativeElement.focus).not.toHaveBeenCalled();
      expect(component.dismissButton.el.focus).not.toHaveBeenCalled();
    });
  });

  describe('confirm()', () => {
    it('should dismiss with Enter/Space', () => {
      // Directly replace the component's modalController with a spy to bypass any
      // DI override issues where Ionic's root provider may win over the TestBed provider.
      const dismissSpy = jasmine.createSpy('dismiss');
      (component as any).modalController = { dismiss: dismissSpy };

      component.confirmed(new KeyboardEvent('keydown', { key: 'Enter' }));
      component.confirmed(new KeyboardEvent('keydown', { key: ' ' }));
      expect(dismissSpy).toHaveBeenCalledTimes(2);
    });

    it('should not dismiss with keyboardEvent', () => {
      fixture.detectChanges();
      component.confirmed(new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
      }));
      expect(modalCtrlSpy.dismiss).not.toHaveBeenCalledWith(3);
    });
  });
});
