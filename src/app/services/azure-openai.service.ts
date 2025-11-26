import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import {
  AIConfig,
  AIRequest,
  AIResponse,
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIMessage,
  TokenEstimate,
  AIError,
} from '../models';

/**
 * Azure OpenAI Service
 * Handles all AI-powered analysis using Azure OpenAI
 */
@Injectable({ providedIn: 'root' })
export class AzureOpenAIService {
  private readonly http = inject(HttpClient);

  private config: AIConfig = {
    apiKey: '',
    endpoint: '',
    deployment: '',
    apiVersion: '2024-10-21',
    model: 'gpt-4o',
    temperature: 0.3,
    maxTokens: 2000,
    topP: 0.9,
  };

  /**
   * Set and validate configuration
   */
  setConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };

    // Clean up endpoint URL
    if (this.config.endpoint) {
      this.config.endpoint = this.normalizeEndpoint(this.config.endpoint);
    }
  }

  /**
   * Normalize endpoint URL to correct format
   */
  private normalizeEndpoint(endpoint: string): string {
    // Remove any trailing slashes
    endpoint = endpoint.trim().replace(/\/+$/, '');

    // Remove any API paths that might have been accidentally included
    endpoint = endpoint.replace(/\/openai.*$/i, '').replace(/\/responses.*$/i, '');

    // Ensure it's just the base URL
    if (!endpoint.match(/^https?:\/\/[^/]+$/)) {
      console.warn('⚠️ Endpoint URL looks malformed:', endpoint);
      console.warn('Expected format: https://your-resource.openai.azure.com');
    }

    return endpoint;
  }

  /**
   * Validate configuration before making API calls
   */
  private validateConfig(): { valid: boolean; error?: string } {
    if (!this.config.apiKey) {
      return {
        valid: false,
        error: '❌ API Key is missing!\n\nGo to Settings and enter your Azure OpenAI API key.',
      };
    }

    if (!this.config.endpoint) {
      return {
        valid: false,
        error:
          '❌ Endpoint URL is missing!\n\nGo to Settings and enter your Azure OpenAI endpoint.',
      };
    }

    if (!this.config.deployment) {
      return {
        valid: false,
        error:
          '❌ Deployment name is missing!\n\nGo to Settings and enter your deployment name.\n\nSee AZURE-SETUP-GUIDE.md for help.',
      };
    }

    // Validate endpoint format
    const endpointPattern = /^https:\/\/[a-zA-Z0-9-]+\.openai\.azure\.com$/;
    if (!endpointPattern.test(this.config.endpoint)) {
      return {
        valid: false,
        error: `❌ Invalid endpoint format!\n\nYour endpoint: ${this.config.endpoint}\n\nExpected format: https://your-resource-name.openai.azure.com\n\nFix in Settings:
1. Remove any paths like /openai or /responses
2. Should end with .openai.azure.com
3. No trailing slashes`,
      };
    }

    return { valid: true };
  }

  /**
   * Analyze pull request with AI
   */
  analyzePR(request: AIAnalysisRequest): Observable<AIAnalysisResponse> {
    // Validate config first
    const validation = this.validateConfig();
    if (!validation.valid) {
      return throwError(() => ({
        code: 'INVALID_CONFIG',
        message: validation.error,
      }));
    }

    const prompt = this.buildAnalysisPrompt(request);
    const aiRequest = this.createAIRequest(prompt);

    return this.callAI(aiRequest).pipe(
      map((response) => this.parseAnalysisResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Generate test scenarios from code changes
   */
  generateTests(diff: string, context: string): Observable<any> {
    const validation = this.validateConfig();
    if (!validation.valid) {
      return throwError(() => ({
        code: 'INVALID_CONFIG',
        message: validation.error,
      }));
    }

    const prompt = this.buildTestGenerationPrompt(diff, context);
    const aiRequest = this.createAIRequest(prompt);

    return this.callAI(aiRequest).pipe(
      map((response) => this.parseTestResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Estimate token count for text
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate cost estimate
   */
  calculateCost(inputTokens: number, outputTokens: number): TokenEstimate {
    const inputCost = (inputTokens / 1000) * 0.005;
    const outputCost = (outputTokens / 1000) * 0.015;
    const totalCost = inputCost + outputCost;

    return {
      input: inputTokens,
      output: outputTokens,
      total: inputTokens + outputTokens,
      cost: totalCost,
    };
  }

  /**
   * Build comprehensive analysis prompt
   */
  private buildAnalysisPrompt(request: AIAnalysisRequest): AIMessage[] {
    const systemPrompt = this.createSystemPrompt(request.context);
    const userPrompt = this.createUserPrompt(request);

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];
  }

  /**
   * Create system prompt with context
   */
  private createSystemPrompt(context: AIAnalysisRequest['context']): string {
    return `
You are an expert code reviewer with deep knowledge of software engineering best practices.

${context.codingStandards ? `CODING STANDARDS:\n${context.codingStandards}\n\n` : ''}
${context.architecturePatterns ? `ARCHITECTURE PATTERNS:\n${context.architecturePatterns}\n\n` : ''}
${context.testingGuidelines ? `TESTING GUIDELINES:\n${context.testingGuidelines}\n\n` : ''}

YOUR TASK:
Review the provided code changes and provide:
1. Code quality suggestions with specific line numbers
2. Best practice recommendations
3. Potential bugs or issues
4. Security vulnerabilities
5. Performance improvements
6. Test scenario recommendations

FORMAT:
Respond in JSON format with this exact structure:
{
  "suggestions": [
    {
      "file": "path/to/file.ts",
      "line": 42,
      "message": "Detailed suggestion",
      "severity": "error|warning|info|suggestion",
      "category": "style|best-practice|bug|maintainability|performance",
      "suggestedCode": "optional corrected code"
    }
  ],
  "security": [
    {
      "file": "path/to/file.ts",
      "issue": "Security issue description",
      "severity": "critical|high|medium|low",
      "recommendation": "How to fix it"
    }
  ],
  "performance": [
    {
      "file": "path/to/file.ts",
      "issue": "Performance issue description",
      "impact": "high|medium|low",
      "recommendation": "How to optimize"
    }
  ],
  "recommendations": [
    {
      "category": "architecture|testing|security|performance|maintainability",
      "priority": "high|medium|low",
      "title": "Short title",
      "description": "Detailed description"
    }
  ],
  "tests": [
    {
      "title": "Test scenario title",
      "description": "What to test",
      "priority": "critical|high|medium|low",
      "category": "functional|integration|e2e|security|performance",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "expected": "Expected result"
    }
  ]
}

Be specific, actionable, and reference the team's standards when applicable.
`.trim();
  }

  /**
   * Create user prompt with PR details
   */
  private createUserPrompt(request: AIAnalysisRequest): string {
    const { prMetadata, diff } = request;

    return `
PULL REQUEST DETAILS:
- Title: ${prMetadata.title}
- Description: ${prMetadata.description}
- Files Changed: ${prMetadata.files}
- Lines Added: ${prMetadata.additions}
- Lines Deleted: ${prMetadata.deletions}

CODE CHANGES:
${this.ensureWithinLimit(diff, 6000)}

Please analyze these changes according to the team standards and provide detailed feedback.
Focus on:
- Adherence to coding standards
- Architecture alignment
- Testability
- Security implications
- Performance impact
`.trim();
  }

  /**
   * Build test generation prompt
   */
  private buildTestGenerationPrompt(diff: string, context: string): AIMessage[] {
    const systemPrompt = `
You are a QA expert specializing in test case generation.

Generate comprehensive test scenarios for the code changes provided.

Format your response as JSON:
{
  "scenarios": [
    {
      "title": "Test scenario title",
      "description": "What this test validates",
      "priority": "critical|high|medium|low",
      "category": "functional|integration|e2e|security|performance",
      "steps": ["Step 1", "Step 2"],
      "expected": "Expected outcome",
      "testData": "Sample test data if needed"
    }
  ]
}

Include happy path, error cases, edge cases, and security tests.
`.trim();

    const userPrompt = `
CODE CHANGES:
${this.ensureWithinLimit(diff, 6000)}

${context ? `TESTING GUIDELINES:\n${context}\n\n` : ''}

Generate test scenarios covering all aspects of these changes.
`.trim();

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];
  }

  /**
   * Create AI request object with correct Azure OpenAI parameter names
   */
  private createAIRequest(messages: AIMessage[]): any {
    // Azure OpenAI uses snake_case parameter names
    return {
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens, // Changed from maxTokens
      top_p: this.config.topP, // Changed from topP
      frequency_penalty: 0, // Changed from frequencyPenalty
      presence_penalty: 0, // Changed from presencePenalty
      response_format: { type: 'json_object' }, // Changed from responseFormat
    };
  }

  /**
   * Call Azure OpenAI API
   */
  private callAI(request: any): Observable<AIResponse> {
    const url = `${this.config.endpoint}/openai/deployments/${this.config.deployment}/chat/completions?api-version=${this.config.apiVersion}`;

    console.log('🔵 Calling Azure OpenAI:', {
      endpoint: this.config.endpoint,
      deployment: this.config.deployment,
      apiVersion: this.config.apiVersion,
      url: url,
    });

    const headers = new HttpHeaders({
      'api-key': this.config.apiKey,
      'Content-Type': 'application/json',
    });

    return this.http.post<AIResponse>(url, request, { headers });
  }

  /**
   * Parse AI response into analysis result
   */
  private parseAnalysisResponse(response: AIResponse): AIAnalysisResponse {
    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from AI');
    }

    try {
      const parsed = JSON.parse(content);
      return {
        suggestions: parsed.suggestions || [],
        security: parsed.security || [],
        performance: parsed.performance || [],
        recommendations: parsed.recommendations || [],
        tests: parsed.tests || [],
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Invalid JSON response from AI');
    }
  }

  /**
   * Parse test generation response
   */
  private parseTestResponse(response: AIResponse): any {
    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from AI');
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse test response:', error);
      throw new Error('Invalid JSON response from AI');
    }
  }

  /**
   * Ensure text is within token limit
   */
  private ensureWithinLimit(text: string, maxTokens: number): string {
    const estimated = this.estimateTokens(text);

    if (estimated <= maxTokens) {
      return text;
    }

    const maxChars = maxTokens * 4;
    return text.substring(0, maxChars) + '\n... (truncated due to length)';
  }

  /**
   * Error handling
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An error occurred while calling Azure OpenAI';
    let errorCode = 'AI_ERROR';

    const azureErrorCode = error.error?.error?.code;
    const azureErrorMessage = error.error?.error?.message;

    if (azureErrorCode === 'DeploymentNotFound' || error.status === 404) {
      errorMessage = `❌ Deployment "${this.config.deployment}" not found!

This usually means:
1. ❌ The deployment name is wrong or misspelled
2. ❌ You haven't created a deployment yet
3. ❌ Wrong Azure resource (check your endpoint)

YOUR CURRENT SETTINGS:
• Endpoint: ${this.config.endpoint}
• Deployment: ${this.config.deployment}
• API Version: ${this.config.apiVersion}

TO FIX:
1. Go to https://ai.azure.com or https://oai.azure.com/portal
2. Find your Azure OpenAI resource
3. Click "Deployments" in left menu
4. Check the exact deployment name listed there
5. Copy it EXACTLY (case-sensitive!)
6. Paste into Settings

If you see no deployments:
1. Click "+ Create deployment"
2. Choose model: gpt-4o
3. Give it a name (e.g., "my-gpt4o")
4. Wait 60 seconds
5. Copy the name to Settings

See AZURE-SETUP-GUIDE.md for detailed instructions.`;
      errorCode = 'DEPLOYMENT_NOT_FOUND';
    } else if (error.status === 401) {
      errorMessage = `❌ Invalid API Key!

Your Azure OpenAI API key is incorrect or expired.

TO FIX:
1. Go to https://portal.azure.com or https://ai.azure.com
2. Find your Azure OpenAI resource
3. Click "Keys and Endpoint"
4. Copy "KEY 1"
5. Paste it in Settings (replace the old key)`;
      errorCode = 'UNAUTHORIZED';
    } else if (error.status === 429) {
      errorMessage = `⏱️ Rate Limit Exceeded

You've made too many requests. Wait a moment and try again.

Azure OpenAI has rate limits based on your pricing tier.`;
      errorCode = 'RATE_LIMIT';
    } else if (error.status === 400) {
      errorMessage = `❌ Bad Request

There's an issue with your configuration:

${azureErrorMessage || 'Unknown error'}

Check your settings:
• API Version: ${this.config.apiVersion}
• Deployment: ${this.config.deployment}
• Endpoint: ${this.config.endpoint}

Try:
1. Change API Version to 2024-10-21 in Settings
2. Verify deployment exists in Azure
3. Check endpoint format (should be https://NAME.openai.azure.com)`;
      errorCode = 'BAD_REQUEST';
    } else if (azureErrorMessage) {
      errorMessage = `Azure OpenAI Error: ${azureErrorMessage}

Code: ${azureErrorCode || 'Unknown'}
Status: ${error.status || 'Unknown'}

Check AZURE-SETUP-GUIDE.md for troubleshooting.`;
      errorCode = azureErrorCode || 'AZURE_ERROR';
    }

    const aiError: AIError = {
      code: errorCode,
      message: errorMessage,
      statusCode: error.status,
      retryAfter: error.headers?.get('Retry-After'),
    };

    console.error('❌ Azure OpenAI Error:', {
      code: errorCode,
      status: error.status,
      azureErrorCode,
      message: errorMessage,
      config: {
        endpoint: this.config.endpoint,
        deployment: this.config.deployment,
        apiVersion: this.config.apiVersion,
      },
      fullError: error,
    });

    return throwError(() => aiError);
  };
}
