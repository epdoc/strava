import type { ISODate } from '@epdoc/datetime';
import type { Brand } from '@epdoc/type';

/**
 * Persistent state for tracking last update times for different output types.
 *
 * This state is used to determine the default date range when users don't specify
 * --date on the command line. For example, if kml.lastUpdated is "2024-12-01T00:00:00Z",
 * the next kml command without --date will fetch activities from that date forward.
 */
export type UserState = Partial<Record<OutputType, { lastUpdated?: ISODate }>>;

/**
 * Type of output being generated (kml or pdf)
 */
// export const OutputType = {
//   Kml: 'kml',
//   Acroforms: 'acroforms',
//   Gpx: 'gpx',
// } as const;

// // Create a type derived from the object's values
// export type OutputType = (typeof OutputType)[keyof typeof OutputType];

export type OutputType = Brand<string, 'OutputType'>;
export type FileExtension = Brand<string, 'FileExtension'>;

export const OutputTypes = {
  Kml: 'kml' as OutputType,
  Acroforms: 'acroforms' as OutputType,
  Gpx: 'gpx' as OutputType,
} as const;

// export const ExtensionMap: = {
//   [OutputTypes.Kml]: '.kml' as FileExtension,
//   [OutputTypes.Acroforms]: '.xml' as FileExtension,
//   [OutputTypes.Gpx]: '.gpx' as FileExtension,
// } satisfies Record<OutputType, FileExtension>;
