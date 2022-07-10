import {
  CIPHER_AES128,
  CIPHER_AES256,
  CIPHER_CHACHA20,
  CIPHER_TWOFISH,
} from '../format/Keepass2';
import {Chacha20} from 'ts-chacha20';

export enum SymmetricCipherDirection {
  Decrypt,
  Encrypt,
}

export enum SymmetricCipherMode {
  Aes128_CBC,
  Aes256_CBC,
  Aes128_CTR,
  Aes256_CTR,
  Twofish_CBC,
  ChaCha20,
  Salsa20,
  Aes256_GCM,
  InvalidMode = -1,
}

export default class SymmetricCipher {
  private mode?: SymmetricCipherMode;
  private processor?: (data: Uint8Array) => Uint8Array;

  init(
    mode: SymmetricCipherMode,
    direction: SymmetricCipherDirection,
    key: Uint8Array,
    iv: Uint8Array,
  ): void {
    this.mode = mode;
    if (mode === SymmetricCipherMode.InvalidMode) {
      throw new Error('SymmetricCipher::init: Invalid cipher mode.');
    }

    switch (mode) {
      case SymmetricCipherMode.ChaCha20:
        const cipher = new Chacha20(key, iv);

        this.processor = data => {
          return direction === SymmetricCipherDirection.Encrypt
            ? cipher.encrypt(data)
            : cipher.decrypt(data);
        };
    }
  }

  process(data: Uint8Array): Uint8Array {
    if (!this.processor) {
      throw new Error('Cipher not initialized prior to use.');
    }

    if (data.byteLength === 0) {
      throw new Error('Cannot process 0 length data.');
    }

    return this.processor(data);
  }

  static cipherUuidToMode(uuid?: string): SymmetricCipherMode {
    switch (uuid) {
      case CIPHER_AES128:
        return SymmetricCipherMode.Aes128_CBC;
      case CIPHER_AES256:
        return SymmetricCipherMode.Aes256_CBC;
      case CIPHER_CHACHA20:
        return SymmetricCipherMode.ChaCha20;
      case CIPHER_TWOFISH:
        return SymmetricCipherMode.Twofish_CBC;
    }

    console.warn(`SymmetricCipher: Invalid KeePass2 Cipher UUID ${uuid}`);
    return SymmetricCipherMode.InvalidMode;
  }
}
