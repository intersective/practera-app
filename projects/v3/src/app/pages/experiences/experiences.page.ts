import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
export class ExperiencesPage implements OnInit {
  subscriptions: Subscription[] = [];
  programs$ = this.experienceService.programsWithProgress$;

  constructor(
    private router: Router,
    private experienceService: ExperienceService,
    public loadingController: LoadingController,
    private notificationsService: NotificationsService,
    private utils: UtilsService,
    private readonly storage: BrowserStorageService,
  ) { }

  ngOnInit() {
    this.experienceService.getPrograms();
  }

  get isMobile() {
    return this.utils.isMobile();
  }

  get instituteLogo() {
    return this.storage.getConfig().instituteLogo;
  }

  async switchProgram(program: ProgramObj) {
    const loading = await this.loadingController.create({
      message: 'loading...'
    });
    await loading.present();

    try {
      const route = await this.experienceService.switchProgramAndNavigate(program);
      loading.dismiss().then(() => {
        if (environment.demo) {
          return this.router.navigate(['v3','home']);
        }
        this.router.navigate(route);
      });
    } catch (err) {
      await this.notificationsService.alert({
        header: 'Error switching program',
        message: err.msg || JSON.stringify(err)
      });
    }
    return this.router.navigate(['v3','home']);
  }

}
