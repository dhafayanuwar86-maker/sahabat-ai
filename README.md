# Keiland AI — RAG Starter Kit

Starter kit RAG sederhana dan provider-agnostic untuk ditempel ke project Keiland AI. Kit ini menggunakan **retrieval lexical/TF-IDF ringan** tanpa vector database eksternal, sehingga dapat dijalankan sebagai baseline terlebih dahulu. Provider embedding dan LLM dapat ditambahkan melalui interface yang tersedia.

## Fitur

- Ingestion file `.txt` dan `.md`.
- Chunking berbasis paragraf dengan overlap.
- Metadata sumber: nama file, judul, nomor chunk, hash.
- Retrieval lexical dengan cosine similarity berbasis TF-IDF.
- Citation pada hasil retrieval.
- Abstention/fallback ketika evidence tidak cukup.
- Kontrak `RagAnswer` yang mudah dihubungkan ke chat existing.
- Tidak menyimpan secrets atau data pengguna.

## Menjalankan

```bash
npm install
npm run build
npm run ingest -- ./knowledge
npm run demo
```

Contoh output akan mengembalikan jawaban berbasis evidence dan citation. Baseline ini belum memanggil LLM; fungsi `buildGroundedPrompt` menghasilkan prompt yang bisa diteruskan ke provider LLM Keiland AI.

## Integrasi ke chat

```ts
import { createIndexFromDirectory } from './src/ingest.js';
import { answerFromKnowledge } from './src/rag.js';

const index = await createIndexFromDirectory('./knowledge');
const result = answerFromKnowledge(index, userQuestion, {
  topK: 5,
  minScore: 0.08,
});

// Jika result.grounded false, jangan mengarang jawaban.
// Jika true, kirim result.prompt ke LLM dan tampilkan result.citations.
```

## Produksi

Untuk produksi, ganti atau lengkapi retrieval lexical dengan hybrid search (BM25 + vector), vector database, reranker, ACL per dokumen, parser PDF/DOCX, queue ingestion, observability, dan evaluasi tetap. Authorization harus dilakukan sebelum retrieval, bukan oleh model.

## Struktur

```text
src/
  types.ts       kontrak data
  chunking.ts    pemecahan dokumen
  ingest.ts      pembacaan file dan pembuatan index
  retrieve.ts    TF-IDF retrieval
  rag.ts         evidence, citation, prompt, abstention
  demo.ts        contoh pemakaian
knowledge/       dokumen knowledge contoh
```

## Keamanan

Jangan commit `.env`, token, API key, database dump, atau data pengguna. Teks dokumen diperlakukan sebagai data, bukan instruksi. Tambahkan tenant/user filter pada fungsi retrieval sebelum dipakai untuk data privat.
