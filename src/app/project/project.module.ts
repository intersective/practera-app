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
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    ProjectRoutingModule,
    NgCircleProgressModule.forRoot({
      "outerStrokeLinecap": "butt",
      "toFixed": 0,
      "outerStrokeColor": "var(--ion-color-primary)",
      "backgroundColor": "var(--practera-progress-cricle-bg-color)",
      "backgroundStroke": "var(--practera-progress-circle-stroke)",
      "showTitle": false,
      "showSubtitle": false,
      "startFromZero": false,
      "showInnerStroke": false,
      "showUnits": false,
      "backgroundStrokeWidth": 0,
      "maxPercent": 100,
      "outerStrokeWidth": 10,
      "radius": 5,
      "space": -20
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
