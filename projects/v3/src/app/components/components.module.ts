import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DescriptionComponent } from './description/description.component';
import { ListItemComponent } from './list-item/list-item.component';
import { ImgComponent } from './img/img.component';
import { DragAndDropDirective } from '../directives/drag-and-drop/drag-and-drop.directive';
import { AutoresizeDirective } from '../directives/autoresize/autoresize.directive';
import { FloatDirective } from '../directives/float/float.directive';
import { AchievementPopUpComponent } from './achievement-pop-up/achievement-pop-up.component';
import { PopUpComponent } from './pop-up/pop-up.component';
import { LockTeamAssessmentPopUpComponent } from './lock-team-assessment-pop-up/lock-team-assessment-pop-up.component';
import { ActivityCompletePopUpComponent } from './activity-complete-pop-up/activity-complete-pop-up.component';
import { FastFeedbackComponent } from './fast-feedback/fast-feedback.component';
import { ReviewRatingComponent } from './review-rating/review-rating.component';
import { CircleProgressComponent } from './circle-progress/circle-progress.component';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { FilestackComponent } from './filestack/filestack.component';
import { FilestackPreviewComponent } from './filestack-preview/filestack-preview.component';
import { ContactNumberFormComponent } from './contact-number-form/contact-number-form.component';
import { ClickableItemComponent } from './clickable-item/clickable-item.component';
import { AssessmentComponent } from './assessment/assessment.component';
import { TextComponent } from './text/text.component';
import { TeamMemberSelectorComponent } from './team-member-selector/team-member-selector.component';
import { FileComponent } from './file/file.component';
import { MultipleComponent } from './multiple/multiple.component';
import { OneofComponent } from './oneof/oneof.component';
import { FileDisplayComponent } from './file-display/file-display.component';
import { ActivityComponent } from './activity/activity.component';
import { TopicComponent } from './topic/topic.component';
import { ReviewListComponent } from './review-list/review-list.component';
import { BrandingLogoComponent } from './branding-logo/branding-logo.component';
import { TodoCardComponent } from './todo-card/todo-card.component';
import { SlidableComponent } from './slidable/slidable.component';

const largeCircleDefaultConfig = {
  backgroundColor: 'var(--ion-color-light)',
  subtitleColor: 'var(--ion-color-dark-tint)',
  showInnerStroke: false,
  startFromZero: false,
  outerStrokeColor: 'var(--ion-color-primary)',
  innerStrokeColor: 'var(--ion-color-primary)',
  subtitle: [
    'COMPLETE'
  ],
  animation: true,
  animationDuration: 1000,
  titleFontSize: '32',
  subtitleFontSize: '18',
};

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgCircleProgressModule.forRoot(largeCircleDefaultConfig),
  ],
  declarations: [
    AchievementPopUpComponent,
    AchievementPopUpComponent,
    ActivityCompletePopUpComponent,
    ActivityComponent,
    AssessmentComponent,
    AutoresizeDirective,
    CircleProgressComponent,
    ClickableItemComponent,
    ContactNumberFormComponent,
    DescriptionComponent,
    DragAndDropDirective,
    FastFeedbackComponent,
    FileComponent,
    FileDisplayComponent,
    FilestackComponent,
    FilestackPreviewComponent,
    FloatDirective,
    ImgComponent,
    ListItemComponent,
    LockTeamAssessmentPopUpComponent,
    MultipleComponent,
    OneofComponent,
    PopUpComponent,
    ReviewListComponent,
    ReviewRatingComponent,
    SlidableComponent,
    TeamMemberSelectorComponent,
    TextComponent,
    TodoCardComponent,
    TopicComponent,
    BrandingLogoComponent
  ],
  exports: [
    AchievementPopUpComponent,
    AchievementPopUpComponent,
    ActivityCompletePopUpComponent,
    ActivityComponent,
    AssessmentComponent,
    AutoresizeDirective,
    CircleProgressComponent,
    ClickableItemComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContactNumberFormComponent,
    DescriptionComponent,
    DragAndDropDirective,
    FastFeedbackComponent,
    FileComponent,
    FileDisplayComponent,
    FilestackComponent,
    FilestackPreviewComponent,
    FloatDirective,
    ImgComponent,
    IonicModule,
    ListItemComponent,
    LockTeamAssessmentPopUpComponent,
    MultipleComponent,
    OneofComponent,
    PopUpComponent,
    ReviewListComponent,
    ReviewRatingComponent,
    SlidableComponent,
    TeamMemberSelectorComponent,
    TextComponent,
    TodoCardComponent,
    TopicComponent,
    BrandingLogoComponent
  ],
})
export class ComponentsModule {}
