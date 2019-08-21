import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

export class RouterEnter implements OnInit, OnDestroy {
  routerEvents: Subscription;
  subscription: Subscription;
  routeUrl: string;

  private requireOnce = {
    '/app/': false,
  };

  constructor (
    public router: Router
  ) {}

  ngOnInit() {
    // if (!this.requireOnce[this.routeUrl]) {
      this.onEnter();
    // }

    this.routerEvents = this.router.events.subscribe(res => {
      if (res instanceof NavigationEnd) {
      console.log(this);
        if (
          (this.routeUrl !== '/app/' && res.url !== '/app/' && res.url.indexOf(this.routeUrl) === 0) ||
          res.url === '/app/' && this.routeUrl === '/app/'
        ) {
        // if (res.url.indexOf(this.routeUrl) === 0) {
        // if (res.url.includes(this.routeUrl) && this.router.isActive(this.routeUrl, false)) {
          this.onEnter();
        } else {
          this.unsubscribeAll();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.routerEvents.unsubscribe();
  }

  onEnter() {
    console.log('onEnter placeholder');
  }

  unsubscribeAll() {}

  ionViewWillEnter() {
    console.log('ionViewWillEnter', this.routeUrl);
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave', this.routeUrl);
  }
}
