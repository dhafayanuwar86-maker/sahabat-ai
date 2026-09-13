import type { DocumentChunk, RagOptions, SearchHit } from './types.js';

const tokenize = (text: string) => text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((t) => t.length > 2);

export function retrieve(index: DocumentChunk[], query: string, options: RagOptions = {}): SearchHit[] {
  const topK = options.topK ?? 5;
  const q = new Set(tokenize(query));
  if (!q.size) return [];
  const allowed = index.filter((doc) => {
    if (!options.acl) return true;
    if (options.acl.tenantId && doc.acl?.tenantId !== options.acl.tenantId) return false;
    if (options.acl.userId && doc.acl?.userIds && !doc.acl.userIds.includes(options.acl.userId)) return false;
    return true;
  });
  const documentFrequency = new Map<string, number>();
  for (const doc of allowed) for (const token of Array.from(new Set(tokenize(doc.text)))) documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
  const n = Math.max(1, allowed.length);
  return allowed.map((doc) => {
    const tokens = tokenize(doc.text);
    const counts = new Map<string, number>();
    for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
    let score = 0;
    for (const term of Array.from(q)) {
      const tf = (counts.get(term) ?? 0) / Math.max(1, tokens.length);
      const idf = Math.log((n + 1) / ((documentFrequency.get(term) ?? 0) + 1)) + 1;
      score += tf * idf;
    }
    return { ...doc, score };
  }).filter((hit) => hit.score > 0).sort((a, b) => b.score - a.score).slice(0, topK);
}
