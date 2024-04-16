export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  // Supprimer le caractère '#' s'il est présent
  hex = hex.replace(/^#/, '');

  // Vérifier si la valeur hexadécimale est valide
  const isValidHex = /^([0-9a-fA-F]{3}){1,2}$/.test(hex);
  if (!isValidHex) {
    return null;
  }

  // Convertir la valeur hexadécimale en valeurs RGB
  let r: number, g: number, b: number;
  if (hex.length === 3) {
    // Pour la forme raccourcie #RGB, étendre chaque chiffre pour obtenir #RRGGBB
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  // Renvoyer la valeur RGB sous forme de chaîne
  return {
    r,
    g,
    b,
  };
}
