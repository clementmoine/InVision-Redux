export function rgbToHex(r: number, g: number, b: number): string | null {
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    return null;
  }

  const hex = (n: number) => n.toString(16).padStart(2, '0');

  return `#${hex(r)}${hex(g)}${hex(b)}`;
}
