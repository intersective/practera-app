import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';

import { ListItemComponent } from './list-item.component';

@Component({
  standalone: false,
  template: `<app-list-item
    [title]="title"
    [isEventItem]="isEventItem"
    [loading]="loading"
    [eventDayCount]="null"
    titleColor="sample-100"
  ></app-list-item>`
})
class TestHostComponent {
  title = 'Test Title';
  isEventItem = true;
  loading = false;
}

describe('ListItemComponent', () => {
  let testHost: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let listItemComponent: ListItemComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ListItemComponent, TestHostComponent],
      imports: [IonicModule.forRoot()] // Add other necessary modules here
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    fixture.detectChanges();

    // const listItemDebugElement: DebugElement = fixture.debugElement.componentInstance.debugElement.query(By.directive(ListItemComponent));
    const listItemDebugElement: DebugElement = fixture.debugElement.query(By.directive(ListItemComponent));
    listItemComponent = listItemDebugElement.componentInstance as ListItemComponent;
  });


  it('should create', () => {
    expect(testHost).toBeTruthy();
    expect(listItemComponent).toBeTruthy();
  });

  it('should display the title', () => {
    testHost.isEventItem = true;
    testHost.loading = false;
    fixture.detectChanges();

    const listItemDe: DebugElement = fixture.debugElement.query(By.css('[role="heading"]'));
    const listItemEl: HTMLElement = listItemDe.nativeElement;

    // the title is rendered via innerHTML and may have extra whitespace
    expect(listItemEl.textContent.trim()).toEqual(testHost.title);
  });

  it('should return correct description', () => {
    expect(listItemComponent.statusDescriptions('lock-closed')).toEqual('locked');
    expect(listItemComponent.statusDescriptions('chevron-forward')).toEqual(null);
    expect(listItemComponent.statusDescriptions('checkmark-circle')).toEqual('completed');
    expect(listItemComponent.statusDescriptions('non-existing-icon')).toEqual(null);
  });
});
