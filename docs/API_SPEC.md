# API Specification — 6 Aplikasi → Dashboard Terpusat

## Index

| Sheet | Konten / Endpoint | App yang Wajib | Dikonsumsi oleh |
|---|---|---|---|
| 1. Base Contract | Shared types: JWT Auth Header, AppSource, SubmissionStatus, ErrorResponse | Semua 6 App | Dashboard |
| 2. Health Check | `GET /health` — status operasional app | Semua 6 App | Dashboard |
| 3. Timeline | `GET /timelines` — fase & jadwal per program | PKM, PMW, Beasiswa, Ka Ormawa | Dashboard |
| 4. Submissions | `GET /submissions` — daftar pengajuan user (per NIM/userId) | PKM, PMW, Beasiswa, Prestasi, Ka Ormawa, Sarpras | Dashboard |
| 5. Pending | `GET /submissions/pending` — antrian belum di-approve (staff view) | PKM, PMW, Beasiswa, Prestasi, Ka Ormawa, Sarpras | Dashboard |
| 6. Opportunities | `GET /opportunities` — info lomba/beasiswa aktif | Beasiswa, Prestasi | Dashboard |
| 7. JWT Contract | Cara validasi & klaim JWT SSO yang wajib diterima tiap app | Semua 6 App | Dashboard (SSO passthrough) |
| 8. Recap Ormawa | `GET /recap/ormawa` — rekap pengajuan per ormawa | KA_ORMAWA | Dashboard |
| 9. Sarpras Venue | Amandemen field tambahan `/submissions` SARPRAS (VENUE) | SARPRAS | Dashboard |
| 10. PKM Stats | `GET /stats/*` — 5 bar chart endpoint | PKM | Dashboard |
| 11. PMW Stats | `GET /stats/*` — 5 bar chart endpoint | PMW | Dashboard |
| 12. Beasiswa Stats | `GET /stats/*` — 5 bar chart endpoint + amandemen KAJUR | Beasiswa | Dashboard |
| 13. Prestasi Stats | `GET /stats/*` — 6 bar chart endpoint + amandemen KAPRODI | Prestasi | Dashboard |

### App Sources

| AppSource | Nama Aplikasi | Timeline |
|---|---|---|
| PKM | Program Kreativitas Mahasiswa | Ada |
| PMW | Program Mahasiswa Wirausaha | Ada |
| BEASISWA | Beasiswa (multi-program) | Ada |
| PRESTASI | Lapor Prestasi / Kompetisi | Tidak ada |
| KA_ORMAWA | Pengajuan Ketua Ormawa | Ada |
| SARPRAS | Pengajuan Sarana, Prasarana & Kegiatan | Tidak ada |

---

## 1. Base Contract — Shared Types & Auth Convention

### Auth — JWT Bearer Token (SSO Passthrough)

| Field | Lokasi | Required? | Nilai / Format |
|---|---|---|---|
| Authorization | HTTP Header | Required | `Bearer <jwt_token>` — token diterbitkan SSO kampus |
| X-App-Source | HTTP Header | Optional | Nama app, e.g. `DASHBOARD` |

### JWT Claims

| Claim | Type | Required? | Deskripsi |
|---|---|---|---|
| sub | string (UUID) | Required | userId unik |
| nim | string | Optional | NIM; null untuk staff/WD3 |
| npa | string | Optional | NPA staff; null untuk mahasiswa |
| email | string | Required | Email institusi |
| role | enum | Required | `MAHASISWA` \| `STAFF` \| `WD3` \| `KLI` |
| iat | unix ts | Required | Waktu token diterbitkan |
| exp | unix ts | Required | Waktu token kedaluwarsa |
| jti | string (UUID) | Required | JWT ID — blacklist/revoke |

### ErrorResponse Object

| Field | Type | Required? | Deskripsi |
|---|---|---|---|
| status | integer | Required | HTTP status code |
| errorCode | string | Required | e.g. `UNAUTHORIZED` |
| message | string | Required | Human-readable |
| timestamp | ISO 8601 | Required | Waktu error |

### Role → Endpoint Access Matrix

| Endpoint | MAHASISWA | STAFF | WD3 | KLI |
|---|---|---|---|---|
| `GET /health` | ✅ | ✅ | ✅ | ✅ |
| `GET /timelines` | ✅ | ✅ | ✅ | ✅ |
| `GET /submissions` | ✅ (data sendiri) | ✅ | ✅ | ✅ |
| `GET /submissions/pending` | ❌ 403 | ✅ | ✅ | ✅ |
| `GET /opportunities` | ✅ | ✅ | ✅ | ✅ |

---

## 2. Health Check

```
GET /health
Auth: Public (no auth)
```

