import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SharedService } from '@v3/services/shared.service';
import { Observable } from 'rxjs';
import { environment } from '@v3/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'v3';

  constructor(
    private platform: Platform,
    private router: Router,
    private sharedService: SharedService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // if (environment.production) {
      //   // watch version update
      //   this.versionCheckService.initiateVersionCheck();
      // }
      // initialise Pusher when app loading
      this.sharedService.initWebServices();
    });
  }

}
