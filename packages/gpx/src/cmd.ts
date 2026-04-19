import type * as CliApp from '@epdoc/cliapp';
import type { DateRanges } from '@epdoc/daterange';
import { Options, BaseRootCmdClass, Ctx } from '@epdoc/strava-core';
import { GpxOptions, GpxTool } from './gpx.ts';

type GpxCmdOptions = CliApp.LogCmdOptions & {
  athleteId?: string;
  date: DateRanges;
  output?: string;
  laps?: boolean;
  noTracks?: boolean;
  commute?: 'yes' | 'no' | 'all';
  type?: string[];
  blackout?: boolean;
  allowDups?: boolean;
  region?: string;
  imperial?: boolean;
};

export class GpxCommand extends BaseRootCmdClass<GpxCmdOptions> {
  override defineMetadata() {
    this.description = 'Generate GPX files from Strava activities';
    this.name = 'gpx';
  }

  override defineOptions(): void {
    this.option('--athleteId <id>', 'Athlete ID (defaults to authenticated user)').emit();
    this.option(Options.optionDefs.date).emit();
    this.option(Options.optionDefs.output).emit();
    this.option(Options.optionDefs.laps).emit();
    this.option(Options.optionDefs.noTracks).emit();
    this.option(Options.optionDefs.commute).emit();
    this.option(Options.optionDefs.type).emit();
    this.option(Options.optionDefs.blackout).emit();
    this.option(Options.optionDefs.allowDups).emit();
    this.option(Options.optionDefs.region).emit();
    this.addHelpText(this.helpText());
  }

  helpText(): string {
    const msg = new Ctx.CustomMsgBuilder();
    msg.h1('\nGPX Generation\n');
    msg.text('Generate GPX files from Strava activities for use in GPS devices and mapping software.\n\n');

    msg.h2('Output Behavior:\n');
    msg.label('  •').text('By default, all activities are combined into a single GPX file\n');
    msg.label('  •').text('Default filename is based on date range (YYYYMMDD-YYYYMMDD.gpx)\n');
    msg.label('  •').text('Files are saved to gpxFolder from user settings (~/.strava/user.settings.json)\n');
    msg.label('  •').text('Use --output to specify a custom filename (relative to gpxFolder)\n\n');

    msg.h2('Examples:\n');
    msg.label('  ').value('strava-gpx --date 20240101-20240131\n');
    msg.text('      Generate GPX for all activities in January 2024\n\n');
    msg.label('  ').value('strava-gpx --date 20240101-20241231 --output 2024-rides.gpx\n');
    msg.text('      Generate GPX with custom filename\n\n');
    msg.label('  ').value('strava-gpx --date 20240101-20241231 --region CR\n');
    msg.text('      Generate GPX for Costa Rica activities only\n\n');
    msg.label('  ').value('strava-gpx --date 20240101-20241231 --type Ride --laps\n');
    msg.text('      Generate GPX with lap waypoints for rides only\n\n');
    msg.label('  ').value('strava-gpx --date 20240101-20241231 --laps --no-tracks\n');
    msg.text('      Generate GPX with only lap waypoints (no tracks)\n');

    return msg.format();
  }

  override async execute(
    options: GpxCmdOptions,
    _args: CliApp.CmdArgs,
  ): Promise<void> {
    // Convert options to GpxOptions
    const gpxOpts: GpxOptions = {
      athleteId: options.athleteId,
      date: options.date,
      output: options.output,
      laps: options.laps,
      noTracks: options.noTracks,
      commute: options.commute,
      type: options.type,
      blackout: options.blackout,
      allowDups: options.allowDups,
      region: options.region,
      imperial: options.imperial,
    };

    const tool = new GpxTool(this.ctx, gpxOpts);
    await tool.run();
  }
}
