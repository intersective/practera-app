export interface SubmitActions {
  autoSave: boolean;
  goBack: boolean;
  questionSave ?: {
    submissionId: number;
    questionId: number;
    answer: string;
  };
  reviewSave ?: {
    reviewId: number;
    submissionId: number;
    questionId: number;
    answer: string;
    comment: string;
  };
}

export interface Question {
  id: number;
  name: string;
  description: string;
  isRequired: boolean;
  fileType?: any,
  audience: any[],
  canAnswer: boolean;
  canComment: boolean;
}
