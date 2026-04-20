# @jpravetz/strava-schema

TypeScript types and type guards for the Strava API.

## Overview

This package provides TypeScript interfaces and lightweight runtime type guards for all Strava API data structures. Use this package to ensure type safety when working with Strava data.

Unlike the previous Zod-based implementation, this version uses pure TypeScript interfaces with minimal runtime validation for better performance and cleaner code.

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

### Using Namespaces (Recommended)

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Type guard for activity data
if (Schema.Activity.isDetailed(apiResponse)) {
  const activity: Schema.Activity.Detailed = apiResponse;
  console.log(`Activity: ${activity.name}, Distance: ${activity.distance}m`);
}

// Type guard for athlete data
if (Schema.Athlete.isDetailed(athleteResponse)) {
  console.log(`Athlete: ${athleteResponse.firstname}`);
}

// Check activity type
if (activity.type === Schema.Consts.ActivityName.Ride) {
  // Handle ride
}
```

### Using Sub-Path Imports (Tree-Shakable)

```typescript
import * as Activity from '@jpravetz/strava-schema/activity';

if (Activity.isDetailed(apiResponse)) {
  console.log(apiResponse.name);
}
```

### Available Namespaces

| Namespace         | Import Path                        | Description                                             |
| ----------------- | ---------------------------------- | ------------------------------------------------------- |
| `Schema.Activity` | `@jpravetz/strava-schema/activity` | Activity types (Detailed, Summary, Stats, etc.)         |
| `Schema.Athlete`  | `@jpravetz/strava-schema/athlete`  | Athlete types (Detailed, Summary, Club, etc.)           |
| `Schema.Segment`  | `@jpravetz/strava-schema/segment`  | Segment types (Summary, Detailed, Explorer)             |
| `Schema.Gear`     | `@jpravetz/strava-schema/gear`     | Gear types (Detailed, Summary)                          |
| `Schema.Stream`   | `@jpravetz/strava-schema/stream`   | Stream types (Data, LatLng, Set)                        |
| `Schema.Zones`    | `@jpravetz/strava-schema/zones`    | Zone types (HeartRate, Power, Range)                    |
| `Schema.Consts`   | `@jpravetz/strava-schema/consts`   | Constants and enums (ActivityName, ResourceState, etc.) |
| `Schema.Types`    | `@jpravetz/strava-schema/types`    | Base types (StravaId, MetaAthlete, etc.)                |

## Namespace API Reference

### Activity Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Types
Schema.Activity.Detailed;      // DetailedActivity interface
Schema.Activity.Summary;       // SummaryActivity interface
Schema.Activity.Id;            // ActivityId (number alias)
Schema.Activity.Stats;         // ActivityStats interface
Schema.Activity.Total;         // ActivityTotal interface
Schema.Activity.Zone;          // ActivityZone interface
Schema.Activity.Lap;           // Lap interface
Schema.Activity.Split;         // Split interface
Schema.Activity.Photo;         // PhotoSummary interface
Schema.Activity.ExternalId;    // ExternalId (string)
Schema.Activity.UploadId;      // UploadId (number | null)

// Type guards
Schema.Activity.isDetailed;    // (value: unknown) => value is DetailedActivity
Schema.Activity.isSummary;     // (value: unknown) => value is SummaryActivity
Schema.Activity.isDetailedArray; // (value: unknown) => value is DetailedActivity[]
Schema.Activity.isSummaryArray;  // (value: unknown) => value is SummaryActivity[]
Schema.Activity.isLap;         // (value: unknown) => value is Lap
Schema.Activity.isSplit;       // (value: unknown) => value is Split
Schema.Activity.isPhoto;       // (value: unknown) => value is PhotoSummary
```

### Athlete Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Types
Schema.Athlete.Detailed;       // DetailedAthlete interface
Schema.Athlete.Summary;        // SummaryAthlete interface
Schema.Athlete.Id;             // AthleteId (number alias)
Schema.Athlete.Club;           // SummaryClub interface

