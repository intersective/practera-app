import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExperienceService, Experience, ProgramObj } from '@v3/services/experience.service';
import { UtilsService } from '@v3/services/utils.service';
import { LoadingController } from '@ionic/angular';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { environment } from '@v3/environments/environment';
import { filter, takeUntil } from 'rxjs/operators';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';
import { Subject, Observable } from 'rxjs';

/** Darken a 6-digit hex color by reducing each channel by `amount` (0–255). */
function darkenHex(hex: string, amount = 40): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return hex;
  const r = Math.max(0, parseInt(clean.slice(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(clean.slice(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(clean.slice(4, 6), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

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
  unsubscribe$: Subject<void> = new Subject<void>();
  /** Tracks experiences whose lead image failed to load (keyed by experience.uuid). */
  imgErrors = new Set<string>();

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

  // display experience tile in compact UI
  isCompactLayout(experienceCount: number): boolean {
    return experienceCount <= 2;
  }

  get instituteLogo() {
    return this.storage.getConfig().logo || this.storage.getUser()?.institutionLogo;
  }

  /** Called when an experience lead image fails to load. */
  onImgError(uuid: string): void {
    this.imgErrors.add(uuid);
  }

  /**
   * CSS gradient for a card's background, derived from the experience's own brand colors.
   * Used as the card background so it shows instantly (no image round-trip) and acts
   * as the fallback when the lead image URL fails to load.
   */
  cardBackground(experience: Experience): string {
    const primary   = experience.color         || '#008296'; // Ocean brand default
    const secondary = experience.secondaryColor || darkenHex(primary, 40);
    return `linear-gradient(135deg, ${primary}, ${secondary})`;
  }

  async switchProgram(experience: ProgramObj, keyEvent?: KeyboardEvent) {
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
    }

    return this.router.navigate(destination);
  }
}
