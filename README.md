# @epdoc/strava - Monorepo

Deno/TypeScript monorepo for generating KML/GPX/PDF files from Strava activities and segments.

## Packages

| Package | Version | Purpose |
|---------|---------|---------|
| [schema](./packages/schema/) | 2.2.2 | TypeScript types & type guards for Strava API data |
| [core](./packages/core/) | 2.2.4 | Context, base classes, logging infrastructure |
| [api](./packages/api/) | 2.2.4 | Strava HTTP client (auth, activities, segments, streams) |
| [app](./packages/app/) | 2.2.5 | Business logic - activity fetch, KML/GPX/PDF generation |
| [athlete](./packages/athlete/) | 2.2.4 | CLI for athlete info display |
| [info](./packages/info/) | 2.2.3 | CLI for activity info queries |
| [strava](./packages/strava/) | 2.2.6 | Main CLI - KML, GPX, PDF, segments commands |

## Dependency Flow

```
schema → core → api → app → athlete/info/strava
```

## Installation

```bash
cd ~/mydevfolder && mkdir -p epdoc && cd epdoc
git clone https://github.com/epdoc/strava.git
```

## Quick Start

```bash
cd packages/strava
deno task run --help
deno task run athlete
deno task run kml -d 2025-01- -o january.kml
```

## Development

```bash
deno task lint    # Lint all packages
deno task check   # Type check all packages
deno task test    # Run tests for all packages
```

## Configuration

The CLI uses files in `~/.strava/`:
- `credentials.json` - OAuth tokens (auto-managed)
- `clientapp.secrets.json` - API client ID/secret
- `user.settings.json` - Line styles, blackout zones, segment aliases
- `user.segments.json` - Cached segment data

## Legacy Reference

Original Node.js app at [github.com/jpravetz/epdoc-strava](https://github.com/jpravetz/epdoc-strava).
