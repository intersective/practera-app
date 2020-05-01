import { Directive, HostListener, HostBinding, Output, EventEmitter, Input } from '@angular/core';

@Directive({
  selector: '[appDragAndDrop]'
})
export class DragAndDropDirective {
  @Output() fileDropped = new EventEmitter<any>();
  @Input() acceptFileType?: string;

  @HostBinding('class.fileover') fileOver: boolean;

  @HostListener('dragover', ['$event']) ondragover(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = true;
  }

  @HostListener('dragleave', ['$event']) ondragleave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
  }

  @HostListener('drop', ['$event']) ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    console.log('drop');
    console.log('file', evt.dataTransfer.files);
    this.fileOver = false;
    const files = evt.dataTransfer.files;
    // error - no file droped
    if (files.length < 0) {
      console.log('error - no file droped');
      this.fileDropped.emit({
        success: false,
        message: 'no file droped'
      });
      return;
    }
    // error - more than one file droped
    if (files.length > 1) {
      console.log('error - more than one file droped');
      this.fileDropped.emit({
        success: false,
        message: 'more than one file droped'
      });
      return;
    }
    const file = files[0];
    if (this.acceptFileType && this.acceptFileType !== 'any' && file.type.includes(this.acceptFileType)) {
      this.fileDropped.emit({
        success: true,
        data: file
      });
    } else {
      // error - not maching file type
      console.log('error - not maching file type');
      this.fileDropped.emit({
        success: false,
        message: 'not maching file type'
      });
      return;
    }
  }

}
