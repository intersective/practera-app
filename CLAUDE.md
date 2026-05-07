# App V2

## Overview

This is **App V2** - the main Practera learner application built with Angular and Ionic. It provides the student-facing experience for experiential learning programs.

## Technology Stack

- **Framework**: Angular 21
- **UI Framework**: Ionic 8 (`@ionic/angular` + `@ionic/core`)
- **Language**: TypeScript
- **Build System**: esbuild (via `@angular-devkit/build-angular:application`) + Vite dev server
- **State Management**: Services + RxJS
- **Styling**: SCSS
- **Deployment**: S3 + CloudFront (via Lambda@Edge)

### Angular 21 / Ionic 8 Notes

The app uses the **NgModule** approach (`IonicModule.forRoot()`) which is still supported in Ionic 8 but not the recommended modern style. Ionic 8 + Angular 21 recommends standalone components with `provideIonicAngular()`. Migration to standalone is tracked as technical debt.

Angular 21 uses an esbuild-based application builder with a Vite dev server (replacing the old webpack builder). This affects Ionic's Stencil lazy loader: Vite tries to pre-bundle `@ionic/core` and `@ionic/angular` but cannot statically analyze Stencil's dynamic chunk imports, causing missing files in the dep cache. The workaround is `prebundle.exclude` in `angular.json`'s `serve.options` — this is already configured and must not be removed:

```json
"options": {
  "prebundle": {
    "exclude": ["@ionic/angular", "@ionic/core", "@ionic/core/loader", "@stencil/core"]
  }
}
```

If this is removed, Ionic web components (ion-app, ion-button, etc.) will fail to load with a 404 MIME type error.

## Project Structure

```
app-v2/
├── projects/
│   └── v3/                     # Main application
│       └── src/
│           ├── app/
│           │   ├── app.module.ts
│           │   ├── app-routing.module.ts
│           │   ├── pages/              # Page components
│           │   ├── shared/             # Shared components
│           │   │   ├── components/
│           │   │   ├── services/
│           │   │   ├── pipes/
│           │   │   └── directives/
│           │   └── testing/            # Test utilities
│           ├── assets/                 # Static assets
│           ├── environments/           # Environment configs
│           ├── theme/                  # SCSS theming
│           └── styles.scss             # Global styles
├── e2e/                        # E2E tests
├── angular.json                # Angular CLI config
├── ionic.config.json           # Ionic config
└── docker-compose.yml          # Local development
```

## Development Setup

### Prerequisites

Ensure the DevPod is running:

```bash
cd ../practera-devpod
make start
```

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Or serve specific project
ng serve v3 --port 4200

# Or use Docker
docker-compose up
```

### Access Points

- **App**: http://localhost:4200
- **GraphQL API**: http://localhost:8000

## Common Development Tasks

### Creating a New Page

```bash
# Generate page
ionic generate page pages/new-page
```

```typescript
// pages/new-page/new-page.page.ts
import { Component, OnInit } from '@angular/core';
import { NewPageService } from './new-page.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.page.html',
  styleUrls: ['./new-page.page.scss']
})
export class NewPagePage implements OnInit {
  data$: Observable<DataType[]>;
  isLoading = true;

  constructor(private newPageService: NewPageService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.data$ = this.newPageService.getData().pipe(
      tap(() => this.isLoading = false),
      catchError(error => {
        console.error('Error loading data:', error);
        this.isLoading = false;
        return of([]);
      })
    );
  }
}
```

### Creating a Service

```typescript
// shared/services/data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DataItem {
  id: string;
  name: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<DataItem[]> {
    return this.http.get<DataItem[]>(`${this.apiUrl}/data`).pipe(
      map(items => items.map(this.transformItem)),
      catchError(error => {
        console.error('API Error:', error);
        throw error;
      })
    );
  }

  getById(id: string): Observable<DataItem> {
    return this.http.get<DataItem>(`${this.apiUrl}/data/${id}`);
  }

  create(data: Partial<DataItem>): Observable<DataItem> {
    return this.http.post<DataItem>(`${this.apiUrl}/data`, data);
  }

  private transformItem(item: any): DataItem {
    return {
      ...item,
      createdAt: new Date(item.createdAt)
    };
  }
}
```

### Creating a Component

```bash
# Generate component
ionic generate component shared/components/data-card
```

```typescript
// shared/components/data-card/data-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-data-card',
  templateUrl: './data-card.component.html',
  styleUrls: ['./data-card.component.scss']
})
export class DataCardComponent {
  @Input() title: string;
  @Input() description: string;
  @Input() imageUrl?: string;
  
