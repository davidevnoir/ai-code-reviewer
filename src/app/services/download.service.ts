import { Injectable } from '@angular/core';
import { AnalysisResult, TestScenario, TestCase, SchemaChange, CodeSuggestion } from '../models';

/**
 * Download Service
 * Handles file generation and downloads in various formats
 * - JSON
 * - CSV
 * - Markdown
 * - SQL
 * - Text
 */
@Injectable({ providedIn: 'root' })
export class DownloadService {
  /**
   * Download complete analysis as JSON
   */
  downloadJSON(data: AnalysisResult, filename: string = 'analysis-results.json'): void {
    const json = JSON.stringify(data, null, 2);
    this.downloadFile(json, filename, 'application/json');
  }

  /**
   * Download test scenarios as Markdown
   */
  downloadTestScenariosMarkdown(
    scenarios: TestScenario[],
    filename: string = 'test-scenarios.md'
  ): void {
    const markdown = this.generateTestScenariosMarkdown(scenarios);
    this.downloadFile(markdown, filename, 'text/markdown');
  }

  /**
   * Download test cases as CSV
   */
  downloadTestCasesCSV(testCases: TestCase[], filename: string = 'test-cases.csv'): void {
    const csv = this.generateTestCasesCSV(testCases);
    this.downloadFile(csv, filename, 'text/csv');
  }

  /**
   * Download schema changes as SQL
   */
  downloadSchemaChangesSQL(changes: SchemaChange[], filename: string = 'schema-changes.sql'): void {
    const sql = this.generateSchemaChangesSQL(changes);
    this.downloadFile(sql, filename, 'application/sql');
  }

  /**
   * Download suggestions as CSV
   */
  downloadSuggestionsCSV(
    suggestions: CodeSuggestion[],
    filename: string = 'code-suggestions.csv'
  ): void {
    const csv = this.generateSuggestionsCSV(suggestions);
    this.downloadFile(csv, filename, 'text/csv');
  }

  /**
   * Download full report as Markdown
   */
  downloadFullReportMarkdown(
    analysis: AnalysisResult,
    filename: string = 'pr-analysis-report.md'
  ): void {
    const markdown = this.generateFullReportMarkdown(analysis);
    this.downloadFile(markdown, filename, 'text/markdown');
  }

  /**
   * Download analysis summary as text
   */
  downloadSummaryText(analysis: AnalysisResult, filename: string = 'analysis-summary.txt'): void {
    const text = this.generateSummaryText(analysis);
    this.downloadFile(text, filename, 'text/plain');
  }

  /**
   * Generate test scenarios in Markdown format
   */
  private generateTestScenariosMarkdown(scenarios: TestScenario[]): string {
    let markdown = '# Test Scenarios\n\n';
    markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
    markdown += `Total Scenarios: ${scenarios.length}\n\n---\n\n`;

    scenarios.forEach((scenario, index) => {
      markdown += `## ${index + 1}. ${scenario.title}\n\n`;
      markdown += `**Priority:** ${scenario.priority}\n`;
      markdown += `**Category:** ${scenario.category}\n\n`;
      markdown += `**Description:**\n${scenario.description}\n\n`;

      if (scenario.preconditions && scenario.preconditions.length > 0) {
        markdown += `**Preconditions:**\n`;
        scenario.preconditions.forEach((pre) => {
          markdown += `- ${pre}\n`;
        });
        markdown += '\n';
      }

      markdown += `**Steps:**\n`;
      scenario.steps.forEach((step, i) => {
        markdown += `${i + 1}. ${step}\n`;
      });
      markdown += '\n';

      markdown += `**Expected Result:**\n${scenario.expectedResult}\n\n`;

      if (scenario.testData) {
        markdown += `**Test Data:**\n\`\`\`\n${scenario.testData}\n\`\`\`\n\n`;
      }

      markdown += '---\n\n';
    });

    return markdown;
  }

