import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import {
  GitHubPullRequest,
  GitHubFile,
  GitHubCommit,
  ModelRepositoryContext,
  ParsedPRUrl,
} from '../models';

/**
 * GitHub Service
 * Handles all interactions with GitHub API
 * - Fetch PR metadata and diffs
 * - Load model repository context
 * - Parse PR URLs
 */
@Injectable({ providedIn: 'root' })
export class GitHubService {
  private readonly http = inject(HttpClient);

  // GitHub API configuration
  private readonly GITHUB_API_BASE = 'https://api.github.com';
  private readonly API_VERSION = '2022-11-28';

  /**
   * Parse GitHub PR URL to extract owner, repo, and PR number
   * @example https://github.com/owner/repo/pull/123
   */
  parsePRUrl(url: string): ParsedPRUrl | null {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
    const match = url.match(regex);

    if (!match) {
      return null;
    }

    return {
      owner: match[1],
      repo: match[2],
      prNumber: parseInt(match[3], 10),
    };
  }

  /**
   * Validate GitHub PR URL format
   */
  isValidPRUrl(url: string): boolean {
    return this.parsePRUrl(url) !== null;
  }

  /**
   * Fetch pull request metadata and files
   */
  fetchPullRequest(prUrl: string, token: string): Observable<GitHubPullRequest> {
    const parsed = this.parsePRUrl(prUrl);
    if (!parsed) {
      return throwError(() => new Error('Invalid GitHub PR URL'));
    }

    const headers = this.createHeaders(token);
    const { owner, repo, prNumber } = parsed;

    return this.http
      .get<any>(`${this.GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`, {
        headers,
      })
      .pipe(
        map((response) => this.mapPRResponse(response, owner, repo)),
        catchError(this.handleError)
      );
  }

  /**
   * Fetch PR file diffs
   */
  fetchPRFiles(
    owner: string,
    repo: string,
    prNumber: number,
    token: string
  ): Observable<GitHubFile[]> {
    const headers = this.createHeaders(token);

    return this.http
      .get<any[]>(`${this.GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}/files`, {
        headers,
      })
      .pipe(
        map((files) => files.map(this.mapFileResponse)),
        catchError(this.handleError)
      );
  }

  /**
   * Fetch PR commits
   */
  fetchPRCommits(
    owner: string,
    repo: string,
    prNumber: number,
    token: string
  ): Observable<GitHubCommit[]> {
    const headers = this.createHeaders(token);

    return this.http
      .get<any[]>(`${this.GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}/commits`, {
        headers,
      })
      .pipe(
        map((commits) => commits.map(this.mapCommitResponse)),
        catchError(this.handleError)
      );
  }

  /**
   * Load model repository context files
   * Fetches coding standards, architecture patterns, and testing guidelines
   */
  loadModelRepoContext(modelRepoUrl: string, token: string): Observable<ModelRepositoryContext> {
    const parsed = this.parsePRUrl(modelRepoUrl.replace('/pull/', '/repo/'));
    if (!parsed) {
      return throwError(() => new Error('Invalid model repository URL'));
    }

    const headers = this.createHeaders(token);
    const { owner, repo } = parsed;

    // Fetch context files in parallel
    return this.http
      .get<ModelRepositoryContext>(`${this.GITHUB_API_BASE}/repos/${owner}/${repo}/contents`, {
        headers,
      })
      .pipe(
        map(() => {
          // Placeholder - actual implementation would fetch specific files
          return {
            codingStandards: '',
            architecturePatterns: '',
            testingGuidelines: '',
          };
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Fetch file content from repository
   */
  fetchFileContent(owner: string, repo: string, path: string, token: string): Observable<string> {
    const headers = this.createHeaders(token);

    return this.http
      .get<any>(`${this.GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
        headers,
      })
      .pipe(
        map((response) => {
          // Decode base64 content
          return atob(response.content);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get combined diff for PR
   */
  getPRDiff(owner: string, repo: string, prNumber: number, token: string): Observable<string> {
    const headers = this.createHeaders(token);
    headers.set('Accept', 'application/vnd.github.v3.diff');

    return this.http
      .get(`${this.GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`, {
        headers,
        responseType: 'text',
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Create HTTP headers with authentication
   */
  private createHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': this.API_VERSION,
    });
  }

  /**
   * Map GitHub API PR response to internal model
   */
  private mapPRResponse(response: any, owner: string, repo: string): GitHubPullRequest {
    return {
      id: response.id,
      number: response.number,
      title: response.title,
      description: response.body || '',
      state: response.state,
      author: response.user.login,
      createdAt: response.created_at,
      updatedAt: response.updated_at,
      filesChanged: response.changed_files,
      additions: response.additions,
      deletions: response.deletions,
      repository: {
        owner,
        name: repo,
        fullName: `${owner}/${repo}`,
      },
      files: [],
      commits: [],
    };
  }

  /**
   * Map GitHub API file response to internal model
   */
  private mapFileResponse(file: any): GitHubFile {
    return {
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      changes: file.changes,
      patch: file.patch || '',
      previousFilename: file.previous_filename,
    };
  }

  /**
   * Map GitHub API commit response to internal model
   */
  private mapCommitResponse(commit: any): GitHubCommit {
    return {
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
    };
  }

  /**
   * Error handling
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred while fetching from GitHub';

    if (error.status === 401) {
      errorMessage = 'Invalid GitHub token or unauthorized access';
    } else if (error.status === 403) {
      errorMessage = 'GitHub API rate limit exceeded or access forbidden';
    } else if (error.status === 404) {
      errorMessage = 'Pull request not found';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => ({
      code: 'GITHUB_API_ERROR',
      message: errorMessage,
      statusCode: error.status,
      details: error.error,
    }));
  }
}
