import { z } from 'zod';
import { ResourceStateSchema, SexSchema, SportNameSchema, UnitSystemSchema } from './consts.ts';
import { StravaLongIntSchema } from './types.ts';
import { SummaryGearSchema } from './gear.ts';

/**
 * Zod schema for AthleteId.
 */
export const AthleteIdSchema: z.ZodNumber = StravaLongIntSchema;

/** AthleteId type inferred from AthleteIdSchema */
export type AthleteId = z.infer<typeof AthleteIdSchema>;

/**
 * Zod schema for SummaryClub.
 */
export const SummaryClubSchema: z.ZodObject<{
  id: typeof StravaLongIntSchema;
  resource_state: typeof ResourceStateSchema;
  name: z.ZodString;
  profile_medium: z.ZodString;
  cover_photo: z.ZodString;
  cover_photo_small: z.ZodString;
  sport_type: typeof SportNameSchema;
  city: z.ZodString;
  state: z.ZodString;
  country: z.ZodString;
  private: z.ZodBoolean;
  member_count: z.ZodNumber;
  featured: z.ZodBoolean;
  verified: z.ZodBoolean;
  url: z.ZodString;
}> = z.object({
  id: StravaLongIntSchema,
  resource_state: ResourceStateSchema,
  name: z.string(),
  profile_medium: z.string(),
  cover_photo: z.string(),
  cover_photo_small: z.string(),
  sport_type: SportNameSchema,
  city: z.string(),
  state: z.string(),
  country: z.string(),
  private: z.boolean(),
  member_count: z.number(),
  featured: z.boolean(),
  verified: z.boolean(),
  url: z.string(),
});

/** SummaryClub type inferred from SummaryClubSchema */
export type SummaryClub = z.infer<typeof SummaryClubSchema>;

/**
 * Zod schema for SummaryAthlete.
 */
export const SummaryAthleteSchema: z.ZodObject<{
  id: typeof AthleteIdSchema;
  resource_state: typeof ResourceStateSchema;
  firstname: z.ZodString;
  lastname: z.ZodString;
  profile_medium: z.ZodString;
  profile: z.ZodString;
  city: z.ZodString;
  state: z.ZodString;
  country: z.ZodString;
  sex: typeof SexSchema;
  summit: z.ZodBoolean;
  created_at: z.ZodString;
  updated_at: z.ZodString;
  weight: z.ZodOptional<z.ZodNumber>;
  badge_type_id: z.ZodOptional<z.ZodNumber>;
}> = z.object({
  id: AthleteIdSchema,
  resource_state: ResourceStateSchema,
  firstname: z.string(),
  lastname: z.string(),
  profile_medium: z.string(),
  profile: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  sex: SexSchema,
  summit: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  weight: z.number().optional(),
  badge_type_id: z.number().optional(),
});

/** SummaryAthlete type inferred from SummaryAthleteSchema */
export type SummaryAthlete = z.infer<typeof SummaryAthleteSchema>;

/**
 * Zod schema for DetailedAthlete.
 */
export const DetailedAthleteSchema: z.ZodObject<
  z.objectUtil.extendShape<
    typeof SummaryAthleteSchema.shape,
    {
      follower_count: z.ZodNumber;
      friend_count: z.ZodNumber;
      measurement_preference: typeof UnitSystemSchema;
      ftp: z.ZodNullable<z.ZodNumber>;
      clubs: z.ZodArray<typeof SummaryClubSchema>;
      bikes: z.ZodArray<typeof SummaryGearSchema>;
      shoes: z.ZodArray<typeof SummaryGearSchema>;
      email: z.ZodOptional<z.ZodString>;
      athlete_type: z.ZodOptional<z.ZodNumber>;
    }
  >
> = SummaryAthleteSchema.extend({
  follower_count: z.number(),
  friend_count: z.number(),
  measurement_preference: UnitSystemSchema,
  ftp: z.number().nullable(),
  clubs: z.array(SummaryClubSchema),
  bikes: z.array(SummaryGearSchema),
  shoes: z.array(SummaryGearSchema),
  email: z.string().optional(),
  athlete_type: z.number().optional(),
});

/** DetailedAthlete type inferred from DetailedAthleteSchema */
export type DetailedAthlete = z.infer<typeof DetailedAthleteSchema>;

/**
 * Zod schema for Comment.
 */
export const CommentSchema: z.ZodObject<{
  id: typeof StravaLongIntSchema;
  activity_id: typeof StravaLongIntSchema;
  text: z.ZodString;
  athlete: typeof SummaryAthleteSchema;
  created_at: z.ZodString;
}> = z.object({
  id: StravaLongIntSchema,
  activity_id: StravaLongIntSchema,
  text: z.string(),
  athlete: SummaryAthleteSchema,
  created_at: z.string().datetime(),
});

/** Comment type inferred from CommentSchema */
export type Comment = z.infer<typeof CommentSchema>;
