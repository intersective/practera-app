import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { PusherService } from '@shared/pusher/pusher.service';

export class RouterEnter implements OnInit {
  subscription: Subscription;
  routeUrl: string;

  constructor (
    public router: Router,
    public utils: UtilsService,
    public storage: BrowserStorageService,
    public pusherService: PusherService
  ) {}

  ngOnInit() {
    this.onEnter();
    this.onPageLoad();
    this.subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url.includes(this.routeUrl)) {
        this.onEnter();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // call this function on every page refresh
  onPageLoad() {
    // check and change theme color on every page refresh
    let color = this.storage.getUser().themeColor;
    if (color) {
      this.utils.changeThemeColor(color);
    }
    let image = this.storage.getUser().activityCardImage;
    if (image) {
      this.utils.changeCardBackgroundImage(image);
    }
    // initialise Pusher
    this.pusherService.initialisePusher();
    // subscribe to Pusher channels
    this.pusherService.getChannels().subscribe();
  }

  onEnter() {

  }
}
