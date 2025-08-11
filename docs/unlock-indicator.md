# Unlock Indicator: Implementation and Integration

This document explains how the “unlock indicator” (red dot) is implemented, how it’s stored and updated, and how it appears in the UI across the Home page and list items.

## Files involved
- Service: `projects/v3/src/app/services/unlock-indicator.service.ts`
- Home page (TS): `projects/v3/src/app/pages/home/home.page.ts`
- Home page (HTML): `projects/v3/src/app/pages/home/home.page.html`
- List item component (HTML): `projects/v3/src/app/components/list-item/list-item.component.html`

## Concept overview
The unlock indicator shows a red dot next to activities that have been “unlocked” by some trigger (e.g., a milestone or task completion). These indicators are persisted in browser storage and exposed via an RxJS observable so that UI can reactively render the dots.

## Data model and storage
- Interface: `UnlockedTask`
  - Fields: `milestoneId?`, `activityId?`, `taskId?`, plus optional metadata.
- State: A `BehaviorSubject<UnlockedTask[]>` holds all unlocked items.
- Persistence: Items are saved to `BrowserStorageService` under the key `unlockedTasks` and rehydrated in the service constructor.

### Key service members
- `unlockedTasks$`: Observable emitting the current list of unlocked entries.
- `unlockTasks(data: UnlockedTask[])`: Merges new unlocks with existing ones and de-duplicates by `(milestoneId, activityId, taskId)` combination.
- `clearAllTasks()`: Clears all unlock indicators (e.g., on experience switch).
- `clearActivity(id: number)`: Removes all entries where `activityId === id` OR `milestoneId === id`. Returns the removed entries so callers can mark any related notifications/todos as done. Note: Name is overloaded — it clears by activity or milestone id.
- `clearByActivityId(activityId: number)`: Explicit activity-only clearing (enhanced version).
- `clearByMilestoneId(milestoneId: number)`: Explicit milestone-only clearing (enhanced version).
- `clearByActivityIdWithDuplicates()`: Enhanced clearing that handles server-side TodoItem duplicates and auto-cascades to parent milestones.
- `clearByMilestoneIdWithDuplicates()`: Enhanced milestone clearing with duplicate detection.
- `findDuplicateTodoItems()`: Detects multiple TodoItems for the same logical unlock (handles server-side duplicates).
- `cleanupOrphanedIndicators()`: Removes stale localStorage entries that no longer exist in current API response.
- `removeTasks(taskId?: number)`: Cascading removal when a specific task is visited; if the last task in an activity is removed, it clears that activity; if the last activity/task in a milestone is removed, it clears that milestone as well.
- `isActivityClearable(activityId: number)`: Returns `true` only if there are no remaining task-level unlocks (`taskId`) under that activity.
- `isMilestoneClearable(milestoneId: number)`: Returns `true` only if there are no remaining activity- or task-level unlocks under that milestone.
- `getTasksByActivity(activity: Activity)`, `getTasksByActivityId(id)`, `getTasksByMilestoneId(id)`: Query helpers.

## Hierarchical Clearing Rules and Duplicate Handling

### Overview
The unlock indicator system implements a strict hierarchy that prevents premature clearing of parent indicators. Indicators are only clearable when all their children have been cleared, ensuring accurate representation of remaining unlocked content.

### Hierarchy Structure
```
Milestone (top-level)
├── Activity (mid-level)
│   ├── Task (leaf-level)
│   └── Task (leaf-level)
└── Activity (mid-level)
    └── Task (leaf-level)
```

### Clearability Rules
1. **Task-level indicators**: Always clearable when the task is visited/completed
2. **Activity-level indicators**: Only clearable when NO task-level children remain (`isActivityClearable()`)
3. **Milestone-level indicators**: Only clearable when NO activity-level OR task-level children remain (`isMilestoneClearable()`)

