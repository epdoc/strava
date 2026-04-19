import * as CliApp from '@epdoc/cliapp';
import type { Context, CustomMsgBuilder } from './context.ts';

/**
 * Abstract base class for all domain classes in the core package.
 *
 * Provides convenient access to logging methods and the application context.
 *
 * @example
 * ```typescript
 * class MyService extends BaseClass {
 *   doWork() {
 *     this.info.text('Starting work').emit();
 *     this.debug.data({ key: 'value' }).emit();
 *   }
 * }
 * ```
 */
export abstract class BaseClass extends CliApp.BaseClass<Context, CustomMsgBuilder, CliApp.Ctx.Logger> {
}

/**
 * Abstract base class for root commands in the core package.
 *
 * Extends the cliapp command base with the core Context type.
 *
 * @template TOpts - Command options type
 */
export abstract class BaseRootCmdClass<TOpts extends CliApp.CmdOptions>
  extends CliApp.Cmd.AbstractBase<Context, Context, TOpts> {}
