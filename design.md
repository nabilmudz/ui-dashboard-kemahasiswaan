# Dokumentasi Sistem Desain (Design System)

Dokumen ini mendefinisikan panduan gaya, variabel tema, tipografi, dan elemen visual yang saat ini diterapkan pada aplikasi **SSO Dashboard**.

---

## 1. Filosofi Desain (Design Philosophy)

Aplikasi ini menggunakan pendekatan **Flat Design** yang **Sederhana, Minimalis, dan Cerah (Bright)**. 

- **Dilarang**:
  - Tampilan bertema gelap (Dark Mode).
  - Efek kilap (Shiny / Glossy).
  - Efek kaca/transparansi berlebih (Glassmorphism).
  - Bayangan tebal atau gradasi kompleks (Skeuomorphism).
- **Diwajibkan**:
  - Warna solid yang kontras dan bersih.
  - Layout minimalis dengan banyak white-space.
  - Elemen UI yang datar (flat) dan fokus pada kemudahan keterbacaan data.

---

## 2. Tipografi & Font

Aplikasi menggunakan font keluarga **Poppins** yang di-load dari Google Fonts.

- **Font Utama**: `'Poppins', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', sans-serif`
- **Bobot Font (Font Weights)**:
  - `Light` (300)
  - `Regular` (400)
  - `Medium` (500)
  - `Semi-Bold` (600)
  - `Bold` (700)
- **Penerapan**: Ditetapkan sebagai kelas default `font-sans` di seluruh body dokumen HTML.

---

## 3. Sistem Warna (Color Palette)

Variabel warna utama didefinisikan menggunakan fitur tema Tailwind CSS v4 di `src/style.css`. Warna kuning digantikan sepenuhnya oleh **Oranye Cerah** sebagai aksen utama.

| Nama Variabel CSS | Kode Hex | Deskripsi |
| :--- | :--- | :--- |
| `--color-brand-orange` | `#ff6b35` | Warna identitas utama (header banner, background login) - pengganti warna kuning |
| `--color-brand-accent` | `#ff8c61` | Warna aksen oranye lembut (hover/active state) |
| `--color-sidebar-active-bg` | `#ff8c61` | Background item menu sidebar yang aktif |
| `--color-sidebar-normal-text`| `rgba(0,0,0,0.8)` | Warna teks default menu sidebar (hitam transparan 80%) |
| `--color-sidebar-hover-text` | `#000000` | Warna teks menu sidebar saat di-hover (hitam solid) |
| Latar Belakang Body | `#f9fafb` (gray-50) | Warna latar belakang cerah dan bersih |
| Kontainer/Card | `#ffffff` | Warna dasar kontainer card dan sidebar (putih bersih) |

---

## 4. Tata Letak & Spacing (Layout Spacing)

Sistem layout menggunakan variabel spacing khusus untuk menangani responsivitas sidebar (collapsible sidebar):

- **Sidebar Melebar (Expanded)**: `15rem` (`--spacing-sidebar-expanded`)
- **Sidebar Menciut (Collapsed)**: `78px` (`--spacing-sidebar-collapsed`)

---

## 5. Gaya Scrollbar Kustom

Untuk menjaga kebersihan tampilan antarmuka, scrollbar kustom diterapkan dengan konfigurasi berikut:
- **Lebar/Tinggi**: `8px`
- **Warna Track**: Transparan (tidak terlihat untuk meminimalkan visual noise)
- **Warna Thumb (Scrollbar Handle)**:
  - Default: `#cbd5e1` (slate-300) dengan border transparan 2px
  - Hover State: `#94a3b8` (slate-400)
- **Bentuk (Border Radius)**: `9999px` (melingkar sempurna)
