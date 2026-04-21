/**
 * Compatibility shim for @uppy/angular v1.1.0 with Angular 21.
 *
 * @uppy/angular v1.1.0 was compiled against Angular 17-20. Angular 21's IVY compiler
 * misidentifies its pre-compiled standalone components as non-standalone when used
 * directly in NgModule `imports` (TS-992011). Declaring them in a traditional NgModule
 * satisfies Angular 21's expectations.
 *
 * Remove this module once @uppy/angular releases Angular 21 support.
 */
import { NgModule } from '@angular/core';
import { DashboardComponent, DashboardModalComponent } from '@uppy/angular';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardModalComponent,
  ],
  exports: [
    DashboardComponent,
    DashboardModalComponent,
  ],
})
export class UppyAngularModule {}
