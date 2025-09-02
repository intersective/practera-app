// @link: https://intersective.github.io/core-graphql-api/fileinput.doc.html

export interface TusFileResponse extends FileInput {
  directUrl: string;
  cdnUrl: string;
}
export interface FileInput {
  bucket: string;
  path: string;
  name: string; // file name
  url: string; // file uploaded url (cdnUrl)
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

export interface Choice {
  id: number;
  name: string;
  explanation?: string | any;
}

export interface TeamMember {
  key: string;
  userName: string;
}

export interface Question {
  audience: string[];
  canAnswer: boolean;
  canComment: boolean;
  choices?: Array<Choice>;
  description: string;
  fileType?: string;
  hasComment?: boolean;
  id: number;
  info?: string;
  min?: number;
  max?: number;
  isRequired: boolean;
  name: string;
  reviewerOnly?: boolean; // question meant for reviewer only
  submitterOnly?: boolean;
  teamMembers?: Array<TeamMember>;
  type?: string; // 'text' | 'file' | 'multi' | 'slider' | 'one-of' | 'team-member';
}
