import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextComponent } from './text/text.component';
import { OneofComponent } from './oneof/oneof.component';
import { MultipleComponent } from './multiple/multiple.component';
import { FileComponent } from './file/file.component';
import { TeamMemberSelectorComponent } from './team-member-selector/team-member-selector.component';
import { FileDisplayComponent } from './file/file-display/file-display.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../components/components.module';
// import { FilestackModule } from '../filestack/filestack.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
  ],
  declarations: [
    TextComponent,
    OneofComponent,
    MultipleComponent,
    FileComponent,
    TeamMemberSelectorComponent,
    FileDisplayComponent,
  ],
  exports: [
    IonicModule,
    CommonModule,
    TextComponent,
    OneofComponent,
    MultipleComponent,
    FileComponent,
    FileDisplayComponent,
    TeamMemberSelectorComponent,
    FormsModule,

  ]

})
export class QuestionsModule {
}
