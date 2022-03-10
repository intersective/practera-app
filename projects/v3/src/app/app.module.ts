import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { environment } from '@v3/environments/environment';
import { RequestModule } from 'request';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IonicModule.forRoot(),
    ComponentsModule,
    RequestModule.forRoot({
      appkey: environment.appkey,
      prefixUrl: environment.APIEndpoint,
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
