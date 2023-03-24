import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExperienceService, ProgramObj } from '@v3/services/experience.service';
import { UtilsService } from '@v3/services/utils.service';
import { LoadingController } from '@ionic/angular';
import { NotificationsService } from '@v3/services/notifications.service';
import { BrowserStorageService } from '@v3/services/storage.service';
import { environment } from '@v3/environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.page.html',
  styleUrls: ['./experiences.page.scss'],
})
export class ExperiencesPage implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  programs$ = this.experienceService.programsWithProgress$;
  latestPrograms = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private experienceService: ExperienceService,
    public loadingController: LoadingController,
    private notificationsService: NotificationsService,
    private utils: UtilsService,
    private readonly storage: BrowserStorageService,
  ) { }

  ngOnInit() {
    this.subscriptions[0] = this.activatedRoute.params.subscribe(_params => {
      this.experienceService.getPrograms();
    });
    this.subscriptions[1] = this.programs$.subscribe(programs => {
      this.latestPrograms = programs;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions[0].unsubscribe();
  }

  ionViewDidEnter() {
    const projectIds = this.latestPrograms.map(program => program.project.id);
    this.experienceService.getProgresses(projectIds).subscribe(res => {
      console.log('asd', res);
    });
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
