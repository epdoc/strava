import * as CliApp from "@epdoc/cliapp";
import type { DateRanges } from "@epdoc/daterange";
import { AthleteCommand } from "@epdoc/strava-athlete";
import {
  BaseRootCmdClass,
  Ctx,
  Options,
  type OutputFormat,
} from "@epdoc/strava-core";
import { GpxCommand } from "@epdoc/strava-gpx";
import { InfoCommand } from "@epdoc/strava-info";
import type { Api } from "../dep.ts";

type RootCmdOpts = CliApp.CmdOptions & {
  date: DateRanges;
  imperial?: boolean;
  offline: boolean;
  athleteId?: Api.Schema.AthleteId;
  format?: OutputFormat;
};

export class RootCommand extends BaseRootCmdClass<RootCmdOpts> {
  get info(): Ctx.CustomMsgBuilder {
    return this.ctx.log.info;
  }

  override defineOptions(): void {
    this.option(Options.optionDef.format).emit();
    // this.option(Options.optionDef.date).emit();
    this.option(Options.optionDef.imperial).emit();
    this.option(Options.optionDef.offline).emit();
    this.addHelpText("\nThis is help text for the root command.");
    this.addHelpText("This is more help text for the root command.");
  }

  override hydrateContext(opts: RootOpts, _args: CliApp.CmdArgs): void {
    const ctx = this.activeCtx();
    // We can apply the options to the context here, or in the action method
    ctx.format = opts.format ?? "auto";
    ctx.imperial = opts.imperial ?? false;
    ctx.offline = opts.offline ?? false;
  }

  override execute(_opts: RootOpts, _args: CliApp.CmdArgs): void {
    this.commander.help();
  }

  protected override getSubCommands(): BaseRootCmdClass<RootCmdOpts>[] {
    return [
      new InfoCommand(this.ctx),
      new GpxCommand(this.ctx),
      new AthleteCommand(this.ctx),
    ];
  }
}
