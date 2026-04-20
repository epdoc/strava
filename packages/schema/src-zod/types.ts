/**
 * Types namespace - Base types for Strava API.
 *
 * @example
 * ```typescript
 * import * as Types from '@epdoc/strava-schema/types';
 *
 * const id: Types.StravaLongInt = 12345678;
 * ```
 */

// Export schemas
export { MetaActivitySchema, MetaAthleteSchema, StravaLongIntSchema } from './schema/types.ts';

// Export types separately
export type {
  ActivityType,
  FollowerStatusType,
  MetaActivity,
  MetaActivity as MetaActivityType,
  MetaAthlete,
  MetaAthlete as MetaAthleteType,
  ResourceStateType,
  SexType,
  SportType,
  StravaLongInt,
  StravaLongInt as StravaLongIntType,
  StreamKeyType,
  UnitSystemType,
} from './schema/types.ts';
