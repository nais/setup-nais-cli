import * as core from '@actions/core';
import { getReleaseInfo } from './github';
import { downloadAndInstall } from './installer';
import { detectPlatform } from './platform';
import { InstallationResult } from './types';

/**
 * Main function to setup nais CLI
 */
export async function setupNaisCli(version: string): Promise<InstallationResult> {
  try {
    // Detect platform and architecture
    core.startGroup('🔍 Detecting platform');
    const platformInfo = detectPlatform();
    core.endGroup();

    // Get release information
    core.startGroup('📋 Getting release information');
    const releaseInfo = await getReleaseInfo(version);
    core.endGroup();

    // Download and install
    core.startGroup('⬇️ Downloading and installing nais CLI');
    const result = await downloadAndInstall(releaseInfo, platformInfo);
    core.endGroup();

    return result;
  } catch (error) {
    // Re-throw to be handled by the main run function
    throw error;
  }
}
