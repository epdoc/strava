# @epdoc/strava-schema - AI Documentation

## Package Overview

This package provides **TypeScript types and lightweight type guards** for the Strava API. Unlike
the previous Zod-based implementation, this version uses pure TypeScript interfaces with minimal
runtime validation for better performance and cleaner code.

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
│   ├── mod.ts          # Re-export all types
│   ├── units.ts        # Semantic unit types (Metres, Seconds, etc.)
│   ├── core.ts         # Basic types, enums, common interfaces
│   ├── activity.ts     # Activity interfaces
│   ├── athlete.ts      # Athlete interfaces
│   ├── gear.ts         # Gear interfaces
│   ├── segment.ts      # Segment interfaces
│   ├── stream.ts       # Stream interfaces
│   └── zones.ts        # Zone interfaces
└── guards/             # Type guard functions
    ├── mod.ts          # Re-export all guards
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
  distance: Metres;
  moving_time: Seconds;
  // ...
}

export interface DetailedActivity extends SummaryActivity {
  description: string | null;
  calories: number;
  // ...
}
```

#### 2. Semantic Unit Types

All numeric values use semantic type aliases for self-documenting code:

```typescript
// types/units.ts
export type Metres = number;
export type Seconds = number;
export type BPM = number;
export type Watts = number;

// Usage in interfaces
export interface SummaryActivity {
  distance: Metres; // Clearly indicates meters
  moving_time: Seconds; // Clearly indicates seconds
  average_speed: MetresPerSecond;
  max_heartrate?: BPM;
  average_watts?: Watts;
}
```

**Benefits:**

- Code is self-documenting
- IDE tooltips show the unit
- Prevents mixing up different units
- Easier to find all places using a specific unit

#### 3. Type Aliases for ID Types

ID types are simple aliases for clarity:

```typescript
// types/core.ts
export type StravaId = Integer;
export type ActivityId = Integer;
export type AthleteId = Integer;
export type SegmentId = Integer;
export type GearId = string;
```

#### 4. Standard Code Types

Country and state codes use semantic types:

```typescript
// types/units.ts
export type CountryCode2 = string; // ISO 3166-1 alpha-2 (2-letter)
export type StateCode = string; // ISO 3166-2 state/province code

// Usage
export interface SummaryClub {
  country: CountryCode2; // "US", "CA", "GB"
  state: StateCode; // "CA", "ON"
}
```

#### 5. Timezone Handling

Strava uses a specific timezone format that must be handled carefully:

```typescript
// types/units.ts
export type Timezone = string;
/**
 * Format: "(GMT±HH:MM) IANA/Timezone_Name"
 * Example: "(GMT-06:00) America/Chicago"
 */

export type ISODateTime = string;
/**
 * UTC datetime with timezone: "2024-01-15T10:30:00Z"
 */

export type LocalDateTime = string;
/**
 * Local datetime WITHOUT timezone suffix: "2024-01-15T04:30:00"
 * Must be combined with the separate `timezone` field
 */

// Usage in activities
export interface SummaryActivity {
  start_date: ISODateTime; // UTC
  start_date_local: LocalDateTime; // No timezone suffix!
  timezone: Timezone; // Display format with IANA name
}
```

**Important**: To properly handle Strava datetimes, use `@epdoc/datetime`:

```typescript
import { DateTime } from '@epdoc/datetime';

const activity: SummaryActivity = ...;

// Combine local datetime with timezone info
const localTime = DateTime.from(activity.start_date_local)
  .withIANA(activity.timezone);
```

#### 6. Lightweight Type Guards

Type guards perform minimal runtime validation:

```typescript
// guards/activity.ts
export function isSummaryActivity(value: unknown): value is SummaryActivity {
  return isDict(value) &&
    isActivityId(value.id) &&
    typeof value.name === 'string' &&
    typeof value.distance === 'number' &&
    typeof value.moving_time === 'number';
}

export function isDetailedActivity(value: unknown): value is DetailedActivity {
  return isSummaryActivity(value) &&
    typeof (value as DetailedActivity).calories === 'number';
}
```

#### 7. Circular Dependencies Handled Naturally

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

#### 8. Hierarchical Namespaces

Types and guards are organized into namespaces for clean imports:

```typescript
// activity.ts (namespace file)
export type {
  ActivityId as Id,
  DetailedActivity as Detailed,
  SummaryActivity as Summary,
  // ...
} from './types/activity.ts';

