import { Injectable } from '@angular/core';
import { RequestService } from '@shared/request/request.service';
import { tap, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { of, BehaviorSubject, Subscription } from 'rxjs';

export const APIs = {
  preference: 'https://4d052q3ph6.execute-api.ap-southeast-2.amazonaws.com/notify',
};

export interface PreferenceOption {
  name: string;
  medium: string;
  value: boolean;
  locked: boolean;
  locked_name: string;
}

export interface Preference {
  key: string;
  name: string;
  description: string;
  remarks?: string;
  options?: PreferenceOption[];
}

export interface Category {
  name: string;
  order: number;
  preferences: Preference[];
}

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {
  private _preferences$ = new BehaviorSubject<any>({});

  preference$ = this._preferences$.asObservable();

  constructor(private request: RequestService) { }

  getPreference(): Subscription {
    return this.request.post(APIs.preference, {}).pipe(
      distinctUntilChanged(),
      tap(res => {
        this._preferences$.next(res);
      })
    ).subscribe();
  }
}
