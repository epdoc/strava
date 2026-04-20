/**
 * Gear namespace - types and guards for Strava gear (bikes, shoes).
 *
 * @example
 * ```typescript
 * import * as Gear from '@epdoc/strava-schema/gear';
 *
 * const gear: Gear.Detailed = {
 *   id: 'b12345',
 *   name: 'Road Bike',
 *   // ...
 * };
 * ```
 */

// Types
export type {
  DetailedGear as Detailed,
  GearId as Id,
  SummaryGear as Summary,
} from './types/gear.ts';

// Re-export core gear guard
export { isGearId as isId } from './guards/core.ts';
