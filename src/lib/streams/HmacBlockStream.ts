import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';
import {BufferReader} from '../utilities/BufferReader';
import {
  areUint8ArraysEqual,
  makeUint8ArrayFromUint64,
} from '../utilities/Uint8Array';

export const UINT64_MAX = BigInt('0xffffffffffffffff');

export default class HmacBlockStream {
  private blockIndex: bigint = BigInt(0);
  private atEof: boolean = false;
  private buffer: Uint8Array = new Uint8Array(0);

  constructor(
    private readonly reader: BufferReader,
    private readonly key: Uint8Array,
    private readonly blockSize: number = 1024 * 1024,
  ) {
    //
  }

  getBuffer(): Uint8Array {
    return this.buffer;
  }

  readHashedBlock(): boolean {
    if (this.atEof) {
      return false;
    }

    const hmac = this.reader.readBytes(32);
    if (hmac.byteLength !== 32) {
      throw new Error('Invalid HMAC size.');
    }

    const blockSizeBytes = this.reader.readBytes(4);
    if (blockSizeBytes.byteLength !== 4) {
      throw new Error('Invalid block size size.');
    }

    const blockSize = new DataView(blockSizeBytes.buffer).getInt32(0, true);
    if (blockSize < 0) {
      throw new Error('Invalid block size.');
    }

    this.buffer = this.reader.readBytes(blockSize);
    if (this.buffer.byteLength !== blockSize) {
      throw new Error('Block too short.');
    }

    const hash = new CryptoHash(
      CryptoHashAlgorithm.Sha256,
      this.getCurrentHmacKey(),
    );
    hash.addData(makeUint8ArrayFromUint64(this.blockIndex));
    hash.addData(blockSizeBytes);
    hash.addData(this.buffer);

    if (!areUint8ArraysEqual(hmac, hash.result())) {
      throw new Error('Mismatch between hash and data.');
    }

    // m_bufferPos = 0;
    this.blockIndex++;

    if (blockSize === 0) {
      this.atEof = true;
      return false;
    }

    return true;
  }

  public reset(): void {
    this.blockIndex = BigInt(0);
    this.reader.offset = 0;
    this.atEof = false;
  }

  public atEnd(): boolean {
    return this.atEof;
  }

  private getCurrentHmacKey() {
    return HmacBlockStream.getHmacKey(this.blockIndex, this.key);
  }

  public static getHmacKey(blockIndex: bigint, key: Uint8Array): Uint8Array {
    if (key.byteLength !== 64) {
      throw new Error('Unexpected key length');
    }

    const hash = new CryptoHash(CryptoHashAlgorithm.Sha512);
    hash.addData(makeUint8ArrayFromUint64(blockIndex));
    hash.addData(key);
    return hash.result();
  }
}
