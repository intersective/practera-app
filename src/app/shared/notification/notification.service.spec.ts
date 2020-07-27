import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { Observable, of, pipe } from 'rxjs';
import { NotificationService } from '@shared/notification/notification.service';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { AchievementsService } from '@app/achievements/achievements.service';
import { Apollo } from 'apollo-angular';

describe('NotificationService', () => {
  let service: NotificationService;
  const modalSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
  modalSpy.onDidDismiss.and.returnValue(new Promise(() => {}));
  const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
  modalCtrlSpy.create.and.returnValue(modalSpy);
  const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
  alertSpy.create.and.returnValue(modalSpy);
  const toastSpy = jasmine.createSpyObj('ToastController', ['create']);
  toastSpy.create.and.returnValue(modalSpy);
  const loadingSpy = jasmine.createSpyObj('LoadingController', ['create']);
  loadingSpy.create.and.returnValue(modalSpy);
  const achievementSpy = jasmine.createSpyObj('AchievementsService', ['markAchievementAsSeen']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        Apollo,
        NotificationService,
        {
          provide: ModalController,
          useValue: modalCtrlSpy
        },
        {
          provide: AlertController,
          useValue: alertSpy
        },
        {
          provide: ToastController,
          useValue: toastSpy
        },
        {
          provide: LoadingController,
          useValue: loadingSpy
        },
        {
          provide: AchievementsService,
          useValue: achievementSpy
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.inject(NotificationService);
  });

  it('should create', () => {
    expect(service).toBeDefined();
  });

  it('when testing dismiss(), it should dismiss modal', () => {
    service.dismiss();
    expect(modalCtrlSpy.dismiss.calls.count()).toBe(1);
  });

  it('when testing popUp(), it should create the modal', () => {
    service.popUp('type', 'data');
    expect(modalCtrlSpy.create.calls.count()).toBe(1);
  });

  it('when testing alert(), it should create the modal', () => {
    service.alert({});
    expect(alertSpy.create.calls.count()).toBe(1);
  });

  it('when testing presentToast(), it should create the modal', () => {
    service.presentToast('test');
    expect(toastSpy.create.calls.count()).toBe(1);
    service.presentToast('test', {
      color: 'success',
      duration: 1000
    });
    expect(toastSpy.create.calls.count()).toBe(2);
  });

  it('when testing achievementPopUp(), it should create the modal', () => {
    service.achievementPopUp('notification', {id: 1, name: 'achieve', 'description': ''});
    expect(modalCtrlSpy.create.calls.count()).toBe(2);
    expect(achievementSpy.markAchievementAsSeen.calls.count()).toBe(1);
    service.achievementPopUp('others', {id: 1, name: 'achieve', 'description': ''});
    expect(modalCtrlSpy.create.calls.count()).toBe(3);
    expect(achievementSpy.markAchievementAsSeen.calls.count()).toBe(1);
  });

  it('when testing lockTeamAssessmentPopUp(), it should create the modal', () => {
    service.lockTeamAssessmentPopUp({name: 'test', image: 'image'}, () => {});
    expect(modalCtrlSpy.create.calls.count()).toBe(4);
  });

  it('when testing loading(), it should create the modal', () => {
    service.loading();
    expect(loadingSpy.create.calls.count()).toBe(1);
  });

});

