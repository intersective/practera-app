import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Injectable, Inject } from '@angular/core';
import { SwitcherService, ProgramObj } from '../switcher.service';
import { RouterEnter } from '@services/router-enter.service';
import { LoadingController } from '@ionic/angular';
import { environment } from '@environments/environment';
import { PusherService } from '@shared/pusher/pusher.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { NotificationService } from '@shared/notification/notification.service';
import { UtilsService } from '@services/utils.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-switcher-program',
  templateUrl: 'switcher-program.component.html',
  styleUrls: ['switcher-program.component.scss']
})

export class SwitcherProgramComponent implements OnInit {
  programs: Array<ProgramObj>;

  constructor(
    public loadingController: LoadingController,
    public router: Router,
    private pusherService: PusherService,
    private switcherService: SwitcherService,
    private newRelic: NewRelicService,
    private notificationService: NotificationService,
    private utils: UtilsService
  ) {}

  ngOnInit() {
    this.newRelic.setPageViewName('program switcher');
    this.switcherService.getPrograms()
      .subscribe(programs => {
        this.programs = programs;
      });
  }

  async switch(index) {
    const nrSwitchedProgramTracer = this.newRelic.createTracer('switching program');
    this.newRelic.actionText(`selected ${this.programs[index].program.name}`);
    const loading = await this.loadingController.create({
      message: 'loading...'
    });

    await loading.present();

    this.switcherService.switchProgramAndNavigate(this.programs[index]).then(
    (route) => {
      loading.dismiss().then(() => {
        nrSwitchedProgramTracer();
        this.router.navigate(route);
      });
    },
    err => {
      const toasted = this.notificationService.alert({
        header: 'Error switching program',
        message: err.msg || JSON.stringify(err)
      });

      nrSwitchedProgramTracer();
      this.newRelic.noticeError('switch program failed', JSON.stringify(err));
      throw new Error(err);
    });
  }

}
