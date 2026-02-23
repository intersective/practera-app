# Unit Testing Guide for Practera AppV2

> Comprehensive guide for debugging, fixing, and maintaining unit tests in the Angular/Ionic 7 application.

## Table of Contents

1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Common Failure Patterns & Solutions](#common-failure-patterns--solutions)
4. [Mocking Patterns](#mocking-patterns)
5. [Async Testing Patterns](#async-testing-patterns)
6. [Angular Forms Testing](#angular-forms-testing)
7. [Component Testing Best Practices](#component-testing-best-practices)
8. [Service Testing Best Practices](#service-testing-best-practices)
9. [Debugging Strategies](#debugging-strategies)
10. [Code Standards](#code-standards)
11. [Coverage Run Cookbook](#coverage-run-cookbook)

---

## Overview

This project uses:
- **Test Runner**: Karma with Jasmine
- **Framework**: Angular 17 with Ionic 7
- **Total Tests**: ~900 tests
- **Test Location**: `*.spec.ts` files alongside source files

### Running Tests

```bash
# run all tests
npm test

# run tests with output logging
npm test 2>&1 | tee test-run.log

# run specific test file (modify karma.conf.js or use fdescribe/fit)
```

### Coverage Run Cookbook

- Quick copy-paste coverage commands are in [coverage-run-cookbook.md](./coverage-run-cookbook.md).

---

## Test Environment Setup

### TestBed Configuration Pattern

```typescript
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let serviceSpy: jasmine.SpyObj<MyService>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      declarations: [MyComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: MyService,
          useValue: jasmine.createSpyObj('MyService', ['method1', 'method2'])
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    serviceSpy = TestBed.inject(MyService) as jasmine.SpyObj<MyService>;
    
    // setup default spy return values
    serviceSpy.method1.and.returnValue(of(mockData));
  });
});
```

### Schema Usage

| Schema | Purpose |
|--------|---------|
| `CUSTOM_ELEMENTS_SCHEMA` | Suppresses errors for unknown custom elements (ionic components, child components) |
| `NO_ERRORS_SCHEMA` | Suppresses all template validation errors |

**Best Practice**: Use both schemas together to avoid template-related test failures when testing component logic:

```typescript
schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
```

---

## Common Failure Patterns & Solutions

### 1. NG01203: No Value Accessor for Form Control

**Error Message:**
```
Error: NG01203: No value accessor for form control name: 'q-123'
```

**Cause**: Custom elements with `formControlName` directive don't implement `ControlValueAccessor`.

**Solution**: Create a mock `ControlValueAccessor` directive in the test file:

```typescript
import { Directive, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

/**
 * mock value accessor directive to satisfy formControlName bindings
 * on custom elements like app-text, app-oneof, etc.
 */
@Directive({
  selector: '[formControlName]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockValueAccessorDirective),
      multi: true
    }
  ]
})
class MockValueAccessorDirective implements ControlValueAccessor {
  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
}

// add to declarations
TestBed.configureTestingModule({
  declarations: [MyComponent, MockValueAccessorDirective],
  // ...
});
```

### 2. Spy Was Never Called

**Error Message:**
```
Expected spy someMethod to have been called.
```

**Common Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Method signature changed | Update spy to match new method name/parameters |
| Async timing issue | Use `fakeAsync`/`tick()` or `async`/`await` |
| Component logic changed | Update test to reflect new implementation |
| Wrong service being called | Check if service was refactored to use different service |

**Example Fix** (SettingsPage openSupportPopup):
```typescript
// BEFORE: Component used hubspotService.openSupportPopup()
expect(hubspotServiceSpy.openSupportPopup).toHaveBeenCalled();

// AFTER: Component now uses notificationsService.modal()
notificationsServiceSpy.modal.and.returnValue(Promise.resolve({
  present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
}));
// trigger the action
await component.openSupportPopup();
expect(notificationsServiceSpy.modal).toHaveBeenCalled();
```

### 3. Cannot Read Properties of Undefined

**Error Message:**
```
TypeError: Cannot read properties of undefined (reading 'someProperty')
```

**Common Causes & Solutions:**

```typescript
// cause 1: service method not mocked
serviceSpy.getUser.and.returnValue({ id: 1, name: 'Test' });

// cause 2: async method needs proper mock
serviceSpy.modal.and.returnValue(Promise.resolve({
  present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
}));

// cause 3: @input not initialized
component.btnDisabled$ = new BehaviorSubject(false);
component.savingMessage$ = new BehaviorSubject('');

// cause 4: component property not initialized
component.form = {
  nativeElement: {
    querySelector: jasmine.createSpy('querySelector').and.returnValue({
      classList: { add: jasmine.createSpy('add') }
    })
  }
} as any;
```

### 4. Timer-Related Failures in fakeAsync

**Error Message:**
```
Error: 1 timer(s) still in the queue.
```

**Solution**: Use `flush()` to clear all pending timers:

```typescript
it('should handle timers', fakeAsync(() => {
  component.doSomething();
  tick(300); // advance specific time
  
  // verify expectations
  expect(component.result).toBe(true);
  
  // clear any remaining timers
  flush();
}));
```

### 5. Observable Not Completing

**Error Message:**
```
Error: Timeout - Async callback was not invoked within 5000ms
```

**Solution**: Ensure observables complete or use `take(1)`:

```typescript
// in test setup
serviceSpy.getData.and.returnValue(of(mockData)); // of() completes immediately

// for subjects that don't complete
const subject = new BehaviorSubject(mockData);
serviceSpy.data$ = subject.asObservable();
// later in test
subject.complete(); // or use takeUntil pattern
```

### 6. ExpressionChangedAfterItHasBeenCheckedError

**Error Message:**
```
Error: ExpressionChangedAfterItHasBeenCheckedError
```

**Solution**: Trigger change detection properly:

```typescript
it('should update view', () => {
  component.someProperty = 'new value';
  fixture.detectChanges(); // trigger change detection
  
  expect(page.element.textContent).toContain('new value');
});
```

---

## Mocking Patterns

### Service Spies with jasmine.createSpyObj

```typescript
// basic spy with methods
const serviceSpy = jasmine.createSpyObj('ServiceName', ['method1', 'method2']);

// spy with properties
const serviceSpy = jasmine.createSpyObj('ServiceName', ['method1'], {
  property1: 'value',
  observable$: of(mockData)
});

// configure return values
serviceSpy.method1.and.returnValue(of(result));
serviceSpy.method2.and.returnValue(Promise.resolve(result));
serviceSpy.method3.and.throwError(new Error('test error'));
```

### Mock Router

```typescript
class MockRouter {
  navigate = jasmine.createSpy('navigate');
  navigateByUrl = jasmine.createSpy('navigateByUrl');
  events = of(new NavigationEnd(1, '/', '/'));
}

// in providers
{ provide: Router, useClass: MockRouter }
```

### Mock ActivatedRoute

```typescript
{
  provide: ActivatedRoute,
  useValue: {
    snapshot: {
      paramMap: convertToParamMap({
        id: 1,
        activityId: 2
      }),
      data: {
        action: 'assessment'
      }
    },
    params: of({ id: 1 }),
    queryParams: of({ filter: 'active' })
  }
}
```

### Mock Modal Controller

```typescript
const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss']);
const mockModal = {
  present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
  dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
  onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: null }))
};
modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal));
```

### Mock BehaviorSubject Input

```typescript
// when component has @Input() that is a BehaviorSubject
beforeEach(() => {
  component.btnDisabled$ = new BehaviorSubject(false);
  component.savingMessage$ = new BehaviorSubject('');
});

// test value changes
it('should react to input changes', () => {
  component.btnDisabled$.next(true);
  fixture.detectChanges();
  expect(component.isDisabled).toBe(true);
});
```

---

## Async Testing Patterns

### fakeAsync with tick

Use for timer-based operations (setTimeout, setInterval, debounce):

```typescript
it('should handle debounced input', fakeAsync(() => {
  component.onSearchChange('test');
  
  // advance time past debounce period
  tick(300);
  
  expect(serviceSpy.search).toHaveBeenCalledWith('test');
  
  // clear remaining timers
  flush();
}));
```

### fakeAsync with flushMicrotasks

Use for Promise-based operations:

```typescript
it('should handle promises', fakeAsync(() => {
  component.loadData();
  
  // resolve all pending promises
  flushMicrotasks();
  
  expect(component.data).toBeDefined();
}));
```

### async/await Pattern

Use for straightforward async operations:

```typescript
it('should load data', async () => {
  serviceSpy.getData.and.returnValue(Promise.resolve(mockData));
  
  await component.loadData();
  
  expect(component.data).toEqual(mockData);
});
```

### Combining fakeAsync with Promises

```typescript
it('should handle mixed async', fakeAsync(() => {
  serviceSpy.modal.and.returnValue(Promise.resolve({
    present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
  }));
  
  component.openModal();
  
  // handle promise resolution
  tick();
  
  expect(serviceSpy.modal).toHaveBeenCalled();
  flush();
}));
```

---

## Angular Forms Testing

### Pre-creating Form Controls

When testing components that dynamically add form controls:

```typescript
it('should handle dynamic form controls', fakeAsync(() => {
  // pre-create form controls before triggering ngOnChanges
  mockQuestions.forEach(q => {
    component.questionsForm.addControl('q-' + q.id, new FormControl(null));
  });
  
  component.ngOnChanges({ submission: {} as any });
  tick(350);
  
  expect(component.questionsForm.valid).toBe(false);
  flush();
}));
```

### Testing Form Validation

```typescript
it('should validate required fields', () => {
  component.form.controls['email'].setValue('');
  expect(component.form.controls['email'].valid).toBe(false);
  expect(component.form.controls['email'].errors?.['required']).toBe(true);
  
  component.form.controls['email'].setValue('test@example.com');
  expect(component.form.controls['email'].valid).toBe(true);
});
```

### Testing Form Submission

```typescript
it('should submit valid form', fakeAsync(() => {
  component.form.patchValue({
    email: 'test@example.com',
    password: 'password123'
  });
  
  component.onSubmit();
  tick();
  
  expect(serviceSpy.login).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  });
}));
```

---

## Component Testing Best Practices

### Page Object Pattern

Create a Page class to encapsulate DOM queries:

```typescript
class Page {
  get submitButton() {
    return this.query<HTMLButtonElement>('#btn-submit');
  }
  
  get errorMessage() {
    return this.query<HTMLElement>('.error-message');
  }
  
  get inputFields() {
    return this.queryAll<HTMLInputElement>('input');
  }
  
  fixture: ComponentFixture<MyComponent>;
  
  constructor(fixture: ComponentFixture<MyComponent>) {
    this.fixture = fixture;
  }
  
  private query<T>(selector: string): T {
    return this.fixture.nativeElement.querySelector(selector);
  }
  
  private queryAll<T>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }
}

// usage in tests
let page: Page;

beforeEach(() => {
  fixture = TestBed.createComponent(MyComponent);
  page = new Page(fixture);
});

it('should disable submit when form invalid', () => {
  fixture.detectChanges();
  expect(page.submitButton.disabled).toBe(true);
});
```

### Testing @Input Changes

```typescript
it('should react to input changes', () => {
  component.data = mockData;
  component.ngOnChanges({
    data: new SimpleChange(null, mockData, true)
  });
  
  expect(component.processedData).toBeDefined();
});
```

### Testing @Output Events

```typescript
it('should emit event on action', () => {
  const emitSpy = spyOn(component.dataChanged, 'emit');
  
  component.updateData(newData);
  
  expect(emitSpy).toHaveBeenCalledWith(newData);
});
```

---

## Service Testing Best Practices

### Testing HTTP Calls

```typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });
    
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify(); // verify no outstanding requests
  });
  
  it('should fetch data', () => {
    const mockResponse = { id: 1, name: 'Test' };
    
    service.getData().subscribe(data => {
      expect(data).toEqual(mockResponse);
    });
    
    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
```

### Testing GraphQL with Apollo

```typescript
import { ApolloTestingModule, ApolloTestingController } from 'apollo-angular/testing';

describe('GraphQLService', () => {
  let service: GraphQLService;
  let apolloController: ApolloTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [GraphQLService]
    });
    
    service = TestBed.inject(GraphQLService);
    apolloController = TestBed.inject(ApolloTestingController);
  });
  
  it('should execute query', () => {
    service.getUser(1).subscribe(user => {
      expect(user.name).toBe('Test User');
    });
    
    const op = apolloController.expectOne('GetUser');
    op.flush({
      data: {
        user: { id: 1, name: 'Test User' }
      }
    });
  });
});
```

---

## Debugging Strategies

### 1. Isolate Failing Tests

```typescript
// run only this describe block
fdescribe('MyComponent', () => { ... });

// run only this test
fit('should do something', () => { ... });

// skip tests temporarily
xdescribe('SkippedSuite', () => { ... });
xit('skipped test', () => { ... });
```

### 2. Log Output Analysis

```bash
# run tests with output to file
npm test 2>&1 | tee test-run.log

# search for failures (accounting for ANSI codes)
grep -A 20 "FAILED" test-run.log

# count failures
grep -c "FAILED" test-run.log
```

### 3. Read Test Logs Systematically

When logs have ANSI escape codes:
1. Read the log file in chunks using `read_file` tool
2. Look for pattern `(X FAILED)` where X > 0
3. The test name appears just before the FAILED count increments

### 4. Console Logging in Tests

```typescript
it('should process data', () => {
  console.log('Input:', component.input);
  component.process();
  console.log('Output:', component.output);
  expect(component.output).toBeDefined();
});
```

### 5. Debugging Spy Calls

```typescript
it('should call service correctly', () => {
  component.doSomething();
  
  // log all calls made to the spy
  console.log('Calls:', serviceSpy.method.calls.all());
  console.log('Call count:', serviceSpy.method.calls.count());
  console.log('First call args:', serviceSpy.method.calls.first()?.args);
  
  expect(serviceSpy.method).toHaveBeenCalled();
});
```

### 6. Common Error Patterns to Search

| Error Pattern | Likely Cause |
|---------------|--------------|
| `NG01203` | Missing ControlValueAccessor |
| `Cannot read properties of undefined` | Unmocked service/property |
| `timer(s) still in the queue` | Missing flush() in fakeAsync |
| `Async callback was not invoked` | Observable not completing |
| `Expected spy X to have been called` | Method renamed or logic changed |
| `ExpressionChangedAfterItHasBeenChecked` | Missing fixture.detectChanges() |

---

## Code Standards

### Test File Naming

- Test files must be named `*.spec.ts`
- Place test files alongside source files

### Test Structure

```typescript
describe('ComponentName', () => {
  // setup
  
  describe('methodName()', () => {
    it('should [expected behavior] when [condition]', () => {
      // arrange
      // act
      // assert
    });
  });
});
```

### Naming Conventions

- Use descriptive test names that explain the expected behavior
- Start with "should" for consistency
- Include the condition being tested

```typescript
// good
it('should disable submit button when form is invalid', () => {});
it('should display error message when login fails', () => {});

// avoid
it('test 1', () => {});
it('works', () => {});
```

### Assertion Best Practices

```typescript
// prefer specific matchers
expect(value).toBe(true);           // for booleans
expect(value).toEqual(expected);    // for objects/arrays
expect(value).toContain('text');    // for strings/arrays
expect(value).toBeDefined();        // for existence
expect(value).toBeNull();           // for null checks

// use toBeTrue()/toBeFalse() for explicit boolean checks
expect(component.isValid).toBeTrue();
expect(component.hasErrors).toBeFalse();
```

### Cleanup

Always clean up subscriptions and timers:

```typescript
afterEach(() => {
  // if using fakeAsync
  flush();
  
  // clean up subscriptions
  subscription?.unsubscribe();
});
```

---

## Quick Reference: Fix Checklist

When fixing failing tests, check these in order:

1. **Is the service mock configured correctly?**
   - All used methods are in the spy object
   - Return values are set up before triggering the action

2. **Are async operations handled?**
   - Use `fakeAsync`/`tick()`/`flush()` for timers
   - Use `async`/`await` for promises
   - Ensure observables complete

3. **Are form controls set up correctly?**
   - Pre-create dynamic form controls
   - Use MockValueAccessorDirective for custom elements

4. **Is change detection triggered?**
   - Call `fixture.detectChanges()` after property changes

5. **Are @Input properties initialized?**
   - Set BehaviorSubject inputs in beforeEach
   - Initialize required input properties

6. **Has the component implementation changed?**
   - Check if methods were renamed
   - Check if different services are now being used
   - Update test to match new implementation

---

## Appendix: Common Imports

```typescript
// angular testing
import { ComponentFixture, TestBed, fakeAsync, tick, flush, flushMicrotasks } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// angular core
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, Directive, forwardRef } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

// angular router
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';

// rxjs
import { of, BehaviorSubject, Subject, throwError } from 'rxjs';

// project test utilities
import { TestUtils } from '@testingv3/utils';
import { MockRouter, FastFeedbackServiceMock } from '@testingv3/mocked.service';
```

---

*Last updated: December 2025*
*Based on fixing 120 failing tests down to 0 failures*
