import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { QuestionsComponent } from './questions.component';
import { TextComponent } from './text/text.component';
import { OneofComponent } from './oneof/oneof.component';
import { MultipleComponent } from './multiple/multiple.component';
import { FileComponent } from './file/file.component';
import { TeamMemberSelectorComponent } from './team-member-selector/team-member-selector.component';
import { FileDisplayComponent } from './file/file-display/file-display.component';
import { FilestackModule } from '@shared/filestack/filestack.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    ReactiveFormsModule,
    FilestackModule,
    SharedModule
  ],
  declarations: [
    QuestionsComponent,
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
