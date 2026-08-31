import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { ApolloService } from './apollo.service';
import { TopicAttentionMetrics } from '@v3/app/models/topic-attention.model';

export interface H5pContent {
  contentUrl: string;
  librariesUrl: string;
  frameJs: string;
  frameCss: string;
}

export interface Topic {
  id: number;
  title: string;
  summary?: string;
  content: any;
  rawContent?: string;
  videoLink?: string;
  files: Array<any>;
  audio?: {
    link: string;
    language?: string;
    status?: string;
  };
  h5p?: H5pContent;
}

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private _topic$ = new BehaviorSubject<Topic>(null);
  topic$ = this._topic$.asObservable();

  topic: Topic;

  constructor(
    public sanitizer: DomSanitizer,
    private demo: DemoService,
    private apolloService: ApolloService,
  ) {
    this.topic$.subscribe(res => this.topic = res);
  }

  clearTopic() {
    this._topic$.next(null);
  }

  getTopic(activityId: number, topicId?: number) {
    const resolvedTopicId = topicId ?? activityId;
    if (!this.topic || this.topic.id !== resolvedTopicId) {
      this.clearTopic();
    }
    if (environment.demo) {
      return this.demo.topic().subscribe(res => this._normaliseTopic(res.data));
    }

    return this.apolloService.graphQLFetch(
      `query topic($id: ID!) {
        topic(id: $id) {
          id
          title
          summary
          content
          videoLink
          files { name url }
          audio { link language status }
          h5p { contentUrl librariesUrl frameJs frameCss }
        }
      }`,
      { variables: { id: resolvedTopicId } }
    ).pipe(
      map((response: any) => {
        const raw = response?.data?.topic ?? null;
        if (raw) {
          this._setTopic(raw);
        }
        return raw;
      })
    ).subscribe();
  }

  fetchSimulation(topicId: number): Observable<H5pContent | null> {
    if (environment.demo) {
      return of({
        contentUrl: 'https://example.com/h5p/content/',
        librariesUrl: 'https://example.com/h5p/libraries/',
        frameJs: 'https://example.com/h5p/frame.bundle.js',
        frameCss: 'https://example.com/h5p/frame.css',
      });
    }

    return this.apolloService.graphQLFetch(
      `query simulation($id: ID!) {
        topic(id: $id) {
          id
          h5p { contentUrl librariesUrl frameJs frameCss }
        }
      }`,
      { variables: { id: topicId } }
    ).pipe(
      map((response: any) => response?.data?.topic?.h5p ?? null)
    );
  }

  updateSimulationProgress(id: number, state: string): Observable<any> {
    if (environment.demo) {
      // eslint-disable-next-line no-console
      console.log('mark simulation as ', state);
      return new Observable(observer => { observer.next({ success: true }); observer.complete(); });
    }

    return this.apolloService.graphQLMutate(
      `mutation updateProgress($model: String!, $modelId: ID!, $state: String!) {
        updateProgress(model: $model, modelId: $modelId, state: $state) {
          success
        }
      }`,
      {
        model: 'simulation',
        modelId: id,
        state,
      }
    );
  }

  private _setTopic(raw: any) {
    const topic: Topic = {
      id: raw.id,
      title: raw.title,
      rawContent: raw.content || undefined,
      content: raw.content ? this._processContent(raw.content) : '',
      videoLink: raw.videoLink ?? '',
      files: (raw.files ?? []).map((f: any) => ({ url: f.url, name: f.name })),
      audio: raw.audio?.link ? {
        link: raw.audio.link,
        language: raw.audio.language ?? null,
        status: raw.audio.status ?? undefined,
      } : undefined,
      h5p: raw.h5p ?? undefined,
    };
    this._topic$.next(topic);
    return topic;
  }

  private _normaliseTopic(data: any[]) {
    if (!Array.isArray(data) || !data[0]) return null;
    return this._setTopic(data[0]);
  }

  private _processContent(content: string): any {
    let processed = content.replace(/text-align: center;/gi, 'text-align: center; text-align: -webkit-center;');
    processed = processed.replace(/(<iframe)/g, '<div class="video-embed"><iframe').replace(/(<\/iframe>)/g, '</iframe></div>');
    processed = processed.replace(/(<video)/g, '<video  class="video-embed"');
    return this.sanitizer.bypassSecurityTrustHtml(processed);
  }

  updateTopicProgress(id: number, state: string, attention?: TopicAttentionMetrics): Observable<any> {
    if (environment.demo) {
      // eslint-disable-next-line no-console
      console.log('mark topic as ', state, attention);
      return new Observable(observer => { observer.next({ success: true }); observer.complete(); });
    }

    const variables: { model: string; modelId: number; state: string; meta?: { attention: TopicAttentionMetrics } } = {
      model: 'topic',
      modelId: id,
      state,
    };

    if (attention) {
      variables.meta = { attention };
    }

    return this.apolloService.graphQLMutate(
      `mutation updateProgress($model: String!, $modelId: ID!, $state: String!, $meta: JSON) {
        updateProgress(model: $model, modelId: $modelId, state: $state, meta: $meta) {
          success
        }
      }`,
      variables
    );
  }
}
