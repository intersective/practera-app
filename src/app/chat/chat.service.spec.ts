import { TestBed } from '@angular/core/testing';
import { RequestService } from '@shared/request/request.service';
import { UtilsService } from '@services/utils.service';
import { PusherService } from '@shared/pusher/pusher.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let utils: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatService,
        UtilsService,
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError'])
        }
      ]
    });
    service = TestBed.get(ChatService);
    requestSpy = TestBed.get(RequestService);
    utils = TestBed.get(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('should instantiated with variables', () => {
  //   expect(service['chatList']).toBeTruthy();
  //   expect(service['messageList']).toBeTruthy();
  // });

  // it('#getchatList should', () => {
  //   expect(service.getchatList).toBeTruthy();
  // });

  // it('#getMessageList should', () => {
  //   expect(service.getMessageList).toBeTruthy();
  // });

  // it('#markMessagesAsSeen should', () => {
  //   expect(service.markMessagesAsSeen).toBeTruthy();
  // });

  // it('#postNewMessage should', () => {
  //   expect(service.postNewMessage).toBeTruthy();
  // });

});
