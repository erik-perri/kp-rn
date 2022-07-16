import pako from 'pako';

export async function gunzip(input: Uint8Array): Promise<Uint8Array> {
  return Promise.resolve(pako.inflate(input));
}
