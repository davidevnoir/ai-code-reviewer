# PR Analysis UI - Services Documentation

## Overview

This document describes the services created for the PR Analysis application. These services handle GitHub API integration, Azure OpenAI analysis, and file downloads.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Components Layer                      │
│  (pr-input, analysis-results, download-section)         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Services Layer                         │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │           AnalysisService                       │   │
│  │  (Orchestrates the analysis pipeline)           │   │
│  └───┬─────────────────────────────────────────┬───┘   │
│      │                                         │       │
│  ┌───▼──────────────┐              ┌──────────▼───┐   │
│  │  GitHubService   │              │ AzureOpenAI  │   │
│  │  (Fetch PR data) │              │   Service    │   │
│  └──────────────────┘              └──────────────┘   │
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │          DownloadService                       │   │
│  │  (Generate and download files)                 │   │
│  └────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## Services

### 1. GitHubService

**Location:** `src/app/services/github.service.ts`

**Purpose:** Handles all interactions with the GitHub API

**Key Features:**

- Parse and validate PR URLs
- Fetch PR metadata (title, description, stats)
- Fetch PR files and diffs
- Fetch commit history
- Load model repository context files
- Error handling for GitHub API

**Key Methods:**

```typescript
parsePRUrl(url: string): ParsedPRUrl | null
isValidPRUrl(url: string): boolean
fetchPullRequest(prUrl: string, token: string): Observable<GitHubPullRequest>
fetchPRFiles(owner, repo, prNumber, token): Observable<GitHubFile[]>
fetchPRCommits(owner, repo, prNumber, token): Observable<GitHubCommit[]>
loadModelRepoContext(modelRepoUrl, token): Observable<ModelRepositoryContext>
```

**Usage Example:**

```typescript
const githubService = inject(GitHubService);

// Validate URL
if (githubService.isValidPRUrl(url)) {
  // Fetch PR data
  githubService.fetchPullRequest(url, token).subscribe({
    next: (pr) => console.log('PR:', pr),
    error: (err) => console.error('Error:', err),
  });
}
```

---

### 2. AzureOpenAIService

**Location:** `src/app/services/azure-openai.service.ts`

**Purpose:** Handles AI-powered code analysis using Azure OpenAI

**Key Features:**

- Prompt engineering with context injection
- Token estimation and cost calculation
- Structured JSON response parsing
- Code review analysis
- Test scenario generation
- Error handling with retry logic

**Key Methods:**

```typescript
setConfig(config: Partial<AIConfig>): void
analyzePR(request: AIAnalysisRequest): Observable<AIAnalysisResponse>
generateTests(diff: string, context: string): Observable<any>
estimateTokens(text: string): number
calculateCost(inputTokens, outputTokens): TokenEstimate
```

**Configuration:**

```typescript
aiService.setConfig({
  apiKey: 'your-api-key',
  endpoint: 'https://your-resource.openai.azure.com/',
  deployment: 'your-deployment',
  model: 'gpt-4o',
  temperature: 0.3,
  maxTokens: 2000,
});
```

**Usage Example:**

```typescript
const aiService = inject(AzureOpenAIService);

const request: AIAnalysisRequest = {
  diff: prDiff,
  prMetadata: { title, description, files, additions, deletions },
  context: { codingStandards, architecturePatterns, testingGuidelines },
};

aiService.analyzePR(request).subscribe({
  next: (result) => console.log('Analysis:', result),
  error: (err) => console.error('AI Error:', err),
});
```

---

### 3. AnalysisService

**Location:** `src/app/services/analysis.service.ts`

**Purpose:** Orchestrates the complete PR analysis pipeline

**Key Features:**

- Multi-step analysis pipeline
- Progress tracking with signals
- Combines GitHub and AI services
- Formats results into structured data
- Detects schema changes
- Generates test cases
- Error recovery

**Analysis Pipeline:**

1. Fetch PR data from GitHub
2. Load model repository context
3. Perform AI analysis
4. Generate test scenarios
5. Format final results

**Key Methods:**

```typescript
setGitHubToken(token: string): void
setModelRepoUrl(url: string): void
analyzePullRequest(prUrl: string): Observable<AnalysisResult>
```

**Status Signal:**

```typescript
readonly status = signal<AnalysisStatus>({
  status: 'pending',
  progress: 0
});
```

**Usage Example:**

```typescript
const analysisService = inject(AnalysisService);

// Configure
analysisService.setGitHubToken('ghp_token');
analysisService.setModelRepoUrl('https://github.com/org/model-repo');

// Subscribe to status
effect(() => {
  const status = analysisService.status();
  console.log(`Status: ${status.status}, Progress: ${status.progress}%`);
});

// Start analysis
analysisService.analyzePullRequest(prUrl).subscribe({
  next: (result) => {
    console.log('Analysis complete:', result);
  },
  error: (err) => {
    console.error('Analysis failed:', err);
  },
});
```

---

### 4. DownloadService

**Location:** `src/app/services/download.service.ts`

**Purpose:** Generate and download analysis results in various formats

**Key Features:**

- JSON export (complete data)
- CSV export (test cases, suggestions)
- Markdown export (reports, scenarios)
- SQL export (schema changes)
- Text export (summaries)

**Supported Formats:**

