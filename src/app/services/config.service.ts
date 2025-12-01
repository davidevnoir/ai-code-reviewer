import { Injectable, signal, computed } from '@angular/core';

/**
 * Configuration Model
 */
export interface AppConfig {
  azureOpenAI: {
    apiKey: string;
    endpoint: string;
    deployment: string;
    apiVersion: string;
  };
  github: {
    token: string;
    modelRepoUrl?: string;
  };
}

/**
 * ConfigService
 * Manages application configuration and credentials
 * - Loads/saves to localStorage
 * - Validates configuration
 * - Provides reactive config state
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly STORAGE_KEY = 'pr-analysis-config';

  // Configuration state
  private readonly configState = signal<AppConfig | null>(null);

  // Public computed signals
  readonly config = this.configState.asReadonly();
  readonly isConfigured = computed(() => {
    const cfg = this.configState();
    return !!(
      cfg?.azureOpenAI.apiKey &&
      cfg?.azureOpenAI.endpoint &&
      cfg?.azureOpenAI.deployment &&
      cfg?.github.token
    );
  });

  constructor() {
    this.loadConfig();
  }

  /**
   * Load configuration from localStorage
   */
  loadConfig(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.configState.set(parsed);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  /**
   * Save configuration to localStorage
   */
  saveConfig(config: AppConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      this.configState.set(config);
    } catch (error) {
      console.error('Failed to save config:', error);
      throw new Error('Failed to save configuration');
    }
  }

  /**
   * Update partial configuration
   */
  updateConfig(partial: Partial<AppConfig>): void {
    const current = this.configState();
    const updated = {
      ...current,
      ...partial,
      azureOpenAI: {
        ...(current?.azureOpenAI || {}),
        ...(partial.azureOpenAI || {}),
      },
      github: {
        ...(current?.github || {}),
        ...(partial.github || {}),
      },
    } as AppConfig;

    this.saveConfig(updated);
  }

  /**
   * Clear configuration
   */
  clearConfig(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.configState.set(null);
    } catch (error) {
      console.error('Failed to clear config:', error);
    }
  }

  /**
   * Validate Azure OpenAI configuration
   */
  validateAzureConfig(config: AppConfig['azureOpenAI']): string | null {
    if (!config.apiKey) {
      return 'API key is required';
    }
    if (!config.endpoint) {
      return 'Endpoint URL is required';
    }
    if (!config.endpoint.startsWith('https://')) {
      return 'Endpoint must be a valid HTTPS URL';
    }
    if (!config.deployment) {
      return 'Deployment name is required';
    }
    return null;
  }

  /**
   * Validate GitHub configuration
   */
  validateGitHubConfig(config: AppConfig['github']): string | null {
    if (!config.token) {
      return 'GitHub token is required';
    }
    if (
      !config.token.startsWith('ghp_') &&
      !config.token.startsWith('github_pat_')
    ) {
      return 'Token should start with "ghp_" or "github_pat_"';
    }

    // Model repo URL is optional - if empty, skip validation
    if (config.modelRepoUrl) {
      const trimmedUrl = config.modelRepoUrl.trim();

      // If not empty, validate format
      if (trimmedUrl) {
        console.log('Validating URL:', trimmedUrl);

        // More permissive regex - allows uppercase, numbers, hyphens, underscores, dots
        const githubUrlPattern =
          /^https:\/\/github\.com\/[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_\.]+\/?$/;

        if (!githubUrlPattern.test(trimmedUrl)) {
          console.log('URL validation failed for:', trimmedUrl);
          return 'Invalid model repository URL';
        }
      }
    }

    return null;
  }

  /**
   * Validate complete configuration
   */
  validateConfig(config: AppConfig): string[] {
    const errors: string[] = [];

    const azureError = this.validateAzureConfig(config.azureOpenAI);
    if (azureError) errors.push(azureError);

    const githubError = this.validateGitHubConfig(config.github);
    if (githubError) errors.push(githubError);

    return errors;
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): AppConfig {
    return {
      azureOpenAI: {
        apiKey: '',
        endpoint: '',
        deployment: '',
        apiVersion: '2024-10-21',
      },
      github: {
        token: '',
        modelRepoUrl: '',
      },
    };
  }

  /**
   * Check if configuration is complete
   */
  hasValidConfig(): boolean {
    return this.isConfigured();
  }

  /**
   * Get Azure OpenAI configuration
   */
  getAzureConfig() {
    return this.configState()?.azureOpenAI;
  }

  /**
   * Get GitHub configuration
   */
  getGitHubConfig() {
    return this.configState()?.github;
  }
}
