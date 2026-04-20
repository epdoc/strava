/**
 * Zones namespace - Zod schemas and types for Strava activity zones.
 *
 * @example
 * ```typescript
 * import * as Zones from '@epdoc/strava-schema/zones';
 *
 * const result = Zones.HeartRate.safeParse(apiResponse);
 * if (result.success) {
 *   console.log(result.data.zones.length);
 * }
 * ```
 */

// Zod schemas with short names
export {
  HeartRateZoneRangesSchema as HeartRate,
  PowerZoneRangesSchema as Power,
  ZoneRangeSchema as Range,
  ZonesSchema as All,
} from './schema/zones.ts';

// TypeScript types
export type {
  HeartRateZoneRanges as HeartRateType,
  PowerZoneRanges as PowerType,
  ZoneRange as RangeType,
  Zones as AllType,
} from './schema/zones.ts';
