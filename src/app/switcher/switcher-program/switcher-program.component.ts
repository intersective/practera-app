import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
export class SwitcherProgramComponent {
  programs = [
    {
      id: 1,
      name: 'Global Scope'
    },
    {
      id: 2,
      name: 'Next',
      color: '#87ba1a'
    },
    {
      id: 3,
      name: 'Demo Program',
      color: '#d4b92b'
    }
  ];

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {}

	switch(id) {
    // -- todo
    // call API to get program detail
		console.log("Program Choosen, Id: ", id);
    let color = '';
    this.programs.forEach((program) => {
      if (program.id == id) {
        if (program.color) {
          color = program.color;
        }
      }
    });
    if (color) {
      this.changeThemeColor(color);
    }
    this.router.navigate(['/pages/tabs']);
	}

  logout() {
    // -- todo
    // clear local storage data, log user out
    console.log("User logged out");
    this.router.navigate(['/login']);
  }

  changeThemeColor(color) {
    this.document.documentElement.style.setProperty('--ion-color-primary', color);
  }
}