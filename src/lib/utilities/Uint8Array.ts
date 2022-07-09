export function areUint8ArraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }

  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

export function makeUint8ArrayFromUint64(data: bigint): Uint8Array {
  const indexBytes = new ArrayBuffer(8);
  new DataView(indexBytes).setBigUint64(0, data, true);
  return new Uint8Array(indexBytes);
}
