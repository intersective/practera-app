import { UppyUploaderService } from './../uppy-uploader/uppy-uploader.service';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { Uppy, UppyFile } from '@uppy/core';
import { environment } from '../../../environments/environment';
import { FileInput, Question, SubmitActions } from '../types/assessment';
import { BrowserStorageService } from '../../services/storage.service';

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
  small: true,
  inline: true,
  width: '100%',
  height: 200,
  showProgressDetails: true,
  note: 'Upload files here',
  proudlyDisplayPoweredByUppy: false,
  hideRetryButton: false,
  hidePauseResumeButton: false,
  hideCancelButton: false,
  showRemoveButtonAfterComplete: true,
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
export class FileUploadComponent implements OnInit, OnDestroy {
  // private uploadUrl = '/uploads';
  private uploadUrl = environment.uppyConfig.tusUrl;
  uppy: Uppy<FileMetadata, FileBody>;

  // Uppy UI
  uppyProps = UPPY_PROPS;

  @Input() source!: string;
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

  uploadedFile: FileInput;
  fileTypes = '';
  tusResponse: {
    path: string;
    bucket: string;
  };

  // the value of answer
  innerValue: any;
  comment: string;
  // validation errors array
  errors: Array<any> = [];

  constructor(
    private storageService: BrowserStorageService,
    private uppyUploaderService: UppyUploaderService,
  ) { }

  ngOnDestroy(): void {
    this.uppy.destroy();
  }

  ngOnInit() {
    this.initiateUppy();
    this.uppyProps.note = this.noteMessage();
    this._showSavedAnswers();
  }

  // size notice based on fileType
  noteMessage(): string {
    const size = environment.uppyConfig.restrictions.maxFileSize / 1024 / 1024; // in MB
    if (this.question.fileType === 'video') {
      return `Videos only, up to ${size} MB`;
    }

    if (this.question.fileType === 'image') {
      return `Images only, up to ${size} MB`;
    }

    return `Docs, images and videos only, up to ${size} MB`;
  }

  private initiateUppy() {
    // set allowed file types
    let allowedFileTypes = ALLOWED_FILE_TYPES;
    if (this.question.fileType === 'video') {
      allowedFileTypes = ['video/*'];
    } else if (this.question.fileType === 'image') {
      allowedFileTypes = ['image/*'];
    }

    this.uppy = this.uppyUploaderService.createUppyInstance(this.source, this.uploadUrl, {
      onAfterResponse: this.onAfterResponse.bind(this),
      onUploadSuccess: this.onFileUploadCompleted.bind(this),
    });
    this.initializeEventHandlers(this.uppy);
  }

  onAfterResponse(req: any, res: any): void {
    // eslint-disable-next-line no-console
    console.log('onAfterResponse', req, res);
    this.tusResponse = JSON.parse(res.getBody());
  }

  initializeEventHandlers(uppy) {
    uppy.on('files-added', (files: any) => {
      // eslint-disable-next-line no-console
      console.log('files added', files);
      this.control.setValue({
        ...this.innerValue,
        files,
      });

      this.control.markAsTouched();
    }).on('file-removed', (file) => {
      // eslint-disable-next-line no-console
      console.log('file removed', file);
      this.sendDeleteRequestForFile(file);
    });
  }

  sendDeleteRequestForFile(file) {
    // eslint-disable-next-line no-console
    console.log('sendDeleteRequestForFile', file);
    this.uppy.removeFile(file.id);
  }

  onFileUploadCompleted(data: UppyFile<any, any>, response: {
    body: XMLHttpRequest;
    status: number;
    uploadURL: string;
  }): void {
    const type = this.doReview ? 'answer' : null;

    // reset errors
    this.errors = [];
    const fileInput: FileInput = {
      name: data.name,
      type: data.type,
      size: data.size,
      extension: data.extension,
      url: response.uploadURL,
      bucket: this.tusResponse.bucket,
      path: this.tusResponse.path,
    };

    this.uploadedFile = fileInput;
    this.onChange('', type);
    if (response?.status !== 200) {
      this.errors.push('File upload failed, please try again later.');
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
        file: this.innerValue.answer,
        comment: this.innerValue.comment,
      };
    }

    if (this.doAssessment === true) {
      action.questionSave = {
        submissionId: this.submissionId,
        questionId: this.question.id,
        file: this.innerValue,
      };
    }

    this.submitActions$.next(action);
  }

  // if 'type' is set, it means it comes from reviewer doing review, otherwise it comes from submitter doing assessment
  onChange(value, type?: 'comment' | 'answer') {
    // set changed value (answer or comment)
    if (type) {  // for reviewing
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
    } else { // for assessment
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
      this.onChange('');
    }

    if (this.doReview === true) {
      this.review.answer = null;
      this.onChange('', 'answer');
    }
  }

  audienceContainReviewer(): boolean {
    return this.question.audience.length > 1 && this.question.audience.includes('reviewer');
  }

  extractFilenameFromUrl(url: string): string | null {
    const regex = /\/uploads\/(.*?)\+/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}
