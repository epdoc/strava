/**
 * Segment namespace - Types and schemas for Strava segments.
 *
 * Note: Segment types use TypeScript interfaces due to circular dependencies.
 *
 * @example
 * ```typescript
 * import * as Segment from '@epdoc/strava-schema/segment';
 *
 * if (Segment.isSummarySegment(data)) {
 *   console.log(data.name);
 * }
 * ```
 */

// Zod schemas with short names
export {
  AchievementSchema as Achievement,
  EffortIdSchema as EffortId,
  ExplorerSegmentSchema as Explorer,
  SegmentIdSchema as Id,
  SegmentNameSchema as Name,
} from './schema/segment.ts';

// TypeScript types (interfaces for circular dependencies)
export type {
  Achievement as AchievementType,
  DetailedSegment as DetailedType,
  DetailedSegmentEffort as DetailedEffortType,
  EffortId as EffortIdType,
  ExplorerSegment as ExplorerType,
  SegmentId as IdType,
  SegmentName as NameType,
  SummarySegment as SummaryType,
  SummarySegmentEffort as SummaryEffortType,
} from './schema/segment.ts';

// Type guard functions
export { isSummarySegment, isSummarySegmentEffort } from './schema/segment.ts';
