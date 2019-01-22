import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Injectable, Inject } from '@angular/core';
import { SwitcherService, ProgramObj } from '../switcher.service';
import { BrowserStorageService } from '@services/storage.service';
import { UtilsService } from '@services/utils.service';
import { RouterEnter } from '@services/router-enter.service';
import { PusherService } from '@shared/pusher/pusher.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-switcher-program',
  templateUrl: 'switcher-program.component.html',
  styleUrls: ['switcher-program.component.scss']
})

export class SwitcherProgramComponent extends RouterEnter {
  routeUrl: string = '/switcher-program';
  programs: Array<ProgramObj>;

  constructor(
    public router: Router,
    private authService: AuthService,
    private switcherService: SwitcherService,
    public utils: UtilsService,
    public storage: BrowserStorageService,
    private pusherService: PusherService
  ) {
    super(router, utils, storage);
  }

  onEnter() {
    this.switcherService.getPrograms()
      .subscribe(programs => {
        this.programs = programs;
      });
  }

  switch(index) {
    this.switcherService.switchProgram(this.programs[index])
      .subscribe(() => {
        let color = this.storage.getUser().themeColor;
        if (color) {
          this.utils.changeThemeColor(color);
        }
        this.pusherService.getChannels().subscribe();
        this.router.navigate(['/app/home']);
      });
  }

  logout() {
    return this.authService.logout();
  }

}
