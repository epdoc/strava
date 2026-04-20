/**
 * Zones namespace - types for heart rate and power zones.
 *
 * @example
 * ```typescript
 * import * as Zones from '@epdoc/strava-schema/zones';
 *
 * const hrZones: Zones.HeartRate = {
 *   custom_zones: false,
 *   zones: [{ min: 0, max: 120 }, { min: 120, max: 140 }],
 * };
 * ```
 */

// Types
export type {
  HeartRateZoneRanges as HeartRate,
  PowerZoneRanges as Power,
  ZoneRange as Range,
  Zones,
} from './types/zones.ts';
