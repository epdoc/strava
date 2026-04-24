import type * as CliApp from '@epdoc/cliapp';
import type { DateRanges } from '@epdoc/daterange';
import { BaseRootCmdClass, Ctx, Options } from '@epdoc/strava-core';
import { GpxCommand } from './gpx.ts';
import { KmlCommand } from './kml.ts';

type OutputFormat = Ctx.OutputFormat;

type RootCmdOpts = CliApp.LogCmdOptions & {
  date: DateRanges;
  imperial?: boolean;
  format?: OutputFormat;
};

export class RootCommand extends BaseRootCmdClass<RootCmdOpts> {
  override defineMetadata() {
    this.description = 'Generate GPX and KML files from Strava activities';
    this.name = 'strava-track';
  }

  override defineOptions(): void {
    this.option(Options.optionDefs.format).emit();
    this.option(Options.optionDefs.imperial).emit();
    this.addHelpText(this.helpText());
  }

  override hydrateContext(opts: RootCmdOpts, _args: CliApp.CmdArgs): void {
    const ctx = this.activeContext();
    if (ctx) {
      ctx.format = opts.format ?? 'auto';
      ctx.imperial = opts.imperial ?? false;
    }
  }

  override execute(_opts: RootCmdOpts, _args: CliApp.CmdArgs): void {
    this.commander.help();
  }

  protected override getSubCommands(): BaseRootCmdClass<RootCmdOpts>[] {
    const ctx = this.activeContext();
    return [
      new GpxCommand(ctx),
      new KmlCommand(ctx),
    ];
  }

  helpText(): string {
    const msg = new Ctx.CustomMsgBuilder();
    msg.h1('\nStrava Track Generator\n');
    msg.text(
      'Generate GPX and KML files from Strava activities for use in GPS devices and mapping software.\n\n',
    );

    msg.h2('Subcommands:\n');
    msg.label('  gpx').text('  Generate GPX files for GPS devices\n');
    msg.label('  kml').text('  Generate KML files for Google Earth\n\n');

    msg.h2('Global Options:\n');
    msg.label('  -i, --imperial').text('  Use imperial units (miles, feet)\n');
    msg.label('  -f, --format <format>').text('  Output format for messages\n\n');

    msg.h2('Examples:\n');
    msg.label('  ').value('strava-track gpx --date 20240101-20240131\n');
    msg.text('      Generate GPX for January 2024 activities\n\n');
    msg.label('  ').value('strava-track kml --date 20240101-20241231 --segments\n');
    msg.text('      Generate KML with activities and starred segments\n\n');
    msg.label('  ').value('strava-track kml --date 20240101-20241231 --segments only\n');
    msg.text('      Generate KML with only starred segments\n');

    return msg.format();
  }
}
