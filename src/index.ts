import * as core from '@actions/core';
import { setupNaisCli } from './setup-nais-cli';

/**
 * Main entry point for the GitHub Action
 */
async function run(): Promise<void> {
  try {
    const version = core.getInput('version') || 'latest';
    core.info(`Setting up nais CLI version: ${version}`);

    await setupNaisCli(version);

    core.info('✅ nais CLI setup completed successfully!');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.setFailed(`❌ Failed to setup nais CLI: ${message}`);
  }
}

// Only run if this is the main module
if (require.main === module) {
  run();
}

export { run };
