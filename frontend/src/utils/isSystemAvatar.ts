export function isSystemAvatar(avatarID: string | undefined): boolean {
  return avatarID !== undefined && avatarID.startsWith('00000000');
}
