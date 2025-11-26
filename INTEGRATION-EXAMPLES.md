# Service Integration Examples

This file shows how to integrate the services with the existing UI components.

## Example 1: Integrate AnalysisService with PrInputComponent

Update `src/app/components/pr-input/pr-input.ts`:

```typescript
import { Component, signal, inject, effect, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

// Import services
import { AnalysisService, AzureOpenAIService, GitHubService } from '../../services';
import { AnalysisResult } from '../../models';

@Component({
  selector: 'app-pr-input',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
  ],
  templateUrl: './pr-input.html',
  styleUrl: './pr-input.scss',
})
export class PrInputComponent {
  // Inject services
  private readonly analysisService = inject(AnalysisService);
  private readonly aiService = inject(AzureOpenAIService);
  private readonly githubService = inject(GitHubService);
  private readonly snackBar = inject(MatSnackBar);

  // Component state
  prUrl = signal('');
  error = signal<string | null>(null);

  // Output event for analysis results
  analysisComplete = output<AnalysisResult>();

  // Computed from service status
  readonly isAnalyzing = this.analysisService.status().status === 'analyzing';
  readonly progress = this.analysisService.status().progress;
  readonly currentStep = this.analysisService.status().currentStep;

  constructor() {
    // Initialize services with configuration
    this.initializeServices();

    // Monitor analysis status
    effect(() => {
      const status = this.analysisService.status();

      if (status.status === 'failed' && status.error) {
        this.error.set(status.error.message);
        this.snackBar.open(`Error: ${status.error.message}`, 'Close', {
          duration: 5000,
          panelClass: 'error-snack',
        });
      }

      if (status.status === 'completed') {
        this.snackBar.open('Analysis completed successfully!', 'Close', {
          duration: 3000,
          panelClass: 'success-snack',
        });
      }
    });
  }

  private initializeServices(): void {
    // TODO: Load from environment or user settings
    // For now, configure with placeholder values

    // Configure Azure OpenAI
    this.aiService.setConfig({
      apiKey: 'YOUR_API_KEY', // Load from settings
      endpoint: 'YOUR_ENDPOINT',
      deployment: 'YOUR_DEPLOYMENT',
      model: 'gpt-4o',
      temperature: 0.3,
      maxTokens: 2000,
    });

    // Configure GitHub token
    this.analysisService.setGitHubToken('YOUR_GITHUB_TOKEN'); // Load from settings
  }

  analyzePR(): void {
    const url = this.prUrl();

    // Validate URL
    if (!url) {
      this.error.set('Please enter a PR URL');
      return;
    }

    if (!this.githubService.isValidPRUrl(url)) {
      this.error.set('Please enter a valid GitHub Pull Request URL');
      return;
    }

    // Clear error and start analysis
    this.error.set(null);

    // Call analysis service
    this.analysisService.analyzePullRequest(url).subscribe({
      next: (result) => {
        console.log('Analysis complete:', result);
        this.analysisComplete.emit(result);
      },
      error: (err) => {
        console.error('Analysis failed:', err);
        this.error.set(err.message || 'Analysis failed');
      },
    });
  }

  onUrlChange(value: string): void {
    this.prUrl.set(value);
    this.error.set(null);
  }
}
```

## Example 2: Display Results in AnalysisResultsComponent

Update `src/app/components/analysis-results/analysis-results.ts`:

