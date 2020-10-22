import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { RouterEnter } from '@services/router-enter.service';
import { SwitcherService, ProgramObj } from '../switcher.service';
import { LoadingController } from '@ionic/angular';
import { environment } from '@environments/environment';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { NotificationService } from '@shared/notification/notification.service';
import { UtilsService } from '@services/utils.service';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-switcher-program',
  templateUrl: 'switcher-program.component.html',
  styleUrls: ['switcher-program.component.scss']
})

export class SwitcherProgramComponent extends RouterEnter {
  routeUrl = '/switcher/switcher-program';
  programs: Array<ProgramObj>;

  constructor(
    public loadingController: LoadingController,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private switcherService: SwitcherService,
    private newRelic: NewRelicService,
    private notificationService: NotificationService,
    private utils: UtilsService
  ) {
    super(router);
  }

  onEnter() {
    this.newRelic.setPageViewName('program switcher');
    this.activatedRoute.data.subscribe(() => {
      this.subscription = fromPromise(this.switcherService.getPrograms()).subscribe(programs => {
        programs.subscribe(programs => {
          this.programs = Object.values(programs);
          this._getProgresses(programs);
        });
      });
    });
  }

  private _getProgresses(programs) {
    const projectIds = Object.values(programs).map((v: ProgramObj) => v.project.id);
    this.switcherService.getProgresses(projectIds).subscribe(res => {
      res.forEach(progress => {
        const i = this.programs.findIndex(program => program.project.id === progress.id);
        this.programs[i].progress = progress.progress;
        this.programs[i].todoItems = progress.todoItems;
      });
    });
  }

  async switch(index): Promise<void> {
    const nrSwitchedProgramTracer = this.newRelic.createTracer('switching program');
    const loading = await this.loadingController.create({
      message: 'loading...'
    });
    this.newRelic.actionText(`selected ${this.programs[index].program.name}`);

    await loading.present();

    try {
      const route = await this.switcherService.switchProgramAndNavigate(this.programs[index]);
      loading.dismiss().then(() => {
        nrSwitchedProgramTracer();
        this.router.navigate(route);
      });
    } catch (err) {
      await this.notificationService.alert({
        header: 'Error switching program',
        message: err.msg || JSON.stringify(err)
      });

      nrSwitchedProgramTracer();
      this.newRelic.noticeError('switch program failed', JSON.stringify(err));
    }
    return;
  }

}
