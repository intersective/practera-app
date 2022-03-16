import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';

import { RequestConfig } from './request.service';
import { RequestService } from './request.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule,
  ],
  providers: [
    RequestService,
  ],
  exports: [
    HttpClientModule,
  ],
})
export class RequestModule {
  constructor(@Optional() @SkipSelf() parentModule: RequestModule) {
    if (parentModule) {
      throw new Error(
        'RequestModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(config: RequestConfig): ModuleWithProviders<RequestModule> {
    return {
      ngModule: RequestModule,
      providers: [
        { provide: RequestConfig, useValue: config },
        RequestService
      ]
    };
  }
}
