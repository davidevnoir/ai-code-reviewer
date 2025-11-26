/**
 * Environment Configuration
 * Production environment settings
 */

export const environment = {
  production: true,

  // Azure OpenAI Configuration
  azureOpenAI: {
    apiKey: '', // Load from Azure Key Vault or secure config
    endpoint: '', // Production endpoint
    deployment: '',
    apiVersion: '2024-02-15-preview',
    model: 'gpt-4o' as const,
    temperature: 0.3,
    maxTokens: 2000,
  },

  // GitHub Configuration
  github: {
    token: '', // Load from secure storage
    modelRepoUrl: '',
  },

  // API Configuration
  api: {
    baseUrl: 'https://api.yourapp.com/api',
    timeout: 30000,
  },

  // Feature Flags
  features: {
    enableModelRepo: true,
    enableTestGeneration: true,
    enableSchemaDetection: true,
    enableCostTracking: true,
  },

  // Application Settings
  app: {
    maxPRSize: 50,
    cacheResults: true,
    cacheDuration: 3600000,
  },
};