export {
  isDetailedActivity as isDetailed,
  isSummaryActivity as isSummary,
  // ...
} from './guards/activity.ts';
```

## Semantic Unit Types Reference

All unit types are defined in `types/units.ts`:

### Distance

- `Metres` - Distance in meters (Strava's default unit)
- `Kilometres` - Distance in km
- `Miles` - Distance in miles
- `Feet` - Distance in feet

### Time

- `Seconds` - Time in seconds (Strava's default unit)
- `Minutes` - Time in minutes
- `Hours` - Time in hours

### Speed

- `MetresPerSecond` - Speed in m/s (Strava's default unit)
- `KPH` - Kilometers per hour
- `MPH` - Miles per hour

### Geographic

- `Latitude` - Latitude in decimal degrees (-90 to 90)
- `Longitude` - Longitude in decimal degrees (-180 to 180)
- `Altitude` - Elevation in meters

### Physiological

- `BPM` - Heart rate in beats per minute
- `Watts` - Power in watts
- `RPM` - Cadence in revolutions per minute
- `Celsius` - Temperature in Celsius
- `Fahrenheit` - Temperature in Fahrenheit

### Energy

- `Kilojoules` - Energy in kJ
- `Kilocalories` - Energy in kcal/Calories

### Weight

- `Kilograms` - Weight in kg
- `Pounds` - Weight in lb

### Date/Time Formats

- `ISODateTime` - ISO 8601 datetime with timezone
- `LocalDateTime` - Local datetime without timezone (Strava's format)
- `ISODate` - ISO 8601 date only (YYYY-MM-DD)
- `Timezone` - Strava's display format with GMT offset

### Codes & Identifiers

- `CountryCode2` - ISO 3166-1 alpha-2 country code
- `StateCode` - State/province code
- `Url` - URL string
- `Email` - Email address string
- `EncodedPolyline` - Google Maps polyline encoding

### From @epdoc/type

- `Integer` - Any integer value
- `WholeNumber` - Non-negative integer (0 or greater)
- `Index` - Array index position

## Usage Examples

### Type Guard Validation

```typescript
import * as Activity from '@epdoc/strava-schema/activity';

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

### Using Unit Types Directly

```typescript
import type { BPM, CountryCode2, Metres, Seconds, Watts } from '@epdoc/strava-schema/types/units';

// These type aliases make your code self-documenting
function calculatePace(distance: Metres, time: Seconds): MetresPerSecond {
  return distance / time;
}

function formatPower(power: Watts): string {
  return `${power}W`;
}

function getCountryName(code: CountryCode2): string {
  const names: Record<CountryCode2, string> = {
    US: 'United States',
    CA: 'Canada',
    GB: 'United Kingdom',
    // ...
  };
  return names[code] || 'Unknown';
}
```

### Using Types Directly

```typescript
import * as Schema from '@epdoc/strava-schema';

function processActivity(activity: Schema.Activity.Summary): void {
  console.log(`Activity: ${activity.name}`);
  console.log(`Type: ${activity.type}`);
  console.log(`Distance: ${activity.distance}m`);
  console.log(`Duration: ${activity.moving_time}s`);
}

// Or import specific namespace
import * as Activity from '@epdoc/strava-schema/activity';

function processActivity(activity: Activity.Summary): void {
  // ...
}
```

### Validating Arrays

```typescript
import * as Activity from '@epdoc/strava-schema/activity';

const activities: unknown[] = await fetchActivities();

if (Activity.isSummaryArray(activities)) {
  // activities is now SummaryActivity[]
  activities.forEach((activity) => {
    console.log(activity.name); // TypeScript knows this is safe
  });
}
```

### Using Constants

```typescript
import * as Consts from '@epdoc/strava-schema/consts';

if (activity.type === Consts.ActivityName.Ride) {
  // Handle ride
}

// Or check if it's a known type
if (Consts.isKnownActivityType(activity.type)) {
  // activity.type is narrowed to known ActivityType
}
```

### Working with Geographic Data

