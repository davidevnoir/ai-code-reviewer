# AI Context & Integration Guide

## Overview

This document describes how AI (Azure OpenAI) is integrated into the PR Analysis application and how to optimize prompts for better results.

---

## Azure OpenAI Configuration

### Model Selection

**Recommended Models:**

1. **GPT-4o** (Preferred)

   - Cost: $0.005/1K input, $0.015/1K output
   - Best balance of cost and performance
   - Fast response times

2. **GPT-4 Turbo**

   - Cost: $0.01/1K input, $0.03/1K output
   - Higher quality for complex analysis
   - Use for critical/large PRs

3. **GPT-3.5 Turbo**
   - Cost: $0.0005/1K input, $0.0015/1K output
   - Simple tasks only
   - Fast and cheap

### API Settings

```typescript
const config = {
  model: 'gpt-4o',
  temperature: 0.3, // Lower = more focused
  max_tokens: 2000, // Limit output length
  top_p: 0.9,
  frequency_penalty: 0,
  presence_penalty: 0,
  response_format: { type: 'json_object' }, // Structured output
};
```

---

## Prompt Engineering

### System Prompt Template

```typescript
const systemPrompt = `
You are an expert code reviewer with deep knowledge of software engineering best practices.

CONTEXT:
- Repository: {repoName}
- Programming Language: {language}
- Framework: {framework}

TEAM STANDARDS (from model repository):
{codingStandards}

ARCHITECTURE PATTERNS:
{architecturePatterns}

YOUR TASK:
Review the provided code changes and provide:
1. Code quality suggestions
2. Best practice recommendations
3. Potential bugs or issues
4. Security vulnerabilities
5. Performance improvements
6. Test scenario recommendations

FORMAT:
Respond in JSON format with the following structure:
{
  "suggestions": [{ "file": "...", "line": 0, "message": "...", "severity": "..." }],
  "security": [{ "issue": "...", "severity": "...", "recommendation": "..." }],
  "tests": [{ "scenario": "...", "steps": [...], "expected": "..." }]
}

Be specific, actionable, and reference the team's coding standards.
`;
```

### User Prompt Template

```typescript
const userPrompt = `
PULL REQUEST DETAILS:
- Title: {prTitle}
- Description: {prDescription}
- Files Changed: {fileCount}
- Lines Added: {additions}
- Lines Deleted: {deletions}

CODE CHANGES:
{diff}

Please analyze these changes according to our team standards and provide detailed feedback.
Focus on:
- Adherence to coding standards
- Architecture alignment
- Testability
- Security implications
- Performance impact
`;
```

---

## Model Repository Context

### Structure

```
model-repo/
├── .github/
│   └── coding-standards.md     # Team coding rules
├── ARCHITECTURE.md              # System design patterns
├── docs/
│   ├── api-guidelines.md
│   ├── security-checklist.md
│   └── testing-patterns.md
└── examples/
    ├── good-examples/
    └── anti-patterns/
```

### Loading Context

```typescript
async function loadModelRepoContext(repoUrl: string): Promise<Context> {
  const octokit = new Octokit({ auth: token });

  const [standards, architecture, testPatterns] = await Promise.all([
    fetchFile(octokit, repoUrl, '.github/coding-standards.md'),
    fetchFile(octokit, repoUrl, 'ARCHITECTURE.md'),
    fetchFile(octokit, repoUrl, 'docs/testing-patterns.md'),
  ]);

  return {
    codingStandards: standards,
    architecturePatterns: architecture,
    testingGuidelines: testPatterns,
  };
}
```

### Context Injection

```typescript
function buildPromptWithContext(diff: string, context: Context): string {
  return `
CODING STANDARDS:
${context.codingStandards}

ARCHITECTURE PATTERNS:
${context.architecturePatterns}

TESTING GUIDELINES:
${context.testingGuidelines}

CODE TO REVIEW:
${diff}

Analyze the code against these standards and provide specific feedback.
  `.trim();
}
```

---

## Token Management

### Estimating Tokens

```typescript
function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

function ensureWithinLimit(text: string, maxTokens: number): string {
  const estimated = estimateTokens(text);
  if (estimated <= maxTokens) return text;

  // Truncate to fit
  const chars = maxTokens * 4;
  return text.substring(0, chars) + '\n... (truncated)';
}
```

### Context Optimization

```typescript
function optimizeContext(diff: string, context: Context): string {
  const MAX_CONTEXT_TOKENS = 8000;

  // Priority: Standards > Architecture > Examples
  let budget = MAX_CONTEXT_TOKENS;

  const standards = ensureWithinLimit(context.codingStandards, Math.min(budget, 2000));
  budget -= estimateTokens(standards);

  const architecture = ensureWithinLimit(context.architecturePatterns, Math.min(budget, 1500));
  budget -= estimateTokens(architecture);

  const diff = ensureWithinLimit(
    diff,
    budget - 500 // Reserve for response
  );

  return buildPrompt(diff, { standards, architecture });
}
```

---

## Response Parsing

### Structured Output

```typescript
interface AIResponse {
  suggestions: Suggestion[];
  security: SecurityIssue[];
  tests: TestScenario[];
  summary: string;
}

async function parseAIResponse(response: string): Promise<AIResponse> {
  try {
    const parsed = JSON.parse(response);

    // Validate structure
    if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
      throw new Error('Invalid response structure');
    }

    return parsed as AIResponse;
  } catch (error) {
    console.error('Failed to parse AI response:', error);

    // Fallback: Extract information from text
    return extractFromText(response);
  }
}
```

