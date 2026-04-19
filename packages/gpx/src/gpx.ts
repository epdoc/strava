import * as App from '@epdoc/strava-app';

export type AthleteOptions = {
  athleteId?: string;
};

/**
 * Command to retrieve and display athlete information from Strava API.
 *
 * This command fetches and displays the logged-in athlete's profile information including:
 * - Name, ID, location (city, state, country)
 * - List of bikes with IDs
 * - User-configured bike display names (if defined in user settings)
 *
 * The command follows the established pattern of delegating business logic to the app layer
 * (this.app.getAthlete) while handling only the CLI presentation concerns.
 *
 * @example
 * ```bash
 * # From workspace root
 * deno run -A ./packages/strava/main.ts athlete
 * ```
 */
export class AthleteTool extends App.BaseClass {
  /**
   * Initializes the athlete command with its action handler and options.
   *
   * Sets up the command action that:
   * 1. Initializes the app with Strava API and user settings
   * 2. Fetches athlete data via this.app.getAthlete()
   * 3. Formats and displays athlete information with proper indentation
   * 4. Shows bike list with user-configured display names
   *
   * @param ctx Application context with logging and app instance
   * @returns Promise resolving to the configured command instance
   */
  async run(): Promise<void> {
    try {
      this.ctx.app = new App.Main(this.ctx);

      // Initialize only what we need for this command
      await this.app.init({ strava: true, userSettings: true });

      // Delegate to app layer for business logic
      await this.app.getAthlete();

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
      this.log.error.error(
        `Failed to retrieve athlete information: ${errorMsg}`,
      ).emit();
      throw err;
    }
  }
}
