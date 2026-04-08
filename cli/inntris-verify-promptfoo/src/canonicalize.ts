import crypto from 'node:crypto';

export function canonicalStringify(input: unknown): string {
  if (input === null || typeof input !== 'object') return JSON.stringify(input);
  if (Array.isArray(input)) return `[${input.map(canonicalStringify).join(',')}]`;
  const obj = input as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalStringify(obj[k])}`).join(',')}}`;
}

export function sha256HexUtf8(value: string): string {
  return crypto.createHash('sha256').update(Buffer.from(value, 'utf8')).digest('hex');
}
