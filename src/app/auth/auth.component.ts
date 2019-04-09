import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilsService } from '@services/utils.service';
import { BrowserStorageService } from '@services/storage.service';


@Component({
  selector: 'app-auth',
  template: '<ion-router-outlet></ion-router-outlet>'
})
export class AuthComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private storage: BrowserStorageService,
    private utils: UtilsService
  ) {}

  ngOnInit() {
    this.route.data
      .subscribe((response: any) => {
        try {
          const expConfig = (response.config || {}).data;
          if (expConfig.length > 0) {
            this.storage.setUser({
              'logo': expConfig[0].logo,
              'themeColor': expConfig[0].config.theme_color
            });
          }
        } catch (err) {
          console.log('Inconsistent Experince config.');
          throw err;
        }
      });
  }
}
