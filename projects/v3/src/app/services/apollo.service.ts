import { gql, Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, defaultDataIdFromObject } from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '@v3/environments/environment';
import { RequestService } from 'request';
import { catchError, concatMap, first, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApolloService {
  private apolloInstance: Apollo;
  private _url = '';

  constructor(
    private apollo: Apollo,
    private httpLink: HttpLink,
    private requestService: RequestService,
  ) {}

  initiateCoreClient(): Apollo {
    if (this._hasInitiated()) {
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
    this._url = environment.graphQL;

    return this.apolloInstance;
  }

  /**
   * skip if apollo already created for an URI
   * pairing conditions: URL
   * - core grahpql domain & 'core'
   *
   * @param url {string}
   * @param type {ClientType}
   * @returns boolean
   */
  private _hasInitiated(): boolean {
    try {
      if (this.apollo.client
        && this._url === environment.graphQL) {
        return true;
      }
    } catch {
      // apollo client not yet created
    }
    return false;
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
  graphQLWatch<T>(query: string, variables?: any, options?: any): Observable<any> {
    options = { ...{ noCache: false }, ...options };
    const watch = this.apollo.watchQuery<T>({
      query: gql(query),
      variables: variables || {},
      fetchPolicy: options?.noCache ? 'no-cache' : 'cache-and-network'
    });
    return watch.valueChanges
      .pipe(
        catchError((error) => {
          console.error('GraphQL watchQuery error:', error);
          return this.requestService.handleError(error);
        })
      );
  }

  /**
   * single fetch no-cache is only option
   */
  graphQLFetch(query: string, options?: {
    variables?: any;
    context?: any;
  }): Observable<any> {
    // Always ensure the client is initialised before querying.
    // initiateCoreClient() is idempotent — it returns the existing instance when
    // _hasInitiated() is true, so calling it here is always safe.
    const apollo = this.initiateCoreClient();

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
      variables,
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

  writeFragment({ id, fragment, data }) {
    return this.apollo.client.writeFragment({
      id,
      data,
      fragment: gql`${fragment}`,
    });
  }

  logError(message: string): Observable<{
    success: boolean;
    message: string;
  }> {
    if ((environment.production as any) !== true) {
      return of(null);
    }

    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }

    const from = 'app';
    return this.graphQLMutate(`
      mutation logError($from: String!, $message: String!) {
        logError(from: $from, message: $message) {
          success
          message
        }
      }`, {
      from,
      message
    }).pipe(first());
  }
}
