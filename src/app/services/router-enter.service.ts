import { OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { BrowserStorageService } from './storage.service';
import { UtilsService } from './utils.service';
import { environment } from 'environments/environment';

export class RouterEnter implements OnInit, OnDestroy {
  subscription: Subscription;
  subscriptions: Subscription[] = [];
  routeUrl: string; // static (partial/prefix) url defined in child class
  routeUrls: string[];

  constructor (
    public router: Router,
    private storage: BrowserStorageService,
    private utils: UtilsService,
  ) {}

  /**
   * @description
   * this ngOnInit() is designed for enforcing the invoke of onEnter()
   * on every url changes, those new url with "/app/" prefix must invoke 2 onEnter()
   * from different component
   * (particularly on screen stacked with multiple layers of different components)
   *
   * 1. onEnter() of TabComponent - routerUrl "/app/"
   * 2. onEnter() of the related url's component class - depend on what is
   *   available in the relative url
   *
   * @example
   * let's take RouterEnter as parent class of following components
   *   URL: `/app/project`
   *     - TabComponent.onEnter()
   *     - ProjectComponent.onEnter()
   *   URL: `/app/assessment/assessment/123/123`
   *     - TabComponent.onEnter()
   *     - AssessmentComponent.onEnter()
   *   URL: `/events/any-route`
   *     - EventComponent.onEnter()
   *   URL: `/switcher/switcher-program`
   *     - SwitcherProgramComponent.onEnter()
   *   URL: `/bad-url`
   *     - PageNotFoundComponent.onEnter()
   *
   * @returns void
   */
  ngOnInit() {
    this.subscription = this.router.events.subscribe(event => {
      const appV3Activated = this.storage.getAppV3();
      if (appV3Activated === true) {
        return this.utils.redirectToUrl(`${environment.appv3URL}?apikey=${this.storage.get('apikey')}`);
      }
      // invoke the onEnter() function of the component if the routing match current page view and stacked components' routeUrl
      if (event instanceof NavigationEnd && this._itIsMyRoute(event.url)) {
        // always unsubscribe previously subscribed Observables to prevent duplicating subscription
        if (this.subscriptions) {
          this.subscriptions.forEach(sub => sub.unsubscribe());
          this.subscriptions = [];
        }
        this.onEnter();
      }
    });
  }

  private _itIsMyRoute(eventUrl: string) {
    if (this.routeUrl && eventUrl.includes(this.routeUrl)) {
      return true;
    }
    if (this.routeUrls) {
      for (const routeUrl of this.routeUrls) {
        if (eventUrl.includes(routeUrl)) {
          return true;
        }
      }
    }
    return false;
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