```typescript
import type { Latitude, Longitude } from '@epdoc/strava-schema/types/units';
import * as Segment from '@epdoc/strava-schema/segment';

if (Segment.isSummary(segment)) {
  // start_latlng and end_latlng are typed as [Latitude, Longitude]
  const start: [Latitude, Longitude] = segment.start_latlng;
  const end: [Latitude, Longitude] = segment.end_latlng;

  console.log(`Start: ${start[0]}, ${start[1]}`);
  console.log(`End: ${end[0]}, ${end[1]}`);
}
```

### Handling Timezones Properly

```typescript
import * as Activity from '@epdoc/strava-schema/activity';
import { DateTime } from '@epdoc/datetime';

if (Activity.isDetailed(activity)) {
  // start_date is UTC ISO 8601
  const utcTime = DateTime.from(activity.start_date);

  // start_date_local lacks timezone - must combine with timezone field
  const localTime = DateTime.from(activity.start_date_local)
    .withIANA(activity.timezone);

  console.log(`UTC: ${utcTime.toISODateTime()}`);
  console.log(`Local: ${localTime.toISODateTime()}`);
}
```

## Key Files

| File             | Purpose             | Key Exports                                                      |
| ---------------- | ------------------- | ---------------------------------------------------------------- |
| `consts.ts`      | Constants and enums | `ActivityName`, `StreamKeys`, `isStravaId`, `isActivityType`     |
| `activity.ts`    | Activity namespace  | `Summary`, `Detailed`, `isSummary`, `isDetailed`                 |
| `athlete.ts`     | Athlete namespace   | `Summary`, `Detailed`, `isSummary`, `isDetailed`                 |
| `segment.ts`     | Segment namespace   | `Summary`, `Detailed`, `isSummary`, `isDetailed`                 |
| `gear.ts`        | Gear namespace      | `Summary`, `Detailed`, `Id`                                      |
| `stream.ts`      | Stream namespace    | `Data`, `LatLng`, `Set`, `isData`, `isLatLng`                    |
| `zones.ts`       | Zones namespace     | `Zones`, `HeartRate`, `Power`, `Range`                           |
| `types/units.ts` | Semantic unit types | `Metres`, `Seconds`, `BPM`, `Watts`, `CountryCode2`, `Url`, etc. |

## Import Paths

```typescript
// Main namespace imports
import * as Schema from '@epdoc/strava-schema';

// Direct namespace imports (tree-shakable)
import * as Activity from '@epdoc/strava-schema/activity';
import * as Athlete from '@epdoc/strava-schema/athlete';

// Unit types only
import type { BPM, Metres, Seconds } from '@epdoc/strava-schema/types/units';

// All types (flat export)
import type * as Types from '@epdoc/strava-schema/types';
```

## Dependencies

- `@epdoc/type` - Utility types and type guards (`Integer`, `WholeNumber`, `isDict`, etc.)
- `@epdoc/datetime` - DateTime handling for Strava's timezone format (optional, for applications
  that need to manipulate dates)

## Migration from Zod

If migrating from the previous Zod-based version:

### Before (Zod):

```typescript
import * as Activity from '@epdoc/strava-schema/activity';

const result = Activity.Detailed.safeParse(apiResponse);
if (result.success) {
  const activity = result.data;
}
```

### After (Type guards):

```typescript
import * as Activity from '@epdoc/strava-schema/activity';

if (Activity.isDetailed(apiResponse)) {
  // apiResponse is typed as Activity.Detailed
  console.log(apiResponse.name);
}
```

### Type Name Changes

| Old (Zod)               | New (TypeScript)    |
| ----------------------- | ------------------- |
| `Activity.SummaryType`  | `Activity.Summary`  |
| `Activity.DetailedType` | `Activity.Detailed` |
| `Activity.IdType`       | `Activity.Id`       |
| `Athlete.SummaryType`   | `Athlete.Summary`   |
| `Athlete.DetailedType`  | `Athlete.Detailed`  |
| `Athlete.IdType`        | `Athlete.Id`        |
| `Segment.SummaryType`   | `Segment.Summary`   |
| `Segment.IdType`        | `Segment.Id`        |
| `Stream.DataType`       | `Stream.Data`       |
| `Stream.LatLngType`     | `Stream.LatLng`     |
| `Stream.SetType`        | `Stream.Set`        |

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
- Semantic unit types provide self-documenting code
- All count fields use `WholeNumber` (non-negative integers)
- Timezone handling requires special attention (use `@epdoc/datetime`)
- JSR-publishable with no "slow types" warnings
