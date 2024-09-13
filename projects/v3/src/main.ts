import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from '@v3/environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/ngsw-worker.js').then(registration => {
      // eslint-disable-next-line no-console
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      // eslint-disable-next-line no-console
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
