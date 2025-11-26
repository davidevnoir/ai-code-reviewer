/**
 * GitHub API Models
 * Type definitions for GitHub Pull Request and related data structures
 */

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  description: string;
  state: 'open' | 'closed' | 'merged';
  author: string;
  createdAt: string;
  updatedAt: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  repository: {
    owner: string;
    name: string;
    fullName: string;
  };
  files: GitHubFile[];
  commits: GitHubCommit[];
}

export interface GitHubFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  changes: number;
  patch: string;
  previousFilename?: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
}

export interface ModelRepositoryContext {
  codingStandards: string;
  architecturePatterns: string;
  testingGuidelines: string;
  examples?: string;
}

export interface ParsedPRUrl {
  owner: string;
  repo: string;
  prNumber: number;
}
