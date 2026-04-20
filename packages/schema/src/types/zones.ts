/**
 * Zone types for Strava API.
 *
 * Heart rate and power zones for an athlete.
 */

// ============================================================================
// Zone Range Types
// ============================================================================

/** A range of values with min and max. */
export interface ZoneRange {
  min: number;
  max: number;
}

/**
 * Power zone ranges.
 */
export interface PowerZoneRanges {
  zones: ZoneRange[];
}

/**
 * Heart rate zone ranges.
 */
export interface HeartRateZoneRanges {
  custom_zones: boolean;
  zones: ZoneRange[];
}

// ============================================================================
// Combined Zones
// ============================================================================

/**
 * All zones for an athlete.
 */
export interface Zones {
  heart_rate: HeartRateZoneRanges;
  power: PowerZoneRanges;
}
