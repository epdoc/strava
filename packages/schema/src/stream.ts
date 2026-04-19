/**
 * Stream namespace - Zod schemas and types for Strava activity streams.
 *
 * @example
 * ```typescript
 * import * as Stream from '@epdoc/strava-schema/stream';
 *
 * const result = Stream.Set.safeParse(apiResponse);
 * if (result.success) {
 *   console.log(result.data.latlng?.data.length);
 * }
 * ```
 */

// Zod schemas with short names
export {
  LatLngStreamSchema as LatLng,
  StreamSchema as Data,
  StreamSetSchema as Set,
} from './schema/stream.ts';

// TypeScript types
export type {
  LatLngStream as LatLngType,
  Stream as DataType,
  StreamSet as SetType,
} from './schema/stream.ts';
