/**
 * Supported platform and architecture combinations
 */
export interface PlatformInfo {
  os: 'linux';
  arch: 'amd64' | 'arm64';
  filename: string;
}

/**
 * GitHub release information
 */
export interface ReleaseInfo {
  tagName: string;
  assets: ReleaseAsset[];
}

export interface ReleaseAsset {
  name: string;
  downloadUrl: string;
}

/**
 * Checksum verification result
 */
export interface ChecksumVerification {
  expected: string;
  actual: string;
  verified: boolean;
}

/**
 * Installation result
 */
export interface InstallationResult {
  binaryPath: string;
  version: string;
}

/**
 * Error types for better error handling
 */
export class NaisCliError extends Error {
  public readonly cause?: Error | undefined;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'NaisCliError';
    if (cause) {
      this.cause = cause;
    }
  }
}

export class UnsupportedPlatformError extends NaisCliError {
  constructor(platform: string, arch: string) {
    super(`Unsupported platform: ${platform} ${arch}. This action only supports Linux.`);
    this.name = 'UnsupportedPlatformError';
  }
}

export class DownloadError extends NaisCliError {
  constructor(url: string, cause?: Error) {
    super(`Failed to download from ${url}`, cause);
    this.name = 'DownloadError';
  }
}

export class ChecksumError extends NaisCliError {
  constructor(expected: string, actual: string) {
    super(`Checksum verification failed. Expected: ${expected}, Actual: ${actual}`);
    this.name = 'ChecksumError';
  }
}