```typescript
import { Component, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

import { AnalysisResult } from '../../models';

@Component({
  selector: 'app-analysis-results',
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    MatChipsModule,
    MatIconModule,
    MatBadgeModule,
  ],
  templateUrl: './analysis-results.html',
  styleUrl: './analysis-results.scss',
})
export class AnalysisResultsComponent {
  // Input from parent component
  analysisResult = input<AnalysisResult | null>(null);

  // Computed properties for display
  get hasSuggestions(): boolean {
    return (this.analysisResult()?.suggestions.length ?? 0) > 0;
  }

  get hasSecurityIssues(): boolean {
    return (this.analysisResult()?.security.length ?? 0) > 0;
  }

  get hasTestScenarios(): boolean {
    return (this.analysisResult()?.testScenarios.length ?? 0) > 0;
  }

  get criticalSecurityIssues(): number {
    return this.analysisResult()?.security.filter((s) => s.severity === 'critical').length ?? 0;
  }

  getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      critical: 'red',
      high: 'orange',
      error: 'red',
      warning: 'orange',
      medium: 'yellow',
      low: 'green',
      info: 'blue',
      suggestion: 'blue',
    };
    return colors[severity] || 'gray';
  }
}
```

## Example 3: Add Download Functionality

Update `src/app/components/download-section/download-section.ts`:

```typescript
import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DownloadService } from '../../services';
import { AnalysisResult } from '../../models';

@Component({
  selector: 'app-download-section',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './download-section.html',
  styleUrl: './download-section.scss',
})
export class DownloadSectionComponent {
  private readonly downloadService = inject(DownloadService);
  private readonly snackBar = inject(MatSnackBar);

  // Input from parent
  analysisResult = input<AnalysisResult | null>(null);

  downloadJSON(): void {
    const result = this.analysisResult();
    if (!result) return;

    this.downloadService.downloadJSON(result);
    this.showSuccess('JSON downloaded');
  }

  downloadFullReport(): void {
    const result = this.analysisResult();
    if (!result) return;

    this.downloadService.downloadFullReportMarkdown(result);
    this.showSuccess('Report downloaded');
  }

  downloadTestScenarios(): void {
    const result = this.analysisResult();
    if (!result) return;

    this.downloadService.downloadTestScenariosMarkdown(result.testScenarios);
    this.showSuccess('Test scenarios downloaded');
  }

  downloadTestCasesCSV(): void {
    const result = this.analysisResult();
    if (!result) return;

    this.downloadService.downloadTestCasesCSV(result.testCases);
    this.showSuccess('Test cases downloaded');
  }

  downloadSuggestionsCSV(): void {
    const result = this.analysisResult();
    if (!result) return;

    this.downloadService.downloadSuggestionsCSV(result.suggestions);
    this.showSuccess('Suggestions downloaded');
  }

  downloadSchemaChangesSQL(): void {
    const result = this.analysisResult();
    if (!result || result.schemaChanges.length === 0) {
      this.snackBar.open('No schema changes to download', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.downloadService.downloadSchemaChangesSQL(result.schemaChanges);
    this.showSuccess('Schema changes downloaded');
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      panelClass: 'success-snack',
    });
  }
}
```

## Example 4: Main App Component Integration

Update `src/app/app.ts`:

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { PrInputComponent } from './components/pr-input/pr-input';
import { AnalysisResultsComponent } from './components/analysis-results/analysis-results';
import { DownloadSectionComponent } from './components/download-section/download-section';
import { AnalysisResult } from './models';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    PrInputComponent,
    AnalysisResultsComponent,
    DownloadSectionComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('PR Analysis Tool');

  // Store analysis results
  protected readonly analysisResult = signal<AnalysisResult | null>(null);

  // Handle analysis completion from PrInputComponent
  onAnalysisComplete(result: AnalysisResult): void {
    this.analysisResult.set(result);
  }
}
```

Update `src/app/app.html`:

```html
<mat-toolbar color="primary">
  <span>{{ title() }}</span>
</mat-toolbar>

<div class="container">
  <mat-card>
    <mat-card-header>
      <mat-card-title>Analyze Pull Request</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <app-pr-input (analysisComplete)="onAnalysisComplete($event)"> </app-pr-input>
    </mat-card-content>
  </mat-card>

  @if (analysisResult()) {
  <app-analysis-results [analysisResult]="analysisResult()"> </app-analysis-results>

  <app-download-section [analysisResult]="analysisResult()"> </app-download-section>
  }
