import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfigService, AppConfig } from '../../services/config.service';

@Component({
  selector: 'app-settings-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSnackBarModule,
  ],
  templateUrl: './settings-dialog.html',
  styleUrl: './settings-dialog.scss',
})
export class SettingsDialogComponent {
  private readonly configService = inject(ConfigService);
  private readonly dialogRef = inject(MatDialogRef<SettingsDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);

  // Available API versions
  readonly availableApiVersions = [
    { value: '2024-10-21', label: '2024-10-21 (Latest - Stable)' },
    { value: '2024-08-01-preview', label: '2024-08-01-preview (Preview)' },
    { value: '2024-06-01', label: '2024-06-01 (Stable)' },
    { value: '2024-05-01-preview', label: '2024-05-01-preview (Preview)' },
    { value: '2024-04-01-preview', label: '2024-04-01-preview (Preview)' },
    { value: '2024-02-15-preview', label: '2024-02-15-preview (Legacy)' },
    { value: '2024-02-01', label: '2024-02-01 (Legacy)' },
  ];

  // Form state
  azureConfig = signal({
    apiKey: '',
    endpoint: '',
    deployment: '',
    apiVersion: '2024-10-21',
  });

  githubConfig = signal({
    token: '',
    modelRepoUrl: '',
  });

  showApiKey = signal(false);
  showGitHubToken = signal(false);

  constructor() {
    this.loadExistingConfig();
  }

  /**
   * Load existing configuration
   */
  private loadExistingConfig(): void {
    const config = this.configService.config();
    if (config) {
      this.azureConfig.set({ ...config.azureOpenAI });
      this.githubConfig.set({
        token: config.github.token,
        modelRepoUrl: config.github.modelRepoUrl || '',
      });
    }
  }

  /**
   * Save configuration
   */
  save(): void {
    const config: AppConfig = {
      azureOpenAI: this.azureConfig(),
      github: this.githubConfig(),
    };

    // Validate
    const errors = this.configService.validateConfig(config);
    if (errors.length > 0) {
      this.snackBar.open(`Validation errors: ${errors.join(', ')}`, 'Close', {
        duration: 5000,
      });
      return;
    }

    // Save
    try {
      this.configService.saveConfig(config);
      this.snackBar.open('Configuration saved successfully', 'Close', {
        duration: 3000,
      });
      this.dialogRef.close();
    } catch (error) {
      this.snackBar.open('Failed to save configuration', 'Close', {
        duration: 3000,
      });
    }
  }

  /**
   * Cancel and close dialog
   */
  cancel(): void {
    this.dialogRef.close();
  }

  /**
   * Clear all configuration
   */
  clearConfig(): void {
    if (confirm('Are you sure you want to clear all configuration?')) {
      this.configService.clearConfig();
      this.azureConfig.set({
        apiKey: '',
        endpoint: '',
        deployment: '',
        apiVersion: '2024-10-21',
      });
      this.githubConfig.set({
        token: '',
        modelRepoUrl: '',
      });
      this.snackBar.open('Configuration cleared', 'Close', { duration: 3000 });
    }
  }

  /**
   * Toggle API key visibility
   */
  toggleApiKeyVisibility(): void {
    this.showApiKey.set(!this.showApiKey());
  }

  /**
   * Toggle GitHub token visibility
   */
  toggleGitHubTokenVisibility(): void {
    this.showGitHubToken.set(!this.showGitHubToken());
  }

  /**
   * Update Azure config field
   */
  updateAzureField(field: keyof ReturnType<typeof this.azureConfig>, value: string): void {
    this.azureConfig.update((config) => ({
      ...config,
      [field]: value,
    }));
  }

  /**
   * Update GitHub config field
   */
  updateGitHubField(field: keyof ReturnType<typeof this.githubConfig>, value: string): void {
    this.githubConfig.update((config) => ({
      ...config,
      [field]: value,
    }));
  }
}
