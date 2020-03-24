import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RequestModule } from './request.module';

describe('RequestModule', () => {
  let requestModule: RequestModule;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RequestModule.forRoot({
          appkey: 'TEST',
          prefixUrl: 'TEST',
        }),
      ],
    });

    requestModule = TestBed.inject(RequestModule);
  });

  it(`should provide services`, () => {
    expect(requestModule).toBeTruthy();
  });

  it(`should do something`, () => {
    expect(() => new RequestModule(class AnyModule {})).toThrow(new Error('RequestModule is already loaded. Import it in the AppModule only'));
  });
});
