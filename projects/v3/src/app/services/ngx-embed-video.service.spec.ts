import { inject, TestBed, fakeAsync, flushMicrotasks, flush } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { EmbedVideoService } from './ngx-embed-video.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('EmbedVideoService', () => {
  let service: EmbedVideoService;
  let sanitizer: DomSanitizer;
  let httpSpy: HttpClient;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule,
      ],
      providers: [
        EmbedVideoService,
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: (iframe: string) => `sanitized:${iframe}`
          }
        },
        {
          provide: HttpClient,
          useValue: {
            get: () => of(true)
          }
        }
      ]
    });

    service = TestBed.inject(EmbedVideoService);
    sanitizer = TestBed.inject(DomSanitizer);
    httpSpy = TestBed.inject(HttpClient);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  it('converts vimeo.com url', () => {
    const target = service.embed('http://vimeo.com/19339941') as string;
    expect(target).toMatch(/^sanitized:<iframe id="vimeo-embed-19339941-\d+" src="https:\/\/player\.vimeo\.com\/video\/19339941" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen><\/iframe>$/);
  });


  it('converts youtube.com url', () => {
    const target = service.embed('https://www.youtube.com/watch?v=twE64AuqE9A') as string;
    expect(target).toMatch(/^sanitized:<iframe id="youtube-embed-twE64AuqE9A-\d+" src="https:\/\/www\.youtube\.com\/embed\/twE64AuqE9A" frameborder="0" allowfullscreen><\/iframe>$/);
  });

  it('converts youtu.be url', () => {
    const target = service.embed('http://youtu.be/9XeNNqeHVDw#aid=P-Do3JLm4A0') as string;
    expect(target).toMatch(/^sanitized:<iframe id="youtube-embed-9XeNNqeHVDw-\d+" src="https:\/\/www\.youtube\.com\/embed\/9XeNNqeHVDw" frameborder="0" allowfullscreen><\/iframe>$/);
  });

  it('converts dailymotion.com url', () => {
    const target = service.embed('https://www.dailymotion.com/video/x20qnej_red-bull-presents-wild-ride-bmx-mtb-dirt_sport') as string;
    expect(target).toMatch(/^sanitized:<iframe id="dailymotion-embed-x20qnej-\d+" src="https:\/\/www\.dailymotion\.com\/embed\/video\/x20qnej" frameborder="0" allowfullscreen><\/iframe>$/);
  });

  it('converts dai.ly url', () => {
    const target = service.embed('http://dai.ly/x20qnej') as string;
    expect(target).toMatch(/^sanitized:<iframe id="dailymotion-embed-x20qnej-\d+" src="https:\/\/www\.dailymotion\.com\/embed\/video\/x20qnej" frameborder="0" allowfullscreen><\/iframe>$/);
  });

  it('converts vimeo id', () => {
    const target = service.embed_vimeo('19339941') as string;
    expect(target).toMatch(/^sanitized:<iframe id="vimeo-embed-19339941-\d+" src="https:\/\/player\.vimeo\.com\/video\/19339941" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen><\/iframe>$/);
  });

  it('converts youtube id', () => {
    const target = service.embed_youtube('9XeNNqeHVDw') as string;
    expect(target).toMatch(/^sanitized:<iframe id="youtube-embed-9XeNNqeHVDw-\d+" src="https:\/\/www\.youtube\.com\/embed\/9XeNNqeHVDw" frameborder="0" allowfullscreen><\/iframe>$/);
  });

  it('converts dailymotion id', () => {
    const target = service.embed_dailymotion('x20qnej') as string;
    expect(target).toMatch(/^sanitized:<iframe id="dailymotion-embed-x20qnej-\d+" src="https:\/\/www\.dailymotion\.com\/embed\/video\/x20qnej" frameborder="0" allowfullscreen><\/iframe>$/);
  });

  it('accepts query param youtube', () => {
    const target = service.embed_youtube('9XeNNqeHVDw', { query: { rel: 0, showinfo: 0 } }) as string;
    expect(target).toMatch(/^sanitized:<iframe id="youtube-embed-9XeNNqeHVDw-\d+" src="https:\/\/www\.youtube\.com\/embed\/9XeNNqeHVDw\?rel=0&showinfo=0" frameborder="0" allowfullscreen><\/iframe>$/);
  });

  it('accepts attributes youtube', () => {
    const target = service.embed_youtube('9XeNNqeHVDw', { query: { rel: 0, showinfo: 0 }, attr: { width: 400, height: 200 } }) as string;
    expect(target).toMatch(/^sanitized:<iframe id="youtube-embed-9XeNNqeHVDw-\d+" src="https:\/\/www\.youtube\.com\/embed\/9XeNNqeHVDw\?rel=0&showinfo=0" width="400" height="200" frameborder="0" allowfullscreen><\/iframe>$/);
  });

  it('accepts query param vimeo', () => {
    const target = service.embed_vimeo('19339941', { query: { portrait: 0, color: '333' } }) as string;
    expect(target).toMatch(/^sanitized:<iframe id="vimeo-embed-19339941-\d+" src="https:\/\/player\.vimeo\.com\/video\/19339941\?portrait=0&color=333" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen><\/iframe>$/);
  });

  it('accepts attributes vimeo', () => {
    const target = service.embed_vimeo('19339941', { query: { portrait: 0, color: '333' }, attr: { width: 400, height: 200 } }) as string;
    expect(target).toMatch(/^sanitized:<iframe id="vimeo-embed-19339941-\d+" src="https:\/\/player\.vimeo\.com\/video\/19339941\?portrait=0&color=333" width="400" height="200" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen><\/iframe>$/);
  });

  it('accepts query param dailymotion', () => {
    const target = service.embed_dailymotion('x20qnej', { query: { autoPlay: 1, start: 66 } }) as string;
    expect(target).toMatch(/^sanitized:<iframe id="dailymotion-embed-x20qnej-\d+" src="https:\/\/www\.dailymotion\.com\/embed\/video\/x20qnej\?autoPlay=1&start=66" frameborder="0" allowfullscreen><\/iframe>$/);
  });

  it('accepts attributes dailymotion', () => {
    const target = service.embed_dailymotion('x20qnej', { query: { autoPlay: 1, start: 66 }, attr: { width: 400, height: 200 } }) as string;
    expect(target).toMatch(/^sanitized:<iframe id="dailymotion-embed-x20qnej-\d+" src="https:\/\/www\.dailymotion\.com\/embed\/video\/x20qnej\?autoPlay=1&start=66" width="400" height="200" frameborder="0" allowfullscreen><\/iframe>$/);
  });

  describe('embed_image', () => {
    it('gets vimeo thumbnail', fakeAsync(() => {
      httpSpy.get = jasmine.createSpy('httpClient.get').and.returnValue(of([{
        thumbnail_large: 'https://i.vimeocdn.com/video/122513613_640.jpg',
      }]));

      service.embed_image('https://vimeo.com/19339941').then((image) => {
        expect(image.link).toEqual('https://i.vimeocdn.com/video/122513613_640.jpg');
        expect(image.html).toEqual('<img src="https://i.vimeocdn.com/video/122513613_640.jpg"/>');
      });

      flushMicrotasks();
    }));

    it('gets vimeo thumbnail with options', fakeAsync(() => {
      httpSpy.get = jasmine.createSpy('httpClient.get').and.returnValue(of([
        {
          thumbnail_small: 'https://i.vimeocdn.com/video/122513613_100x75.jpg'
        }
      ]));

      service.embed_image('https://vimeo.com/19339941', { image: 'thumbnail_small' }).then((image) => {
        expect(image.link).toEqual('https://i.vimeocdn.com/video/122513613_100x75.jpg');
        expect(image.html).toEqual('<img src="https://i.vimeocdn.com/video/122513613_100x75.jpg"/>');
      });
      flushMicrotasks();
    }));

    it('gets default vimeo thumbnail with invalid options', fakeAsync(() => {
      httpSpy.get = jasmine.createSpy('httpClient.get').and.returnValue(of([
        {
          'thumbnail_large': 'https://i.vimeocdn.com/video/122513613_640.jpg'
        }
      ]));

      service.embed_image('https://vimeo.com/19339941', { image: 'sample-format' }).then((image) => {
        expect(image.link).toEqual('https://i.vimeocdn.com/video/122513613_640.jpg');
        expect(image.html).toEqual('<img src="https://i.vimeocdn.com/video/122513613_640.jpg"/>');
      });
      flushMicrotasks();
    }));

    it('gets youtube thumbnail (prove backwards compatibility)', fakeAsync(() => {
      service.embed_image('https://youtu.be/ZeLnjXTNq6Q', { image: 'maxresdefault' }).then((image) => {
        expect(image.link).toEqual('https://img.youtube.com/vi/ZeLnjXTNq6Q/maxresdefault.jpg');
        expect(image.html).toEqual('<img src="https://img.youtube.com/vi/ZeLnjXTNq6Q/maxresdefault.jpg"/>');
      });
    }));

    it('gets dailymotion thumbnail', fakeAsync(() => {
      httpSpy.get = jasmine.createSpy('httpClient.get').and.returnValue(of({
        thumbnail_480_url: 'http://s1.dmcdn.net/IgPVQ/x480-ktj.jpg'
      }));

      service.embed_image('https://www.dailymotion.com/video/x20qnej_red-bull-presents-wild-ride-bmx-mtb-dirt_sport').then((image) => {
        expect(image.link).toEqual('http://s1.dmcdn.net/IgPVQ/x480-ktj.jpg');
        expect(image.html).toEqual('<img src="http://s1.dmcdn.net/IgPVQ/x480-ktj.jpg"/>');
      });
      flushMicrotasks();
    }));

    it('gets dailymotion thumbnail with options', fakeAsync(() => {
      httpSpy.get = jasmine.createSpy('httpClient.get').and.returnValue(of({
        thumbnail_720_url: 'http://s1.dmcdn.net/IgPVQ/x720-d_h.jpg'
      }));

      service.embed_image('https://www.dailymotion.com/video/x20qnej_red-bull-presents-wild-ride-bmx-mtb-dirt_sport', { image: 'thumbnail_720_url' }).then((image) => {
        expect(image.link).toEqual('http://s1.dmcdn.net/IgPVQ/x720-d_h.jpg');
        expect(image.html).toEqual('<img src="http://s1.dmcdn.net/IgPVQ/x720-d_h.jpg"/>');
      });
      flushMicrotasks();
    }));

    it('gets dailymotion thumbnail (dai.ly)', fakeAsync(() => {
      httpSpy.get = jasmine.createSpy('httpClient.get').and.returnValue(of({
        thumbnail_480_url: 'http://s1.dmcdn.net/IgPVQ/x480-ktj.jpg',
      }));

      service.embed_image('http://dai.ly/x20qnej').then((image) => {
        expect(image.link).toEqual('http://s1.dmcdn.net/IgPVQ/x480-ktj.jpg');
        expect(image.html).toEqual('<img src="http://s1.dmcdn.net/IgPVQ/x480-ktj.jpg"/>');
      });
      flushMicrotasks();
    }));
  });
});
