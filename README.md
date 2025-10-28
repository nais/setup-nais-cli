# Setup Nais CLI Action

A GitHub Action to install the [Nais CLI](https://github.com/nais/cli) by downloading pre-built binaries from GitHub releases.

## Usage

### Install Latest Version

```yaml
steps:
  - uses: nais/setup-nais-cli@alpha
  - name: Use nais CLI
    run: nais --version
```

# Setup Nais CLI Action

A modern TypeScript-based GitHub Action to install the [Nais CLI](https://github.com/nais/cli) by downloading pre-built binaries from GitHub releases.

## Usage

### Install Latest Version

```yaml
steps:
  - uses: nais/setup-nais-cli@v1
  - name: Use nais CLI
    run: nais --version
```

### Install Specific Version

```yaml
steps:
  - uses: nais/setup-nais-cli@v1
    with:
      version: v3.8.3
  - name: Use nais CLI
    run: nais --version
```

## Inputs

| Name      | Description                                                 | Required | Default  |
| --------- | ----------------------------------------------------------- | -------- | -------- |
| `version` | Version of nais CLI to install (e.g., `v3.8.3` or `latest`) | No       | `latest` |

## Supported Platforms

This action supports Linux GitHub runners:

- Linux (amd64, arm64)

**Note**: This action is designed specifically for Linux environments and will fail on macOS or Windows runners. Testing is primarily done on amd64 for performance reasons.

## Features

- ✅ **TypeScript Implementation**: Modern, type-safe codebase
- ✅ **Fast Installation**: Downloads pre-built binaries (seconds vs minutes)
- ✅ **Checksum Verification**: Ensures download integrity and security
- ✅ **Optimized for Linux**: Focused on CI/CD environments
- ✅ **Comprehensive Testing**: Unit tests and integration tests
- ✅ **Version Management**: Supports both latest and specific versions

## What Changed from v0.x

This action was completely rewritten in TypeScript from the previous bash-based implementation:

### Before (Bash Scripts)

- Multiple shell scripts with cross-platform complexity
- Manual platform detection and error handling
- Basic checksum verification

### After (TypeScript)

- **Modern Architecture**: Type-safe, modular TypeScript codebase
- **Better Error Handling**: Structured error types and comprehensive logging
- **Improved Testing**: Unit tests with Jest and comprehensive CI/CD
- **Enhanced UX**: Better progress indication and error messages
- **Changesets Integration**: Automated release management

## Migration from v0.x

No breaking changes in the API! Update your workflow files to use the new version:

```yaml
# Before
- uses: nais/setup-nais-cli@v0.x

# After
- uses: nais/setup-nais-cli@v1
```

## Inputs

| Name      | Description                                                 | Required | Default  |
| --------- | ----------------------------------------------------------- | -------- | -------- |
| `version` | Version of nais CLI to install (e.g., `v3.8.3` or `latest`) | No       | `latest` |

## Supported Platforms

This action supports Linux GitHub runners:

- Linux (amd64, arm64)

**Note**: This action is designed specifically for Linux environments.

## Features

- ✅ Downloads pre-built binaries for fast installation
- ✅ Verifies checksums for security
- ✅ Optimized for Linux environments
- ✅ Caches downloads for improved performance
- ✅ Supports both latest and specific version installation

## What Changed

This action previously built the nais CLI from source, which was slow and required additional dependencies (Go, mise). The new implementation:

1. Downloads pre-built binaries from GitHub releases
2. Verifies checksums for security
3. Installs much faster (seconds vs minutes)
4. Supports version pinning for reproducible builds
5. Works across all supported platforms

## Migration

If you were using the old version, no changes are required in your workflow files. The action will now install the latest version by default instead of building from source.

To pin to a specific version (recommended for production):

```yaml
- uses: nais/setup-nais-cli@alpha
  with:
    version: v3.8.3 # Pin to specific version
```

## Development

This action is built with TypeScript and uses [Mise](https://mise.jdx.dev/) for Node.js version management.

### Prerequisites

- [Mise](https://mise.jdx.dev/getting-started.html) installed

### Setup

```bash
# Trust and install Node.js 20
mise trust
mise install

# Install dependencies
npm install
```

### Available Scripts

```bash
# Install dependencies
npm install

# Build the action
npm run build

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run tests
npm test

# Format code
npm run format

# Check code formatting
npm run format:check

# Run all checks (typecheck, lint, format-check, test)
npm run check

# Clean build artifacts
npm run clean
```

### Release Management

This project uses [Changesets](https://github.com/changesets/changesets) for release management:

```bash
# Create a changeset (describes changes for release)
npm run changeset

# Version packages (updates package.json and generates CHANGELOG)
npm run version-packages

# Publish release (after building and testing)
npm run release
```

### Project Structure

```
├── src/                     # TypeScript source code
│   ├── __tests__/           # Unit tests
│   ├── types.ts             # Type definitions
│   ├── platform.ts          # Platform detection
│   ├── github.ts            # GitHub API interactions
│   ├── installer.ts         # Download and installation logic
│   ├── setup-nais-cli.ts    # Main setup function
│   └── index.ts             # Entry point
├── dist/                    # Compiled JavaScript (auto-generated)
├── action.yaml              # GitHub Action definition
├── package.json             # Node.js dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest test configuration
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
└── .mise.toml               # Mise configuration for tools and tasks
```

### Testing

```bash
# Run unit tests (uses dry-run mode to avoid installing binaries)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Test the action locally without permanent installation
npm run test:integration
```

**Dry-Run Testing**: All tests run in dry-run mode to avoid installing binaries to your local system. The action will download and verify the nais CLI binary but won't install it permanently. You can also manually test by setting environment variables:

```bash
# Test locally in dry-run mode
NAIS_CLI_DRY_RUN=true RUNNER_OS=Linux RUNNER_ARCH=X64 RUNNER_TEMP=/tmp INPUT_VERSION=latest node dist/index.js
```

### Building

The action must be built before it can be used:

```bash
# Build the action
npm run build

# The compiled output goes to dist/index.js
```

**Important**: Always commit the built `dist/` directory. GitHub Actions runs the compiled JavaScript, not the TypeScript source.
