import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SwitcherService, ProgramObj } from '../switcher.service';

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
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  ngOnInit() {
    this.switcherService.getPrograms()
      .subscribe(programs => {
        this.programs = programs;
      });
  }

	switch(index) {
    let color:string = '';
    if (this.programs[index].program.color) {
      color = this.programs[index].program.color;
    }
    if (color) {
      this.changeThemeColor(color);
    }
    this.switcherService.switchProgram(this.programs[index])
      .subscribe(() => {
        this.router.navigate(['/app']);
      });
	}

  logout() {
    return this.authService.logout().subscribe(() => {
      return this.router.navigate(['/login']);
    });
  }

  changeThemeColor(color) {
    this.document.documentElement.style.setProperty('--ion-color-primary', color);
  }
}