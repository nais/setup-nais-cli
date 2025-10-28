#!/usr/bin/env node

/**
 * Integration test script for testing the nais CLI setup action locally
 * This demonstrates how to test the action without installing binaries permanently
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Testing nais CLI setup action in dry-run mode...\n');

// Set environment variables for dry-run mode
const env = {
  ...process.env,
  NODE_ENV: 'test',
  NAIS_CLI_DRY_RUN: 'true',
  RUNNER_OS: 'Linux',
  RUNNER_ARCH: 'X64',
  RUNNER_TEMP: '/tmp',
  INPUT_VERSION: 'latest',
};

try {
  console.log('Environment variables:');
  console.log('- NODE_ENV:', env.NODE_ENV);
  console.log('- NAIS_CLI_DRY_RUN:', env.NAIS_CLI_DRY_RUN);
  console.log('- RUNNER_OS:', env.RUNNER_OS);
  console.log('- RUNNER_ARCH:', env.RUNNER_ARCH);
  console.log('- INPUT_VERSION:', env.INPUT_VERSION);
  console.log('');

  // Build the action first
  console.log('📦 Building action...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build completed\n');

  // Run the action
  console.log('🚀 Running action in dry-run mode...');
  const output = execSync('node dist/index.js', {
    env,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  console.log('📝 Action output:');
  console.log(output);

  console.log('\n✅ Dry-run test completed successfully!');
  console.log(
    '🎉 The action downloaded and verified the binary without installing it permanently.'
  );
} catch (error) {
  console.error('❌ Test failed:', error.message);
  if (error.stdout) {
    console.error('stdout:', error.stdout);
  }
  if (error.stderr) {
    console.error('stderr:', error.stderr);
  }
  process.exit(1);
}
