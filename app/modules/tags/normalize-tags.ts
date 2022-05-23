export function normalizeTags(tags: string[]) {
  return [...new Set(tags.filter((tag) => !!tag).map((t) => t.trim()))];
}
