/**
 * Segment namespace - types and guards for Strava segments.
 *
 * @example
 * ```typescript
 * import * as Segment from '@epdoc/strava-schema/segment';
 *
 * if (Segment.isSummary(data)) {
 *   console.log(data.name);
 * }
 * ```
 */

// Types
export type {
  DetailedSegment as Detailed,
  DetailedSegmentEffort as DetailedEffort,
  ExplorerSegment as Explorer,
  SegmentId as Id,
  SegmentName as Name,
  SummarySegment as Summary,
  SummarySegmentEffort as SummaryEffort,
} from './types/segment.ts';

// Type guards
export {
  isDetailedSegment as isDetailed,
  isDetailedSegmentEffort as isDetailedEffort,
  isDetailedSegmentEffortArray as isDetailedEffortArray,
  isExplorerSegment as isExplorer,
  isSummarySegment as isSummary,
  isSummarySegmentArray as isSummaryArray,
  isSummarySegmentEffort as isSummaryEffort,
} from './guards/segment.ts';
