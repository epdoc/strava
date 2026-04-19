import { DateTime, type ISODate } from '@epdoc/datetime';
import type * as FS from '@epdoc/fs/fs';
import type * as Strava from '@epdoc/strava-api';
import type { Ctx } from '@epdoc/strava-core';
import { BaseClass } from '../base.ts';
import { _ } from '@epdoc/type';
import type * as State from './types.ts';

/**
 * Manages persistent state for tracking last update times for KML and PDF generation.
 *
 * This class handles reading, writing, and updating the user state file that tracks
 * when activities were last processed. This allows users to run commands without
 * specifying date ranges, automatically fetching only new activities since the last run.
 *
 * @example
 * ```ts
 * const stateFile = new StateFile(new FS.File(statePath));
 * await stateFile.load(ctx);
 *
 * // Get date range for new activities
 * const dateRange = stateFile.getDateRangeFrom('kml');
 *
 * // After processing, update with latest activity
 * await stateFile.updateLastUpdated(ctx, 'kml', activities);
 * ```
 */
export class StateFile extends BaseClass {
  #file: FS.File;
  #state: State.UserState = {};

  /**
   * Creates a new StateFile instance.
   *
   * @param file File instance pointing to the state file location
   */
  constructor(ctx: Ctx.Context, file: FS.File) {
    super(ctx);
    this.#file = file;
  }

  /**
   * Loads the state from the file.
   *
   * If the file doesn't exist or is invalid, initializes with an empty state.
   * This method is safe to call even if the file has never been created.
   *
   * @param ctx Application context for logging
   */
  async load(): Promise<void> {
    try {
      this.log.info.text('Loading state file').relative(this.#file.path).start();
      if (await this.#file.exists()) {
        const rawState = await this.#file.readJson();
        if (_.isDict(rawState)) {
          this.#state = rawState;
          this.log.info.icheck().text('Loaded state file').relative(this.#file.path).stop();
        } else {
          this.log.info.ierror().text('State file is invalid, initializing empty state').relative(
            this.#file.path,
          ).stop();
          this.#state = {};
        }
      } else {
        this.log.info.icheck().text('State file does not exist, initializing empty state').relative(
          this.#file.path,
        ).stop();
        this.#state = {};
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.log.info.icheck().text('Failed to load state file, using empty state').text(errorMsg)
        .relative(this.#file.path).stop();
      this.#state = {};
    }
  }

  /**
   * Saves the current state to the file.
   *
   * @param ctx Application context for logging
   */
  async save(): Promise<void> {
    try {
      this.log.info.text('Saving state file').relative(this.#file.path).start();
      await this.#file.writeJson(this.#state);
      this.log.info.icheck().text('Updated state file').relative(this.#file.path).stop();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.log.info.ierror().text('Failed to save state file:').error(errorMsg).relative(
        this.#file.path,
      ).stop();
      throw err;
    }
  }

  /**
   * Gets the last updated timestamp for a specific output type.
   *
   * @param type Output type ('kml' or 'pdf')
   * @returns ISO date string of last update, or undefined if never updated
   */
  getLastUpdated(type: State.OutputType): ISODate | undefined {
    return this.#state[type]?.lastUpdated;
  }

  /**
   * Updates the last updated timestamp based on the most recent activity in the list.
   *
   * Finds the activity with the latest `startDatetimeLocal` and stores that as the
   * new lastUpdated timestamp for the specified output type. This ensures the next
   * run will fetch activities after this point.
   *
   * **Important**: Uses `startDatetimeLocal` which represents the local time in the
   * activity's timezone. This is correct for both KML and PDF generation, as PDF
   * uses local dates for Julian date calculations.
   *
   * @param ctx Application context for logging
   * @param type Output type ('kml' or 'pdf')
   * @param activities Array of activities that were processed
   */
  async updateLastUpdated(
    type: State.OutputType,
    activities: Strava.Activity[],
  ): Promise<void> {
    if (activities.length === 0) {
      this.log.debug.text('No activities to update state from').emit();
      return;
    }

    // Find the most recent activity by startDatetimeLocal
    let mostRecent: Strava.Activity | undefined;
    for (const activity of activities) {
      if (!mostRecent || activity.startDate.getTime() > mostRecent.startDate.getTime()) {
        mostRecent = activity;
      }
    }

    if (mostRecent) {
      // Initialize the type object if it doesn't exist
      if (!this.#state[type]) {
        this.#state[type] = {};
      }

      // Update the lastUpdated timestamp to the start date + 1 minute
      this.#state[type]!.lastUpdated = new DateTime(mostRecent.startDate.getTime() + 60 * 1000)
        .setTz('local').toISOString() as ISODate;

      this.log.info.text('Updated').value(type).text('last updated to')
        .date(this.#state[type]!.lastUpdated).emit();

      // Save the updated state
      await this.save();
    }
  }

  /**
   * Gets the current state object (for testing/debugging).
   *
   * @returns The current user state
   */
  get state(): State.UserState {
    return this.#state;
  }
}
