import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ModalController', ['create']);

    TestBed.configureTestingModule({
      providers: [
        ModalService,
        { provide: ModalController, useValue: spy }
      ]
    });

    service = TestBed.inject(ModalService);
    modalControllerSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a modal to the queue and show it', async () => {
    const modalSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
    modalSpy.onDidDismiss.and.returnValue(of({}));
    modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

    await service.addModal({}, () => {});

    expect(modalControllerSpy.create).toHaveBeenCalled();
    expect(modalSpy.present).toHaveBeenCalled();
  });

  it('should not show a new modal while another one is showing', async () => {
    const modalSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
    modalSpy.onDidDismiss.and.returnValue(new Promise(() => {}));
    modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

    await service.addModal({}, () => {});
    await service.addModal({}, () => {});

    expect(modalControllerSpy.create.calls.count()).toEqual(1);
    expect(modalSpy.present.calls.count()).toEqual(1);
  });

  it('should show the next modal after the current one is dismissed', async () => {
    const modalSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
    modalSpy.onDidDismiss.and.returnValue(of({}));
    modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

    await service.addModal({}, () => {});
    await service.addModal({}, () => {});

    expect(modalControllerSpy.create.calls.count()).toEqual(2);
    expect(modalSpy.present.calls.count()).toEqual(2);
  });
});
