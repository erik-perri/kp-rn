const headerData = Uint8Array.from([
  0x03, 0xd9, 0xa2, 0x9a, 0x67, 0xfb, 0x4b, 0xb5, 0x00, 0x00, 0x04, 0x00, 0x02,
  0x10, 0x00, 0x00, 0x00, 0x31, 0xc1, 0xf2, 0xe6, 0xbf, 0x71, 0x43, 0x50, 0xbe,
  0x58, 0x05, 0x21, 0x6a, 0xfc, 0x5a, 0xff, 0x03, 0x04, 0x00, 0x00, 0x00, 0x01,
  0x00, 0x00, 0x00, 0x04, 0x20, 0x00, 0x00, 0x00, 0x8b, 0x83, 0x3c, 0x61, 0xf6,
  0x4f, 0xd8, 0x29, 0x29, 0xfa, 0x1c, 0xfa, 0x3d, 0x57, 0xec, 0xb4, 0x3d, 0xbb,
  0x7b, 0x2f, 0x2d, 0xc2, 0x54, 0x67, 0x42, 0x88, 0x9d, 0xdc, 0x57, 0xbf, 0x2e,
  0x91, 0x07, 0x10, 0x00, 0x00, 0x00, 0x6a, 0xf3, 0x11, 0x05, 0x88, 0x61, 0x82,
  0x6e, 0xc7, 0x0d, 0x3f, 0x0b, 0xe1, 0xc4, 0xca, 0xd5, 0x0b, 0x5d, 0x00, 0x00,
  0x00, 0x00, 0x01, 0x42, 0x05, 0x00, 0x00, 0x00, 0x24, 0x55, 0x55, 0x49, 0x44,
  0x10, 0x00, 0x00, 0x00, 0xc9, 0xd9, 0xf3, 0x9a, 0x62, 0x8a, 0x44, 0x60, 0xbf,
  0x74, 0x0d, 0x08, 0xc1, 0x8a, 0x4f, 0xea, 0x05, 0x01, 0x00, 0x00, 0x00, 0x52,
  0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x42,
  0x01, 0x00, 0x00, 0x00, 0x53, 0x20, 0x00, 0x00, 0x00, 0x93, 0x16, 0xf5, 0x2d,
  0x88, 0xe9, 0x3f, 0x08, 0x65, 0xff, 0xaf, 0x96, 0x38, 0x25, 0xb2, 0x57, 0xc2,
  0x60, 0xa3, 0xf4, 0xf8, 0x68, 0xde, 0x6d, 0x6c, 0x14, 0x0c, 0xf9, 0x15, 0x0e,
  0xe7, 0xd3, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x0d, 0x0a, 0x0d, 0x0a,
]);

const hmacKey = Uint8Array.from([
  0xc0, 0x6c, 0xfa, 0xe4, 0xc0, 0x2c, 0x8a, 0xc4, 0xdf, 0xa9, 0xc9, 0xf3, 0xb2,
  0xb8, 0x56, 0xa2, 0xe3, 0xc6, 0x27, 0x27, 0x15, 0x63, 0x57, 0xcf, 0x5c, 0xf7,
  0xc3, 0x86, 0x3c, 0xc2, 0x85, 0x1a, 0x9a, 0x4b, 0xda, 0xfa, 0x12, 0xb9, 0xe9,
  0x06, 0x77, 0xf0, 0x1d, 0xbc, 0x3f, 0x03, 0x5d, 0x60, 0x3b, 0xf6, 0x26, 0x60,
  0x93, 0xa9, 0x2a, 0x21, 0x3c, 0xf8, 0xb7, 0xc7, 0x7c, 0xdd, 0x72, 0x2e,
]);

const headerHmacHash = Uint8Array.from([
  0x41, 0x58, 0x4a, 0xfe, 0xf3, 0xab, 0xa4, 0x67, 0xee, 0x67, 0x5c, 0xeb, 0xac,
  0xd8, 0x8c, 0x18, 0x99, 0x1c, 0xf1, 0xf9, 0xbc, 0x55, 0x6f, 0x7c, 0x4c, 0xeb,
  0x4e, 0x8d, 0x6f, 0x5d, 0x54, 0xb8,
]);

const masterSeed = Uint8Array.from([
  0x8b, 0x83, 0x3c, 0x61, 0xf6, 0x4f, 0xd8, 0x29, 0x29, 0xfa, 0x1c, 0xfa, 0x3d,
  0x57, 0xec, 0xb4, 0x3d, 0xbb, 0x7b, 0x2f, 0x2d, 0xc2, 0x54, 0x67, 0x42, 0x88,
  0x9d, 0xdc, 0x57, 0xbf, 0x2e, 0x91,
]);

const transformedDatabaseKey = Uint8Array.from([
  0x21, 0xf1, 0x6a, 0xe7, 0x24, 0x41, 0xff, 0x84, 0x82, 0xf0, 0x4a, 0x87, 0x58,
  0xc8, 0xac, 0xd6, 0x54, 0x55, 0x3a, 0xfe, 0x24, 0x0c, 0x43, 0xf2, 0x6f, 0x48,
  0xf4, 0x03, 0xb0, 0x6c, 0xf3, 0xcd,
]);

const encryptionIV = Uint8Array.from([
  0x6a, 0xf3, 0x11, 0x05, 0x88, 0x61, 0x82, 0x6e, 0xc7, 0x0d, 0x3f, 0x0b, 0xe1,
  0xc4, 0xca, 0xd5,
]);

export default {
  encryptionIV,
  headerData,
  headerHmacHash,
  hmacKey,
  masterSeed,
  transformedDatabaseKey,
};