### Clearability Logic
```typescript
isActivityClearable(activityId: number): boolean {
  const activities = this.getTasksByActivityId(activityId);
  const hasUnlockedTasks = activities.some(task => task.taskId !== undefined);
  return !hasUnlockedTasks; // Only clearable if no task-level unlocks remain
}

isMilestoneClearable(milestoneId: number): boolean {
  const milestones = this.getTasksByMilestoneId(milestoneId);
  const hasUnlockedActivities = milestones.some(task => task.activityId !== undefined);
  const hasUnlockedTasks = milestones.some(task => task.taskId !== undefined);
  return !hasUnlockedActivities && !hasUnlockedTasks; // Only clearable if no children remain
}
```

### Server-Side Duplicate Problem
The server sometimes creates multiple TodoItem records for the same logical unlock, causing persistent red dots even after partial clearing.

**Example Problem**:
```json
// localStorage has:
[{"id":25473,"identifier":"NewItem-17432","milestoneId":11212}]

// API response contains duplicates:
[
  {"id":25473,"identifier":"NewItem-17432","is_done":false},
  {"id":25475,"identifier":"NewItem-17432","is_done":true},   // Already marked
  {"id":25474,"identifier":"NewItem-17432","is_done":false}  // Still active!
]

// Problem: Marking only 25473 leaves 25474 active → red dot persists
```

### Enhanced Duplicate Detection
```typescript
findDuplicateTodoItems(currentTodoItems, unlockedTask) {
  return currentTodoItems.filter(item => {
    // Exact identifier match
    if (item.identifier === unlockedTask.identifier) return true;
    
    // Base identifier pattern matching (handles variations)
    const baseIdentifier = unlockedTask.identifier.replace(/-\d+$/, '');
    const itemBaseIdentifier = item.identifier.replace(/-\d+$/, '');
    if (itemBaseIdentifier === baseIdentifier) return true;
    
    // Prefix matching for same unlock event
    if (item.identifier.startsWith(baseIdentifier)) return true;
    
    return false;
  });
}
```

### Cascade Clearing Logic
When an activity is cleared, the system automatically checks if parent milestones become clearable:

```typescript
clearByActivityIdWithDuplicates(activityId, currentTodoItems) {
  // 1. Clear activity and find all duplicates
  const activityResult = this.clearActivity(activityId);
  const duplicates = this.findAllDuplicates(activityResult);
  
  // 2. Check affected parent milestones
  const affectedMilestones = new Set(activityResult.map(t => t.milestoneId));
  const cascadeMilestones = [];
  
  affectedMilestones.forEach(milestoneId => {
    if (this.isMilestoneClearable(milestoneId)) {
      // 3. Auto-clear parent milestone if it becomes clearable
      const milestoneResult = this.clearByMilestoneIdWithDuplicates(milestoneId, currentTodoItems);
      cascadeMilestones.push(milestoneResult);
    }
  });
  
  return { duplicates, cascadeMilestones };
}
```

### Real-World Example
**Initial State**:
```json
localStorage: [
  {"id":25473,"identifier":"NewItem-17432","milestoneId":11212},           // Milestone-level
  {"id":25480,"identifier":"NewItem-17434","activityId":26686,"milestoneId":11212}  // Activity-level
]

// Milestone 11212 is NOT clearable (has activity child 26686)
// Activity 26686 IS clearable (no task children)
```

**When user visits activity 26686**:
1. **Activity Clearing**: 
   - Finds duplicates: `[25480, 25479]` for "NewItem-17434"
   - Marks both as done via bulk API calls
   - Removes activity entry from localStorage

2. **Cascade Check**:
   - Checks: `isMilestoneClearable(11212)` → now `true` (no more children)
   - Auto-triggers milestone clearing

3. **Milestone Clearing**:
   - Finds duplicates: `[25473, 25475, 25474]` for "NewItem-17432" 
   - Marks all as done via bulk API calls
   - Removes milestone entry from localStorage

4. **Final Result**:
   - All red dots cleared
   - Complete hierarchy resolved
   - 5 total API calls (all duplicates marked)

