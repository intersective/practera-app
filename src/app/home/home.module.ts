import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { HomeComponent } from './home.component';
import { HomeRoutingComponent } from './home-routing.component';
import { HomeRoutingModule } from './home-routing.module';
import { TodoCardComponent } from './todo-card/todo-card.component';
import { SlidableComponent } from './slidable/slidable.component';

@NgModule({
  imports: [
    SharedModule,
    // HomeRoutingModule,
  ],
  declarations: [
    HomeComponent,
    // HomeRoutingComponent,
    TodoCardComponent,
    SlidableComponent
  ],
})
export class HomeModule {
}
