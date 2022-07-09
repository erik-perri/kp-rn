export class BufferReader {
  constructor(private buffer: Buffer, public offset: number = 0) {}

  readBytes(length: number): Uint8Array {
    const buffer = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
      buffer[i] = this.buffer.readInt8(this.offset);
      this.offset += 1;
    }

    return buffer;
  }

  readInt8(): number {
    const result = this.buffer.readInt8(this.offset);
    this.offset += 1;
    return result;
  }

  readUInt32LE(byteLength: number): number {
    const result = this.buffer.readUIntLE(this.offset, byteLength);
    this.offset += byteLength;
    return result;
  }

  readUInt16LE() {
    const result = this.buffer.readUInt16LE(this.offset);
    this.offset += 2;
    return result;
  }

  getReadData(): Uint8Array {
    return this.buffer.subarray(0, this.offset);
  }
}
