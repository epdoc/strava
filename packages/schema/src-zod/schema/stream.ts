import { z } from '@zod/zod';
import { StreamResolutionSchema, StreamSeriesTypeSchema, StreamTypeSchema } from './consts.ts';

/**
 * Zod schema for Stream.
 * Base stream type for non-latlng data.
 */
export const StreamSchema = z.object({
  type: StreamTypeSchema.exclude(['latlng']),
  original_size: z.number(),
  resolution: StreamResolutionSchema,
  series_type: StreamSeriesTypeSchema,
  data: z.array(z.number()),
});

/** Stream type inferred from StreamSchema */
export type Stream = z.infer<typeof StreamSchema>;

/**
 * Zod schema for LatLngStream.
 * Stream type specifically for latitude/longitude coordinate data.
 */
export const LatLngStreamSchema = z.object({
  type: z.literal('latlng'),
  original_size: z.number(),
  resolution: StreamResolutionSchema,
  series_type: StreamSeriesTypeSchema,
  data: z.array(z.tuple([z.number(), z.number()])),
});

/** LatLngStream type inferred from LatLngStreamSchema */
export type LatLngStream = z.infer<typeof LatLngStreamSchema>;

/**
 * Zod schema for StreamSet.
 * Contains all stream types for an activity.
 */
export const StreamSetSchema = z.object({
  time: StreamSchema.optional(),
  distance: StreamSchema.optional(),
  latlng: LatLngStreamSchema.optional(),
  altitude: StreamSchema.optional(),
  velocity_smooth: StreamSchema.optional(),
  heartrate: StreamSchema.optional(),
  cadence: StreamSchema.optional(),
  watts: StreamSchema.optional(),
  temp: StreamSchema.optional(),
  moving: StreamSchema.optional(),
  grade_smooth: StreamSchema.optional(),
});

/** StreamSet type inferred from StreamSetSchema */
export type StreamSet = z.infer<typeof StreamSetSchema>;
