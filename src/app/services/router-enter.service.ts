import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

export class RouterEnter implements OnInit, OnDestroy, AfterViewInit {
  subscription: Subscription;
  routeUrl: string;

  constructor (
    public router: Router
  ) {}

  ngOnInit() {
    this.onEnter();
    this.subscription = this.router.events.subscribe(event => {
// console.log(event);
      if (event instanceof NavigationEnd && event.url.includes(this.routeUrl)) {
        this.onEnter();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onEnter() {

  }

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
