import {Database, toCompressionAlgorithm} from '../core/Database';
import {stringify as uuidStringify} from 'uuid';
import SymmetricCipher, {SymmetricCipherMode} from '../crypto/SymmetricCipher';
import {BufferReader} from '../utilities/BufferReader';
import CompositeKey from '../keys/CompositeKey';
import {ProtectedStreamAlgo, toProtectedStreamAlgo} from './Keepass2';

export default abstract class KdbxReader {
  private masterSeed?: Uint8Array;
  private encryptionIV?: Uint8Array;
  private signature?: [number, number];
  private symmetricCipherMode?: SymmetricCipherMode;
  private streamKey?: Uint8Array;

  async readDatabase(buffer: Buffer, key: CompositeKey): Promise<Database> {
    const reader = new BufferReader(buffer);

    const [signatureOne, signatureTwo, version] =
      KdbxReader.readMagicNumbers(reader);

    this.setSignature([signatureOne, signatureTwo]);

    const database = new Database(key);

    database.setFormatVersion(version);

    while (this.readHeaderField(reader, database)) {
      //
    }

    const headerData = reader.getReadData();

    return await this.readVersionDatabase(reader, headerData, key, database);
  }

  protected abstract readHeaderField(
    reader: BufferReader,
    database: Database,
  ): boolean;

  protected abstract readVersionDatabase(
    reader: BufferReader,
    headerData: Uint8Array,
    key: CompositeKey,
    database: Database,
  ): Promise<Database>;

  private static readMagicNumbers(reader: BufferReader) {
    const signatureOne = reader.readUInt32LE(4);
    const signatureTwo = reader.readUInt32LE(4);
    const version = reader.readUInt32LE(4);

    return [signatureOne, signatureTwo, version];
  }

  protected setCipher(data: Uint8Array, database: Database): void {
    if (data.byteLength !== 16) {
      throw new Error(
        `Invalid cipher uuid length: ${data.toString()} (length=${
          data.byteLength
        })`,
      );
    }

    const uuid = uuidStringify(data);
    const mode = SymmetricCipher.cipherUuidToMode(uuid);
    if (mode === SymmetricCipherMode.InvalidMode) {
      throw new Error('Unsupported cipher');
    }

    database.setCipher(uuid);
  }

  protected setCompressionFlags(data: Uint8Array, database: Database): void {
    if (data.byteLength !== 4) {
      throw new Error('Invalid compression flags length');
    }

    const id = new DataView(data.buffer).getUint32(0, true);
    if (!toCompressionAlgorithm(id)) {
      throw new Error('Unsupported compression algorithm');
    }

    database.setCompressionAlgorithm(id);
  }

  protected setMasterSeed(data: Uint8Array): void {
    if (data.byteLength !== 32) {
      throw new Error('Invalid master seed size');
    }

    this.masterSeed = data;
  }

  protected getMasterSeed(): Uint8Array {
    if (this.masterSeed === undefined) {
      throw new Error('masterSeed not set');
    }
    return this.masterSeed;
  }

  protected setEncryptionIV(data: Uint8Array): void {
    this.encryptionIV = data;
  }

  protected getEncryptionIV(): Uint8Array {
    if (this.encryptionIV === undefined) {
      throw new Error('encryptionIV not set');
    }
    return this.encryptionIV;
  }

  protected setSignature(signature: [number, number]): void {
    this.signature = signature;
  }

  protected getSignature(): [number, number] {
    if (this.signature === undefined) {
      throw new Error('signature not set');
    }
    return this.signature;
  }

  protected setSymmetricCipherModeFromInnerRandomStreamId(data: Uint8Array) {
    if (data.byteLength !== 4) {
      throw new Error('Invalid random stream id size');
    }

    const id = new DataView(data.buffer).getUint32(0, true);
    if (
      !toProtectedStreamAlgo(id) ||
      [
        ProtectedStreamAlgo.InvalidProtectedStreamAlgo,
        ProtectedStreamAlgo.ArcFourVariant,
      ].includes(id)
    ) {
      throw new Error('Invalid inner random stream cipher');
    }

    switch (id) {
      case ProtectedStreamAlgo.Salsa20:
        this.symmetricCipherMode = SymmetricCipherMode.Salsa20;
        break;
      case ProtectedStreamAlgo.ChaCha20:
        this.symmetricCipherMode = SymmetricCipherMode.ChaCha20;
        break;
      default:
        this.symmetricCipherMode = SymmetricCipherMode.InvalidMode;
        break;
    }
  }

  protected getSymmetricCipherMode(): SymmetricCipherMode {
    if (this.symmetricCipherMode === undefined) {
      throw new Error('Inner random stream algorithm not set');
    }
    return this.symmetricCipherMode;
  }

  protected setProtectedStreamKey(data: Uint8Array) {
    this.streamKey = data;
  }

  protected getProtectedStreamKey(): Uint8Array {
    if (this.streamKey === undefined) {
      throw new Error('Protected stream key not set');
    }
    return this.streamKey;
  }
}
