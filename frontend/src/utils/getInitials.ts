export function getInitials(name: string | undefined): string {
  if (!name) return '';

  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts.shift() || '';
  const lastName = nameParts.pop() || '';

  return (
    firstName.slice(0, 1).toUpperCase() + lastName.slice(0, 1).toUpperCase()
  );
}
