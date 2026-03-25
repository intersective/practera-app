import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityCompletePopUpComponent } from './activity-complete-pop-up.component';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MockRouter } from '@testingv3/mocked.service';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';

describe('ActivityCompletePopUpComponent', () => {
  let component: ActivityCompletePopUpComponent;
  let fixture: ComponentFixture<ActivityCompletePopUpComponent>;
  let modalCtrlSpy: any;
  // const routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ActivityCompletePopUpComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
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
    modalCtrlSpy = TestBed.inject(ModalController);
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

