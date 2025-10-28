import { downloadAndInstall } from '../installer';
import { PlatformInfo, ReleaseInfo } from '../types';

// Mock the external dependencies
jest.mock('@actions/core');
jest.mock('@actions/tool-cache');
jest.mock('@actions/io');
jest.mock('@actions/exec');
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  promises: {
    access: jest.fn(),
    chmod: jest.fn(),
  },
  constants: {
    F_OK: 0,
  },
}));

import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';
import * as fs from 'fs';

const mockCore = core as jest.Mocked<typeof core>;
const mockTc = tc as jest.Mocked<typeof tc>;
const mockIo = io as jest.Mocked<typeof io>;
const mockExec = exec as jest.Mocked<typeof exec>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Installer', () => {
  const originalEnv = process.env;

  const mockReleaseInfo: ReleaseInfo = {
    tagName: 'v3.8.3',
    assets: [
      {
        name: 'nais-cli_linux_amd64.tgz',
        downloadUrl:
          'https://github.com/nais/cli/releases/download/v3.8.3/nais-cli_linux_amd64.tgz',
      },
      {
        name: 'checksums.txt',
        downloadUrl: 'https://github.com/nais/cli/releases/download/v3.8.3/checksums.txt',
      },
    ],
  };

  const mockPlatformInfo: PlatformInfo = {
    os: 'linux',
    arch: 'amd64',
    filename: 'nais-cli_linux_amd64.tgz',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };

    // Setup default mocks
    mockTc.downloadTool.mockResolvedValue('/tmp/mock-file');
    mockTc.extractTar.mockResolvedValue('/tmp/extracted');
    mockIo.mkdirP.mockResolvedValue();
    mockIo.cp.mockResolvedValue();
    mockExec.exec.mockResolvedValue(0);

    // Mock fs methods
    (mockFs.promises.access as jest.Mock).mockResolvedValue(undefined);
    (mockFs.promises.chmod as jest.Mock).mockResolvedValue(undefined);
    (mockFs.readFileSync as jest.Mock)
      .mockReturnValueOnce(
        '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08  ./release_artifacts/nais-cli_linux_amd64.tgz\n'
      ) // checksums.txt
      .mockReturnValueOnce(Buffer.from('test')); // binary file for checksum
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Dry Run Mode', () => {
    it('should run in dry-run mode when NODE_ENV is test', async () => {
      process.env.NODE_ENV = 'test';
      process.env.HOME = '/home/testuser';

      // Mock the version output
      mockExec.exec.mockImplementation(async (_commandLine, _args, options) => {
        if (options?.listeners?.stdout) {
          options.listeners.stdout(Buffer.from('nais version v3.8.3'));
        }
        return 0;
      });

      const result = await downloadAndInstall(mockReleaseInfo, mockPlatformInfo);

      // In dry-run mode, should not copy to permanent location
      expect(mockIo.cp).not.toHaveBeenCalled();
      expect(mockCore.addPath).not.toHaveBeenCalled();

      // Should still verify the binary works
      expect(mockExec.exec).toHaveBeenCalledWith(
        '/tmp/extracted/nais',
        ['--version'],
        expect.any(Object)
      );

      // Should log dry-run message
      expect(mockCore.info).toHaveBeenCalledWith(
        '🧪 Running in dry-run mode - skipping permanent installation'
      );

      // Should return temporary path
      expect(result.binaryPath).toBe('/tmp/extracted/nais');
      expect(result.version).toBe('v3.8.3');
    });

    it('should run in dry-run mode when NAIS_CLI_DRY_RUN is true', async () => {
      process.env.NAIS_CLI_DRY_RUN = 'true';
      process.env.HOME = '/home/testuser';

      mockExec.exec.mockImplementation(async (_commandLine, _args, options) => {
        if (options?.listeners?.stdout) {
          options.listeners.stdout(Buffer.from('nais version v3.8.3'));
        }
        return 0;
      });

      const result = await downloadAndInstall(mockReleaseInfo, mockPlatformInfo);

      expect(mockIo.cp).not.toHaveBeenCalled();
      expect(mockCore.addPath).not.toHaveBeenCalled();
      expect(mockCore.info).toHaveBeenCalledWith(
        '🧪 Running in dry-run mode - skipping permanent installation'
      );
      expect(result.binaryPath).toBe('/tmp/extracted/nais');
    });
  });
});
