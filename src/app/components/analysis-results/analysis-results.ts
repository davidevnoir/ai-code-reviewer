import { Component, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { inject } from '@angular/core';
import { AnalysisResult } from '../../models';

@Component({
  selector: 'app-analysis-results',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './analysis-results.html',
  styleUrl: './analysis-results.scss',
})
export class AnalysisResultsComponent {
  private readonly snackBar = inject(MatSnackBar);

  // Input from parent component
  readonly analysisResult = input<AnalysisResult | null>(null);

  // Computed signals for display
  readonly hasResults = computed(() => this.analysisResult() !== null);

  readonly suggestionCount = computed(() => this.analysisResult()?.suggestions.length || 0);
  readonly securityCount = computed(() => this.analysisResult()?.security.length || 0);
  readonly performanceCount = computed(() => this.analysisResult()?.performance.length || 0);
  readonly testScenarioCount = computed(() => this.analysisResult()?.testScenarios.length || 0);

  /**
   * Get severity badge color
   */
  getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      critical: 'error',
      high: 'warn',
      error: 'warn',
      warning: 'accent',
      medium: 'accent',
      low: 'primary',
      info: 'primary',
      suggestion: 'primary',
    };
    return colors[severity] || 'primary';
  }

  /**
   * Get category icon
   */
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      security: 'security',
      performance: 'speed',
      'best-practice': 'thumb_up',
      style: 'palette',
      bug: 'bug_report',
      maintainability: 'engineering',
    };
    return icons[category] || 'info';
  }

  /**
   * Copy text to clipboard
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Copied to clipboard', 'Close', { duration: 2000 });
    });
  }

  /**
   * Copy code suggestion
   */
  copySuggestion(suggestion: any): void {
    const text = `${suggestion.file}:${suggestion.line}\n${suggestion.message}${
      suggestion.suggestedCode ? `\n\nSuggested:\n${suggestion.suggestedCode}` : ''
    }`;
    this.copyToClipboard(text);
  }

  /**
   * Copy test scenario
   */
  copyScenario(scenario: any): void {
    const text = `${scenario.title}\n\nSteps:\n${scenario.steps
      .map((s: string, i: number) => `${i + 1}. ${s}`)
      .join('\n')}\n\nExpected: ${scenario.expectedResult}`;
    this.copyToClipboard(text);
  }

  /**
   * Format file path for display
   */
  getShortFilePath(path: string): string {
    const parts = path.split('/');
    return parts.length > 3 ? `.../${parts.slice(-3).join('/')}` : path;
  }
}
