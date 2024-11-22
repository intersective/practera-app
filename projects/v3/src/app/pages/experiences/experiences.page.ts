import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExperienceService, ProgramObj } from '@v3/services/experience.service';
import { UtilsService } from '@v3/services/utils.service';
import { LoadingController } from '@ionic/angular';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { environment } from '@v3/environments/environment';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';
import { Subject, Observable, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.page.html',
  styleUrls: ['./experiences.page.scss'],
})
export class ExperiencesPage implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  experiences$: Observable<any[]>;
  programs$: Observable<ProgramObj[]>;
  progresses: {
    [key: number]: number;
  } = {};
  isMobile: boolean = false;
  unsubscribe$ = new Subject();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private experienceService: ExperienceService,
    private loadingController: LoadingController,
    private notificationsService: NotificationsService,
    private utils: UtilsService,
    private storage: BrowserStorageService,
    private unlockIndicatorService: UnlockIndicatorService,
  ) {
    this.experiences$ = this.experienceService.experiences$;
    this.programs$ = this.experienceService.programsWithProgress$;
  }

  ngOnInit() {
    this.activatedRoute.params.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe(_params => {
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
          res.forEach(progress => {
            if (Array.isArray(progress)) {
              progress.forEach(project => {
                this.progresses[project.id] = Math.round(project.progress * 100);
              });
              return;
            }

            // single progress objects
            this.progresses[progress.id] = Math.round(progress.progress * 100);
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

  get instituteLogo() {
    return this.storage.getConfig().instituteLogo;
  }

  async switchProgram(experience: ProgramObj, keyEvent?: KeyboardEvent) {
    if (keyEvent && (keyEvent.code === 'Enter' || keyEvent.code === 'Space')) {
      keyEvent.preventDefault();
    } else if (keyEvent) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'loading...'
    });
    await loading.present();

    try {
      this.unlockIndicatorService.clearAllTasks(); // reset indicators
      const route = await this.experienceService.switchProgramAndNavigate(experience);
      loading.dismiss().then(() => {
        if (environment.demo) {
          return this.router.navigate(['v3','home']);
        }
        if (route) {
          return this.router.navigate(route);
        }
      });
    } catch (err) {
      await this.notificationsService.alert({
        header: $localize`Error switching program`,
        message: err.msg || JSON.stringify(err)
      });
    }
    return this.router.navigate(['v3','home']);
  }
}
