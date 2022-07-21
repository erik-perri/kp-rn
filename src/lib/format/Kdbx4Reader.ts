import KdbxReader from './KdbxReader';
import {CompressionAlgorithm, Database} from '../core/Database';
import Uint8ArrayCursorReader from '../utilities/Uint8ArrayCursorReader';
import Uint8ArrayReader from '../utilities/Uint8ArrayReader';
import CompositeKey from '../keys/CompositeKey';
import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';
import {
  FILE_VERSION_4,
  FILE_VERSION_CRITICAL_MASK,
  HeaderFieldId,
  hmacKey as keepass2HmacKey,
  InnerHeaderFieldId,
  kdfFromParameters,
  toHeaderFieldId,
  toInnerHeaderFieldId,
  toVariantMapFieldType,
  VariantFieldMap,
  VARIANTMAP_CRITICAL_MASK,
  VARIANTMAP_VERSION,
  VariantMapFieldType,
} from './Keepass2';
import HmacBlockStream, {UINT64_MAX} from '../streams/HmacBlockStream';
import KdbxXmlReader from './KdbxXmlReader';
import KeePass2RandomStream from './KeePass2RandomStream';
import {gunzip} from '../utilities/zlib';
import SymmetricCipher, {
  SymmetricCipherDirection,
  SymmetricCipherMode,
} from '../crypto/SymmetricCipher';

export default class Kdbx4Reader extends KdbxReader {
  private binaryPool: Record<string, Uint8Array> = {};

  protected readHeaderField(
    reader: Uint8ArrayCursorReader,
    database: Database,
  ): boolean {
    const fieldId = reader.readInt8();
    if (!toHeaderFieldId(fieldId)) {
      throw new Error('Invalid header id size');
    }

    const fieldLen = reader.readUInt32LE();
    if (!fieldLen) {
      throw new Error(
        `Invalid header field length: field ${HeaderFieldId[fieldId]}`,
      );
    }

    let fieldData: Uint8Array = new Uint8Array(0);
    if (fieldLen) {
      fieldData = reader.readBytes(fieldLen);
      if (fieldData.byteLength !== fieldLen) {
        throw new Error(
          `Invalid header data length: field ${HeaderFieldId[fieldId]}, ${fieldLen} expected, ${fieldData.byteLength} found`,
        );
      }
    }

    switch (fieldId) {
      case HeaderFieldId.EndOfHeader:
        return false;

      case HeaderFieldId.CipherID:
        this.setCipher(fieldData, database);
        break;

      case HeaderFieldId.CompressionFlags:
        this.setCompressionFlags(fieldData, database);
        break;

      case HeaderFieldId.MasterSeed:
        this.setMasterSeed(fieldData);
        break;

      case HeaderFieldId.EncryptionIV:
        this.setEncryptionIV(fieldData);
        break;

      case HeaderFieldId.KdfParameters: {
        const kdfReader = new Uint8ArrayCursorReader(
          new Uint8ArrayReader(fieldData),
          0,
        );
        const kdfParams = Kdbx4Reader.readVariantMap(kdfReader);

        const kdf = kdfFromParameters(kdfParams);
        if (!kdf) {
          throw new Error(
            'Unsupported key derivation function (KDF) or invalid parameters',
          );
        }

        database.setKdf(kdf);
        break;
      }

      case HeaderFieldId.PublicCustomData: {
        database.setPublicCustomData(
          Kdbx4Reader.readVariantMap(
            new Uint8ArrayCursorReader(new Uint8ArrayReader(fieldData), 0),
          ),
        );
        break;
      }

      case HeaderFieldId.ProtectedStreamKey:
      case HeaderFieldId.TransformRounds:
      case HeaderFieldId.TransformSeed:
      case HeaderFieldId.StreamStartBytes:
      case HeaderFieldId.InnerRandomStreamID:
        throw new Error('Legacy header fields found in KDBX4 file.');

      default:
        console.warn(`Unknown header field read: id=${fieldId}`);
        break;
    }

    return true;
  }

