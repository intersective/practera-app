import { ComponentFixture, TestBed, tick, flushMicrotasks, fakeAsync } from '@angular/core/testing';
import { NotificationService } from '@shared/notification/notification.service';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { AchievementsService } from '@app/achievements/achievements.service';
import { UtilsService } from '@services/utils.service';

describe('NotificationService', () => {
  let service: NotificationService;
  const modalSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
  modalSpy.onDidDismiss.and.returnValue(new Promise((test: any): Promise<void> => {
    if (test) {
      test();
    }
    return;
  }));
  const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss', 'create']);
  modalCtrlSpy.create.and.returnValue(modalSpy);
  const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
  alertSpy.create.and.returnValue(modalSpy);
  const toastSpy = jasmine.createSpyObj('ToastController', ['create']);
  toastSpy.create.and.returnValue(modalSpy);
  const loadingSpy = jasmine.createSpyObj('LoadingController', ['create']);
  loadingSpy.create.and.returnValue(modalSpy);
  const achievementSpy = jasmine.createSpyObj('AchievementsService', ['markAchievementAsSeen']);
  let utilSpy: jasmine.SpyObj<UtilsService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        {
          provide: UtilsService,
          useValue: jasmine.createSpyObj('UtilsService', {
            isMobile: () => false
          })
        },
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
    service = TestBed.inject(NotificationService);
    utilSpy = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
  });

  it('should create', () => {
    expect(service).toBeDefined();
  });

  it('when testing dismiss(), it should dismiss modal', fakeAsync(() => {
    service.dismiss();
    flushMicrotasks();
    expect(modalCtrlSpy.dismiss.calls.count()).toBe(1);
  }));

  it('when testing popUp(), it should create the modal', fakeAsync(() => {
    service.popUp('type', 'data');
    flushMicrotasks();
    expect(modalCtrlSpy.create.calls.count()).toEqual(1);
  }));

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

  describe('achievementPopUp()', () => {
    it('it should create the modal', fakeAsync(() => {
      service.achievementPopUp('notification', { id: 1, name: 'achieve', 'description': '' });
      flushMicrotasks();
      expect(modalCtrlSpy.create.calls.count()).toBe(2);
      expect(achievementSpy.markAchievementAsSeen.calls.count()).toBe(1);
      service.achievementPopUp('others', { id: 1, name: 'achieve', 'description': '' });
      flushMicrotasks();
      expect(modalCtrlSpy.create.calls.count()).toBe(3);
      expect(achievementSpy.markAchievementAsSeen.calls.count()).toBe(1);
    }));

    it('should focus activeElement when provided', fakeAsync(() => {
      const options = {
        activeElement: {
          focus: jasmine.createSpy('focus').and.returnValue(true)
        }
      };

      service.achievementPopUp('others', {id: 1, name: 'achieve', 'description': ''}, options);
      tick();
      expect(options.activeElement.focus).toHaveBeenCalled();
    }));
  });

  describe('lockTeamAssessmentPopUp()', () => {
    it('should create the modal', fakeAsync(() => {
      service.lockTeamAssessmentPopUp({ name: 'test', image: 'image' }, () => { });
      flushMicrotasks();
      expect(modalCtrlSpy.create.calls.count()).toBe(5);
    }));
  });

  describe('activityCompletePopUp()', () => {
    it('should show activity completed popup overlay view', () => {
      service.activityCompletePopUp(12345, true);
      expect(modalCtrlSpy.create).toHaveBeenCalled();
    });

    it('should be same when "isMobile" is true', fakeAsync(() => {
      utilSpy.isMobile.and.returnValue(true);
      service.activityCompletePopUp(12345, true);
      expect(modalCtrlSpy.create).toHaveBeenCalled();
    }));
  });

  it('when testing loading(), it should create the modal', () => {
    service.loading();
    expect(loadingSpy.create.calls.count()).toBe(1);
  });
});

