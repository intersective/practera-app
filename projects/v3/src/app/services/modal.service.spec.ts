import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
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
    // onDidDismiss returns a Promise, not an Observable
    modalSpy.onDidDismiss.and.returnValue(Promise.resolve({}));
    modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

    await service.addModal({}, () => {});

    expect(modalControllerSpy.create).toHaveBeenCalled();
    expect(modalSpy.present).toHaveBeenCalled();
  });

  it('should not show a new modal while another one is showing', async () => {
    const modalSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
    // never-resolving promise to simulate modal staying open
    modalSpy.onDidDismiss.and.returnValue(new Promise(() => {}));
    modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

    await service.addModal({}, () => {});
    await service.addModal({}, () => {});

    expect(modalControllerSpy.create.calls.count()).toEqual(1);
    expect(modalSpy.present.calls.count()).toEqual(1);
  });

  it('should show the next modal after the current one is dismissed', fakeAsync(() => {
    const modalSpy = jasmine.createSpyObj('Modal', ['present', 'onDidDismiss']);
    // onDidDismiss returns a Promise, not an Observable
    modalSpy.onDidDismiss.and.returnValue(Promise.resolve({}));
    modalControllerSpy.create.and.returnValue(Promise.resolve(modalSpy));

    service.addModal({}, () => {});
    tick(); // let first modal be created
    service.addModal({}, () => {});
    tick(); // let second modal be added to queue

    // flush all pending async operations
    flush();

    expect(modalControllerSpy.create.calls.count()).toEqual(2);
    expect(modalSpy.present.calls.count()).toEqual(2);
  }));

});
