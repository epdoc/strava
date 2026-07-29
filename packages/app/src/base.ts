import * as Strava from '@epdoc/strava-api';
import * as Core from '@epdoc/strava-core';
import { assert } from '@std/assert/assert';
import { Main } from './app.ts';

/**
 * Base class for domain classes in the strava-app package.
 *
 * Extends {@link Core.BaseClass} with typed accessors for the application's
 * {@link Main} instance and its {@link Strava.Api} client. Domain classes in
 * the activity, segment, bikelog, and track packages extend this class to
 * get convenient access to shared services without casting.
 */
export class BaseClass extends Core.BaseClass {
  /**
   * The application's Main instance, providing access to business-logic
   * methods and shared state.
   */
  get app(): Main {
    assert(this.ctx.app instanceof Main);
    return this.ctx.app;
  }

  /**
   * The configured Strava API client, authenticated with the user's OAuth
   * credentials.
   */
  get api(): Strava.Api {
    assert(
      this.ctx.app instanceof Main && this.ctx.app.api instanceof Strava.Api,
      'api is not initialized',
    );
    return this.app.api;
  }
}
