import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { Uppy, UppyFile, UppyOptions } from '@uppy/core';
import RemoteSources from '@uppy/remote-sources';
import Tus from '@uppy/tus';
import { environment } from '../../../environments/environment';
import { Question, SubmitActions } from '../types/assessment';

type FileMetadata = { [key: string]: any };
type FileBody = { [key: string]: any };

const ALLOWED_FILE_TYPES = [
  'image/*',
  'video/*',
  '.jpeg',
  '.png',
  'application/pdf',
];

const UPPY_PROPS = {
  inline: true,
  width: '100%',
  height: 300,
  showProgressDetails: true,
  note: 'Images only, up to 10 MB',
  proudlyDisplayPoweredByUppy: false,
  hideRetryButton: false,
  hidePauseResumeButton: false,
  hideCancelButton: false,
  hideProgressAfterFinish: false,
  doneButtonHandler: null,
};

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: [
    './file-upload.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class FileUploadComponent implements OnInit {
  // private uploadUrl = '/uploads';
  private uploadUrl = environment.uppyConfig.tusUrl;
  uppy: Uppy<FileMetadata, FileBody>;

  // Uppy UI
  uppyProps = UPPY_PROPS;

  @Input() submitActions$: Subject<SubmitActions>;

  @Input() videoOnly?: boolean;
  @Input() question: Question = {
    id: null,
    name: '',
    description: '',
    isRequired: false,
    fileType: 'any',
    audience: [],
    canAnswer: false,
    canComment: false,
  };

  @Input() submission;
  @Input() submissionId: number;
  @Input() review;
  @Input() reviewId: number;
  @Input() reviewStatus;
  @Input() submissionStatus;

  // assessment/review action flags
  @Input() doAssessment: boolean;
  @Input() doReview: boolean;

  // FormControl that is passed in from parent component
  @Input() control: AbstractControl;

  // comment field for reviewer
  @ViewChild('commentEle') commentRef: ElementRef;

  uploadedFile;
  fileTypes = '';

  // the value of answer
  innerValue: any;
  comment: string;
  // validation errors array
  errors: Array<any> = [];

  constructor(
  ) { }

  ngOnInit() {
    if (!this.uploadUrl) {
      throw new Error("uploadUrl is required.");
    }

    this.initiateUppy();

    // this.fileTypes = this.filestackService.getFileTypes(this.videoOnly ? 'video' : this.question.fileType);
    this._showSavedAnswers();
  }

  private initiateUppy() {
    const uppyOptions: UppyOptions<FileMetadata, FileBody> = {
      debug: true,
      autoProceed: false,
      restrictions: {
        ...environment.uppyConfig.restrictions,
        allowedFileTypes: ALLOWED_FILE_TYPES,
      },
    };

    this.uppy = new Uppy(uppyOptions);
    this.uppy.use(RemoteSources, {
      companionUrl: this.uploadUrl,
      sources: ['GoogleDrive', 'Dropbox', 'Instagram', 'Facebook', 'OneDrive', 'Box', 'Url'],
    }).use(Tus, {
      // endpoint: environment.uppyConfig.tusUrl,
      endpoint: this.uploadUrl,
      retryDelays: [0, 1000, 3000, 5000],
      // withCredentials: true,
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.log("Tus error:", error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        // eslint-disable-next-line no-console
        console.log(bytesUploaded, bytesTotal, `${percentage}%`);
      },
      onSuccess: (upload) => {
        // eslint-disable-next-line no-console
        console.log("Upload complete:", upload);
      }
    }).on('dashboard:file-edit-start', (file: any) => {
      // eslint-disable-next-line no-console
      console.log('file edit start', file);
    }).on('files-added', (files: any) => {
      // eslint-disable-next-line no-console
      console.log('files added', files);
    }).on('file-removed', (file: any) => {
      // eslint-disable-next-line no-console
      console.log('file removed', file);
    }).on('restriction-failed', (file: any, error: any) => {
      // eslint-disable-next-line no-console
      console.log('restriction failed', file, error);
    }).on('upload-error', (file: any, error: any) => {
      // eslint-disable-next-line no-console
      console.log('upload error', file, error);
    }).on('upload-success', (file: any, response: any) => {
      // eslint-disable-next-line no-console
      console.log('upload success', file, response);
      this.onFileUploadCompleted({ success: true, data: response.body });
    });

  }

  onFileUploadCompleted(file, type: string = null) {
    if (file.success) {
      // reset errors
      this.errors = [];
      // currently we only support one file upload per question,
      // if we need to support multiple file upload later, we need to change this to:
      // this.uploadedFiles = push(file.data);
      this.uploadedFile = file.data;
      this.onChange('', type);
    } else {
      // display error message for user
      // if error is drag and drop error will show a custom message. ex:- nore than one file droped, invalid file type droped.
      if (file.data.isDragAndDropError) {
        this.errors.push(`${file.data.message}, please try again.`);
      } else {
        this.errors.push('File upload failed, please try again later.');
      }
    }
  }

  triggerSave() {
    const action: SubmitActions = {
      autoSave: true,
      goBack: false,
    };

    if (this.doReview === true) {
      action.reviewSave = {
        reviewId: this.reviewId,
        submissionId: this.submissionId,
        questionId: this.question.id,
        answer: this.innerValue.answer,
        comment: this.innerValue.comment,
      };
    }

    if (this.doAssessment === true) {
      action.questionSave = {
        submissionId: this.submissionId,
        questionId: this.question.id,
        answer: this.innerValue,
      };
    }

    this.submitActions$.next(action);
  }

  // if 'type' is set, it means it comes from reviewer doing review, otherwise it comes from submitter doing assessment
  onChange(value, type: string) {
    // set changed value (answer or comment)
    if (type) {
      if (!this.innerValue) {
        this.innerValue = {
          answer: {},
          comment: ''
        };
      }
      if (type === 'comment') {
        // just pass the value for comment since comment is always just text
        this.innerValue.comment = value;
      } else {
        this.innerValue.answer = this.uploadedFile;
      }
    } else {
      // this is for submitter, just pass the uploaded file as the answer
      this.innerValue = this.uploadedFile;
    }

    this.triggerSave();
  }

  // adding save values to from control
  private _showSavedAnswers() {
    if ((['in progress', 'not start'].includes(this.reviewStatus)) && (this.doReview)) {
      this.innerValue = {
        answer: {},
        comment: ''
      };
      this.innerValue.comment = this.review.comment;
      this.comment = this.review.comment;
      this.innerValue.answer = this.review.answer;
    }
    if ((this.submissionStatus === 'in progress') && (this.doAssessment)) {
      this.innerValue = this.submission.answer;
    }
    this.control.setValue(this.innerValue);
  }

  removeSubmitFile(file?: {
    handle: string;
  }): void {
    this.uploadedFile = null;

    if (this.doAssessment === true) {
      this.submission.answer = null;
      this.onChange('', null);
    }

    if (this.doReview === true) {
      this.review.answer = null;
      this.onChange('', 'answer');
    }


    // this.filestackService.deleteFile(file.handle).subscribe(console.log);
  }

  audienceContainReviewer(): boolean {
    return this.question.audience.length > 1 && this.question.audience.includes('reviewer');
  }
}
