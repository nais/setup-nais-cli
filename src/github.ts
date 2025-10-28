import * as core from '@actions/core';
import * as http from '@actions/http-client';
import { NaisCliError, ReleaseInfo } from './types';

const GITHUB_API_BASE = 'https://api.github.com';
const NAIS_CLI_REPO = 'nais/cli';

/**
 * Fetches release information from GitHub API
 */
export async function getReleaseInfo(version: string): Promise<ReleaseInfo> {
  const client = new http.HttpClient('setup-nais-cli');

  try {
    let url: string;
    if (version === 'latest') {
      url = `${GITHUB_API_BASE}/repos/${NAIS_CLI_REPO}/releases/latest`;
      core.info('Fetching latest release information...');
    } else {
      url = `${GITHUB_API_BASE}/repos/${NAIS_CLI_REPO}/releases/tags/${version}`;
      core.info(`Fetching release information for ${version}...`);
    }

    const response = await client.getJson<GitHubRelease>(url);

    if (response.statusCode !== 200) {
      throw new NaisCliError(`GitHub API request failed with status ${response.statusCode}`);
    }

    if (!response.result) {
      throw new NaisCliError('No release data returned from GitHub API');
    }

    const release = response.result;

    if (version !== 'latest' && !release.tag_name) {
      throw new NaisCliError(`Release ${version} not found`);
    }

    core.info(`Using nais CLI version: ${release.tag_name}`);

    return {
      tagName: release.tag_name,
      assets:
        release.assets?.map((asset) => ({
          name: asset.name,
          downloadUrl: asset.browser_download_url,
        })) || [],
    };
  } catch (error) {
    if (error instanceof NaisCliError) {
      throw error;
    }
    throw new NaisCliError(
      `Failed to fetch release information: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * GitHub API response types
 */
interface GitHubRelease {
  tag_name: string;
  assets?: Array<{
    name: string;
    browser_download_url: string;
  }>;
}