**Sample Response:**
```json
{
  "appSource": "PKM",
  "status": "UP",
  "version": "1.2.3",
  "timestamp": "2025-04-01T08:00:00Z",
  "dbStatus": "UP",
  "latencyMs": 12
}
```

---

## 3. Timeline

```
GET /timelines
Auth: Bearer JWT (service token, server-to-server)
Apps: PKM, PMW, BEASISWA, KA_ORMAWA
```

**Query Params:** `activeOnly` (boolean), `from` (ISO date), `to` (ISO date)

**Sample Response:**
```json
{
  "appSource": "PKM",
  "data": [
    {
      "programId": "uuid-v4",
      "programName": "PKM-KC 2025",
      "phase": "Pendaftaran",
      "startDate": "2025-01-15",
      "endDate": "2025-03-31",
      "isActive": true,
      "deepLinkUrl": "https://pkm.app/register"
    }
  ]
}
```

---

## 4. Submissions

```
GET /submissions
Auth: Bearer JWT — filter by userId from JWT claim 'sub'
Apps: ALL 6
```

**Query Params:** `status`, `page` (default 1), `pageSize` (default 10, max 50)

**Sample Response:**
```json
{
  "appSource": "PKM",
  "data": [
    {
      "submissionId": "uuid-v4",
      "title": "Inovasi Energi Terbarukan",
      "status": "PENDING",
      "submittedAt": "2025-02-20T10:00:00Z",
      "lastUpdatedAt": "2025-02-22T14:30:00Z",
      "currentStage": "Review WD3",
      "deepLinkUrl": "https://pkm.app/submissions/uuid-v4"
    }
  ],
  "meta": { "page": 1, "pageSize": 10, "totalItems": 3, "totalPages": 1, "hasNextPage": false }
}
```

---

## 5. Pending Submissions

```
GET /submissions/pending
Auth: Bearer JWT — role: STAFF|WD3|KLI
Apps: ALL 6
```

**Query Params:** `page` (default 1), `pageSize` (default 20, max 100), `stage`

**Sample Response:**
```json
{
  "appSource": "PKM",
  "data": [
    {
      "submissionId": "uuid-v4",
      "title": "Inovasi Teknologi Tepat Guna",
      "submitterName": "Budi Santoso",
      "submitterNim": "123456789",
      "status": "PENDING",
      "submittedAt": "2025-03-01T08:00:00Z",
      "lastUpdatedAt": "2025-03-01T08:00:00Z",
      "currentStage": "Review WD3",
      "deepLinkUrl": "https://pkm.app/review/uuid-v4"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "totalItems": 47, "totalPages": 3, "hasNextPage": true }
}
```

---

## 6. Opportunities

```
GET /opportunities
Auth: Bearer JWT — all roles including MAHASISWA
Apps: BEASISWA, PRESTASI
```

**Query Params:** `isOpen` (default true), `page` (default 1), `pageSize` (default 10, max 50)

**Sample Response:**
```json
{
  "appSource": "BEASISWA",
  "data": [
    {
      "opportunityId": "uuid-v4",
      "title": "Beasiswa Unggulan 2025",
      "category": "BEASISWA",
      "description": "Beasiswa penuh untuk mahasiswa berprestasi.",
      "registrationStart": "2025-04-01",
      "registrationEnd": "2025-05-15",
      "isOpen": true,
      "deepLinkUrl": "https://beasiswa.app/program/uuid-v4"
    }
  ],
  "meta": { "page": 1, "pageSize": 10, "totalItems": 5, "totalPages": 1, "hasNextPage": false }
}
```

---

## 7. JWT Contract — Role-based JWTs

### JWT Role Payloads

**MAHASISWA:**
```json
{
  "sub": "uuid-v4", "nim": "1197050001", "npa": null,
  "email": "budi.santoso@mahasiswa.kampus.ac.id",
  "role": "MAHASISWA", "iat": 1717200000, "exp": 1717286400, "jti": "uuid-v4"
}
```

**STAFF:**
```json
{
  "sub": "uuid-v4", "nim": null, "npa": "NPA-STF-0042",
  "email": "ani.rahayu@staff.kampus.ac.id",
  "role": "STAFF", "iat": 1717200000, "exp": 1717286400, "jti": "uuid-v4"
}
```

**WD3:**
```json
{
  "sub": "uuid-v4", "nim": null, "npa": "NPA-WD3-0001",
  "email": "wd3@kampus.ac.id",
  "role": "WD3", "iat": 1717200000, "exp": 1717286400, "jti": "uuid-v4"
}
```

**KLI:**
```json
{
  "sub": "uuid-v4", "nim": null, "npa": "NPA-KLI-0007",
  "email": "kli@kampus.ac.id",
  "role": "KLI", "iat": 1717200000, "exp": 1717286400, "jti": "uuid-v4"
}
```

