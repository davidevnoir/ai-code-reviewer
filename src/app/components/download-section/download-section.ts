import { Component, signal, computed, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { DownloadService } from '../../services';
import { AnalysisResult } from '../../models';

interface DownloadOption {
  name: string;
  description: string;
  icon: string;
  format: string;
  type: 'json' | 'csv' | 'markdown' | 'sql' | 'text';
}

@Component({
  selector: 'app-download-section',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  templateUrl: './download-section.html',
  styleUrl: './download-section.scss',
})
export class DownloadSectionComponent {
  private readonly downloadService = inject(DownloadService);
  private readonly snackBar = inject(MatSnackBar);

  // Input from parent
  readonly analysisResult = input<AnalysisResult | null>(null);

  // Computed state
  readonly hasResults = computed(() => this.analysisResult() !== null);
  readonly canDownload = computed(() => this.hasResults());

  readonly downloadOptions = signal<DownloadOption[]>([
    {
      name: 'Complete Analysis (JSON)',
      description: 'Full analysis report with all sections',
      icon: 'description',
      format: 'json',
      type: 'json',
    },
    {
      name: 'Full Report (Markdown)',
      description: 'Comprehensive analysis report',
      icon: 'article',
      format: 'md',
      type: 'markdown',
    },
    {
      name: 'Test Scenarios (Markdown)',
      description: 'BDD-style test scenarios',
      icon: 'fact_check',
      format: 'md',
      type: 'markdown',
    },
    {
      name: 'Test Cases (CSV)',
      description: 'Test cases in spreadsheet format',
      icon: 'checklist',
      format: 'csv',
      type: 'csv',
    },
    {
      name: 'Code Suggestions (CSV)',
      description: 'All code suggestions and fixes',
      icon: 'lightbulb',
      format: 'csv',
      type: 'csv',
    },
    {
      name: 'Schema Changes (SQL)',
      description: 'Database migration scripts',
      icon: 'storage',
      format: 'sql',
      type: 'sql',
    },
    {
      name: 'Summary (Text)',
      description: 'Quick analysis summary',
      icon: 'summarize',
      format: 'txt',
      type: 'text',
    },
  ]);

  /**
   * Download specific file type
   */
  downloadFile(option: DownloadOption): void {
    const result = this.analysisResult();
    if (!result) {
      this.snackBar.open('No results to download', 'Close', { duration: 3000 });
      return;
    }

    try {
      switch (option.type) {
        case 'json':
          if (option.name.includes('Complete')) {
            this.downloadService.downloadJSON(result);
          }
          break;

        case 'markdown':
          if (option.name.includes('Full Report')) {
            this.downloadService.downloadFullReportMarkdown(result);
          } else if (option.name.includes('Test Scenarios')) {
            this.downloadService.downloadTestScenariosMarkdown(result.testScenarios);
          }
          break;

        case 'csv':
          if (option.name.includes('Test Cases')) {
            this.downloadService.downloadTestCasesCSV(result.testCases);
          } else if (option.name.includes('Suggestions')) {
            this.downloadService.downloadSuggestionsCSV(result.suggestions);
          }
          break;

        case 'sql':
          this.downloadService.downloadSchemaChangesSQL(result.schemaChanges);
          break;

        case 'text':
          this.downloadService.downloadSummaryText(result);
          break;
      }

      this.snackBar.open(`Downloaded ${option.name}`, 'Close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open('Download failed', 'Close', { duration: 3000 });
      console.error('Download error:', error);
    }
  }

  /**
   * Download all available files
   */
  downloadAll(): void {
    const result = this.analysisResult();
    if (!result) {
      this.snackBar.open('No results to download', 'Close', { duration: 3000 });
      return;
    }

    // Download with delays to avoid blocking
    const downloads = [
      () => this.downloadService.downloadJSON(result),
      () => this.downloadService.downloadFullReportMarkdown(result),
      () => this.downloadService.downloadTestScenariosMarkdown(result.testScenarios),
      () => this.downloadService.downloadTestCasesCSV(result.testCases),
      () => this.downloadService.downloadSuggestionsCSV(result.suggestions),
      () => this.downloadService.downloadSchemaChangesSQL(result.schemaChanges),
      () => this.downloadService.downloadSummaryText(result),
    ];

    downloads.forEach((download, index) => {
      setTimeout(download, index * 300);
    });

    this.snackBar.open('Downloading all files...', 'Close', { duration: 3000 });
  }
}
