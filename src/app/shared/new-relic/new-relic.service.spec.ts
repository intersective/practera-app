import { TestBed } from '@angular/core/testing';
import { NewRelicService } from './new-relic.service';
import { BrowserStorageService } from '@services/storage.service';
// import { Mock } from '@testing/mocked.service';
import { environment } from '@environments/environment';
import { BrowserStorageServiceMock } from '@testing/mocked.service';

describe('NewRelicService', () => {
  let service: NewRelicService;
  let storageSpy: BrowserStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BrowserStorageService,
          useClass: BrowserStorageServiceMock,
        }
      ]
    });
    service = TestBed.inject(NewRelicService);
    storageSpy = TestBed.inject(BrowserStorageService);
    environment.newrelic = true;
  });

  it('should has setPageViewName', () => {
    expect(service.setPageViewName).toBeTruthy();
  });

  it('should has addPageAction', () => {
    expect(service.addPageAction).toBeTruthy();
  });

  it('should has setCustomAttribute', () => {
    expect(service.setCustomAttribute).toBeTruthy();
  });

  it('should has noticeError', () => {
    expect(service.noticeError).toBeTruthy();
  });

  it('should has getContext', () => {
    expect(service.getContext).toBeTruthy();
  });

  it('should has actionText', () => {
    expect(service.actionText).toBeTruthy();
  });

  it('should has setAttribute', () => {
    expect(service.setAttribute).toBeTruthy();
  });

  it('should not trigger newrelic if set to false', () => {
    environment.newrelic = false;
    expect(service.setPageViewName('')).toBeNull();
    expect(service.addPageAction('')).toBeNull();
    expect(service.setCustomAttribute('', '')).toBeNull();
    expect(service.noticeError('')).toBeNull();
    expect(service.getContext()).toBeNull();
    expect(service.actionText('')).toBeNull();
    expect(service.setAttribute('', '')).toBeNull();
  });

  describe('noticeError()', () => {
    const TEST1 = {
      userHash: 'testuserhash',
      enrolment: {
        id: 1
      }
    };

    const TEST2 = {
      userHash: 'testuserhash',
    };

    beforeEach(() => {
      spyOn(service, 'setAttribute');
    });

    it('should get custom attributes from storage', () => {
      storageSpy.getUser = jasmine.createSpy().and.returnValue(TEST1);
      service.noticeError('dummyvalue');

      expect(storageSpy.getUser).toHaveBeenCalled();
      expect(service.setAttribute).toHaveBeenCalledWith('user hash', TEST1.userHash);
      expect(service.setAttribute).toHaveBeenCalledWith('enrolment ID', TEST1.enrolment.id);
    });

    it('should skip custom attribute if storage doesn\'t has specified value(s)', () => {
      storageSpy.getUser = jasmine.createSpy().and.returnValue(TEST2);
      service.noticeError('dummyvalue');

      expect(storageSpy.getUser).toHaveBeenCalled();
      expect(service.setAttribute).toHaveBeenCalledWith('user hash', TEST2.userHash);
      expect(service.setAttribute).not.toHaveBeenCalledWith('enrolment ID', TEST1.enrolment.id);
    });
  });
});
