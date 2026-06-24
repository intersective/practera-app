import { DragAndDropDirective } from './drag-and-drop.directive';

describe('DragAndDropDirective', () => {
  let directive: DragAndDropDirective;

  const createEvent = (files: any[] = []) => {
    const preventDefault = jasmine.createSpy('preventDefault');
    const stopPropagation = jasmine.createSpy('stopPropagation');
    return {
      preventDefault,
      stopPropagation,
      dataTransfer: {
        files
      }
    } as any;
  };

  beforeEach(() => {
    directive = new DragAndDropDirective();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should set fileOver on dragover when enabled', () => {
    const event = createEvent();
    directive.disabled = false;

    directive.ondragover(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(directive.fileOver).toBeTrue();
  });

  it('should not set fileOver on dragover when disabled', () => {
    const event = createEvent();
    directive.disabled = true;

    directive.ondragover(event);

    expect(directive.fileOver).not.toBeTrue();
  });

  it('should unset fileOver on dragleave', () => {
    const event = createEvent();
    directive.fileOver = true;

    directive.ondragleave(event);

    expect(directive.fileOver).toBeFalse();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should return early on drop when disabled', () => {
    const event = createEvent([{ type: 'text/plain' }]);
    directive.disabled = true;
    spyOn(directive.fileDropped, 'emit');

    directive.ondrop(event);

    expect(directive.fileDropped.emit).not.toHaveBeenCalled();
  });

  it('should emit error when more than one file is dropped', () => {
    const event = createEvent([{ type: 'text/plain' }, { type: 'text/plain' }]);
    spyOn(directive.fileDropped, 'emit');

    directive.ondrop(event);

    expect(directive.fileDropped.emit).toHaveBeenCalledWith({
      success: false,
      message: 'More than one file droped'
    });
  });

  it('should emit error when file type does not match acceptFileType', () => {
    const event = createEvent([{ type: 'image/png' }]);
    directive.acceptFileType = 'application/pdf';
    spyOn(directive.fileDropped, 'emit');

    directive.ondrop(event);

    expect(directive.fileDropped.emit).toHaveBeenCalledWith({
      success: false,
      message: 'Not a matching file type'
    });
  });

  it('should emit success when acceptFileType is any', () => {
    const file = { type: 'image/png' } as any;
    const event = createEvent([file]);
    directive.acceptFileType = 'any';
    spyOn(directive.fileDropped, 'emit');

    directive.ondrop(event);

    expect(directive.fileDropped.emit).toHaveBeenCalledWith({
      success: true,
      file
    });
  });

  it('should emit success when file type matches acceptFileType', () => {
    const file = { type: 'image/png' } as any;
    const event = createEvent([file]);
    directive.acceptFileType = 'image';
    spyOn(directive.fileDropped, 'emit');

    directive.ondrop(event);

    expect(directive.fileDropped.emit).toHaveBeenCalledWith({
      success: true,
      file
    });
  });
});
