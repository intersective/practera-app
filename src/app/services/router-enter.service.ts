import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

export class RouterEnter implements OnInit, OnDestroy {
  routerEvents: Subscription;
  subscription: Subscription;
  routeUrl: string;

  constructor (
    public router: Router
  ) {}

  ngOnInit() {
    this.routerEvents = this.router.events.subscribe(res => {
      if (res instanceof NavigationEnd) {
        if (res.url.indexOf(this.routeUrl) === 0) {
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
