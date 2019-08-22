import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoCardComponent } from './todo-card.component';

describe('TodoCardComponent', () => {
  let component: TodoCardComponent;
  let fixture: ComponentFixture<TodoCardComponent>;
  let element: HTMLElement;

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
    element = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading text when loading', () => {
    component.loading = true;
    component.todoItem = {};
    fixture.detectChanges();
    expect(element.querySelector('.icon-item')).toBeFalsy();
    expect(element.textContent).toContain('Loading');
    expect(element.textContent).not.toContain('You have no new notifications');
  });

  it('should display no todo item text when there\'s no todo item', () => {
    component.loading = false;
    component.todoItem = {};
    fixture.detectChanges();
    expect(element.querySelector('.icon-item')).toBeFalsy();
    expect(element.textContent).not.toContain('Loading');
    expect(element.textContent).toContain('You have no new notifications');
  });

  it('should display correct todo item #1', () => {
    const todoItem = {
      type: 'feedback_available',
      name: 'todo name',
      description: 'todo description',
      time: '2019-02-02'
    };
    component.loading = false;
    component.todoItem = todoItem;
    fixture.detectChanges();
    expect(element.querySelector('ion-icon').getAttribute('name')).toEqual('information-circle-outline');
    expect(element.querySelector('.icon-item h4').innerHTML).toContain(todoItem.name);
    expect(element.querySelector('.icon-item ion-text p').innerHTML).toContain(todoItem.description);
    expect(element.querySelector('.time-stamp').innerHTML).toContain(todoItem.time);
    expect(element.textContent).not.toContain('Loading');
    expect(element.textContent).not.toContain('You have no new notifications');
  });

  it('should display correct todo item #2', () => {
    const todoItem = {
      type: 'review_submission',
      name: 'todo name',
      description: 'todo description',
      time: '2019-02-02'
    };
    component.loading = false;
    component.todoItem = todoItem;
    fixture.detectChanges();
    expect(element.querySelector('ion-icon').getAttribute('name')).toEqual('information-circle-outline');
    expect(element.querySelector('.icon-item h4').innerHTML).toContain(todoItem.name);
    expect(element.querySelector('.icon-item ion-text p').innerHTML).toContain(todoItem.description);
    expect(element.querySelector('.time-stamp').innerHTML).toContain(todoItem.time);
    expect(element.textContent).not.toContain('Loading');
    expect(element.textContent).not.toContain('You have no new notifications');
  });

  it('should display correct todo item #3', () => {
    const todoItem = {
      type: 'chat',
      name: 'todo name',
      description: 'todo description',
      time: '2019-02-02'
    };
    component.loading = false;
    component.todoItem = todoItem;
    fixture.detectChanges();
    expect(element.querySelector('ion-icon').getAttribute('name')).toEqual('chatboxes');
    expect(element.querySelector('.icon-item h4').innerHTML).toContain(todoItem.name);
    expect(element.querySelector('.icon-item ion-text p').innerHTML).toContain(todoItem.description);
    expect(element.querySelector('.time-stamp').innerHTML).toContain(todoItem.time);
    expect(element.textContent).not.toContain('Loading');
    expect(element.textContent).not.toContain('You have no new notifications');
  });

  it('should display correct todo item #4', () => {
    const todoItem = {
      type: 'event',
      name: 'todo name',
      description: 'todo description',
      time: '2019-02-02'
    };
    component.loading = false;
    component.todoItem = todoItem;
    fixture.detectChanges();
    expect(element.querySelector('ion-icon').getAttribute('name')).toEqual('calendar');
    expect(element.querySelector('.icon-item h4').innerHTML).toContain(todoItem.name);
    expect(element.querySelector('.icon-item ion-text p').innerHTML).toContain(todoItem.description);
    expect(element.querySelector('.time-stamp').innerHTML).toContain(todoItem.time);
    expect(element.textContent).not.toContain('Loading');
    expect(element.textContent).not.toContain('You have no new notifications');
  });

  it('should display correct todo item #5', () => {
    const todoItem = {
      type: 'assessment_submission_reminder',
      name: 'todo name',
      description: 'todo description',
      time: '2019-02-02'
    };
    component.loading = false;
    component.todoItem = todoItem;
    fixture.detectChanges();
    expect(element.querySelector('ion-icon').getAttribute('name')).toEqual('clipboard');
    expect(element.querySelector('.icon-item h4').innerHTML).toContain(todoItem.name);
    expect(element.querySelector('.icon-item ion-text p').innerHTML).toContain(todoItem.description);
    expect(element.querySelector('.time-stamp').innerHTML).toContain(todoItem.time);
    expect(element.textContent).not.toContain('Loading');
    expect(element.textContent).not.toContain('You have no new notifications');
  });

});
