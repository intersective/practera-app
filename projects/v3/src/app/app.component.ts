import {
  Component,
  OnInit,
  NgZone,
  HostListener,
  OnDestroy,
} from "@angular/core";
import { NavigationEnd, NavigationStart, Router } from "@angular/router";
import { Platform } from "@ionic/angular";
import { SharedService } from "@v3/services/shared.service";
import { environment } from "@v3/environments/environment";
import { BrowserStorageService } from "@v3/services/storage.service";
import { UtilsService } from "@v3/services/utils.service";
import { AuthService } from "@v3/services/auth.service";
import { VersionCheckService } from "@v3/services/version-check.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ComponentCleanupService } from "./services/component-cleanup.service";

@Component({
  standalone: false,
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "v3";
  $unsubscribe = new Subject();
  lastVisitedUrl: string;

  // urls that should not be cached for last visited tracking
  noneCachedUrl = [
    'devtool',
    'registration',
    'register',
    'forgot_password',
    'reset_password',
    'global_login',
    'direct_login',
    'do=secure',
    'auth/secure',
    'auth/jwt',
    'assessment-mobile/review',
    'undefined',
  ];

  constructor(
    private platform: Platform,
    private router: Router,
    private sharedService: SharedService,
    private ngZone: NgZone,
    private storage: BrowserStorageService,
    private utils: UtilsService,
    private authService: AuthService,
    private versionCheckService: VersionCheckService,
    private cleanupService: ComponentCleanupService,
  ) {
    this.initializeApp();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.cleanupService.triggerCleanup();
      }
    });
  }

  ngOnDestroy(): void {
    this.saveAppState();
  }

  @HostListener("window:beforeunload")
  saveAppState(): void {
    if (this.lastVisitedUrl) {
      this.storage.lastVisited("url", this.lastVisitedUrl);
    }
  }

  ngOnInit() {
    this.configVerification();
    this.sharedService.onPageLoad();

    // Set initial lang attribute based on current locale (WCAG 3.1.1)
    this.utils.setPageLanguage();

    const currentLocation = this.utils.getCurrentLocation();

    // Restore branding from storage on page load/refresh.
    // Branding data comes from the GraphQL `auth` query (experience.color, experience.logoUrl)
    // and is stored by switchProgram() in user.colors and user.institutionLogo.
    // Login-app brand params are stored in config.brandColor / config.logo by auth-jwt-login.
    const user = this.storage.getUser();
    const config = this.storage.getConfig();
    const brandColor = user?.colors?.primary || user?.colors?.theme || config.brandColor;
    if (brandColor) {
      this.utils.changeThemeColor({ primary: brandColor });
    }
    if (user?.institutionLogo && !config.logo) {
      this.storage.setConfig({ logo: user.institutionLogo });
    }

    this.router.events
      .pipe(takeUntil(this.$unsubscribe))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const currentUrl = event.urlAfterRedirects;
          if (!this.noneCachedUrl.some((url) => currentUrl.includes(url))) {
            this.lastVisitedUrl = currentUrl;
          }
        }
      });

    this.magicLinkRedirect(currentLocation);
  }

  magicLinkRedirect(currentLocation): Promise<boolean> {
    let searchParams = null;
    let queryString = "";
    if (currentLocation.search) {
      queryString = currentLocation.search.substring(1);
    } else if (currentLocation.hash) {
      queryString = currentLocation.hash.substring(2);
    }
    searchParams = new URLSearchParams(queryString);

    if (searchParams.has("token") && !searchParams.has("do")) {
      const queries = this.utils.urlQueryToObject(queryString);
      return this.navigate([
        "auth",
        "jwt",
        searchParams.get("token"),
        queries,
      ]);
    }

    if (searchParams.has("apikey")) {
      const queries = this.utils.urlQueryToObject(queryString);
      return this.navigate([
        "auth",
        "global_login",
        searchParams.get("apikey"),
        queries,
      ]);
    }

    if (searchParams.has("do")) {
      switch (searchParams.get("do")) {
        case "secure":
          if (searchParams.has("auth_token")) {
            const queries = this.utils.urlQueryToObject(queryString);
            return this.navigate([
              "auth",
              "secure",
              searchParams.get("auth_token"),
              queries,
            ]);
          }
          break;

        case "resetpassword":
          if (searchParams.has("key") && searchParams.has("email")) {
            return this.navigate([
              "auth",
              "reset_password",
              searchParams.get("key"),
              searchParams.get("email"),
            ]);
          }
          break;

        case "registration":
          if (searchParams.has("key") && searchParams.has("email")) {
            return this.authService.logout({}, [
              "auth",
              "registration",
              searchParams.get("email"),
              searchParams.get("key")
            ]);
          }
          break;
      }
    }

    this.redirectToLastVisitedUrl();
  }

  // redirect to the last visited url/assessment if available
  redirectToLastVisitedUrl(): Promise<boolean> {
    if (this.noneCachedUrl.some((url) => window.location?.href?.includes(url))) {
      return; // special urls (login, register, etc.) are already handled by the router
    }

    const lastVisitedUrl = this.storage.lastVisited("url") as string;
    if (lastVisitedUrl) {
      const lastVisitedAssessmentUrl = this.storage.lastVisited("assessmentUrl");
      if (
        (lastVisitedUrl.includes("activity-desktop") ||
          lastVisitedUrl.includes("activity-mobile")) &&
        !this.utils.isEmpty(lastVisitedAssessmentUrl)
      ) {
        this.storage.lastVisited("assessmentUrl", null);
        return this.navigate([lastVisitedAssessmentUrl]);
      }

      this.storage.lastVisited("url", null);
      return this.navigate([lastVisitedUrl]);
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (environment.production) {
        // watch version update
        this.versionCheckService.initiateVersionCheck();
      }
      // initialise Pusher when app loading
      this.sharedService.initWebServices();
    });
  }

  // force every navigation happen under radar of angular
  private navigate(direction): Promise<boolean> {
    return this.ngZone.run(() => {
      return this.router.navigate(direction);
    });
  }

  private configVerification(): void {
    if (this.storage.get("fastFeedbackOpening")) {
      // set default modal status
      this.storage.set("fastFeedbackOpening", false);
    }
  }

  /**
   * Handle skip link clicks for WCAG 2.4.1 compliance
   * Moves focus to the target element or first focusable element within it
   */
  handleSkipLink(event: Event, targetId: string): void {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    // Try to find first focusable element within target
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    const focusableElements = target.querySelectorAll(focusableSelectors);
    const firstFocusable = Array.from(focusableElements).find(
      (el: any) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }
    ) as HTMLElement;

    // Focus first focusable element, or the target itself if it can receive focus
    if (firstFocusable) {
      firstFocusable.focus();
      firstFocusable.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (target instanceof HTMLElement) {
      // Make target focusable temporarily and focus it
      const originalTabIndex = target.getAttribute('tabindex');
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Restore original tabindex after a brief delay
      setTimeout(() => {
        if (originalTabIndex !== null) {
          target.setAttribute('tabindex', originalTabIndex);
        } else {
          target.removeAttribute('tabindex');
        }
      }, 100);
    }
  }
}
