import { z } from 'zod';

/**
 * Zod schema for ZoneRange.
 */
export const ZoneRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
});

/** ZoneRange type inferred from ZoneRangeSchema */
export type ZoneRange = z.infer<typeof ZoneRangeSchema>;

/**
 * Zod schema for PowerZoneRanges.
 */
export const PowerZoneRangesSchema = z.object({
  zones: z.array(ZoneRangeSchema),
});

/** PowerZoneRanges type inferred from PowerZoneRangesSchema */
export type PowerZoneRanges = z.infer<typeof PowerZoneRangesSchema>;

/**
 * Zod schema for HeartRateZoneRanges.
 */
export const HeartRateZoneRangesSchema = z.object({
  custom_zones: z.boolean(),
  zones: z.array(ZoneRangeSchema),
});

/** HeartRateZoneRanges type inferred from HeartRateZoneRangesSchema */
export type HeartRateZoneRanges = z.infer<typeof HeartRateZoneRangesSchema>;

/**
 * Zod schema for Zones.
 */
export const ZonesSchema = z.object({
  heart_rate: HeartRateZoneRangesSchema,
  power: PowerZoneRangesSchema,
});

/** Zones type inferred from ZonesSchema */
export type Zones = z.infer<typeof ZonesSchema>;
