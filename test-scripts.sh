#!/bin/bash
set -euo pipefail

# Test script for the nais CLI installation scripts

echo "Testing nais CLI installation scripts..."

# Setup test environment
export RUNNER_OS="Linux"
export RUNNER_ARCH="X64"
export GITHUB_OUTPUT="/tmp/github_output_test"
export GITHUB_PATH="/tmp/github_path_test"

# Create temporary files
rm -f "$GITHUB_OUTPUT" "$GITHUB_PATH"
touch "$GITHUB_OUTPUT" "$GITHUB_PATH"

echo "=== Test 1: Platform Detection ==="
./scripts/detect-platform.sh

# Read the outputs
platform_outputs=$(cat "$GITHUB_OUTPUT")
echo "Platform detection outputs:"
echo "$platform_outputs"

# Extract values for next test
os=$(echo "$platform_outputs" | grep "^os=" | cut -d'=' -f2)
arch=$(echo "$platform_outputs" | grep "^arch=" | cut -d'=' -f2)
filename=$(echo "$platform_outputs" | grep "^filename=" | cut -d'=' -f2)

echo "Detected: os=$os, arch=$arch, filename=$filename"

echo "=== Test 2: Get Latest Release ==="
export VERSION="latest"
./scripts/get-release.sh

# Read the release output
release_outputs=$(cat "$GITHUB_OUTPUT" | tail -1)
tag_name=$(echo "$release_outputs" | grep "^tag_name=" | cut -d'=' -f2)
echo "Latest release: $tag_name"

echo "=== Test 3: Get Specific Release ==="
echo "tag_name=" > "$GITHUB_OUTPUT"  # Clear previous output
export VERSION="v3.8.3"
./scripts/get-release.sh

# Read the release output
release_outputs=$(cat "$GITHUB_OUTPUT" | tail -1)
specific_tag=$(echo "$release_outputs" | grep "^tag_name=" | cut -d'=' -f2)
echo "Specific release: $specific_tag"

echo "=== Test 4: Download and Install ==="
# Test the installation script
export TAG_NAME="$tag_name"
export FILENAME="$filename"

./scripts/install-nais.sh

# Test that nais is available
if command -v nais > /dev/null; then
  echo "✅ nais CLI is available in PATH"
  nais --version
else
  echo "❌ nais CLI is not available in PATH"
  exit 1
fi

echo "=== All Tests Passed! ==="
