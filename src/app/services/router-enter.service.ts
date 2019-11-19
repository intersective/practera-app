import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

export class RouterEnter implements OnInit, OnDestroy {
  subscription: Subscription;
  subscriptions: Subscription[] = [];
  routeUrl: string;

  constructor (
    public router: Router
  ) {}

  ngOnInit() {
    this.subscription = this.router.events.subscribe(event => {
      // invoke the onEnter() function of the component if the routing match
      if (event instanceof NavigationEnd && event.url.includes(this.routeUrl)) {
        // always unsubscribe previously subscribed Observables to prevent duplication subscription
        if (this.subscriptions) {
          this.subscriptions.forEach(sub => sub.unsubscribe());
          this.subscriptions = [];
        }
        this.onEnter();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscriptions) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
    }
  }

  onEnter() {
  }
}
