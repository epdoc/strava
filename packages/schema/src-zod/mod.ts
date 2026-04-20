/**
 * @jpravetz/strava-schema
 *
 * Zod schemas and TypeScript types for the Strava API.
 *
 * This package provides runtime validation schemas (using Zod) and inferred TypeScript types
 * for all Strava API data structures. Use this package to validate API responses and ensure
 * type safety when working with Strava data.
 *
 * @example
 * Import everything as a namespace:
 * ```typescript
 * import * as Schema from '@jpravetz/strava-schema';
 *
 * // Validate activity data
 * const result = Schema.Activity.Detailed.safeParse(apiResponse);
 * if (result.success) {
 *   const activity: Schema.Activity.DetailedType = result.data;
 *   console.log(activity.name);
 * }
 *
 * // Validate athlete data
 * const athlete = Schema.Athlete.Detailed.safeParse(athleteResponse);
 *
 * // Check activity type
 * if (activity.type === Schema.Consts.ActivityName.Ride) {
 *   // Handle ride
 * }
 * ```
 *
 * @example
 * Import specific namespaces for tree-shaking:
 * ```typescript
 * import * as Activity from '@jpravetz/strava-schema/activity';
 *
 * const result = Activity.Detailed.safeParse(apiResponse);
 * ```
 */

// Namespace exports - use as: Schema.Activity.Detailed, Schema.Athlete.Summary, etc.
export * as Activity from './activity.ts';
export * as Athlete from './athlete.ts';
export * as Consts from './consts.ts';
export * as Gear from './gear.ts';
export * as Segment from './segment.ts';
export * as Stream from './stream.ts';
export * as Types from './types.ts';
export * as Zones from './zones.ts';
