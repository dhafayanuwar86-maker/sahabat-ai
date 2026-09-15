# Sahabat AI 2.0 — Release Notes

## Fitur baru

Sahabat AI sekarang memiliki panel fitur terpadu untuk tiga alur kerja: **briefing berita**, **generate foto**, dan **coding mentor**.

### Briefing berita

Pengguna dapat memasukkan topik seperti teknologi, bisnis, atau dunia. Sistem mengambil headline on-demand dari BBC News dan AP News, kemudian merangkum secara netral dan menyertakan tautan sumber. Jika sumber gagal diakses, aplikasi menampilkan error yang dapat dicoba kembali.

### Image studio dasar

Pengguna dapat memasukkan prompt, membuat foto melalui service server-side, melihat preview, serta membuka atau mengunduh hasilnya. Kualitas default tetap `medium` agar sesuai baseline biaya dan akses.

### Coding mentor

Pengguna dapat memilih bahasa, menempelkan kode dan error, lalu meminta diagnosis. Respons diarahkan untuk menjelaskan akar masalah, patch minimal, langkah pengujian, dan risiko. Kode tidak dieksekusi di server aplikasi.

## Data dan keamanan

Headline tetap memiliki sumber dan tautan. Prompt gambar dan kode dibatasi panjangnya melalui schema server. API key hanya digunakan di backend. Upload dokumen tetap diproses di browser pada alur yang sudah ada; jangan unggah secrets atau data sensitif ke chat.

## Verifikasi

```bash
pnpm check
pnpm test
pnpm build
```

## Batasan yang diketahui

News briefing saat ini on-demand dan belum memiliki cache/database berita. Image studio belum memiliki gallery persisten, quota per user, atau moderasi lanjutan. Coding mentor belum menjalankan test dalam sandbox dan belum membuat pull request otomatis. Tiga hal tersebut menjadi kandidat fase berikutnya.
