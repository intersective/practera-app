import { AppComponent } from './app.component';

describe('AppComponent token handoff', () => {
  it('moves the token to session storage and excludes it from route parameters and history', async () => {
    const app = Object.create(AppComponent.prototype) as AppComponent;
    const router = jasmine.createSpyObj('Router', { navigate: Promise.resolve(true) });
    (app as any).router = router;
    (app as any).ngZone = { run: (callback: () => unknown) => callback() };
    (app as any).utils = { urlQueryToObject: (query: string) => Object.fromEntries(new URLSearchParams(query)) };
    const historySpy = spyOn(history, 'replaceState');
    try {
      await app.magicLinkRedirect({ search: '?token=synthetic-token&redirect=home&tl=11', pathname: '/' });
      expect(sessionStorage.getItem('pending_jwt_token')).toBe('synthetic-token');
      expect(router.navigate).toHaveBeenCalledWith(['auth', 'jwt', { redirect: 'home', tl: '11' }]);
      expect(historySpy).toHaveBeenCalledWith(null, '', window.location.pathname);
    } finally { sessionStorage.removeItem('pending_jwt_token'); }
  });
});
