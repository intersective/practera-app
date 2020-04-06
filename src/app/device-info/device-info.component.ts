import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { UtilsService } from '@services/utils.service';

@Component({
  templateUrl: './device-info.component.html',
})

export class DeviceInfoComponent implements OnInit {
  path: string;
  navigator: any;

  constructor(public platform: Platform, private util: UtilsService) {
    this.navigator = {
      userAgent: null,
      vendor: null,
      appVersion: null,
      platform: null,
      appCodeName: null,
    };
  }

  ngOnInit() {
    this.platform.ready().then(res => {
      console.log(this.platform);
      const {
        isLandscape,
        isRTL,
        isPortrait,
        platforms,
        testUserAgent,
        backButton,
        height,
        getQueryParam,
        url,
        width,
      } = this.platform;

      const navigator = window.navigator;
      this.navigator = {
        userAgent: navigator.userAgent,
        vendor: navigator.vendor,
        appVersion: navigator.appVersion,
        platform: navigator.platform,
        appCodeName: navigator.appCodeName,
      };
    });
  }

  isMobile() {
    return this.util.isMobile();
  }
}
