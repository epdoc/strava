# @epdoc/strava-core

Core infrastructure for Strava CLI applications.

## Overview

Provides shared context, base classes, and logging infrastructure used across all Strava packages.

## Key Exports

| Export | Description |
|--------|-------------|
| `BaseClass` | Abstract base for domain classes with `.log`, `.info`, `.debug`, `.error` |
| `BaseRootCmdClass<TOpts>` | Abstract base for root CLI commands |
| `Ctx.Context` | Application context (extends `@epdoc/cliapp`'s `AbstractBase`) |
| `Ctx.CustomMsgBuilder` | Logging builder with `.fs()`, `.activity()`, `.dateRange()` helpers |

## Usage

```typescript
import { BaseClass, Ctx } from '@epdoc/strava-core';

const ctx = new Ctx.Context(pkg);
await ctx.setupLogging({ pkg: 'my-app' });

class MyService extends BaseClass {
  doWork() {
    this.info.text('Starting').emit();
    this.debug.data({ key: 'value' }).emit();
  }
}
```

## License

MIT
