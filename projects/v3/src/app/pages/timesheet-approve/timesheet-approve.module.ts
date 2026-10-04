import { NgModule } from '@angular/core';
import { TimesheetApprovePage } from './timesheet-approve.page';
import { TimesheetApproveRoutingModule } from './timesheet-approve-routing.module';
import { ComponentsModule } from '@v3/app/components/components.module';

@NgModule({
  imports: [ComponentsModule, TimesheetApproveRoutingModule],
  declarations: [TimesheetApprovePage],
})
export class TimesheetApproveModule {}
