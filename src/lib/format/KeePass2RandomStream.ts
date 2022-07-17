import SymmetricCipher, {
  SymmetricCipherDirection,
  SymmetricCipherMode,
} from '../crypto/SymmetricCipher';
import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';

export default class KeePass2RandomStream {
  private cipher: SymmetricCipher = new SymmetricCipher();

  constructor() {
    //
  }

  async init(mode: SymmetricCipherMode, key: Uint8Array): Promise<void> {
    switch (mode) {
      case SymmetricCipherMode.Salsa20:
        throw new Error('Not implemented');
      case SymmetricCipherMode.ChaCha20: {
        const keyIv = await CryptoHash.hash(key, CryptoHashAlgorithm.Sha512);
        await this.cipher.init(
          SymmetricCipherMode.ChaCha20,
          SymmetricCipherDirection.Encrypt,
          keyIv.subarray(0, 32),
          keyIv.subarray(32, 44),
        );
        break;
      }
      default:
        throw new Error(`Invalid stream cipher mode (${mode})`);
    }
  }

  async process(data: Uint8Array): Promise<Uint8Array> {
    if (!this.cipher) {
      throw new Error('No cipher set');
    }

    return await this.cipher.process(data);
  }
}
