import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Injectable, Inject } from '@angular/core';
import { SwitcherService, ProgramObj } from '../switcher.service';
import { RouterEnter } from '@services/router-enter.service';
import { LoadingController } from '@ionic/angular';
import { environment } from '@environments/environment';
import { PusherService } from '@shared/pusher/pusher.service';
import { NewRelicService } from '@shared/new-relic/new-relic.service';
import { NotificationService } from '@shared/notification/notification.service';

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
    public router: Router,
    public loadingController: LoadingController,
    private authService: AuthService,
    private pusherService: PusherService,
    private switcherService: SwitcherService,
    private newRelic: NewRelicService,
    private notificationService: NotificationService
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

    return this.switcherService.switchProgram(this.programs[index]).subscribe(
      () => {
        loading.dismiss().then(() => {
          // reset pusher (upon new timelineId)
          this.pusherService.initialise({ unsubscribe: true });
          nrSwitchedProgramTracer();
          if ((typeof environment.goMobile !== 'undefined' && environment.goMobile === false)
            || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            return this.router.navigate(['app', 'home']);
          } else {
            return this.router.navigate(['go-mobile']);
          }
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
      }
    );
  }

  logout() {
    return this.authService.logout();
  }

}
