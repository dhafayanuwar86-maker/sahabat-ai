import { describe, expect, it } from "vitest";
import { chunkDocument } from "./rag/chunking";
import { answerFromKnowledge } from "./rag/rag";
import type { DocumentChunk } from "./rag/types";

describe("Keiland AI RAG", () => {
  const index: DocumentChunk[] = chunkDocument(
    "panduan.md",
    "# Panduan\n\nKeiland AI menggunakan knowledge base untuk menjawab pertanyaan berdasarkan dokumen."
  );

  it("returns grounded evidence and citation for a matching question", () => {
    const result = answerFromKnowledge(index, "Bagaimana Keiland AI menggunakan knowledge base?", { minScore: 0.01 });
    expect(result.grounded).toBe(true);
    expect(result.citations[0]?.source).toBe("panduan.md");
    expect(result.prompt).toContain("EVIDENCE");
  });

  it("abstains when no evidence matches", () => {
    const result = answerFromKnowledge(index, "Bagaimana cuaca di Mars besok?", { minScore: 0.01 });
    expect(result.grounded).toBe(false);
    expect(result.citations).toHaveLength(0);
    expect(result.answer).toContain("belum tersedia");
  });
});