  @Output() clicked = new EventEmitter<void>();
  @Output() actionClicked = new EventEmitter<string>();

  onClick(): void {
    this.clicked.emit();
  }

  onAction(action: string): void {
    this.actionClicked.emit(action);
  }
}
```

### GraphQL Integration

```typescript
// shared/services/graphql.service.ts
import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map } from 'rxjs';

const GET_EXPERIENCES = gql`
  query GetExperiences {
    experiences {
      id
      name
      description
      status
      milestones {
        id
        name
      }
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {
  constructor(private apollo: Apollo) {}

  getExperiences(): Observable<Experience[]> {
    return this.apollo
      .watchQuery<{ experiences: Experience[] }>({
        query: GET_EXPERIENCES
      })
      .valueChanges
      .pipe(
        map(result => result.data.experiences)
      );
  }
}
```

### Running Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run e2e

# Run specific test file
ng test --include='**/data.service.spec.ts'
```

### Writing Tests

```typescript
// data.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });
    
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all data items', () => {
    const mockData = [{ id: '1', name: 'Test' }];

    service.getAll().subscribe(data => {
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('Test');
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
```

## Styling Guidelines

### SCSS Structure

```scss
// pages/new-page/new-page.page.scss
:host {
  display: block;
}

.page-container {
  padding: var(--page-padding);
  
  @media (max-width: 768px) {
    padding: var(--page-padding-mobile);
  }
}

.card {
  &__header {
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  &__body {
    padding: 1rem;
  }
  
  &--highlighted {
    border-color: var(--ion-color-primary);
  }
}
```

### Ionic Components

```html
<!-- Using Ionic components -->
<ion-header>
  <ion-toolbar>
    <ion-buttons slot="start">
      <ion-back-button defaultHref="/home"></ion-back-button>
    </ion-buttons>
    <ion-title>Page Title</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
    <ion-refresher-content></ion-refresher-content>
  </ion-refresher>
  
  <ion-list>
    <ion-item *ngFor="let item of items$ | async">
      <ion-label>{{ item.name }}</ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `apiUrl` | GraphQL API URL |
| `production` | Production mode flag |
| `version` | App version |

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  version: '3.0.0'
};
```

## Accessibility (WCAG 2.2 AA)

This app must meet WCAG 2.2 AA standards:

```html
<!-- Accessible form example -->
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <ion-item>
    <ion-label position="stacked" id="name-label">Name</ion-label>
    <ion-input
      formControlName="name"
      aria-labelledby="name-label"
      aria-describedby="name-error"
      [attr.aria-invalid]="form.get('name')?.invalid"
    ></ion-input>
  </ion-item>
  <div id="name-error" role="alert" *ngIf="form.get('name')?.errors?.required">
    Name is required
  </div>
  
  <ion-button type="submit" [disabled]="form.invalid">
    Submit
  </ion-button>
</form>
```

## Important Notes

> ⚠️ **Warning**: This is the primary learner-facing application. All changes must be thoroughly tested.

> 💡 **Tip**: Use Ionic's built-in components for consistent cross-platform UI.

> 💡 **Tip**: Leverage Angular's OnPush change detection strategy for better performance.

> 💡 **Tip**: Check accessibility using Lighthouse and axe DevTools before deployment.







