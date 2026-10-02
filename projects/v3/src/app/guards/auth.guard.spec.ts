import { AuthGuard } from './auth.guard';
import { environment } from '@v3/environments/environment';

describe('AuthGuard critical journeys', () => {
  it('redirects an unauthenticated learner instead of loading protected pages', () => {
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const service = jasmine.createSpyObj('AuthService', { isAuthenticated: false });
    const guard = new AuthGuard(service, router);
    const original = environment.demo;
    environment.demo = false;
    try {
      expect(guard.checkLogin()).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['auth', 'login']);
    } finally { environment.demo = original; }
  });
  it('allows an authenticated learner without redirecting', () => {
    const router = jasmine.createSpyObj('Router', ['navigate']);
    const guard = new AuthGuard(jasmine.createSpyObj('AuthService', { isAuthenticated: true }), router);
    expect(guard.checkLogin()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
