import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
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
    NgCircleProgressModule.forRoot(largeCircleDefaultConfig),
    // QuestionsModule,
  ],
  declarations: [
    AchievementPopUpComponent,
    AchievementPopUpComponent,
    ActivityCompletePopUpComponent,
    AssessmentComponent,
    AutoresizeDirective,
    CircleProgressComponent,
    ClickableItemComponent,
    ContactNumberFormComponent,
    DescriptionComponent,
    DragAndDropDirective,
    FastFeedbackComponent,
    FilestackComponent,
    FilestackPreviewComponent,
    FloatDirective,
    ImgComponent,
    ListItemComponent,
    LockTeamAssessmentPopUpComponent,
    PopUpComponent,
    ReviewRatingComponent,
  ],
  exports: [
    AchievementPopUpComponent,
    AchievementPopUpComponent,
    ActivityCompletePopUpComponent,
    AssessmentComponent,
    AutoresizeDirective,
    CircleProgressComponent,
    ClickableItemComponent,
    CommonModule,
    CommonModule,
    ContactNumberFormComponent,
    DescriptionComponent,
    DragAndDropDirective,
    FastFeedbackComponent,
    FilestackComponent,
    FilestackPreviewComponent,
    FloatDirective,
    FormsModule,
    FormsModule,
    ImgComponent,
    IonicModule,
    IonicModule,
    ListItemComponent,
    LockTeamAssessmentPopUpComponent,
    PopUpComponent,
    ReviewRatingComponent,
  ],
})
export class ComponentsModule {}
