export function rgbToHex(r: number, g: number, b: number): string | null {
  // Vérifier si les valeurs RGB sont dans la plage valide
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    return null;
  }

  // Convertir chaque valeur en une chaîne hexadécimale à deux caractères
  const hex = (n: number) => n.toString(16).padStart(2, '0');

  // Retourner la chaîne hexadécimale complète
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}
