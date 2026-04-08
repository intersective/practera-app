import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { environment } from '@v3/environments/environment';

export const devOnlyGuard: CanMatchFn = () => {
  if (environment.production) {
    return inject(Router).createUrlTree(['/']);
  }
  return true;
};
