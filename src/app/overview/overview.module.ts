import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { OverviewRoutingComponent } from './overview-routing.component';
import { OverviewComponent } from './overview/overview.component';
import { OverviewService } from './overview.service';
import { ProjectModule } from '../project/project.module';
import { HomeModule } from '../home/home.module';
import { HomeComponent } from '../home/home.component';
import { ProjectComponent } from '../project/project.component';

@NgModule({
  imports: [
    HomeModule,
    SharedModule,
    ProjectModule,
    RouterModule.forChild([
      {
        path: '',
        component: OverviewRoutingComponent,
        children: [
          {
            path: '',
            component: HomeComponent,
            outlet: 'home',
          },
          {
            path: '',
            component: ProjectComponent,
            outlet: 'project',
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
