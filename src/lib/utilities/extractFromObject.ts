export default function extractFromObject(
  object: Record<string, unknown>,
  path: string,
): unknown | undefined {
  if (object[path]) {
    return object[path];
  }

  const firstDot = path.indexOf('.');
  if (firstDot === -1) {
    throw new Error(`Leaf not found: "${path}"`);
  }

  const branch = path.substring(0, firstDot);
  if (!object[branch] || typeof object[branch] !== 'object') {
    throw new Error(`Branch not found: "${branch}"`);
  }

  return extractFromObject(
    object[branch] as Record<string, unknown>,
    path.substring(firstDot + 1),
  );
}
