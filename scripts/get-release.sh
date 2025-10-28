#!/bin/bash
set -euo pipefail

# Get release information for nais CLI
# Input: VERSION (environment variable or argument)
# Sets GITHUB_OUTPUT variable: tag_name

VERSION="${1:-${VERSION:-latest}}"

if [ "$VERSION" = "latest" ]; then
  echo "Fetching latest release information..."
  # Get latest release
  release_data=$(curl -s -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/nais/cli/releases/latest")

  if ! tag_name=$(echo "$release_data" | jq -r '.tag_name' 2>/dev/null); then
    echo "Error: Failed to parse latest release information"
    echo "Response: $release_data"
    exit 1
  fi

  if [ "$tag_name" = "null" ] || [ -z "$tag_name" ]; then
    echo "Error: Could not determine latest release tag"
    exit 1
  fi
else
  # Use specified version
  tag_name="$VERSION"
  echo "Validating release $tag_name..."

  # Validate that the release exists
  release_data=$(curl -s -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/nais/cli/releases/tags/$tag_name")

  if echo "$release_data" | jq -e '.message == "Not Found"' > /dev/null 2>&1; then
    echo "Error: Release $tag_name not found"
    exit 1
  fi
fi

echo "Using nais CLI version: $tag_name"

# Set GitHub Actions output
echo "tag_name=$tag_name" >> "$GITHUB_OUTPUT"
