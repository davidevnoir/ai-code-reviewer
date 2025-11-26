# Coding Conventions & Standards

## Code Style Guide

This document defines the coding standards for the PR Analysis application.

## General Principles

### SOLID Principles

- **Single Responsibility**: Each class/component should have one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes must be substitutable for base classes
- **Interface Segregation**: Many specific interfaces > one general interface
- **Dependency Inversion**: Depend on abstractions, not concretions

### DRY (Don't Repeat Yourself)

- Extract common logic into utilities
- Use shared components for repeated UI patterns
- Create reusable services for common operations

### KISS (Keep It Simple, Stupid)

- Write simple, readable code
- Avoid over-engineering
- Prefer clarity over cleverness

---

## Angular Conventions

### Component Structure

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-feature-name', // Use app- prefix
  standalone: true,
  imports: [
    /* minimal imports */
  ],
  templateUrl: './feature-name.html',
  styleUrl: './feature-name.scss',
})
export class FeatureNameComponent {
  // 1. Signals (state)
  data = signal<DataType | null>(null);
  loading = signal(false);

  // 2. Computed values
  hasData = computed(() => this.data() !== null);

  // 3. Lifecycle hooks
  ngOnInit(): void {}

  // 4. Public methods
  public loadData(): void {}

  // 5. Private methods
  private processData(): void {}
}
```

### Naming Conventions

#### Files

- Components: `feature-name.ts` (not .component.ts)
- Services: `feature.service.ts`
- Models: `feature.model.ts`
- Utilities: `feature.util.ts`

#### Classes

- PascalCase: `UserService`, `AuthGuard`
- Suffix by type: `*Component`, `*Service`, `*Pipe`

#### Variables & Functions

- camelCase: `userName`, `getUserData()`
- Boolean prefixes: `isLoading`, `hasData`, `canEdit`

#### Constants

- UPPER_SNAKE_CASE: `API_BASE_URL`, `MAX_RETRY_ATTEMPTS`

#### Interfaces

- PascalCase with `I` prefix: `IUserData`, `IAnalysisResult`

### State Management

```typescript
// Use signals for reactive state
export class Component {
  // State
  items = signal<Item[]>([]);
  selectedId = signal<string | null>(null);

  // Computed
  selectedItem = computed(() => {
    const id = this.selectedId();
    return this.items().find((item) => item.id === id);
  });

  // Effects
  constructor() {
    effect(() => {
      console.log('Items changed:', this.items());
    });
  }
}
```

### Template Syntax

```html
<!-- Use @if instead of *ngIf -->
@if (loading()) {
<mat-spinner></mat-spinner>
}

<!-- Use @for instead of *ngFor -->
@for (item of items(); track item.id) {
<app-item [data]="item" />
}

<!-- Use signals in templates -->
<p>{{ userName() }}</p>

<!-- Event binding -->
<button (click)="handleClick()">Click</button>
```

---

## TypeScript Standards

### Type Safety

```typescript
// ✅ Good: Explicit types
function processUser(user: IUser): IUserResult {
  return { ...user, processed: true };
}

// ❌ Bad: Implicit any
function processUser(user) {
  return { ...user, processed: true };
}
```

### Interfaces vs Types

```typescript
// ✅ Use interface for object shapes
interface IUser {
  id: string;
  name: string;
  email: string;
}

// ✅ Use type for unions, intersections
type Status = 'pending' | 'approved' | 'rejected';
type UserWithStatus = IUser & { status: Status };
```

### Null Safety

```typescript
// ✅ Handle null/undefined
function getName(user: IUser | null): string {
  return user?.name ?? 'Unknown';
}

// ✅ Use optional chaining
const email = user?.profile?.email;

// ✅ Use nullish coalescing
const port = config.port ?? 3000;
```

### Async/Await

```typescript
// ✅ Prefer async/await
async function fetchData(): Promise<Data> {
  try {
    const response = await httpClient.get<Data>('/api/data');
    return response.data;
  } catch (error) {
    throw new DataFetchError('Failed to fetch', { cause: error });
  }
}

// ❌ Avoid promise chains
function fetchData(): Promise<Data> {
  return httpClient
    .get('/api/data')
    .then((response) => response.data)
    .catch((error) => {
      throw new Error('Failed');
    });
}
```

---

## SCSS Standards

### File Organization

```scss
// 1. Variables
$primary-color: #1976d2;
$spacing-unit: 8px;

