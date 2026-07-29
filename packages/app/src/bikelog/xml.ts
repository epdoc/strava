/** Attribute map for XML elements. Keys are attribute names, values are serialized as strings. */
export type XmlAttrs = Record<string, string | number>;

/**
 * A single XML node in the tree. Nodes can have child elements or text content.
 */
export interface XmlNode {
  tag: string;
  attrs: XmlAttrs;
  children: (XmlNode | string)[];
}

/**
 * Minimal XML builder used for generating Acroforms data files.
 *
 * Provides a lightweight alternative to full DOM libraries, building XML as
 * a tree of {@link XmlNode} objects that can be serialized to a formatted
 * string. Handles self-closing tags, text-only children, and nested elements.
 *
 * @example
 * ```ts
 * const node = Xml.ele('root', { attr: 'val' }, [
 *   Xml.ele('child', {}, ['Hello']),
 *   Xml.ele('empty'),
 * ]);
 * console.log(Xml.doc(node));
 * ```
 */
export class Xml {
  /**
   * Creates a new XML element node.
   *
   * @param tag - The element tag name
   * @param [attrs={}] - Attribute key-value pairs
   * @param [children=[]] - Child nodes or text content
   * @returns A new XmlNode representing the element
   */
  static ele(tag: string, attrs: XmlAttrs = {}, children: (XmlNode | string)[] = []): XmlNode {
    return { tag, attrs, children };
  }

  /**
   * Escapes special XML characters in a string.
   *
   * Replaces `&`, `<`, and `>` with their XML entities.
   *
   * @param s - The string to escape
   * @returns The escaped string safe for use in XML content
   */
  static escape(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * Serializes an XmlNode tree to a formatted string with indentation.
   *
   * Handles three cases:
   * - No children: self-closing tag (`<tag attrs/>`)
   * - Single text child: inline content (`<tag attrs>text</tag>`)
   * - Multiple or element children: nested indented content
   *
   * @param node - The root node to serialize
   * @param indent - The indentation string (e.g., two spaces)
   * @param depth - Current nesting depth for indentation
   * @returns A formatted XML string
   */
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

  /**
   * Produces a complete XML document string with a `<?xml?>` declaration.
   *
   * @param root - The root element node
   * @returns An XML document string with UTF-8 declaration
   */
  static doc(root: XmlNode): string {
    return `<?xml version="1.0" encoding="UTF-8"?>\n${Xml.serialize(root, '  ', 0)}`;
  }
}