  private static readVariantMap(
    reader: Uint8ArrayCursorReader,
  ): VariantFieldMap {
    // eslint-disable-next-line no-bitwise
    const version = reader.readUInt16LE() & VARIANTMAP_CRITICAL_MASK;

    // eslint-disable-next-line no-bitwise
    const maxVersion = VARIANTMAP_VERSION & VARIANTMAP_CRITICAL_MASK;
    if (version > maxVersion) {
      throw new Error('Unsupported KeePass variant map version.');
    }

    const map: VariantFieldMap = {};

    while (true) {
      const fieldType = reader.readInt8();
      if (!toVariantMapFieldType(fieldType)) {
        throw new Error('Invalid variant map field type');
      }

      if (fieldType === VariantMapFieldType.End) {
        break;
      }

      const nameLen = reader.readUInt32LE();
      let nameBytes = new Uint8Array(0);
      if (nameLen) {
        nameBytes = reader.readBytes(nameLen);
        if (nameBytes.byteLength !== nameLen) {
          throw new Error('Invalid variant map entry name data');
        }
      }
      const name = String.fromCharCode(...nameBytes);

      const valueLen = reader.readUInt32LE();
      let valueBytes = new Uint8Array(0);
      if (valueLen) {
        valueBytes = reader.readBytes(valueLen);
        if (valueBytes.byteLength !== valueLen) {
          throw new Error('Invalid variant map entry value data');
        }
      }

      switch (fieldType) {
        case VariantMapFieldType.Bool:
          if (valueLen === 1) {
            map[name] = valueBytes.at(0) !== 0;
          } else {
            throw new Error('Invalid variant map Bool entry value length');
          }
          break;

        case VariantMapFieldType.Int32:
          if (valueLen === 4) {
            map[name] = Uint8ArrayReader.toInt32LE(valueBytes);
          } else {
            throw new Error('Invalid variant map Int32 entry value length');
          }
          break;

        case VariantMapFieldType.UInt32:
          if (valueLen === 4) {
            map[name] = Uint8ArrayReader.toUInt32LE(valueBytes);
          } else {
            throw new Error('Invalid variant map UInt32 entry value length');
          }
          break;

        case VariantMapFieldType.Int64:
          if (valueLen === 8) {
            map[name] = Uint8ArrayReader.toInt64LE(valueBytes);
          } else {
            throw new Error('Invalid variant map Int64 entry value length');
          }
          break;

        case VariantMapFieldType.UInt64:
          if (valueLen === 8) {
            map[name] = Uint8ArrayReader.toUInt64LE(valueBytes);
          } else {
            throw new Error('Invalid variant map UInt64 entry value length');
          }
          break;

        case VariantMapFieldType.String:
          map[name] = String.fromCharCode(...valueBytes);
          break;

        case VariantMapFieldType.ByteArray:
          map[name] = valueBytes;
          break;

        default:
          throw new Error('Invalid variant map entry type');
      }
    }

    return map;
  }

