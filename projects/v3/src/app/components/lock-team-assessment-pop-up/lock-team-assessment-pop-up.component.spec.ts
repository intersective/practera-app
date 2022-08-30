import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LockTeamAssessmentPopUpComponent } from './lock-team-assessment-pop-up.component';
import { ModalController } from '@ionic/angular';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';

describe('LockTeamAssessmentPopUpComponent', () => {
  let component: LockTeamAssessmentPopUpComponent;
  let fixture: ComponentFixture<LockTeamAssessmentPopUpComponent>;
  const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LockTeamAssessmentPopUpComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: UtilsService,
          useClass: TestUtils,
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
    fixture = TestBed.createComponent(LockTeamAssessmentPopUpComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should dismiss modal', () => {
    fixture.detectChanges();
    component.confirmed();
    expect(modalCtrlSpy.dismiss.calls.count()).toBe(1);
  });
});

