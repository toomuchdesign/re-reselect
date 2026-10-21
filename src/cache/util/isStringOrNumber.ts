export function isStringOrNumber(value: unknown): boolean {
  return typeof value === 'string' || typeof value === 'number';
}
