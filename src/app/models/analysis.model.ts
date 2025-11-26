/**
 * Analysis Results Models
 * Type definitions for AI-generated analysis results
 */

export interface AnalysisResult {
  id: string;
  prUrl: string;
  timestamp: string;
  summary: string;
  suggestions: CodeSuggestion[];
  security: SecurityIssue[];
  performance: PerformanceIssue[];
  codeChanges: CodeChange[];
  schemaChanges: SchemaChange[];
  testScenarios: TestScenario[];
  testCases: TestCase[];
  recommendations: Recommendation[];
}

export interface CodeSuggestion {
  id: string;
  file: string;
  line: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'suggestion';
  category: 'style' | 'best-practice' | 'bug' | 'maintainability' | 'performance';
  suggestedCode?: string;
  reasoning?: string;
}

export interface SecurityIssue {
  id: string;
  file: string;
  line?: number;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  cwe?: string;
  owasp?: string;
}

export interface PerformanceIssue {
  id: string;
  file: string;
  line?: number;
  issue: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  estimatedImprovement?: string;
}

export interface CodeChange {
  file: string;
  type: 'feature' | 'bugfix' | 'refactor' | 'style' | 'test' | 'docs';
  description: string;
  impact: 'breaking' | 'major' | 'minor' | 'patch';
  linesChanged: number;
}

export interface SchemaChange {
  type: 'table' | 'column' | 'index' | 'constraint' | 'migration';
  action: 'add' | 'modify' | 'remove';
  entity: string;
  description: string;
  sqlScript?: string;
  rollbackScript?: string;
  breakingChange: boolean;
}

export interface TestScenario {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'functional' | 'integration' | 'e2e' | 'security' | 'performance';
  steps: string[];
  expectedResult: string;
  testData?: string;
  preconditions?: string[];
  postconditions?: string[];
}

export interface TestCase {
  id: string;
  scenario: string;
  title: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e';
  file: string;
  method?: string;
  assertions: string[];
  mockData?: string;
  coverageTarget?: string;
}

export interface Recommendation {
  id: string;
  category: 'architecture' | 'testing' | 'security' | 'performance' | 'maintainability';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface AnalysisError {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
}

export interface AnalysisStatus {
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  error?: AnalysisError;
}
