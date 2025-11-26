import { Injectable, inject, signal } from '@angular/core';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { GitHubService } from './github.service';
import { AzureOpenAIService } from './azure-openai.service';
import {
  AnalysisResult,
  AnalysisStatus,
  CodeSuggestion,
  SecurityIssue,
  PerformanceIssue,
  TestScenario,
  TestCase,
  Recommendation,
  CodeChange,
  SchemaChange,
  GitHubPullRequest,
  AIAnalysisRequest,
  AIAnalysisResponse,
} from '../models';

/**
 * Analysis Service
 * Orchestrates the complete PR analysis pipeline
 * - Fetches PR data from GitHub
 * - Loads model repository context
 * - Performs AI analysis
 * - Generates test scenarios
 * - Formats results
 */
@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private readonly githubService = inject(GitHubService);
  private readonly aiService = inject(AzureOpenAIService);

  // Analysis state
  readonly status = signal<AnalysisStatus>({
    status: 'pending',
    progress: 0,
  });

  // Configuration
  private githubToken = '';
  private modelRepoUrl = '';

  /**
   * Set GitHub token for API access
   */
  setGitHubToken(token: string): void {
    this.githubToken = token;
  }

  /**
   * Set model repository URL for context loading
   */
  setModelRepoUrl(url: string): void {
    this.modelRepoUrl = url;
  }

  /**
   * Analyze a pull request
   * Main entry point for analysis pipeline
   */
  analyzePullRequest(prUrl: string): Observable<AnalysisResult> {
    // Validate inputs
    if (!this.githubToken) {
      return throwError(() => ({
        code: 'MISSING_TOKEN',
        message: 'GitHub token is required',
      }));
    }

    if (!this.githubService.isValidPRUrl(prUrl)) {
      return throwError(() => ({
        code: 'INVALID_URL',
        message: 'Invalid GitHub PR URL',
      }));
    }

    // Reset status
    this.updateStatus('analyzing', 0, 'Fetching PR data...');

    // Pipeline: Fetch PR -> Load Context -> AI Analysis -> Generate Tests -> Format Results
    return this.fetchPRData(prUrl).pipe(
      switchMap((prData) => this.loadContext().pipe(map((context) => ({ prData, context })))),
      switchMap(({ prData, context }) =>
        this.performAIAnalysis(prData, context).pipe(
          map((aiResult) => ({ prData, context, aiResult }))
        )
      ),
      switchMap(({ prData, context, aiResult }) =>
        this.generateTestCases(prData, aiResult).pipe(map((tests) => ({ prData, aiResult, tests })))
      ),
      map(({ prData, aiResult, tests }) => this.formatAnalysisResult(prData, aiResult, tests)),
      catchError((error) => {
        this.updateStatus('failed', 0, undefined, {
          code: error.code || 'ANALYSIS_ERROR',
          message: error.message || 'Analysis failed',
          timestamp: new Date().toISOString(),
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Step 1: Fetch PR data from GitHub
   */
  private fetchPRData(prUrl: string): Observable<GitHubPullRequest> {
    this.updateStatus('analyzing', 10, 'Fetching PR data...');

    const parsed = this.githubService.parsePRUrl(prUrl);
    if (!parsed) {
      return throwError(() => new Error('Invalid PR URL'));
    }

    // Fetch PR metadata and files
    return forkJoin({
      pr: this.githubService.fetchPullRequest(prUrl, this.githubToken),
      files: this.githubService.fetchPRFiles(
        parsed.owner,
        parsed.repo,
        parsed.prNumber,
        this.githubToken
      ),
      commits: this.githubService.fetchPRCommits(
        parsed.owner,
        parsed.repo,
        parsed.prNumber,
        this.githubToken
      ),
    }).pipe(
      map(({ pr, files, commits }) => ({
        ...pr,
        files,
        commits,
      }))
    );
  }

  /**
   * Step 2: Load model repository context
   */
  private loadContext(): Observable<any> {
    this.updateStatus('analyzing', 30, 'Loading coding standards...');

    // If no model repo URL provided, use empty context
    if (!this.modelRepoUrl) {
      return of({
        codingStandards: '',
        architecturePatterns: '',
        testingGuidelines: '',
      });
    }

    return this.githubService.loadModelRepoContext(this.modelRepoUrl, this.githubToken);
  }

  /**
   * Step 3: Perform AI analysis
   */
  private performAIAnalysis(
    prData: GitHubPullRequest,
    context: any
  ): Observable<AIAnalysisResponse> {
    this.updateStatus('analyzing', 50, 'Analyzing code with AI...');

    // Build diff string from files
    const diff = prData.files.map((file) => `File: ${file.filename}\n${file.patch}`).join('\n\n');

    const request: AIAnalysisRequest = {
      diff,
      prMetadata: {
        title: prData.title,
        description: prData.description,
        files: prData.filesChanged,
        additions: prData.additions,
        deletions: prData.deletions,
      },
      context: {
        codingStandards: context.codingStandards,
        architecturePatterns: context.architecturePatterns,
        testingGuidelines: context.testingGuidelines,
      },
    };

    return this.aiService.analyzePR(request);
  }

  /**
   * Step 4: Generate test cases
   */
  private generateTestCases(
    prData: GitHubPullRequest,
    aiResult: AIAnalysisResponse
  ): Observable<any> {
    this.updateStatus('analyzing', 75, 'Generating test cases...');

    // Use AI to generate additional test cases from scenarios
    const diff = prData.files.map((file) => `File: ${file.filename}\n${file.patch}`).join('\n\n');

    return this.aiService.generateTests(diff, 'Generate comprehensive test cases').pipe(
      catchError(() => {
        // If test generation fails, return empty array
        console.warn('Test generation failed, continuing without tests');
        return of({ scenarios: [] });
      })
    );
  }

  /**
   * Step 5: Format final analysis result
   */
  private formatAnalysisResult(
    prData: GitHubPullRequest,
    aiResult: AIAnalysisResponse,
    testData: any
  ): AnalysisResult {
    this.updateStatus('completed', 100, 'Analysis complete');

    const result: AnalysisResult = {
      id: this.generateId(),
      prUrl: `https://github.com/${prData.repository.fullName}/pull/${prData.number}`,
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(prData, aiResult),
      suggestions: this.mapSuggestions(aiResult.suggestions),
      security: this.mapSecurityIssues(aiResult.security),
      performance: this.mapPerformanceIssues(aiResult.performance),
      codeChanges: this.mapCodeChanges(prData),
      schemaChanges: this.detectSchemaChanges(prData),
      testScenarios: this.mapTestScenarios(aiResult.tests),
      testCases: this.mapTestCases(testData.scenarios || []),
      recommendations: this.mapRecommendations(aiResult.recommendations),
    };

    return result;
  }

  /**
   * Map AI suggestions to internal model
   */
  private mapSuggestions(suggestions: any[]): CodeSuggestion[] {
    return suggestions.map((s, index) => ({
      id: `suggestion-${index}`,
      file: s.file,
      line: s.line,
      column: s.column,
      message: s.message,
      severity: s.severity || 'info',
      category: s.category || 'best-practice',
      suggestedCode: s.suggestedCode,
      reasoning: s.reasoning,
    }));
  }

  /**
   * Map security issues
   */
  private mapSecurityIssues(issues: any[]): SecurityIssue[] {
    return issues.map((issue, index) => ({
      id: `security-${index}`,
      file: issue.file,
      line: issue.line,
      issue: issue.issue,
      severity: issue.severity || 'medium',
      recommendation: issue.recommendation,
      cwe: issue.cwe,
      owasp: issue.owasp,
    }));
  }

  /**
   * Map performance issues
   */
  private mapPerformanceIssues(issues: any[]): PerformanceIssue[] {
    return issues.map((issue, index) => ({
      id: `performance-${index}`,
      file: issue.file,
      line: issue.line,
      issue: issue.issue,
      impact: issue.impact || 'medium',
      recommendation: issue.recommendation,
      estimatedImprovement: issue.estimatedImprovement,
    }));
  }

  /**
   * Map code changes
   */
  private mapCodeChanges(prData: GitHubPullRequest): CodeChange[] {
    return prData.files.map((file) => ({
      file: file.filename,
      type: this.detectChangeType(file.filename),
      description: `${file.status} ${file.filename}`,
      impact: this.calculateImpact(file),
      linesChanged: file.changes,
    }));
  }

  /**
   * Detect schema changes
   */
  private detectSchemaChanges(prData: GitHubPullRequest): SchemaChange[] {
    const schemaChanges: SchemaChange[] = [];

    prData.files.forEach((file) => {
      if (
        file.filename.includes('migration') ||
        file.filename.includes('schema') ||
        file.filename.endsWith('.sql')
      ) {
        schemaChanges.push({
          type: 'migration',
          action: file.status === 'added' ? 'add' : 'modify',
          entity: file.filename,
          description: `Database change in ${file.filename}`,
          sqlScript: file.patch,
          breakingChange: file.patch.toLowerCase().includes('drop'),
        });
      }
    });

    return schemaChanges;
  }

  /**
   * Map test scenarios
   */
  private mapTestScenarios(tests: any[]): TestScenario[] {
    return tests.map((test, index) => ({
      id: `scenario-${index}`,
      title: test.title,
      description: test.description,
      priority: test.priority || 'medium',
      category: test.category || 'functional',
      steps: test.steps || [],
      expectedResult: test.expected || '',
      testData: test.testData,
      preconditions: test.preconditions,
      postconditions: test.postconditions,
    }));
  }

  /**
   * Map test cases
   */
  private mapTestCases(scenarios: any[]): TestCase[] {
    return scenarios.map((scenario, index) => ({
      id: `test-${index}`,
      scenario: scenario.title,
      title: scenario.title,
      description: scenario.description,
      type: 'integration',
      file: 'test/integration/',
      assertions: [scenario.expected],
    }));
  }

  /**
   * Map recommendations
   */
  private mapRecommendations(recommendations: any[]): Recommendation[] {
    return recommendations.map((rec, index) => ({
      id: `rec-${index}`,
      category: rec.category || 'maintainability',
      priority: rec.priority || 'medium',
      title: rec.title,
      description: rec.description,
      reasoning: rec.reasoning || '',
      effort: 'medium',
      impact: 'medium',
    }));
  }

  /**
   * Generate summary
   */
  private generateSummary(prData: GitHubPullRequest, aiResult: AIAnalysisResponse): string {
    const criticalIssues = aiResult.security.filter((s: any) => s.severity === 'critical').length;
    const suggestions = aiResult.suggestions.length;

    return `PR #${prData.number}: ${prData.title}. Found ${suggestions} suggestions${
      criticalIssues > 0 ? ` and ${criticalIssues} critical security issues` : ''
    }.`;
  }

  /**
   * Detect change type from filename
   */
  private detectChangeType(filename: string): CodeChange['type'] {
    if (filename.includes('test')) return 'test';
    if (filename.endsWith('.md')) return 'docs';
    if (filename.endsWith('.css') || filename.endsWith('.scss')) return 'style';
    return 'feature';
  }

  /**
   * Calculate impact
   */
  private calculateImpact(file: any): CodeChange['impact'] {
    if (file.changes > 500) return 'major';
    if (file.changes > 100) return 'minor';
    return 'patch';
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update analysis status
   */
  private updateStatus(
    status: AnalysisStatus['status'],
    progress: number,
    currentStep?: string,
    error?: any
  ): void {
    this.status.set({
      status,
      progress,
      currentStep,
      error,
    });
  }
}
