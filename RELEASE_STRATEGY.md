# Release Strategy

This project uses [Changesets](https://github.com/changesets/changesets) for automated releases.

## How It Works

- **Development**: Work on `main` branch (source code only)
- **Release Branches**: `v1`, `v2` etc. (include compiled `dist/` for GitHub Actions)
- **Tags**: `v1.0.0`, `v1.1.0` etc. (specific versions)

## Release Process

```bash
# 1. Create changeset
npm run changeset

# 2. Commit and push
git add . && git commit -m "Add feature" && git push

# 3. Merge the auto-generated Release PR
```

The workflow automatically:

- Creates release branches with compiled code
- Generates tags and GitHub releases
- Updates changelogs

## Consumer Usage

```yaml
# Recommended: Auto-updates within major version
- uses: nais/setup-nais-cli@v1

# Alternative: Pin to exact version
- uses: nais/setup-nais-cli@v1.2.3
```

## Manual Release

If automation fails:

```bash
npm run release:prepare
git tag v1.0.0 && git push origin v1.0.0
```
