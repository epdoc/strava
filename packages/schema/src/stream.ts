/**
 * Stream namespace - types and guards for Strava streams.
 *
 * @example
 * ```typescript
 * import * as Stream from '@epdoc/strava-schema/stream';
 *
 * if (Stream.hasLatLng(streamSet)) {
 *   const coords = streamSet.latlng.data;
 * }
 * ```
 */

// Types
export type {
  DataStream as Data,
  DataStreamKey,
  LatLngStream as LatLng,
  Stream,
  StreamKey,
  StreamKey as StreamKeyType,
  StreamSet as Set,
} from './types/stream.ts';

// Type guards
export {
  hasLatLngStream as hasLatLng,
  isDataStream as isData,
  isLatLngStream as isLatLng,
  isStream,
  isStreamSet as isSet,
} from './guards/stream.ts';
