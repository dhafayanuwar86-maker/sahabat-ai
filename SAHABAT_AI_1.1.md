# Sahabat AI 1.1

Sahabat AI 1.1 menambahkan tiga kemampuan utama: **briefing berita terkini**, **generate foto**, dan **coding mentor**.

## Briefing berita

Endpoint `ai.newsBriefing` mengambil headline on-demand dari BBC News dan AP News, lalu meminta model membuat ringkasan netral dengan citation. Sistem hanya menyimpan metadata hasil request di respons; ia tidak mengklaim headline sebagai pengetahuan permanen dan tidak menghapus tautan sumber.

Jika feed tidak tersedia, endpoint mengembalikan error yang dapat ditampilkan sebagai retry. Untuk produksi, tambahkan cache, deduplikasi URL, freshness timestamp, rate limit, dan audit ingestion.

## Generate foto

Endpoint `ai.generateImage` memanggil helper image service server-side dengan kualitas `medium`, menyimpan hasil melalui storage aplikasi, dan mengembalikan URL. Prompt dibatasi panjangnya dan secret tidak pernah dikirim ke browser.

## Coding mentor

Endpoint `ai.codeHelp` menerima bahasa, potongan kode, dan pesan error. Respons diminta menjelaskan akar masalah, patch minimal, langkah pengujian, dan risiko. Sistem tidak menjalankan kode pengguna dan tidak meminta secrets.

## Data engineering berikutnya

Tahap berikutnya sebaiknya menambahkan tabel `news_items`, `documents`, dan `document_chunks`; unique key URL/hash; status ingestion; `published_at` dan `ingested_at` dalam UTC; deduplikasi; ACL; retention; serta metrik freshness dan citation correctness.

## Verifikasi

```bash
pnpm check
pnpm test
pnpm build
```
