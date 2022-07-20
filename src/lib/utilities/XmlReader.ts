type Attributes = Record<string, string>;

interface Element {
  name: string;
  attributes: Attributes;
  isClose: boolean;
  isMeta: boolean;
  isOpen: boolean;
  position: [number, number];
}

export class XmlReader {
  private currentPosition: number = 0;
  private readonly totalSize: number = 0;
  private currentElement: Element;

  constructor(private readonly contents: string) {
    this.totalSize = this.contents.length;
    this.currentElement = this.readMetaElement();
  }

  get current(): Element {
    return this.currentElement;
  }

  get position(): number {
    return this.currentPosition;
  }

  readNextStartElement(): boolean {
    let nextStart = this.readNextTag();
    if (!nextStart) {
      return false;
    }

    while (nextStart.isClose) {
      nextStart = this.readNextTag();
      if (!nextStart) {
        return false;
      }
    }

    this.currentElement = nextStart;

    return true;
  }

  skipCurrentElement(): void {
    if (this.currentElement.isOpen) {
      const endTag = this.findEndOfCurrentElement();
      if (endTag?.name !== this.currentElement.name) {
        throw new Error(
          `Unable to find end "${this.currentElement.name}" element`,
        );
      }
    }

    this.readNextStartElement();
  }

  readElementText(): string | undefined {
    if (!this.currentElement.isOpen) {
      throw new Error(
        `Cannot read text from non-open element "${this.currentElement.name}"`,
      );
    }

    const openTag = this.currentElement;
    const endTag = this.findEndOfCurrentElement();
    if (endTag?.name !== this.currentElement.name) {
      throw new Error(
        `Unable to find end "${this.currentElement.name}" element`,
      );
    }

    this.currentElement = endTag;

    return this.contents.slice(openTag.position[1], endTag.position[0]);
  }

  private findEndOfCurrentElement(): Element | undefined {
    let openChildTags = 0;
    let endTag = this.readNextTag();
    if (!endTag) {
      return undefined;
    }

    while (endTag.name !== this.currentElement.name) {
      const nextTag = this.readNextTag();
      if (!nextTag) {
        return undefined;
      }

      if (nextTag.name === this.currentElement.name) {
        if (nextTag.isOpen) {
          openChildTags++;
        } else {
          if (openChildTags) {
            openChildTags--;
          } else {
            endTag = nextTag;
            break;
          }
        }
      }
    }

    if (endTag.name !== this.currentElement.name) {
      return undefined;
    }

    return endTag;
  }

  private readMetaElement(): Element {
    const meta = this.readNextTag();
    if (!meta?.isMeta) {
      throw new Error('Missing XML header');
    }

    return meta;
  }

  private readNextTag(): Element | undefined {
    let startIndex: number = this.currentPosition;
    while (this.contents[startIndex] !== '<') {
      startIndex++;

      if (startIndex > this.totalSize) {
        return undefined;
      }
    }

    let endIndex = startIndex + 1;
    while (this.contents[endIndex] !== '>') {
      endIndex++;

      if (endIndex > this.totalSize) {
        return undefined;
      }
    }

    this.currentPosition = endIndex + 1;

    const position: [number, number] = [startIndex, endIndex + 1];
    let tagInside = this.contents.slice(startIndex + 1, endIndex);
    let isMeta = false;
    let isOpen = true;
    let isClose = false;

    if (tagInside[0] === '?') {
      isMeta = true;
      isOpen = false;
      tagInside = tagInside.slice(1, -1);
    }

    if (tagInside.endsWith('/')) {
      isOpen = false;
      tagInside = tagInside.slice(0, -1);
    }

    if (tagInside.startsWith('/')) {
      isOpen = false;
      isClose = true;
      tagInside = tagInside.slice(1);
    }

    tagInside = tagInside.trim();

    const firstSpace = tagInside.indexOf(' ');
    if (firstSpace === -1) {
      return {
        name: tagInside,
        attributes: {},
        isMeta,
        isOpen,
        isClose,
        position,
      };
    }

    const tagName = tagInside.substring(0, firstSpace);
    tagInside = tagInside.substring(firstSpace);

    const attributes = XmlReader.splitAttributes(tagInside);
    return {
      name: tagName,
      attributes,
      isMeta,
      isOpen,
      isClose,
      position,
    };
  }

  private static splitAttributes(input: string): Attributes {
    const attributes: Attributes = {};

    let remaining = input.trim();
    while (remaining.length) {
      const stringMatch = /^([^=\s]+)=(['"])((?!\2).*?)?\2/g.exec(remaining);
      if (stringMatch) {
        remaining = remaining.substring(stringMatch[0].length).trim();
        attributes[stringMatch[1]] = stringMatch[3] ?? '';
        continue;
      }

      const booleanMatch = /^([^\t\n\f />"'=]+)($|\s)/g.exec(remaining);
      if (booleanMatch) {
        remaining = remaining.substring(booleanMatch[0].length).trim();
        attributes[booleanMatch[1]] = 'true';
        continue;
      }

      throw new Error(`Unexpected attribute format "${remaining}"`);
    }

    return attributes;
  }
}
