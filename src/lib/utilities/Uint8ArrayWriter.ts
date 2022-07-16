/* eslint-disable no-bitwise */

import {toByteArray} from 'base64-js';
import {BigInteger} from 'big-integer';

export default class Uint8ArrayWriter {
  private readonly bytes: Uint8Array;

  constructor(bytes: Uint8Array | number) {
    this.bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  }

  static fromString(data: string): Uint8Array {
    const length = data.length;
    const result = new Uint8Array(length);
    for (let index = 0; index < length; index++) {
      result[index] = data.charCodeAt(index);
    }
    return result;
  }

  static fromUInt64LE(data: BigInteger): Uint8Array {
    const writer = new Uint8ArrayWriter(new Uint8Array(8));
    writer.writeUInt64LE(data, 0);
    return writer.slice();
  }

  static fromBase64(value: string): Uint8Array {
    return toByteArray(value);
  }

  slice(start?: number, end?: number): Uint8Array {
    return this.bytes.slice(start, end);
  }

  writeUInt64BE(value: BigInteger, offset: number) {
    let lo = Number(value.and(0xffffffff));
    this.bytes[offset + 7] = lo;
    lo = lo >> 8;
    this.bytes[offset + 6] = lo;
    lo = lo >> 8;
    this.bytes[offset + 5] = lo;
    lo = lo >> 8;
    this.bytes[offset + 4] = lo;

    let hi = Number(value.shiftRight(32).and(0xffffffff));
    this.bytes[offset + 3] = hi;
    hi = hi >> 8;
    this.bytes[offset + 2] = hi;
    hi = hi >> 8;
    this.bytes[offset + 1] = hi;
    hi = hi >> 8;
    this.bytes[offset] = hi;

    return offset + 8;
  }

  writeUInt64LE(value: BigInteger, offset: number) {
    let lo = Number(value.and(0xffffffff));
    this.bytes[offset++] = lo;
    lo = lo >> 8;
    this.bytes[offset++] = lo;
    lo = lo >> 8;
    this.bytes[offset++] = lo;
    lo = lo >> 8;
    this.bytes[offset++] = lo;

    let hi = Number(value.shiftRight(32).and(0xffffffff));
    this.bytes[offset++] = hi;
    hi = hi >> 8;
    this.bytes[offset++] = hi;
    hi = hi >> 8;
    this.bytes[offset++] = hi;
    hi = hi >> 8;
    this.bytes[offset++] = hi;

    return offset;
  }
}
