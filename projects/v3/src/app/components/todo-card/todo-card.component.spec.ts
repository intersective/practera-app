import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoCardComponent } from './todo-card.component';

class Page {
  // getter properties wait to query the DOM until called.
  get todoCard() {
    return this.query<HTMLElement>('.todo-card');
  }
  get todoItem() {
    return this.query<HTMLElement>('app-list-item');
  }

  fixture: ComponentFixture<TodoCardComponent>;

  constructor(fixture: ComponentFixture<TodoCardComponent>) {
    this.fixture = fixture;
  }

  //// query helpers ////
  private query<T>(selector: string): T {
    return this.fixture.nativeElement.querySelector(selector);
  }

  private queryAll<T>(selector: string): T[] {
    return this.fixture.nativeElement.querySelectorAll(selector);
  }
}

describe('TodoCardComponent', () => {
  let component: TodoCardComponent;
  let fixture: ComponentFixture<TodoCardComponent>;
  let page: Page;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ TodoCardComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoCardComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display no todo item text when there\'s no todo item', () => {
    component.loading = false;
    component.todoItem = {};
    fixture.detectChanges();
    expect(page.todoItem).toBeFalsy();
    expect(page.todoCard.textContent).toContain('You have no new notifications');
  });

  it('should display correct todo item', () => {
    const todoItem = {
      type: 'feedback_available',
      name: 'todo name',
      description: 'todo description',
      time: '2019-02-02'
    };
    component.loading = false;
    component.todoItem = todoItem;
    fixture.detectChanges();
    expect(page.todoCard.textContent).not.toContain('You have no new notifications');
  });

});
