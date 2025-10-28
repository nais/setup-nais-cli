#!/bin/bash
set -euo pipefail

# Detect platform and architecture for nais CLI download
# Sets GITHUB_OUTPUT variables: os, arch, filename

case "$RUNNER_OS" in
  Linux)
    os="linux"
    ;;
  macOS)
    os="darwin"
    ;;
  Windows)
    os="windows"
    ;;
  *)
    echo "Unsupported OS: $RUNNER_OS"
    exit 1
    ;;
esac

case "$RUNNER_ARCH" in
  X64)
    arch="amd64"
    ;;
  ARM64)
    arch="arm64"
    ;;
  *)
    echo "Unsupported architecture: $RUNNER_ARCH"
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
