export type XmlAttrs = Record<string, string | number>;

export interface XmlNode {
  tag: string;
  attrs: XmlAttrs;
  children: (XmlNode | string)[];
}

export class Xml {
  static ele(tag: string, attrs: XmlAttrs = {}, children: (XmlNode | string)[] = []): XmlNode {
    return { tag, attrs, children };
  }

  static escape(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  static serialize(node: XmlNode, indent: string, depth: number): string {
    const pad = indent.repeat(depth);
    const attrs = Object.entries(node.attrs)
      .map(([k, v]) => ` ${k}="${Xml.escape(String(v))}"`)
      .join('');
    if (node.children.length === 0) return `${pad}<${node.tag}${attrs}/>`;
    if (node.children.length === 1 && typeof node.children[0] === 'string') {
      return `${pad}<${node.tag}${attrs}>${Xml.escape(node.children[0])}</${node.tag}>`;
    }
    const inner = node.children
      .map((c) =>
        typeof c === 'string'
          ? `${pad}${indent}${Xml.escape(c)}`
          : Xml.serialize(c, indent, depth + 1)
      )
      .join('\n');
    return `${pad}<${node.tag}${attrs}>\n${inner}\n${pad}</${node.tag}>`;
  }

  static doc(root: XmlNode): string {
    return `<?xml version="1.0" encoding="UTF-8"?>\n${Xml.serialize(root, '  ', 0)}`;
  }
}
