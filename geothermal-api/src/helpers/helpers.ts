import { Readable } from 'stream';

export function numberToFixed(value: number, fixed: number): number {
  return value !== null ? Number(value.toFixed(fixed)) : value;
}

export function isNotNaNFiniteNumber(value: unknown): boolean {
  return !isNaN(value as number) && isFinite(value as number);
}

export function convertBufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  return new Uint8Array(buffer).buffer;
}

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function toCamelCase(str) {
  return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
}

export function jsonToBuffer<T>(json: T): Buffer {
  return Buffer.from(JSON.stringify(json));
}

export function bufferToJSON<T>(buffer: Buffer): T {
  return JSON.parse(buffer.toString());
}
