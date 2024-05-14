import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExperiencesPageRoutingModule } from './experiences-routing.module';

import { ExperiencesPage } from './experiences.page';

import { PersonalisedHeaderModule } from '@v3/app/personalised-header/personalised-header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExperiencesPageRoutingModule,
    PersonalisedHeaderModule
  ],
  declarations: [ExperiencesPage]
})
export class ExperiencesPageModule {}