  /**
   * Generate test cases in CSV format
   */
  private generateTestCasesCSV(testCases: TestCase[]): string {
    const headers = ['ID', 'Title', 'Description', 'Type', 'File', 'Scenario', 'Assertions'];
    const rows = testCases.map((tc) => [
      tc.id,
      this.escapeCsv(tc.title),
      this.escapeCsv(tc.description),
      tc.type,
      tc.file,
      this.escapeCsv(tc.scenario),
      this.escapeCsv(tc.assertions.join('; ')),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  /**
   * Generate schema changes in SQL format
   */
  private generateSchemaChangesSQL(changes: SchemaChange[]): string {
    let sql = '-- Schema Changes\n';
    sql += `-- Generated: ${new Date().toLocaleString()}\n\n`;

    changes.forEach((change, index) => {
      sql += `-- Change ${index + 1}: ${change.type} - ${change.action}\n`;
      sql += `-- Entity: ${change.entity}\n`;
      sql += `-- Description: ${change.description}\n`;
      if (change.breakingChange) {
        sql += `-- ⚠️  WARNING: BREAKING CHANGE\n`;
      }
      sql += '\n';

      if (change.sqlScript) {
        sql += `${change.sqlScript}\n\n`;
      }

      if (change.rollbackScript) {
        sql += `-- Rollback:\n${change.rollbackScript}\n\n`;
      }

      sql += '-- ' + '-'.repeat(70) + '\n\n';
    });

    return sql;
  }

  /**
   * Generate suggestions in CSV format
   */
  private generateSuggestionsCSV(suggestions: CodeSuggestion[]): string {
    const headers = ['File', 'Line', 'Severity', 'Category', 'Message', 'Suggested Code'];
    const rows = suggestions.map((s) => [
      s.file,
      s.line.toString(),
      s.severity,
      s.category,
      this.escapeCsv(s.message),
      this.escapeCsv(s.suggestedCode || ''),
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  /**
   * Generate full analysis report in Markdown
   */
  private generateFullReportMarkdown(analysis: AnalysisResult): string {
    let md = '# PR Analysis Report\n\n';
    md += `**PR URL:** ${analysis.prUrl}\n`;
    md += `**Generated:** ${new Date(analysis.timestamp).toLocaleString()}\n`;
    md += `**Analysis ID:** ${analysis.id}\n\n`;
    md += '---\n\n';

    // Summary
    md += '## Summary\n\n';
    md += `${analysis.summary}\n\n`;

    // Statistics
    md += '## Statistics\n\n';
    md += `- **Suggestions:** ${analysis.suggestions.length}\n`;
    md += `- **Security Issues:** ${analysis.security.length}\n`;
    md += `- **Performance Issues:** ${analysis.performance.length}\n`;
    md += `- **Code Changes:** ${analysis.codeChanges.length}\n`;
    md += `- **Schema Changes:** ${analysis.schemaChanges.length}\n`;
    md += `- **Test Scenarios:** ${analysis.testScenarios.length}\n`;
    md += `- **Recommendations:** ${analysis.recommendations.length}\n\n`;

    // Security Issues
    if (analysis.security.length > 0) {
      md += '## 🔒 Security Issues\n\n';
      analysis.security.forEach((issue, i) => {
        md += `### ${i + 1}. ${issue.issue}\n\n`;
        md += `- **Severity:** ${issue.severity}\n`;
        md += `- **File:** ${issue.file}\n`;
        if (issue.line) md += `- **Line:** ${issue.line}\n`;
        md += `- **Recommendation:** ${issue.recommendation}\n\n`;
      });
    }

    // Code Suggestions
    if (analysis.suggestions.length > 0) {
      md += '## 💡 Code Suggestions\n\n';
      analysis.suggestions.slice(0, 10).forEach((suggestion, i) => {
        md += `### ${i + 1}. ${suggestion.file} (line ${suggestion.line})\n\n`;
        md += `- **Severity:** ${suggestion.severity}\n`;
        md += `- **Category:** ${suggestion.category}\n`;
        md += `- **Message:** ${suggestion.message}\n\n`;
        if (suggestion.suggestedCode) {
          md += `**Suggested Code:**\n\`\`\`\n${suggestion.suggestedCode}\n\`\`\`\n\n`;
        }
      });
      if (analysis.suggestions.length > 10) {
        md += `*... and ${analysis.suggestions.length - 10} more suggestions*\n\n`;
      }
    }

    // Recommendations
    if (analysis.recommendations.length > 0) {
      md += '## 📋 Recommendations\n\n';
      analysis.recommendations.forEach((rec, i) => {
        md += `### ${i + 1}. ${rec.title}\n\n`;
        md += `- **Priority:** ${rec.priority}\n`;
        md += `- **Category:** ${rec.category}\n`;
        md += `- **Description:** ${rec.description}\n\n`;
      });
    }

    // Test Scenarios
    if (analysis.testScenarios.length > 0) {
      md += '## 🧪 Test Scenarios\n\n';
      analysis.testScenarios.slice(0, 5).forEach((scenario, i) => {
        md += `### ${i + 1}. ${scenario.title}\n\n`;
        md += `- **Priority:** ${scenario.priority}\n`;
        md += `- **Category:** ${scenario.category}\n`;
        md += `- **Expected:** ${scenario.expectedResult}\n\n`;
      });
      if (analysis.testScenarios.length > 5) {
        md += `*... and ${analysis.testScenarios.length - 5} more test scenarios*\n\n`;
      }
    }

    return md;
  }

  /**
   * Generate summary text
   */
  private generateSummaryText(analysis: AnalysisResult): string {
    let text = 'PR ANALYSIS SUMMARY\n';
    text += '='.repeat(50) + '\n\n';
    text += `PR URL: ${analysis.prUrl}\n`;
    text += `Generated: ${new Date(analysis.timestamp).toLocaleString()}\n\n`;
    text += `${analysis.summary}\n\n`;
    text += 'STATISTICS\n';
    text += '-'.repeat(50) + '\n';
    text += `Suggestions: ${analysis.suggestions.length}\n`;
    text += `Security Issues: ${analysis.security.length}\n`;
    text += `Performance Issues: ${analysis.performance.length}\n`;
    text += `Test Scenarios: ${analysis.testScenarios.length}\n`;
    text += `Recommendations: ${analysis.recommendations.length}\n`;

    return text;
  }

  /**
   * Escape CSV fields
   */
  private escapeCsv(value: string): string {
    if (!value) return '';
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Generic file download helper
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
