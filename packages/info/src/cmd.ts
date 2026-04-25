import type * as CliApp from '@epdoc/cliapp';
import { buildDateHelp, dateOptionDef, DateRanges } from '@epdoc/daterange';
import { DateTime } from '@epdoc/datetime';
import { Option } from '@epdoc/strava-app';
import { BaseRootCmdClass, Ctx } from '@epdoc/strava-core';
import { type InfoOptions, InfoTool } from './info.ts';

type InfoCmdOptions = CliApp.LogCmdOptions & {
  athleteId?: string;
  date: DateRanges;
  format?: Ctx.OutputFormat;
  region?: boolean;
};

export class InfoCommand extends BaseRootCmdClass<InfoCmdOptions> {
  override defineMetadata() {
    this.description = 'Query Strava activity information';
    this.name = 'info';
  }

  override defineOptions(): void {
    const help = buildDateHelp(new Ctx.CustomMsgBuilder()).format();
    this.option({ ...dateOptionDef, help: help } as CliApp.OptionDef).emit();
    this.option(Option.def.format).emit();
    this.option('--region', 'List available regions from configuration')
      .default(false)
      .emit();
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
    if (options.format) {
      this.ctx.format = options.format;
    }

    const defaultDate = DateTime.now().setTz().subtract({ days: 7 });
    const date = options.date ? options.date : new DateRanges([{ after: defaultDate }]);

    const infoOpts: InfoOptions = {
      athleteId: options.athleteId,
      date,
      region: options.region,
    };

    const tool = new InfoTool(this.ctx, infoOpts);
    await tool.run();
  }
}
