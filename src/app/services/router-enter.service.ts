import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

export class RouterEnter implements OnInit, OnDestroy {
  subscription: Subscription;
  routeUrl: string;

  constructor (
    public router: Router
  ) {}

  ngOnInit() {
    // this.onEnter();
    this.subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && this.allowedRoute(event, this.routeUrl)) {
        this.onEnter();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  /**
   * manually filter route url so we can redirect user to specific page according to
   * our design/workflow strategy
   * @param  {Event}  event       rxjs Event stream
   * @param  {string}  matchingUrl
   * @return {boolean}             true: allow, false: prevent
   */
  private allowedRoute(event, matchingUrl): boolean {
    // tab route can cause double trigger of "onEnter",
    // going to tab needs exact '/app/' match
    if (matchingUrl === '/app/' && event.url !== matchingUrl) {
      return false;
    }

    if (event.url.includes(matchingUrl)) {
      return true;
    }

    return false;
  }

  onEnter() {

  }
}
