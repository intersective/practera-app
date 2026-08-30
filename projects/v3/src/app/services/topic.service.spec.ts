import { TestBed } from '@angular/core/testing';
import { TopicService } from './topic.service';
import { of } from 'rxjs';
import { ApolloService } from '@v3/services/apollo.service';
import { DomSanitizer } from '@angular/platform-browser';

describe('TopicService', () => {
  let service: TopicService;
  let apolloSpy: jasmine.SpyObj<ApolloService>;

  const mockSanitizer = {
    bypassSecurityTrustHtml: (html: string) => html,
  };

  const mockTopicResponse = {
    data: {
      topic: {
        id: 1,
        title: 'Test Topic',
        content: '<p>Content</p>',
        videoLink: 'https://youtube.com/watch?v=test',
        files: [{ name: 'doc.pdf', url: 'https://example.com/doc.pdf' }],
        audio: { link: 'https://audio.example.com/clip.mp3', language: 'en', status: 'ready' },
      }
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TopicService,
        {
          provide: ApolloService,
          useValue: jasmine.createSpyObj('ApolloService', ['graphQLFetch', 'graphQLMutate'])
        },
        {
          provide: DomSanitizer,
          useValue: mockSanitizer,
        },
      ]
    });
    service = TestBed.inject(TopicService);
    apolloSpy = TestBed.inject(ApolloService) as jasmine.SpyObj<ApolloService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTopic()', () => {
    it('calls apolloService.graphQLFetch with the topics query', () => {
      apolloSpy.graphQLFetch.and.returnValue(of(mockTopicResponse as any));
      service.getTopic(1);
      expect(apolloSpy.graphQLFetch).toHaveBeenCalledTimes(1);
      const [query, options] = apolloSpy.graphQLFetch.calls.mostRecent().args;
      expect(query).toContain('topic');
      expect(options.variables).toEqual({ id: 1 });
    });

    it('normalises the topic and emits via topic$', (done) => {
      apolloSpy.graphQLFetch.and.returnValue(of(mockTopicResponse as any));
      service.getTopic(1);
      service.topic$.subscribe(topic => {
        if (topic) {
          expect(topic.id).toBe(1);
          expect(topic.title).toBe('Test Topic');
          expect(topic.files).toEqual([{ url: 'https://example.com/doc.pdf', name: 'doc.pdf' }]);
          done();
        }
      });
    });

    it('sets audio when audio link is present', (done) => {
      apolloSpy.graphQLFetch.and.returnValue(of(mockTopicResponse as any));
      service.getTopic(1);
      service.topic$.subscribe(topic => {
        if (topic) {
          expect(topic.audio?.link).toBe('https://audio.example.com/clip.mp3');
          expect(topic.audio?.language).toBe('en');
          expect(topic.rawContent).toBe('<p>Content</p>');
          done();
        }
      });
    });

    it('does not set audio when audio link is absent', (done) => {
      const noAudioResponse = {
        data: {
          topic: { id: 2, title: 'No Audio', content: '', videoLink: '', files: [], audio: null }
        }
      };
      apolloSpy.graphQLFetch.and.returnValue(of(noAudioResponse as any));
      service.getTopic(2);
      service.topic$.subscribe(topic => {
        if (topic) {
          expect(topic.audio).toBeUndefined();
          done();
        }
      });
    });
  });

  describe('updateTopicProgress()', () => {
    it('calls apolloService.graphQLMutate with the updateProgress mutation', () => {
      apolloSpy.graphQLMutate.and.returnValue(of({ data: { updateProgress: { success: true } } }));
      service.updateTopicProgress(1, 'completed').subscribe();
      expect(apolloSpy.graphQLMutate).toHaveBeenCalledTimes(1);
      const [mutation, variables] = apolloSpy.graphQLMutate.calls.mostRecent().args;
      expect(mutation).toContain('updateProgress');
      expect(variables).toEqual({ model: 'topic', modelId: 1, state: 'completed' });
    });

    it('includes attention metrics in mutation variables when provided', () => {
      const attention = {
        version: 1,
        score: 80,
        confidence: 'high',
        activeMs: 10000,
        visibleMs: 10000,
        estimatedReadMs: 9000,
        textWordCount: 30,
        contentExposureRatio: 1,
        mediaProgressRatio: 0,
        mediaPlayedMs: 0,
        filePreviewCount: 0,
        fileDownloadCount: 0,
        quickComplete: false,
      } as any;
      apolloSpy.graphQLMutate.and.returnValue(of({ data: { updateProgress: { success: true } } }));
      service.updateTopicProgress(1, 'completed', attention).subscribe();
      expect(apolloSpy.graphQLMutate).toHaveBeenCalledTimes(1);
      const [mutation, variables] = apolloSpy.graphQLMutate.calls.mostRecent().args;
      expect(mutation).toContain('updateProgress');
      expect(variables).toEqual({ model: 'topic', modelId: 1, state: 'completed', meta: { attention } });
    });
  });

  describe('clearTopic()', () => {
    it('emits null on topic$', (done) => {
      apolloSpy.graphQLFetch.and.returnValue(of(mockTopicResponse as any));
      service.getTopic(1);
      setTimeout(() => {
        service.clearTopic();
        service.topic$.subscribe(topic => {
          expect(topic).toBeNull();
          done();
        });
      }, 10);
    });
  });
});
