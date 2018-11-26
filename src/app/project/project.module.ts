import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectComponent } from './project.component';
import { ProjectRoutingModule } from './project-routing.module';
import { ActivityModule } from '../activity/activity.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ActivityModule,
    ProjectRoutingModule,
  ],
  declarations: [ProjectComponent]
})
export class ProjectModule {}
