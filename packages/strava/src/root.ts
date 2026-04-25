import type * as CliApp from '@epdoc/cliapp';
import { Option } from '@epdoc/strava-app';
import { AthleteCommand } from '@epdoc/strava-athlete';
import { BaseRootCmdClass, type Ctx, TextBuilder } from '@epdoc/strava-core';
import { GpxCommand } from './gpx.ts';
import { KmlCommand } from './kml.ts';
import { PdfCommand } from './pdf.ts';

type OutputFormat = Ctx.OutputFormat;

type RootCmdOpts = CliApp.LogCmdOptions & {
  imperial?: boolean;
  format?: OutputFormat;
};

export class RootCommand extends BaseRootCmdClass<RootCmdOpts> {
  override defineMetadata() {
    this.description = 'Generate PDF import form data, GPX and KML files from Strava activities';
    this.name = 'strava';
  }

  override defineOptions(): void {
    this.option(Option.def.imperial).emit();
    this.option(Option.def.format).emit();
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
      new PdfCommand(ctx),
      new AthleteCommand(ctx),
    ];
  }

  helpText(): string {
    const b = new TextBuilder();
    b.newline();
    b.line.h1('Notes:');
    b.newline();
    b.line.text(
      'Generate PDF Acroforms data, GPX and KML files from Strava activities.',
    );
    b.newline();

    b.line.h2('Subcommands:');
    b.line.label('  gpx').text('  Generate GPX files for GPS devices');
    b.line.label('  kml').text('  Generate KML files for Google Earth');
    b.line.label('  forms').text('  Generate XML data for Adobe Acrobat PDF forms');

    b.newline();
    b.line.h2('Global Options:');
    b.line.label('  -i, --imperial').text('  Use imperial units (miles, feet)');
    b.line.label('  -f, --format <format>')
      .text('  Some commands support different output formats (e.g. -f json)');

    b.newline();
    b.line.h2('Examples:');
    b.line.ibullet().text('Generate Acroforms data since last run');
    b.line.value('  strava pdf');
    b.line.ibullet().text('Generate GPX for January 2024 activities');
    b.line.value('  strava gpx --date 20240101-20240131');
    b.line.ibullet().text('Generate KML with activities and starred segments');
    b.line.value('  strava kml --date 202401 --segments');
    b.line.ibullet().text('Generate KML with only starred segments');
    b.line.value('  strava kml --date 20240101-20241231 --segments only');

    return b.toString();
  }
}
