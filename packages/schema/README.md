# @jpravetz/strava-schema

Zod schemas and TypeScript types for the Strava API.

## Overview

This package provides runtime validation schemas (using [Zod](https://zod.dev)) and inferred
TypeScript types for all Strava API data structures. Use this package to validate API responses
and ensure type safety when working with Strava data.

The package uses a **hybrid approach**:
- **Zod schemas** for most types, enabling runtime validation and type inference
- **TypeScript interfaces** for types with circular dependencies (Segment types)

## Installation

```bash
deno add jsr:@jpravetz/strava-schema
```

Or add to your `deno.json`:

```json
{
  "imports": {
    "@jpravetz/strava-schema": "jsr:@jpravetz/strava-schema@^2.0.0"
  }
}
```

## Quick Start

### Validating API Responses

```typescript
import { SummaryActivitySchema, DetailedActivity } from '@jpravetz/strava-schema';

// Validate unknown data from API
const result = SummaryActivitySchema.safeParse(apiResponse);
if (result.success) {
  const activity: DetailedActivity = result.data;
  console.log(`Activity: ${activity.name}, Distance: ${activity.distance}m`);
} else {
  console.error('Validation failed:', result.error.format());
}
```

### Using Types

```typescript
import type { SummaryActivity, ActivityType } from '@jpravetz/strava-schema';

function processActivity(activity: SummaryActivity): void {
  console.log(`${activity.name} (${activity.type})`);
  console.log(`  Distance: ${(activity.distance / 1000).toFixed(2)} km`);
  console.log(`  Elevation: ${activity.total_elevation_gain} m`);
}
```

### Parsing with Zod

```typescript
import { DetailedActivitySchema } from '@jpravetz/strava-schema';
import { z } from 'zod';

// Parse single activity
const activity = DetailedActivitySchema.parse(apiResponse);

// Parse array of activities
const activities = z.array(SummaryActivitySchema).parse(apiResponse);

// Safe parsing (returns { success, data } or { success, error })
const result = SummaryActivitySchema.safeParse(maybeActivity);
```

## Available Schemas

All schemas follow the naming convention `XxxSchema` with corresponding types.

### Activity Schemas

| Schema | Type | Description |
|--------|------|-------------|
| `SummaryActivitySchema` | `SummaryActivity` | Basic activity information |
| `DetailedActivitySchema` | `DetailedActivity` | Full activity details |
| `ActivityStatsSchema` | `ActivityStats` | Athlete statistics |
| `ActivityTotalSchema` | `ActivityTotal` | Totals for a time period |
| `LapSchema` | `Lap` | Activity lap data |
| `SplitSchema` | `Split` | Activity split data |
| `PolylineMapSchema` | `PolylineMap` | Map polyline data |

### Athlete Schemas

| Schema | Type | Description |
|--------|------|-------------|
| `SummaryAthleteSchema` | `SummaryAthlete` | Basic athlete info |
| `DetailedAthleteSchema` | `DetailedAthlete` | Full athlete profile |
| `SummaryClubSchema` | `SummaryClub` | Club information |
| `CommentSchema` | `Comment` | Activity comment |

### Segment Types (Interfaces)

These types use TypeScript interfaces due to circular dependencies:

| Type | Description |
|------|-------------|
| `SummarySegment` | Basic segment info |
| `DetailedSegment` | Full segment details |
| `SummarySegmentEffort` | Athlete's effort on segment |
| `DetailedSegmentEffort` | Full effort details with achievements |

### Gear Schemas

| Schema | Type | Description |
|--------|------|-------------|
| `SummaryGearSchema` | `SummaryGear` | Basic gear info |
| `DetailedGearSchema` | `DetailedGear` | Full gear details |

### Stream Schemas

| Schema | Type | Description |
|--------|------|-------------|
| `StreamSchema` | `Stream` | Generic data stream |
| `LatLngStreamSchema` | `LatLngStream` | Latitude/longitude stream |
| `StreamSetSchema` | `StreamSet` | All streams for an activity |

### Constants & Enums

All Strava API constants available as both const assertions and Zod enums:

```typescript
import {
  // Const assertions (for values)
  ActivityName,
  ResourceState,
  Sex,
  SportName,
  // Zod schemas (for validation)
  ActivityNameSchema,
  ResourceStateSchema,
  SexSchema,
  SportNameSchema,
  // Inferred types
  ActivityType,
  ResourceStateType,
  SexType,
  SportType,
} from '@jpravetz/strava-schema';
```

Available constants:
- `ActivityName` / `ActivityNameSchema` / `ActivityType`
- `ResourceState` / `ResourceStateSchema` / `ResourceStateType`
- `Sex` / `SexSchema` / `SexType`
- `SportName` / `SportNameSchema` / `SportType`
- `FollowerStatus` / `FollowerStatusSchema` / `FollowerStatusType`
- `UnitSystem` / `UnitSystemSchema` / `UnitSystemType`
- `StreamKeys` / `StreamTypeSchema` / `StreamType`
- `StreamResolution` / `StreamResolutionSchema` / `StreamResolutionType`

## Advanced Usage

### Partial Validation

For cases where you only care about certain fields:

```typescript
import { SummaryActivitySchema } from '@jpravetz/strava-schema';
import { z } from 'zod';

// Pick only the fields you need
const MinimalActivitySchema = SummaryActivitySchema.pick({
  id: true,
  name: true,
  distance: true,
});

type MinimalActivity = z.infer<typeof MinimalActivitySchema>;
```

### Custom Validation

```typescript
import { SummaryActivitySchema } from '@jpravetz/strava-schema';
import { z } from 'zod';

// Add custom validation
const ValidatedActivitySchema = SummaryActivitySchema.refine(
  (data) => data.distance >= 0,
  { message: 'Distance must be non-negative' }
);
```

### Type Guards for Interface Types

For segment types (which use TypeScript interfaces):

```typescript
import { isSummarySegment, SummarySegment } from '@jpravetz/strava-schema';

if (isSummarySegment(data)) {
  // data is now typed as SummarySegment
  console.log(`Segment: ${data.name}, Distance: ${data.distance}m`);
}
```

## Package Structure

```
src/
├── mod.ts              # Main exports
└── schema/
    ├── mod.ts          # Schema re-exports
    ├── activity.ts     # Activity schemas
    ├── athlete.ts      # Athlete schemas
    ├── consts.ts       # Constants and enums
    ├── gear.ts         # Gear schemas
    ├── photo.ts        # Photo schemas
    ├── segment.ts      # Segment types (interfaces)
    ├── stream.ts       # Stream schemas
    ├── types.ts        # Base types
    └── zones.ts        # Zone schemas
```

## API Reference

All schemas and types are derived from the official
[Strava API Documentation](https://developers.strava.com/docs/reference/).

## Related Packages

- `@jpravetz/strava-api` - API client implementation (separate package)

## License

MIT