---

## 8. Recap Ormawa

```
GET /recap/ormawa
Auth: Bearer JWT (service token, server-to-server)
App: SARPRAS
```

**Query Params:** `periode` (YYYY), `tipeSubmission`, `page`, `pageSize`

**Sample Response:**
```json
{
  "appSource": "SARPRAS",
  "data": [
    {
      "ormawaNpa": "BEMFT",
      "ormawaNama": "BEM Fakultas Teknik",
      "totalPengajuan": 18,
      "countPending": 4,
      "countReviewed": 3,
      "countApproved": 8,
      "countRejected": 2,
      "countRevision": 1,
      "lastSubmittedAt": "2025-05-20T10:00:00Z",
      "deepLinkUrl": "https://sarpras.app/ormawa/BEMFT"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "totalItems": 12, "totalPages": 1, "hasNextPage": false }
}
```

---

## 9. Sarpras Venue Fields (Amandemen Submissions)

Field tambahan pada response `GET /submissions` SARPRAS (bukan endpoint baru). Dashboard memanggil `GET /submissions?status=APPROVED&tipeSubmission=VENUE`.

**Field tambahan jika tipe=VENUE:**

| Field | Type | Deskripsi |
|---|---|---|
| namaLokasi | string | Nama tempat, e.g. 'Aula Gedung A Lt. 3' |
| tanggalMulai | ISO 8601 | Tanggal mulai penggunaan |
| tanggalSelesai | ISO 8601 | Tanggal selesai penggunaan |
| approvedAt | ISO 8601 | Waktu di-ACC |
| approvedBy | string | Nama approver |
| catatan | string | Catatan tambahan |

---

## 10. PKM Stats Endpoints

All endpoints: `Auth: Bearer JWT (service token)`, App: **PKM**

### `GET /stats/kpi-summary`
```json
{
  "appSource": "PKM",
  "periode": "2025",
  "totalProposalMasuk": 240,
  "totalLolosSeleksi": 120,
  "totalDidanai": 95,
  "totalDanaTersalurkan": 1850000000,
  "scoreboardJurusan": [
    {"jurusan": "Teknik Informatika", "totalProposal": 28, "totalApproved": 16}
  ]
}
```

### `GET /stats/status-distribution`
```json
{
  "appSource": "PKM",
  "periode": "2025",
  "totalProposal": 240,
  "countByStatus": {"PENDING": 40, "REVIEWED": 30, "APPROVED": 120, "REJECTED": 35, "REVISION": 15}
}
```

### `GET /stats/reviewer-progress`
```json
{
  "appSource": "PKM",
  "data": [
    {
      "reviewerId": "uuid-v4",
      "reviewerName": "Dr. Andi Wijaya",
      "reviewerRole": "PEMBINA",
      "totalAssigned": 25,
      "totalReviewed": 18,
      "totalPending": 7,
      "avgReviewDurationHours": 36.5,
      "overdueCount": 3
    }
  ],
  "meta": {"page": 1, "pageSize": 20, "totalItems": 14, "totalPages": 1, "hasNextPage": false}
}
```

### `GET /stats/distribution-jurusan-skema`
```json
{
  "appSource": "PKM",
  "periode": "2025",
  "matrix": [
    {"jurusan": "Teknik Informatika", "perSkema": {"PKM-KC": 12, "PKM-K": 8, "PKM-M": 5, "PKM-RE": 3}}
  ]
}
```

### `GET /stats/trend-tahunan`
```json
{
  "appSource": "PKM",
  "data": [
    {"tahun": "2024", "totalProposal": 220, "totalApproved": 110},
    {"tahun": "2025", "totalProposal": 240, "totalApproved": 120}
  ]
}
```

---

## 11. PMW Stats Endpoints

All endpoints: `Auth: Bearer JWT (service token)`, App: **PMW**

### `GET /stats/dana-per-jurusan`
```json
{
  "appSource": "PMW",
  "periode": "2025",
  "totalDanaDisalurkan": 980000000,
  "data": [
    {"jurusan": "Teknik Informatika", "totalDana": 320000000, "jumlahTimDidanai": 8}
  ]
}
```

### `GET /stats/rasio-kelulusan`
```json
{
  "appSource": "PMW",
  "data": [
    {"tahun": "2025", "totalPendaftar": 160, "totalLolos": 50}
  ]
}
```

### `GET /stats/sebaran-bidang-usaha`
```json
{
  "appSource": "PMW",
  "periode": "2025",
  "data": [
    {"bidangUsaha": "Kuliner", "jumlah": 35},
    {"bidangUsaha": "Fashion", "jumlah": 22}
  ]
}
```

