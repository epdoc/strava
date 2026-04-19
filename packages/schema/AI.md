# @jpravetz/strava-schema - AI Documentation

## Package Overview

This package provides **Zod schemas and TypeScript types** for the Strava API. It uses a hybrid
approach:

- **Zod schemas** for runtime validation and type inference
- **TypeScript interfaces** for complex types with circular dependencies (e.g., SummarySegment ↔
  SummarySegmentEffort)

## Architecture

### Directory Structure

```
src/
├── mod.ts              # Main exports - re-exports from schema/
└── schema/
    ├── mod.ts          # Central export point for all schemas
    ├── activity.ts     # Activity schemas (SummaryActivity, DetailedActivity, etc.)
    ├── athlete.ts      # Athlete schemas (SummaryAthlete, DetailedAthlete, etc.)
    ├── consts.ts       # Constants and enums (ActivityName, ResourceState, etc.)
    ├── gear.ts         # Gear schemas (SummaryGear, DetailedGear)
    ├── photo.ts        # Photo schemas (PhotoSummary)
    ├── segment.ts      # Segment schemas (hybrid approach with interfaces)
    ├── stream.ts       # Stream schemas (Stream, LatLngStream, StreamSet)
    ├── types.ts        # Base types (StravaLongInt, MetaAthlete, MetaActivity)
    └── zones.ts        # Zone schemas (Zones, ZoneRange, etc.)
```

### Design Patterns

#### 1. Schema-First with Type Inference

All types are inferred from Zod schemas:

```typescript
// schema/activity.ts
export const SummaryActivitySchema = z.object({
  id: ActivityIdSchema,
  name: z.string(),
  // ...
});

// Type is inferred from schema
export type SummaryActivity = z.infer<typeof SummaryActivitySchema>;
```

#### 2. Hybrid Approach for Circular Dependencies

Segment types have circular references (Segment ↔ SegmentEffort). These use TypeScript interfaces:

```typescript
// schema/segment.ts
export interface SummarySegmentEffort {
  id: EffortId;
  segment?: SummarySegment; // Circular reference
  // ...
}

export interface SummarySegment {
  id: SegmentId;
  athlete_pr_effort?: SummarySegmentEffort; // Circular reference
  // ...
}
```

#### 3. Explicit Type Annotations for JSR

All exported schemas have explicit Zod type annotations for JSR publishing:

```typescript
export const ActivityNameSchema: z.ZodEnum<[...]> = z.enum([...]);
export const SummaryActivitySchema: z.ZodObject<...> = z.object({...});
```

## Usage Examples

### Validating API Responses

```typescript
import { DetailedActivity, SummaryActivitySchema } from '@jpravetz/strava-schema';

const response = await fetch('https://www.strava.com/api/v3/activities/12345', {
  headers: { Authorization: `Bearer ${token}` },
});

const data = await response.json();
const result = SummaryActivitySchema.safeParse(data);

if (result.success) {
  const activity: DetailedActivity = result.data;
  console.log(`${activity.name}: ${activity.distance}m`);
} else {
  console.error('Validation failed:', result.error.format());
}
```

### Using Types

```typescript
import { ActivityType, SummaryActivity } from '@jpravetz/strava-schema';

function processActivity(activity: SummaryActivity): void {
  console.log(`Activity: ${activity.name}`);
  console.log(`Type: ${activity.type}`);
  console.log(`Distance: ${activity.distance}m`);
}
```

### Type Guards

For interface-based types, use the provided type guards:

```typescript
import { isSummarySegment, SummarySegment } from '@jpravetz/strava-schema';

if (isSummarySegment(data)) {
  // data is now typed as SummarySegment
  console.log(data.name);
}
```

## Key Files

| File          | Purpose                    | Key Exports                                                               |
| ------------- | -------------------------- | ------------------------------------------------------------------------- |
| `consts.ts`   | Constants and enums        | `ActivityName`, `ActivityNameSchema`, `ResourceState`, `Sex`, `SportName` |
| `activity.ts` | Activity types             | `SummaryActivitySchema`, `DetailedActivitySchema`, `ActivityStats`, `Lap` |
| `athlete.ts`  | Athlete types              | `SummaryAthleteSchema`, `DetailedAthleteSchema`, `SummaryClub`            |
| `segment.ts`  | Segment types (interfaces) | `SummarySegment`, `SummarySegmentEffort`, `DetailedSegment`               |
| `gear.ts`     | Gear types                 | `SummaryGearSchema`, `DetailedGearSchema`                                 |
| `stream.ts`   | Stream types               | `StreamSchema`, `LatLngStreamSchema`, `StreamSetSchema`                   |
| `zones.ts`    | Zone types                 | `ZonesSchema`, `ZoneRangeSchema`                                          |

## Dependencies

- `zod` - Runtime validation and type inference
- `@epdoc/datetime` - ISO date types
- `@epdoc/duration` - Duration types
- `@epdoc/type` - Utility types (Integer, Dict, etc.)

## Development

### Running Tests

```bash
deno task test
```

### Type Checking

```bash
deno task check
```

### Linting

```bash
deno task lint
```

### Full Validation

```bash
deno task ok  # Runs fmt, lint, check, test, docs
```

## Notes

- This package is for **schemas only** - no API client implementation
- All Zod schemas have explicit type annotations for JSR publishing
- Circular dependencies in segment types use TypeScript interfaces
- Types are always inferred from schemas (single source of truth)
