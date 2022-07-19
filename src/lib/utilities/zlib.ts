import pako from 'pako';

export async function gunzip(input: Uint8Array): Promise<Uint8Array> {
  return pako.inflate(input);
}
