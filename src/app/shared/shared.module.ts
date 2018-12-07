import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@Ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivityCardComponent } from './components/activity-card/activity-card.component';
import { TodoCardComponent } from './components/todo-card/todo-card.component';

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
	],
	declarations: [
		ActivityCardComponent,
		TodoCardComponent,
	],
	exports: [
		ActivityCardComponent,
		TodoCardComponent,
	],
})
export class SharedModule {}