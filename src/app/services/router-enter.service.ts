import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';

export class RouterEnter implements OnInit {
  subscription: Subscription;
  routeUrl: string;

  constructor (
    public router: Router,
    public utils: UtilsService,
    public storage: BrowserStorageService
  ) {}

  ngOnInit() {
    this.onEnter();
    // check and change theme color on every page refresh
    this._changeThemeColor();
    this.subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url.includes(this.routeUrl)) {
        this._changeThemeColor();
        this.onEnter();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private _changeThemeColor() {
    let color = this.storage.getUser().themeColor;
    if (color) {
      this.utils.changeThemeColor(color);
    }
  }

  onEnter() {

  }
}
