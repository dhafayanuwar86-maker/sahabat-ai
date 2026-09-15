import { createHash } from 'node:crypto';
import type { DocumentChunk } from './types.js';

export function chunkDocument(source: string, rawText: string, maxChars = 900, overlapChars = 120): DocumentChunk[] {
  const title = rawText.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? source;
  const paragraphs = rawText.replace(/\r\n/g, '\n').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: DocumentChunk[] = [];
  let buffer = '';

  const flush = () => {
    const text = buffer.trim();
    if (!text) return;
    const contentHash = createHash('sha256').update(text).digest('hex').slice(0, 16);
    chunks.push({ id: `${source}:${chunks.length}:${contentHash}`, source, title, text, chunkIndex: chunks.length, contentHash });
    buffer = text.slice(Math.max(0, text.length - overlapChars));
  };

  for (const paragraph of paragraphs) {
    const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    if (candidate.length > maxChars && buffer) flush();
    buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    if (buffer.length >= maxChars) flush();
  }
  flush();
  return chunks;
}
