import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectComponent } from './project.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { ProjectService } from './project.service';
import { ProjectRoutingComponent } from './project-routing.component';
import { ProjectRoutingModule } from './project-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ProjectRoutingModule,
    NgCircleProgressModule.forRoot({
      "outerStrokeLinecap": "butt",
      "toFixed": 0,
    })
  ],
  declarations: [
    ProjectComponent,
    ProjectRoutingComponent
  ],

  providers: [
    ProjectService,
  ]
  
})
export class ProjectModule {}
