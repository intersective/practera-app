import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PusherConfig, PusherService } from './pusher.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [PusherService],
  exports: [CommonModule]
})
export class PusherModule {
  constructor(@Optional() @SkipSelf() parentModule: PusherModule) {
    if (parentModule) {
      throw new Error(
        'PusherModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(config: PusherConfig): ModuleWithProviders<PusherModule> {
    return {
      ngModule: PusherModule,
      providers: [
        { provide: PusherConfig, useValue: config }
      ]
    };
  }
}
