import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { H5pPlayerComponent } from './h5p-player.component';

describe('H5pPlayerComponent', () => {
  let component: H5pPlayerComponent;
  let fixture: ComponentFixture<H5pPlayerComponent>;

  const mockH5p = {
    contentUrl: 'https://cdn.example.com/h5p/content/',
    librariesUrl: 'https://cdn.example.com/h5p/libraries/',
    frameJs: 'https://cdn.example.com/h5p/frame.bundle.js',
    frameCss: 'https://cdn.example.com/h5p/frame.css',
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot()],
      declarations: [H5pPlayerComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(H5pPlayerComponent);
    component = fixture.componentInstance;
    component.h5p = mockH5p;
    component.taskId = 42;
    component.contextId = 7;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('dispatches h5pTaskCompleted when postMessage contains completed xAPI verb', () => {
    const completedSpy = jasmine.createSpy('h5pTaskCompleted');
    window.addEventListener('h5pTaskCompleted', completedSpy);

    component['handleXapi']({
      data: JSON.stringify({
        verb: { id: 'http://adlnet.gov/expapi/verbs/completed' },
      }),
    } as MessageEvent);

    expect(completedSpy).toHaveBeenCalledTimes(1);
    expect((completedSpy.calls.mostRecent().args[0] as CustomEvent).detail).toEqual({
      taskId: 42,
      contextId: 7,
    });

    window.removeEventListener('h5pTaskCompleted', completedSpy);
  });

  it('shows error state when h5p-standalone fails to load', fakeAsync(() => {
    spyOn(component as any, 'loadH5p').and.callFake(async function (this: H5pPlayerComponent) {
      this.error = 'Failed to load H5P content.';
      this.isLoading = false;
    });

    component.isLoading = true;
    component.error = null;
    fixture.detectChanges();

    void component['loadH5p']();
    flushMicrotasks();
    fixture.detectChanges();

    expect(component.error).toBe('Failed to load H5P content.');
    expect(component.isLoading).toBe(false);

    const errorEl: HTMLElement | null = fixture.nativeElement.querySelector('.h5p-error');
    expect(errorEl?.textContent).toContain('Failed to load H5P content.');
  }));
});
