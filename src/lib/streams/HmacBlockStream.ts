import bigInt, {BigInteger} from 'big-integer';

import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';
import Uint8ArrayCursorReader from '../utilities/Uint8ArrayCursorReader';
import Uint8ArrayReader from '../utilities/Uint8ArrayReader';
import Uint8ArrayWriter from '../utilities/Uint8ArrayWriter';

export const UINT64_MAX = bigInt('18446744073709551615'); // 0xffffffffffffffff

export default class HmacBlockStream {
  private blockIndex: BigInteger = bigInt(0);
  private _atEnd: boolean = false;
  private _buffer: Uint8Array = new Uint8Array(0);

  constructor(
    private readonly reader: Uint8ArrayCursorReader,
    private readonly key: Uint8Array,
    private readonly blockSize: number = 1024 * 1024,
  ) {
    //
  }

  get buffer(): Uint8Array {
    return this._buffer;
  }

  get atEnd(): boolean {
    return this._atEnd;
  }

  async readHashedBlock(): Promise<boolean> {
    if (this._atEnd) {
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

    const blockSize = Uint8ArrayReader.toInt32LE(blockSizeBytes);
    if (blockSize < 0) {
      throw new Error('Invalid block size.');
    }

    this._buffer = this.reader.readBytes(blockSize);
    if (this._buffer.byteLength !== blockSize) {
      throw new Error(
        `Block size wrong. Expected ${blockSize}, read ${this._buffer.byteLength}`,
      );
    }

    const hash = await CryptoHash.hmac(
      [
        Uint8ArrayWriter.fromUInt64LE(this.blockIndex),
        blockSizeBytes,
        this._buffer,
      ],
      await this.getCurrentHmacKey(),
      CryptoHashAlgorithm.Sha256,
    );

    if (!Uint8ArrayReader.equals(hmac, hash)) {
      throw new Error('Mismatch between hash and data.');
    }

    this.blockIndex = this.blockIndex.add(1);

    if (blockSize === 0) {
      this._atEnd = true;
    }

    return true;
  }

  public reset(): void {
    this.blockIndex = bigInt(0);
    this.reader.offset = 0;
    this._atEnd = false;
  }

  private async getCurrentHmacKey() {
    return await HmacBlockStream.getHmacKey(this.blockIndex, this.key);
  }

  public static async getHmacKey(
    blockIndex: BigInteger,
    key: Uint8Array,
  ): Promise<Uint8Array> {
    if (key.byteLength !== 64) {
      throw new Error('Unexpected key length');
    }

    return CryptoHash.hash(
      [Uint8ArrayWriter.fromUInt64LE(blockIndex), key],
      CryptoHashAlgorithm.Sha512,
    );
  }
}
