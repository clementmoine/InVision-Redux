export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  hex = hex.replace(/^#/, '');

  const isValidHex = /^([0-9a-fA-F]{3}){1,2}$/.test(hex);
  if (!isValidHex) {
    return null;
  }

  let r: number, g: number, b: number;
  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  return {
    r,
    g,
    b,
  };
}
