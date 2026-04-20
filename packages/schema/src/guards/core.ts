/**
 * Core type guard functions for @epdoc/strava-schema.
 *
 * These are lightweight type guards that check only critical fields.
 */

// ============================================================================
// ID Guards
// ============================================================================

/**
 * Check if a value is a valid Strava ID (integer).
 */
export function isStravaId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

/**
 * Check if a value is a valid Activity ID.
 */
export function isActivityId(value: unknown): value is number {
  return isStravaId(value);
}

/**
 * Check if a value is a valid Athlete ID.
 */
export function isAthleteId(value: unknown): value is number {
  return isStravaId(value);
}

/**
 * Check if a value is a valid Segment ID.
 */
export function isSegmentId(value: unknown): value is number {
  return isStravaId(value);
}

/**
 * Check if a value is a valid Gear ID (string).
 */
export function isGearId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

// ============================================================================
// Enum Guards
// ============================================================================

/** Valid activity type values */
const ACTIVITY_TYPES = new Set([
  'AlpineSki',
  'BackcountrySki',
  'Canoeing',
  'Crossfit',
  'EBikeRide',
  'Elliptical',
  'Hike',
  'IceSkate',
  'InlineSkate',
  'Kayaking',
  'Kitesurf',
  'NordicSki',
  'Ride',
  'RockClimbing',
  'RollerSki',
  'Rowing',
  'Run',
  'Snowboard',
  'Snowshoe',
  'StairStepper',
  'StandUpPaddling',
  'Surfing',
  'Swim',
  'VirtualRide',
  'Walk',
  'WeightTraining',
  'Windsurf',
  'Workout',
  'Yoga',
  'Handcycle',
  'Velomobile',
  'VirtualRun',
  'Wheelchair',
]);

/**
 * Check if a value is a valid ActivityType.
 * Also accepts any string (for custom activity types).
 */
export function isActivityType(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if a value is a known/standard ActivityType.
 */
export function isKnownActivityType(value: unknown): value is string {
  return typeof value === 'string' && ACTIVITY_TYPES.has(value);
}

/**
 * Check if a value is a valid Sex value.
 */
export function isSex(value: unknown): value is 'F' | 'M' {
  return value === 'F' || value === 'M';
}

/**
 * Check if a value is a valid ResourceState.
 */
export function isResourceState(value: unknown): value is 1 | 2 | 3 {
  return value === 1 || value === 2 || value === 3;
}

/**
 * Check if a value is a valid SportType.
 */
export function isSportType(
  value: unknown,
): value is 'cycling' | 'running' | 'triathlon' | 'other' {
  return value === 'cycling' || value === 'running' || value === 'triathlon' || value === 'other';
}

/**
 * Check if a value is a valid StreamType.
 */
export function isStreamType(value: unknown): value is string {
  const validTypes = [
    'time',
    'distance',
    'latlng',
    'altitude',
    'velocity_smooth',
    'heartrate',
    'cadence',
    'watts',
    'temp',
    'moving',
    'grade_smooth',
  ];
  return typeof value === 'string' && validTypes.includes(value);
}

/**
 * Check if a value is a valid UnitSystem.
 */
export function isUnitSystem(value: unknown): value is 'feet' | 'meters' {
  return value === 'feet' || value === 'meters';
}

// ============================================================================
// Common Object Guards
// ============================================================================

/**
 * Check if a value is a plain object (not null, not array).
 */
export function isDict(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if a value is a valid polyline map.
 */
export function isPolylineMap(value: unknown): boolean {
  return isDict(value) &&
    typeof value.id === 'string' &&
    (value.polyline === null || typeof value.polyline === 'string') &&
    typeof value.summary_polyline === 'string';
}

/**
 * Check if a value is a valid MetaAthlete.
 */
export function isMetaAthlete(value: unknown): boolean {
  return isDict(value) &&
    isAthleteId(value.id) &&
    isResourceState(value.resource_state);
}
