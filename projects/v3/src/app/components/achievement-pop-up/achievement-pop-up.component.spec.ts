import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AchievementPopUpComponent } from './achievement-pop-up.component';
import { ModalController, IonicModule } from '@ionic/angular';
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
  const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ IonicModule ],
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

    page = new AchievementModalPage(fixture);
  }));

  it('should create', () => {
    expect(component).toBeDefined();
  });

  describe('ionViewDidEnter()', () => {
    beforeEach(() => {
      component.achievement = {
        id: 1,
        name: 'achieve',
        description: ''
      };
    });

    it('should prepare accessibility controls', () => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
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
    });

    it('should not trigger "navigation" if no tab pressed', () => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
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
  });

  describe('confirm()', () => {
    it('should dismiss with Enter/Space', () => {
      component.achievement = {
        id: 1,
        name: 'achieve',
        description: ''
      };

      let keyboardEvent = new KeyboardEvent('keydown', {
        key: 'Enter'
      });
      component.confirmed(keyboardEvent);

      keyboardEvent = new KeyboardEvent('keydown', {
        key: ' '
      });
      component.confirmed(keyboardEvent);
      expect(modalCtrlSpy.dismiss).toHaveBeenCalledTimes(2);
    });

    it('should not dismiss with keyboardEvent', () => {
      component.confirmed(new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
      }));
      expect(modalCtrlSpy.dismiss).not.toHaveBeenCalledWith(3);
    });
  });
});

