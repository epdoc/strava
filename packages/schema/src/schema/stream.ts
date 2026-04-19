import { z } from 'zod';
import { StreamResolutionSchema, StreamSeriesTypeSchema, StreamTypeSchema } from './consts.ts';

/**
 * Zod schema for Stream.
 * Base stream type for non-latlng data.
 */
export const StreamSchema: z.ZodObject<{
  type: z.ZodEnum<
    [
      'time',
      'distance',
      'altitude',
      'velocity_smooth',
      'heartrate',
      'cadence',
      'watts',
      'temp',
      'moving',
      'grade_smooth',
    ]
  >;
  original_size: z.ZodNumber;
  resolution: typeof StreamResolutionSchema;
  series_type: typeof StreamSeriesTypeSchema;
  data: z.ZodArray<z.ZodNumber>;
}> = z.object({
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
export const LatLngStreamSchema: z.ZodObject<{
  type: z.ZodLiteral<'latlng'>;
  original_size: z.ZodNumber;
  resolution: typeof StreamResolutionSchema;
  series_type: typeof StreamSeriesTypeSchema;
  data: z.ZodArray<z.ZodTuple<[z.ZodNumber, z.ZodNumber]>>;
}> = z.object({
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
export const StreamSetSchema: z.ZodObject<{
  time: z.ZodOptional<typeof StreamSchema>;
  distance: z.ZodOptional<typeof StreamSchema>;
  latlng: z.ZodOptional<typeof LatLngStreamSchema>;
  altitude: z.ZodOptional<typeof StreamSchema>;
  velocity_smooth: z.ZodOptional<typeof StreamSchema>;
  heartrate: z.ZodOptional<typeof StreamSchema>;
  cadence: z.ZodOptional<typeof StreamSchema>;
  watts: z.ZodOptional<typeof StreamSchema>;
  temp: z.ZodOptional<typeof StreamSchema>;
  moving: z.ZodOptional<typeof StreamSchema>;
  grade_smooth: z.ZodOptional<typeof StreamSchema>;
}> = z.object({
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
