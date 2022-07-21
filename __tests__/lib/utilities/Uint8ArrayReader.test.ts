import bigInt, {BigInteger} from 'big-integer';

import Uint8ArrayReader from '../../../src/lib/utilities/Uint8ArrayReader';

describe('Uint8ArrayReader', () => {
  describe('read*', () => {
    type TestCase = {
      offset: number;
      expected: number | BigInteger;
      method: keyof Uint8ArrayReader;
    };

    const testBuffer = [
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0xf0, 0xa0, 0xde, 0xad, 0xc0, 0xde, 0x00, 0x00,
    ];

    const cases: TestCase[] = [
      // 8
      {
        method: 'readInt8',
        offset: 0,
        expected: -1,
      },
      {
        method: 'readUInt8',
        offset: 0,
        expected: 255,
      },
      {
        method: 'readInt8',
        offset: 8,
        expected: 0,
      },
      {
        method: 'readUInt8',
        offset: 8,
        expected: 0,
      },
      {
        method: 'readInt8',
        offset: 16,
        expected: -16,
      },
      {
        method: 'readUInt8',
        offset: 16,
        expected: 240,
      },

      // 16
      {
        method: 'readInt16BE',
        offset: 0,
        expected: -1,
      },
      {
        method: 'readInt16LE',
        offset: 0,
        expected: -1,
      },
      {
        method: 'readUInt16BE',
        offset: 0,
        expected: 65535,
      },
      {
        method: 'readUInt16LE',
        offset: 0,
        expected: 65535,
      },
      {
        method: 'readInt16BE',
        offset: 7,
        expected: -256,
      },
      {
        method: 'readInt16LE',
        offset: 7,
        expected: 255,
      },
      {
        method: 'readUInt16BE',
        offset: 7,
        expected: 65280,
      },
      {
        method: 'readUInt16LE',
        offset: 7,
        expected: 255,
      },
      {
        method: 'readInt16BE',
        offset: 8,
        expected: 0,
      },
      {
        method: 'readInt16LE',
        offset: 8,
        expected: 0,
      },
      {
        method: 'readUInt16BE',
        offset: 8,
        expected: 0,
      },
      {
        method: 'readUInt16LE',
        offset: 8,
        expected: 0,
      },
      {
        method: 'readInt16BE',
        offset: 16,
        expected: -3936,
      },
      {
        method: 'readInt16LE',
        offset: 16,
        expected: -24336,
      },
      {
        method: 'readUInt16BE',
        offset: 16,
        expected: 61600,
      },
      {
        method: 'readUInt16LE',
        offset: 16,
        expected: 41200,
      },

      // 32
      {
        method: 'readInt32BE',
        offset: 0,
        expected: -1,
      },
      {
        method: 'readInt32LE',
        offset: 0,
        expected: -1,
      },
      {
        method: 'readUInt32BE',
        offset: 0,
        expected: 4294967295,
      },
      {
        method: 'readUInt32LE',
        offset: 0,
        expected: 4294967295,
      },
      {
        method: 'readInt32BE',
        offset: 7,
        expected: -16777216,
      },
      {
        method: 'readInt32LE',
        offset: 7,
        expected: 255,
      },
      {
        method: 'readUInt32BE',
        offset: 7,
        expected: 4278190080,
      },
      {
        method: 'readUInt32LE',
        offset: 7,
        expected: 255,
      },
      {
        method: 'readInt32BE',
        offset: 8,
        expected: 0,
      },
      {
        method: 'readInt32LE',
        offset: 8,
        expected: 0,
      },
      {
        method: 'readUInt32BE',
        offset: 8,
        expected: 0,
      },
      {
        method: 'readUInt32LE',
        offset: 8,
        expected: 0,
      },
      {
        method: 'readInt32BE',
        offset: 16,
        expected: -257892691,
      },
      {
        method: 'readInt32LE',
        offset: 16,
        expected: -1377918736,
      },
      {
        method: 'readUInt32BE',
        offset: 16,
        expected: 4037074605,
      },
      {
        method: 'readUInt32LE',
        offset: 16,
        expected: 2917048560,
      },

      // 64
      {
        method: 'readInt64BE',
        offset: 0,
        expected: bigInt(-1),
      },
      {
        method: 'readInt64LE',
        offset: 0,
        expected: bigInt(-1),
      },
      {
        method: 'readUInt64BE',
        offset: 0,
        expected: bigInt('18446744073709551615'),
      },
      {
        method: 'readUInt64LE',
        offset: 0,
        expected: bigInt('18446744073709551615'),
      },
      {
        method: 'readInt64BE',
        offset: 7,
        expected: bigInt('-72057594037927936'),
      },
      {
        method: 'readInt64LE',
        offset: 7,
        expected: bigInt(255),
      },
      {
        method: 'readUInt64BE',
        offset: 7,
        expected: bigInt('18374686479671623680'),
      },
      {
        method: 'readUInt64LE',
        offset: 7,
        expected: bigInt(255),
      },
      {
        method: 'readInt64BE',
        offset: 8,
        expected: bigInt(0),
      },
      {
        method: 'readInt64LE',
        offset: 8,
        expected: bigInt(0),
      },
      {
        method: 'readUInt64BE',
        offset: 8,
        expected: bigInt(0),
      },
      {
        method: 'readUInt64LE',
        offset: 8,
        expected: bigInt(0),
      },
      {
        method: 'readInt64BE',
        offset: 16,
        expected: bigInt('-1107640670486659072'),
      },
      {
        method: 'readInt64LE',
        offset: 16,
        expected: bigInt('244919132135664'),
      },
      {
        method: 'readUInt64BE',
        offset: 16,
        expected: bigInt('17339103403222892544'),
      },
      {
        method: 'readUInt64LE',
        offset: 16,
        expected: bigInt('244919132135664'),
      },
    ];

    it.each(cases)('read %s', ({method, offset, expected}) => {
      const sut = new Uint8ArrayReader(testBuffer);

      // @ts-ignore
      const result = sut[method](offset);

      expect(result).toEqual(expected);
    });
  });

  describe('to*', () => {
    it.each([
      {
        bytes: Uint8Array.from([0x00, 0x00, 0x00, 0x00]),
        expected: 0,
      },
      {
        bytes: Uint8Array.from([0xff, 0xff, 0xff, 0xff]),
        expected: -1,
      },
      {
        bytes: Uint8Array.from([0x01, 0x01, 0x01, 0x01]),
        expected: 16843009,
      },
    ])('toInt32LE %s', ({bytes, expected}) => {
      const result = Uint8ArrayReader.toInt32LE(bytes);

      expect(result).toEqual(expected);
    });

    it.each([
      {
        bytes: Uint8Array.from([0x00, 0x00, 0x00, 0x00]),
        expected: 0,
      },
      {
        bytes: Uint8Array.from([0xff, 0xff, 0xff, 0xff]),
        expected: 4294967295,
      },
      {
        bytes: Uint8Array.from([0x01, 0x01, 0x01, 0x01]),
        expected: 16843009,
      },
    ])('toUInt32LE %s', ({bytes, expected}) => {
      const result = Uint8ArrayReader.toUInt32LE(bytes);

      expect(result).toEqual(expected);
    });

    it.each([
      {
        bytes: Uint8Array.from([
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        ]),
        expected: bigInt(0),
      },
      {
        bytes: Uint8Array.from([
          0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        ]),
        expected: bigInt(-1),
      },
      {
        bytes: Uint8Array.from([
          0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        ]),
        expected: bigInt('72340172838076673'),
      },
    ])('toInt64LE %s', ({bytes, expected}) => {
      const result = Uint8ArrayReader.toInt64LE(bytes);

      expect(result).toEqual(expected);
    });

    it.each([
      {
        bytes: Uint8Array.from([
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        ]),
        expected: bigInt(0),
      },
      {
        bytes: Uint8Array.from([
          0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        ]),
        expected: bigInt('18446744073709551615'),
      },
      {
        bytes: Uint8Array.from([
          0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        ]),
        expected: bigInt('72340172838076673'),
      },
    ])('toUInt64LE %s', ({bytes, expected}) => {
      const result = Uint8ArrayReader.toUInt64LE(bytes);

      expect(result).toEqual(expected);
    });
  });

  describe('slice', () => {
    const testBuffer = Uint8Array.from([
      0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
    ]);

    it('returns full array if no parameters are specified', () => {
      const sut = new Uint8ArrayReader(testBuffer);

      const result = sut.slice();

      expect(result).toEqualUint8Array(testBuffer);
    });

    it('returns the specified slice out', () => {
      const sut = new Uint8ArrayReader(testBuffer);

      const result = sut.slice(1, 4);

      expect(result).toEqualUint8Array(Uint8Array.from([0x01, 0x02, 0x03]));
    });

    it('returns the remaining when only specifying the start', () => {
      const sut = new Uint8ArrayReader(testBuffer);

      const result = sut.slice(2);

      expect(result).toEqualUint8Array(
        Uint8Array.from([0x02, 0x03, 0x04, 0x05, 0x06]),
      );
    });
  });

  describe('equals', () => {
    it.each([
      {
        a: Uint8Array.from([]),
        b: Uint8Array.from([]),
        expected: true,
      },
      {
        a: Uint8Array.from([0x00]),
        b: Uint8Array.from([0x00]),
        expected: true,
      },
      {
        a: Uint8Array.from([0x00]),
        b: Uint8Array.from([0x00, 0x00]),
        expected: false,
      },
      {
        a: Uint8Array.from([0x00, 0x01]),
        b: Uint8Array.from([0x00, 0x00]),
        expected: false,
      },
    ])('compares correctly %s', ({a, b, expected}) => {
      const result = Uint8ArrayReader.equals(a, b);

      expect(result).toEqual(expected);
    });
  });
});
