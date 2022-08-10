import {
  addAlphaToColor,
  convertHexToObject,
  convertRgbToObject,
} from '../../../src/lib/utilities/colors';

describe('colors', () => {
  describe('convertHexToObject', () => {
    it.each([
      {
        input: '#000',
        output: {red: 0x00, green: 0x00, blue: 0x00, alpha: undefined},
      },
      {
        input: '#0000',
        output: {red: 0x00, green: 0x00, blue: 0x00, alpha: 0},
      },
      {
        input: '#000000',
        output: {red: 0x00, green: 0x00, blue: 0x00, alpha: undefined},
      },
      {
        input: '#00000000',
        output: {red: 0x00, green: 0x00, blue: 0x00, alpha: 0x00},
      },
      {
        input: '#fff',
        output: {red: 0xff, green: 0xff, blue: 0xff, alpha: undefined},
      },
      {
        input: '#fff5',
        output: {red: 0xff, green: 0xff, blue: 0xff, alpha: 0x55},
      },
      {
        input: '#ffffff',
        output: {red: 0xff, green: 0xff, blue: 0xff, alpha: undefined},
      },
      {
        input: '#ffffffff',
        output: {red: 0xff, green: 0xff, blue: 0xff, alpha: 0xff},
      },
      {
        input: '#11223344',
        output: {red: 0x11, green: 0x22, blue: 0x33, alpha: 0x44},
      },
      {
        input: '11223344',
        output: {red: 0x11, green: 0x22, blue: 0x33, alpha: 0x44},
      },
      {
        input: '#gff',
        output: null,
      },
      {
        input: '#ggffff',
        output: null,
      },
      {
        input: 'rgb(0, 0, 0)',
        output: null,
      },
      {
        input: 'hsl(360, 100%, 100%)',
        output: null,
      },
    ])('converts values as expected %s', ({input, output}) => {
      expect(convertHexToObject(input)).toEqual(output);
    });
  });

  describe('convertRgbToObject', () => {
    it.each([
      {
        input: 'rgb(0, 0, 0)',
        output: {red: 0, green: 0, blue: 0, alpha: undefined},
      },
      {
        input: 'rgba(0, 0, 0, 0.0)',
        output: {red: 0, green: 0, blue: 0, alpha: 0},
      },
      {
        input: 'rgba(0, 0, 0, 1.0)',
        output: {red: 0, green: 0, blue: 0, alpha: 255},
      },
      {
        input: 'rgb(255, 255, 255)',
        output: {red: 255, green: 255, blue: 255, alpha: undefined},
      },
      {
        input: 'rgba(255, 255, 255, 0)',
        output: {red: 255, green: 255, blue: 255, alpha: 0},
      },
      {
        input: 'rgba(255, 255, 255, 1.0)',
        output: {red: 255, green: 255, blue: 255, alpha: 255},
      },
      {
        input: 'rgba(10, 20, 30, 0.4)',
        output: {red: 10, green: 20, blue: 30, alpha: 102},
      },
      {
        input: 'rgb(what, 0, 0)',
        output: null,
      },
      {
        input: '#fff',
        output: null,
      },
      {
        input: 'hsl(360, 100%, 100%)',
        output: null,
      },
    ])('converts values as expected %s', ({input, output}) => {
      expect(convertRgbToObject(input)).toEqual(output);
    });
  });

  describe('addAlphaToColor', () => {
    it.each([
      {
        input: 'rgb(0, 0, 0)',
        alpha: 255,
        output: 'rgba(0, 0, 0, 1)',
      },
      {
        input: 'rgba(0, 0, 0, 0)',
        alpha: 128,
        output: 'rgba(0, 0, 0, 0.5)',
      },
      {
        input: 'rgba(0, 0, 0, 0)',
        alpha: 15,
        output: 'rgba(0, 0, 0, 0.06)',
      },
      {
        input: 'rgba(0, 0, 0, 0)',
        alpha: 0.5,
        output: 'rgba(0, 0, 0, 0.5)',
      },
      {
        input: '#fff',
        alpha: 255,
        output: '#ffffffff',
      },
      {
        input: '#000000',
        alpha: 15,
        output: '#0000000f',
      },
      {
        input: '000000',
        alpha: 0,
        output: '#00000000',
      },
      {
        input: 'what',
        alpha: 15,
        output: 'what',
      },
    ])('converts values as expected %s', ({input, alpha, output}) => {
      expect(addAlphaToColor(input, alpha)).toEqual(output);
    });
  });
});
