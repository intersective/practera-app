import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { Uppy, UppyFile, UppyOptions } from '@uppy/core';
import RemoteSources from '@uppy/remote-sources';
import Tus from '@uppy/tus';
import { environment } from '../../../environments/environment';
import { FileInput, Question, SubmitActions } from '../types/assessment';
import { BrowserStorageService } from '../../services/storage.service';
import { HttpResponse } from '@angular/common/http';

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

  uploadedFile;
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
  ) { }

  ngOnDestroy(): void {
    this.uppy.destroy();
  }

  ngOnInit() {
    if (!this.uploadUrl) {
      throw new Error("uploadUrl is required.");
    }

    this.initiateUppy();

    this.uppyProps.note = this.noteMessage();

    // this.fileTypes = this.filestackService.getFileTypes(this.videoOnly ? 'video' : this.question.fileType);
    this._showSavedAnswers();
  }

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

    const uppyOptions: UppyOptions<FileMetadata, FileBody> = {
      debug: true,
      autoProceed: false,
      restrictions: {
        ...environment.uppyConfig.restrictions,
        allowedFileTypes,
        maxNumberOfFiles: 1,
        minNumberOfFiles: 1,
      },
    };

    this.uppy = new Uppy(uppyOptions);

    // initialise uppy with tus
    this.uppy.use(Tus, {
      headers: {
        'apikey': this.storageService.getUser().apikey,
        'source': this.source,
      },
      endpoint: this.uploadUrl,
      retryDelays: [0, 1000, 3000, 5000],
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
      },
      onAfterResponse: async (req, res) => {
        // eslint-disable-next-line no-console
        console.log('onAfterResponse', req, res);
        if (req.getMethod() === 'POST') {
          this.extractResponseData(res as any);
        }
      },
    });

    this.initializeEventHandlers(this.uppy);
  }

  // extract response from tus upload XHR state
  extractResponseData(response: {
    _xhr: {
      response: string;
    };
  }) {
    try {
      const res = response?._xhr?.response;
      const data = JSON.parse(res);
      // eslint-disable-next-line no-console
      console.log('extractResponseData', data);
      this.tusResponse = data;
      return data;
    } catch (error) {
      // @TODO: handle error (make file recoverable?)
      // eslint-disable-next-line no-console
      console.error('extractResponseData', error);
    }
  }

  initializeEventHandlers(uppy) {
    uppy.on('dashboard:file-edit-start', (file: any) => {
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

      const submission: FileInput = {
        // to be return from backend
        bucket: this.tusResponse.bucket,
        path: this.tusResponse.path,
        url: response.uploadURL,

        // from uppy
        name: file.name,
        extension: file.extension,
        type: file.type, // mime type
        size: file.size,
      };

      // eslint-disable-next-line no-console
      console.log('submission', submission);

      this.onFileUploadCompleted(
        { success: true, data: submission },
        this.doReview ? "answer" : null
      );
    }).on('file-removed', (file) => {
      // eslint-disable-next-line no-console
      console.log('file removed', file);
      this.sendDeleteRequestForFile(file);
    }).on('complete', (result) => {
      // eslint-disable-next-line no-console
      console.log('complete', result);
    });
  }


  sendDeleteRequestForFile(file) {
    // eslint-disable-next-line no-console
    console.log('sendDeleteRequestForFile', file);
    this.uppy.removeFile(file.id);
  }

  onFileUploadCompleted(file, type = null) {
    if (file.success) {
      // reset errors
      this.errors = [];
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
  onChange(value, type: 'comment' | 'answer' | null) {
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
      this.onChange('', null);
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
