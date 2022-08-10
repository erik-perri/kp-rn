export interface ColorRGBA {
  red: number;
  green: number;
  blue: number;
  alpha?: number;
}

function isValidObject({red, green, blue, alpha}: ColorRGBA): boolean {
  return (
    !isNaN(red) &&
    !isNaN(green) &&
    !isNaN(blue) &&
    (alpha === undefined || !isNaN(alpha))
  );
}

export function convertHexToObject(input: string): ColorRGBA | null {
  const match = /^#?([0-f]{3,8})$/.exec(input);
  if (!match) {
    return null;
  }

  const color = match[1];
  if (color.length === 3 || color.length === 4) {
    const red = parseInt(color.substring(0, 1).repeat(2), 16);
    const green = parseInt(color.substring(1, 2).repeat(2), 16);
    const blue = parseInt(color.substring(2, 3).repeat(2), 16);
    const alpha =
      color.length === 4
        ? parseInt(color.substring(3, 4).repeat(2), 16)
        : undefined;

    const object = {red, green, blue, alpha};
    if (isValidObject(object)) {
      return object;
    }
  } else if (color.length === 6 || color.length === 8) {
    const red = parseInt(color.substring(0, 2), 16);
    const green = parseInt(color.substring(2, 4), 16);
    const blue = parseInt(color.substring(4, 6), 16);
    const alpha =
      color.length === 8 ? parseInt(color.substring(6, 8), 16) : undefined;

    const object = {red, green, blue, alpha};
    if (isValidObject(object)) {
      return object;
    }
  }

  return null;
}

export function convertRgbToObject(input: string): ColorRGBA | null {
  const result = /^rgba?\(([^)]+)\)$/.exec(input);
  if (!result) {
    return null;
  }

  const parts = result[1].split(',').map((part, index) => {
    if (index > 2) {
      return parseFloat(part.trim());
    } else {
      return parseInt(part.trim(), 10);
    }
  });

  const object = {
    red: parts[0],
    green: parts[1],
    blue: parts[2],
    alpha: parts.length > 3 ? Math.min(255, parts[3] * 255) : undefined,
  };

  return isValidObject(object) ? object : null;
}

function convertObjectToHex(color: ColorRGBA): string {
  const parts = [
    color.red.toString(16).padStart(2, '0'),
    color.green.toString(16).padStart(2, '0'),
    color.blue.toString(16).padStart(2, '0'),
  ];
  if (color.alpha !== undefined) {
    parts.push(color.alpha.toString(16).padStart(2, '0'));
  }
  return `#${parts.join('')}`;
}

function convertObjectToRgb(color: ColorRGBA): string {
  const parts = [color.red, color.green, color.blue];
  if (color.alpha !== undefined) {
    parts.push(parseFloat((color.alpha / 255).toPrecision(1)));
  }
  return `${color.alpha !== undefined ? 'rgba' : 'rgb'}(${parts.join(', ')})`;
}

export function addAlphaToColor(input: string, alpha: number): string {
  if (alpha % 1 !== 0) {
    alpha = Math.min(255, Math.round(alpha * 255));
  }

  const convertedFromHex = convertHexToObject(input);
  if (convertedFromHex !== null) {
    convertedFromHex.alpha = alpha;
    return convertObjectToHex(convertedFromHex);
  }

  const convertedFromRgb = convertRgbToObject(input);
  if (convertedFromRgb !== null) {
    convertedFromRgb.alpha = alpha;
    return convertObjectToRgb(convertedFromRgb);
  }

  return input;
}
