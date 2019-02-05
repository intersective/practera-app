import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Injectable, Inject } from '@angular/core';
import { SwitcherService, ProgramObj } from '../switcher.service';
import { RouterEnter } from '@services/router-enter.service';

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
    private authService: AuthService,
    private switcherService: SwitcherService,
  ) {}

  ngOnInit() {
    this.switcherService.getPrograms()
      .subscribe(programs => {
        this.programs = programs;
      });
  }

  switch(index) {
    this.switcherService.switchProgram(this.programs[index])
      .subscribe(() => {
        this.router.navigate(['/app/home']);
      });
  }

  logout() {
    return this.authService.logout();
  }

}
