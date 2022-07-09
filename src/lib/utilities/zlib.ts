import zlib from 'zlib';

export async function gunzip(input: Uint8Array): Promise<Buffer> {
  return await new Promise<Buffer>((resolve, reject) => {
    zlib.gunzip(input, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
}
