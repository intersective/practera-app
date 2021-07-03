import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ApolloModule, APOLLO_OPTIONS, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';

import { AppRoutingModule } from './app-routing.module';
import { RequestModule } from '@shared/request/request.module';
import { NewRelicModule } from '@shared/new-relic/new-relic.module';
import { NotificationModule } from '@shared/notification/notification.module';
import { AuthModule } from './auth/auth.module';
import { FastFeedbackModule } from './fast-feedback/fast-feedback.module';
import { ReviewRatingModule } from './review-rating/review-rating.module';
import { EventDetailModule } from './event-detail/event-detail.module';
import { GoMobileModule } from './go-mobile/go-mobile.module';

import { AppComponent } from './app.component';
import { UtilsService } from './services/utils.service';
import { VersionCheckService } from './services/version-check.service';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { EmbedVideo } from 'ngx-embed-video';
import { environment } from '@environments/environment';
import { IntercomModule } from 'ng-intercom';
import { PusherModule } from '@shared/pusher/pusher.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UnlockingComponent } from '@components/unlocking/unlocking.component';
import { DeviceInfoComponent } from './device-info/device-info.component';
import { BrowserStorageService } from '@services/storage.service';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

function initializeApp(
  utils: UtilsService,
  storage: BrowserStorageService,
  httpClient: HttpClient
) {
  return () => new Promise(async (resolve) => {
    const query = utils.getQueryParams();
    try {
      if (query.has('stack_uuid')) {
        const res = await httpClient.get(`https://login.practera.com/stack/${query.get('stack_uuid')}`);
        storage.stackConfig = res;
        return resolve(res);
      }
      return resolve(true);
    } catch (err) {
      return resolve(err);
    }
  });

}

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    UnlockingComponent,
    DeviceInfoComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ApolloModule,
    HttpLinkModule,
    IonicModule.forRoot(),
    AuthModule,
    RequestModule.forRoot({
      appkey: environment.appkey,
      prefixUrl: environment.APIEndpoint,
    }),
    AppRoutingModule,
    EmbedVideo.forRoot(),
    NewRelicModule.forRoot(),
    NotificationModule,
    FastFeedbackModule,
    GoMobileModule,
    ReviewRatingModule,
    EventDetailModule,
    PusherModule.forRoot({
      apiurl: environment.APIEndpoint,
      pusherKey: environment.pusherKey,
    }),
    IntercomModule.forRoot({
      appId: environment.intercomAppId,
      updateOnRouterChange: true // will automatically run `update` on router event changes. Default: `false`
    })
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [UtilsService, BrowserStorageService, HttpClient],
      multi: true,
    },
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
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Custom
    UtilsService,
    VersionCheckService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
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
