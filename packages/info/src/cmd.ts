import type * as CliApp from '@epdoc/cliapp';
import type { DateRanges } from '@epdoc/daterange';
import { BaseRootCmdClass, Ctx, Options } from '@epdoc/strava-core';
import { InfoOptions, InfoTool } from './info.ts';

type InfoCmdOptions = CliApp.LogCmdOptions & {
  athleteId?: string;
  date: DateRanges;
  imperial?: boolean;
  format?: 'json' | 'yaml' | 'text' | 'table';
};

export class InfoCommand extends BaseRootCmdClass<InfoCmdOptions> {
  override defineMetadata() {
    this.description = 'Query Strava activity information';
    this.name = 'info';
  }

  override defineOptions(): void {
    this.option('--athleteId <id>', 'Athlete ID (defaults to authenticated user)').emit();
    this.option(Options.optionDefs.date).emit();
    this.option(Options.optionDefs.imperial).emit();
    this.option(Options.optionDefs.format).emit();
    this.addHelpText(this.helpText());
  }

  helpText(): string {
    const msg = new Ctx.CustomMsgBuilder();
    msg.h1('\nActivity Information\n');
    msg.text('Query information about Strava activities, including regions and statistics.\n\n');

    msg.h2('Examples:\n');
    msg.label('  ').value('strava-info --date 20240101-20241231\n');
    msg.text('      List all regions for activities in 2024\n\n');
    msg.label('  ').value('strava-info --date 20240101-20241231 --imperial\n');
    msg.text('      List regions with distances in miles\n\n');
    msg.label('  ').value('strava-info --date 7d-now\n');
    msg.text('      List regions for the last 7 days\n');

    return msg.format();
  }

  override async execute(
    options: InfoCmdOptions,
    _args: CliApp.CmdArgs,
  ): Promise<void> {
    // Convert options to InfoOptions
    const infoOpts: InfoOptions = {
      athleteId: options.athleteId,
      date: options.date,
      imperial: options.imperial,
      format: options.format,
    };

    const tool = new InfoTool(this.ctx, infoOpts);
    await tool.run();
  }
}
