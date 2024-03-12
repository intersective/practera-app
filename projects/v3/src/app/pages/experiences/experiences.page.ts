import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExperienceService, ProgramObj } from '@v3/services/experience.service';
import { UtilsService } from '@v3/services/utils.service';
import { LoadingController } from '@ionic/angular';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { environment } from '@v3/environments/environment';
import { filter, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { UnlockIndicatorService } from '@v3/app/services/unlock-indicator.service';

@Component({
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
    this.activatedRoute.params
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(_params => {
      this.experienceService.getExperiences();
    });

    this.experiences$
    .pipe(
      filter(experiences => experiences !== null),
      takeUntil(this.unsubscribe$)
    )
    .subscribe(experiences => {
      const ids = experiences.map(experience => experience.projectId);
      this.experienceService.getProgresses(ids).subscribe(res => {
        res.forEach(progress => {
          if (!Array.isArray(progress)) {
            this.progresses[progress.id] = Math.round(progress.progress * 100);
            return;
          }

          progress.forEach(project => {
            this.progresses[project.id] = Math.round(project.progress * 100);
          });
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

  async switchProgram(program: ProgramObj, keyEvent?: KeyboardEvent) {
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
      const route = await this.experienceService.switchProgramAndNavigate(program);
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
