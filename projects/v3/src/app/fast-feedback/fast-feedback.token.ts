import { InjectionToken } from '@angular/core';

// Define the interface for the modal function
export interface FastFeedbackModalFunction {
  createModal: (props: any, options: any) => Promise<HTMLIonModalElement>;
}

// Create an injection token for the modal function
export const FAST_FEEDBACK_MODAL_TOKEN = new InjectionToken<FastFeedbackModalFunction>('FastFeedbackModal');
