import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-switcher',
  templateUrl: 'auth-switcher.component.html',
  styleUrls: ['auth-switcher.component.css']
})
export class AuthSwitcherComponent {
  programs = [
    {
      id: 1,
      name: 'Global Scope'
    },
    {
      id: 2,
      name: 'Next'
    },
    {
      id: 3,
      name: 'Demo Program'
    }
  ];

  constructor(
    private router: Router
  ) {}

	switch(id) {
    // -- todo
    // call API to get program detail
		console.log("Program Choosen, Id: ", id);
    this.router.navigate(['/pages/tabs']);
	}

  logout() {
    // -- todo
    // clear local storage data, log user out
    console.log("User logged out");
    this.router.navigate(['/login']);
  }
}