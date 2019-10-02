import { TestBed } from '@angular/core/testing';
import { NewRelicService } from './new-relic.service';
import { BrowserStorageService } from '@services/storage.service';
// import { Mock } from '@testing/mocked.service';

describe('NewRelicService', () => {
  let service: NewRelicService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BrowserStorageService,
          useValue: jasmine.createSpyObj(['getUser'])
        }
      ]
    });
    service = TestBed.get(NewRelicService);
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
});
