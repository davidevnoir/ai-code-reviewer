# PR Analysis UI

> AI-powered GitHub Pull Request analysis tool with Azure OpenAI integration

**Status:** 🚧 Services Complete - UI Integration Next  
**Version:** 1.0.0  
**Framework:** Angular 21  
**Last Updated:** November 26, 2025

---

## 📋 Overview

PR Analysis UI is a sophisticated Angular application that analyzes GitHub Pull Requests using Azure OpenAI. It provides:

- 🔍 **AI-Powered Code Review** - Get intelligent suggestions and recommendations
- 🔒 **Security Analysis** - Identify vulnerabilities and security issues
- ⚡ **Performance Insights** - Detect performance bottlenecks
- 🧪 **Test Generation** - Auto-generate test scenarios and cases
- 📊 **Multiple Export Formats** - JSON, CSV, Markdown, SQL, and more

---

## 🎯 Features

### Current (Sessions 1-2) ✅

- ✅ Complete UI components (pr-input, analysis-results, download-section)
- ✅ GitHub API integration service
- ✅ Azure OpenAI analysis service
- ✅ Analysis orchestration service
- ✅ Multi-format download service
- ✅ TypeScript models for all data structures
- ✅ Environment configuration setup
- ✅ Comprehensive documentation

### Coming Soon (Session 3)

- 🔄 UI-Service integration
- 🔄 Configuration management
- 🔄 Settings dialog
- 🔄 Result caching
- 🔄 Cost tracking
- 🔄 Analysis history

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- Azure OpenAI account with deployed model
- GitHub personal access token

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd pr-analysis-ui

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
# - AZURE_OPENAI_API_KEY
# - AZURE_OPENAI_ENDPOINT
# - AZURE_OPENAI_DEPLOYMENT
# - GITHUB_TOKEN

# Start development server
ng serve
```

Open http://localhost:4200 in your browser.

---

## 📚 Documentation

### 📖 Main Docs

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started quickly
- **[SERVICES-README.md](./SERVICES-README.md)** - Comprehensive services documentation
- **[INTEGRATION-EXAMPLES.md](./INTEGRATION-EXAMPLES.md)** - Code integration examples
- **[CHECKLIST.md](./CHECKLIST.md)** - Complete implementation checklist

### 📁 Project Docs

- **[Architecture](./docs/architecture.md)** - System design and architecture
- **[AI Context](./docs/ai-context.md)** - AI integration details
- **[API Keys](./docs/api-keys.md)** - Credential management
- **[Coding Conventions](./docs/coding-conventions.md)** - Code standards

### 📝 Session Summaries

- **[SESSION-2-SUMMARY.md](./SESSION-2-SUMMARY.md)** - Services implementation summary

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Frontend (UI)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PR Input    │  │   Analysis   │  │   Download   │      │
│  │  Component   │  │   Results    │  │   Section    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         └────────────────┬─────────────────┘               │
└──────────────────────────┼─────────────────────────────────┘
                           │
         ┌─────────────────┴────────────────┐
         │       Services Layer             │
         │  ┌────────────────────────────┐  │
         │  │   AnalysisService          │  │
         │  │   (Orchestrator)           │  │
         │  └───┬──────────────────┬─────┘  │
         │      │                  │         │
         │  ┌───▼────────┐  ┌──────▼─────┐  │
         │  │  GitHub    │  │   Azure    │  │
         │  │  Service   │  │   OpenAI   │  │
         │  └────────────┘  └────────────┘  │
         │  ┌────────────────────────────┐  │
         │  │   DownloadService          │  │
         │  └────────────────────────────┘  │
         └───────────────────────────────────┘
                           │
         ┌─────────────────┴────────────────┐
         ▼                                   ▼
┌─────────────────┐               ┌─────────────────┐
│  GitHub API     │               │  Azure OpenAI   │
│  (Pull Requests)│               │  (GPT-4/GPT-4o) │
└─────────────────┘               └─────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

- **Framework:** Angular 21
- **UI Library:** Angular Material
- **State Management:** Signals (built-in)
- **HTTP Client:** Angular HttpClient
- **Styling:** SCSS
- **Language:** TypeScript 5.6+

### Backend Integration

- **GitHub API:** REST API v3
- **Azure OpenAI:** Chat Completions API
- **Authentication:** Bearer tokens

### Development Tools

- **CLI:** Angular CLI 21
- **Package Manager:** npm
- **Build Tool:** esbuild (Angular default)
- **Testing:** Karma + Jasmine

---

## 📂 Project Structure

```
pr-analysis-ui/
├── src/
│   ├── app/
│   │   ├── components/          # UI components
│   │   │   ├── pr-input/        # PR URL input
│   │   │   ├── analysis-results/# Results display
│   │   │   └── download-section/# Download buttons
│   │   ├── services/            # Business logic services
│   │   │   ├── github.service.ts
│   │   │   ├── azure-openai.service.ts
│   │   │   ├── analysis.service.ts
│   │   │   └── download.service.ts
│   │   ├── models/              # TypeScript interfaces
│   │   │   ├── github.model.ts
│   │   │   ├── analysis.model.ts
│   │   │   └── ai.model.ts
│   │   ├── app.ts              # Main app component
│   │   └── app.config.ts       # App configuration
│   ├── environments/            # Environment configs
│   ├── styles.scss             # Global styles
│   └── index.html              # Entry HTML
├── docs/                        # Documentation
├── .env.example                # Environment template
├── SERVICES-README.md          # Services documentation
├── QUICKSTART.md               # Quick start guide
├── INTEGRATION-EXAMPLES.md     # Integration examples
├── CHECKLIST.md                # Implementation checklist
└── README.md                   # This file
```

---

## 🔧 Configuration

### Azure OpenAI Setup

1. Create Azure OpenAI resource in [Azure Portal](https://portal.azure.com)
2. Deploy a model (GPT-4 or GPT-4o recommended)
3. Get your credentials:
   - API Key
   - Endpoint URL
   - Deployment name

### GitHub Token Setup

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic)
3. Grant `repo` permission
4. Copy the token

### Environment Configuration

Add to `.env.local`:

```env
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your_deployment_name
GITHUB_TOKEN=ghp_your_token_here
```

---

## 💻 Development

### Start Dev Server

```bash
ng serve
# Open http://localhost:4200
```

### Build for Production

```bash
ng build --configuration production
# Output in dist/
```

### Run Tests

```bash
ng test
```

### Lint Code

```bash
ng lint
```

---

## 📊 Usage Example

```typescript
// In your component
import { inject } from '@angular/core';
import { AnalysisService, AzureOpenAIService } from './services';

