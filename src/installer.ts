import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import {
  ChecksumError,
  ChecksumVerification,
  DownloadError,
  InstallationResult,
  NaisCliError,
  PlatformInfo,
  ReleaseInfo,
} from './types';

/**
 * Downloads and installs the nais CLI binary
 */
export async function downloadAndInstall(
  releaseInfo: ReleaseInfo,
  platformInfo: PlatformInfo
): Promise<InstallationResult> {
  try {
    // Check if we're in test/dry-run mode
    const isDryRun =
      process.env.NODE_ENV === 'test' ||
      process.env.NAIS_CLI_DRY_RUN === 'true' ||
      (process.env.CI === 'true' && !process.env.GITHUB_ACTIONS);

    // Download binary archive
    const archiveUrl = getAssetUrl(releaseInfo, platformInfo.filename);
    core.info(`Downloading ${platformInfo.filename} from ${releaseInfo.tagName}...`);
    const archivePath = await tc.downloadTool(archiveUrl);

    // Download checksums
    const checksumsUrl = getAssetUrl(releaseInfo, 'checksums.txt');
    core.info('Downloading checksums...');
    const checksumsPath = await tc.downloadTool(checksumsUrl);

    // Verify checksum
    const verification = await verifyChecksum(archivePath, platformInfo.filename, checksumsPath);
    if (!verification.verified) {
      throw new ChecksumError(verification.expected, verification.actual);
    }
    core.info('✅ Checksum verification passed');

    // Extract archive
    core.info('Extracting binary...');
    const extractedPath = await tc.extractTar(archivePath);

    // Find the nais binary
    const binaryPath = await findNaisBinary(extractedPath);
    core.info(`Found nais binary: ${binaryPath}`);

    let targetPath: string;
    let version: string;

    if (isDryRun) {
      // In dry-run mode, just verify the binary works but don't install it permanently
      core.info('🧪 Running in dry-run mode - skipping permanent installation');

      // Make binary executable for testing
      await makeExecutable(binaryPath);
      targetPath = binaryPath; // Use temporary path

      // Verify the binary works
      version = await verifyInstallation(binaryPath);
      core.info(`✅ nais CLI ${version} verified successfully (dry-run mode)!`);
    } else {
      // Normal installation mode
      const installDir = path.join(process.env.HOME || '', '.local', 'bin');
      await io.mkdirP(installDir);
      targetPath = path.join(installDir, 'nais');

      await io.cp(binaryPath, targetPath);
      await makeExecutable(targetPath);

      core.info(`Installed nais CLI to: ${targetPath}`);
      core.info(`Install directory: ${installDir}`);
      core.info(`HOME environment: ${process.env.HOME}`);

      // Add to PATH
      core.addPath(installDir);
      core.info(`Added ${installDir} to PATH`);

      // Verify installation
      version = await verifyInstallation(targetPath);
      core.info(`✅ nais CLI ${version} installed successfully!`);
    }

    return {
      binaryPath: targetPath,
      version,
    };
  } catch (error) {
    if (error instanceof NaisCliError) {
      throw error;
    }
    throw new NaisCliError(
      `Installation failed: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Gets the download URL for a specific asset
 */
function getAssetUrl(releaseInfo: ReleaseInfo, assetName: string): string {
  const asset = releaseInfo.assets.find((a) => a.name === assetName);
  if (!asset) {
    throw new DownloadError(`Asset ${assetName} not found in release ${releaseInfo.tagName}`);
  }
  return asset.downloadUrl;
}

/**
 * Verifies the checksum of a downloaded file
 */
async function verifyChecksum(
  filePath: string,
  filename: string,
  checksumsPath: string
): Promise<ChecksumVerification> {
  // Read checksums file
  const checksumsContent = fs.readFileSync(checksumsPath, 'utf8');

  // Find the checksum for our file (accounting for ./release_artifacts/ prefix)
  const checksumLine = checksumsContent
    .split('\n')
    .find((line) => line.includes(`./release_artifacts/${filename}`));

  if (!checksumLine) {
    throw new ChecksumError('not found', 'unknown');
  }

  const expectedChecksum = checksumLine.split(/\s+/)[0];

  // Calculate actual checksum
  const fileBuffer = fs.readFileSync(filePath);
  const actualChecksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  return {
    expected: expectedChecksum,
    actual: actualChecksum,
    verified: expectedChecksum === actualChecksum,
  };
}

/**
 * Finds the nais binary in the extracted directory
 */
async function findNaisBinary(extractedPath: string): Promise<string> {
  const binaryPath = path.join(extractedPath, 'nais');

  try {
    await fs.promises.access(binaryPath, fs.constants.F_OK);
    return binaryPath;
  } catch {
    throw new NaisCliError(`Could not find nais binary in ${extractedPath}`);
  }
}

/**
 * Makes a file executable
 */
async function makeExecutable(filePath: string): Promise<void> {
  await fs.promises.chmod(filePath, 0o755);
}

/**
 * Verifies that the installation was successful
 */
async function verifyInstallation(binaryPath: string): Promise<string> {
  let output = '';

  const options: exec.ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
    silent: true,
  };

  try {
    await exec.exec(binaryPath, ['--version'], options);
    // Extract version from output (e.g., "nais version v3.8.3" -> "v3.8.3")
    const versionMatch = output.match(/version\s+(.+)/);
    return versionMatch ? versionMatch[1].trim() : output.trim();
  } catch (error) {
    throw new NaisCliError(
      `Failed to verify installation: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
