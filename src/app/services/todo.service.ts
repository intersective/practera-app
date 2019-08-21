import { BrowserStorageService } from '@services/storage.service';
import { Injectable } from '@angular/core';
import { RequestService } from '@shared/request/request.service';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const API = {
  todoItem: 'api/v2/motivations/todo_item/list.json',
};

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  todo$: Subject<any> = new Subject<any>();

  constructor(
    private request: RequestService,
    private storage: BrowserStorageService,
  ) {}

  getItems(): Observable<any> {
    const { projectId } = this.storage.getUser();

    return this.request.get(API.todoItem, {
      params: {
        project_id: projectId
      }
    }).pipe(map(response => {
      this.todo$.next(response);
      return response;
    }));
  }
}
