/**
 * Environment Configuration
 * Development environment settings
 */

export const environment = {
  production: false,

  // Azure OpenAI Configuration
  azureOpenAI: {
    apiKey: '', // Set this from environment variable or config
    endpoint: '', // e.g., 'https://your-resource.openai.azure.com/'
    deployment: '', // Your deployment name
    apiVersion: '2024-02-15-preview',
    model: 'gpt-4o' as const,
    temperature: 0.3,
    maxTokens: 2000,
  },

  // GitHub Configuration
  github: {
    token: '', // Set this from user input or secure storage
    modelRepoUrl: '', // Optional: URL to model repository with standards
  },

  // API Configuration (for future backend)
  api: {
    baseUrl: 'http://localhost:3000/api',
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
    maxPRSize: 50, // Maximum number of files in PR
    cacheResults: true,
    cacheDuration: 3600000, // 1 hour in ms
  },
};
