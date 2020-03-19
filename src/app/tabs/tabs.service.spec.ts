import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RequestService } from '@shared/request/request.service';
import { TabsService } from './tabs.service';

describe('TabsService', () => {
  let service: TabsService;
  let requestSpy: jasmine.SpyObj<RequestService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TabsService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError'])
        },
      ]
    });
    service = TestBed.inject(TabsService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when testing getNoOfTodoItems()', () => {
    let response, expected = 0, error = false;
    afterEach(() => {
      requestSpy.get.and.returnValue(of(response));
      service.getNoOfTodoItems().subscribe(res => expect(res).toEqual(expected));
      if (error) {
        expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
      }
    });
    it('should throw error #1', () => {
       response = {
         success: true,
         data: {}
       };
       error = true;
    });
    it('should throw error #2', () => {
       response = {
         success: true,
         data: [{}]
       };
       error = true;
    });
    it('should get correct data', () => {
      response = {
         success: true,
         data: [
           {
             is_done: true
           },
           {
             is_done: false,
             identifier: 'abc'
           },
           {
             is_done: false,
             identifier: 'AssessmentReview'
           },
           {
             is_done: false,
             identifier: 'AssessmentSubmission'
           }
         ]
       };
      error = false;
      expected = 2;
    });
  });

  describe('when testing getNoOfChats()', () => {
    let response, expected = 0, error = false;
    afterEach(() => {
      requestSpy.get.and.returnValue(of(response));
      service.getNoOfChats().subscribe(res => expect(res).toEqual(expected));
      if (error) {
        expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
      }
    });
    it('should throw error', () => {
       response = {
         success: true,
         data: {}
       };
       error = true;
    });
    it('should get correct data', () => {
      response = {
         success: true,
         data: {
           unread_message_count: 2
         }
       };
      error = false;
      expected = 2;
    });
  });
});
