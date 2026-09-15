# Sahabat AI — Deployment RAG

Repository target:

```text
https://github.com/dhafayanuwar86-maker/sahabat-ai
```

## Yang sudah terintegrasi

- `server/rag/` berisi chunking, ingestion, retrieval, citation, dan abstention.
- `server/routers.ts` mengambil pertanyaan terakhir lalu menjalankan retrieval sebelum `invokeLLM`.
- `knowledge/` berisi dokumen knowledge contoh.
- `server/rag.test.ts` menguji grounded answer dan fallback.

## Langkah owner di Manus

1. Buka project **Sahabat AI** sebagai owner.
2. Pastikan GitHub terhubung ke repository di atas.
3. Pilih branch `main`.
4. Sync atau pull commit terbaru.
5. Jalankan build/preview.
6. Jika berhasil, pilih Publish/Deploy.

## Validasi

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

## Menambah knowledge

Letakkan dokumen `.md` atau `.txt` di:

```text
knowledge/
```

Setelah commit dan push, owner perlu sync/redeploy bila auto-deploy tidak aktif.

Jangan commit `.env`, API key, token, password, database dump, atau data pengguna.