### Integration with NotificationsService
```typescript
// Enhanced bulk marking capability
markMultipleTodoItemsAsDone(items: {id: number, identifier: string}[]) {
  const markingOperations = items.map(item => this.markTodoItemAsDone(item));
  return markingOperations; // Returns array of Observables for parallel execution
}

// Automatic orphan cleanup during TodoItem fetching
getTodoItems() {
  return this.request.get(api.get.todoItem).pipe(
    map(response => {
      // Clean up stale localStorage entries before processing
      this.unlockIndicatorService.cleanupOrphanedIndicators(response.data);
      
      const normalised = this._normaliseTodoItems(response.data);
      return normalised;
    })
  );
}
```
File: `home.page.ts`

### Subscription to unlocked tasks (reactive mapping to UI)
On init, the Home page subscribes to `unlockedTasks$` and builds a map `hasUnlockedTasks: { [activityId: number]: true }` used by the template to render red dots. It also proactively clears milestone-level indicators that are now clearable.

Relevant code excerpt:
- `home.page.ts` — subscription to `unlockedTasks$`:

```
this.unlockIndicatorService.unlockedTasks$
  .pipe(distinctUntilChanged(), takeUntil(this.unsubscribe$))
  .subscribe({
    next: (unlockedTasks) => {
      this.hasUnlockedTasks = {}; // reset
      unlockedTasks.forEach((task) => {
        if (task.milestoneId) {
          if (this.unlockIndicatorService.isMilestoneClearable(task.milestoneId)) {
            this.verifyUnlockedMilestoneValidity(task.milestoneId);
          }
        }
        if (task.activityId) {
          this.hasUnlockedTasks[task.activityId] = true;
        }
      });
    },
  });
```

Notes:
- The mapping sets `hasUnlockedTasks[activityId] = true` for any entry that includes an `activityId`.
- If a milestone is clearable (no remaining child unlocks), `verifyUnlockedMilestoneValidity` is called to clear it and mark related todos as done.

### Rendering the red dot in the template
- `home.page.html` binds the computed map into each `app-list-item`:

```
[redDot]="hasUnlockedTasks[activity.id] || false"
```

This is the only flag the list item needs to display the red dot.

### Clearing indicators when navigating to an activity
The method `gotoActivity({ activity, milestone })` (around lines ~140–161 of `home.page.ts`) includes the clearing logic:
- If the activity is clearable (`isActivityClearable(activity.id)` is `true`), it calls `clearActivity(activity.id)` to remove unlock entries at the activity level, and for each removed entry, calls `NotificationsService.markTodoItemAsDone(...)`.
- Separately, if the milestone is clearable, it calls `verifyUnlockedMilestoneValidity(milestone.id)`, which internally uses `clearActivity(milestoneId)` to clear milestone-level unlocks and mark them as done.

This ensures the UI and persisted state remain in sync after the user visits relevant activities.

## List item integration (UI)
File: `list-item.component.html`

The component renders a red notification dot whenever its `redDot` input is `true`. The dot is shown both for avatar (when `leadImage` is present) and for the default icon container.

Key snippets:

```
<span class="notification-dot" *ngIf="redDot === true"></span>
```

- When there is a `leadImage`:
  - The dot is inside the `ion-avatar` element.
- When there is no `leadImage`:
  - The dot is inside the fallback `.icon-container`.

No additional logic is required in the list item; it purely reflects the `redDot` input.

## Additional integration points

- `experiences.page.ts`
  - On program switch, calls `unlockIndicatorService.clearAllTasks()` to reset all indicators when changing experiences.

- `v3.page.ts`
  - Subscribes to `unlockIndicatorService.unlockedTasks$` at the app shell level to keep higher-level UI (e.g., sidebar/menu badges or booleans like `hasUnlockedTasks`) in sync with unlock state.

- `activity.service.ts`
  - In `goToTask`, calls `unlockIndicatorService.removeTasks(task.id)` so visiting a specific task clears its task-level indicator and, via cascading logic, clears related activity/milestone indicators when appropriate. Removed items are then marked as done via the notifications flow.

