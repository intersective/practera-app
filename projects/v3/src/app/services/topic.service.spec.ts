import { TestBed } from '@angular/core/testing';
import { TopicService } from './topic.service';
import { of } from 'rxjs';
import { RequestService } from 'request';
import { UtilsService } from '@v3/services/utils.service';
import { TestUtils } from '@testingv3/utils';

describe('TopicService', () => {
  let service: TopicService;
  let requestSpy: jasmine.SpyObj<RequestService>;
  let utils: UtilsService;
  const testUtils = new TestUtils();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TopicService,
        {
          provide: UtilsService,
          useClass: TestUtils,
        },
        {
          provide: RequestService,
          useValue: jasmine.createSpyObj('RequestService', ['get', 'post', 'apiResponseFormatError'])
        }
      ]
    });
    service = TestBed.inject(TopicService);
    requestSpy = TestBed.inject(RequestService) as jasmine.SpyObj<RequestService>;
    utils = TestBed.inject(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when testing getTopic()', () => {
    it('should get correct data #1', () => {
      requestSpy.get.and.returnValue(of({
        success: true,
        data: [{
          Story: {
            id: 1,
            title: 'story',
            has_comments: true
          },
          Filestore: [{
            slug: 'abc',
            name: 'file'
          }]
        }]
      }));
      service.getTopic(1);
      service.topic$.subscribe(res => {
        expect(res).toEqual({
          id: 1,
          title: 'story',
          files: [{
            url: 'abc',
            name: 'file'
          }],
          content: '',
          videolink: ''
        });
      });
    });
    it('should get correct data #2', () => {
      requestSpy.get.and.returnValue(of({
        success: true,
        data: [{
          Story: {
            id: 1,
            title: 'story',
            has_comments: true,
            content: 'content',
            videolink: 'video'
          },
          Filestore: [{
            slug: 'abc',
            name: 'file'
          }]
        }]
      }));
      service.getTopic(1);
      service.topic$.subscribe(res => {
        expect(res.videolink).toEqual('video');
      });
    });
    describe('should throw error', () => {
      afterEach(() => {
        service.getTopic(1);
        expect(requestSpy.apiResponseFormatError.calls.count()).toBe(1);
      });
      it('Story format error', () => {
        requestSpy.get.and.returnValue(of({
          success: true,
          data: [{}]
        }));
      });
      it('Story.Story format error', () => {
        requestSpy.get.and.returnValue(of({
          success: true,
          data: [{
            Story: {},
            Filestore: {}
          }]
        }));
      });
    });
  });

  it('when testing updateTopicProgress(), it should post data', () => {
    requestSpy.post.and.returnValue(of(''));
    service.updateTopicProgress(1, '').subscribe();
    expect(requestSpy.post.calls.count()).toBe(1);
  });
});
