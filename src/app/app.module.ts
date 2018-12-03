import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { RequestModule } from '@shared/request/request.module';
import { NotificationModule } from '@shared/notification/notification.module';
import { AuthModule } from './auth/auth.module';
import { TabsModule } from './tabs/tabs.module';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { UtilsService } from './services/utils.service';
import { FastFeedbackComponent } from './fast-feedback/fast-feedback.component';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    FastFeedbackComponent,
  ],
  imports: [
  	BrowserModule, 
    AuthModule,
    TabsModule,
  	IonicModule.forRoot(), 
    RequestModule.forRoot({ 
      appkey: 'b11e7c189b',
      prefixUrl: 'https://sandbox.practera.com/',
    }),
    NotificationModule,
  	AppRoutingModule,
  ],
  providers: [
    // StatusBar,
    // SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    // Custom
    UtilsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
