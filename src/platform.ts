import * as core from '@actions/core';
import { PlatformInfo, UnsupportedPlatformError } from './types';

/**
 * Detects the current platform and architecture
 */
export function detectPlatform(): PlatformInfo {
  const runnerOs = process.env.RUNNER_OS;
  const runnerArch = process.env.RUNNER_ARCH;

  core.info(`Detected runner OS: ${runnerOs}`);
  core.info(`Detected runner architecture: ${runnerArch}`);

  // Validate we're on Linux
  if (runnerOs !== 'Linux') {
    throw new UnsupportedPlatformError(runnerOs || 'unknown', runnerArch || 'unknown');
  }

  // Map GitHub runner architecture to nais CLI architecture
  let arch: 'amd64' | 'arm64';
  switch (runnerArch) {
    case 'X64':
      arch = 'amd64';
      break;
    case 'ARM64':
      arch = 'arm64';
      break;
    default:
      throw new UnsupportedPlatformError('Linux', runnerArch || 'unknown');
  }

  const filename = `nais-cli_linux_${arch}.tgz`;

  const platformInfo: PlatformInfo = {
    os: 'linux',
    arch,
    filename,
  };

  core.info(`Platform: ${platformInfo.os}`);
  core.info(`Architecture: ${platformInfo.arch}`);
  core.info(`Binary filename: ${platformInfo.filename}`);

  return platformInfo;
}
