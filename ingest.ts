import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { chunkDocument } from './chunking.js';
import type { DocumentChunk } from './types.js';

export async function createIndexFromDirectory(directory: string): Promise<DocumentChunk[]> {
  const names = await readdir(directory);
  const files = names.filter((name) => ['.md', '.txt'].includes(extname(name).toLowerCase()));
  const all: DocumentChunk[] = [];
  for (const name of files) {
    const text = await readFile(join(directory, name), 'utf8');
    all.push(...chunkDocument(basename(name), text));
  }
  return all;
}

export async function saveIndex(index: DocumentChunk[], output = './knowledge-index.json') {
  await writeFile(output, JSON.stringify(index, null, 2), 'utf8');
}
