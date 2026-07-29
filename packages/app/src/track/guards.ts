import * as Schema from '@epdoc/strava-schema';
import { _ } from '@epdoc/type';
import type { ActivityExType, KmlLineStyle } from './types.ts';

/**
 * Checks whether a string is a valid activity type or custom style name.
 *
 * In addition to standard Strava activity type names (e.g. "Ride", "Run"),
 * this accepts virtual style names used in the KML line-style system:
 * "Default", "Commute", "Moto", and "Segment".
 *
 * @param name - The activity type or style name to validate
 * @returns True if the name is a known activity type or custom style
 */
export function isValidActivityType(name: string): name is ActivityExType {
  return (Schema.Consts.ActivityName && name in Schema.Consts.ActivityName) ||
    name === 'Default' ||
    name === 'Commute' ||
    name === 'Moto' ||
    name === 'Segment';
}

/**
 * Checks whether a value is a valid KML line style definition.
 *
 * Valid styles must have a string `color` (8-digit hex with alpha), a numeric
 * `width`, and satisfy the hex-string format check.
 *
 * @param val - The value to validate
 * @returns True if the value is a valid KmlLineStyle
 */
export function isValidLineStyle(val: KmlLineStyle): val is KmlLineStyle {
  return !!(val && _.isString(val.color) && _.isNumber(val.width) && _.isHexString(val.color, 8));
}
