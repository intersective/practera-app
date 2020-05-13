import { Directive, HostListener, HostBinding, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appDragAndDrop]'
})
export class DragAndDropDirective implements OnChanges {
  @Output() fileDropped = new EventEmitter<any>();
  @Input() acceptFileType?: string;
  @Input() disabledDragDrop?: boolean;

  @HostBinding('class.fileover') fileOver: boolean;

  @HostListener('dragover', ['$event']) ondragover(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    console.log('this.disabledDragDrop', this.disabledDragDrop);
    if (this.disabledDragDrop) {
      this.fileOver = true;
      console.log('this.fileOver', this.fileOver);
    }
  }

  @HostListener('dragleave', ['$event']) ondragleave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
  }

  @HostListener('drop', ['$event']) ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    console.log('this.disabledDragDrop', this.disabledDragDrop);
    if (this.disabledDragDrop) {
      console.log('1234567');
      return;
    }
    this.fileOver = false;
    const files = evt.dataTransfer.files;
    // error - no file droped
    if (files.length < 0) {
      this.fileDropped.emit({
        success: false,
        message: 'No file droped'
      });
      return;
    }
    // error - more than one file droped
    if (files.length > 1) {
      this.fileDropped.emit({
        success: false,
        message: 'More than one file droped'
      });
      return;
    }
    const file = files[0];
    // error - not maching file type
    if (this.acceptFileType && this.acceptFileType !== 'any' && !file.type.includes(this.acceptFileType)) {
      this.fileDropped.emit({
        success: false,
        message: 'Not a maching file type'
      });
      return;
    }
    this.fileDropped.emit({
      success: true,
      file: file
    });
  }

  ngOnChanges (changes: SimpleChanges) {
    console.log('ngOnChanges - DragAndDropDirective', changes);
    // if (changes.submitted && changes.submitted.currentValue) {
    //   this.submitted = changes.submitted.currentValue;
    // }
  }

}
