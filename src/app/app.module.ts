import { NgModule } from '@angular/core';
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

import { AppComponent } from './app.component';
import { UtilsService } from './services/utils.service';
import { VersionCheckService } from './services/version-check.service';
import { environment } from '@environments/environment';
import { IntercomModule } from 'ng-intercom';
import { PusherModule } from '@shared/pusher/pusher.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UnlockingComponent } from '@components/unlocking/unlocking.component';
import { DeviceInfoComponent } from './device-info/device-info.component';
import { ApolloModule } from './shared/apollo/apollo.module';
import { EmbedVideoModule } from './shared/ngx-embed-video/ngx-embed-video.module';
import { PageNotFoundModule } from './page-not-found/page-not-found.module';


@NgModule({
  declarations: [
    AppComponent,
    UnlockingComponent,
    DeviceInfoComponent,
  ],
  imports: [
    RequestModule.forRoot({
      appkey: environment.appkey,
      prefixUrl: environment.APIEndpoint,
    }),
    ApolloModule,
    AuthModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    NewRelicModule.forRoot(),
    EmbedVideoModule.forRoot(),
    NotificationModule,
    FastFeedbackModule,
    GoMobileModule,
    ReviewRatingModule,
    EventDetailModule,
    PageNotFoundModule,
    PusherModule.forRoot({
      apiurl: environment.APIEndpoint,
      pusherKey: environment.pusherKey,
    }),
    IntercomModule.forRoot({
      appId: environment.intercomAppId,
      updateOnRouterChange: true,
      // will automatically run `update` on router event changes. Default: `false`
    })
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Custom
    UtilsService,
    VersionCheckService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
