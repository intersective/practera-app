import { gql, Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, defaultDataIdFromObject } from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '@v3/environments/environment';
import { RequestService } from 'request';
import { catchError, concatMap, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

enum ClientType {
  core = 'CORE',
  chat = 'CHAT'
}

@Injectable({
  providedIn: 'root'
})
export class ApolloService {
  private apolloInstance: Apollo;
  private _url = {
    core: '',
    chat: '',
  };

  constructor(
    private apollo: Apollo,
    private httpLink: HttpLink,
    private requestService: RequestService,
  ) {}

  initiateCoreClient(): Apollo {
    if (this._hasInitiated(environment.graphQL, ClientType.core)) {
      return this.apolloInstance;
    }

    // create default client
    this.apollo.createDefault({
      cache: new InMemoryCache({
        dataIdFromObject: object => {
          switch (object.__typename) {
            case 'Task':
              return `Task:${object['type']}${object.id}`;
            default:
              return defaultDataIdFromObject(object);
          }
        }
      }),
      link: this.httpLink.create({
        uri: environment.graphQL
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

    this.apolloInstance = this.apollo;
    this._url.core = environment.graphQL;

    return this.apolloInstance;
  }

  /**
   * skip if apollo already created for an URI
   * pairing conditions: URL & ClientType
   * - core grahpql domain & 'core'
   * - chat grahpql domain & 'chat'
   *
   * @param url {string}
   * @param type {ClientType}
   * @returns boolean
   */
  private _hasInitiated(url: string, type: ClientType = ClientType.core): boolean {
    if (type === ClientType.core
      && this.apollo.client
      && this._url.core === environment.graphQL) {
      return true;
    } else if (type === ClientType.chat
      && this.apollo.use('chat')
      && this._url.chat === environment.chatGraphQL) {
        return true;
    }
    return false;
  }

  initiateChatClient() {
    if (this._hasInitiated(environment.chatGraphQL, ClientType.chat)) {
      return;
    }
    this.apollo.createNamed('chat', {
      link: this.httpLink.create({
        uri: environment.chatGraphQL
      }),
      cache: new InMemoryCache(),
    });
    this._url.chat = environment.chatGraphQL;
  }

  getClient() {
    return this.apollo.client;
  }

  updateCache(taskName: string, { data }): void {
    this.apollo.client.writeFragment({
      id: taskName,
      fragment: gql`
        fragment task on Task {
          status {
            status
            __typename
          }
          __typename
        }
      `,
      data
    });
  }

  /**
   * Valid options:
   * noCache: Boolean default false. If set to false, will not cache the result
   */
  graphQLWatch(query: string, variables?: any, options?: any): Observable<any> {
    options = { ...{ noCache: false }, ...options };
    const watch = this.apollo.watchQuery({
      query: gql(query),
      variables: variables || {},
      fetchPolicy: options.noCache ? 'no-cache' : 'cache-and-network'
    });
    return watch.valueChanges
      .pipe(map(response => {
        return response;
      }))
      .pipe(
        catchError((error) => this.requestService.handleError(error))
      );
  }

  /**
   * single fetch no-cache is only option
   */
  graphQLFetch(query: string, options?: {
    variables?: any;
    context?: any;
  }): Observable<any> {
    // Direct login is using GraphQL before landing on AppComponent,
    // so need force instantiation beforehand
    let apollo: Apollo = this.apollo;
    if (!!(this.apolloInstance || this.apollo).client) {
      apollo = this.initiateCoreClient();
    }

    const watch = apollo.query({
      query: gql(query),
      variables: options?.variables || {},
      fetchPolicy: 'no-cache',
      context: options?.context || {},
    });
    return watch
      .pipe(map(response => {
        return response;
      }))
      .pipe(
        catchError((error) => this.requestService.handleError(error))
      );
  }

  /**
   * single fetch no-cache is only option
   */
  graphQLMutate(query: string, variables = {}): Observable<any> {
    return this.apollo.mutate({
      mutation: gql(query),
      variables: variables
    }).pipe(
      concatMap(response => {
        return of(response);
      }),
      catchError(error => this.requestService.handleError(error)),
    );
  }

  /**
   * single fetch no-cache is only option for continuous query (autosave/submission)
   */
  continuousGraphQLMutate(query: string, variables = {}): Observable<any> {
    return this.apollo.mutate({
      mutation: gql(query),
      variables: variables
    }).pipe(
      concatMap(response => {
        return of(response);
      }),
      // prevent error thrown which will stop the autosave/submission
      catchError((error: HttpErrorResponse) => of({ error }))
    );
  }

  /*
   * Valid options:
   * noCache: Boolean default false. If set to false, will not cache the result
   */
  chatGraphQLQuery(query: string, variables: any = {}) {
    const watch = this.apollo.use('chat').query({
      query: gql(query),
      variables,
      fetchPolicy: 'no-cache' // always retrieve a fresh one
    });
    return watch.pipe(
      concatMap(response => {
        return of(response);
      }),
      catchError((error) => this.requestService.handleError(error))
    );
  }

  chatGraphQLMutate(query: string, variables = {}): Observable<any> {
    return this.apollo.use('chat').mutate({
      mutation: gql(query),
      variables: variables
    }).pipe(
      concatMap(response => {
        return of(response);
      }),
      catchError((error) => this.requestService.handleError(error))
    );
  }

  writeFragment({ id, fragment, data }) {
    return this.apollo.client.writeFragment({
      id,
      data,
      fragment: gql`${fragment}`,
    });
  }
}
