function isStringOrNumber(value: unknown): value is number | string {
  return typeof value === 'string' || typeof value === 'number';
}

export default isStringOrNumber;
