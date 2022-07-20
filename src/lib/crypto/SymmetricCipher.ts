import {
  CIPHER_AES128,
  CIPHER_AES256,
  CIPHER_CHACHA20,
  CIPHER_TWOFISH,
} from '../format/Keepass2';
import KpHelperModule from '../utilities/KpHelperModule';

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

export interface Cipher {
  process(data: Uint8Array): Promise<Uint8Array>;

  finish(data: Uint8Array): Promise<Uint8Array>;

  destroy(): Promise<void>;
}

export default class SymmetricCipher {
  static async create(
    mode: SymmetricCipherMode,
    direction: SymmetricCipherDirection,
    key: Uint8Array,
    iv: Uint8Array,
  ): Promise<Cipher> {
    if (mode === SymmetricCipherMode.InvalidMode) {
      throw new Error('SymmetricCipher::init: Invalid cipher mode.');
    }

    switch (mode) {
      case SymmetricCipherMode.ChaCha20:
      case SymmetricCipherMode.Twofish_CBC:
      case SymmetricCipherMode.Aes256_CBC: {
        return await KpHelperModule.createCipher(mode, direction, key, iv);
      }

      default:
        throw new Error(
          `Cipher ${SymmetricCipherMode[mode]} (${mode}) not implemented`,
        );
    }
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
