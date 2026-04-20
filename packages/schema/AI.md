# @jpravetz/strava-schema - AI Documentation

## Package Overview

This package provides **TypeScript types and lightweight type guards** for the Strava API. Unlike the previous Zod-based implementation, this version uses pure TypeScript interfaces with minimal runtime validation for better performance and cleaner code.

## Architecture

### Directory Structure

```
src/
├── mod.ts              # Main exports - namespaces
├── activity.ts         # Activity namespace
├── athlete.ts          # Athlete namespace
├── consts.ts           # Constants and enums namespace
├── gear.ts             # Gear namespace
├── segment.ts          # Segment namespace
├── stream.ts           # Stream namespace
├── types.ts            # Types namespace (flat export)
├── zones.ts            # Zones namespace
├── types/              # TypeScript interfaces
│   ├── index.ts        # Re-export all types
│   ├── core.ts         # Basic types, enums, common interfaces
│   ├── activity.ts     # Activity interfaces
│   ├── athlete.ts      # Athlete interfaces
│   ├── gear.ts         # Gear interfaces
│   ├── segment.ts      # Segment interfaces
│   ├── stream.ts       # Stream interfaces
│   └── zones.ts        # Zone interfaces
└── guards/             # Type guard functions
    ├── index.ts        # Re-export all guards
    ├── core.ts         # Basic guards (isStravaId, isActivityType, etc.)
    ├── activity.ts     # Activity guards
    ├── athlete.ts      # Athlete guards
    ├── segment.ts      # Segment guards
    └── stream.ts       # Stream guards
```

### Design Patterns

#### 1. Interface-First Design

All types are defined as TypeScript interfaces:

```typescript
// types/activity.ts
export interface SummaryActivity {
  id: ActivityId;
  name: string;
  distance: number;
  // ...
}

export interface DetailedActivity extends SummaryActivity {
  description: string | null;
  calories: number;
  // ...
}
```

#### 2. Type Aliases for ID Types

ID types are simple aliases for clarity:

```typescript
// types/core.ts
export type StravaId = number;
export type ActivityId = number;
export type AthleteId = number;
export type SegmentId = number;
export type GearId = string;
```

#### 3. Lightweight Type Guards

Type guards perform minimal runtime validation:

```typescript
// guards/activity.ts
export function isSummaryActivity(value: unknown): value is SummaryActivity {
  return isDict(value) &&
    isActivityId(value.id) &&
    typeof value.name === 'string' &&
    typeof value.distance === 'number';
}

export function isDetailedActivity(value: unknown): value is DetailedActivity {
  return isSummaryActivity(value) &&
    typeof (value as DetailedActivity).calories === 'number';
}
```

#### 4. Circular Dependencies Handled Naturally

TypeScript interfaces handle circular references without issues:

```typescript
// types/segment.ts
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

#### 5. Hierarchical Namespaces

Types and guards are organized into namespaces for clean imports:

```typescript
// activity.ts (namespace file)
export type {
  DetailedActivity as Detailed,
  SummaryActivity as Summary,
  ActivityId as Id,
  // ...
} from './types/activity.ts';

export {
  isDetailedActivity as isDetailed,
  isSummaryActivity as isSummary,
  // ...
} from './guards/activity.ts';
```

## Usage Examples

### Type Guard Validation

```typescript
import * as Activity from '@jpravetz/strava-schema/activity';

const response = await fetch('https://www.strava.com/api/v3/activities/12345', {
  headers: { Authorization: `Bearer ${token}` },
});

const data = await response.json();

if (Activity.isDetailed(data)) {
  // TypeScript knows data is DetailedActivity here
  console.log(`${data.name}: ${data.distance}m`);
  console.log(`Calories: ${data.calories}`);
} else if (Activity.isSummary(data)) {
  // TypeScript knows data is SummaryActivity here
  console.log(`${data.name}: ${data.distance}m`);
} else {
  console.error('Invalid activity data');
}
```

### Using Types Directly

```typescript
import * as Schema from '@jpravetz/strava-schema';

function processActivity(activity: Schema.Activity.Summary): void {
  console.log(`Activity: ${activity.name}`);
  console.log(`Type: ${activity.type}`);
  console.log(`Distance: ${activity.distance}m`);
}

// Or import specific namespace
import * as Activity from '@jpravetz/strava-schema/activity';

function processActivity(activity: Activity.Summary): void {
  // ...
}
```

### Validating Arrays

```typescript
import * as Activity from '@jpravetz/strava-schema/activity';

const activities: unknown[] = await fetchActivities();

if (Activity.isSummaryArray(activities)) {
  // activities is now SummaryActivity[]
  activities.forEach(activity => {
    console.log(activity.name); // TypeScript knows this is safe
  });
}
```

### Using Constants

```typescript
import * as Consts from '@jpravetz/strava-schema/consts';

if (activity.type === Consts.ActivityName.Ride) {
  // Handle ride
}

// Or check if it's a known type
if (Consts.isKnownActivityType(activity.type)) {
  // activity.type is narrowed to known ActivityType
}
```

## Key Files

| File | Purpose | Key Exports |
|------|---------|-------------|
| `consts.ts` | Constants and enums | `ActivityName`, `StreamKeys`, `isStravaId`, `isActivityType` |
| `activity.ts` | Activity namespace | `Summary`, `Detailed`, `isSummary`, `isDetailed` |
| `athlete.ts` | Athlete namespace | `Summary`, `Detailed`, `isSummary`, `isDetailed` |
| `segment.ts` | Segment namespace | `Summary`, `Detailed`, `isSummary`, `isDetailed` |
| `gear.ts` | Gear namespace | `Summary`, `Detailed`, `Id` |
| `stream.ts` | Stream namespace | `Data`, `LatLng`, `Set`, `isData`, `isLatLng` |
| `zones.ts` | Zones namespace | `Zones`, `HeartRate`, `Power`, `Range` |

## Dependencies

- `@epdoc/type` - Utility types and type guards (isDict, isString, etc.)

## Migration from Zod

If migrating from the previous Zod-based version:

### Before (Zod):
```typescript
import * as Activity from '@jpravetz/strava-schema/activity';

const result = Activity.Detailed.safeParse(apiResponse);
if (result.success) {
  const activity = result.data;
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

| Old (Zod) | New (TypeScript) |
|-----------|------------------|
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

- This package is for **types only** - no API client implementation
- Type guards validate only critical fields (fast, minimal overhead)
- All types are plain TypeScript interfaces (no Zod dependency)
- Circular dependencies in segment types work naturally with interfaces
- JSR-publishable with no "slow types" warnings
