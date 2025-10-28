# Setup Nais CLI Action

A GitHub Action to install the [Nais CLI](https://github.com/nais/cli) on Linux runners.

## Usage

```yaml
- uses: nais/setup-nais-cli@v1
- run: nais --version
```

### With specific version

```yaml
- uses: nais/setup-nais-cli@v1
  with:
    version: v3.8.3
```

## Inputs

| Name      | Description                               | Required | Default  |
| --------- | ----------------------------------------- | -------- | -------- |
| `version` | Version to install (`v3.8.3` or `latest`) | No       | `latest` |

## Version Pinning

**Recommended:** Use major version for automatic updates

```yaml
- uses: nais/setup-nais-cli@v1 # Gets latest v1.x.x
```

**Alternative:** Pin to exact version

```yaml
- uses: nais/setup-nais-cli@v1.2.3 # No automatic updates
```

## Requirements

- Linux runner (`ubuntu-latest`, `ubuntu-20.04`, etc.)

## Support

- 📖 [Nais CLI Documentation](https://doc.nais.io/cli)
- 🐛 [Report Issues](https://github.com/nais/setup-nais-cli/issues)

---

**Contributing:** See [DEVELOPMENT.md](DEVELOPMENT.md) for development setup.
