import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { OverviewRoutingComponent } from './overview-routing.component';
import { OverviewComponent } from './overview/overview.component';
import { OverviewService } from './overview.service';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: OverviewRoutingComponent,
        children: [
          {
            path: '',
            component: OverviewComponent,
          }
        ]
      },
    ])
  ],
  declarations: [
    OverviewComponent,
    OverviewRoutingComponent,
  ],
  providers: [
    OverviewService,
  ],
  exports: [
    RouterModule,
    SharedModule
  ],
})
export class OverviewModule { }
