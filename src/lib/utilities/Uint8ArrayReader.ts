/* eslint-disable no-bitwise */

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

  static toInt32LE(bytes: Uint8Array) {
    return new Uint8ArrayReader(bytes).readInt32LE(0);
  }

  static toUInt32LE(bytes: Uint8Array) {
    return new Uint8ArrayReader(bytes).readUInt32LE(0);
  }

  static toInt64LE(bytes: Uint8Array) {
    return new Uint8ArrayReader(bytes).readInt64LE(0);
  }

  static toUInt64LE(bytes: Uint8Array) {
    return new Uint8ArrayReader(bytes).readUInt64LE(0);
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

  readInt64BE(offset: number): bigint {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 7];

    const value =
      (first << 24) + // Overflow
      this.bytes[++offset] * 2 ** 16 +
      this.bytes[++offset] * 2 ** 8 +
      this.bytes[++offset];

    return (
      (BigInt(value) << 32n) +
      BigInt(
        this.bytes[++offset] * 2 ** 24 +
          this.bytes[++offset] * 2 ** 16 +
          this.bytes[++offset] * 2 ** 8 +
          last,
      )
    );
  }

  readInt64LE(offset: number): bigint {
    const first = this.bytes[offset];
    const last = this.bytes[offset + 7];

    const value =
      this.bytes[offset + 4] +
      this.bytes[offset + 5] * 2 ** 8 +
      this.bytes[offset + 6] * 2 ** 16 +
      (last << 24); // Overflow

    return (
      (BigInt(value) << 32n) +
      BigInt(
        first +
          this.bytes[++offset] * 2 ** 8 +
          this.bytes[++offset] * 2 ** 16 +
          this.bytes[++offset] * 2 ** 24,
      )
    );
  }

  readUInt64BE(offset: number): bigint {
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

    return (BigInt(hi) << 32n) + BigInt(lo);
  }

  readUInt64LE(offset: number): bigint {
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

    return BigInt(lo) + (BigInt(hi) << 32n);
  }

  slice(start?: number, end?: number): Uint8Array {
    return this.bytes.slice(start, end);
  }
}
