import {XmlReader} from '../../../src/lib/utilities/XmlReader';

describe('XmlReader', () => {
  describe('constructor', () => {
    it('reads the xml header', () => {
      const header = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
      const sut = new XmlReader(header + '\n' + '<KeePassFile />');

      expect(sut.current()).toEqual({
        name: 'xml',
        isClose: false,
        isOpen: false,
        isMeta: true,
        attributes: {
          version: '1.0',
          encoding: 'UTF-8',
          standalone: 'yes',
        },
        position: [0, header.length],
      });
    });

    it('throws error when missing header', () => {
      expect(() => new XmlReader('<Tag />')).toThrow(/Missing XML header/);
    });
  });

  describe('readNextStartElement', () => {
    it('reads elements in order', () => {
      const xml =
        '<?xml version="1.0"?>\n' +
        '<KeePassFile>\n' +
        ' <Meta>\n' +
        '  <Generator>KeePassXC</Generator>\n' +
        '  <DatabaseName>Sample</DatabaseName>' +
        ' </Meta>\n' +
        '</KeePassFile>';
      const sut = new XmlReader(xml);

      sut.readNextStartElement();
      expect(sut.current()).toEqual({
        name: 'KeePassFile',
        isOpen: true,
        isClose: false,
        isMeta: false,
        attributes: {},
        position: [22, 35],
      });

      sut.readNextStartElement();
      expect(sut.current()).toEqual({
        name: 'Meta',
        isOpen: true,
        isClose: false,
        isMeta: false,
        attributes: {},
        position: [37, 43],
      });
    });

    it('skips close elements', () => {
      const sut = new XmlReader(
        '<?xml version="1.0"?>\n' +
          '<KeePassFile>\n' +
          ' <Meta>\n' +
          '  <Generator>KeePassXC</Generator>\n' +
          '  <DatabaseName>Sample</DatabaseName>' +
          ' </Meta>\n' +
          '</KeePassFile>',
      );

      sut.readNextStartElement();
      sut.readNextStartElement();

      sut.readNextStartElement();
      expect(sut.current()).toEqual({
        name: 'Generator',
        isOpen: true,
        isClose: false,
        isMeta: false,
        attributes: {},
        position: [46, 57],
      });

      sut.readNextStartElement();
      expect(sut.current()).toEqual({
        name: 'DatabaseName',
        isOpen: true,
        isClose: false,
        isMeta: false,
        attributes: {},
        position: [81, 95],
      });
    });

    it('reads attributes', () => {
      const sut = new XmlReader(
        '<?xml version="1.0"?>\n' +
          '<Tag value="a" value-with-space="a space" booleanValue name_with_underscore="" />',
      );

      sut.readNextStartElement();
      expect(sut.current()).toEqual(
        expect.objectContaining({
          name: 'Tag',
          isOpen: true,
          isClose: true,
          attributes: {
            value: 'a',
            'value-with-space': 'a space',
            booleanValue: 'true',
            name_with_underscore: '',
          },
        }),
      );
    });
  });

  describe('readElementText', () => {
    it('reads element text', () => {
      const sut = new XmlReader(
        '<?xml version="1.0"?>\n' +
          '<Generator>KeePassXC</Generator>\n' +
          '<DatabaseName>Sample</DatabaseName>\n' +
          '<Test>Sample text <span>with child element</span></Test>',
      );

      sut.readNextStartElement();
      expect(sut.readElementText()).toEqual('KeePassXC');

      sut.readNextStartElement();
      expect(sut.readElementText()).toEqual('Sample');

      sut.readNextStartElement();
      expect(sut.readElementText()).toEqual(
        'Sample text <span>with child element</span>',
      );
    });

    it('returns empty if element is closed', () => {
      const sut = new XmlReader('<?xml version="1.0"?><ElementOne />');

      sut.readNextStartElement();

      const result = sut.readElementText();

      expect(result).toEqual('');
    });

    it('throws an error if element is not properly closed', () => {
      const sut = new XmlReader(
        '<?xml version="1.0"?><ElementOne><ElementTwo />',
      );

      sut.readNextStartElement();

      expect(() => sut.readElementText()).toThrow(
        /Unable to find end "ElementOne" element/,
      );
    });
  });

  describe('skipCurrentElement', () => {
    it('skips past close tags of parents', () => {
      const sut = new XmlReader(
        '<?xml version="1.0"?>\n' +
          '<Meta>\n' +
          ' <Child>\n' +
          '  <Generator>KeePassXC</Generator>\n' +
          '  <DatabaseName>Sample</DatabaseName>' +
          ' </Child>\n' +
          '</Meta>\n' +
          '<Root />\n',
      );

      sut.readNextStartElement();
      sut.readNextStartElement();
      expect(sut.current().name).toEqual('Child');

      sut.skipCurrentElement();
      sut.readNextStartElement();
      expect(sut.current().name).toEqual('Root');
    });

    it('skips past child of the same type', () => {
      const sut = new XmlReader(
        '<?xml version="1.0"?>\n' +
          '<Meta>\n' +
          ' <Child>\n' +
          '  <Meta>\n' +
          '   <Generator>KeePassXC</Generator>\n' +
          '  </Meta>\n' +
          ' </Child>\n' +
          '</Meta>\n' +
          '<Root />\n',
      );

      sut.readNextStartElement();
      expect(sut.current().name).toEqual('Meta');

      sut.skipCurrentElement();
      sut.readNextStartElement();
      expect(sut.current().name).toEqual('Root');
    });

    it('skips past not open elements', () => {
      const sut = new XmlReader(
        '<?xml version="1.0"?><ElementOne /><ElementTwo />',
      );

      sut.readNextStartElement();
      expect(sut.current().name).toEqual('ElementOne');

      sut.skipCurrentElement();
      expect(sut.current().name).toEqual('ElementTwo');
    });

    it('throws an error if element is not properly closed', () => {
      const sut = new XmlReader(
        '<?xml version="1.0"?><ElementOne><ElementTwo />',
      );

      sut.readNextStartElement();
      expect(sut.current().name).toEqual('ElementOne');

      expect(() => sut.skipCurrentElement()).toThrow(
        /Unable to find end "ElementOne" element/,
      );
    });
  });
});
