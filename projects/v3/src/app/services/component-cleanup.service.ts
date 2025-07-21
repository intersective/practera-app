import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ComponentCleanupService {
  private cleanupSubject = new Subject<void>();
  cleanup$ = this.cleanupSubject.asObservable();

  triggerCleanup() {
    this.cleanupSubject.next();
  }
}
