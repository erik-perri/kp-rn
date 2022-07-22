export function stringifyUuid(uuid: Uint8Array) {
  const uuidAsHex: string = [...uuid]
    .map((input: number) => input.toString(16).padStart(2, '0'))
    .join('');

  return (
    uuidAsHex.slice(0, 8) +
    '-' +
    uuidAsHex.slice(8, 12) +
    '-' +
    uuidAsHex.slice(12, 16) +
    '-' +
    uuidAsHex.slice(16, 20) +
    '-' +
    uuidAsHex.slice(20)
  ).toLowerCase();
}