### Extracting Information

```typescript
function extractFromText(text: string): AIResponse {
  const suggestions: Suggestion[] = [];

  // Extract suggestions using regex
  const suggestionPattern = /- \[(.*?)\] (.*?) \(line (\d+)\)/g;
  let match;

  while ((match = suggestionPattern.exec(text)) !== null) {
    suggestions.push({
      file: match[1],
      message: match[2],
      line: parseInt(match[3]),
      severity: 'info',
    });
  }

  return { suggestions, security: [], tests: [], summary: text };
}
```

---

## Test Generation Prompts

### Test Scenario Generation

```typescript
const testGenerationPrompt = `
Based on the code changes below, generate comprehensive test scenarios.

CODE CHANGES:
{diff}

TESTING GUIDELINES:
{testingPatterns}

Generate test scenarios in the following format:
{
  "scenarios": [
    {
      "title": "Test successful login",
      "description": "Verify user can log in with valid credentials",
      "steps": [
        "Navigate to login page",
        "Enter valid username and password",
        "Click login button"
      ],
      "expected": "User is logged in and redirected to dashboard",
      "priority": "high",
      "category": "functional"
    }
  ]
}

Include:
- Happy path scenarios
- Error cases
- Edge cases
- Security tests
- Performance considerations
`;
```

### BDD Format Generation

```typescript
const bddPrompt = `
Convert the following code changes into Gherkin/BDD format test scenarios.

CODE CHANGES:
{diff}

Format each scenario as:
Feature: [Feature name]
  Scenario: [Scenario name]
    Given [precondition]
    When [action]
    Then [expected result]
    
Include multiple scenarios covering different paths and edge cases.
`;
```

---

## Cost Optimization

### Caching Strategy

```typescript
import { createHash } from 'crypto';

class AICache {
  private cache = new Map<string, AIResponse>();

  getCacheKey(diff: string, context: Context): string {
    const hash = createHash('sha256');
    hash.update(diff);
    hash.update(JSON.stringify(context));
    return hash.digest('hex');
  }

  async getOrFetch(
    diff: string,
    context: Context,
    fetchFn: () => Promise<AIResponse>
  ): Promise<AIResponse> {
    const key = this.getCacheKey(diff, context);

    if (this.cache.has(key)) {
      console.log('Cache hit');
      return this.cache.get(key)!;
    }

    const result = await fetchFn();
    this.cache.set(key, result);
    return result;
  }
}
```

### Progressive Analysis

```typescript
async function analyzePR(pr: PullRequest): Promise<Analysis> {
  // Small PR: Full AI analysis
  if (pr.filesChanged <= 5) {
    return fullAIAnalysis(pr);
  }

  // Medium PR: Focus on critical files
  if (pr.filesChanged <= 20) {
    const criticalFiles = pr.files.filter(isCritical);
    return analyzeFiles(criticalFiles);
  }

  // Large PR: Static analysis + summary only
  return {
    staticAnalysis: await runLinters(pr),
    aiSummary: await generateSummary(pr), // Cheaper
    recommendation: 'PR is too large - consider splitting',
  };
}
```

---

## Error Handling

### API Failures

```typescript
async function callAIWithRetry(prompt: string, maxRetries: number = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw new Error('AI request failed after retries');
}
```

### Fallback Strategies

```typescript
async function analyzeWithFallback(pr: PullRequest): Promise<Analysis> {
  try {
    // Try Azure OpenAI (primary)
    return await analyzeWithAzureOpenAI(pr);
  } catch (error) {
    console.warn('Azure OpenAI failed, trying fallback');

    try {
      // Fallback to OpenAI direct
      return await analyzeWithOpenAI(pr);
    } catch (fallbackError) {
      console.error('All AI services failed');

      // Return static analysis only
      return {
        staticAnalysis: await runStaticAnalysis(pr),
        aiAnalysis: null,
        error: 'AI services unavailable',
      };
    }
  }
}
```

---

## Best Practices

### 1. Keep Prompts Focused

- One task per prompt
- Clear, specific instructions
- Include examples in system prompt

### 2. Validate Responses

- Check JSON structure
- Validate data types
- Handle missing fields gracefully

### 3. Monitor Costs

- Track token usage
- Set budget limits
- Use caching aggressively

### 4. Optimize Context

- Send only relevant code
- Prioritize important standards
- Truncate large diffs intelligently

### 5. Handle Failures

- Implement retries with backoff
- Have fallback strategies
- Log errors for debugging

---

## Monitoring & Debugging

### Logging

```typescript
function logAIRequest(prompt: string, response: string, tokens: number): void {
  console.log({
    timestamp: new Date().toISOString(),
    promptTokens: estimateTokens(prompt),
    responseTokens: tokens,
    cost: calculateCost(tokens),
    cached: false,
  });
}
```

### Cost Tracking

```typescript
class CostTracker {
  private dailyCost = 0;
  private monthlyCost = 0;

  track(inputTokens: number, outputTokens: number): void {
    const cost =
      (inputTokens / 1000) * 0.005 + // Input cost
      (outputTokens / 1000) * 0.015; // Output cost

    this.dailyCost += cost;
    this.monthlyCost += cost;

    if (this.dailyCost > DAILY_BUDGET) {
      this.sendAlert('Daily budget exceeded');
    }
  }
}
```

---

**Version**: 1.0.0  
**Last Updated**: November 26, 2025
