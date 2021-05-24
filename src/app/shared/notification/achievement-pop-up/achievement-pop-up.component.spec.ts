import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AchievementPopUpComponent } from './achievement-pop-up.component';
import { Observable, of, pipe } from 'rxjs';
import { ModalController, IonicModule } from '@ionic/angular';
import { UtilsService } from '@services/utils.service';

class AchievementModalPage {
  fixture: ComponentFixture<AchievementPopUpComponent>;

  constructor(fixture: ComponentFixture<AchievementPopUpComponent>) {
    this.fixture = fixture;
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

  it('should dismiss modal', () => {
    component.achievement = {
      id: 1,
      name: 'achieve',
      description: ''
    };
    fixture.detectChanges();
    component.confirmed('Enter');
    expect(modalCtrlSpy.dismiss.calls.count()).toBe(1);
  });

  xdescribe('ionViewDidEnter()', () => {
    it('should prepare accessibility controls', () => {
      component.ionViewDidEnter();

    });
  });

  describe('confirm()', () => {
    it('should dismiss', () => {
      component.confirmed(null);
      expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
    });
  });
});

