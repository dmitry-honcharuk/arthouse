export function getNickname(value: string): string {
  return encodeURIComponent(value.trim().toLowerCase().replace(/\s+/g, '-'));
}
