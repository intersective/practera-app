import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExperienceService, ProgramObj } from '@v3/services/experience.service';
import { UtilsService } from '@v3/services/utils.service';
import { LoadingController } from '@ionic/angular/lazy';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { environment } from '@v3/environments/environment';
import { filter, takeUntil } from 'rxjs/operators';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';
import { firstValueFrom, Observable, Subject } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-experiences',
  templateUrl: './experiences.page.html',
  styleUrls: ['./experiences.page.scss'],
})
export class ExperiencesPage implements OnInit, OnDestroy {
  experiences$: Observable<any[]>;
  programs$: Observable<ProgramObj[]>;
  progresses: {
    [key: number]: number;
  } = {};
  isMobile: boolean = false;
  redirectingToHome = false;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private experienceService: ExperienceService,
    private loadingController: LoadingController,
    private notificationsService: NotificationsService,
    private utils: UtilsService,
    private storage: BrowserStorageService,
    private unlockIndicatorService: UnlockIndicatorService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {
    this.experiences$ = this.experienceService.experiences$;
    this.programs$ = this.experienceService.programsWithProgress$;
  }

  ngOnInit() {
    this.utils.setPageTitle('Experiences - Practera');
    this.activatedRoute.params
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(_params => {
      this.experienceService.getExperiences();
    });

    this.experiences$
      .pipe(
        filter(experiences => experiences !== null),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(experiences => {
        // A single experience has nothing to choose, so enter it and leave this page.
        if (this.redirectingToHome) {
          return;
        }
        if (!environment.demo && experiences.length === 1) {
          this.redirectingToHome = true;
          void this.enterOnlyExperience(experiences);
          return;
        }

        this.trackProgress(experiences);
      });

    this.isMobile = this.utils.isMobile();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async getProgress(projectId: number) {
    return this.experienceService.getProgresses([projectId]).toPromise();
  }

  private async enterOnlyExperience(experiences: any[]): Promise<void> {
    try {
      const navigated = await this.switchProgram(experiences[0], undefined, { replaceUrl: true });
      if (navigated) {
        return;
      }
    } catch (err) {
      console.error('Error opening the only experience', err);
    }

    this.redirectingToHome = false;
    this.trackProgress(experiences);
    this.cdr.markForCheck();
  }

  private trackProgress(experiences: any[]): void {
    const ids = experiences.map(experience => experience.projectId);
    this.experienceService.getProgresses(ids).subscribe(res => {
      this.ngZone.run(() => {
        res.forEach(progress => {
          if (Array.isArray(progress)) {
            progress.forEach(project => {
              this.progresses[project.id] = Math.round(project.progress * 100);
            });
            return;
          }
          this.progresses[progress.id] = Math.round(progress.progress * 100);
        });
        this.cdr.markForCheck();
      });
    });
  }

  // display experience tile in compact UI
  isCompactLayout(experienceCount: number): boolean {
    return experienceCount <= 2;
  }

  get instituteLogo() {
    return this.storage.getConfig().logo || this.storage.getUser()?.institutionLogo;
  }

  async switchProgram(
    experience: ProgramObj,
    keyEvent?: KeyboardEvent,
    navigationExtras?: { replaceUrl?: boolean },
  ) {
    if (keyEvent && (keyEvent.code === 'Enter' || keyEvent.code === 'Space')) {
      keyEvent.preventDefault();
    } else if (keyEvent) {
      return;
    }

    let destination = ['v3', 'home'];
    const loading = await this.loadingController.create({
      message: $localize`loading...`
    });
    await loading.present();
    try {
      this.unlockIndicatorService.clearAllTasks(); // reset indicators
      const route = await this.experienceService.switchProgramAndNavigate(experience);

      try {
        await firstValueFrom(this.notificationsService.refreshNotifications());
      } catch (refreshError) {
        // The experience switch succeeded, so do not restore notifications
        // from the previous project or block navigation when refreshing fails.
        console.error('Error refreshing notifications after switching experience', refreshError);
      }

      await loading.dismiss();
      if (environment.demo) {
        destination = ['v3','home'];
      }

      if (route) {
        destination = route;
      }
    } catch (err) {
      await this.notificationsService.alert({
        header: $localize`Error switching program`,
        message: err.msg || JSON.stringify(err)
      });
      // Automatic entry must not navigate away. Home would bounce back here
      // when no experience was selected, and this page would try again.
      if (navigationExtras?.replaceUrl) {
        await loading.dismiss();
        return false;
      }
    }

    return this.router.navigate(destination, {
      replaceUrl: !!navigationExtras?.replaceUrl,
    });
  }
}
