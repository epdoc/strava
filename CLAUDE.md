# Claude Code Project Guide

This document provides essential context for Claude Code when working on this project.

## Project Overview

This is a Deno/TypeScript monorepo for generating KML files from Strava activities and segments. It's a modern
rewrite of the legacy [epdoc-strava](https://github.com/jpravetz/epdoc-strava) Node.js implementation.

See the top-level [README.md](./README.md) for workspace structure and quick start guide.

## Coding Standards

**IMPORTANT**: All development in this project must follow the universal coding standards and conventions
documented in:

- **[GEMINI_GLOBAL.md](/Users/jpravetz/dev/GEMINI_GLOBAL.md)** - Universal guidelines for Deno TypeScript
  projects

This document covers:

- Deno project structure and module organization
- Import conventions and path management
- TypeScript code generation standards
- JSDoc commenting guidelines
- Git commit message standards
- Testing conventions

### Repository Structure

```
/Users/jpravetz/dev/@epdoc/strava/          # NEW implementation (Deno/TypeScript)
├── packages/
│   ├── strava/                             # Main CLI application
│   └── strava-api/                         # Strava API client library
/Users/jpravetz/dev/epdoc/epdoc-strava/     # OLD implementation (Node.js)
/Users/jpravetz/dev/@epdoc/std/             # Shared utility packages (fs, type, daterange, etc.)
/Users/jpravetz/dev/@epdoc/logger/          # Logging library (separate monorepo)
```

## Key Dependencies & Their Roles

### @epdoc/logger (separate monorepo)

- **Location**: `/Users/jpravetz/dev/@epdoc/logger/`
- **Purpose**: TypeScript logging library with pluggable MessageBuilder formatting
- **Usage**: All logging throughout the application
- **Packages**: Contains multiple packages (logger, msgbuilder, loglevels, etc.)
- **Documentation**: See GEMINI.md in that repo for detailed architecture and usage
- **Published**: Available as `jsr:@epdoc/logger`

### @epdoc/cliapp

- Framework for building CLI applications
- Provides the main entry point and command structure
- Handles command parsing and routing
- **Published**: Available as `jsr:@epdoc/cliapp`

### @epdoc/std (monorepo)

- **Location**: `/Users/jpravetz/dev/@epdoc/std/`
- **Purpose**: Collection of shared utility packages
- **Documentation**: See GEMINI.md in that repo for workspace overview
- **Packages**:
  - **@epdoc/fs**: Type-safe file system operations (FileSpec, FolderSpec, FileSpecWriter)
  - **@epdoc/type**: Type guards and utilities for runtime type safety
  - **@epdoc/daterange**: Date range creation and management
  - **@epdoc/datetime**: Date/time tools
  - **@epdoc/duration**: Duration handling and formatting
  - **@epdoc/response**: Consistent API response helpers
  - **@epdoc/string**: Advanced string manipulation utilities
- **Published**: All available via `jsr:@epdoc/<package>`
- **Note**: Since you are the author, we can update these packages rather than creating workarounds

### Legacy Reference

- **Location**: `/Users/jpravetz/dev/epdoc/epdoc-strava/`
- **Purpose**: Source of truth for:
  - **Output requirements**: Types of output the new implementation must produce
  - **Option requirements**: CLI options that must be supported
  - **Feature completeness**: Reference for expected behavior
- **Usage**: Consult when implementing features to ensure compatibility

## Architecture Patterns

### Command Structure

Commands follow a consistent pattern:

1. **Command Definition**: Located in `src/cmd/<command>/cmd.ts`
2. **Options Configuration**: Shared options defined in `src/cmd/options/definitions.ts`
3. **Business Logic**: Commands call methods on `ctx.app` (like `ctx.app.getKml()`), where the actual
   implementation lives in `src/app/app.ts`

Example command structure:

```typescript
export const cmdConfig: Options.Config = {
  replace: { cmd: 'CommandName' },
  options: {
    output: true,
    dates: true,
    // ... other options
  },
};

export class MyCmd extends Options.BaseSubCmd {
  init(ctx: Ctx.Context): Promise<Cmd.Command> {
    this.cmd.init(ctx).action(async (opts) => {
      await ctx.app.init(ctx, { ... });
      await ctx.app.doSomething(ctx, opts);
    });
    this.addOptions(cmdConfig);
    return Promise.resolve(this.cmd);
  }
}
```

### Options System

**Two Types of Options**:

1. **Global Options** - Defined at root level, available to all commands
2. **Command-Specific Options** - Defined per command

**Global Options** (`src/cmd/root/cmd.ts`):

- `--id <athleteId>` - Athlete ID (defaults to login)
- `--imperial` - Use imperial units instead of metric
- `--offline` - Offline mode

**Command-Specific Options** (`src/cmd/options/definitions.ts`):

- **Definitions**: All option definitions are centralized in `definitions.ts`
- **Reusability**: Options like `date`, `output`, `activities`, `segments` are shared across commands
- **Configuration**: Each command specifies which options it needs via `cmdConfig.options`
- **Type Safety**: Options are strongly typed through TypeScript interfaces

**How Options Work**:

- Commander.js automatically merges parent (global) options into child command options
- Command action handlers receive both global and command-specific options in the single options parameter
- Example: KML command receives `imperial` (global) + `output`, `dates`, etc. (command-specific)

### File Writing Pattern

- Use `FileSpecWriter` from `@epdoc/fs` for file operations
- Prefer async/await over promise chains
- Always use try/catch with proper cleanup (close writers)

Example:

```typescript
const fsFile = new FS.File(FS.Folder.cwd(), filepath);
const writer = await fsFile.writer();
try {
  await writer.write(content);
  await writer.close();
} catch (err) {
  await writer.close();
  throw err;
}
```

## Development Workflow

### Making Changes to @epdoc/std Packages

When updating packages in `@epdoc/std`:

1. Make your changes
2. Run tests: `cd ~/dev/@epdoc/std/<package> && deno test -A`
3. Bump version in `deno.json`
4. Commit changes
5. Publish: `deno publish`
6. Update dependencies in dependent projects: `deno update --latest`

### Testing

- Run tests from package directory: `deno test -A`
- Type check: `deno check <file>`

## Important Notes

### Code Style

- Use async/await instead of promise chains
- Use `for...of` loops instead of `.reduce()` for async operations
- Proper error handling with try/catch blocks
- Clean up resources (close files, connections) in finally blocks

### Common Patterns

- Context (`ctx`) is passed throughout the application for dependency injection
- Options are parsed and validated at the command level
- Business logic is in the app layer, not in command handlers
- File operations use `@epdoc/fs` abstractions, not raw Deno APIs

## Package Structure and Key Files

### packages/strava-api/ - Strava API Client Library

```
strava-api/
├── deno.json                    # Package config, exports src/mod.ts
├── src/
│   ├── mod.ts                   # Main exports: Api, Activity, Schema types
│   ├── api.ts                   # Main API class: authentication, activity/segment/stream endpoints
│   ├── activity.ts              # Activity class: activity data wrapper with methods
│   ├── context.ts               # Context types for logging
│   ├── types.ts                 # Core types: TrackPoint, SegmentData, StarredSegmentDict, etc.
│   ├── auth/
│   │   ├── mod.ts               # Auth exports
│   │   ├── auth.ts              # OAuth2Handler class: token management, refresh
│   │   └── types.ts             # Auth-related types
│   └── schema/
│       ├── mod.ts               # Schema exports
│       ├── activity.ts          # SummaryActivity, DetailedActivity schemas
│       ├── athlete.ts           # Athlete schemas
│       ├── segment.ts           # Segment schemas
│       ├── stream.ts            # Stream data schemas
│       └── types.ts             # Common schema types
└── test/                        # Tests
```

**Key Classes**:
- `Api` (api.ts): Main API client - `getActivities()`, `getAthlete()`, `getStreamCoords()`, etc.
- `Activity` (activity.ts): Activity wrapper - `attachStarredSegments()`, `getDetailed()`, `getTrackPoints()`
- `OAuth2Handler` (auth/auth.ts): Token management and refresh

### packages/strava/ - Main CLI Application

```
strava/
├── main.ts                      # Application entry point
├── deno.json                    # Package config, imports, tasks
├── src/
│   ├── config.json              # App config: paths to ~/.strava/ files
│   ├── context.ts               # Context type definition
│   ├── dep.ts                   # External dependencies (@epdoc/*, strava-api)
│   ├── fmt.ts                   # Formatting utilities
│   │
│   ├── app/
│   │   ├── mod.ts               # App exports
│   │   ├── app.ts               # Main business logic class
│   │   └── types.ts             # App types: UserSettings, ConfigFile, etc.
│   │
│   ├── cmd/                     # CLI command definitions
│   │   ├── root/
│   │   │   └── cmd.ts           # Root command: global options (--imperial, --id, --offline)
│   │   ├── athlete/
│   │   │   └── cmd.ts           # Athlete command: display athlete info and bikes
│   │   ├── kml/
│   │   │   └── cmd.ts           # KML command: generate KML files
│   │   ├── gpx/
│   │   │   └── cmd.ts           # GPX command: generate GPX files
│   │   ├── pdf/
│   │   │   └── cmd.ts           # PDF command: generate Acroforms XML for PDF forms
│   │   ├── segments/
│   │   │   └── cmd.ts           # Segments command: manage segment cache
│   │   ├── options/
│   │   │   ├── mod.ts           # Options exports
│   │   │   ├── definitions.ts   # All CLI option definitions
│   │   │   └── base-cmd.ts      # BaseSubCmd class
│   │   └── types.ts             # Command types
│   │
│   ├── bikelog/                 # PDF/XML generation (Adobe Acroforms)
│   │   ├── mod.ts               # Bikelog exports
│   │   ├── bikelog.ts           # Bikelog class: combineActivities(), parseActivityText()
│   │   └── types.ts             # Bikelog types
│   │
│   ├── track/                   # KML/GPX stream generation
│   │   ├── mod.ts               # Track exports
│   │   ├── handler.ts           # Handler class: coordinates KML/GPX generation
│   │   ├── kml.ts               # KmlWriter class: KML file generation
│   │   ├── gpx.ts               # GpxWriter class: GPX file generation
│   │   └── types.ts             # Stream types and options
│   │
│   └── segment/                 # Segment management
│       ├── mod.ts               # Segment exports
│       ├── base.ts              # Segment.Base class
│       ├── data.ts              # Segment.Data class
│       ├── file.ts              # Segment.File class: cache management
│       └── types.ts             # Segment types: CacheEntry, CacheMap
│
└── test/                        # Tests
```

**Key Files for Quick Navigation**:

| Task | File Path |
|------|-----------|
| **Business Logic** | `src/app/app.ts` - Main.getTrack(), Main.getPdf(), Main.getSegments() |
| **KML Generation** | `src/track/kml.ts` - KmlWriter class |
| **GPX Generation** | `src/track/gpx.ts` - GpxWriter class |
| **PDF/XML Generation** | `src/bikelog/bikelog.ts` - Bikelog class |
| **API Calls** | `../strava-api/src/api.ts` - Api class |
| **Activity Data** | `../strava-api/src/activity.ts` - Activity class |
| **CLI Options** | `src/cmd/options/definitions.ts` - All option definitions |
| **User Settings** | `~/.strava/user.settings.json` - Line styles, aliases, blackout zones |

## Questions?

If you encounter patterns or structures not documented here, ask the user for clarification and update this
document.
