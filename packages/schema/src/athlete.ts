/**
 * Athlete namespace - Zod schemas and types for Strava athletes.
 *
 * @example
 * ```typescript
 * import * as Athlete from '@epdoc/strava-schema/athlete';
 *
 * const result = Athlete.Detailed.safeParse(apiResponse);
 * if (result.success) {
 *   console.log(result.data.firstname);
 * }
 * ```
 */

// Zod schemas with short names
export {
  AthleteIdSchema as Id,
  CommentSchema as Comment,
  DetailedAthleteSchema as Detailed,
  SummaryAthleteSchema as Summary,
  SummaryClubSchema as Club,
} from './schema/athlete.ts';

// TypeScript types
export type {
  AthleteId as IdType,
  Comment as CommentType,
  DetailedAthlete as DetailedType,
  SummaryAthlete as SummaryType,
  SummaryClub as ClubType,
} from './schema/athlete.ts';
