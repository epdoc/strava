/**
 * Semantic unit types for Strava API data.
 *
 * These type aliases provide self-documenting type names for numeric values,
 * making the API data structures clearer and more maintainable.
 *
 * @example
 * ```typescript
 * import type { Metres, Seconds } from './units.ts';
 *
 * const distance: Metres = 5000;  // Clearly indicates meters
 * const time: Seconds = 3600;     // Clearly indicates seconds
 * ```
 */

import type { Integer } from '@epdoc/type';

// ============================================================================
// Distance Units
// ============================================================================

/** Distance in meters (m). Strava API uses meters for all distance values. */
export type Metres = number;

/** Distance in kilometers (km). Useful for display conversions. */
export type Kilometres = number;

/** Distance in miles. Useful for imperial display conversions. */
export type Miles = number;

/** Distance in feet (ft). Used for elevation in imperial units. */
export type Feet = number;

// ============================================================================
// Time Units
// ============================================================================

/** Time in seconds (s). Strava API uses seconds for all time durations. */
export type Seconds = number;

/** Time in minutes. Useful for display conversions. */
export type Minutes = number;

/** Time in hours. Useful for display conversions. */
export type Hours = number;

// ============================================================================
// Speed Units
// ============================================================================

/** Speed in meters per second (m/s). Strava API uses m/s for speed values. */
export type MetresPerSecond = number;

/** Speed in kilometers per hour (km/h). */
export type KPH = number;

/** Speed in miles per hour (mph). */
export type MPH = number;

// ============================================================================
// Geographic Units
// ============================================================================

/** Latitude in decimal degrees (-90 to 90). */
export type Latitude = number;

/** Longitude in decimal degrees (-180 to 180). */
export type Longitude = number;

/** Altitude/Elevation in meters. */
export type Altitude = number;

// ============================================================================
// Grade and Slope
// ============================================================================

/** Grade/slope as a percentage (-100 to 100). */
export type Percent = number;

/** Grade in decimal form (-1 to 1, where 0.05 = 5%). */
export type GradeDecimal = number;

// ============================================================================
// Physiological Units
// ============================================================================

/** Heart rate in beats per minute (bpm). */
export type BPM = number;

/** Power in watts. */
export type Watts = number;

/** Cadence in revolutions per minute (rpm). */
export type RPM = number;

/** Temperature in Celsius degrees. */
export type Celsius = number;

/** Temperature in Fahrenheit degrees. */
export type Fahrenheit = number;

// ============================================================================
// Energy Units
// ============================================================================

/** Energy in kilojoules (kJ). */
export type Kilojoules = number;

/** Energy in kilocalories / Calories (kcal). */
export type Kilocalories = number;

// ============================================================================
// Date/Time Formats
// ============================================================================

/**
 * ISO 8601 formatted datetime string with timezone.
 *
 * Format: `YYYY-MM-DDTHH:mm:ssZ` or `YYYY-MM-DDTHH:mm:ss±HH:mm`
 *
 * @example "2023-01-15T10:30:00Z"
 * @example "2023-01-15T10:30:00-05:00"
 */
export type ISODateTime = string;

/**
 * Local datetime string without timezone information.
 *
 * **Note**: Strava's `start_date_local` uses this format. It looks like ISO 8601
 * but lacks the timezone suffix. The timezone must be obtained from the separate
 * `timezone` field and combined using `@epdoc/datetime` for proper handling.
 *
 * Format: `YYYY-MM-DDTHH:mm:ss` (no timezone suffix!)
 *
 * @example "2023-01-15T10:30:00"
 * @see {@link https://github.com/tc39/proposal-temporal/blob/main/docs/plaindatetime.md Temporal.PlainDateTime}
 */
export type LocalDateTime = string;

/**
 * ISO 8601 formatted date string.
 *
 * Format: `YYYY-MM-DD`
 *
 * @example "2023-01-15"
 */
export type ISODate = string;

/** Array index position (e.g., start_index, end_index, lap_index). */
export type Index = Integer;

// ============================================================================
// Weight Units
// ============================================================================

/** Weight in kilograms (kg). */
export type Kilograms = number;

/** Weight in pounds (lb). */
export type Pounds = number;

// ============================================================================
// Standard Codes and Identifiers
// ============================================================================

/**
 * ISO 3166-1 alpha-2 country code (2-letter).
 * @example "US", "CA", "GB", "FR"
 */
export type CountryCode2 = string;

/**
 * ISO 3166-2 state/province code (varies by country).
 * @example "CA" (California), "ON" (Ontario)
 */
export type StateCode = string;

// ============================================================================
// String Formats
// ============================================================================

/** URL string. */
export type Url = string;

/** Email address string. */
export type Email = string;

/**
 * Timezone string in Strava's display format.
 *
 * Format: "(GMT±HH:MM) IANA/Timezone_Name"
 *
 * @example "(GMT-06:00) America/Chicago"
 * @example "(GMT+01:00) Europe/Paris"
 */
export type Timezone = string;

/**
 * Encoded polyline string (Google Maps / Strava format).
 *
 * A compressed representation of a series of latitude/longitude coordinates.
 * Used for map polylines and segment point data.
 *
 * @see {@link https://developers.google.com/maps/documentation/utilities/polylinealgorithm}
 * @example "_p~iF~ps|U_ulLnnqC_mqNvxq`@"
 */
export type EncodedPolyline = string;
