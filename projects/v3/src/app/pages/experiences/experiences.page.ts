import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExperienceService, ProgramObj } from '@v3/services/experience.service';
import { UtilsService } from '@v3/services/utils.service';
import { LoadingController } from '@ionic/angular';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { environment } from '@v3/environments/environment';
import { filter } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { Experience } from '../../services/experience.service';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.page.html',
  styleUrls: ['./experiences.page.scss'],
})
export class ExperiencesPage implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  experiences$: Observable<Experience[]>;
  programs$: Observable<ProgramObj[]>;
  progresses: {
    [key: number]: number;
  } = {};

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private experienceService: ExperienceService,
    public loadingController: LoadingController,
    private notificationsService: NotificationsService,
    private utils: UtilsService,
    private readonly storage: BrowserStorageService,
  ) {
    this.experiences$ = this.experienceService.experiences$;
    this.programs$ = this.experienceService.programsWithProgress$
  }

  ngOnInit() {
    this.subscriptions[0] = this.activatedRoute.params.subscribe(_params => {
      this.experienceService.getExperiences();
    });

    this.subscriptions.push(this.experiences$
      .pipe(filter(experiences => experiences !== null))
      .subscribe(experiences => {
        const ids = experiences.map(experience => experience.projectId);
        this.experienceService.getProgresses(ids).subscribe(res => {
          res.forEach(progress => {
            progress.forEach(project => {
              this.progresses[project.id] = Math.round(progress.progress * 100);
            });
          });
        });
      }));
  }

  ngOnDestroy(): void {
    this.subscriptions[0].unsubscribe();
  }

  async getProgress(projectId: number) {
    return this.experienceService.getProgresses([projectId]).toPromise();
  }

  get isMobile() {
    return this.utils.isMobile();
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
