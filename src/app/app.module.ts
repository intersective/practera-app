import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { RequestModule } from '@shared/request/request.module';
import { NotificationModule } from '@shared/notification/notification.module';
import { AuthModule } from './auth/auth.module';
import { TabsModule } from './tabs/tabs.module';
import { AppComponent } from './app.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { UtilsService } from './services/utils.service';
//import { PopUpComponent } from './components/pop-up/pop-up.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ActivityCardModule } from './components/activity-card/activity-card.module';

@NgModule({
  declarations: [
    AppComponent,
    //PopUpComponent,
    AppComponent,
    PageNotFoundComponent,
    
  ],
 

  imports: [
  	BrowserModule, 
    TabsModule,
  	IonicModule.forRoot(), 
    RequestModule.forRoot({ 
      appkey: 'b11e7c189b',
      prefixUrl: 'https://sandbox.practera.com/',
    }),

    AppRoutingModule,
    NgCircleProgressModule,
    ActivityCardModule,
    NotificationModule,
    AuthModule
 
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    // Custom
    UtilsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
