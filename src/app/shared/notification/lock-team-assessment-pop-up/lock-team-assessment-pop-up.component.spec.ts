import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LockTeamAssessmentPopUpComponent } from './lock-team-assessment-pop-up.component';
import { Observable, of, pipe } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { Apollo } from 'apollo-angular';

describe('LockTeamAssessmentPopUpComponent', () => {
  let component: LockTeamAssessmentPopUpComponent;
  let fixture: ComponentFixture<LockTeamAssessmentPopUpComponent>;
  const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockTeamAssessmentPopUpComponent ],
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

