#!/bin/bash
set -euo pipefail

# Download, verify, and install nais CLI
# Input: TAG_NAME, FILENAME (environment variables or arguments)

TAG_NAME="${1:-${TAG_NAME:-}}"
FILENAME="${2:-${FILENAME:-}}"

if [ -z "$TAG_NAME" ] || [ -z "$FILENAME" ]; then
  echo "Error: TAG_NAME and FILENAME must be provided"
  echo "Usage: $0 <tag_name> <filename>"
  exit 1
fi

# Create temporary directory
temp_dir=$(mktemp -d)
cd "$temp_dir" || exit 1

echo "Working in temporary directory: $temp_dir"

# Download the binary archive
echo "Downloading $FILENAME from release $TAG_NAME..."
if ! curl -L -o "$FILENAME" \
  "https://github.com/nais/cli/releases/download/$TAG_NAME/$FILENAME"; then
  echo "Error: Failed to download $FILENAME"
  exit 1
fi

# Download checksums
echo "Downloading checksums..."
if ! curl -L -o "checksums.txt" \
  "https://github.com/nais/cli/releases/download/$TAG_NAME/checksums.txt"; then
  echo "Error: Failed to download checksums.txt"
  exit 1
fi

# Verify checksum
echo "Verifying checksum..."
verify_checksum() {
  local hash_tool="$1"
  local expected_hash
  expected_hash=$(grep "./release_artifacts/$FILENAME" checksums.txt | cut -d' ' -f1)

  if [ -z "$expected_hash" ]; then
    echo "Warning: Could not find checksum for $FILENAME in checksums.txt"
    return 0
  fi

  local actual_hash
  actual_hash=$($hash_tool "$FILENAME" | cut -d' ' -f1)

  if [ "$expected_hash" = "$actual_hash" ]; then
    echo "Checksum verification passed"
    return 0
  else
    echo "Checksum verification failed!"
    echo "Expected: $expected_hash"
    echo "Actual: $actual_hash"
    return 1
  fi
}

if command -v sha256sum > /dev/null; then
  verify_checksum "sha256sum"
elif command -v shasum > /dev/null; then
  verify_checksum "shasum -a 256"
else
  echo "Warning: No SHA256 verification tool found, skipping checksum verification"
fi

# Extract binary
echo "Extracting binary..."
if ! tar -xzf "$FILENAME"; then
  echo "Error: Failed to extract $FILENAME"
  exit 1
fi

# Find the nais binary (should be named 'nais' on Linux)
nais_binary=$(find . -name "nais" -type f | head -1)
if [ -z "$nais_binary" ]; then
  echo "Error: Could not find nais binary in extracted archive"
  echo "Archive contents:"
  find . -type f
  exit 1
fi

echo "Found nais binary: $nais_binary"

# Make sure the binary is executable
chmod +x "$nais_binary"

# Create bin directory and install binary
install_dir="$HOME/.local/bin"
mkdir -p "$install_dir"
target_binary="$install_dir/nais"

cp "$nais_binary" "$target_binary"
chmod +x "$target_binary"

echo "Installed nais CLI to: $target_binary"

# Add to PATH
echo "$install_dir" >> "$GITHUB_PATH"

# Verify installation
echo "Verifying installation..."
"$target_binary" --version

echo "nais CLI installation completed successfully!"

# Clean up
cd / && rm -rf "$temp_dir"
