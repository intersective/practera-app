import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DescriptionComponent } from './description/description.component';
import { ListItemComponent } from './list-item/list-item.component';
import { ImgComponent } from './img/img.component';
import { DragAndDropDirective } from '../directives/drag-and-drop/drag-and-drop.directive';
import { AutoresizeDirective } from '../directives/autoresize/autoresize.directive';
import { AchievementPopUpComponent } from './achievement-pop-up/achievement-pop-up.component';
import { PopUpComponent } from './pop-up/pop-up.component';
import { LockTeamAssessmentPopUpComponent } from './lock-team-assessment-pop-up/lock-team-assessment-pop-up.component';
import { MultiTeamMemberSelectorComponent } from './multi-team-member-selector/multi-team-member-selector.component';
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
import { BottomActionBarComponent } from './bottom-action-bar/bottom-action-bar.component';
import { VideoConversionComponent } from './video-conversion/video-conversion.component';
import { SupportPopupComponent } from './support-popup/support-popup.component';

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
    VideoConversionComponent,
    FilestackComponent,
    FilestackPreviewComponent,
    ImgComponent,
    ListItemComponent,
    LockTeamAssessmentPopUpComponent,
    MultiTeamMemberSelectorComponent,
    MultipleComponent,
    OneofComponent,
    PopUpComponent,
    ReviewListComponent,
    ReviewRatingComponent,
    TeamMemberSelectorComponent,
    TextComponent,
    TodoCardComponent,
    TopicComponent,
    BrandingLogoComponent,
    BottomActionBarComponent,
    SupportPopupComponent
  ],
  exports: [
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
    VideoConversionComponent,
    FilestackComponent,
    FilestackPreviewComponent,
    ImgComponent,
    IonicModule,
    ListItemComponent,
    LockTeamAssessmentPopUpComponent,
    MultiTeamMemberSelectorComponent,
    MultipleComponent,
    OneofComponent,
    PopUpComponent,
    ReviewListComponent,
    ReviewRatingComponent,
    TeamMemberSelectorComponent,
    TextComponent,
    TodoCardComponent,
    TopicComponent,
    BrandingLogoComponent,
    BottomActionBarComponent,
    SupportPopupComponent
  ],
})
export class ComponentsModule {}
