/**
 * Gear namespace - Zod schemas and types for Strava gear (bikes, shoes).
 *
 * @example
 * ```typescript
 * import * as Gear from '@epdoc/strava-schema/gear';
 *
 * const result = Gear.Detailed.safeParse(apiResponse);
 * if (result.success) {
 *   console.log(result.data.name);
 * }
 * ```
 */

// Zod schemas with short names
export {
  DetailedGearSchema as Detailed,
  GearIdSchema as Id,
  SummaryGearSchema as Summary,
} from './schema/gear.ts';

// TypeScript types
export type {
  DetailedGear as DetailedType,
  GearId as IdType,
  SummaryGear as SummaryType,
} from './schema/gear.ts';
