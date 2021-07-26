import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ApolloModule as ApolloAngular } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http';

@NgModule({
  declarations: [],
  imports: [
    ApolloAngular,
    HttpLinkModule,
    CommonModule,
  ],
  providers: []
})
export class ApolloModule {}
