import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewRelicService } from './new-relic.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [NewRelicService],
  exports: [CommonModule]
})
export class NewRelicModule {
  constructor(@Optional() @SkipSelf() parentModule: NewRelicModule) {
    if (parentModule) {
      throw new Error(
        'NewRelicModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: NewRelicModule,
    };
  }
}