// Type guards
Schema.Athlete.isDetailed;     // (value: unknown) => value is DetailedAthlete
Schema.Athlete.isSummary;      // (value: unknown) => value is SummaryAthlete
Schema.Athlete.isSummaryArray; // (value: unknown) => value is SummaryAthlete[]
Schema.Athlete.isClub;         // (value: unknown) => value is SummaryClub
```

### Segment Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Types
Schema.Segment.Detailed;       // DetailedSegment interface
Schema.Segment.DetailedEffort; // DetailedSegmentEffort interface
Schema.Segment.Explorer;       // ExplorerSegment interface
Schema.Segment.Summary;        // SummarySegment interface
Schema.Segment.SummaryEffort;  // SummarySegmentEffort interface
Schema.Segment.Name;           // SegmentName (string alias)
Schema.Segment.Id;             // SegmentId (number alias)

// Type guards
Schema.Segment.isDetailed;          // (value: unknown) => value is DetailedSegment
Schema.Segment.isDetailedEffort;    // (value: unknown) => value is DetailedSegmentEffort
Schema.Segment.isDetailedEffortArray; // (value: unknown) => value is DetailedSegmentEffort[]
Schema.Segment.isExplorer;          // (value: unknown) => value is ExplorerSegment
Schema.Segment.isSummary;           // (value: unknown) => value is SummarySegment
Schema.Segment.isSummaryArray;      // (value: unknown) => value is SummarySegment[]
Schema.Segment.isSummaryEffort;     // (value: unknown) => value is SummarySegmentEffort
```

### Gear Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Types
Schema.Gear.Detailed;          // DetailedGear interface
Schema.Gear.Summary;           // SummaryGear interface
Schema.Gear.Id;                // GearId (string alias)

// Type guards
Schema.Gear.isId;              // (value: unknown) => value is GearId
```

### Stream Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Types
Schema.Stream.Data;            // DataStream interface
Schema.Stream.LatLng;          // LatLngStream interface
Schema.Stream.Set;             // StreamSet interface
Schema.StreamKey;              // Union of stream keys

// Type guards
Schema.Stream.isData;          // (value: unknown) => value is DataStream
Schema.Stream.isLatLng;        // (value: unknown) => value is LatLngStream
Schema.Stream.isStream;        // (value: unknown) => value is Stream
Schema.Stream.isSet;           // (value: unknown) => value is StreamSet
Schema.Stream.hasLatLng;       // (value: StreamSet) => value is StreamSet & { latlng: LatLngStream }
```

### Zones Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Types
Schema.Zones.Zones;            // Zones interface
Schema.Zones.HeartRate;        // HeartRateZoneRanges interface
Schema.Zones.Power;            // PowerZoneRanges interface
Schema.Zones.Range;            // ZoneRange interface
```

### Consts Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Constants
Schema.Consts.ActivityName;    // { Ride: 'Ride', Run: 'Run', ... }
Schema.Consts.StreamKeys;      // { Time: 'time', Distance: 'distance', ... }

// Types
Schema.Consts.ActivityType;    // 'Ride' | 'Run' | ...
Schema.Consts.ActivityZoneType; // 'heartrate' | 'power'
Schema.Consts.FollowerStatus;  // 'pending' | 'accepted' | 'blocked'
Schema.Consts.ResourceState;   // 1 | 2 | 3
Schema.Consts.Sex;             // 'F' | 'M'
Schema.Consts.SportType;       // 'cycling' | 'running' | ...
Schema.Consts.StreamType;      // 'time' | 'distance' | ...
Schema.Consts.StreamResolution; // 'low' | 'medium' | 'high'
Schema.Consts.StreamSeriesType; // 'distance' | 'time'
Schema.Consts.UnitSystem;      // 'feet' | 'meters'
Schema.Consts.StravaId;        // number
Schema.Consts.ActivityId;      // number
Schema.Consts.AthleteId;       // number
Schema.Consts.SegmentId;       // number

// Type guards
Schema.Consts.isStravaId;      // (value: unknown) => value is StravaId
Schema.Consts.isActivityId;    // (value: unknown) => value is ActivityId
Schema.Consts.isAthleteId;     // (value: unknown) => value is AthleteId
Schema.Consts.isSegmentId;     // (value: unknown) => value is SegmentId
Schema.Consts.isGearId;        // (value: unknown) => value is GearId
Schema.Consts.isActivityType;  // (value: unknown) => value is string
Schema.Consts.isKnownActivityType; // (value: unknown) => value is known ActivityType
Schema.Consts.isSex;           // (value: unknown) => value is Sex
Schema.Consts.isResourceState; // (value: unknown) => value is ResourceState
Schema.Consts.isSportType;     // (value: unknown) => value is SportType
Schema.Consts.isStreamType;    // (value: unknown) => value is StreamType
Schema.Consts.isUnitSystem;    // (value: unknown) => value is UnitSystem
```

### Types Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Core types
Schema.Types.StravaId;         // number
Schema.Types.ActivityId;       // number
Schema.Types.AthleteId;        // number
Schema.Types.SegmentId;        // number
Schema.Types.ActivityType;     // Union of activity types
Schema.Types.Sex;              // 'F' | 'M'
Schema.Types.ResourceState;    // 1 | 2 | 3
Schema.Types.SportType;        // 'cycling' | 'running' | ...
Schema.Types.StreamType;       // 'time' | 'distance' | ...
Schema.Types.UnitSystem;       // 'feet' | 'meters'
Schema.Types.StreamResolution; // 'low' | 'medium' | 'high'
Schema.Types.StreamSeriesType; // 'distance' | 'time'

