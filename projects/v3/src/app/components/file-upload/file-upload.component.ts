import { UppyUploaderService, ALLOWED_FILE_TYPES } from './../uppy-uploader/uppy-uploader.service';
import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { Uppy, UppyFile } from '@uppy/core';
import { environment } from '../../../environments/environment';
import { FileInput, Question, SubmitActions, TusFileResponse } from '../types/assessment';
import { DashboardOptions } from '@uppy/dashboard';

type FileMetadata = { [key: string]: any };
type FileBody = { [key: string]: any };

const UPPY_PROPS: DashboardOptions<any, any> = {
  inline: true,
  width: '100%',
  height: '200px',
  singleFileFullScreen: true,
  note: 'Upload files here',
  proudlyDisplayPoweredByUppy: false,
  hideRetryButton: false,
  hidePauseResumeButton: false,
  hideCancelButton: false,
  showRemoveButtonAfterComplete: true,
  hideProgressAfterFinish: false,
};

@Component({
  standalone: false,
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

  @Input() source!: "chat" | "profile" | "assessment" | "any" | "video" | "document" | "image";
  @Input() submitActions$: Subject<SubmitActions>;

  @Input() videoOnly?: boolean;
  @Input() question: Question = {
    id: 0,
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

  uploadedFile: TusFileResponse;
  fileTypes = '';
  tusResponse: {
    path: string;
    bucket: string;
    cdnUrl: string;
    directUrl: string;
  };

  // the value of answer
  innerValue: any;
  comment: string;
  // validation errors array
  errors: Array<any> = [];

  // compression state
  compressionProgress = 0;
  private compressionSub: Subscription | undefined;

  /** true only when this component's own uppy instance is compressing */
  isCompressing = false;

  constructor(
    private uppyUploaderService: UppyUploaderService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnDestroy(): void {
    this.compressionSub?.unsubscribe();
    this.uppyUploaderService.cancelCompression();
    this.uppy.destroy();
  }

  ngOnInit() {
    this.initiateUppy();
    this.uppyProps.note = this.noteMessage();
    this._showSavedAnswers();

    this.compressionSub = this.uppyUploaderService.compressionProgress$.subscribe(({ uppy, progress }) => {
      if (uppy !== this.uppy) return;
      this.isCompressing = progress !== null;
      this.compressionProgress = progress ? Math.round(progress.progress * 100) : 0;
      this.cdr.markForCheck();
    });
  }

  // size notice based on fileType
  noteMessage(): string {
    const size = environment.uppyConfig.restrictions.maxFileSize;
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
    }, {
      allowedFileTypes,
    });
    this.initializeEventHandlers(this.uppy);
  }

  onAfterResponse(req: any, res: any): void {
    // eslint-disable-next-line no-console
    console.log('onAfterResponse', req, res);
    this.tusResponse = JSON.parse(res.getBody());
  }

  initializeEventHandlers(uppy) {
    uppy
      .on('files-added', (files: {
      id: string;
      meta: {
        name: string;
        type: string;
        relativePath: number;
      };
      extension: string;
      name: string;
      source: string;
      type: string;
      size: number;
    }) => {
      // eslint-disable-next-line no-console
      console.log('files added', files);
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
    // reset errors
    this.errors = [];
    const fileInput: TusFileResponse = {
      name: data.name,
      type: data.type,
      size: data.size,
      extension: data.extension,
      bucket: this.tusResponse.bucket,
      path: this.tusResponse.path,
      url: this.tusResponse.cdnUrl,
      directUrl: this.tusResponse.directUrl,
      cdnUrl: this.tusResponse.cdnUrl,
    };

    this.uploadedFile = fileInput;
    const type = this.doReview ? 'answer' : undefined;
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
        file: this.innerValue.file,
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

    if (this.control) {
      this.control.setValue(this.innerValue);
    }
    this.submitActions$.next(action);
  }

  // if 'type' is set, this is a reviewer's action (review mode); if not set, it's an assessment submission (assessment mode)
  onChange(value, type?: 'comment' | 'answer') {
    // set changed value (answer or comment)
    if (type) {  // for reviewing
      if (!this.innerValue) {
        this.innerValue = {
          answer: {},
          comment: '',
          file: {},
        };
      }

      this.innerValue.file = this.fileRequestFormat();
      this.innerValue[type] = value;
    } else { // for assessment
      this.innerValue = this.fileRequestFormat();
    }

    if (this.control) {
      this.control.setValue(this.innerValue);
      this.control.markAsTouched();
      this.control.markAsDirty();
    }
    this.triggerSave();
  }

  fileRequestFormat(): FileInput {
    // return empty object if uploadedFile is empty or not set
    if (!this.uploadedFile || Object.keys(this.uploadedFile).length === 0) {
      return {} as FileInput;
    }

    const fileInput: FileInput = {
      name: this.uploadedFile.name,
      type: this.uploadedFile.type,
      size: this.uploadedFile.size,
      extension: this.uploadedFile.extension,
      bucket: this.uploadedFile.bucket,
      path: this.uploadedFile.path,
      url: this.uploadedFile.cdnUrl,
    };

    return fileInput;
  }

  // adding save values to from control
  private _showSavedAnswers() {
    if ((['in progress', 'not start'].includes(this.reviewStatus)) && this.doReview && this.review) {
      // when the control has been modified (e.g. user edited during pagination),
      // preserve their edits; otherwise use the saved review data
      if (this.control && !this.control.pristine) {
        this.innerValue = this.control.value;
        this.comment = this.control.value?.comment ?? this.review.comment;
        // restore uploadedFile from saved file data so template shows file after pagination
        if (this.innerValue?.file?.url) {
          this.uploadedFile = { ...this.innerValue.file, cdnUrl: this.innerValue.file.url } as TusFileResponse;
        }
      } else {
        this.innerValue = {
          answer: this.review.answer,
          comment: this.review.comment,
          file: this.review.file,
        };
        this.comment = this.review.comment;
      }
    }
    if ((this.submissionStatus === 'in progress') && (this.doAssessment)) {
      if (this.control && !this.control.pristine) {
        this.innerValue = this.control.value;
        // restore uploadedFile from saved file data so template shows file after pagination
        if (this.innerValue?.url) {
          this.uploadedFile = { ...this.innerValue, cdnUrl: this.innerValue.url } as TusFileResponse;
        }
      } else {
        this.innerValue = this.submission?.answer;
      }
    }
    if (this.control) {
      this.control.setValue(this.innerValue);
    }
  }

  removeSubmitFile(file?: {
    handle: string;
  }): void {
    this.uploadedFile = null as TusFileResponse;

    if (this.doAssessment === true) {
      this.submission.answer = null;
      this.onChange('');
    } else if (this.doReview === true) {
      this.review.answer = null;
      this.onChange('', 'answer');
    }

    this.uppy.removeFile(file?.handle);
    this.uppy.clear();
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
