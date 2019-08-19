import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

export class RouterEnter implements OnInit, OnDestroy, AfterViewInit {
  routerEvents: Subscription;
  subscription: Subscription;
  routeUrl: string;

  constructor (
    public router: Router
  ) {}

  ngOnInit() {
    this.onEnter();
    this.routerEvents = this.router.events.subscribe(res => {
      if (res instanceof NavigationEnd) {
        if (res.url === this.routeUrl) {
        // if (res.url.includes(this.routeUrl)) {
          this.onEnter();
        } else {
          this.unsubscribeAll();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.routerEvents.unsubscribe();
  }

  onEnter() {}

  unsubscribeAll() {}

  ngAfterViewInit() {
    console.log('ngAfterViewInit');
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter');
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
  }
}
