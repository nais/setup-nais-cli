import * as core from '@actions/core';
import { setupNaisCli } from './setup-nais-cli';

/**
 * Main entry point for the GitHub Action
 */
async function run(): Promise<void> {
  try {
    core.info('🚀 Starting nais CLI setup action...');
    core.info(`Runner: OS=${process.env.RUNNER_OS}, ARCH=${process.env.RUNNER_ARCH}`);

    const version = core.getInput('version') || 'latest';
    core.info(`Setting up nais CLI version: ${version}`);

    await setupNaisCli(version);

    core.info('✅ nais CLI setup completed successfully!');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.error(`Error details: ${error instanceof Error ? error.stack : error}`);
    core.setFailed(`❌ Failed to setup nais CLI: ${message}`);
  }
}

// Only run if this is the main module (ES module version)
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}

export { run };
