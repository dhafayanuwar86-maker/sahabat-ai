export type DocumentChunk = {
  id: string;
  source: string;
  title: string;
  text: string;
  chunkIndex: number;
  contentHash: string;
  acl?: { tenantId?: string; userIds?: string[] };
};

export type SearchHit = DocumentChunk & { score: number };

export type RagOptions = {
  topK?: number;
  minScore?: number;
  acl?: { tenantId?: string; userId?: string };
};

export type RagAnswer = {
  grounded: boolean;
  answer: string;
  prompt: string;
  citations: Array<{ id: string; source: string; title: string; score: number }>;
  hits: SearchHit[];
};
