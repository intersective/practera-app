import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoNotificationCardComponent } from './todo-notification-card.component';

describe('FeedbackComponent', () => {
  let component: TodoNotificationCardComponent;
  let fixture: ComponentFixture<TodoNotificationCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodoNotificationCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoNotificationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
