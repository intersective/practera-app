import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { Subject } from 'rxjs';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { UppyUploaderComponent } from './uppy-uploader.component';
import { UppyUploaderService } from './uppy-uploader.service';

describe('Upload size feedback in the app', () => {
  let fixtures: ComponentFixture<any>[];
  let reply: (response: Response) => void;

  beforeEach(async () => {
    fixtures = [];
    spyOn(window, 'fetch').and.callFake(() => new Promise(resolve => { reply = resolve; }));
    const service = new UppyUploaderService(null!, {
      getUser: () => ({ apikey: 'synthetic-test-token' }), clearByName: () => undefined,
    } as any);
    TestBed.configureTestingModule({
      declarations: [UppyUploaderComponent, FileUploadComponent],
      imports: [CommonModule, FormsModule, IonicModule.forRoot()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    TestBed.overrideProvider(UppyUploaderService, { useValue: service });
    await TestBed.compileComponents();
  });

  afterEach(() => fixtures.forEach(fixture => fixture.destroy()));

  function profile() {
    const fixture = TestBed.createComponent(UppyUploaderComponent);
    fixtures.push(fixture);
    fixture.componentInstance.source = 'user-profile';
    fixture.componentInstance.tusEndpoint = 'https://upload.example.test/uploads/';
    fixture.detectChanges();
    return fixture;
  }

  async function ready(fixture: ComponentFixture<any>, bytes: string) {
    reply(new Response(null, { status: 200, headers: { 'Tus-Max-Size': bytes } }));
    await fixture.whenStable();
    fixture.detectChanges();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  it('prevents selecting files before the deployed policy is ready', async () => {
    const fixture = profile();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const picker = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    expect(picker === null || picker.disabled).toBeTrue();
    expect(fixture.componentInstance.uppy.getState().allowNewUpload).toBeFalse();
    await ready(fixture, '8388608');
    expect(fixture.nativeElement.querySelector('input[type="file"]')?.disabled).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Maximum file size: 8 MiB.');
  });

  it('shows the server override and explains oversized selection inside the picker', async () => {
    const fixture = profile();
    await ready(fixture, '10');
    expect(fixture.nativeElement.textContent).toContain('Maximum file size: 10 bytes.');
    const uppy = fixture.componentInstance.uppy;
    expect(() => uppy.addFile({ name: 'large.png', type: 'image/png', data: new Blob(['12345678901'], { type: 'image/png' }) }))
      .toThrowError(/large.png exceeds the 10 bytes limit/);
    await fixture.whenStable();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    expect(uppy.getFiles()).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('Choose a smaller file.');
  });

  it('shows a human-readable assessment limit and preserves the file-type hint', async () => {
    const fixture = TestBed.createComponent(FileUploadComponent);
    fixtures.push(fixture);
    const component = fixture.componentInstance;
    component.source = 'assessment';
    component.control = new FormControl('');
    component.submitActions$ = new Subject();
    component.doAssessment = true;
    component.submission = { answer: null };
    component.question = { id: 1, name: 'Evidence', description: '', isRequired: false, fileType: 'video', audience: ['participant'], canAnswer: true, canComment: false };
    fixture.detectChanges();
    await ready(fixture, '104857600');
    expect(fixture.nativeElement.textContent).toContain('Videos only, up to 100 MiB per file');
    expect(fixture.nativeElement.querySelector('input[type="file"]')?.accept).toBe('video/*');
  });

  it('does not revive a closed uploader when discovery finishes', async () => {
    const fixture = profile();
    fixture.destroy();
    reply(new Response(null, { status: 200, headers: { 'Tus-Max-Size': '10' } }));
    await fixture.whenStable();
    expect(fixture.componentInstance.uppy.getPlugin('Dashboard')).toBeUndefined();
    expect(fixture.componentInstance.uppy.getFiles()).toEqual([]);
  });
});
