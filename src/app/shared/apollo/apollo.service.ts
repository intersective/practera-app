import { Injectable } from '@angular/core';
import { BrowserStorageService } from '@services/storage.service';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApolloService {

  constructor(private storage: BrowserStorageService, private apollo: Apollo) { }

  /**
   * Valid options:
   * noCache: Boolean default false. If set to false, will not cache the result
   */
  graphQLQuery(query: string, variables?: any, options?: any): Observable<any> {
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
  chatGraphQLQuery(query: string, variables?: any, options?: any): Observable<any> {
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
}
