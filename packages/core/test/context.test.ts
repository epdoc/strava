import { expect } from '@std/expect';
import { describe, it } from '@std/testing/bdd';
import { Ctx, filterWorkspaces } from '../src/mod.ts';

const pkg = { name: 'test-pkg', version: '1.0.0', description: 'Test package' };

describe('Context', () => {
  it('should create context with package info', () => {
    const ctx = new Ctx.Context({
      name: 'test-pkg',
      version: '1.0.0',
      description: 'Test package',
    });

    expect(ctx).toBeDefined();
  });

  it('should setup logging', async () => {
    const ctx = new Ctx.Context({
      name: 'test-pkg',
      version: '1.0.0',
      description: 'Test package',
    });

    await ctx.setupLogging({ pkg: 'test' });

    expect(ctx.log).toBeDefined();
  });

  it('should inherit from parent context', async () => {
    const parent = new Ctx.Context({
      name: 'parent',
      version: '1.0.0',
      description: 'Parent package',
    });
    await parent.setupLogging();

    const child = new Ctx.Context(parent);

    expect(child).toBeDefined();
    expect(child.log).toBeDefined();
  });

  it('should have rootConfig property', () => {
    const ctx = new Ctx.Context(pkg);
    expect(ctx._rootConfig).toBeUndefined();
  });
});

describe('filterWorkspaces', () => {
  const workspaces = ['@epdoc/core', '@epdoc/dtask', '@jpravetz/tools', 'standalone-pkg'];

  it('should return all workspaces when no filters are provided', () => {
    const result = filterWorkspaces(workspaces);
    expect(result).toEqual(workspaces);
  });

  it('should filter by include patterns (glob)', () => {
    const result = filterWorkspaces(workspaces, { include: ['@epdoc/*'] });
    expect(result).toEqual(['@epdoc/core', '@epdoc/dtask']);
  });

  it('should filter by include patterns (regex)', () => {
    const result = filterWorkspaces(workspaces, { include: ['/^[a-z]+-/'] });
    expect(result).toEqual(['standalone-pkg']);
  });

  it('should filter by exclude patterns (glob)', () => {
    const result = filterWorkspaces(workspaces, { exclude: ['@epdoc/*'] });
    expect(result).toEqual(['@jpravetz/tools', 'standalone-pkg']);
  });

  it('should apply include before exclude', () => {
    const result = filterWorkspaces(workspaces, {
      include: ['@epdoc/*', '@jpravetz/*'],
      exclude: ['@epdoc/dtask'],
    });
    // First include: @epdoc/core, @epdoc/dtask, @jpravetz/tools
    // Then exclude: remove @epdoc/dtask
    expect(result).toEqual(['@epdoc/core', '@jpravetz/tools']);
  });

  it('should handle multiple include patterns', () => {
    const result = filterWorkspaces(workspaces, {
      include: ['@epdoc/*', 'standalone-*'],
    });
    expect(result).toEqual(['@epdoc/core', '@epdoc/dtask', 'standalone-pkg']);
  });

  it('should handle multiple exclude patterns', () => {
    const result = filterWorkspaces(workspaces, {
      exclude: ['@epdoc/*', '@jpravetz/*'],
    });
    expect(result).toEqual(['standalone-pkg']);
  });

  it('should return empty array when nothing matches include', () => {
    const result = filterWorkspaces(workspaces, { include: ['nonexistent/*'] });
    expect(result).toEqual([]);
  });

  it('should return empty array when all excluded', () => {
    const result = filterWorkspaces(workspaces, { exclude: ['*', '@*/*'] });
    expect(result).toEqual([]);
  });

  it('should handle empty workspaces array', () => {
    const result = filterWorkspaces([], { include: ['*'] });
    expect(result).toEqual([]);
  });
});
