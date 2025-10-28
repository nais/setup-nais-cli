import { detectPlatform } from '../platform';
import { UnsupportedPlatformError } from '../types';

describe('Platform Detection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should detect Linux amd64 platform correctly', () => {
    process.env.RUNNER_OS = 'Linux';
    process.env.RUNNER_ARCH = 'X64';

    const result = detectPlatform();

    expect(result).toEqual({
      os: 'linux',
      arch: 'amd64',
      filename: 'nais-cli_linux_amd64.tgz',
    });
  });

  it('should detect Linux arm64 platform correctly', () => {
    process.env.RUNNER_OS = 'Linux';
    process.env.RUNNER_ARCH = 'ARM64';

    const result = detectPlatform();

    expect(result).toEqual({
      os: 'linux',
      arch: 'arm64',
      filename: 'nais-cli_linux_arm64.tgz',
    });
  });

  it('should throw error for non-Linux OS', () => {
    process.env.RUNNER_OS = 'Windows';
    process.env.RUNNER_ARCH = 'X64';

    expect(() => detectPlatform()).toThrow(UnsupportedPlatformError);
  });

  it('should throw error for unsupported architecture', () => {
    process.env.RUNNER_OS = 'Linux';
    process.env.RUNNER_ARCH = 'ARM';

    expect(() => detectPlatform()).toThrow(UnsupportedPlatformError);
  });
});
