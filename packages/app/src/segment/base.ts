import type { Seconds } from '@epdoc/duration';
import type { Metres } from '@epdoc/strava-api';
import type * as Schema from '@epdoc/strava-schema';

/**
 * Base class for Strava segment data with core timing and distance metrics.
 *
 * This class wraps Strava's SummarySegment schema and provides a consistent
 * interface for segment information. It serves as the foundation for more
 * specialized segment classes like SegmentData (which adds coordinates and
 * location info).
 *
 * @example
 * ```ts
 * const segment = new SegmentBase();
 * segment.id = 123;
 * segment.name = 'Test Segment';
 * console.log(segment.name, segment.distance);
 * ```
 */
export class SegmentBase {
  data: Schema.Segment.Summary = {} as Schema.Segment.Summary;
  id: Schema.Segment.Id = 0;
  name: Schema.Segment.Name = '';
  elapsed_time: Seconds = 0;
  moving_time: Seconds = 0;
  distance: Metres = 0;

  constructor(data?: Partial<SegmentBase>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
