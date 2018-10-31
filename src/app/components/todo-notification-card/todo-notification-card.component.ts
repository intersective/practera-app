import { Component, OnInit, Input } from '@angular/core';
import { RoleService } from '../../services/role.service';


@Component({
  selector: 'app-todo-notification-card',
  templateUrl: './todo-notification-card.component.html',
  styleUrls: ['./todo-notification-card.component.scss']
})
export class TodoNotificationCardComponent implements OnInit {
   
  role: string = '';
  constructor(public memberRole: RoleService) {
    this.role = memberRole.role;
  };
  
  @Input() notification: {};

  ngOnInit() {
  }

}