  protected async readVersionDatabase(
    reader: Uint8ArrayCursorReader,
    headerData: Uint8Array,
    key: CompositeKey,
    database: Database,
  ): Promise<Database> {
    this.binaryPool = {};

    if (
      // eslint-disable-next-line no-bitwise
      (database.getFormatVersion() & FILE_VERSION_CRITICAL_MASK) !==
      FILE_VERSION_4
    ) {
      throw new Error('Unexpected file version');
    }

    if (
      !this.getMasterSeed() ||
      !this.getEncryptionIV() ||
      !database.getCipher()
    ) {
      throw new Error('missing database headers');
    }

    if (!(await database.setKey(key))) {
      throw new Error('Unable to calculate database key');
    }

    const finalKey = await CryptoHash.hash(
      [this.getMasterSeed(), await database.getTransformedDatabaseKey()],
      CryptoHashAlgorithm.Sha256,
    );

    const headerSha256 = reader.readBytes(32);
    const headerHmac = reader.readBytes(32);
    if (headerSha256.byteLength !== 32 || headerHmac.byteLength !== 32) {
      throw new Error('Invalid header checksum size');
    }
    if (
      !Uint8ArrayReader.equals(
        headerSha256,
        await CryptoHash.hash(headerData, CryptoHashAlgorithm.Sha256),
      )
    ) {
      throw new Error('Header SHA256 mismatch');
    }

    const hmacKey = await keepass2HmacKey(
      this.getMasterSeed(),
      await database.getTransformedDatabaseKey(),
    );

    if (
      !Uint8ArrayReader.equals(
        headerHmac,
        await CryptoHash.hmac(
          headerData,
          await HmacBlockStream.getHmacKey(UINT64_MAX, hmacKey),
          CryptoHashAlgorithm.Sha256,
        ),
      )
    ) {
      throw new Error('HMAC mismatch (Invalid credentials?)');
    }

    const stream = new HmacBlockStream(
      new Uint8ArrayCursorReader(new Uint8ArrayReader(reader.slice())),
      hmacKey,
    );

    const mode = SymmetricCipher.cipherUuidToMode(database.getCipher());
    if (mode === SymmetricCipherMode.InvalidMode) {
      throw new Error(`Unknown cipher ${database.getCipher()}`);
    }

    const cipher = await SymmetricCipher.create(
      mode,
      SymmetricCipherDirection.Decrypt,
      finalKey,
      this.getEncryptionIV(),
    );

    let readBytes: Uint8Array = new Uint8Array(0);

    while (await stream.readHashedBlock()) {
      readBytes = new Uint8Array([...readBytes, ...stream.getBuffer()]);
    }

    readBytes = await cipher.finish(readBytes);

    const isCompressed =
      database.getCompressionAlgorithm() ===
      CompressionAlgorithm.CompressionGZip;

    const buffer = isCompressed ? await gunzip(readBytes) : readBytes;
    const bufferReader = new Uint8ArrayCursorReader(
      new Uint8ArrayReader(buffer),
    );

    while (this.readInnerHeaderField(bufferReader)) {
      //
    }

    const randomStream = await KeePass2RandomStream.create(
      this.getSymmetricCipherMode(),
      this.getProtectedStreamKey(),
    );

    const xmlReader = new KdbxXmlReader(
      FILE_VERSION_4,
      this.binaryPool,
      randomStream,
    );
    const remaining = bufferReader.slice();

    await xmlReader.readDatabase(remaining, database);

    await randomStream.destroy();
    await cipher.destroy();

    return database;
  }

  protected readInnerHeaderField(reader: Uint8ArrayCursorReader): boolean {
    const fieldId = reader.readInt8();
    if (!toInnerHeaderFieldId(fieldId)) {
      throw new Error('Invalid inner header id size');
    }

    const fieldLen = reader.readUInt32LE();

    if (fieldId === InnerHeaderFieldId.End) {
      return false;
    }

    let fieldData: Uint8Array | undefined;
    if (fieldLen) {
      fieldData = reader.readBytes(fieldLen);
      if (fieldData.byteLength !== fieldLen) {
        throw new Error(
          `Invalid inner header data length: field ${InnerHeaderFieldId[fieldId]}, ${fieldLen} expected, ${fieldData.byteLength} found`,
        );
      }
    }

    if (!fieldData) {
      throw new Error(`Missing field data for ${InnerHeaderFieldId[fieldId]}`);
    }

    switch (fieldId) {
      case InnerHeaderFieldId.InnerRandomStreamID:
        this.setSymmetricCipherModeFromInnerRandomStreamId(fieldData);
        break;

      case InnerHeaderFieldId.InnerRandomStreamKey:
        this.setProtectedStreamKey(fieldData);
        break;

      case InnerHeaderFieldId.Binary: {
        if (fieldLen < 1) {
          throw new Error('Invalid inner header binary size');
        }
        this.binaryPool[`${Object.keys(this.binaryPool).length}`] =
          fieldData.subarray(1);
        break;
      }
    }

    return true;
  }
}
