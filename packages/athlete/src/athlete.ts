import * as App from '@epdoc/strava-app';
import type { Ctx } from '@epdoc/strava-core';

export type AthleteOptions = {
  athleteId?: string;
};

export class AthleteTool extends App.BaseClass {
  #opts: AthleteOptions;

  constructor(ctx: Ctx.Context, opts: AthleteOptions = {}) {
    super(ctx);
    this.#opts = opts;
  }

  async run(): Promise<void> {
    try {
      this.ctx.app = new App.Main(this.ctx);

      await this.app.init({ strava: true, userSettings: true });

      const athleteId = this.#opts.athleteId ? Number(this.#opts.athleteId) : undefined;

      this.log.info.section().emit();
      this.log.info.h1('Retrieve Athlete Information').emit();

      await this.app.getAthlete(athleteId);

      // Display athlete information
      if (this.app.athlete) {
        this.log.info.section('Athlete Information').emit();
        this.log.indent();
        const athleteInfo = [
          {
            label: 'Name:',
            value: `${this.app.athlete.firstname} ${this.app.athlete.lastname}`,
          },
          { label: 'ID:', value: String(this.app.athlete.id) },
          { label: 'City:', value: this.app.athlete.city || 'Not specified' },
          {
            label: 'State:',
            value: this.app.athlete.state || 'Not specified',
          },
          {
            label: 'Country:',
            value: this.app.athlete.country || 'Not specified',
          },
        ];

        const maxLabelLength = athleteInfo.reduce(
          (max, item) => Math.max(max, item.label.length),
          0,
        );

        athleteInfo.forEach((item) => {
          this.log.info.label(item.label.padEnd(maxLabelLength)).value(
            item.value,
          ).emit();
        });

        if (this.app.athlete.bikes && this.app.athlete.bikes.length > 0) {
          this.log.info.h3('Bikes:').emit();
          this.log.indent();
          const userBikes = this.app.userSettings?.bikes;
          const bikeInfo = this.app.athlete.bikes.map((bike) => {
            const userBike = userBikes?.find((b) => b.pattern === bike.name);
            return {
              label: bike.name + ':',
              id: String(bike.id),
              userBikeName: userBike?.name || '',
            };
          });

          const maxBikeLabelLength = bikeInfo.reduce(
            (max, item) => Math.max(max, item.label.length),
            0,
          );
          const maxBikeIdLength = bikeInfo.reduce(
            (max, item) => Math.max(max, item.id.length),
            0,
          );

          bikeInfo.forEach((item) => {
            this.log.info
              .label(item.label.padEnd(maxBikeLabelLength))
              .value(item.id.padEnd(maxBikeIdLength))
              .h3(item.userBikeName)
              .emit();
          });
          this.log.outdent();
        }
        this.log.outdent();
        this.log.info.section().emit();
      } else {
        this.log.warn.warn('No athlete information retrieved').emit();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.log.info.ierror().text('Failed to retrieve athlete information:')
        .error(errorMsg).emit();
      throw err;
    }
  }
}