- `downloadJSON()` - Complete analysis data
- `downloadTestScenariosMarkdown()` - Test scenarios in Markdown
- `downloadTestCasesCSV()` - Test cases in CSV
- `downloadSchemaChangesSQL()` - Schema changes as SQL
- `downloadSuggestionsCSV()` - Code suggestions in CSV
- `downloadFullReportMarkdown()` - Comprehensive report
- `downloadSummaryText()` - Quick summary

**Usage Example:**

```typescript
const downloadService = inject(DownloadService);
const analysisResult: AnalysisResult = ...;

// Download complete JSON
downloadService.downloadJSON(analysisResult);

// Download test scenarios
downloadService.downloadTestScenariosMarkdown(analysisResult.testScenarios);

// Download full report
downloadService.downloadFullReportMarkdown(analysisResult);
```

---

## Models & Types

All TypeScript interfaces are defined in `src/app/models/`:

### github.model.ts

- `GitHubPullRequest` - PR metadata
- `GitHubFile` - File changes
- `GitHubCommit` - Commit info
- `ModelRepositoryContext` - Context from model repo

### analysis.model.ts

- `AnalysisResult` - Complete analysis output
- `CodeSuggestion` - Code improvement suggestions
- `SecurityIssue` - Security vulnerabilities
- `PerformanceIssue` - Performance problems
- `TestScenario` - Test case scenarios
- `TestCase` - Detailed test cases
- `Recommendation` - General recommendations

### ai.model.ts

- `AIConfig` - Azure OpenAI configuration
- `AIRequest` - AI API request
- `AIResponse` - AI API response
- `AIAnalysisRequest` - Analysis input
- `AIAnalysisResponse` - Analysis output

---

## Environment Configuration

### Development: `src/environments/environment.development.ts`

```typescript
export const environment = {
  production: false,
  azureOpenAI: {
    apiKey: '',
    endpoint: '',
    deployment: '',
    apiVersion: '2024-02-15-preview',
    model: 'gpt-4o',
  },
  github: {
    token: '',
    modelRepoUrl: '',
  },
  features: {
    enableModelRepo: true,
    enableTestGeneration: true,
  },
};
```

### Production: `src/environments/environment.ts`

Same structure, but loads from secure sources (Azure Key Vault, etc.)

### .env.example

Template for environment variables - copy to `.env.local` and fill in:

```bash
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your_deployment_name
GITHUB_TOKEN=your_github_token
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your credentials
```

### 3. Get Azure OpenAI Credentials

1. Go to [Azure Portal](https://portal.azure.com)
2. Create Azure OpenAI resource
3. Deploy a model (GPT-4 or GPT-4o)
4. Copy API key and endpoint
5. Add to `.env.local`

### 4. Get GitHub Token

1. Go to GitHub Settings → Developer settings
2. Generate Personal Access Token
3. Grant permissions: `repo`, `read:org`
4. Copy token to `.env.local`

### 5. Configure Services in Components

In your component (e.g., `pr-input.component.ts`):

```typescript
import { inject } from '@angular/core';
import { AnalysisService, AzureOpenAIService } from '../services';

export class PrInputComponent {
  private analysisService = inject(AnalysisService);
  private aiService = inject(AzureOpenAIService);

  ngOnInit() {
    // Configure AI
    this.aiService.setConfig({
      apiKey: environment.azureOpenAI.apiKey,
      endpoint: environment.azureOpenAI.endpoint,
      deployment: environment.azureOpenAI.deployment,
    });

    // Configure analysis
    this.analysisService.setGitHubToken(environment.github.token);
  }
}
```

---

## Error Handling

All services implement comprehensive error handling:

### GitHub Errors

- `401` - Invalid token
- `403` - Rate limit exceeded
- `404` - PR not found

### AI Errors

- `UNAUTHORIZED` - Invalid API key
- `RATE_LIMIT` - Rate limit exceeded
- `BAD_REQUEST` - Invalid request format

### Analysis Errors

- `MISSING_TOKEN` - GitHub token required
- `INVALID_URL` - Invalid PR URL
- `ANALYSIS_ERROR` - General analysis failure

**Example Error Handling:**

```typescript
service.analyzePullRequest(url).subscribe({
  next: (result) => {
    // Success
  },
  error: (err) => {
    if (err.code === 'RATE_LIMIT') {
      // Handle rate limit
      console.log(`Retry after: ${err.retryAfter} seconds`);
    } else {
      // Generic error
      console.error(err.message);
    }
  },
});
```

---

## Testing

To test the services:

```bash
# Run unit tests
ng test

# Test specific service
ng test --include='**/*github.service.spec.ts'
```

---

## Next Steps

1. **Add HTTP Interceptors** for authentication headers
2. **Implement Caching** to reduce API calls
3. **Add Retry Logic** for failed requests
4. **Create Service Workers** for offline support
5. **Add Analytics** to track usage
6. **Implement Rate Limiting** UI feedback

---

## Related Documentation

- [Architecture](../docs/architecture.md)
- [AI Context](../docs/ai-context.md)
- [API Keys](../docs/api-keys.md)
- [Coding Conventions](../docs/coding-conventions.md)

---

**Version:** 1.0.0  
**Last Updated:** November 26, 2025
