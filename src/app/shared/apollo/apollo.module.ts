import { CommonModule } from '@angular/common';
import { environment } from '@environments/environment';import { NgModule } from '@angular/core';
import { ApolloModule as ApolloAngular, APOLLO_OPTIONS, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';

@NgModule({
  declarations: [],
  imports: [
    ApolloAngular,
    HttpLinkModule,
    CommonModule,
  ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
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
          link: httpLink.create({
            uri: environment.graphQL
          })
        };
      },
      deps: [HttpLink]
    },
  ]
})
export class ApolloModule {
  constructor(
    private apollo: Apollo,
    httpLink: HttpLink
  ) {
    this.apollo.create(
      {
        link: httpLink.create({
          uri: environment.chatGraphQL
        }),
        cache: new InMemoryCache(),
      },
      'chat');
  }
}
