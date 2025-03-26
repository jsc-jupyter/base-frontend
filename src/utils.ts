/**
 * Splits an item into chunks of a given size.
 * @param items Input Array
 * @param size Number of items in each chunk
 * @returns An array of chunks. The last chunk can contain less than `size` items
 */
export function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, Math.min(i + size, items.length)));
  }
  return chunks;
}
