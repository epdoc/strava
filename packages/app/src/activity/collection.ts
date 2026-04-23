import type { DateRanges } from '@epdoc/daterange';
import { DateTime } from '@epdoc/datetime';
import type { Api } from '@epdoc/strava-api';
import * as Strava from '@epdoc/strava-api';
import { BaseClass, type Ctx } from '@epdoc/strava-core';
import type * as Schema from '@epdoc/strava-schema';
import { _, type Integer } from '@epdoc/type';
import { assert } from '@std/assert/assert';
import { ActivityItem, type ActivityFilterOpts } from './item.ts';
import type { Region } from './region.ts';

export type GetActivitiesOpts = {
  detailed?: boolean;
  streams?: Schema.Stream.StreamKey[];
  coordinates?: boolean;
  starredSegments?: boolean;
  filter?: ActivityFilterOpts;
  dedup?: boolean;
  blackoutZones?: Strava.LatLngRect[];
};

export class ActivityCollection extends BaseClass {
  #activities: ActivityItem[] = [];
  #api: Api;
  #athlete?: Schema.Athlete.Detailed;
  #regions?: Region[];

  constructor(ctx: Ctx.Context, api: Api, athlete?: Schema.Athlete.Detailed, regions?: Region[]) {
    super(ctx);
    this.#api = api;
    this.#athlete = athlete;
    this.#regions = regions;
  }

  get api(): Api {
    return this.#api;
  }

  get athlete(): Schema.Athlete.Detailed {
    assert(this.#athlete);
    return this.#athlete;
  }

  get length(): Integer {
    return this.#activities.length;
  }

  get activities(): ActivityItem[] {
    return this.#activities;
  }

  /**
   * Sets the regions for geographic filtering.
   * @param regions Array of regions to use for filtering.
   */
  set regions(regions: Region[] | undefined) {
    this.#regions = regions;
  }

  /**
   * Fetches activities for a given set of date ranges.
   *
   * This method retrieves activities from the Strava API within one or more
   * specified date ranges. It can optionally fetch detailed information,
   * track points, and attach starred segment data to the activities.
   *
   * @param ctx - The application context for logging.
   * @param date - The date ranges to fetch activities for.
   * @param [opts={}] - Options for fetching activities.
   * @param [opts.detailed=false] - Whether to fetch detailed information for each activity.
   * @param [opts.coordinates=false] - Whether to fetch track points for each activity.
   * @param [opts.starredSegments=false] - Whether to attach starred segment information to each activity.
   * @param [opts.filter] - A filter to apply to the activities.
   * @returns A promise that resolves to an array of activities.
   */
  async getForDateRange(date: DateRanges): Promise<void> {
    this.#activities = [];

    // await this.api.refreshToken();

    this.log.info.text('Retrieving activities ...').dateRange(date).start();

    const athleteId: Schema.Athlete.Id = (this.athlete && Strava.isStravaId(this.athlete.id))
      ? this.athlete.id
      : 0;

    // Get activities for each date range
    for (const dateRange of date.ranges) {
      const apiOpts: Strava.ActivityOpts = {
        athleteId,
        query: {
          per_page: 200,
          after: Math.floor(
            (dateRange.after
              ? dateRange.after.epochMilliseconds
              : new DateTime(0).epochMilliseconds) /
              1000,
          ),
          before: Math.floor(
            (dateRange.before
              ? dateRange.before.epochMilliseconds
              : DateTime.now().epochMilliseconds) / 1000,
          ),
        },
      };

      const apiActivities = await this.api.getActivities(apiOpts);
      for (const apiActivity of apiActivities) {
        this.#activities.push(new ActivityItem(this.ctx, apiActivity));
      }
    }
    this.log.info.icheck().text('Retrieved a list of').count(this.length)
      .text('Strava activity', 'Strava activities').dateRange(date).stop();
  }

  filter(filter: ActivityFilterOpts = {}): void {
    this.#activities = this.#activities.filter((activity) =>
      activity.include(filter, this.#regions)
    );
  }

  async getSegments(
    opts: GetActivitiesOpts = {},
  ): Promise<void> {
    if (this.length && (opts.detailed || opts.starredSegments)) {
      this.log.info.h2('Retrieving activity details from Strava:').emit();
      this.log.indent();
      const jobs: Promise<void>[] = [];
      this.#activities.forEach((activity) => {
        jobs.push(activity.getDetailed());
      });
      await Promise.all(jobs);
      this.log.outdent();
    }
  }

  async getTrackPoints(
    opts: GetActivitiesOpts = {},
  ): Promise<void> {
    if (this.length) {
      if (_.isNonEmptyArray(opts.streams)) {
        this.log.info.h2('Retrieving track points from Strava:').emit();
        const jobs: Promise<void>[] = [];
        const streams = opts.streams; // Extract to non-null variable
        this.log.indent();
        this.#activities.forEach((activity) => {
          jobs.push(activity.getTrackPoints(streams));
        });
        await Promise.all(jobs);
        this.log.outdent();
        const verbs: string[] = opts.dedup ? ['Redundant'] : [];
        if (_.isNonEmptyArray(opts.blackoutZones)) verbs.push('Blacked-out');
        if (verbs.length) {
          this.log.info.h2('Filtering').h2(verbs.join('and')).h2('track points:').emit();
          this.log.indent();
          this.#activities.forEach((activity) => {
            activity.filterTrackPoints(opts.dedup === true, opts.blackoutZones);
          });
          this.log.outdent();
        }
        // this.log.info.text('Retrieved track points for').count(activities.length)
        //   .text('activity', 'activities').emit();
      }
    }
  }

  /**
   * Attaches starred segment efforts to activities.
   * @param starredSegmentDict Dictionary of starred segment IDs to names.
   */
  attachStarredSegments(starredSegmentDict: Strava.StarredSegmentDict): void {
    if (Object.keys(starredSegmentDict).length === 0) {
      return;
    }
    this.log.info.text('Processing segment efforts for').count(this.length)
      .text('activity:', 'activities:').emit();
    this.log.indent();
    this.#activities.forEach((activity) => {
      const count = activity.attachStarredSegments(starredSegmentDict);
      if (count > 0) {
        this.log.info.text('Found').count(count)
          .text('starred segment effort').text('for').activity(activity).emit();
      }
    });
    this.log.outdent();
  }
}
