import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Injectable, Inject } from '@angular/core';
import { SwitcherService, ProgramObj } from '../switcher.service';
import { BrowserStorageService } from '@services/storage.service';
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
    private router: Router,
    private authService: AuthService,
    private switcherService: SwitcherService,
    private utils: UtilsService,
    private storage: BrowserStorageService
  ) {
  }

  ngOnInit() {
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
        this.router.navigate(['/app']);
      });
  }

  logout() {
    return this.authService.logout().subscribe(() => {
      return this.router.navigate(['/login']);
    });
  }

}