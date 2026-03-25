import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { FilePopupComponent } from './file-popup.component';

describe('FilePopupComponent', () => {
  let component: FilePopupComponent;
  let modalController: jasmine.SpyObj<ModalController>;

  beforeEach(() => {
    modalController = jasmine.createSpyObj<ModalController>('ModalController', ['dismiss']);
    component = new FilePopupComponent(modalController, {} as DomSanitizer);
    component.file = { url: 'https://example.com/file.pdf' };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open file on download without keyboard event', () => {
    spyOn(window, 'open');

    component.download();

    expect(window.open).toHaveBeenCalledWith('https://example.com/file.pdf', '_system');
  });

  it('should prevent default and download on keyboard Space', () => {
    spyOn(window, 'open');
    const keyboardEvent = jasmine.createSpyObj<KeyboardEvent>('KeyboardEvent', ['preventDefault'], {
      code: 'Space'
    });

    component.download(keyboardEvent);

    expect(keyboardEvent.preventDefault).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith('https://example.com/file.pdf', '_system');
  });

  it('should not download for unsupported keyboard key', () => {
    spyOn(window, 'open');
    const keyboardEvent = jasmine.createSpyObj<KeyboardEvent>('KeyboardEvent', ['preventDefault'], {
      code: 'Escape'
    });

    component.download(keyboardEvent);

    expect(keyboardEvent.preventDefault).not.toHaveBeenCalled();
    expect(window.open).not.toHaveBeenCalled();
  });

  it('should close modal without keyboard event', () => {
    component.close();

    expect(modalController.dismiss).toHaveBeenCalled();
  });

  it('should prevent default and close modal on keyboard Enter', () => {
    const keyboardEvent = jasmine.createSpyObj<KeyboardEvent>('KeyboardEvent', ['preventDefault'], {
      code: 'Enter'
    });

    component.close(keyboardEvent);

    expect(keyboardEvent.preventDefault).toHaveBeenCalled();
    expect(modalController.dismiss).toHaveBeenCalled();
  });

  it('should not close modal for unsupported keyboard key', () => {
    const keyboardEvent = jasmine.createSpyObj<KeyboardEvent>('KeyboardEvent', ['preventDefault'], {
      code: 'Tab'
    });

    component.close(keyboardEvent);

    expect(keyboardEvent.preventDefault).not.toHaveBeenCalled();
    expect(modalController.dismiss).not.toHaveBeenCalled();
  });
});
