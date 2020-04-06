import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';
import { OverviewRoutingModule } from './overview-routing.module';
import { OverviewComponent } from './overview.component';
import { HomeComponent } from './home/home.component';
import { HomeService } from './home/home.service';
import { TodoCardComponent } from './home/todo-card/todo-card.component';
import { SlidableComponent } from './home/slidable/slidable.component';
import { ProjectComponent } from './project/project.component';
import { FastFeedbackModule } from '../fast-feedback/fast-feedback.module';
import { ProjectService } from './project/project.service';

@NgModule({
  imports: [
    SharedModule,
    OverviewRoutingModule,
    FastFeedbackModule,
  ],
  declarations: [
    HomeComponent,
    TodoCardComponent,
    SlidableComponent,
    ProjectComponent,
    OverviewComponent
  ],
  providers: [
    ProjectService,
    HomeService,
  ],
  exports: [
    RouterModule,
    SharedModule,
    FastFeedbackModule,
    OverviewComponent,
  ],
})
export class OverviewModule { }
