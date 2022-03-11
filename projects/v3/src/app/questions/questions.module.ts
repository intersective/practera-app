import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TextComponent } from './text/text.component';
import { OneofComponent } from './oneof/oneof.component';
import { MultipleComponent } from './multiple/multiple.component';
import { FileComponent } from './file/file.component';
import { TeamMemberSelectorComponent } from './team-member-selector/team-member-selector.component';
import { FileDisplayComponent } from './file/file-display/file-display.component';
import { FilestackModule } from 'filestack';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../components/components.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    FilestackModule,
    ComponentsModule,
  ],
  declarations: [
    TextComponent,
    OneofComponent,
    MultipleComponent,
    FileComponent,
    TeamMemberSelectorComponent,
    FileDisplayComponent
  ],
  exports: [
    TextComponent,
    OneofComponent,
    MultipleComponent,
    FileComponent,
    TeamMemberSelectorComponent
  ]

})
export class QuestionsModule {
}
