# @jpravetz/tools-core

Core utilities for workspace management tools in the @jpravetz/tools monorepo.

## Overview

This package provides shared infrastructure for building CLI tools that work with Deno workspaces and deno.json configurations. It's designed to be used across the monorepo for consistent workspace handling, configuration management, and CLI application structure.

## Features

- **Context Management**: Shared application context with logging, filtering, and configuration
- **DenoConfig**: High-level interface for reading and modifying deno.json files
- **ProjectRoot**: Utilities for finding project roots and detecting workspaces
- **Workspace Filtering**: Pattern-based filtering of workspace packages
- **Base Classes**: Abstract base classes for domain objects and CLI commands

## Usage

### Context

The `Context` class provides the foundation for CLI applications:

```typescript
import { Ctx } from '@jpravetz/tools-core';

const ctx = new Ctx.Context(pkg);
await ctx.setupLogging({ pkg: 'my-app' });

// Filter workspaces
ctx.include = ['@epdoc/*'];
ctx.exclude = ['*test*'];
```

### DenoConfig

Work with deno.json files:

```typescript
import { DenoConfig } from '@jpravetz/tools-core';

const config = await DenoConfig.load(ctx, './deno.json');
console.log(config.name);    // Package name
console.log(config.version); // Package version

// Check if it's a workspace root
if (config.isWorkspaceRoot) {
  const members = await config.getMembers();
}

// Modify and save
config.setVersion('1.2.3');
if (config.isDirty) {
  await config.save();
}
```

### ProjectRoot

Find project roots:

```typescript
import { ProjectRoot } from '@jpravetz/tools-core';

// Find the first deno.json
const project = await ProjectRoot.find();

// Find the workspace root (traverses past single packages)
const workspace = await ProjectRoot.findRoot();

if (workspace?.isWorkspace) {
  console.log('Found workspace at:', workspace.root.path);
}
```

### Workspace Filtering

Filter workspace names by patterns:

```typescript
import { filterWorkspaces } from '@jpravetz/tools-core';

const workspaces = ['@epdoc/core', '@epdoc/dtask', 'my-package'];

// Include only @epdoc packages
const filtered = filterWorkspaces(workspaces, {
  include: ['@epdoc/*']
});

// Exclude test packages
const noTests = filterWorkspaces(workspaces, {
  exclude: ['*test*']
});
```

### Base Classes

Extend base classes for your domain objects:

```typescript
import { BaseClass, Ctx } from '@jpravetz/tools-core';

class MyService extends BaseClass {
  doWork() {
    this.info.text('Starting work').emit();
    this.debug.data({ key: 'value' }).emit();
  }
}

const service = new MyService(ctx);
service.doWork();
```

For CLI commands:

```typescript
import { BaseRootCmdClass } from '@jpravetz/tools-core';

class MyCommand extends BaseRootCmdClass<MyOptions> {
  override defineOptions() {
    this.option('--flag', 'A flag').emit();
  }

  override async execute(opts, args) {
    this.info.text('Running command').emit();
  }
}
```

## Exports

- `BaseClass` - Abstract base class for domain objects with logging
- `BaseRootCmdClass` - Abstract base class for root CLI commands
- `Ctx` - Context module (Context class, CustomMsgBuilder)
- `DenoConfig` - Configuration manager for deno.json files
- `DenoJson` - Type definition for deno.json structure
- `PackageType` - Type for package classification
- `ProjectRoot` - Utility for finding project roots
- `ProjectRootResult` - Type for project root search results
- `filterWorkspaces` - Function for filtering workspace names

## Architecture

This package follows the design principles established in @epdoc/cliapp and @epdoc/logger:

- **Context-centric**: All operations are performed within a context that provides logging and configuration
- **Type-safe**: Full TypeScript support with proper generic constraints
- **Composable**: Small, focused utilities that work together
- **Testable**: Static methods and clear interfaces make testing straightforward

## Dependencies

- `@epdoc/cliapp` - CLI application framework
- `@epdoc/fs` - File system utilities
- `@epdoc/logger` - Logging infrastructure
- `@epdoc/terminal` - Terminal utilities (pattern matching)
- `@epdoc/type` - Type utilities

## License

MIT
