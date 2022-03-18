import { Component, OnInit } from '@angular/core';
import { AuthService } from '@v3/app/services/auth.service';
import { BrowserStorageService } from '@v3/app/services/storage.service';

@Component({
  selector: 'app-devtool',
  templateUrl: './devtool.page.html',
  styleUrls: ['./devtool.page.scss'],
})
export class DevtoolPage implements OnInit {
  doneLogin: boolean = false;
  user: any = {};


  constructor(
    private authService: AuthService,
    private storageService: BrowserStorageService,
  ) { }

  ngOnInit() {
    this.doneLogin = this.authService.isAuthenticated();
    if (this.doneLogin) {
      this.user = this.storageService.get('me');
    }
  }

  login() {
    this.authService.login({
      email: 'learner_008@practera.com',
      password: 'kW96dLJHrQDaaLM'
    }).subscribe(res => {
      this.doneLogin = true;
      this.user = res;
    });
  }
}