- `activity.component.ts`
  - Subscribes to `unlockIndicatorService.unlockedTasks$` and builds a `newTasks` map keyed by `taskId` to flag per-task “new/unlocked” state inside the activity view.

- `notifications.service.ts`
  - Acts as the source/sink for unlock-related TodoItems. It coordinates marking items as done when cleared (e.g., called from Home/Activity), and standardizes unlock entries. It integrates with `UnlockIndicatorService` (imported) to participate in the unlock pipeline.

- `auth.service.ts`
  - Imports `UnlockIndicatorService`. While program switching reset is handled in `experiences.page.ts`, auth-related flows keep the service available for clearing/reset as needed alongside broader cache clears.

## End-to-end flow
1. Some part of the app determines new content is unlocked and calls `unlockIndicatorService.unlockTasks([...])` with `UnlockedTask` entries (often originating from normalized TodoItems in the notifications pipeline).
2. Service merges, de-duplicates, persists, and emits the new list via `unlockedTasks$`.
3. Home page subscription rebuilds `hasUnlockedTasks` and clears any now-clearable milestones. UI updates reactively, and the app shell may also react via its own subscription.
4. The Home page template binds `hasUnlockedTasks[activity.id]` to `[redDot]`, so affected activities display a red dot.
5. When the user opens an activity or task:
   - **Activity**: if no remaining task-level unlocks exist under that activity (`isActivityClearable` returns `true`), enhanced clearing finds ALL server-side duplicates and marks them as done in parallel. If parent milestone becomes clearable, it auto-cascades to clear milestone duplicates as well.
   - **Task**: `ActivityService.goToTask(...)` clears the task-level indicator using `removeTasks(task.id)`, cascading as needed up to activity/milestone.
   - **Hierarchy validation**: Each clearing operation respects the hierarchy - milestones only clear when no children remain.
6. The service emits the updated list; the red dot disappears for cleared activities/milestones, and per-task flags update inside the activity view.
7. **Automatic cleanup**: On each TodoItem API fetch, orphaned localStorage entries (no longer in API) are automatically removed.

## Troubleshooting and Common Issues

### Symptoms of Problems
- Red dot persists on Home after visiting an activity or a task
- Milestone-level indicator does not clear after all child items are visited
- Dot clears only when entering from Home, but not when deep-linking to a task
- Indicators persist even when no corresponding TodoItems exist in API response

### Root Causes and Solutions

#### 1. Entry Path Bypassing
**Problem**: Users enter activities via paths that bypass cleanup logic (deep links, direct task opens).

**Solution**: Activity pages should include page-enter cleanup logic:
```typescript
// In activity desktop/mobile pages (ionViewDidEnter)
private _clearPureActivityIndicator() {
  const activityLevelEntries = this.unlockIndicatorService.getTasksByActivityId(this.activity.id)
    .filter(task => task.taskId === undefined); // Only pure activity entries
  
  if (activityLevelEntries.length > 0 && this.unlockIndicatorService.isActivityClearable(this.activity.id)) {
    const result = this.unlockIndicatorService.clearByActivityIdWithDuplicates(this.activity.id, this.currentTodoItems);
    // Mark duplicates as done via bulk API calls
  }
}
```

#### 2. Overloaded Method Confusion
**Problem**: `clearActivity(id)` removes by activityId OR milestoneId, causing ID collision issues.

**Solution**: Use explicit methods:
- Replace `clearActivity(activityId)` with `clearByActivityId(activityId)`
- Replace `clearActivity(milestoneId)` with `clearByMilestoneId(milestoneId)`

#### 3. Missing ActivityId in Task Entries
**Problem**: Task-level entries without `activityId` can't be mapped by Home page.

**Solution**: Enforce `activityId` presence in `NotificationsService._normaliseUnlockedTasks()`:
```typescript
// Ensure task entries always include activityId
if (entry.taskId && !entry.activityId) {
  // Derive or skip entry if activityId cannot be determined
}
```

