import { NgModule } from '@angular/core';
import { ComponentsModule } from '@v3/app/components/components.module';
import { BadgesCertificatesPageRoutingModule } from './badges-certificates-routing.module';
import { BadgesCertificatesPage } from './badges-certificates.page';

@NgModule({
  imports: [
    ComponentsModule,
    BadgesCertificatesPageRoutingModule,
  ],
  declarations: [BadgesCertificatesPage],
})
export class BadgesCertificatesPageModule {}
