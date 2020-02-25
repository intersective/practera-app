import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LinkifyPipe } from '@shared/pipes/linkify/linkify.pipe';

@Component({
  template: `<span>{{ "test something with http://something.com" | linkify }}</span>`
})
class TestComponent {}

describe('LinkifyPipe', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let pipe: LinkifyPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ TestComponent, LinkifyPipe ],
    })
    pipe = new LinkifyPipe();
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });


  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should turn string to anchor link', () => {
    const span = fixture.debugElement.query(By.css('span'));
    fixture.detectChanges();
    console.log(span.nativeElement);
    // const result = pipe.transform('test something with http://something.com');
    // expect(window['linkifyStr']).toHaveBeenCalled();
  });
});
