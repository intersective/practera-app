import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { EmbedVideoService } from './ngx-embed-video.service';

@NgModule({
  declarations: [
  ],
  imports: [
  ],
  providers: [
    EmbedVideoService
  ],
  exports: [
  ],
})
export class EmbedVideoModule {
  constructor(@Optional() @SkipSelf() parentModule: EmbedVideoModule) {
    if (parentModule) {
      throw new Error('EmbedVideoModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(): ModuleWithProviders<EmbedVideoModule> {
    return {
      ngModule: EmbedVideoModule,
      providers: [ EmbedVideoService ],
    };
  }
}
