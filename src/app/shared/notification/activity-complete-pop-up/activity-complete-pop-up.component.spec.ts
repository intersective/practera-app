import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityCompletePopUpComponent } from './activity-complete-pop-up.component';
import { Observable, of, pipe } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MockRouter } from '@testing/mocked.service';
import { Apollo } from 'apollo-angular';

describe('ActivityCompletePopUpComponent', () => {
  let component: ActivityCompletePopUpComponent;
  let fixture: ComponentFixture<ActivityCompletePopUpComponent>;
  const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
  // const routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityCompletePopUpComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [
        Apollo,
        {
          provide: ModalController,
          useValue: modalCtrlSpy
        },
        {
          provide: Router,
          useClass: MockRouter
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

