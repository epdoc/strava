# @jpravetz/strava-schema

Zod schemas and TypeScript types for the Strava API.

## Overview

This package provides runtime validation schemas (using [Zod](https://zod.dev)) and inferred
TypeScript types for all Strava API data structures. Use this package to validate API responses and
ensure type safety when working with Strava data.

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

### Using Namespaces (Recommended)

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Validate activity data
const result = Schema.Activity.Detailed.safeParse(apiResponse);
if (result.success) {
  const activity: Schema.Activity.DetailedType = result.data;
  console.log(`Activity: ${activity.name}, Distance: ${activity.distance}m`);
} else {
  console.error('Validation failed:', result.error.format());
}

// Validate athlete data
const athleteResult = Schema.Athlete.Detailed.safeParse(athleteResponse);

// Check activity type
if (activity.type === Schema.Consts.ActivityName.Ride) {
  // Handle ride
}
```

### Using Sub-Path Imports (Tree-Shakable)

```typescript
import * as Activity from '@jpravetz/strava-schema/activity';

const result = Activity.Detailed.safeParse(apiResponse);
if (result.success) {
  console.log(result.data.name);
}
```

### Available Namespaces

| Namespace         | Import Path                        | Description                                             |
| ----------------- | ---------------------------------- | ------------------------------------------------------- |
| `Schema.Activity` | `@jpravetz/strava-schema/activity` | Activity schemas (Detailed, Summary, Stats, etc.)       |
| `Schema.Athlete`  | `@jpravetz/strava-schema/athlete`  | Athlete schemas (Detailed, Summary, Club, etc.)         |
| `Schema.Segment`  | `@jpravetz/strava-schema/segment`  | Segment types (Summary, Detailed, Explorer)             |
| `Schema.Gear`     | `@jpravetz/strava-schema/gear`     | Gear schemas (Detailed, Summary)                        |
| `Schema.Stream`   | `@jpravetz/strava-schema/stream`   | Stream schemas (Data, LatLng, Set)                      |
| `Schema.Zones`    | `@jpravetz/strava-schema/zones`    | Zone schemas (HeartRate, Power, Range)                  |
| `Schema.Consts`   | `@jpravetz/strava-schema/consts`   | Constants and enums (ActivityName, ResourceState, etc.) |
| `Schema.Types`    | `@jpravetz/strava-schema/types`    | Base types (StravaLongInt, MetaAthlete, etc.)           |

## Namespace API Reference

### Activity Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Schemas
Schema.Activity.Detailed; // DetailedActivitySchema
Schema.Activity.Summary; // SummaryActivitySchema
Schema.Activity.Id; // ActivityIdSchema
Schema.Activity.Stats; // ActivityStatsSchema
Schema.Activity.Total; // ActivityTotalSchema
Schema.Activity.Zone; // ActivityZoneSchema
Schema.Activity.Lap; // LapSchema
Schema.Activity.Split; // SplitSchema
Schema.Activity.PolylineMap; // PolylineMapSchema
Schema.Activity.TimedZoneRange; // TimedZoneRangeSchema
Schema.Activity.ExternalId; // ExternalIdSchema
Schema.Activity.UploadId; // UploadIdSchema

// Types
Schema.Activity.DetailedType; // DetailedActivity
Schema.Activity.SummaryType; // SummaryActivity
Schema.Activity.IdType; // ActivityId
Schema.Activity.StatsType; // ActivityStats
Schema.Activity.TotalType; // ActivityTotal
Schema.Activity.ZoneType; // ActivityZone
Schema.Activity.LapType; // Lap
Schema.Activity.SplitType; // Split
Schema.Activity.PolylineMapType; // PolylineMap
Schema.Activity.TimedZoneRangeType; // TimedZoneRange
Schema.Activity.ExternalIdType; // ExternalId
Schema.Activity.UploadIdType; // UploadId
```

### Athlete Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Schemas
Schema.Athlete.Detailed; // DetailedAthleteSchema
Schema.Athlete.Summary; // SummaryAthleteSchema
Schema.Athlete.Id; // AthleteIdSchema
Schema.Athlete.Club; // SummaryClubSchema
Schema.Athlete.Comment; // CommentSchema

// Types
Schema.Athlete.DetailedType; // DetailedAthlete
Schema.Athlete.SummaryType; // SummaryAthlete
Schema.Athlete.IdType; // AthleteId
Schema.Athlete.ClubType; // SummaryClub
Schema.Athlete.CommentType; // Comment
```

### Segment Namespace

Note: Segment types use TypeScript interfaces due to circular dependencies.

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Schemas
Schema.Segment.Id; // SegmentIdSchema
Schema.Segment.Name; // SegmentNameSchema
Schema.Segment.EffortId; // EffortIdSchema
Schema.Segment.Achievement; // AchievementSchema
Schema.Segment.Explorer; // ExplorerSegmentSchema

// Types (interfaces)
Schema.Segment.SummaryType; // SummarySegment
Schema.Segment.SummaryEffortType; // SummarySegmentEffort
Schema.Segment.DetailedType; // DetailedSegment
Schema.Segment.DetailedEffortType; // DetailedSegmentEffort
Schema.Segment.ExplorerType; // ExplorerSegment
Schema.Segment.IdType; // SegmentId
Schema.Segment.NameType; // SegmentName
Schema.Segment.EffortIdType; // EffortId
Schema.Segment.AchievementType; // Achievement

// Type guards
Schema.Segment.isSummarySegment; // (value: unknown) => value is SummarySegment
Schema.Segment.isSummarySegmentEffort; // (value: unknown) => value is SummarySegmentEffort
```

### Gear Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Schemas
Schema.Gear.Detailed; // DetailedGearSchema
Schema.Gear.Summary; // SummaryGearSchema
Schema.Gear.Id; // GearIdSchema

// Types
Schema.Gear.DetailedType; // DetailedGear
Schema.Gear.SummaryType; // SummaryGear
Schema.Gear.IdType; // GearId
```

### Stream Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Schemas
Schema.Stream.Data; // StreamSchema
Schema.Stream.LatLng; // LatLngStreamSchema
Schema.Stream.Set; // StreamSetSchema

// Types
Schema.Stream.DataType; // Stream
Schema.Stream.LatLngType; // LatLngStream
Schema.Stream.SetType; // StreamSet
```

### Zones Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Schemas
Schema.Zones.All; // ZonesSchema
Schema.Zones.HeartRate; // HeartRateZoneRangesSchema
Schema.Zones.Power; // PowerZoneRangesSchema
Schema.Zones.Range; // ZoneRangeSchema

// Types
Schema.Zones.AllType; // Zones
Schema.Zones.HeartRateType; // HeartRateZoneRanges
Schema.Zones.PowerType; // PowerZoneRanges
Schema.Zones.RangeType; // ZoneRange
```

### Consts Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Constants
Schema.Consts.ActivityName; // { Ride: 'Ride', Run: 'Run', ... }
Schema.Consts.ActivityZoneDefs; // { Heartrate: 'heartrate', ... }
Schema.Consts.FollowerStatus; // { Pending: 'pending', ... }
Schema.Consts.ResourceState; // { Meta: 1, Summary: 2, Detail: 3 }
Schema.Consts.Sex; // { Female: 'F', Male: 'M' }
Schema.Consts.SportName; // { Cycling: 'cycling', ... }
Schema.Consts.StreamKeys; // { Time: 'time', Distance: 'distance', ... }
Schema.Consts.StreamResolution; // { Low: 'low', Medium: 'medium', High: 'high' }
Schema.Consts.StreamSeriesType; // { Distance: 'distance', Time: 'time' }
Schema.Consts.UnitSystem; // { Feet: 'feet', Meters: 'meters' }

// Schemas
Schema.Consts.ActivityNameSchema; // Zod enum schema
Schema.Consts.ActivityZoneTypeSchema; // Zod enum schema
Schema.Consts.FollowerStatusSchema; // Zod enum schema
Schema.Consts.ResourceStateSchema; // Zod union schema
Schema.Consts.SexSchema; // Zod enum schema
Schema.Consts.SportNameSchema; // Zod enum schema
Schema.Consts.StreamTypeSchema; // Zod enum schema
Schema.Consts.StreamResolutionSchema; // Zod enum schema
Schema.Consts.StreamSeriesTypeSchema; // Zod enum schema
Schema.Consts.UnitSystemSchema; // Zod enum schema

// Types
Schema.Consts.ActivityType; // 'Ride' | 'Run' | ...
Schema.Consts.ActivityZoneType; // 'heartrate' | 'power'
Schema.Consts.FollowerStatusType; // 'pending' | 'accepted' | 'blocked'
Schema.Consts.ResourceStateType; // 1 | 2 | 3
Schema.Consts.SexType; // 'F' | 'M'
Schema.Consts.SportType; // 'cycling' | 'running' | ...
Schema.Consts.StreamType; // 'time' | 'distance' | ...
Schema.Consts.StreamResolutionType; // 'low' | 'medium' | 'high'
Schema.Consts.StreamSeriesTypeAlias; // 'distance' | 'time'
Schema.Consts.UnitSystemType; // 'feet' | 'meters'
```

### Types Namespace

```typescript
import * as Schema from '@jpravetz/strava-schema';

// Schemas
Schema.Types.StravaLongIntSchema; // ZodNumber
Schema.Types.MetaAthleteSchema; // Meta athlete schema
Schema.Types.MetaActivitySchema; // Meta activity schema

// Types
Schema.Types.StravaLongIntType; // number
Schema.Types.MetaAthleteType; // MetaAthlete
Schema.Types.MetaActivityType; // MetaActivity
Schema.Types.ActivityType; // ActivityType
Schema.Types.FollowerStatusType; // FollowerStatusType
Schema.Types.ResourceStateType; // ResourceStateType
Schema.Types.SexType; // SexType
Schema.Types.SportType; // SportType
Schema.Types.StreamKeyType; // StreamKeyType
Schema.Types.UnitSystemType; // UnitSystemType
```

## Advanced Usage

### Partial Validation

```typescript
import * as Activity from '@jpravetz/strava-schema/activity';
import { z } from '@zod/zod';

// Pick only the fields you need
const MinimalActivitySchema = Activity.Detailed.pick({
  id: true,
  name: true,
  distance: true,
});

type MinimalActivity = z.infer<typeof MinimalActivitySchema>;
```

### Custom Validation

```typescript
import * as Activity from '@jpravetz/strava-schema/activity';

// Add custom validation
const ValidatedActivitySchema = Activity.Detailed.refine(
  (data) => data.distance >= 0,
  { message: 'Distance must be non-negative' },
);
```

### Type Guards for Segment Types

```typescript
import * as Segment from '@jpravetz/strava-schema/segment';

if (Segment.isSummarySegment(data)) {
  // data is now typed as SummarySegment
  console.log(`Segment: ${data.name}, Distance: ${data.distance}m`);
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
└── schema/
    ├── mod.ts          # Internal re-exports (not for public use)
    ├── activity.ts     # Activity Zod schemas
    ├── athlete.ts      # Athlete Zod schemas
    ├── consts.ts       # Constants and enums
    ├── gear.ts         # Gear Zod schemas
    ├── photo.ts        # Photo Zod schemas
    ├── segment.ts      # Segment types (interfaces)
    ├── stream.ts       # Stream Zod schemas
    ├── types.ts        # Base types
    └── zones.ts        # Zone Zod schemas
```

## API Reference

All schemas and types are derived from the official
[Strava API Documentation](https://developers.strava.com/docs/reference/).

## Related Packages

- `@jpravetz/strava-api` - API client implementation (separate package)

## License

MIT
