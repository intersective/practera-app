import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AchievementPopUpComponent } from './achievement-pop-up.component';
import { Observable, of, pipe } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { Apollo } from 'apollo-angular';

describe('AchievementPopUpComponent', () => {
  let component: AchievementPopUpComponent;
  let fixture: ComponentFixture<AchievementPopUpComponent>;
  const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AchievementPopUpComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        Apollo,
        {
          provide: ModalController,
          useValue: modalCtrlSpy
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievementPopUpComponent);
    component = fixture.componentInstance;
  });

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
    component.confirmed();
    expect(modalCtrlSpy.dismiss.calls.count()).toBe(1);
  });
});

