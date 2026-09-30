import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {
  buildProjectBriefPresentation,
  ProjectBrief,
  ProjectBriefPresentation,
  ProjectBriefPresentationSection,
} from '../../models/project-brief.model';
import { NotificationsService } from '../../services/notifications.service';
import { ProjectBriefPdfService } from '../../services/project-brief-pdf.service';

/**
 * modal component to display project brief details
 * displays title, description, industry, project type, skills, and deliverables
 * empty fields show "none specified"
 */
@Component({
  selector: 'app-project-brief-modal',
  standalone: false,
  templateUrl: './project-brief-modal.component.html',
  styleUrls: ['./project-brief-modal.component.scss']
})
export class ProjectBriefModalComponent {
  projectBrief: ProjectBrief = {};
  allowPdfDownload = false;
  isDownloading = false;

  constructor(
    private modalController: ModalController,
    private readonly notificationsService: NotificationsService,
    private readonly projectBriefPdfService: ProjectBriefPdfService,
  ) {}

  /**
   * dismiss the modal
   */
  close(): void {
    this.modalController.dismiss();
  }

  async downloadPdf(): Promise<void> {
    if (!this.allowPdfDownload || this.isDownloading) {
      return;
    }

    this.isDownloading = true;
    try {
      await this.projectBriefPdfService.download(this.projectBrief);
    } catch {
      await this.notificationsService.presentToast(
        $localize`:@@projectBriefPdfDownloadFailed:Unable to download the project brief. Please try again.`,
        {
          color: 'danger',
          icon: 'close-circle',
        }
      );
    } finally {
      this.isDownloading = false;
    }
  }

  /**
   * check if an array has items
   */
  hasItems(arr: string[] | undefined): boolean {
    return Array.isArray(arr) && arr.length > 0;
  }

  /**
   * check if a string value exists and is not empty
   */
  hasValue(val: string | undefined): boolean {
    return typeof val === 'string' && val.trim().length > 0;
  }

  sectionItems(section: ProjectBriefPresentationSection): string[] {
    return Array.isArray(section.value) ? section.value : [];
  }

  sectionText(section: ProjectBriefPresentationSection): string {
    return typeof section.value === 'string' ? section.value : '';
  }

  get presentation(): ProjectBriefPresentation {
    return buildProjectBriefPresentation(this.projectBrief);
  }
}
