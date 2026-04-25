import { CustomMsgBuilder } from './context.ts';

export class TextBuilder {
  lines: (string | CustomMsgBuilder)[] = [];

  get line(): CustomMsgBuilder {
    const line = new CustomMsgBuilder();
    this.lines.push(line);
    return line;
  }

  nl(): TextBuilder {
    this.lines.push('');
    return this;
  }

  newline(): TextBuilder {
    this.lines.push('');
    return this;
  }

  emit(): string {
    return this.lines.map((line) => typeof line === 'string' ? line : line.format()).join('\n');
  }
  toString(): string {
    return this.lines.map((line) => typeof line === 'string' ? line : line.format()).join('\n');
  }
}
