import {
  CIPHER_AES128,
  CIPHER_AES256,
  CIPHER_CHACHA20,
  CIPHER_TWOFISH,
} from '../format/Keepass2';

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

export function cipherUuidToMode(uuid: string): SymmetricCipherMode {
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