// 2. Mixins
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 3. Component styles
.component-name {
  // Layout
  display: flex;
  padding: $spacing-unit * 2;

  // Typography
  font-size: 16px;

  // Children
  .child-element {
    margin: $spacing-unit;
  }

  // States
  &:hover {
    background-color: lighten($primary-color, 10%);
  }

  // Media queries
  @media (max-width: 768px) {
    flex-direction: column;
  }
}
```

### BEM Methodology (Optional)

```scss
// Block
.card {
}

// Element
.card__header {
}
.card__body {
}

// Modifier
.card--highlighted {
}
.card__header--large {
}
```

---

## Error Handling

### Component Level

```typescript
export class Component {
  error = signal<string | null>(null);

  async loadData(): Promise<void> {
    try {
      this.error.set(null);
      const data = await this.service.fetch();
      this.data.set(data);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'An error occurred');
      console.error('Load failed:', err);
    }
  }
}
```

### Service Level

```typescript
export class Service {
  async fetchData(): Promise<Data> {
    try {
      return await this.http.get<Data>('/api/data').toPromise();
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        throw new ServiceError(`API error: ${error.status}`, { cause: error });
      }
      throw new ServiceError('Network error', { cause: error });
    }
  }
}
```

---

## Testing Standards

### Component Tests

```typescript
describe('FeatureComponent', () => {
  let component: FeatureComponent;

  beforeEach(() => {
    component = new FeatureComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data successfully', async () => {
    await component.loadData();
    expect(component.data()).not.toBeNull();
    expect(component.loading()).toBe(false);
  });

  it('should handle errors', async () => {
    // Mock error
    await component.loadData();
    expect(component.error()).not.toBeNull();
  });
});
```

### Service Tests

```typescript
describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch data', () => {
    const mockData = { id: '1', name: 'Test' };

    service.getData().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

---

## Documentation Standards

### JSDoc Comments

````typescript
/**
 * Analyzes a GitHub Pull Request using AI
 *
 * @param prUrl - Full GitHub PR URL
 * @param options - Analysis options
 * @returns Analysis results with suggestions and test cases
 * @throws {ValidationError} If PR URL is invalid
 * @throws {APIError} If GitHub or OpenAI API fails
 *
 * @example
 * ```typescript
 * const result = await analyzePR(
 *   'https://github.com/owner/repo/pull/123',
 *   { includeTests: true }
 * );
 * ```
 */
async function analyzePR(prUrl: string, options?: AnalysisOptions): Promise<AnalysisResult> {
  // Implementation
}
````

### Component Documentation

````typescript
/**
 * Component for displaying PR analysis results
 *
 * Features:
 * - Expandable sections for different analysis types
 * - Copy to clipboard functionality
 * - Syntax highlighting for code blocks
 *
 * @example
 * ```html
 * <app-analysis-results [data]="analysisData" />
 * ```
 */
@Component({
  selector: 'app-analysis-results',
  // ...
})
export class AnalysisResultsComponent {}
````

---

## Git Conventions

### Commit Messages

Format: `<type>(<scope>): <subject>`

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, whitespace
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Build, dependencies

Examples:

```
feat(pr-input): add URL validation
fix(analysis): handle empty PR response
docs(readme): add setup instructions
refactor(services): simplify error handling
```

### Branch Naming

- Feature: `feature/add-download-functionality`
- Bug fix: `fix/validation-error`
- Hotfix: `hotfix/critical-security-issue`

---

## Performance Guidelines

### Lazy Loading

```typescript
// Lazy load routes
const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component'),
  },
];
```

### Change Detection

```typescript
// Use OnPush for better performance
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptimizedComponent {}
```

### Avoid Memory Leaks

```typescript
// Unsubscribe from observables
export class Component implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.dataService.data$.pipe(takeUntil(this.destroy$)).subscribe((data) => this.process(data));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## Security Best Practices

### Input Sanitization

```typescript
// Sanitize user input
import { DomSanitizer } from '@angular/platform-browser';

constructor(private sanitizer: DomSanitizer) {}

getSafeHtml(html: string) {
  return this.sanitizer.sanitize(SecurityContext.HTML, html);
}
```

### Environment Variables

```typescript
// ❌ Never hardcode credentials
const apiKey = 'sk-1234567890';

// ✅ Use environment variables
import { environment } from '../environments/environment';
const apiKey = environment.azureOpenAIKey;
```

---

## Code Review Checklist

### Before Submitting PR

- [ ] Code follows style guide
- [ ] All tests pass
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Documentation updated
- [ ] No hardcoded values
- [ ] Error handling implemented
- [ ] TypeScript strict mode passes
- [ ] No TypeScript `any` types
- [ ] Accessibility considered
- [ ] Responsive design tested
- [ ] Performance optimized

---

**Version**: 1.0.0  
**Last Updated**: November 26, 2025
