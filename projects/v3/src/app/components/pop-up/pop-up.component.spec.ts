import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PopUpComponent } from './pop-up.component';
import { Observable, of, pipe } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

describe('PopUpComponent', () => {
  let component: PopUpComponent;
  let fixture: ComponentFixture<PopUpComponent>;
  const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopUpComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of()
          }
        },
        {
          provide: ModalController,
          useValue: modalCtrlSpy
        }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should dismiss modal', () => {
    fixture.detectChanges();
    component.confirmed();
    expect(modalCtrlSpy.dismiss.calls.count()).toBe(1);
    component.redirect = null;
    component.confirmed();
    expect(modalCtrlSpy.dismiss.calls.count()).toBe(2);
  });
});

