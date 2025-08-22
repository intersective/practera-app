import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationStateService {
  private navigationSource$ = new BehaviorSubject<string | null>(null);
  
  setNavigationSource(source: string) {
    this.navigationSource$.next(source);
  }
  
  getNavigationSource(): string | null {
    return this.navigationSource$.value;
  }
  
  clearNavigationSource() {
    this.navigationSource$.next(null);
  }
  
  isFromSource(source: string): boolean {
    return this.getNavigationSource() === source;
  }
}
