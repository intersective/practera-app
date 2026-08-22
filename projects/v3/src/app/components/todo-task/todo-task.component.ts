import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TodoGroupData, TodoTaskItem } from '@v3/app/services/activity.service';
import { ApolloService } from '@v3/app/services/apollo.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-todo-task',
  templateUrl: './todo-task.component.html',
  styleUrls: ['./todo-task.component.scss'],
})
export class TodoTaskComponent implements OnChanges {
  @Input() todoGroup: TodoGroupData;
  @Input() teamId: number;

  loading = false;
  addingItem = false;
  newItemTitle = '';
  actionInProgress: Record<number, boolean> = {};

  get totalItems(): number { return this.todoGroup?.items?.length ?? 0; }
  get completedItems(): number { return this.todoGroup?.items?.filter(i => i.status === 'complete').length ?? 0; }
  get progressPct(): number { return this.totalItems > 0 ? Math.round(this.completedItems / this.totalItems * 100) : 0; }

  constructor(
    private apollo: ApolloService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['todoGroup']) {
      this.actionInProgress = {};
    }
  }

  trackItem(_: number, item: TodoTaskItem): number {
    return item.id;
  }

  isOverdue(item: TodoTaskItem): boolean {
    if (!item.dueDate || item.status === 'complete') return false;
    return new Date(item.dueDate) < new Date();
  }

  canClaim(item: TodoTaskItem): boolean {
    return !item.assigneeId && item.status !== 'complete';
  }

  canTakeOver(item: TodoTaskItem): boolean {
    return !!item.assigneeId && item.status !== 'complete';
  }

  canComplete(item: TodoTaskItem): boolean {
    return !!item.assigneeId && item.status !== 'complete';
  }

  canPraise(item: TodoTaskItem): boolean {
    return item.status === 'complete';
  }

  async claimItem(item: TodoTaskItem) {
    if (this.actionInProgress[item.id]) return;
    if (!this.teamId) {
      alert($localize`:alert|no team assigned:You must be assigned to a team to take on todo items.`);
      return;
    }
    this.actionInProgress[item.id] = true;
    try {
      await firstValueFrom(this.apollo.graphQLMutate(
        `mutation ClaimTodoItem($itemId: Int!) {
          claimTodoItem(itemId: $itemId) {
            id status assigneeId
          }
        }`,
        { itemId: item.id }
      ));
      
      item.status = 'in_progress';
    } catch (e) {
      console.error("Todo item action failed", e);
    } finally {
      this.actionInProgress[item.id] = false;
    }
  }

  async takeOverItem(item: TodoTaskItem) {
    if (!confirm($localize`:confirmation:Take over this item from another team member?`)) return;
    if (this.actionInProgress[item.id]) return;
    this.actionInProgress[item.id] = true;
    try {
      await firstValueFrom(this.apollo.graphQLMutate(
        `mutation TakeOverTodoItem($itemId: Int!) {
          takeOverTodoItem(itemId: $itemId) {
            id status assigneeId
          }
        }`,
        { itemId: item.id }
      ));
      
      item.status = 'in_progress';
    } catch (e) {
      console.error("Todo item action failed", e);
    } finally {
      this.actionInProgress[item.id] = false;
    }
  }

  async completeItem(item: TodoTaskItem) {
    if (this.actionInProgress[item.id]) return;
    this.actionInProgress[item.id] = true;
    try {
      await firstValueFrom(this.apollo.graphQLMutate(
        `mutation CompleteTodoItem($itemId: Int!) {
          completeTodoItem(itemId: $itemId) {
            id status completedAt completedBy
          }
        }`,
        { itemId: item.id }
      ));
      item.status = 'complete';
      
      item.completedAt = new Date().toISOString();
    } catch (e) {
      console.error("Todo item action failed", e);
    } finally {
      this.actionInProgress[item.id] = false;
    }
  }

  async praiseItem(item: TodoTaskItem) {
    if (this.actionInProgress[item.id]) return;
    this.actionInProgress[item.id] = true;
    try {
      await firstValueFrom(this.apollo.graphQLMutate(
        `mutation PraiseTodoItem($itemId: Int!) {
          praiseTodoItem(itemId: $itemId) {
            id praise praiseCount
          }
        }`,
        { itemId: item.id }
      ));
      if (!item.praise) item.praise = [];
      
      item.praiseCount = item.praise.length;
    } catch (e) {
      console.error("Todo item action failed", e);
    } finally {
      this.actionInProgress[item.id] = false;
    }
  }

  async addItem() {
    const title = this.newItemTitle.trim();
    if (!title) return;
    if (!this.teamId) {
      alert($localize`:alert|no team assigned:You must be assigned to a team to add todo items.`);
      return;
    }
    this.loading = true;
    try {
      const res = await firstValueFrom(this.apollo.graphQLMutate(
        `mutation AddTodoItem($groupId: Int!, $input: TodoItemMemberInput!) {
          addTodoItem(groupId: $groupId, input: $input) {
            id title description estimatedHours dueDate status assigneeId praiseCount
            isAdminDefined createdBy order praise assignmentHistory { userId action fromUserId at }
          }
        }`,
        { groupId: this.todoGroup.id, input: { title } }
      ));
      const newItem = res?.data?.addTodoItem;
      if (newItem) {
        this.todoGroup.items.push(newItem);
        this.newItemTitle = '';
        this.addingItem = false;
      }
    } catch (e) {
      console.error("Todo item action failed", e);
    } finally {
      this.loading = false;
    }
  }
}
