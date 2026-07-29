import * as CliApp from '@epdoc/cliapp';
import { Ctx } from '@epdoc/strava-core';
import build from './build/build-info.json' with { type: 'json' };
import pkg from './deno.json' with { type: 'json' };
import { RootCommand } from './src/mod.ts';
const buildInfo = build as CliApp.BuildInfoFile;

if (import.meta.main) {
  const ctx = new Ctx.Context({ ...pkg, ...buildInfo });
  await ctx.setupLogging({ pkg: 'strava' });

  const cmd = new RootCommand(ctx, { root: { dryRun: true, trace: false } });
  await cmd.init();

  await CliApp.run(ctx, cmd);
}
