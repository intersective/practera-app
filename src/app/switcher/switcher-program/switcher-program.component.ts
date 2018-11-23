import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { BrowserStorageService } from '@services/storage.service';
import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-switcher-program',
  templateUrl: 'switcher-program.component.html',
  styleUrls: ['switcher-program.component.css']
})
export class SwitcherProgramComponent implements OnInit{
  timelines = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private storage: BrowserStorageService,
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  ngOnInit() {
    this.timelines = this.storage.get('timelines');
  }

	switch(id) {
    // -- todo
    // call API to get program detail
		console.log("Program Choosen, Id: ", id);
    let color = '';
    this.timelines.forEach((program) => {
      if (program.id == id) {
        if (program.color) {
          color = program.color;
        }
      }
    });
    if (color) {
      this.changeThemeColor(color);
    }
    this.router.navigate(['/app']);
	}

  logout() {
    // @TODO: clear local storage data, log user out
    return this.authService.logout().subscribe(() => {
      console.log("User logged out");
      return this.router.navigate(['/login']);
    });
  }

  changeThemeColor(color) {
    this.document.documentElement.style.setProperty('--ion-color-primary', color);
  }
}