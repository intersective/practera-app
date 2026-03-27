// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import '@angular/localize/init';
import 'zone.js';
import 'zone.js/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { ModalController, PopoverController, AngularDelegate } from '@ionic/angular';
import { Apollo } from 'apollo-angular';

declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    <T>(id: string): T;
    keys(): string[];
  };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  {
    teardown: { destroyAfterEach: true }
  }
);

// global fallback providers for ionic overlay controllers and commonly-injected
// root services. these prevent NullInjectorError / "is not a function" errors
// during component teardown (destroyAfterEach: true). specs that need the REAL
// service must re-call TestBed.overrideProvider() before compileComponents().
beforeEach(() => {
  const mockOverlay = {
    present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
    dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
    onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: null, role: undefined })),
    onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ data: null, role: undefined })),
  };

  TestBed.overrideProvider(ModalController, {
    useValue: jasmine.createSpyObj('ModalController', {
      create: Promise.resolve(mockOverlay),
      dismiss: Promise.resolve(),
      getTop: Promise.resolve(null),
    }),
  });
  TestBed.overrideProvider(PopoverController, {
    useValue: jasmine.createSpyObj('PopoverController', {
      create: Promise.resolve(mockOverlay),
      dismiss: Promise.resolve(),
    }),
  });
  TestBed.overrideProvider(AngularDelegate, {
    useValue: jasmine.createSpyObj('AngularDelegate', ['create']),
  });
  TestBed.overrideProvider(Apollo, {
    useValue: jasmine.createSpyObj('Apollo', ['use', 'watchQuery', 'mutate', 'query']),
  });
});

