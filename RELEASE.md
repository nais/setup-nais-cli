# Release Process

This document outlines the release process for the setup-nais-cli GitHub Action.

## Release Strategy

We use semantic versioning with both specific version tags and moving major version tags:

- **Specific tags**: `v1.0.0`, `v1.0.1`, `v1.1.0`, `v2.0.0` (immutable)
- **Major version tags**: `v1`, `v2` (moving, always point to latest patch/minor)

## Usage Examples

Users can reference the action in different ways:

```yaml
# Pin to exact version (recommended for production)
- uses: nais/setup-nais-cli@v1.2.3

# Use major version (gets automatic patch/minor updates)
- uses: nais/setup-nais-cli@v1

# Use latest on a branch (for development/testing)
- uses: nais/setup-nais-cli@main
```

## Release Methods

### Method 1: Automatic Release (Recommended)

1. **Create a tag locally:**

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **The workflow automatically:**
   - Runs tests to ensure quality
   - Creates a GitHub release
   - Updates the major version tag (e.g., `v1` → points to `v1.0.0`)

### Method 2: Manual Release via GitHub UI

1. Go to Actions → "Manual Release"
2. Click "Run workflow"
3. Enter version (e.g., `1.0.0` - without `v` prefix)
4. Optionally mark as prerelease
5. Click "Run workflow"

### Method 3: GitHub CLI

```bash
# Create and push tag
git tag v1.0.0
git push origin v1.0.0

# The release workflow will trigger automatically
```

## Release Workflow

When you create a tag, the automated workflow:

1. ✅ **Validates** - Runs `npm run check` (linting + tests)
2. 🏷️ **Extracts** version info from tag
3. 📝 **Creates** GitHub release with usage examples
4. 🔄 **Updates** major version tag to point to new release

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (`v2.0.0`): Breaking changes
- **MINOR** (`v1.1.0`): New features, backward compatible
- **PATCH** (`v1.0.1`): Bug fixes, backward compatible

## Pre-releases

For pre-releases (alpha, beta, rc):

```bash
git tag v1.0.0-alpha.1
git push origin v1.0.0-alpha.1
```

Or use the manual release workflow with "prerelease" checked.

## Testing Before Release

Always test before releasing:

```bash
# Run all tests and linting
npm run check

# Build to ensure compilation works
npm run build
```

## Major Version Updates

When releasing a new major version:

1. Create the tag: `git tag v2.0.0 && git push origin v2.0.0`
2. The workflow automatically creates/updates the `v2` tag
3. Users can migrate from `@v1` to `@v2` when ready
4. Both `v1` and `v2` tags coexist

## Rollback

If you need to rollback a major version tag:

```bash
# Point v1 back to a previous release
git tag -fa v1 v1.2.3
git push origin v1 --force
```

## Best Practices

- ✅ Test thoroughly before releasing
- ✅ Write meaningful release notes
- ✅ Use semantic versioning consistently
- ✅ Don't delete or move specific version tags
- ✅ Update documentation when needed
- ⚠️ Be careful with major version updates
- ⚠️ Test major version migrations
