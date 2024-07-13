import { readFileSync } from 'node:fs';

export function openFile(path: string): string {
  const fileReader = readFileSync(path);
  return fileReader.toString();
}