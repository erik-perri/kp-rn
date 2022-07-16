import CryptoHash, {CryptoHashAlgorithm} from '../crypto/CryptoHash';
import Kdf from '../crypto/kdf/Kdf';
import {stringify as uuidStringify} from 'uuid';
import AesKdf from '../crypto/kdf/AesKdf';
import {UUID_SIZE} from '../utilities/sizes';
import {BigInteger} from 'big-integer';

export const SIGNATURE_1 = 0x9aa2d903;
export const SIGNATURE_2 = 0xb54bfb67;

export const FILE_VERSION_4_1 = 0x00040001;
export const FILE_VERSION_4 = 0x00040000;
export const FILE_VERSION_3_1 = 0x00030001;
export const FILE_VERSION_3 = 0x00030000;
export const FILE_VERSION_2 = 0x00020000;
export const FILE_VERSION_CRITICAL_MASK = 0xffff0000;

export const VARIANTMAP_VERSION = 0x0100;
export const VARIANTMAP_CRITICAL_MASK = 0xff00;

export const CIPHER_AES128 = '61ab05a1-9464-41c3-8d74-3a563df8dd35';
export const CIPHER_AES256 = '31c1f2e6-bf71-4350-be58-05216afc5aff';
export const CIPHER_TWOFISH = 'ad68f29f-576f-4bb9-a36a-d47af965346c';
export const CIPHER_CHACHA20 = 'd6038a2b-8b6f-4cb5-a524-339a31dbb59a';

export const KDF_AES_KDBX3 = 'c9d9f39a-628a-4460-bf74-0d08c18a4fea';
export const KDF_AES_KDBX4 = '7c02bb82-79a7-4ac0-927d-114a00648238';
export const KDF_ARGON2D = 'ef636ddf-8c29-444b-91f7-a9a403e30a0c';
export const KDF_ARGON2ID = '9e298b19-56db-4773-b23d-fc3ec6f0a1e6';

export const KDFPARAM_UUID = '$UUID';
// AES parameters
export const KDFPARAM_AES_ROUNDS = 'R';
export const KDFPARAM_AES_SEED = 'S';
// Argon2 parameters
export const KDFPARAM_ARGON2_SALT = 'S';
export const KDFPARAM_ARGON2_PARALLELISM = 'P';
export const KDFPARAM_ARGON2_MEMORY = 'M';
export const KDFPARAM_ARGON2_ITERATIONS = 'I';
export const KDFPARAM_ARGON2_VERSION = 'V';
export const KDFPARAM_ARGON2_SECRET = 'K';
export const KDFPARAM_ARGON2_ASSOCDATA = 'A';

export function hmacKey(
  masterSeed: Uint8Array,
  transformedMasterKey: Uint8Array,
): Uint8Array {
  const hmacKeyHash = new CryptoHash(CryptoHashAlgorithm.Sha512);
  hmacKeyHash.addData(masterSeed);
  hmacKeyHash.addData(transformedMasterKey);
  hmacKeyHash.addData(Uint8Array.from([0x01]));
  return hmacKeyHash.result();
}

function uuidToKdf(uuid: string): Kdf | undefined {
  if (uuid === KDF_AES_KDBX3) {
    return new AesKdf(true);
  }
  if (uuid === KDF_AES_KDBX4) {
    return new AesKdf();
  }
  if (uuid === KDF_ARGON2D) {
    throw new Error('Not implemented');
  }
  if (uuid === KDF_ARGON2ID) {
    throw new Error('Not implemented');
  }

  return undefined;
}

export enum HeaderFieldId {
  EndOfHeader = 0,
  Comment = 1,
  CipherID = 2,
  CompressionFlags = 3,
  MasterSeed = 4,
  TransformSeed = 5,
  TransformRounds = 6,
  EncryptionIV = 7,
  ProtectedStreamKey = 8,
  StreamStartBytes = 9,
  InnerRandomStreamID = 10,
  KdfParameters = 11,
  PublicCustomData = 12,
}

export function toHeaderFieldId(id: number): id is HeaderFieldId {
  return (
    id >= HeaderFieldId.EndOfHeader && id <= HeaderFieldId.PublicCustomData
  );
}

export enum InnerHeaderFieldId {
  End = 0,
  InnerRandomStreamID = 1,
  InnerRandomStreamKey = 2,
  Binary = 3,
}

export function toInnerHeaderFieldId(id: number): id is InnerHeaderFieldId {
  return id >= InnerHeaderFieldId.End || id <= InnerHeaderFieldId.Binary;
}

export enum ProtectedStreamAlgo {
  ArcFourVariant = 1,
  Salsa20 = 2,
  ChaCha20 = 3,
  InvalidProtectedStreamAlgo = -1,
}

export function toProtectedStreamAlgo(id: number): id is ProtectedStreamAlgo {
  return (
    id >= ProtectedStreamAlgo.ArcFourVariant ||
    id <= ProtectedStreamAlgo.ChaCha20
  );
}

export enum VariantMapFieldType {
  End = 0,
  // Byte = 0x02,
  // UInt16 = 0x03,
  UInt32 = 0x04,
  UInt64 = 0x05,
  // Signed mask: 0x08
  Bool = 0x08,
  // SByte = 0x0A,
  // Int16 = 0x0B,
  Int32 = 0x0c,
  Int64 = 0x0d,
  // Float = 0x10,
  // Double = 0x11,
  // Decimal = 0x12,
  // Char = 0x17, // 16-bit Unicode character
  String = 0x18,
  // Array mask: 0x40
  ByteArray = 0x42,
}

export type VariantFieldTypes =
  | boolean
  | BigInteger
  | number
  | string
  | Uint8Array;
export type VariantFieldMap = Record<string, VariantFieldTypes>;

export function toVariantMapFieldType(id: number): id is VariantMapFieldType {
  return id >= VariantMapFieldType.End || id <= VariantMapFieldType.ByteArray;
}

export function kdfFromParameters(map: VariantFieldMap): Kdf | undefined {
  const uuidBytes = map[KDFPARAM_UUID];
  if (
    !(uuidBytes instanceof Uint8Array) ||
    uuidBytes.byteLength !== UUID_SIZE
  ) {
    return undefined;
  }

  let kdfUuid = uuidStringify(uuidBytes);
  if (kdfUuid === KDF_AES_KDBX3) {
    // upgrade to non-legacy AES-KDF, since KDBX3 doesn't have any KDF parameters
    kdfUuid = KDF_AES_KDBX4;
  }

  const kdf = uuidToKdf(kdfUuid);
  if (!kdf) {
    console.warn('uuidToKdf failed');
    return undefined;
  }

  if (!kdf.processParameters(map)) {
    console.warn('processParameters failed');
    return undefined;
  }

  return kdf;
}
