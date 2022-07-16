import Uint8ArrayReader from './Uint8ArrayReader';

export default class Uint8ArrayCursorReader {
  constructor(private buffer: Uint8ArrayReader, public offset: number = 0) {
    //
  }

  readBytes(length: number): Uint8Array {
    const bytes = this.buffer.slice(this.offset, this.offset + length);
    this.offset += length;
    return bytes;
  }

  readInt8(): number {
    const result = this.buffer.readInt8(this.offset);
    this.offset += 1;
    return result;
  }

  readUInt16LE(): number {
    const result = this.buffer.readUInt16LE(this.offset);
    this.offset += 2;
    return result;
  }

  readUInt32LE(): number {
    const result = this.buffer.readUInt32LE(this.offset);
    this.offset += 4;
    return result;
  }

  slice(start?: number, end?: number): Uint8Array {
    return this.buffer.slice(start ?? this.offset, end);
  }

  processed(): Uint8Array {
    return this.slice(0, this.offset);
  }
}
