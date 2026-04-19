import type { ISODate } from '@epdoc/datetime';

/**
 * Persistent state for tracking last update times for different output types.
 *
 * This state is used to determine the default date range when users don't specify
 * --date on the command line. For example, if kml.lastUpdated is "2024-12-01T00:00:00Z",
 * the next kml command without --date will fetch activities from that date forward.
 */
export type UserState = {
  /** State for KML file generation */
  kml?: {
    /** ISO date of the most recent activity included in the last KML generation */
    lastUpdated?: ISODate;
  };
  /** State for PDF/Acroforms XML file generation */
  pdf?: {
    /** ISO date of the most recent activity included in the last PDF generation */
    lastUpdated?: ISODate;
  };
};

/**
 * Type of output being generated (kml or pdf)
 */
export type OutputType = 'kml' | 'pdf';
