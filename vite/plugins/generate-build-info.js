/**
 * Vite Plugin: Generate Build Metadata
 *
 * This plugin generates a build-info.json file containing version, commit SHA,
 * timestamp, deployment type, and optional PR metadata. It runs during the build
 * process and outputs the metadata file to dist/.meta/build-info.json
 *
 * Environment variables (passed from GitHub Actions workflows):
 * - VITE_APP_VERSION: Semantic version from git tag (e.g., "1.4.2")
 * - VITE_COMMIT_SHA: Full git commit SHA
 * - VITE_PR_NUMBER: PR number (for preview deployments only)
 * - VITE_PR_TITLE: PR title (for preview deployments only)
 * - VITE_PR_HEAD_BRANCH: PR head branch name (for preview deployments only)
 * - VITE_PR_BASE_BRANCH: PR base branch name (for preview deployments only)
 * - VITE_PR_URL: PR URL (for preview deployments only)
 *
 * @example
 * // In vite/config.prod.mjs:
 * import { generateBuildInfoPlugin } from './plugins/generate-build-info.js';
 * export default defineConfig({
 *   plugins: [generateBuildInfoPlugin()],
 * });
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Extract git tag version using `git describe --tags --abbrev=0`
 * Falls back to package.json version if no tags exist
 */
async function getVersionFromGit() {
  try {
    const { stdout } = await execAsync('git describe --tags --abbrev=0');
    const tag = stdout.trim();
    // Remove 'v' prefix if present (e.g., 'v1.4.2' -> '1.4.2')
    return tag.replace(/^v/, '');
  } catch (error) {
    console.warn(
      '[build-info] No git tags found, falling back to package.json version'
    );
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
      );
      return packageJson.version || '0.0.0';
    } catch {
      return '0.0.0';
    }
  }
}

/**
 * Extract git commit SHA (full and short)
 */
async function getCommitSha() {
  try {
    const { stdout: fullSha } = await execAsync('git rev-parse HEAD');
    const { stdout: shortSha } = await execAsync(
      'git rev-parse --short HEAD'
    );
    return {
      full: fullSha.trim(),
      short: shortSha.trim(),
    };
  } catch (error) {
    console.warn('[build-info] Unable to retrieve git commit SHA');
    return {
      full: 'unknown',
      short: 'unknown',
    };
  }
}

/**
 * Generate ISO 8601 timestamp
 */
function getBuildTimestamp() {
  return new Date().toISOString();
}

/**
 * Extract PR metadata from environment variables
 */
function getPRMetadata() {
  const prNumber = process.env.VITE_PR_NUMBER;

  // Only include PR metadata if PR number is present
  if (!prNumber) {
    return null;
  }

  return {
    number: parseInt(prNumber, 10),
    title: process.env.VITE_PR_TITLE || 'Unknown PR',
    branch: process.env.VITE_PR_HEAD_BRANCH || 'unknown',
    base_branch: process.env.VITE_PR_BASE_BRANCH || 'main',
    pr_url: process.env.VITE_PR_URL || `#`,
  };
}

/**
 * Determine deployment type based on presence of PR metadata
 */
function getDeploymentType(prMetadata) {
  return prMetadata ? 'preview' : 'production';
}

/**
 * Vite plugin factory
 */
export function generateBuildInfoPlugin() {
  let config;

  return {
    name: 'generate-build-info',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    async closeBundle() {
      try {
        console.log('[build-info] Generating build metadata...');

        // Gather all metadata
        const version =
          process.env.VITE_APP_VERSION || (await getVersionFromGit());
        const { full: commitSha, short: commitShort } =
          await getCommitSha();
        const buildTimestamp = getBuildTimestamp();
        const prMetadata = getPRMetadata();
        const deploymentType = getDeploymentType(prMetadata);

        // Build the info object
        const buildInfo = {
          schema_version: '1.0.0',
          version,
          commit_sha: commitSha,
          commit_short: commitShort,
          build_timestamp: buildTimestamp,
          deployment_type: deploymentType,
          ...(prMetadata && { pr_metadata: prMetadata }),
        };

        // Determine output directory
        const outDir = config.build.outDir || 'dist';
        const metaDir = path.join(outDir, '.meta');

        // Ensure .meta directory exists
        if (!fs.existsSync(metaDir)) {
          fs.mkdirSync(metaDir, { recursive: true });
        }

        // Write build-info.json
        const buildInfoPath = path.join(metaDir, 'build-info.json');
        fs.writeFileSync(
          buildInfoPath,
          JSON.stringify(buildInfo, null, 2),
          'utf-8'
        );

        console.log(`[build-info] ✓ Generated ${buildInfoPath}`);
        console.log(
          `[build-info] Version: ${version} | Type: ${deploymentType} | Commit: ${commitShort}`
        );
      } catch (error) {
        console.error('[build-info] Failed to generate build metadata:', error);
        throw error;
      }
    },
  };
}

export default generateBuildInfoPlugin;
