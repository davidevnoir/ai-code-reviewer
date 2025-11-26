import { Component, signal, inject, effect, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AnalysisService, AzureOpenAIService, ConfigService, GitHubService } from '../../services';
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
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './pr-input.html',
  styleUrl: './pr-input.scss',
})
export class PrInputComponent {
  private readonly analysisService = inject(AnalysisService);
  private readonly aiService = inject(AzureOpenAIService);
  private readonly configService = inject(ConfigService);
  private readonly githubService = inject(GitHubService);
  private readonly snackBar = inject(MatSnackBar);

  // Component state
  prUrl = signal('');
  error = signal<string | null>(null);

  // Reactive state from services
  readonly analysisStatus = this.analysisService.status;
  readonly isConfigured = this.configService.isConfigured;

  // Output events
  readonly analysisComplete = output<AnalysisResult>();
  readonly openSettings = output<void>();

  constructor() {
    // Initialize services when config changes
    effect(() => {
      const config = this.configService.config();
      if (config) {
        this.initializeServices(config);
      }
    });
  }

  /**
   * Initialize services with configuration
   */
  private initializeServices(config: any): void {
    // Configure Azure OpenAI
    this.aiService.setConfig({
      apiKey: config.azureOpenAI.apiKey,
      endpoint: config.azureOpenAI.endpoint,
      deployment: config.azureOpenAI.deployment,
      apiVersion: config.azureOpenAI.apiVersion,
      model: 'gpt-4o',
      temperature: 0.3,
      maxTokens: 2000,
      topP: 0.9,
    });

    // Configure Analysis service
    this.analysisService.setGitHubToken(config.github.token);
    if (config.github.modelRepoUrl) {
      this.analysisService.setModelRepoUrl(config.github.modelRepoUrl);
    }
  }

  /**
   * Start PR analysis
   */
  analyzePR(): void {
    const url = this.prUrl();

    // Clear previous error
    this.error.set(null);

    // Check configuration
    if (!this.isConfigured()) {
      this.error.set('Please configure your API keys first');
      this.snackBar.open('Configuration required. Click the settings icon.', 'Close', {
        duration: 5000,
      });
      return;
    }

    // Validate URL
    if (!url) {
      this.error.set('Please enter a PR URL');
      return;
    }

    if (!this.githubService.isValidPRUrl(url)) {
      this.error.set('Please enter a valid GitHub Pull Request URL');
      return;
    }

    // Start analysis
    this.analysisService.analyzePullRequest(url).subscribe({
      next: (result) => {
        this.snackBar.open('Analysis complete!', 'Close', { duration: 3000 });
        this.analysisComplete.emit(result);
      },
      error: (err) => {
        const errorMessage = err.message || 'Analysis failed';
        this.error.set(errorMessage);
        this.snackBar.open(`Error: ${errorMessage}`, 'Close', { duration: 5000 });
      },
    });
  }

  /**
   * Check if PR URL is valid
   */
  private isValidGitHubPRUrl(url: string): boolean {
    const pattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+/;
    return pattern.test(url);
  }

  /**
   * Handle URL input change
   */
  onUrlChange(value: string): void {
    this.prUrl.set(value);
    this.error.set(null);
  }

  /**
   * Trigger settings dialog
   */
  showSettings(): void {
    this.openSettings.emit();
  }

  /**
   * Get progress percentage
   */
  get progress(): number {
    return this.analysisStatus().progress;
  }

  /**
   * Get current status message
   */
  get statusMessage(): string {
    return this.analysisStatus().currentStep || '';
  }

  /**
   * Check if analysis is in progress
   */
  get isAnalyzing(): boolean {
    return this.analysisStatus().status === 'analyzing';
  }
}
