import type * as CliApp from '@epdoc/cliapp';
import type { DateRanges } from '@epdoc/daterange';
import { buildDateHelp, dateOptionDef } from '@epdoc/daterange';
import * as App from '@epdoc/strava-app';
import { Activity } from '@epdoc/strava-app';
import { BaseRootCmdClass, Ctx, Options } from '@epdoc/strava-core';
import { Types } from '@epdoc/strava-schema';
import { assert } from '@std/assert/assert';
import { GpxOptions, GpxTool } from './gpx.ts';

const REG = {
  commuteOnly: new RegExp(/^(yes)$/i),
  nonCommuteOnly: new RegExp(/^(no)$/i),
};

type GpxCmdOptions = CliApp.LogCmdOptions & {
  athleteId?: string;
  date: DateRanges;
  output?: string;
  laps?: boolean;
  noTracks?: boolean;
  blackout?: boolean;
  allowDups?: boolean;
  imperial?: boolean;
  /** Filter based on activity type */
  type?: string[];
  /** Filter based on commute or non commute */
  commute?: 'yes' | 'no' | 'all';
  /** Filter based on region (ON,CR,BC,EU,MX) */
  region?: string[];
};

export class GpxCommand extends BaseRootCmdClass<GpxCmdOptions> {
  override defineMetadata() {
    this.description = 'Generate GPX files from Strava activities';
    this.name = 'gpx';
  }

  override defineOptions(): void {
    this.option('--athleteId <id>', 'Athlete ID (defaults to authenticated user)').emit();
    const help = buildDateHelp(new Ctx.CustomMsgBuilder()).format();
    this.option({ ...dateOptionDef, help: help } as CliApp.OptionDef).emit();
    this.option(Options.optionDefs.output).emit();
    this.option(Options.optionDefs.laps).emit();
    this.option(Options.optionDefs.noTracks).emit();
    this.option(Options.optionDefs.blackout).emit();
    this.option(Options.optionDefs.allowDups).emit();
    this.option(Activity.optionDefs.commute).emit();
    this.option(Activity.optionDefs.type).emit();
    this.option(Activity.optionDefs.region).emit();
    this.addHelpText(this.helpText());
  }

  helpText(): string {
    const msg = new Ctx.CustomMsgBuilder();
    msg.h1('\nGPX Generation\n');
    msg.text(
      'Generate GPX files from Strava activities for use in GPS devices and mapping software.\n\n',
    );

    msg.h2('Output Behavior:\n');
    msg.label('  •').text('By default, all activities are combined into a single GPX file\n');
    msg.label('  •').text('Default filename is based on date range (YYYYMMDD-YYYYMMDD.gpx)\n');
    msg.label('  •').text(
      'Files are saved to gpxFolder from user settings (~/.strava/user.settings.json)\n',
    );
    msg.label('  •').text('Use --output to specify a custom filename (relative to gpxFolder)\n\n');

    msg.h2('Examples:\n');
    msg.label('  ').value('--date 20240101-20240131\n');
    msg.text('      Generate GPX for all activities in January 2024\n\n');
    msg.label('  ').value('--date 20240101-20241231 --output 2024-rides.gpx\n');
    msg.text('      Generate GPX with custom filename\n\n');
    msg.label('  ').value('--date 20240101-20241231 --region CR\n');
    msg.text('      Generate GPX for Costa Rica activities only\n\n');
    msg.label('  ').value('--date 20240101-20241231 --type Ride --laps\n');
    msg.text('      Generate GPX with lap waypoints for rides only\n\n');
    msg.label('  ').value('--date 20240101-20241231 --laps --no-tracks\n');
    msg.text('      Generate GPX with only lap waypoints (no tracks)\n');

    return msg.format();
  }

  override async execute(
    options: GpxCmdOptions,
    _args: CliApp.CmdArgs,
  ): Promise<void> {
    const ctx = this.activeContext();
    assert(ctx);

    // Validate required options
    if (!options.date || !options.date.hasRanges()) {
      throw new Error(
        '--date is required. Specify date range(s) (e.g., 20240101-20241231)',
      );
    }

    // Convert options to GpxOptions
    const filter: Activity.FilterOpts = {
      commuteOnly: REG.commuteOnly.test(options.commute || 'all'),
      nonCommuteOnly: REG.nonCommuteOnly.test(options.commute || 'all'),
      include: options.type ? options.type as Types.ActivityType[] : undefined,
      regions: options.region ? options.region as Activity.Region.Code[] : undefined,
    };

    const gpxOpts: GpxOptions = {
      athleteId: options.athleteId,
      date: options.date,
      output: options.output,
      laps: options.laps,
      noTracks: options.noTracks,
      blackout: options.blackout,
      allowDups: options.allowDups,
      imperial: options.imperial,
    };

    const app = new App.Main(this.ctx);
    ctx.app = app;
    await app.init({ strava: true, userSettings: true });

          ctx.log.info.h1('GPX File Generator').emit();


    const activities = new Activity.Collection(this.ctx);
    await activities.getForDateRange(options.date);
    activities.filter(filter);

    await activities.getTrackPoints({})

          // Build track options
      const trackOpts: App.Track.Opts = {
        activities: true,
        date: this.opts.date,
        output: outputPath as FS.Path,
        laps: this.opts.laps,
        noTracks: this.opts.noTracks,
        imperial: this.opts.imperial ?? false,
        blackout: this.opts.blackout ?? false,
        allowDups: this.opts.allowDups ?? false,
        type: (this.opts.type ?? []) as Schema.Types.ActivityType[],
        commute: this.opts.commute ?? 'all',
        regions: _.isNonEmptyArray(this.opts.regions) ? this.opts.regions : undefined,
      };



    app.getTrack(trackOpts,'gpx')

    const tool = new GpxTool(this.ctx);
    tool.
  }
}
