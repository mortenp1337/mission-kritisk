/**
 * Build metadata exported at build time
 * Available at /.meta/build-info.json (production) or /.meta/build-info.json (preview)
 */

export interface PRMetadata {
  /** Pull request number (e.g., 42) */
  number: number;

  /** Pull request title */
  title: string;

  /** PR head branch name (feature branch) */
  branch: string;

  /** PR base branch name (should be 'main') */
  base_branch: string;

  /** Link to pull request on GitHub */
  pr_url: string;
}

export interface BuildInfo {
  /** Schema version for future extensibility (e.g., "1.0.0") */
  schema_version: string;

  /** Semantic version from git tag (e.g., "1.4.2") */
  version: string;

  /** Full git commit SHA */
  commit_sha: string;

  /** Short git commit SHA (7 characters) */
  commit_short: string;

  /** ISO 8601 timestamp when build was completed */
  build_timestamp: string;

  /** Deployment type: "production" for main branch, "preview" for PR previews */
  deployment_type: 'production' | 'preview';

  /** PR metadata (only present for preview deployments) */
  pr_metadata?: PRMetadata;
}

// Global type declaration for window object
declare global {
  interface Window {
    __BUILD_INFO__?: BuildInfo;
  }
}

export {};
