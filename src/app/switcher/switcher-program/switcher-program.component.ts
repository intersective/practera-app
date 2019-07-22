import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Injectable, Inject } from '@angular/core';
import { SwitcherService, ProgramObj } from '../switcher.service';
import { RouterEnter } from '@services/router-enter.service';
import { LoadingController } from '@ionic/angular';
import { environment } from '@environments/environment';
import { PusherService } from '@shared/pusher/pusher.service';

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
    private authService: AuthService,
    private pusherService: PusherService,
    private switcherService: SwitcherService,
  ) {}

  ngOnInit() {
    this.switcherService.getPrograms()
      .subscribe(programs => {
        this.programs = programs;
      });
  }

  async switch(index) {
    const loading = await this.loadingController.create({
      message: 'loading...'
    });

    await loading.present();

    return this.switcherService.switchProgram(this.programs[index]).subscribe(() => {
      loading.dismiss().then(() => {
        // reset pusher (upon new timelineId)
        this.pusherService.initantiate({ unsubscribe: true });

        if ((typeof environment.goMobile !== 'undefined' && environment.goMobile === false)
          || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          return this.router.navigate(['/app/home']);
        } else {
          return this.router.navigate(['/go-mobile']);
        }
      });
    });
  }

  logout() {
    return this.authService.logout();
  }

}
