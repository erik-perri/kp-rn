/* eslint-disable no-bitwise */

import bigInt, {BigInteger} from 'big-integer';

export default class Uint8ArrayReader {
  private readonly bytes: Uint8Array;

  constructor(bytes: number[] | Uint8Array) {
    this.bytes = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes);
  }

  static equals(a: Uint8Array, b: Uint8Array): boolean {
    if (a.byteLength !== b.byteLength) {
      return false;
    }

    for (let i = 0; i < a.byteLength; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }

  static toInt32LE(bytes: Uint8Array): number {
    return new Uint8ArrayReader(bytes).readInt32LE(0);
  }

  static toUInt32LE(bytes: Uint8Array): number {
    return new Uint8ArrayReader(bytes).readUInt32LE(0);
  }

  static toInt64LE(bytes: Uint8Array): BigInteger {
    return new Uint8ArrayReader(bytes).readInt64LE(0);
  }

  static toUInt64LE(bytes: Uint8Array): BigInteger {
    return new Uint8ArrayReader(bytes).readUInt64LE(0);
  }

  static toString(bytes: Uint8Array): string {
    return new Uint8ArrayReader(bytes).readString(0);
  }

  readInt8(offset: number): number {
    const value = this.bytes[offset];
    return value | ((value & (2 ** 7)) * 0x1fffffe);
  }

  readUInt8(offset: number): number {
    return this.bytes[offset];
  }

  readInt16BE(offset: number): number {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 1];

    const value = first * 2 ** 8 + last;
    return value | ((value & (2 ** 15)) * 0x1fffe);
  }

  readInt16LE(offset: number): number {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 1];

    const value = first + last * 2 ** 8;
    return value | ((value & (2 ** 15)) * 0x1fffe);
  }

  readUInt16BE(offset: number): number {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 1];

    return first * 2 ** 8 + last;
  }

  readUInt16LE(offset: number): number {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 1];

    return first + last * 2 ** 8;
  }

  readInt32BE(offset: number): number {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 3];

    return (
      (first << 24) + // Overflow
      this.bytes[++offset] * 2 ** 16 +
      this.bytes[++offset] * 2 ** 8 +
      last
    );
  }

  readInt32LE(offset: number): number {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 3];

    return (
      first +
      this.bytes[++offset] * 2 ** 8 +
      this.bytes[++offset] * 2 ** 16 +
      (last << 24) // Overflow
    );
  }

  readUInt32BE(offset: number): number {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 3];

    return (
      first * 2 ** 24 +
      this.bytes[++offset] * 2 ** 16 +
      this.bytes[++offset] * 2 ** 8 +
      last
    );
  }

  readUInt32LE(offset: number): number {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 3];

    return (
      first +
      this.bytes[++offset] * 2 ** 8 +
      this.bytes[++offset] * 2 ** 16 +
      last * 2 ** 24
    );
  }

  readInt64BE(offset: number): BigInteger {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 7];

    const value =
      (first << 24) + // Overflow
      this.bytes[++offset] * 2 ** 16 +
      this.bytes[++offset] * 2 ** 8 +
      this.bytes[++offset];

    return bigInt(value)
      .shiftLeft(32)
      .add(
        this.bytes[++offset] * 2 ** 24 +
          this.bytes[++offset] * 2 ** 16 +
          this.bytes[++offset] * 2 ** 8 +
          last,
      );
  }

  readInt64LE(offset: number): BigInteger {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 7];

    const value =
      this.bytes[offset + 4] +
      this.bytes[offset + 5] * 2 ** 8 +
      this.bytes[offset + 6] * 2 ** 16 +
      (last << 24); // Overflow

    return bigInt(value)
      .shiftLeft(32)
      .add(
        first +
          this.bytes[++offset] * 2 ** 8 +
          this.bytes[++offset] * 2 ** 16 +
          this.bytes[++offset] * 2 ** 24,
      );
  }

  readUInt64BE(offset: number): BigInteger {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 7];

    const hi =
      first * 2 ** 24 +
      this.bytes[++offset] * 2 ** 16 +
      this.bytes[++offset] * 2 ** 8 +
      this.bytes[++offset];

    const lo =
      this.bytes[++offset] * 2 ** 24 +
      this.bytes[++offset] * 2 ** 16 +
      this.bytes[++offset] * 2 ** 8 +
      last;

    return bigInt(hi).shiftLeft(32).add(lo);
  }

  readUInt64LE(offset: number): BigInteger {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 7];

    const lo =
      first +
      this.bytes[++offset] * 2 ** 8 +
      this.bytes[++offset] * 2 ** 16 +
      this.bytes[++offset] * 2 ** 24;

    const hi =
      this.bytes[++offset] +
      this.bytes[++offset] * 2 ** 8 +
      this.bytes[++offset] * 2 ** 16 +
      last * 2 ** 24;

    return bigInt(lo).add(bigInt(hi).shiftLeft(32));
  }

  readString(offset: number): string {
    let buffer = '';
    for (let index = offset ?? 0; index < this.bytes.byteLength; index++) {
      buffer += String.fromCharCode(this.bytes[index]);
    }
    return buffer;
  }

  slice(start?: number, end?: number): Uint8Array {
    return this.bytes.slice(start, end);
  }
}
