import { z } from 'zod';
import { ResourceStateSchema } from './consts.ts';

/**
 * Zod schema for GearId.
 */
export const GearIdSchema = z.string();

/** GearId type inferred from GearIdSchema */
export type GearId = z.infer<typeof GearIdSchema>;

/**
 * Zod schema for DetailedGear.
 */
export const DetailedGearSchema = z.object({
  id: z.string(),
  resource_state: ResourceStateSchema,
  primary: z.boolean(),
  name: z.string(),
  distance: z.number(),
  brand_name: z.string(),
  model_name: z.string(),
  frame_type: z.number(),
  description: z.string(),
  converted_distance: z.number().optional(),
});

/** DetailedGear type inferred from DetailedGearSchema */
export type DetailedGear = z.infer<typeof DetailedGearSchema>;

/**
 * Zod schema for SummaryGear.
 */
export const SummaryGearSchema = z.object({
  id: GearIdSchema,
  resource_state: ResourceStateSchema,
  primary: z.boolean(),
  name: z.string(),
  distance: z.number(),
});

/** SummaryGear type inferred from SummaryGearSchema */
export type SummaryGear = z.infer<typeof SummaryGearSchema>;
