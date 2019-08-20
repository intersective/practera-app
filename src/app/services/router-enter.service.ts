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
        if (res.url.indexOf(this.routeUrl) === 0) {
        // if (res.url.includes(this.routeUrl) && this.router.isActive(this.routeUrl, false)) {
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

  onEnter() {
    console.log('onEnter placeholder');
  }

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
