import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityCompletePopUpComponent } from './activity-complete-pop-up.component';
import { Observable, of, pipe } from 'rxjs';
import { ModalController } from '@ionic/angular';

describe('ActivityCompletePopUpComponent', () => {
  let component: ActivityCompletePopUpComponent;
  let fixture: ComponentFixture<ActivityCompletePopUpComponent>;
  const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCompletePopUpComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: ModalController,
          useValue: modalCtrlSpy
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityCompletePopUpComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should dismiss modal', () => {
    fixture.detectChanges();
    component.confirmed(true);
    expect(modalCtrlSpy.dismiss.calls.count()).toBe(1);
  });
});

