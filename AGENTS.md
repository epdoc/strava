# @epdoc/strava Monorepo Guide

## Project Overview

Deno/TypeScript monorepo for generating KML/GPX/PDF files from Strava activities. Modern rewrite of
the legacy [epdoc-strava](https://github.com/jpravetz/epdoc-strava) Node.js app.

Read global deno-guidelines skill.

## Package Architecture

```
packages/
├── schema/  (2.2.2)  Types & type guards for Strava API data
├── core/    (2.2.4)  Context, base classes, logging infrastructure
├── api/     (2.2.4)  Strava HTTP client (auth, activities, segments, streams)
├── app/     (2.2.5)  Business logic - activity fetch, KML/GPX/PDF generation
├── athlete/ (2.2.4)  CLI for athlete info display
├── info/    (2.2.3)  CLI for activity info queries
└── strava/  (2.2.6)  Main CLI - KML, GPX, PDF, segments commands
```

### Dependency Flow

```
schema (types only) → core (base classes, context) → api (HTTP client)
                                                         ↓
                                    ┌────────────────────┘
                                    ↓
                    app (business logic, KML/GPX/PDF)
                     ↓         ↓          ↓
                 athlete    info      strava (CLI)
```

## Package Details

### `schema` - @epdoc/strava-schema

Pure TS interfaces + lightweight type guards. No Zod. Namespace exports: `Schema.Activity.Summary`,
`Schema.Athlete.Detailed`, etc. See `packages/schema/AI.md` for full docs.

### `core` - @epdoc/strava-core

- `Ctx.Context` - Application context (extends cliapp's AbstractBase)
- `CustomMsgBuilder` - Logging with `.fs()`, `.activity()`, `.dateRange()` helpers
- `BaseClass` - Extend for domain classes with logging access
- `BaseRootCmdClass` - Base for root CLI commands

### `api` - @epdoc/strava-api

- `Api` - HTTP client: `getAthlete()`, `getActivities()`, `getStreamCoords()`,
  `getDetailedActivity()`, `getSegment()`, `getSegmentEfforts()`
- `Activity` - Wraps activity data with `getTrackPoints()`, `filterTrackPoints()`,
  `attachStarredSegments()`, timezone handling
- Auto-refreshes OAuth tokens, handles pagination for starred segments

### `app` - @epdoc/strava-app

- `Main` - Central business logic in `src/app.ts`: `init()`, `getKml()`, `getGpx()`, `getPdf()`,
  `getAthlete()`
- Subdirs: `activity/`, `bikelog/`, `segment/`, `state/`, `track/`
- `BaseClass` provides `this.app` and `this.api` accessors
- Supports blackout zones, dedup, activity type/commute filtering

### `athlete` - @epdoc/strava-athlete

- Simple CLI: displays athlete info and bikes. Exports `AthleteCommand`.

### `info` - @epdoc/strava-info

- CLI for querying activity information. Exports `InfoCommand`, `InfoTool`, `InfoOptions`.
- Uses `@epdoc/table` for formatted output.

### `strava` - @epdoc/strava CLI

- Main application entry: `main.ts` → `RootCommand`
- Commands: `kml`, `gpx`, `pdf` (export commands)
- Each command defined in its own file under `packages/strava/src/`

## Key Patterns

- **Context**: `Ctx.Context` passed everywhere for DI
- **BaseClass**: Provides `.log`, `.info`, `.debug`, `.error` logging via `CustomMsgBuilder`
- **File writes**: Use `FileSpecWriter` from `@epdoc/fs`
- **Options**: Commander.js, global + command-specific, defined in the command file
- **Type safety**: Schema type guards (`Activity.isSummary(data)`) for API responses
- **Streams**: `getStreamCoords()` returns `TrackPoint[]` with lat/lng/altitude/time
- **Timezones**: Strava uses `"(GMT±HH:MM) IANA/Timezone"` format; parse with regex, use
  `@epdoc/datetime`

## Configuration

Files in `~/.strava/`:

- `credentials.json` - OAuth tokens (auto-managed)
- `clientapp.secrets.json` - API client ID/secret
- `user.settings.json` - Preferences (line styles, blackout zones, segment aliases)
- `user.segments.json` - Cached segment data

## Quick Start

```bash
# From packages/strava/
deno task run --help
deno task run athlete
deno task run kml -d 2025-01- -o january.kml
```

```bash
# Development
deno task test    # run tests
deno task check   # type checking
deno task lint    # lint
deno task ok      # fmt + lint + check + test + docs
```

## External Dependencies

| Library          | Location | Purpose                |
| ---------------- | -------- | ---------------------- |
| @epdoc/cliapp    | jsr      | CLI framework          |
| @epdoc/logger    | jsr      | Logging                |
| @epdoc/fs        | jsr      | Filesystem operations  |
| @epdoc/type      | jsr      | Type guards            |
| @epdoc/datetime  | jsr      | DateTime handling      |
| @epdoc/daterange | jsr      | Date ranges            |
| @epdoc/duration  | jsr      | Duration formatting    |
| @epdoc/table     | jsr      | Terminal tables (info) |
| pdf-lib          | npm      | PDF generation         |

## Legacy Reference

Old Node.js implementation at `/Users/jpravetz/dev/epdoc/epdoc-strava/` - we no longer need to
consult this project, as the current project is now robust and battle tested.
