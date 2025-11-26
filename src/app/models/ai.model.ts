/**
 * Azure OpenAI Models
 * Type definitions for AI service requests and responses
 */

export interface AIConfig {
  apiKey: string;
  endpoint: string;
  deployment: string;
  apiVersion: string;
  model: 'gpt-4' | 'gpt-4o' | 'gpt-4-turbo' | 'gpt-35-turbo';
  temperature: number;
  maxTokens: number;
  topP: number;
}

export interface AIPrompt {
  system: string;
  user: string;
  context?: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  responseFormat?: { type: 'text' | 'json_object' };
}

export interface AIResponse {
  id: string;
  model: string;
  created: number;
  choices: AIChoice[];
  usage: AIUsage;
}

export interface AIChoice {
  index: number;
  message: AIMessage;
  finishReason: 'stop' | 'length' | 'content_filter' | 'null';
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIAnalysisRequest {
  diff: string;
  prMetadata: {
    title: string;
    description: string;
    files: number;
    additions: number;
    deletions: number;
  };
  context: {
    codingStandards?: string;
    architecturePatterns?: string;
    testingGuidelines?: string;
  };
}

export interface AIAnalysisResponse {
  suggestions: Array<{
    file: string;
    line: number;
    message: string;
    severity: string;
    category: string;
    suggestedCode?: string;
  }>;
  security: Array<{
    file: string;
    issue: string;
    severity: string;
    recommendation: string;
  }>;
  performance: Array<{
    file: string;
    issue: string;
    impact: string;
    recommendation: string;
  }>;
  recommendations: Array<{
    category: string;
    priority: string;
    title: string;
    description: string;
  }>;
  tests: Array<{
    title: string;
    description: string;
    priority: string;
    category: string;
    steps: string[];
    expected: string;
  }>;
}

export interface TokenEstimate {
  input: number;
  output: number;
  total: number;
  cost: number;
}

export interface AIError {
  code: string;
  message: string;
  statusCode?: number;
  retryAfter?: number;
}
