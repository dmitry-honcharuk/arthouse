export function separateAuthTag(
  content: Uint8Array,
  tagLength: number = 16
): [content: Uint8Array, authTag: Uint8Array] {
  return [
    content.slice(0, content.length - tagLength),
    content.slice(-tagLength),
  ];
}
