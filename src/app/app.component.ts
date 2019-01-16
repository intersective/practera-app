import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform,
    private router: Router,
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    let searchParams = null;
    if (window.location.search) {
      searchParams = new URLSearchParams(window.location.search.substring(1));
    } else if (window.location.hash) {
      searchParams = new URLSearchParams(window.location.hash.substring(2));
    }

    if (searchParams) {
      if (searchParams.has('do')) {
        switch (searchParams.get('do')) {
          case "secure":
            if (searchParams.has('auth_token')) {
              this.router.navigate(['secure', searchParams.get('auth_token')]);
            }
            break;
          case "resetpassword":
            if (searchParams.has('key') && searchParams.has('email')) {
              this.router.navigate(['reset_password', searchParams.get('key'), searchParams.get('email')]);
            }
            break;

          case "registration":
            if (searchParams.has('key') && searchParams.has('email')) {
              this.router.navigate(['registration', searchParams.get('email'), searchParams.get('key') ]);
            }
            break;
        }
      }
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // this.statusBar.styleDefault();
      // this.splashScreen.hide();
    });
  }
}