export class YourComponent {
  private analysisService = inject(AnalysisService);
  private aiService = inject(AzureOpenAIService);

  ngOnInit() {
    // Configure services
    this.aiService.setConfig({
      apiKey: 'your-api-key',
      endpoint: 'your-endpoint',
      deployment: 'your-deployment',
    });

    this.analysisService.setGitHubToken('your-github-token');
  }

  analyzePR(prUrl: string) {
    this.analysisService.analyzePullRequest(prUrl).subscribe({
      next: (result) => console.log('Analysis:', result),
      error: (err) => console.error('Error:', err),
    });
  }
}
```

For more examples, see [INTEGRATION-EXAMPLES.md](./INTEGRATION-EXAMPLES.md).

---

## 🎨 Key Angular Features Used

- ✅ **Standalone Components** - No NgModules needed
- ✅ **Signals** - Reactive state management
- ✅ **inject() Function** - Modern dependency injection
- ✅ **RxJS Observables** - Async data streams
- ✅ **Angular Material** - UI components
- ✅ **Strict TypeScript** - Type safety

---

## 🔐 Security

- ❌ Never commit `.env.local` (already in .gitignore)
- ✅ Use environment variables for secrets
- ✅ Store tokens securely
- ✅ Validate all inputs
- ✅ Handle errors gracefully

---

## 🐛 Troubleshooting

### "Invalid GitHub token"

- Check token has `repo` permissions
- Ensure token starts with `ghp_`
- Regenerate if expired

### "Azure OpenAI error"

- Verify API key and endpoint
- Check deployment name is correct
- Ensure model is deployed in Azure

### CORS errors

- GitHub API supports CORS
- Azure OpenAI may need backend proxy
- Consider adding a simple backend

See [QUICKSTART.md](./QUICKSTART.md) for more troubleshooting tips.

---

## 📈 Roadmap

### Session 1 ✅

- UI components (pr-input, analysis-results, download-section)
- Angular Material integration
- Responsive layout

### Session 2 ✅

- GitHub API service
- Azure OpenAI service
- Analysis orchestration
- Download service
- TypeScript models
- Documentation

### Session 3 (Next)

- [ ] UI-Service integration
- [ ] Configuration management
- [ ] Settings dialog
- [ ] Result caching
- [ ] Cost tracking

### Future

- [ ] Analysis history
- [ ] Backend API (optional)
- [ ] User authentication
- [ ] Team analytics
- [ ] CI/CD integration

---

## 🤝 Contributing

This is a learning/demo project. Feel free to:

- Report issues
- Suggest improvements
- Submit pull requests
- Share feedback

---

## 📄 License

[MIT License](LICENSE) - feel free to use this project however you like!

---

## 📞 Support

- **Documentation:** See docs/ folder
- **Examples:** See INTEGRATION-EXAMPLES.md
- **Issues:** Create a GitHub issue
- **Questions:** Check QUICKSTART.md

---

## 🙏 Acknowledgments

- Built with [Angular 21](https://angular.dev)
- Powered by [Azure OpenAI](https://azure.microsoft.com/products/ai-services/openai-service)
- Uses [GitHub API](https://docs.github.com/rest)
- UI components from [Angular Material](https://material.angular.io)

---

## 📊 Project Status

**Current Phase:** Services Complete ✅  
**Next Phase:** UI Integration  
**Overall Progress:** ~60% complete

### Completed

- ✅ Project setup
- ✅ UI components
- ✅ Services implementation
- ✅ TypeScript models
- ✅ Documentation

### In Progress

- 🔄 UI-Service integration

### Planned

- ⏳ Configuration UI
- ⏳ Enhanced features
- ⏳ Testing
- ⏳ Deployment

---

**Made with ❤️ using Angular 21 and Azure OpenAI**

For detailed information, see [SERVICES-README.md](./SERVICES-README.md)
