import * as Strava from '@epdoc/strava-api';
import * as Core from '@epdoc/strava-core';
import { assert } from '@std/assert/assert';
import { Main } from './app.ts';

export class BaseClass extends Core.BaseClass {
  get app(): Main {
    assert(this.ctx.app instanceof Main);
    return this.ctx.app;
  }

  get api(): Strava.Api {
    assert(
      this.ctx.app instanceof Main && this.ctx.app.api instanceof Strava.Api,
      'api is not initialized',
    );
    return this.app.api;
  }
}
