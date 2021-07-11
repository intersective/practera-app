import { Component, AfterContentChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { RouterEnter } from '@services/router-enter.service';
import { SwitcherService, ProgramObj } from '../switcher.service';
import { LoadingController } from '@ionic/angular';
import { environment } from '@environments/environment';
import { PusherService } from '@shared/pusher/pusher.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { NotificationService } from '@shared/notification/notification.service';
import { UtilsService } from '@services/utils.service';
import { Stack } from '@app/services/storage.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-switcher-program',
  templateUrl: 'switcher-program.component.html',
  styleUrls: ['switcher-program.component.scss']
})

export class SwitcherProgramComponent extends RouterEnter implements AfterContentChecked {
  routeUrl = '/switcher/switcher-program';
  programs: Array<ProgramObj>;
  currentStack: Stack;

  constructor(
    public loadingController: LoadingController,
    public router: Router,
    private pusherService: PusherService,
    private switcherService: SwitcherService,
    private newRelic: NewRelicService,
    private notificationService: NotificationService,
    private utils: UtilsService,
    private activatedRoute: ActivatedRoute,
  ) {
    super(router);
    activatedRoute.data.subscribe(data => {
      this.currentStack = data.stack;
    });
  }

  onEnter() {
    this.newRelic.setPageViewName('program switcher');
    this.switcherService.getPrograms()
      .subscribe(programs => {
        this.programs = programs;
        this._getProgresses(programs);
      });
  }

  ngAfterContentChecked() {
    document.getElementById('page-title').focus();
  }

  private _getProgresses(programs) {
    const projectIds = programs.map(v => v.project.id);
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
