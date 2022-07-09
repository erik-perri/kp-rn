import {CompressionAlgorithm} from './Database';
import Kdf from '../crypto/kdf/Kdf';
import CompositeKey from '../keys/CompositeKey';
import PasswordKey from '../keys/PasswordKey';

export default class DatabaseData {
  private _compressionAlgorithm?: CompressionAlgorithm;
  private _kdf?: Kdf;
  private _key?: CompositeKey;

  public readonly transformedDatabaseKey: PasswordKey = new PasswordKey();

  constructor(key: CompositeKey) {
    this._key = key;
  }

  get compressionAlgorithm(): CompressionAlgorithm {
    if (this._compressionAlgorithm === undefined) {
      throw new Error('compressionAlgorithm not set');
    }
    return this._compressionAlgorithm;
  }

  set compressionAlgorithm(value: CompressionAlgorithm) {
    this._compressionAlgorithm = value;
  }

  get kdf(): Kdf {
    if (this._kdf === undefined) {
      throw new Error('kdf not set');
    }
    return this._kdf;
  }

  set kdf(value: Kdf) {
    this._kdf = value;
  }

  get key(): CompositeKey {
    if (this._key === undefined) {
      throw new Error('key not set');
    }
    return this._key;
  }

  set key(value: CompositeKey) {
    this._key = value;
  }
}
