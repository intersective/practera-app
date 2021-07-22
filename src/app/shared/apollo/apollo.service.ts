import { Injectable } from '@angular/core';
import { HttpLink } from 'apollo-angular-link-http';
import { BrowserStorageService } from '@services/storage.service';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';

@Injectable({
  providedIn: 'root'
})
export class ApolloService {

  constructor(
    private storage: BrowserStorageService,
    private apollo: Apollo,
    private httpLink: HttpLink,
  ) { }

  initiateCoreClient() {
    this.apollo.create({
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
        uri: this.storage.stackConfig.coreGraphQLApi
      })
    });
  }

  initiateChatClient() {
    this.apollo.create(
      {
        link: this.httpLink.create({
          uri: this.storage.stackConfig.chatApi
        }),
        cache: new InMemoryCache(),
      },
      'chat');
  }

  getClient() {
    return this.apollo.getClient();
  }

  updateCache(taskName:string, { data }): void {
    this.apollo.getClient().writeFragment({
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
  graphQLQuery(query: string, variables?: any, options?: any) {
    options = { ...{ noCache: false }, ...options };
    const watch = this.apollo.watchQuery({
      query: gql(query),
      variables: variables || {},
      fetchPolicy: options.noCache ? 'no-cache' : 'cache-and-network'
    });
    return watch;
  }

  /**
   *
   */
  graphQLMutate(query: string, variables = {}): Observable<any> {
    return this.apollo.mutate({
      mutation: gql(query),
      variables: variables
    });
  }

  /**
   * Valid options:
   * noCache: Boolean default false. If set to false, will not cache the result
   */
  chatGraphQLQuery(query: string, variables?: any, options?: any) {
    options = { ...{ noCache: false }, ...options };
    const watch = this.apollo.use('chat').watchQuery({
      query: gql(query),
      variables: variables || {},
      fetchPolicy: options.noCache ? 'no-cache' : 'cache-and-network'
    });
    return watch;
  }

  chatGraphQLMutate(query: string, variables = {}): Observable<any> {
    return this.apollo.use('chat').mutate({
      mutation: gql(query),
      variables: variables
    });
  }

  writeFragment({ id, fragment, data }) {
    return this.apollo.getClient().writeFragment({
      id,
      data,
      fragment: gql`${fragment}`,
    });
  }
}
