# Toggle Label Directive

This directive was created to accommodate the use of innerHTML in ion-checkbox and ion-radio labels. It provides a solution for dynamically toggling label content and handling HTML content within Ionic form controls where standard label binding may not be sufficient.

## Problem Statement
The issue arises when clicking on the content within the innerHTML title text of ion-checkbox or ion-radio components. The expected behavior is that clicking the label should toggle the checkbox or radio button state. However, due to the way innerHTML is handled, the click event does not propagate correctly to the underlying input element, preventing the toggle action from occurring. This can lead to a confusing user experience where the label appears clickable but does not perform the intended function.

### Comparison of Implementations

#### Default Recommended Code Implementation
```html
<ion-checkbox [(ngModel)]="isChecked" (click)="toggleCheckbox()">
  <ion-label>Toggle me</ion-label>
</ion-checkbox>
```
In this implementation, clicking the label correctly toggles the checkbox state because the label is directly associated with the checkbox input.

#### Implementation with innerHTML
```html
<ion-checkbox [(ngModel)]="isChecked">
  <ion-label [innerHTML]="dynamicLabel" (click)="toggleCheckbox()"></ion-label>
</ion-checkbox>
```
In this case, while the label appears clickable, the click event does not propagate to the checkbox input, resulting in no toggle action occurring when the label is clicked.

This comparison highlights the importance of using standard label binding to ensure proper functionality in Ionic form controls.

## Purpose
- Enable dynamic label content for Ionic checkbox and radio components
- Support HTML content rendering within form control labels
- Provide consistent label behavior across different form input types

## Usage
Apply this directive to elements that need dynamic label toggling functionality, particularly useful with Ionic form controls that require innerHTML support.

## Note
This directive addresses limitations in standard Ionic label handling where innerHTML content needs to be dynamically managed for checkbox and radio controls.
