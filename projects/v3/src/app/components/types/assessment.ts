// @link: https://intersective.github.io/core-graphql-api/fileinput.doc.html
export interface FileInput {
  bucket: string;
  path: string;
  name: string; // file name
  url: string; // file uploaded url (direct url)
  cdnUrl: string; // file cdn url
  directUrl: string; // file direct url
  extension: string; // file extension
  type: string; // mime type
  size: number; // file size
}

export interface FileResponse {
  name: string;
  type: string;
  url: string;
}

export interface SubmitActions {
  autoSave: boolean;
  goBack: boolean;
  questionSave ?: {
    submissionId: number;
    questionId: number;
    answer?: string;
    file?: FileInput;
  };
  reviewSave ?: {
    reviewId: number;
    submissionId: number;
    questionId: number;
    answer?: string;
    file?: FileInput;
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
