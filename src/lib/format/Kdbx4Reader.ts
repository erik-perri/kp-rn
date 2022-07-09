import KdbxReader from './KdbxReader';
import {Database} from '../core/Database';
import {BufferReader} from '../utilities/BufferReader';
import CompositeKey from '../keys/CompositeKey';
import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';
import {areUint8ArraysEqual} from '../utilities/Uint8Array';
import {
  FILE_VERSION_4,
  FILE_VERSION_CRITICAL_MASK,
  HeaderFieldId,
  hmacKey as keepass2HmacKey,
  kdfFromParameters,
  toHeaderFieldId,
  toVariantMapFieldType,
  VariantFieldMap,
  VARIANTMAP_CRITICAL_MASK,
  VARIANTMAP_VERSION,
  VariantMapFieldType,
} from './Keepass2';
import {getHmacKey, UINT64_MAX} from '../streams/HmacBlockStream';

export default class Kdbx4Reader extends KdbxReader {
  protected readHeaderField(reader: BufferReader, database: Database): boolean {
    const fieldId = reader.readInt8();
    if (!toHeaderFieldId(fieldId)) {
      throw new Error('Invalid header id size');
    }

    const fieldLen = reader.readUInt32LE(4);
    if (!fieldLen) {
      throw new Error(
        `Invalid header field length: field ${HeaderFieldId[fieldId]}`,
      );
    }

    let fieldData: Uint8Array = new Uint8Array(0);
    if (fieldLen) {
      fieldData = reader.readBytes(fieldLen);
      if (fieldData.length !== fieldLen) {
        throw new Error(
          `Invalid header data length: field ${HeaderFieldId[fieldId]}, ${fieldLen} expected, ${fieldData.length} found`,
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
        const kdfReader = new BufferReader(new Buffer(fieldData), 0);
        const kdfParams = this.readVariantMap(kdfReader);

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
          this.readVariantMap(new BufferReader(new Buffer(fieldData), 0)),
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

  private readVariantMap(reader: BufferReader): VariantFieldMap {
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

      const nameLen = reader.readUInt32LE(4);
      let nameBytes = new Uint8Array(0);
      if (nameLen) {
        nameBytes = reader.readBytes(nameLen);
        if (nameBytes.length !== nameLen) {
          throw new Error('Invalid variant map entry name data');
        }
      }
      const name = String.fromCharCode(...nameBytes);

      const valueLen = reader.readUInt32LE(4);
      let valueBytes = new Uint8Array(0);
      if (valueLen) {
        valueBytes = reader.readBytes(valueLen);
        if (valueBytes.length !== valueLen) {
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
            map[name] = new DataView(valueBytes.buffer).getInt32(0, true);
          } else {
            throw new Error('Invalid variant map Int32 entry value length');
          }
          break;

        case VariantMapFieldType.UInt32:
          if (valueLen === 4) {
            map[name] = new DataView(valueBytes.buffer).getUint32(0, true);
          } else {
            throw new Error('Invalid variant map UInt32 entry value length');
          }
          break;

        case VariantMapFieldType.Int64:
          if (valueLen === 8) {
            map[name] = new DataView(valueBytes.buffer).getBigInt64(0, true);
          } else {
            throw new Error('Invalid variant map Int64 entry value length');
          }
          break;

        case VariantMapFieldType.UInt64:
          if (valueLen === 8) {
            map[name] = new DataView(valueBytes.buffer).getBigUint64(0, true);
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

  protected readVersionDatabase(
    reader: BufferReader,
    headerData: Uint8Array,
    key: CompositeKey,
    database: Database,
  ): Database {
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

    if (!database.setKey(key)) {
      throw new Error('Unable to calculate database key');
    }

    // const hash = new CryptoHash(CryptoHashAlgorithm.Sha256);
    // hash.addData(this.getMasterSeed());
    // hash.addData(database.getTransformedDatabaseKey());
    // const finalKey = hash.result();

    const headerSha256 = reader.readBytes(32);
    const headerHmac = reader.readBytes(32);
    if (headerSha256.length !== 32 || headerHmac.length !== 32) {
      throw new Error('Invalid header checksum size');
    }
    if (
      !areUint8ArraysEqual(
        headerSha256,
        CryptoHash.hash(headerData, CryptoHashAlgorithm.Sha256),
      )
    ) {
      throw new Error('Header SHA256 mismatch');
    }

    const hmacKey = keepass2HmacKey(
      this.getMasterSeed(),
      database.getTransformedDatabaseKey(),
    );
    if (
      !areUint8ArraysEqual(
        headerHmac,
        CryptoHash.hmac(
          headerData,
          getHmacKey(UINT64_MAX, hmacKey),
          CryptoHashAlgorithm.Sha256,
        ),
      )
    ) {
      throw new Error('HMAC mismatch');
    }

    return database;
  }
}

/*
  protected readInnerHeaderField(
    reader: BufferReader,
    database: Database,
  ): boolean {
    const fieldId = reader.readInt8();
    if (!toInnerHeaderFieldId(fieldId)) {
      throw new Error('Invalid inner header id size');
    }
    console.log('fieldId', InnerHeaderFieldId[fieldId]);

    const fieldLen = reader.readUInt32LE(4);
    if (!fieldLen) {
      throw new Error(
        `Invalid inner header field length: field ${InnerHeaderFieldId[fieldId]}`,
      );
    }
    console.log('fieldLen', fieldLen);

    let fieldData: Uint8Array | undefined;
    if (fieldLen) {
      fieldData = reader.readBytes(fieldLen);
      if (fieldData.length !== fieldLen) {
        throw new Error(
          `Invalid inner header data length: field ${InnerHeaderFieldId[fieldId]}, ${fieldLen} expected, ${fieldData.length} found`,
        );
      }
    }

    switch (fieldId) {
      case InnerHeaderFieldId.End:
        return false;

      case InnerHeaderFieldId.InnerRandomStreamID:
        // setInnerRandomStreamID(fieldData);
        break;

      case InnerHeaderFieldId.InnerRandomStreamKey:
        // setProtectedStreamKey(fieldData);
        break;

      case InnerHeaderFieldId.Binary: {
        if (fieldLen < 1) {
          throw new Error('Invalid inner header binary size');
        }
        // auto data = fieldData.mid(1);
        // m_binaryPool.insert(QString::number(m_binaryPool.size()), data);
        break;
      }
    }

    return true;
  }
 */
