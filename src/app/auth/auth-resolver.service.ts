import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthResolverService implements Resolve<any> {

  constructor(private authService: AuthService) {}

  resolve(): Observable<any> | Observable<never> {
    let domain = window.location.hostname;
    domain = (domain.indexOf('127.0.0.1') !== -1 || domain.indexOf('localhost') !== -1) ? 'appdev.practera.com' : domain;

    return this.authService.getConfig({domain});
  }
}
