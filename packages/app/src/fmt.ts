import type { Seconds } from '@epdoc/duration';
import { type Integer, pad } from '@epdoc/type';

// export type Dict = Record<string, unknown>;

// export function compare<T extends Dict>(a: T, b: T, key: string): number {
//   const aVal = a[key];
//   const bVal = b[key];
//   if (typeof aVal === 'string' && typeof bVal === 'string') {
//     return aVal.localeCompare(bVal);
//   }
//   if (typeof aVal === 'number' && typeof bVal === 'number') {
//     return aVal - bVal;
//   }
//   return 0;
// }

/**
 * Options for formatting time as HH:MM:SS.
 */
export type formatHMSOpts = {
  /** Whether to include seconds in the output. Defaults to true. */
  seconds?: boolean;
};

/**
 * Formats seconds as MM:SS (minutes:seconds).
 * Used for segment effort times where we want to show minutes and seconds.
 *
 * @param s Number of seconds
 * @returns Formatted string like "19:28" for 1168 seconds
 */
export function formatMS(s: Seconds): string {
  const seconds = s % 60;
  const minutes = Math.floor(s / 60);
  let result = minutes + ':';
  result += pad(seconds, 2);
  return result;
}

// export function julianDate(d: Date): number {
//   return Math.floor(d.getTime() / 86400000 - d.getTimezoneOffset() / 1440 + 2440587.5) + 1;
// }

// export function fieldCapitalize(name: string): string {
//   return name
//     .replace(/^([a-z])/, function ($1: string) {
//       return $1.toUpperCase();
//     })
//     .replace(/(\_[a-z])/g, function ($1: string) {
//       return $1.toUpperCase().replace('_', ' ');
//     });
// }

/**
 * Escapes HTML special characters in a string.
 *
 * Replaces `&`, `<`, `>`, `"`, and `'` with their corresponding HTML entities.
 * Useful for safely including user-generated content in KML descriptions (which are HTML).
 *
 * @param unsafe - The string to escape
 * @returns The escaped string safe for use in HTML/XML content
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formatting utilities for distances, elevations, temperatures, and time.
 *
 * Provides static methods for converting and formatting Strava metrics into
 * human-readable strings with appropriate units. Supports both metric and
 * imperial unit systems.
 */
export class Fmt {
  /**
   * Rounds a number to a given precision and appends a unit string.
   *
   * @param num - The value to format
   * @param precision - The multiplier for rounding (e.g., 100 for 2 decimals, 1 for 0 decimals)
   * @param unit - The unit string to append (e.g., " km", " m")
   * @returns Formatted string like "17.65 km"
   */
  static precision(num: number, precision: Integer, unit: string): string {
    return String(Math.round(num * precision) / precision) + unit;
  }
  /**
   * Formats a distance value in meters to km or miles.
   *
   * @param value - Distance in meters
   * @param [imperial=false] - Use miles instead of km
   * @returns Formatted string like "17.65 km" or "10.97 miles"
   */
  static getDistanceString(value: number, imperial: boolean = false): string {
    if (imperial) {
      return Fmt.precision(value / 1609.344, 100, ' miles');
    } else {
      return Fmt.precision(value / 1000, 100, ' km');
    }
  }

  /**
   * Formats an elevation value in meters to meters or feet.
   *
   * @param value - Elevation in meters
   * @param [imperial=false] - Use feet instead of meters
   * @returns Formatted string like "205 m" or "672 ft"
   */
  static getElevationString(value: number, imperial: boolean = false): string {
    if (imperial) {
      return Fmt.precision(value / 0.3048, 1, ' ft');
    } else {
      return Fmt.precision(value, 1, ' m');
    }
  }

  /**
   * Formats a temperature value in Celsius to Celsius or Fahrenheit.
   *
   * @param value - Temperature in Celsius
   * @param [imperial=false] - Use Fahrenheit instead of Celsius
   * @returns Formatted string like "25°C" or "77°F"
   */
  static getTemperatureString(value: number, imperial: boolean = false): string {
    if (imperial) {
      return Fmt.precision((value * 9) / 5 + 32, 1, '&deg;F');
    } else {
      return value + '&deg;C';
    }
  }

  /**
   * Formats a duration in seconds to HH:MM:SS or HH:MM format.
   *
   * @param s - Duration in seconds
   * @param [options] - Formatting options
   * @returns Formatted string like "01:30:45" or "01:30"
   */
  static hms(s: Seconds, options?: formatHMSOpts): string {
    options || (options = {});
    const seconds = s % 60;
    const minutes = Math.floor(s / 60) % 60;
    const hours = Math.floor(s / (60 * 60));
    let result = pad(hours, 2) + ':';
    result += pad(minutes, 2);
    if (options.seconds !== false) {
      result += ':' + pad(seconds, 2);
    }
    return result;
  }
}