#### 4. Orphaned Data and Server Duplicates
**Problem**: Multiple TodoItems created for same unlock, partial clearing leaves active duplicates.

**Solution**: Enhanced clearing with duplicate detection (already implemented):
- `findDuplicateTodoItems()` identifies all server-side duplicates
- `markMultipleTodoItemsAsDone()` handles bulk API marking
- `cleanupOrphanedIndicators()` removes stale localStorage entries

### Implementation Checklist for Robustness

- [ ] **Activity Pages**: Add page-enter cleanup for activity-level-only entries
  - Desktop: `projects/v3/src/app/pages/activity-desktop/activity-desktop.page.ts`
  - Mobile: Equivalent activity page files
- [ ] **Service Methods**: Replace ambiguous `clearActivity` with explicit methods
  - `clearByActivityId(activityId: number)`
  - `clearByMilestoneId(milestoneId: number)`
- [ ] **Data Validation**: Enforce `activityId` presence for task entries
  - File: `projects/v3/src/app/services/notifications.service.ts`
- [ ] **Route Guards**: Optional resolver-based cleanup on activity routes
- [ ] **Testing**: Unit tests for new methods and e2e tests for deep links

### Debug and Diagnostics

#### Console Debugging
Enhanced methods provide detailed console output:
```
"Found X duplicate TodoItems for unlock:"
"Bulk marking X TodoItems as done:"
"Marked duplicate TodoItem as done:"
"Auto-cascading to clear parent milestone:"
```

#### Manual Inspection
- **localStorage**: Check `unlockedTasks` key in browser dev tools
- **Router Events**: Log navigation paths to identify bypassed cleanup
- **Service State**: Verify `unlockedTasks$` observable content matches expectations

#### Test Matrix
1. **Home → Activity → Task**: Verify proper clearing sequence
2. **Direct Activity Entry**: Test page-enter cleanup for activity-only entries
3. **Deep Link to Task**: Ensure task and parent clearing works
4. **Milestone Clearing**: Verify cascade clearing when all children visited
5. **Experience Switch**: Confirm `clearAllTasks()` resets all state

### Performance Considerations
- **Bulk Operations**: Parallel TodoItem marking reduces API overhead
- **Automatic Cleanup**: Orphaned data removal prevents localStorage bloat
- **Cascade Logic**: Smart parent clearing reduces manual intervention
- **Pattern Matching**: Efficient duplicate detection with regex patterns

## Edge cases and notes
- **Hierarchy enforcement**: Activity-level clearing is intentionally conservative - it only happens when there are no task-level unlocks (`isActivityClearable` returns `true`). If any task under the activity remains unlocked, the red dot persists.
- **Milestone clearability**: Milestone indicators are NOT manually clearable - they only clear when all their children (activities and tasks) have been cleared.
- **Duplicate handling**: The enhanced system detects and marks ALL server-side TodoItem duplicates, not just the first one found. This prevents persistent red dots caused by partial clearing.
- **Cascade clearing**: When an activity clears, the system automatically checks if its parent milestone should also clear, eliminating the need for manual milestone clearing in most cases.
- **Orphan cleanup**: Stale localStorage entries that no longer exist in the current TodoItem API response are automatically removed during each API fetch.
- `clearActivity(id)` is deprecated in favor of explicit `clearByActivityId()` and `clearByMilestoneId()` methods to avoid ID collision issues.
- For task-level events, prefer `removeTasks(taskId)` to leverage the cascading removal logic (task → activity → milestone) when appropriate.
- When creating `UnlockedTask` entries for tasks, ensure `activityId` is included if the activity-level red dot should be shown for that task; otherwise the Home page cannot map it to an activity and no dot will render.
- The service rehydrates from storage on construction, so indicators persist across reloads.
- **Console debugging**: Enhanced methods provide detailed console output showing duplicate detection, bulk marking operations, and cascade clearing for troubleshooting.
- **Conservative clearing rules**: The intentionally conservative clearing behavior prevents premature dot removal. Ensure product acceptance aligns with these rules before making them more aggressive.
