type Attributes = Record<string, string>;

export interface XmlElement {
  name: string;
  attributes: Attributes;
  isClose: boolean;
  isMeta: boolean;
  isOpen: boolean;
  position: [number, number];
}

export class XmlReader {
  private readonly totalSize: number = 0;
  private currentElement: XmlElement;

  constructor(private readonly contents: string) {
    this.totalSize = this.contents.length;

    const firstElement = this.readNextTag(0);
    if (!firstElement) {
      throw new Error('No elements found');
    }
    this.currentElement = firstElement;
  }

  get current(): XmlElement {
    return this.currentElement;
  }

  readFromCurrent(): XmlReader {
    const endTag = this.currentElement.isClose
      ? this.currentElement
      : this.findEndOfCurrentElement();
    if (endTag?.name !== this.currentElement.name) {
      throw new Error(
        `Unable to find end "${this.currentElement.name}" element`,
      );
    }

    const reader = new XmlReader(
      this.contents.slice(this.currentElement.position[0], endTag.position[1]),
    );

    this.skipCurrentElement();

    return reader;
  }

  readNextStartElement(): boolean {
    let nextStart = this.readNextTag(this.currentElement.position[1]);
    if (!nextStart) {
      return false;
    }

    while (!nextStart.isOpen) {
      nextStart = this.readNextTag(nextStart.position[1]);
      if (!nextStart) {
        return false;
      }
    }

    this.currentElement = nextStart;

    return true;
  }

  skipCurrentElement(): void {
    if (this.currentElement.isOpen) {
      if (this.currentElement.isClose) {
        const nextTag = this.readNextTag(this.currentElement.position[1]);
        if (!nextTag) {
          throw new Error('Unable to find next element');
        }
        this.currentElement = nextTag;
      } else {
        const endTag = this.findEndOfCurrentElement();
        if (endTag?.name !== this.currentElement.name) {
          throw new Error(
            `Unable to find end "${this.currentElement.name}" element`,
          );
        }
        this.currentElement = endTag;
      }
    }
  }

  readElementText(): string {
    if (!this.currentElement.isOpen) {
      throw new Error(
        `Cannot read text from non-open element "${this.currentElement.name}"`,
      );
    }

    if (this.currentElement.isClose) {
      return '';
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

  private findEndOfCurrentElement(): XmlElement | undefined {
    let openChildTags = 0;
    let endTag = this.readNextTag(this.currentElement.position[1]);
    if (!endTag) {
      return undefined;
    }

    if (endTag.name === this.currentElement.name && endTag.isClose) {
      return endTag;
    }

    while (true) {
      endTag = this.readNextTag(endTag.position[1]);
      if (!endTag) {
        return undefined;
      }

      if (endTag.name === this.currentElement.name) {
        if (endTag.isOpen) {
          openChildTags++;
          continue;
        }

        if (openChildTags) {
          openChildTags--;
        } else {
          break;
        }
      }
    }

    if (endTag.name !== this.currentElement.name) {
      return undefined;
    }

    return endTag;
  }

  private readNextTag(startPosition: number): XmlElement | undefined {
    const startIndex: number = this.contents.indexOf('<', startPosition);
    if (startIndex === -1) {
      return undefined;
    }

    const endIndex: number = this.contents.indexOf('>', startIndex);
    if (endIndex === -1) {
      return undefined;
    }

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
      isClose = true;
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
