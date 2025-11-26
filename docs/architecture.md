# System Architecture

## Overview

The PR Analysis application consists of an Angular frontend UI and a backend API service that integrates with GitHub and Azure OpenAI for intelligent code review.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Angular)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PR Input    │  │   Analysis   │  │   Download   │          │
│  │  Component   │  │   Results    │  │   Section    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP/REST
┌────────────────────────────▼─────────────────────────────────────┐
│                       BACKEND API                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   API        │  │   GitHub     │  │    Azure     │          │
│  │   Gateway    │  │   Client     │  │   OpenAI     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Analysis    │  │   Model      │  │     QA       │          │
│  │   Engine     │  │   Repo       │  │  Generator   │          │
│  │              │  │   Context    │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────┬──────────────────────────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         ▼                                      ▼
┌─────────────────┐                   ┌─────────────────┐
│     GitHub      │                   │  Azure OpenAI   │
│      API        │                   │    Service      │
└─────────────────┘                   └─────────────────┘
```

## Component Breakdown

### Frontend (Angular 21)

#### 1. PR Input Component

- **Purpose**: Accept GitHub PR URL input
- **Features**:
  - URL validation
  - Loading states
  - Error handling
- **Output**: Triggers analysis request

#### 2. Analysis Results Component

- **Purpose**: Display AI-generated analysis
- **Sections**:
  - Code Suggestions
  - Recommendations
  - Code Changes
  - Schema Changes
  - Test Scenarios
  - Test Cases
- **Features**:
  - Collapsible sections
  - Copy to clipboard
  - Syntax highlighting (future)

#### 3. Download Section Component

- **Purpose**: Export analysis results
- **Formats**:
  - JSON (complete data)
  - CSV (test cases)
  - PDF (reports)
  - Markdown (documentation)
  - SQL (schema changes)
- **Features**:
  - Format selection
  - Individual downloads
  - Bulk download (zip)

### Backend API (Node.js/TypeScript)

#### 1. API Gateway

- **Routes**:
  - `POST /api/analyze` - Analyze PR
  - `GET /api/status/:id` - Check analysis status
  - `GET /api/results/:id` - Get analysis results
  - `POST /api/download` - Generate downloadable files

#### 2. GitHub Client

- **Responsibilities**:
  - Fetch PR metadata
  - Get file diffs
  - Retrieve commit history
  - Access model repository for standards

#### 3. Azure OpenAI Integration

- **Models Used**: GPT-4 or GPT-4o
- **Prompts**:
  - Code review with standards context
  - Test case generation
  - Impact analysis

#### 4. Analysis Engine

- **Pipeline**:
  1. Parse PR diff
  2. Load model repo standards
  3. Build AI prompts with context
  4. Execute AI analysis
  5. Generate test scenarios
  6. Format results

#### 5. Model Repository Context

- **Sources**:
  - Coding standards
  - Architecture patterns
  - Example code
  - Testing guidelines
- **Usage**: Injected into AI prompts

#### 6. QA Generator

- **Outputs**:
  - BDD test scenarios
  - Test cases
  - Coverage recommendations
  - Schema change tests

## Data Flow

### Analysis Request Flow

```
1. User enters PR URL
   ↓
2. Frontend validates URL
   ↓
3. POST request to /api/analyze
   ↓
4. Backend fetches PR from GitHub
   ↓
5. Load model repo standards
   ↓
6. Build AI prompt with context
   ↓
7. Call Azure OpenAI API
   ↓
8. Parse AI response
   ↓
9. Generate test cases
   ↓
10. Return formatted results
   ↓
11. Frontend displays results
   ↓
12. User can download exports
```

### Model Repository Integration

```
Model Repo (GitHub)
├── .github/coding-standards.md
├── ARCHITECTURE.md
├── docs/test-patterns.md
└── examples/
    ├── good-code-examples.ts
    └── test-examples.ts
         ↓
    Fetched by Backend
         ↓
    Injected into AI Prompt
         ↓
    Used as Context for Analysis
```

## Technology Stack

### Frontend

- **Framework**: Angular 21
- **UI Library**: Angular Material
- **State**: Signals (built-in)
- **HTTP**: HttpClient
- **Styling**: SCSS

### Backend

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **AI**: Azure OpenAI SDK
- **GitHub**: Octokit

### Infrastructure (Future)

- **Hosting**: Azure App Service / Vercel
- **Database**: PostgreSQL (for history)
- **Cache**: Redis (for results)
- **Storage**: Azure Blob (for exports)

## Security Considerations

### Authentication

- GitHub token for API access
- Azure Key Vault for secrets
- JWT for frontend sessions

### Data Protection

- No code stored in AI service
- Sanitize sensitive data in prompts
- Encrypt data at rest
- HTTPS for all communication

### Rate Limiting

- GitHub API: 5000 req/hour
- Azure OpenAI: 10 req/min
- Frontend API: 100 req/min per user

## Scalability

### Horizontal Scaling

- Multiple frontend instances (CDN)
- Load-balanced backend servers
- Distributed caching

### Performance Optimization

- Cache GitHub API responses
- Queue-based async processing
- Paginated results
- Lazy loading components

## Future Enhancements

### Phase 2

- Real-time analysis updates (WebSockets)
- GitHub webhook integration
- Database for analysis history
- User authentication

### Phase 3

- Team analytics dashboard
- Custom rule engine
- GitHub Action integration
- VS Code extension

### Phase 4

- Multi-repository support
- AI model fine-tuning
- Historical trend analysis
- Cost optimization features

---

**Version**: 1.0.0  
**Last Updated**: November 26, 2025
