import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamComponent } from './team.component';
import { TeamListComponent } from './team-list/team-list.component';
import { TeamRoutingModule } from './team-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TeamRoutingModule
  ],
  declarations: [ TeamComponent, TeamListComponent ]
})
export class TeamModule {}
