# Quick Start Guide - PR Analysis UI

## Session 2 Completed: Services Implementation ✅

We've successfully created all the core services for the PR Analysis application!

## What Was Built

### 📁 Models (Type Definitions)

- `src/app/models/github.model.ts` - GitHub PR and API types
- `src/app/models/analysis.model.ts` - Analysis results and suggestions
- `src/app/models/ai.model.ts` - Azure OpenAI types
- `src/app/models/index.ts` - Barrel exports

### 🔧 Services

- `src/app/services/github.service.ts` - GitHub API integration
- `src/app/services/azure-openai.service.ts` - AI analysis service
- `src/app/services/analysis.service.ts` - Analysis orchestration
- `src/app/services/download.service.ts` - File export/download
- `src/app/services/index.ts` - Barrel exports

### ⚙️ Configuration

- `src/environments/environment.development.ts` - Dev config
- `src/environments/environment.ts` - Production config
- `.env.example` - Environment variable template
- `.gitignore` - Updated to exclude `.env.local`

### 📚 Documentation

- `SERVICES-README.md` - Comprehensive services documentation

## Quick Setup

### 1. Configure Your Environment

```bash
# Copy the environment template
cp .env.example .env.local

# Edit .env.local with your credentials
# You'll need:
# - Azure OpenAI API key and endpoint
# - GitHub personal access token
```

### 2. Get Azure OpenAI Credentials

1. Visit [Azure Portal](https://portal.azure.com)
2. Create an Azure OpenAI resource
3. Deploy a model (GPT-4o recommended)
4. Copy your API key and endpoint
5. Add to `.env.local`:
   ```
   AZURE_OPENAI_API_KEY=your_key_here
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT=your_deployment_name
   ```

### 3. Get GitHub Token

1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic)
3. Grant permissions: `repo` (full control)
4. Copy token to `.env.local`:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   ```

### 4. Test the Services

The services are ready to use! Here's how to integrate them into your components:

```typescript
// In your component
import { inject, effect } from '@angular/core';
import { AnalysisService, AzureOpenAIService } from './services';
import { environment } from '../environments/environment.development';

export class YourComponent {
  private analysisService = inject(AnalysisService);
  private aiService = inject(AzureOpenAIService);

  ngOnInit() {
    // Configure AI service
    this.aiService.setConfig({
      apiKey: environment.azureOpenAI.apiKey,
      endpoint: environment.azureOpenAI.endpoint,
      deployment: environment.azureOpenAI.deployment,
    });

    // Configure analysis service
    this.analysisService.setGitHubToken(environment.github.token);

    // Monitor progress
    effect(() => {
      const status = this.analysisService.status();
      console.log(`Status: ${status.status}, Progress: ${status.progress}%`);
    });
  }

  analyzePR(prUrl: string) {
    this.analysisService.analyzePullRequest(prUrl).subscribe({
      next: (result) => {
        console.log('Analysis complete!', result);
      },
      error: (err) => {
        console.error('Analysis failed:', err);
      },
    });
  }
}
```

## Service Overview

### GitHubService

Fetches PR data from GitHub API

- Validates PR URLs
- Gets PR metadata, files, commits
- Loads model repository context

### AzureOpenAIService

Performs AI-powered analysis

- Prompt engineering
- Token management
- Cost estimation
- JSON response parsing

### AnalysisService

Orchestrates the full pipeline

- Combines GitHub + AI services
- Tracks progress with signals
- Formats results
- Handles errors

### DownloadService

Exports results in multiple formats

- JSON, CSV, Markdown, SQL, Text
- Test scenarios and cases
- Code suggestions
- Full reports

## Next Steps

### Phase 3: UI Integration

Now that the services are ready, integrate them with the UI components:

1. **Update PrInputComponent**

   - Wire up analysis service
   - Show progress indicator
   - Handle errors

2. **Update AnalysisResultsComponent**

   - Display analysis results
   - Show suggestions, security issues
   - Render test scenarios

3. **Update DownloadSectionComponent**

   - Wire up download service
   - Add format selection
   - Enable bulk downloads

4. **Add Configuration UI**
   - API key input
   - Settings panel
   - Token validation

### Phase 4: Advanced Features

- Local storage for API keys
- Result caching
- Cost tracking dashboard
- History of analyses
- Export templates

## Architecture Summary

```
User Input (PR URL)
        ↓
   PrInputComponent
        ↓
   AnalysisService (orchestrates)
        ↓
   ┌────────────┬────────────────┐
   ↓            ↓                ↓
GitHubService  AzureOpenAI   DownloadService
(fetch PR)     (analyze)     (export)
```

## Troubleshooting

### "Invalid GitHub token"

- Check token has `repo` permissions
- Token should start with `ghp_`
- Regenerate if expired

### "Azure OpenAI error"

- Verify API key and endpoint
- Check deployment name is correct
- Ensure model is deployed

### "CORS errors"

- GitHub API: No CORS issues (supports browser)
- Azure OpenAI: May need backend proxy for browser requests
- Consider creating a simple backend for production

## Resources

- [Full Services Documentation](./SERVICES-README.md)
- [Architecture Guide](./docs/architecture.md)
- [AI Context Guide](./docs/ai-context.md)
- [Azure OpenAI Docs](https://learn.microsoft.com/azure/ai-services/openai/)
- [GitHub API Docs](https://docs.github.com/rest)

## Development Commands

```bash
# Start dev server
ng serve

# Build for production
ng build

# Run tests
ng test

# Check for errors
ng lint
```

---

**Status:** Services Complete ✅  
**Next:** UI Integration  
**Last Updated:** November 26, 2025
