import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { ApolloService } from './apollo.service';

export class ApolloConfig {
  endpoint: string;
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  providers: [
    ApolloService
  ]
})
export class ApolloModule {
  constructor(@Optional() @SkipSelf() parentModule: ApolloModule) {
    if (parentModule) {
      throw new Error(
        'ApolloModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(config: ApolloConfig): ModuleWithProviders<ApolloModule> {
    return {
      ngModule: ApolloModule,
      providers: [
        {
          provide: ApolloConfig, useValue: config
        }
      ]
    }
  }
}
