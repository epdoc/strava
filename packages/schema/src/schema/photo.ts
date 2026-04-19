import { z } from 'zod';
import { StravaLongIntSchema } from './types.ts';

/**
 * Zod schema for PhotoSummary_primary.
 */
export const PhotoSummaryPrimarySchema: z.ZodObject<{
  id: z.ZodNullable<typeof StravaLongIntSchema>;
  source: z.ZodNumber;
  unique_id: z.ZodString;
  urls: z.ZodRecord<z.ZodString, z.ZodString>;
}> = z.object({
  id: StravaLongIntSchema.nullable(),
  source: z.number(),
  unique_id: z.string(),
  urls: z.record(z.string()),
});

/** PhotoSummary_primary type inferred from PhotoSummaryPrimarySchema */
export type PhotoSummary_primary = z.infer<typeof PhotoSummaryPrimarySchema>;

/**
 * Zod schema for PhotoSummary.
 */
export const PhotoSummarySchema: z.ZodObject<{
  count: z.ZodNumber;
  primary: typeof PhotoSummaryPrimarySchema;
}> = z.object({
  count: z.number(),
  primary: PhotoSummaryPrimarySchema,
});

/** PhotoSummary type inferred from PhotoSummarySchema */
export type PhotoSummary = z.infer<typeof PhotoSummarySchema>;
