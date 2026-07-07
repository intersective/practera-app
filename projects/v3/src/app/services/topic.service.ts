import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '@v3/environments/environment';
import { DemoService } from './demo.service';
import { ApolloService } from './apollo.service';

export interface Topic {
  id: number;
  title: string;
  content: any;
  videolink?: string;
  files: Array<any>;
  audio?: {
    link: string;
    language?: string;
    status?: string;
  };
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
      `query topics($activityId: ID!) {
        topics(activityId: $activityId) {
          id
          title
          content
          videolink
          files { name url }
          audio { link language status }
        }
      }`,
      { variables: { activityId: activityId } }
    ).pipe(
      map((response: any) => {
        const topics: Topic[] = response?.data?.topics ?? [];
        const topic = topics.find(t => t.id === resolvedTopicId) ?? topics[0];
        if (topic) {
          this._setTopic(topic);
        }
        return topic;
      })
    ).subscribe();
  }

  private _setTopic(raw: any) {
    const topic: Topic = {
      id: raw.id,
      title: raw.title,
      content: raw.content ? this._processContent(raw.content) : '',
      videolink: raw.videolink ?? '',
      files: (raw.files ?? []).map((f: any) => ({ url: f.url, name: f.name })),
      audio: raw.audio?.link ? {
        link: raw.audio.link,
        language: raw.audio.language ?? null,
        status: raw.audio.status ?? undefined,
      } : undefined,
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

  updateTopicProgress(id: number, state: string): Observable<any> {
    if (environment.demo) {
      // eslint-disable-next-line no-console
      console.log('mark topic as ', state);
      return new Observable(observer => { observer.next({ success: true }); observer.complete(); });
    }

    return this.apolloService.graphQLMutate(
      `mutation updateProgress($model: String!, $modelId: ID!, $state: String!) {
        updateProgress(model: $model, modelId: $modelId, state: $state) {
          success
        }
      }`,
      { model: 'topic', modelId: id, state }
    );
  }
}
