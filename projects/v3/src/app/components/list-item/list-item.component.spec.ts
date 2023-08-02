import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';

import { ListItemComponent } from './list-item.component';

@Component({
  template: `<app-list-item
    [title]="title"
    [eventDayCount]="null"
    titleColor="sample-100"
  ></app-list-item>`
})
class TestHostComponent {
  title = 'Test Title';
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
    listItemComponent.isEventItem = true;
    listItemComponent.loading = false;
    fixture.detectChanges();

    const listItemDe: DebugElement = fixture.debugElement.query(By.css('.item-title'));
    const listItemEl: HTMLElement = listItemDe.nativeElement;
    console.log(listItemEl);

    expect(listItemEl.textContent).toEqual(testHost.title);
  });

  it('should return correct description', () => {
    expect(listItemComponent.statusDescriptions('lock-closed')).toEqual('locked');
    expect(listItemComponent.statusDescriptions('chevron-forward')).toEqual(null);
    expect(listItemComponent.statusDescriptions('checkmark-circle')).toEqual('completed');
    expect(listItemComponent.statusDescriptions('non-existing-icon')).toEqual(null);
  });
});
