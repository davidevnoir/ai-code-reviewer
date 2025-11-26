# PR Analysis UI - Copilot Instructions

## Project Overview
Angular application for analyzing GitHub Pull Requests with AI-powered code review, suggestions, and QA test case generation.

## Tech Stack
- **Framework**: Angular 21 (latest)
- **UI Library**: Angular Material
- **Styling**: SCSS
- **Language**: TypeScript
- **State Management**: Signals (Angular built-in)

## Project Structure
```
src/
├── app/
│   ├── components/
│   │   ├── pr-input/           # PR link input and analysis button
│   │   ├── analysis-results/   # Display analysis results
│   │   └── download-section/   # Download generated files
│   ├── services/               # API and business logic services
│   ├── models/                 # TypeScript interfaces
│   └── app.ts                  # Main app component
├── docs/                       # Documentation files
│   ├── api-keys.md            # API credentials
│   ├── architecture.md        # System architecture
│   ├── coding-conventions.md  # Code standards
│   └── ai-context.md          # AI integration context
```

## Code Standards

### Angular Conventions
- Use **standalone components** (default in Angular 19+)
- Use **signals** for reactive state management
- Prefer **input()** and **output()** over @Input/@Output
- Use **inject()** over constructor injection
- Component naming: `feature-name.component.ts`

### TypeScript Standards
- Use **strict mode**
- Prefer **interfaces** over types for object shapes
- Use **readonly** for immutable properties
- Always define **return types**
- Avoid **any** - use proper types

### Component Structure
```typescript
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [],
  templateUrl: './feature.html',
  styleUrl: './feature.scss'
})
export class FeatureComponent {
  // Signals for state
  data = signal<DataType | null>(null);
  loading = signal(false);
  
  // Methods
  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await this.service.fetch();
      this.data.set(result);
    } finally {
      this.loading.set(false);
    }
  }
}
```

### Material Design Usage
- Import Material components in component files
- Use Material theming from styles.scss
- Follow Material Design guidelines
- Use mat-card, mat-button, mat-form-field, mat-progress-bar

### File Naming
- Components: `feature-name.ts` (not .component.ts in Angular 21)
- Services: `feature.service.ts`
- Models: `feature.model.ts`
- SCSS: `feature-name.scss`

## Key Features

### 1. PR Input Component
- Input field for GitHub PR URL
- Validation for valid GitHub PR links
- Analyze button with loading state
- Error handling and user feedback

### 2. Analysis Results Display
- Structured display of:
  - Code suggestions
  - Recommendations
  - Code changes
  - Schema changes
  - Test scenarios
  - Test cases
- Syntax highlighting for code blocks
- Collapsible sections
- Copy to clipboard functionality

### 3. Download Section
- Download buttons for:
  - Analysis JSON
  - Test cases (JSON/CSV)
  - QA scenarios (Markdown/PDF)
  - Schema changes (SQL)
- File format selection
- Bulk download option

## UI/UX Guidelines

### Layout
- Responsive design (mobile-first)
- Clean, professional appearance
- Clear visual hierarchy
- Accessible (WCAG 2.1 AA)

### Colors (Material Azure/Blue Theme)
- Primary: Azure blue
- Accent: Blue
- Background: White/Light gray
- Text: Dark gray/Black

### Spacing
- Consistent padding: 16px, 24px, 32px
- Card margins: 16px
- Section gaps: 24px

### Typography
- Headings: Roboto Medium
- Body: Roboto Regular
- Code: Roboto Mono

## State Management Pattern

```typescript
// Use signals for component state
export class Component {
  // State
  prUrl = signal('');
  analysisResults = signal<AnalysisResult | null>(null);
  isAnalyzing = signal(false);
  error = signal<string | null>(null);
  
  // Computed values
  hasResults = computed(() => this.analysisResults() !== null);
  canDownload = computed(() => this.hasResults() && !this.isAnalyzing());
}
```

## Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private http = inject(HttpClient);
  
  analyzePR(prUrl: string): Observable<AnalysisResult> {
    return this.http.post<AnalysisResult>('/api/analyze', { prUrl });
  }
  
  downloadFile(data: unknown, filename: string, type: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
```

## Error Handling

```typescript
// Component-level error handling
try {
  this.isAnalyzing.set(true);
  this.error.set(null);
  const result = await this.service.analyzePR(url);
  this.analysisResults.set(result);
} catch (err) {
  this.error.set(err instanceof Error ? err.message : 'Analysis failed');
} finally {
  this.isAnalyzing.set(false);
}
```

## Common Patterns

### Loading States
```html
@if (loading()) {
  <mat-progress-bar mode="indeterminate"></mat-progress-bar>
}
```

### Error Display
```html
@if (error()) {
  <mat-error>{{ error() }}</mat-error>
}
```

### Conditional Rendering
```html
@if (hasResults()) {
  <app-results [data]="analysisResults()" />
} @else {
  <p>No results yet. Enter a PR URL to analyze.</p>
}
```

## Avoid
- Class-based components (use functional style)
- NgModules (use standalone components)
- Two-way binding with [(ngModel)] (use signals)
- Complex RxJS chains (use async/await)
- Inline styles (use SCSS files)
- console.log (use proper error handling)

## Testing (For Future)
- Use Vitest (configured by default)
- Write unit tests for services
- Component tests for user interactions
- Mock HTTP calls

## Development Commands
```bash
ng serve              # Start dev server
ng build              # Production build
ng generate component # Create component
ng lint               # Run linting
```

## Notes
- Backend integration will be added later
- For now, use mock data for UI testing
- Focus on responsive, accessible UI
- Prepare for API integration
