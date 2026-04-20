/**
 * Athlete namespace - types and guards for Strava athletes.
 *
 * @example
 * ```typescript
 * import * as Athlete from '@epdoc/strava-schema/athlete';
 *
 * if (Athlete.isDetailed(apiResponse)) {
 *   console.log(apiResponse.firstname);
 * }
 * ```
 */

// Types
export type {
  AthleteId as Id,
  DetailedAthlete as Detailed,
  SummaryAthlete as Summary,
  SummaryClub as Club,
} from './types/athlete.ts';

// Type guards
export {
  isDetailedAthlete as isDetailed,
  isSummaryAthlete as isSummary,
  isSummaryAthleteArray as isSummaryArray,
  isSummaryClub as isClub,
} from './guards/athlete.ts';
