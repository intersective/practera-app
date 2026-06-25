import { ElementRef } from '@angular/core';
import { AutoresizeDirective } from './autoresize.directive';

describe('AutoresizeDirective', () => {
  const createDirective = (textArea?: Partial<HTMLTextAreaElement>) => {
    const querySelector = jasmine.createSpy('querySelector').and.returnValue(textArea || null);
    const elementRef = {
      nativeElement: {
        querySelector
      }
    } as ElementRef;
    const directive = new AutoresizeDirective(elementRef);

    return { directive, querySelector };
  };

  it('should create', () => {
    const { directive } = createDirective();

    expect(directive).toBeTruthy();
  });

  it('should resize using scrollHeight when maxHeight is not set', () => {
    const textArea = {
      style: { overflow: '', height: '' },
      scrollHeight: 160
    } as unknown as HTMLTextAreaElement;
    const { directive } = createDirective(textArea);

    directive.adjust();

    expect(textArea.style.overflow).toBe('auto');
    expect(textArea.style.height).toBe('160px');
  });

  it('should cap resize to numeric maxHeight', () => {
    const textArea = {
      style: { overflow: '', height: '' },
      scrollHeight: 300
    } as unknown as HTMLTextAreaElement;
    const { directive } = createDirective(textArea);
    directive.maxHeight = '200';

    directive.adjust();

    expect(directive.maxHeight).toBe(200);
    expect(textArea.style.height).toBe('200px');
  });

  it('should call adjust on init', () => {
    const textArea = {
      style: { overflow: '', height: '' },
      scrollHeight: 120
    } as unknown as HTMLTextAreaElement;
    const { directive } = createDirective(textArea);
    spyOn(directive, 'adjust');

    directive.ngOnInit();

    expect(directive.adjust).toHaveBeenCalled();
  });

  it('should call adjust on input host listener', () => {
    const { directive } = createDirective();
    spyOn(directive, 'adjust');

    directive.onInput();

    expect(directive.adjust).toHaveBeenCalled();
  });

  it('should do nothing when textarea is not found', () => {
    const { directive, querySelector } = createDirective();

    directive.adjust();

    expect(querySelector).toHaveBeenCalledWith('textarea');
  });
});
