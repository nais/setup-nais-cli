#!/bin/bash
set -euo pipefail

# Detect platform and architecture for nais CLI download (Linux only)
# Sets GITHUB_OUTPUT variables: os, arch, filename

# Validate we're running on Linux
if [ "$RUNNER_OS" != "Linux" ]; then
  echo "Error: This action only supports Linux runners"
  echo "Current runner OS: $RUNNER_OS"
  exit 1
fi

os="linux"

case "$RUNNER_ARCH" in
  X64)
    arch="amd64"
    ;;
  ARM64)
    arch="arm64"
    ;;
  *)
    echo "Unsupported architecture: $RUNNER_ARCH"
    echo "Supported architectures: X64 (amd64), ARM64 (arm64)"
    exit 1
    ;;
esac

filename="nais-cli_${os}_${arch}.tgz"

echo "Detected platform: $os"
echo "Detected architecture: $arch"
echo "Binary filename: $filename"

# Set GitHub Actions outputs
{
  echo "os=$os"
  echo "arch=$arch"
  echo "filename=$filename"
} >> "$GITHUB_OUTPUT"
