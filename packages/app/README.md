# @epdoc/strava-app

Business logic for generating KML/GPX/PDF files from Strava activities.

## Overview

This package contains the central `Main` class and all domain logic for the Strava CLI application.
It orchestrates Strava API calls, activity filtering, and output generation. The `Main` class is the
primary entry point used by CLI commands.

## Key Classes

- **Main** (`src/app.ts`) - Central coordinator: `init()`, `getKml()`, `getGpx()`, `getPdf()`
- **BaseClass** (`src/base.ts`) - Extends core BaseClass with `this.app` and `this.api` accessors

## Submodules

| Submodule | Description |
|-----------|-------------|
| `activity/` | Activity filtering and processing |
| `bikelog/` | PDF Acroforms XML generation |
| `segment/` | Segment data and cache management |
| `state/` | State management for export operations |
| `track/` | KML and GPX track generation |

## Usage

```typescript
import { Main } from '@epdoc/strava-app';

const app = new Main(ctx);
await app.init(ctx, { strava: true, userSettings: true });
await app.getKml(ctx, { dates, output: 'activities.kml' });
```

## License

MIT
