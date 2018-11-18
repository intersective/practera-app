import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectComponent } from './project.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { MilestoneService } from './project.service';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    NgCircleProgressModule.forRoot({
      "outerStrokeLinecap": "butt",
      "toFixed": 0,
    }),
    RouterModule.forChild([{ path: '', component: ProjectComponent }])
  ],
  declarations: [
    ProjectComponent
  ],

  providers: [
    MilestoneService
  ]
})
export class ProjectModule {}
