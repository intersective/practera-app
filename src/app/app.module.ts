import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { RequestModule } from '@shared/request/request.module';
import { NewRelicModule } from '@shared/new-relic/new-relic.module';
import { NotificationModule } from '@shared/notification/notification.module';
import { AuthModule } from './auth/auth.module';
import { FastFeedbackModule } from './fast-feedback/fast-feedback.module';
import { ReviewRatingModule } from './review-rating/review-rating.module';
import { EventDetailModule } from './event-detail/event-detail.module';
import { GoMobileModule } from './go-mobile/go-mobile.module';
import { ApolloModule } from '@shared/apollo/apollo.module';

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
import { AuthService } from './auth/auth.service';

/**
 * Prerequisites before webapp initiated in browser
 *
 * @return  {Function}  return a deferred function
 */
function initializeApp(
  utils: UtilsService,
  storage: BrowserStorageService,
  authService: AuthService
): Function {

  /**
   * retrieve stack info first before everything else, so then all API
   * request URL can start using endpoint sourced from dynamic domain
   *
   * @param   {Function}  resolve  async function = Promise.resolve
   *
   * @return  {Promise<any>}         as long as deferred get
  *                                  resolved, the result doesn't matter
   */
  return (): Promise<any> => new Promise(async (resolve: Function): Promise<any> => {
    const query: URLSearchParams = utils.getQueryParams();
    try {
      if (query.has('stack_uuid')) {
        const res = await authService.getStackConfig(query.get('stack_uuid')).toPromise();
        storage.stackConfig = res;
        return resolve(res);
      }
      // if nothing happen, just let it continue
      // with "true" which won't be used anywhere
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
    ApolloModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AuthModule,
    RequestModule.forRoot({
      appkey: environment.appkey,
      prefixUrl: environment.APIEndpoint,
      loginApi: environment.loginAPIUrl
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
      deps: [UtilsService, BrowserStorageService, AuthService],
      multi: true,
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Custom
    UtilsService,
    VersionCheckService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
