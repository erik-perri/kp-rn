import SymmetricCipher, {
  Cipher,
  SymmetricCipherDirection,
  SymmetricCipherMode,
} from '../crypto/SymmetricCipher';
import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';

export default abstract class KeePass2RandomStream {
  static async create(
    mode: SymmetricCipherMode,
    key: Uint8Array,
  ): Promise<Cipher> {
    switch (mode) {
      case SymmetricCipherMode.Salsa20:
        throw new Error('Not implemented');
      case SymmetricCipherMode.ChaCha20: {
        const keyIv = await CryptoHash.hash(key, CryptoHashAlgorithm.Sha512);
        return SymmetricCipher.create(
          SymmetricCipherMode.ChaCha20,
          SymmetricCipherDirection.Encrypt,
          keyIv.subarray(0, 32),
          keyIv.subarray(32, 44),
        );
      }
      default:
        throw new Error(`Invalid stream cipher mode (${mode})`);
    }
  }
}