// Common interfaces
Schema.Types.TimedZoneRange;   // TimedZoneRange interface
Schema.Types.PolylineMap;      // PolylineMap interface
Schema.Types.MetaAthlete;      // MetaAthlete interface
Schema.Types.MetaActivity;     // MetaActivity interface
Schema.Types.Achievement;      // Achievement interface
```

## Advanced Usage

### Type Guards

Type guards perform lightweight runtime validation to ensure data matches expected shapes:

```typescript
import * as Activity from '@jpravetz/strava-schema/activity';
import * as Consts from '@jpravetz/strava-schema/consts';

// Validate an unknown value
function processActivity(data: unknown) {
  if (Activity.isDetailed(data)) {
    // TypeScript knows data is DetailedActivity here
    console.log(`Activity: ${data.name}`);
    console.log(`Calories: ${data.calories}`);
  } else if (Activity.isSummary(data)) {
    // TypeScript knows data is SummaryActivity here
    console.log(`Activity: ${data.name}`);
  } else {
    console.error('Invalid activity data');
  }
}

// Validate arrays
function processActivities(data: unknown[]) {
  if (Activity.isSummaryArray(data)) {
    // data is SummaryActivity[]
    data.forEach(activity => {
      console.log(activity.name);
    });
  }
}

// Validate core types
function validateId(id: unknown): number {
  if (Consts.isStravaId(id)) {
    return id; // TypeScript knows id is number here
  }
  throw new Error('Invalid ID');
}
```

### Combining Type Guards

```typescript
import * as Schema from '@jpravetz/strava-schema';

function validateStravaData(data: unknown) {
  if (Schema.Activity.isDetailed(data)) {
    return { type: 'activity', data };
  }
  if (Schema.Athlete.isDetailed(data)) {
    return { type: 'athlete', data };
  }
  if (Schema.Segment.isSummary(data)) {
    return { type: 'segment', data };
  }
  throw new Error('Unknown data type');
}
```

## Package Structure

```
src/
├── mod.ts              # Root exports - namespaces
├── activity.ts         # Activity namespace exports
├── athlete.ts          # Athlete namespace exports
├── consts.ts           # Consts namespace exports
├── gear.ts             # Gear namespace exports
├── segment.ts          # Segment namespace exports
├── stream.ts           # Stream namespace exports
├── types.ts            # Types namespace exports
├── zones.ts            # Zones namespace exports
├── types/              # TypeScript interfaces
│   ├── index.ts
│   ├── core.ts
│   ├── activity.ts
│   ├── athlete.ts
│   ├── gear.ts
│   ├── segment.ts
│   ├── stream.ts
│   └── zones.ts
└── guards/             # Type guard functions
    ├── index.ts
    ├── core.ts
    ├── activity.ts
    ├── athlete.ts
    ├── segment.ts
    └── stream.ts
```

## Migration from Zod-based Version

If you're migrating from the previous Zod-based version:

### Before (Zod):
```typescript
import * as Activity from '@jpravetz/strava-schema/activity';

const result = Activity.Detailed.safeParse(apiResponse);
if (result.success) {
  const activity = result.data;
  console.log(activity.name);
}
```

### After (Type guards):
```typescript
import * as Activity from '@jpravetz/strava-schema/activity';

if (Activity.isDetailed(apiResponse)) {
  // apiResponse is typed as Activity.Detailed
  console.log(apiResponse.name);
}
```

### Type Name Changes

| Old Name              | New Name       |
| --------------------- | -------------- |
| `Activity.SummaryType` | `Activity.Summary` |
| `Activity.DetailedType` | `Activity.Detailed` |
| `Activity.IdType` | `Activity.Id` |
| `Athlete.SummaryType` | `Athlete.Summary` |
| `Athlete.DetailedType` | `Athlete.Detailed` |
| `Athlete.IdType` | `Athlete.Id` |
| `Segment.SummaryType` | `Segment.Summary` |
| `Segment.IdType` | `Segment.Id` |
| `Stream.DataType` | `Stream.Data` |
| `Stream.LatLngType` | `Stream.LatLng` |
| `Stream.SetType` | `Stream.Set` |

## API Reference

All types are derived from the official [Strava API Documentation](https://developers.strava.com/docs/reference/).

## Related Packages

- `@jpravetz/strava-api` - API client implementation (separate package)

## License

MIT