</div>
```

## Example 5: Configuration Service (Optional)

Create a configuration service to manage API keys and settings:

```typescript
// src/app/services/config.service.ts
import { Injectable, signal } from '@angular/core';

export interface AppConfig {
  azureOpenAI: {
    apiKey: string;
    endpoint: string;
    deployment: string;
  };
  github: {
    token: string;
    modelRepoUrl?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config = signal<AppConfig>({
    azureOpenAI: {
      apiKey: '',
      endpoint: '',
      deployment: '',
    },
    github: {
      token: '',
    },
  });

  // Load from localStorage
  loadConfig(): void {
    const stored = localStorage.getItem('app-config');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.config.set(parsed);
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    }
  }

  // Save to localStorage
  saveConfig(config: AppConfig): void {
    this.config.set(config);
    localStorage.setItem('app-config', JSON.stringify(config));
  }

  // Get current config
  getConfig(): AppConfig {
    return this.config();
  }

  // Check if configured
  isConfigured(): boolean {
    const cfg = this.config();
    return !!(
      cfg.azureOpenAI.apiKey &&
      cfg.azureOpenAI.endpoint &&
      cfg.azureOpenAI.deployment &&
      cfg.github.token
    );
  }
}
```

## Example 6: Settings Dialog Component

Create a settings dialog for API key configuration:

```typescript
// src/app/components/settings-dialog/settings-dialog.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { ConfigService, AppConfig } from '../../services/config.service';

@Component({
  selector: 'app-settings-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>API Configuration</h2>
    <mat-dialog-content>
      <h3>Azure OpenAI</h3>
      <mat-form-field appearance="outline" style="width: 100%">
        <mat-label>API Key</mat-label>
        <input matInput type="password" [(ngModel)]="config.azureOpenAI.apiKey" />
      </mat-form-field>

      <mat-form-field appearance="outline" style="width: 100%">
        <mat-label>Endpoint</mat-label>
        <input
          matInput
          [(ngModel)]="config.azureOpenAI.endpoint"
          placeholder="https://your-resource.openai.azure.com/"
        />
      </mat-form-field>

      <mat-form-field appearance="outline" style="width: 100%">
        <mat-label>Deployment Name</mat-label>
        <input matInput [(ngModel)]="config.azureOpenAI.deployment" />
      </mat-form-field>

      <h3>GitHub</h3>
      <mat-form-field appearance="outline" style="width: 100%">
        <mat-label>Personal Access Token</mat-label>
        <input matInput type="password" [(ngModel)]="config.github.token" />
      </mat-form-field>

      <mat-form-field appearance="outline" style="width: 100%">
        <mat-label>Model Repository URL (Optional)</mat-label>
        <input matInput [(ngModel)]="config.github.modelRepoUrl" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="save()">Save</button>
    </mat-dialog-actions>
  `,
})
export class SettingsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SettingsDialogComponent>);
  private readonly configService = inject(ConfigService);

  config: AppConfig = this.configService.getConfig();

  save(): void {
    this.configService.saveConfig(this.config);
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
```

## Testing the Integration

1. **Start the dev server:**

   ```bash
   ng serve
   ```

2. **Open browser:** http://localhost:4200

3. **Configure API keys** (through settings dialog or directly in code)

4. **Enter a GitHub PR URL** like:

   ```
   https://github.com/angular/angular/pull/12345
   ```

5. **Click "Analyze"** and watch:

   - Progress bar updates
   - Status messages appear
   - Results display when complete

6. **Download results** in various formats

## Important Notes

- **CORS Issues:** Azure OpenAI may have CORS restrictions. Consider using a backend proxy.
- **API Keys:** Never hardcode API keys. Use environment variables or user settings.
- **Error Handling:** Always handle errors gracefully with user-friendly messages.
- **Loading States:** Show progress indicators during long operations.
- **Validation:** Validate all inputs before making API calls.

---

**Next Steps:** Implement these examples in your components and test the full flow!
