import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

/**
 * interface for project brief data structure
 */
export interface ProjectBrief {
  id?: string;
  title?: string;
  description?: string;
  industry?: string[];
  projectType?: string;
  technicalSkills?: string[];
  professionalSkills?: string[];
  deliverables?: string;
}

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

  constructor(
    private modalController: ModalController
  ) {}

  /**
   * dismiss the modal
   */
  close(): void {
    this.modalController.dismiss();
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
}
