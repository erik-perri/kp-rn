import Kdf from '../crypto/kdf/Kdf';
import {VariantFieldMap} from '../format/Keepass2';
import CompositeKey from '../keys/CompositeKey';
import PasswordKey from '../keys/PasswordKey';
import DatabaseData from './DatabaseData';
import Group from './Group';
import Metadata from './Metadata';
import {Uuid} from './types';

export enum CompressionAlgorithm {
  CompressionNone = 0,
  CompressionGZip = 1,
}

export function toCompressionAlgorithm(id: number): id is CompressionAlgorithm {
  return (
    id >= CompressionAlgorithm.CompressionNone &&
    id <= CompressionAlgorithm.CompressionGZip
  );
}

export interface DeletedObject {
  uuid?: Uuid;
  deletionTime?: Date;
}

export class Database {
  readonly metadata: Metadata;
  readonly data: DatabaseData;

  public rootGroup?: Group;
  public deletedObjects: DeletedObject[] = [];

  private cipher?: string;
  private formatVersion?: number;

  constructor(key: CompositeKey) {
    this.data = new DatabaseData(key);
    this.metadata = {};
  }

  setCipher(uuid: string) {
    this.cipher = uuid;
  }

  getCipher(): string | undefined {
    return this.cipher;
  }

  setCompressionAlgorithm(type: CompressionAlgorithm) {
    this.data.compressionAlgorithm = type;
  }

  getCompressionAlgorithm(): CompressionAlgorithm {
    return this.data.compressionAlgorithm;
  }

  setKdf(kdf: Kdf) {
    this.data.kdf = kdf;

    // this.setFormatVersion(
    //   KeePass2Writer::kdbxVersionRequired(this, true, m_data.kdf.isNull())
    // );
  }

  setPublicCustomData(map: VariantFieldMap) {
    console.log('Found public custom data', map);
  }

  setFormatVersion(version: number): void {
    this.formatVersion = version;
  }

  getFormatVersion(): number {
    if (!this.formatVersion) {
      throw new Error('No formatVersion set');
    }
    return this.formatVersion;
  }

  async setKey(key: CompositeKey | null, transformKey: boolean = true) {
    if (!key) {
      throw new Error('reset not implemented');
    }

    let oldTransformedDatabaseKey = new PasswordKey();
    if (!this.data.key.isEmpty) {
      oldTransformedDatabaseKey.setRawKey(
        await this.data.transformedDatabaseKey.getRawKey(),
      );
    }

    let transformedDatabaseKey: Uint8Array;
    if (!transformKey) {
      transformedDatabaseKey = await oldTransformedDatabaseKey.getRawKey();
    } else {
      transformedDatabaseKey = await key.transform(this.data.kdf);
    }

    this.data.key = key;
    if (transformedDatabaseKey.byteLength > 0) {
      this.data.transformedDatabaseKey.setRawKey(transformedDatabaseKey);
    }

    // if (updateChangedTime) {
    //   m_metadata->setDatabaseKeyChanged(Clock::currentDateTimeUtc());
    // }
    // if (oldTransformedDatabaseKey.getRawKey() !== this.data.transformedDatabaseKey.getRawKey()) {
    //   markAsModified();
    // }

    return true;
  }

  async getTransformedDatabaseKey(): Promise<Uint8Array> {
    return await this.data.transformedDatabaseKey.getRawKey();
  }
}
