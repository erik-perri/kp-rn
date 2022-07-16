import Uint8ArrayWriter from '../../../src/lib/utilities/Uint8ArrayWriter';

describe('Uint8ArrayWriter', () => {
  describe('write*', () => {
    type TestCase = {
      method: keyof Uint8ArrayWriter;
      value: number | bigint;
      size: number;
      offset: number;
      expectedArray: Uint8Array;
      expectedResult: number | bigint;
    };

    const cases: TestCase[] = [
      {
        method: 'writeUInt64BE',
        size: 8,
        offset: 0,
        value: BigInt('17339103403222892544'),
        expectedArray: Uint8Array.from([
          0xf0, 0xa0, 0xde, 0xad, 0xc0, 0xde, 0x00, 0x00,
        ]),
        expectedResult: 8,
      },
      {
        method: 'writeUInt64LE',
        size: 8,
        offset: 0,
        value: BigInt('244919132135664'),
        expectedArray: Uint8Array.from([
          0xf0, 0xa0, 0xde, 0xad, 0xc0, 0xde, 0x00, 0x00,
        ]),
        expectedResult: 8,
      },
    ];

    it.each(cases)(
      'write %s',
      ({method, value, size, offset, expectedArray, expectedResult}) => {
        const sut = new Uint8ArrayWriter(size);

        // @ts-ignore
        const result = sut[method](value, offset);

        expect(result).toEqual(expectedResult);
        expect(sut.slice()).toEqualUint8Array(expectedArray);
      },
    );
  });

  describe('from*', () => {
    it('converts fromString', () => {
      const bytes = Uint8ArrayWriter.fromString('password\0');

      expect(bytes).toEqualUint8Array(
        Uint8Array.from([0x70, 0x61, 0x73, 0x73, 0x77, 0x6f, 0x72, 0x64, 0x00]),
      );
    });

    it('converts fromBase64', () => {
      const bytes = Uint8ArrayWriter.fromBase64('cGFzc3dvcmQ=');

      expect(bytes).toEqualUint8Array(
        Uint8Array.from([0x70, 0x61, 0x73, 0x73, 0x77, 0x6f, 0x72, 0x64]),
      );
    });

    it.each([
      {
        input: BigInt('18446744073709551615'),
        expected: Uint8Array.from([
          0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        ]),
      },
      {
        input: BigInt('72340172838076673'),
        expected: Uint8Array.from([
          0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
        ]),
      },
      {
        input: BigInt(0),
        expected: Uint8Array.from([
          0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        ]),
      },
    ])('converts fromUInt64LE %s', ({input, expected}) => {
      const bytes = Uint8ArrayWriter.fromUInt64LE(input);

      expect(bytes).toEqualUint8Array(expected);
    });
  });
});
