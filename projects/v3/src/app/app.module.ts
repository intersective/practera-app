import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RequestInterceptor } from '@app/shared/request/request.interceptor';
import { IonicModule } from '@ionic/angular';
import { environment } from '@v3/environments/environment';
import { ApolloModule } from 'apollo';
import { RequestModule } from 'request';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IonicModule.forRoot(),
    ApolloModule.forRoot({
      endpoint: environment.graphQL
    }),
    RequestModule.forRoot({
      appkey: environment.appkey,
      prefixUrl: environment.APIEndpoint,
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
