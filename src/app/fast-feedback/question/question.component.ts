import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup }        from '@angular/forms';

@Component({
	selector: 'question',
	templateUrl: './question.component.html',
})

export class QuestionComponent {
	@Input() question: any[];
	@Input() form: FormGroup;

	constructor() {}
}