### `GET /stats/dana-usulan-vs-rekomendasi`
```json
{
  "appSource": "PMW",
  "data": [
    {
      "submissionId": "uuid-v4",
      "namaTim": "Tim Kopi Nusantara",
      "danaUsulan": 15000000,
      "danaRekomendasiPraktisi": 10000000,
      "praktisiReviewer": "Bpk. Hendro Pratama"
    }
  ],
  "meta": {"page": 1, "pageSize": 20, "totalItems": 50, "totalPages": 3, "hasNextPage": true}
}
```

### `GET /stats/kelengkapan-berkas`
```json
{
  "appSource": "PMW",
  "data": [
    {
      "namaTim": "Tim Kopi Nusantara",
      "totalDokumenWajib": 6,
      "totalDokumenLengkap": 4,
      "dokumenKurang": ["Surat Kesanggupan", "Laporan Keuangan Awal"]
    }
  ]
}
```

---

## 12. Beasiswa Stats Endpoints

All endpoints: `Auth: Bearer JWT (service token)`, App: **BEASISWA**

### `GET /stats/monitoring`
```json
{
  "appSource": "BEASISWA",
  "periode": "2025",
  "totalPengajuan": 310,
  "totalDiterima": 95,
  "perProgram": [
    {"programId": "uuid-v4", "programName": "Beasiswa Unggulan 2025", "totalPengajuan": 180, "totalDiterima": 60}
  ]
}
```

### `GET /stats/sebaran-jurusan`
```json
{
  "appSource": "BEASISWA",
  "data": [
    {"jurusan": "Teknik Informatika", "totalPenerima": 22}
  ]
}
```

### `GET /stats/sebaran-tipe-sumber`
```json
{
  "appSource": "BEASISWA",
  "byTipe": [{"tipe": "PRESTASI_AKADEMIK", "jumlah": 40}],
  "bySumberDana": [{"sumber": "Kemdikbud (DIPA)", "jumlah": 55}]
}
```

### `GET /stats/program-status`
```json
{
  "appSource": "BEASISWA",
  "data": [
    {"programId": "uuid-v4", "programName": "Beasiswa Unggulan 2025", "status": "BERJALAN", "startDate": "2025-03-01", "endDate": "2025-12-31"}
  ]
}
```

### `GET /stats/status-aktivitas`
```json
{
  "appSource": "BEASISWA",
  "statusDistribution": {"PENDING": 45, "REVIEWED": 30, "APPROVED": 95, "REJECTED": 60, "REVISION": 10},
  "aktivitasPengajuan": [{"periodLabel": "2025-01", "totalPengajuanBaru": 40}]
}
```

---

## 13. Prestasi Stats Endpoints

All endpoints: `Auth: Bearer JWT (service token)`, App: **PRESTASI**

### `GET /stats/success-rate`
```json
{
  "appSource": "PRESTASI",
  "periode": "2025",
  "totalPengajuan": 180,
  "totalJadiPrestasi": 64,
  "perSkalaLomba": [{"skala": "NASIONAL", "totalPengajuan": 70, "totalJadiPrestasi": 28}]
}
```

### `GET /stats/tren-iku`
```json
{
  "appSource": "PRESTASI",
  "data": [{"tahun": "2025", "totalIkuPoin": 168, "perSkala": {"INTERNASIONAL": 48, "NASIONAL": 70, "REGIONAL": 30, "LOKAL": 20}}]
}
```

### `GET /stats/sebaran-kategori`
```json
{
  "appSource": "PRESTASI",
  "data": [{"kategori": "Teknologi/Inovasi", "jumlah": 55}]
}
```

### `GET /stats/rasio-gagal-tanding`
```json
{
  "appSource": "PRESTASI",
  "totalDanaCair": 90,
  "totalTanpaLpj": 12,
  "detail": [{"submissionId": "uuid-v4", "namaTim": "Tim Robotika ABC", "danaCairAt": "2025-03-01", "lpjStatus": "BELUM_DIKIRIM"}]
}
```

### `GET /stats/lead-time-revision`
```json
{
  "appSource": "PRESTASI",
  "avgLeadTimeHours": 52.4,
  "leadTimeByStage": [{"stage": "Verifikasi Berkas", "avgHours": 18.2}],
  "totalPengajuan": 180,
  "totalRevisi": 38
}
```

### `GET /stats/leaderboard-dosen`
```json
{
  "appSource": "PRESTASI",
  "leaderboardDosen": [
    {"dosenId": "uuid-v4", "dosenName": "Dr. Sri Mulyani", "totalBimbingan": 12, "totalMenang": 7}
  ],
  "volumePartisipasiJurusan": [
    {"jurusan": "Teknik Informatika", "totalPartisipasi": 65}
  ],
  "meta": {"page": 1, "pageSize": 20, "totalItems": 14, "totalPages": 1, "hasNextPage": false}
}
```
