import { useState } from "react";

/* ════════════════════════════════════════════════════════════
   PANDUAN INPUT KONTRAK SEWA ALAT BERAT — ERPNEXT
   Kontrak: Excavator Caterpillar 320D
   Pihak Pertama: SUPRIADI | Pihak Kedua: NINDYA-BPS KSO
   Tanggal: 18 Februari 2026 | Lokasi: Kab. Bone
════════════════════════════════════════════════════════════ */

const f = n => new Intl.NumberFormat("id-ID").format(n);
const C = {
  bg:"#f0f4f8", card:"#ffffff", navy:"#0f2344", blue:"#1a56a0",
  green:"#0b7a5e", amber:"#c25a0a", red:"#b91c1c", purple:"#5b21b6",
  teal:"#0d6e7a", orange:"#c2410c", gold:"#92680a",
  muted:"#64748b", light:"#e2e8f0", border:"#cbd5e1", sub:"#475569", text:"#1e293b",
};

/* ─── KONTRAK DATA ─── */
const KONTRAK = {
  nomor:       "KSAB-2026/02/001",           // generated
  judul:       "Kontrak Sewa Pakai Alat Berat",
  tanggal:     "18 Februari 2026",
  pihak1:      "SUPRIADI",
  alamat1:     "Parepare, Sulawesi Selatan",
  bank1:       "Mandiri 1510022885195 a/n Supriadi",
  pihak2:      "NINDYA-BPS, KSO",
  lokasi:      "Kab. Bone / Penimbunan",
  alat:        "Excavator Caterpillar 320 D / Caterpillar",
  qty:         1,
  harga_jam:   350_000,
  min_jam:     200,
  harga_bulan: 70_000_000,
  min_hari:    25,
  mobil:       12_000_000,
  demobil:     12_000_000,
  total_mobdem:24_000_000,
  gaji_hm:     25_000,          // per jam
  lembur_rate: 50_000,          // per jam lembur
  jam_kerja:   "08.00–12.00, 13.00–17.00 (8 jam/hari)",
  due_days:    7,               // max 1 minggu setelah invoice
};

/* ─── KOMPONEN BIAYA ─── */
const COST_COMPONENTS = [
  {
    id:"mobdem", icon:"🚛", label:"Mobilisasi & Demobilisasi",
    color: C.teal, doc:"Purchase Order Terpisah",
    amount: 24_000_000,
    timing:"Bayar saat alat tiba (mobilisasi) & selesai (demobilisasi)",
    notes:"Lump sum. Bukan per jam. Wajib dibayar terlepas dari berapa lama alat dipakai.",
    tanggungan:"NINDYA-BPS (Pihak Kedua)",
  },
  {
    id:"sewa", icon:"⏱️", label:"Sewa Alat Per Jam",
    color: C.blue, doc:"Purchase Order Utama (recurring)",
    amount: 70_000_000,
    timing:"Per bulan / per invoice dari Supriadi",
    notes:"Minimum 200 jam / Rp 70 juta per 25 hari kalender. Jika jam < 200, tetap bayar 200 jam.",
    tanggungan:"NINDYA-BPS (Pihak Kedua)",
  },
  {
    id:"bbm", icon:"⛽", label:"Bahan Bakar (BBM)",
    color: C.amber, doc:"Purchase Invoice / Expense Claim",
    amount: null,
    timing:"Aktual — berdasarkan konsumsi BBM harian",
    notes:"Ditanggung Pihak Kedua. TIDAK masuk di PO sewa ke Supriadi. Input sebagai pembelian BBM terpisah (supplier BBM).",
    tanggungan:"NINDYA-BPS (Pihak Kedua)",
  },
  {
    id:"operator", icon:"👷", label:"Gaji Operator + Gaji HM + Lembur",
    color: C.purple, doc:"Payroll / Journal Entry",
    amount: null,
    timing:"Bulanan (gaji pokok) + per jam (HM Rp 25.000/jam, lembur Rp 50.000/jam)",
    notes:"Ditanggung Pihak Kedua. Masuk sebagai biaya upah, BUKAN bagian dari PO sewa Supriadi.",
    tanggungan:"NINDYA-BPS (Pihak Kedua)",
  },
];

/* ─── PHASES ─── */
const PHASES = [
  {
    id:"prereq", icon:"⚙️", label:"Setup Master Data", badge:"SEKALI SAJA", color: C.purple,
    tagline:"Siapkan semua data master sebelum bisa input kontrak",
    substeps:[
      {
        title:"Daftarkan SUPRIADI sebagai Supplier",
        path:"Buying → Supplier → New",
        why:"SUPRIADI adalah pihak yang menyewakan alat (Pihak Pertama) — posisinya sebagai Supplier di ERPNext.",
        fields:[
          {f:"Supplier Name",         v:"Supriadi",                         t:"Data",         n:"Nama sesuai KTP / rekening bank"},
          {f:"Supplier Type",         v:"Individual",                       t:"Select",       n:"Perorangan, bukan perusahaan"},
          {f:"Supplier Group",        v:"Vendor Alat Berat",                t:"Link",         n:"Buat group baru: Vendor Alat Berat"},
          {f:"Primary Address",       v:"Parepare, Sulawesi Selatan",       t:"Address",      n:"Sesuai dokumen kontrak"},
          {f:"NPWP",                  v:"(isi jika ada)",                   t:"Data",         n:"Untuk pelaporan PPh"},
          {f:"Default Payment Terms", v:"Net 7 Days",                       t:"Link",         n:"Sesuai kontrak: max 1 minggu setelah invoice"},
          {f:"Bank Account — Bank",   v:"Bank Mandiri",                     t:"Link",         n:""},
          {f:"Bank Account — No Rek", v:"1510022885195",                    t:"Data",         n:"Rekening transfer pembayaran"},
          {f:"Bank Account — A/N",    v:"Supriadi",                         t:"Data",         n:"Nama pemilik rekening"},
        ],
        note:"Rekening bank WAJIB diisi dengan benar — ini yang dipakai sistem untuk generate instruksi pembayaran.",
      },
      {
        title:"Buat Item Master untuk Komponen Biaya",
        path:"Stock → Item → New (buat 4 item berbeda)",
        why:"Setiap komponen biaya perlu Item Master agar bisa dimasukkan ke PO dan muncul di laporan dengan benar.",
        fields:[
          {f:"Item 1: Item Code",     v:"SEWA-ALAT-JAM",                   t:"Data",         n:"Sewa alat per jam"},
          {f:"Item 1: Item Name",     v:"Sewa Excavator Caterpillar 320D",  t:"Data",         n:""},
          {f:"Item 1: UOM",           v:"Jam",                              t:"Link",         n:"Buat UOM 'Jam' jika belum ada"},
          {f:"Item 1: Is Service",    v:"✅ Yes",                           t:"Check",        n:"Jasa, bukan barang fisik"},
          {f:"Item 1: Is Stock Item", v:"❌ No",                            t:"Check",        n:""},
          {f:"────",                  v:"────────────────────",             t:"──",           n:"──────────────────────────────"},
          {f:"Item 2: Item Code",     v:"SEWA-ALAT-MOBIL",                 t:"Data",         n:"Mobilisasi alat"},
          {f:"Item 2: Item Name",     v:"Mobilisasi Excavator 320D",        t:"Data",         n:""},
          {f:"Item 2: UOM",           v:"Unit",                             t:"Link",         n:""},
          {f:"────",                  v:"────────────────────",             t:"──",           n:"──────────────────────────────"},
          {f:"Item 3: Item Code",     v:"SEWA-ALAT-DEMOBIL",               t:"Data",         n:"Demobilisasi alat"},
          {f:"Item 3: Item Name",     v:"Demobilisasi Excavator 320D",      t:"Data",         n:""},
          {f:"Item 3: UOM",           v:"Unit",                             t:"Link",         n:""},
          {f:"────",                  v:"────────────────────",             t:"──",           n:"──────────────────────────────"},
          {f:"Item 4: Item Code",     v:"BBM-SOLAR-ALAT",                  t:"Data",         n:"Solar untuk alat berat"},
          {f:"Item 4: Item Name",     v:"Solar / BBM Alat Berat",           t:"Data",         n:""},
          {f:"Item 4: UOM",           v:"Liter",                            t:"Link",         n:"BBM ditrack per liter"},
        ],
        note:"Buat 4 item ini. Item Gaji Operator tidak perlu dibuat di sini — itu masuk ke Payroll / Journal Entry, bukan PO.",
      },
      {
        title:"Tambahkan Custom Fields ke Purchase Order",
        path:"Setup → Customize Form → Purchase Order → Add Fields",
        why:"ERPNext standard PO tidak punya field khusus untuk kontrak sewa alat berat. Kita tambahkan tanpa koding.",
        fields:[
          {f:"Nomor Kontrak Sewa",    v:"KSAB-2026/02/001",                t:"Data (Custom)",n:"Nomor referensi kontrak fisik"},
          {f:"Jenis Alat",            v:"Excavator Caterpillar 320D",       t:"Data (Custom)",n:"Nama alat yang disewa"},
          {f:"Harga Per Jam",         v:"350,000",                          t:"Currency (Custom)", n:"Rate per jam"},
          {f:"Minimum Jam Kontrak",   v:"200",                              t:"Int (Custom)", n:"Jam minimum yang harus dibayar"},
          {f:"Tanggal Mulai Sewa",    v:"18-02-2026",                       t:"Date (Custom)",n:"Alat tiba di lokasi"},
          {f:"Tanggal Selesai Sewa",  v:"(sesuai kebutuhan proyek)",        t:"Date (Custom)",n:"Estimasi akhir pemakaian"},
          {f:"Pihak Pertama",         v:"Supriadi",                         t:"Data (Custom)",n:"Nama pemilik alat"},
          {f:"Lokasi Pekerjaan",      v:"Kab. Bone / Penimbunan",           t:"Data (Custom)",n:""},
          {f:"Tanggungan BBM",        v:"Pihak Kedua (NINDYA)",             t:"Data (Custom)",n:"Dokumentasi siapa tanggung BBM"},
          {f:"Tanggungan Operator",   v:"Pihak Kedua (NINDYA)",             t:"Data (Custom)",n:"Dokumentasi siapa tanggung operator"},
        ],
        note:"Custom fields ini muncul di semua PO. Bisa set sebagai optional agar tidak wajib diisi di PO material biasa.",
      },
    ],
  },
  {
    id:"po_mobdem", icon:"🚛", label:"PO Mobilisasi & Demobilisasi", badge:"AWAL & AKHIR", color: C.teal,
    tagline:"PO pertama — dibuat saat alat dipesan untuk datang ke lokasi",
    substeps:[
      {
        title:"Buat Purchase Order untuk Mobilisasi",
        path:"Buying → Purchase Order → New",
        why:"Mobilisasi (Rp 12 juta) adalah biaya tetap yang dibayar saat alat tiba. Ini PO TERPISAH dari sewa per jam agar mudah di-track dan tidak campur dengan biaya sewa bulanan.",
        fields:[
          {f:"[HEADER] Supplier",               v:"Supriadi",                         t:"Link",    n:"Pihak Pertama"},
          {f:"[HEADER] Series / Naming",         v:"PO-SAB-.YYYY.-",                  t:"Auto",    n:"PO-SAB = Purchase Order Sewa Alat Berat"},
          {f:"[HEADER] Date",                    v:"18-02-2026",                       t:"Date",    n:"Tanggal kontrak ditandatangani"},
          {f:"[HEADER] Required By",             v:"18-02-2026",                       t:"Date",    n:"Mobilisasi dibayar saat alat tiba = hari yang sama"},
          {f:"[HEADER] Project",                 v:"Pembangunan Sekolah Rakyat SS-2",  t:"Link",    n:"WAJIB — link ke proyek"},
          {f:"[HEADER] Cost Center",             v:"CC-SCHOOL-BONE-2026",              t:"Link",    n:"WAJIB — agar biaya masuk project costing"},
          {f:"[CUSTOM] Nomor Kontrak Sewa",      v:"KSAB-2026/02/001",                t:"Data",    n:"Referensi ke kontrak fisik"},
          {f:"[CUSTOM] Jenis Alat",              v:"Excavator Caterpillar 320D",       t:"Data",    n:""},
          {f:"[CUSTOM] Lokasi Pekerjaan",        v:"Kab. Bone / Penimbunan",           t:"Data",    n:""},
          {f:"[ITEM] Item Code",                 v:"SEWA-ALAT-MOBIL",                 t:"Link",    n:"Item mobilisasi"},
          {f:"[ITEM] Keterangan",                v:"Mobilisasi Excavator 320D ke Kab. Bone", t:"Data", n:"Deskripsi untuk print PO"},
          {f:"[ITEM] UOM",                       v:"Unit",                             t:"Link",    n:""},
          {f:"[ITEM] Qty",                       v:"1",                                t:"Float",   n:"1 unit alat"},
          {f:"[ITEM] Rate",                      v:"12,000,000",                       t:"Currency",n:"Rp 12.000.000 sesuai kontrak"},
          {f:"[ITEM] Amount",                    v:"12,000,000",                       t:"Calc",    n:"AUTO: 1 × 12.000.000"},
          {f:"[HEADER] Grand Total",             v:"12,000,000",                       t:"Result",  n:"Total PO mobilisasi"},
          {f:"[HEADER] Payment Terms",           v:"Net 7 Days",                       t:"Link",    n:"Bayar sesuai invoice Supriadi"},
        ],
        note:"Buat juga PO Demobilisasi yang IDENTIK tapi menggunakan Item SEWA-ALAT-DEMOBIL dan Required By = tanggal estimasi alat selesai. PO demobilisasi ini aktif tapi baru di-receipt saat alat benar-benar selesai.",
      },
      {
        title:"Receipt & Invoice Mobilisasi (saat alat tiba)",
        path:"Buka PO Mobilisasi → Create → Purchase Receipt → lalu Create → Purchase Invoice",
        why:"Saat Excavator 320D tiba di lokasi Bone: buat Purchase Receipt sebagai konfirmasi alat sudah diterima, lalu langsung buat Purchase Invoice untuk proses pembayaran.",
        fields:[
          {f:"[PR] Posting Date",                v:"18-02-2026",                       t:"Date",    n:"Tanggal alat tiba di lokasi"},
          {f:"[PR] Qty Received",                v:"1",                                t:"Float",   n:"1 unit — full sesuai PO"},
          {f:"[PR] Accepted Qty",                v:"1",                                t:"Float",   n:"Alat diterima dalam kondisi baik"},
          {f:"[PR] Lampiran",                    v:"Foto/video alat tiba + BA Serah Terima", t:"Attach", n:"Dokumentasi penting"},
          {f:"────── Lanjut ke Purchase Invoice", v:"────────────────────────────────", t:"──",      n:"──────────────────────────────────────"},
          {f:"[PI] Invoice Date",                v:"18-02-2026",                       t:"Date",    n:"Tanggal Supriadi kirim invoice mobilisasi"},
          {f:"[PI] Due Date",                    v:"25-02-2026",                       t:"Date",    n:"7 hari dari invoice date"},
          {f:"[PI] Grand Total",                 v:"12,000,000",                       t:"Result",  n:"Hutang ke Supriadi untuk mobilisasi"},
          {f:"[PI] No Invoice Supriadi",         v:"INV/SPI/02/2026/01",               t:"Custom",  n:"Nomor invoice fisik dari Supriadi"},
        ],
        note:"Untuk demobilisasi: buat Receipt dan Invoice dari PO Demobilisasi saat alat selesai digunakan dan sudah keluar dari lokasi.",
      },
    ],
  },
  {
    id:"po_sewa", icon:"⏱️", label:"PO Sewa Per Jam (Bulanan)", badge:"RECURRING", color: C.blue,
    tagline:"PO utama sewa — satu PO besar, di-receipt bertahap per bulan",
    substeps:[
      {
        title:"Strategi: Satu PO Besar vs Multiple PO Bulanan",
        path:"— (keputusan desain sistem) —",
        why:"Ada dua pilihan cara input PO sewa. Masing-masing ada kelebihan dan kekurangan — pilih sesuai kebutuhan perusahaan.",
        fields:[
          {f:"OPSI A: 1 PO Besar",             v:"Qty total = estimasi jam keseluruhan proyek",  t:"Rekomendasi",  n:"Misal: estimasi pakai 3 bulan = 600 jam, Rate = 350.000 → PO = 210.000.000"},
          {f:"Kelebihan Opsi A",                v:"Satu dokumen, mudah track kumulatif vs kontrak", t:"Pro",        n:"PO tidak perlu dibuat ulang setiap bulan"},
          {f:"Kekurangan Opsi A",               v:"Harus estimasi total jam di awal — bisa salah",  t:"Con",        n:"Jika pakai lebih lama, harus amend PO"},
          {f:"────",                             v:"────────────────────────────────────────────",   t:"──",         n:"────────────────────────────────────────"},
          {f:"OPSI B: PO Per Bulan",             v:"Buat PO baru setiap bulan: 200 jam × 350.000 = 70 juta/bulan", t:"Alternatif", n:""},
          {f:"Kelebihan Opsi B",                 v:"Lebih fleksibel, nilai PO sesuai aktual bulan itu", t:"Pro",    n:"Mudah disesuaikan jika jam berubah"},
          {f:"Kekurangan Opsi B",                v:"Banyak PO — lebih banyak administrasi",           t:"Con",     n:""},
          {f:"REKOMENDASI",                      v:"OPSI A (1 PO besar) karena lebih simple untuk kasus ini", t:"Decision", n:"Estimasi 3 bulan = 600 jam total"},
        ],
        note:"Untuk Kontrak Supriadi ini: pakai Opsi A. Buat 1 PO dengan qty 600 jam (estimasi). Setiap bulan buat Purchase Receipt dengan qty jam aktual bulan itu.",
      },
      {
        title:"Buat Purchase Order Sewa Per Jam",
        path:"Buying → Purchase Order → New",
        why:"Ini PO utama yang merepresentasikan kontrak sewa. Rate = Rp 350.000/jam, minimum 200 jam/bulan.",
        fields:[
          {f:"[HEADER] Supplier",               v:"Supriadi",                          t:"Link",    n:"Pihak Pertama — pemilik alat"},
          {f:"[HEADER] Series",                  v:"PO-SAB-.YYYY.-",                   t:"Auto",    n:"Naming series Sewa Alat Berat"},
          {f:"[HEADER] Date",                    v:"18-02-2026",                       t:"Date",    n:"Tanggal kontrak"},
          {f:"[HEADER] Required By",             v:"30-04-2026",                       t:"Date",    n:"Estimasi selesai sewa (3 bulan)"},
          {f:"[HEADER] Project",                 v:"Pembangunan Sekolah Rakyat SS-2",  t:"Link",    n:"WAJIB"},
          {f:"[HEADER] Cost Center",             v:"CC-SCHOOL-BONE-2026",              t:"Link",    n:"WAJIB"},
          {f:"[CUSTOM] Nomor Kontrak Sewa",      v:"KSAB-2026/02/001",                t:"Data",    n:"Referensi kontrak fisik"},
          {f:"[CUSTOM] Jenis Alat",              v:"Excavator Caterpillar 320D",       t:"Data",    n:"Unit/merk"},
          {f:"[CUSTOM] Harga Per Jam",           v:"350,000",                          t:"Currency",n:"Rate sesuai kontrak"},
          {f:"[CUSTOM] Minimum Jam Kontrak",     v:"200",                              t:"Int",     n:"Per bulan/per 25 hari"},
          {f:"[CUSTOM] Tanggal Mulai Sewa",      v:"18-02-2026",                       t:"Date",    n:"Hari alat mulai dipakai"},
          {f:"[CUSTOM] Tanggungan BBM",          v:"Pihak Kedua (NINDYA-BPS)",         t:"Data",    n:"Dokumentasi klausul kontrak"},
          {f:"[CUSTOM] Tanggungan Operator",     v:"Pihak Kedua (NINDYA-BPS)",         t:"Data",    n:"Gaji, HM, lembur"},
          {f:"[ITEM] Item Code",                 v:"SEWA-ALAT-JAM",                   t:"Link",    n:"Item sewa per jam"},
          {f:"[ITEM] Keterangan",                v:"Sewa Excavator Caterpillar 320D — Rp 350.000/jam min 200 jam", t:"Data", n:"Muncul di print PO"},
          {f:"[ITEM] UOM",                       v:"Jam",                              t:"Link",    n:"Satuan = Jam"},
          {f:"[ITEM] Qty",                       v:"600",                              t:"Float",   n:"Estimasi total jam 3 bulan (200 × 3)"},
          {f:"[ITEM] Rate",                      v:"350,000",                          t:"Currency",n:"Rp 350.000 per jam"},
          {f:"[ITEM] Amount",                    v:"210,000,000",                      t:"Calc",    n:"AUTO: 600 × 350.000"},
          {f:"[HEADER] Grand Total",             v:"210,000,000",                      t:"Result",  n:"Total estimasi sewa 3 bulan"},
          {f:"[HEADER] Payment Terms",           v:"Net 7 Days",                       t:"Link",    n:"Max 1 minggu setelah invoice Supriadi"},
          {f:"[TERMS] Terms & Conditions",       v:"Isi syarat kontrak poin 1-8",      t:"Text",    n:"Copy dari dokumen kontrak fisik"},
        ],
        note:"Grand Total Rp 210 juta adalah ESTIMASI. Aktual bisa lebih atau kurang tergantung jam pakai. Setiap bulan: PR dibuat dengan jam aktual yang terukur dari HM (Hour Meter) alat.",
      },
    ],
  },
  {
    id:"receipt_monthly", icon:"📊", label:"Receipt Bulanan (Log Jam HM)", badge:"PER BULAN", color: C.green,
    tagline:"Setiap akhir bulan: hitung jam HM → buat Purchase Receipt",
    substeps:[
      {
        title:"Cara Menghitung Tagihan Bulanan dari HM Meter",
        path:"— (prosedur lapangan + ERPNext) —",
        why:"Sewa ini berbasis jam kerja alat yang terbaca dari Hour Meter (HM). Setiap bulan perlu dicatat HM awal dan HM akhir untuk menentukan jam pemakaian aktual.",
        fields:[
          {f:"HM Awal Bulan Februari",          v:"3.240 jam (catat saat alat tiba)",  t:"Ukur",    n:"Baca dari meter di dashboard excavator"},
          {f:"HM Akhir Bulan Maret",            v:"3.440 jam (catat akhir bulan)",     t:"Ukur",    n:"Baca setiap akhir bulan atau sesuai invoice"},
          {f:"Jam Pakai Aktual",                 v:"200 jam (3440 - 3240)",            t:"Hitung",  n:"= HM Akhir - HM Awal"},
          {f:"Minimum jam yang dibayar",         v:"200 jam (karena aktual ≥ minimum)", t:"Apply",  n:"Jika aktual < 200, tetap bayar 200 jam"},
          {f:"Jam yang ditagih",                 v:"200 jam",                          t:"Result",  n:"MAX(aktual, 200)"},
          {f:"Nilai tagihan",                    v:"200 × Rp 350.000 = Rp 70.000.000", t:"Hitung",  n:""},
          {f:"Lembur (jika ada)",                v:"Jam di atas 8/hari dihitung lembur",t:"Extra",  n:"Lembur bukan untuk Supriadi — ini untuk operator (Pihak Kedua tanggung)"},
        ],
        note:"Buat 'Formulir Log HM Harian' (bisa di Excel atau custom DocType 'Equipment Daily Log') yang diisi operator setiap hari. Total jam di-reconcile akhir bulan sebelum buat Purchase Receipt.",
      },
      {
        title:"Buat Purchase Receipt Bulan Pertama (Feb-Mar 2026)",
        path:"Buka PO-SAB-2026-0002 → klik Create → Purchase Receipt",
        why:"PR bulan pertama = konfirmasi bahwa alat sudah digunakan selama 200 jam di bulan Feb-Mar dan Supriadi berhak menagih.",
        fields:[
          {f:"[PR] Posting Date",                v:"15-03-2026",                       t:"Date",    n:"Tanggal akhir periode / tanggal opname HM"},
          {f:"[PR] PO Reference",                v:"PO-SAB-2026-0002",                 t:"Fetch",   n:"Auto dari PO"},
          {f:"[PR] Project",                     v:"Pembangunan Sekolah Rakyat SS-2",  t:"Link",    n:""},
          {f:"[PR] Item: Qty Received",          v:"200",                              t:"Edit",    n:"JAM AKTUAL yang ditagih: 200 jam (aktual = minimum)"},
          {f:"[PR] Item: Rate",                  v:"350,000",                          t:"Fetch",   n:"Dari PO"},
          {f:"[PR] Item: Amount",                v:"70,000,000",                       t:"Calc",    n:"200 × 350.000"},
          {f:"[CUSTOM] No Nota HM",              v:"HM-FEB-2026-0001",                 t:"Data",    n:"Nomor dokumen pembacaan HM"},
          {f:"[CUSTOM] HM Awal",                 v:"3,240",                            t:"Int",     n:"Bacaan HM di awal periode"},
          {f:"[CUSTOM] HM Akhir",                v:"3,440",                            t:"Int",     n:"Bacaan HM di akhir periode"},
          {f:"[CUSTOM] Jam Aktual",              v:"200",                              t:"Int",     n:"HM Akhir - HM Awal"},
          {f:"[CUSTOM] Jam Ditagih",             v:"200",                              t:"Int",     n:"MAX(aktual, 200) — tidak kurang dari minimum"},
          {f:"Lampiran",                         v:"Foto HM awal + HM akhir + BA Pemakaian Alat", t:"Attach", n:"Bukti fisik untuk audit"},
        ],
        note:"Ulangi langkah ini setiap bulan. Bulan ke-2 (Maret-April): PR qty = jam aktual bulan itu (minimum 200). PR kumulatif tidak melebihi 600 jam di PO.",
      },
    ],
  },
  {
    id:"invoice_sewa", icon:"🧾", label:"Invoice & Potongan", badge:"PER TERMIN", color: C.amber,
    tagline:"Supriadi kirim invoice → input ke sistem → hitung potongan PPh",
    substeps:[
      {
        title:"Buat Purchase Invoice dari Purchase Receipt",
        path:"Buka Purchase Receipt → Create → Purchase Invoice",
        why:"Invoice ini menimbulkan hutang ke Supriadi. Perlu ditambahkan potongan PPh 23 karena ini sewa alat (bukan jasa konstruksi).",
        fields:[
          {f:"[AUTO] Supplier",                 v:"Supriadi",                          t:"Fetch",   n:"Dari PR"},
          {f:"[AUTO] Items + Qty",              v:"200 jam @ Rp 350.000",              t:"Fetch",   n:"Dari PR — JANGAN diubah"},
          {f:"[AUTO] Subtotal",                 v:"70,000,000",                        t:"Fetch",   n:"Dari PR"},
          {f:"[EDIT] Invoice Date",             v:"16-03-2026",                        t:"Date",    n:"Tanggal invoice fisik dari Supriadi"},
          {f:"[EDIT] Due Date",                 v:"23-03-2026",                        t:"Date",    n:"7 hari dari invoice date sesuai kontrak"},
          {f:"[CUSTOM] No Invoice Supriadi",    v:"INV/SPI/03/2026/01",               t:"Data",    n:"Nomor invoice fisik Supriadi"},
          {f:"Lampirkan Invoice Fisik",         v:"Scan invoice dari Supriadi",        t:"Attach",  n:"WAJIB untuk 3-way matching"},
        ],
        note:"Setelah mengisi data dasar, langkah selanjutnya adalah menambahkan potongan PPh 23 di bagian Taxes.",
      },
      {
        title:"Tambahkan Potongan PPh 23 (Sewa Alat)",
        path:"Masih di form Purchase Invoice → scroll ke bagian 'Taxes and Charges'",
        why:"Kontrak sewa alat berat dikenakan PPh Pasal 23: tarif 2% dari penghasilan bruto. BUKAN PPh 4(2) seperti jasa konstruksi. Ini WAJIB dipotong oleh Pihak Kedua (NINDYA) saat membayar.",
        fields:[
          {f:"Tax Line — Type",                 v:"Actual",                            t:"Select",  n:"Bukan percentage — kita hitung manual agar tepat"},
          {f:"Tax Line — Account",              v:"Hutang PPh 23",                     t:"Link",    n:"Akun kewajiban pajak — bukan biaya"},
          {f:"Tax Line — Description",          v:"PPh 23 Sewa Alat 2% × Rp 70.000.000", t:"Data", n:"Agar jelas di laporan"},
          {f:"Tax Line — Amount",               v:"-1,400,000",                        t:"Currency",n:"NEGATIF: −2% × 70.000.000 = −Rp 1.400.000"},
          {f:"────────────────",                v:"────────────────────────────────",   t:"──",      n:"──────────────────────────────────"},
          {f:"Grand Total setelah potongan",    v:"68,600,000",                        t:"Result",  n:"= 70.000.000 − 1.400.000 → ini yang ditransfer ke Supriadi"},
          {f:"PPh 23 yang dipotong",            v:"1,400,000",                         t:"Result",  n:"Masuk ke akun Hutang PPh 23 — disetorkan ke kas negara via SPT Masa"},
        ],
        note:"Penting: NINDYA wajib menyetor PPh 23 ini ke negara paling lambat tanggal 10 bulan berikutnya dan menyerahkan Bukti Potong (Bupot) ke Supriadi. Ini diurus oleh tim Pajak/Finance.",
      },
    ],
  },
  {
    id:"payment", icon:"💸", label:"Pembayaran ke Supriadi", badge:"PER TERMIN", color: C.teal,
    tagline:"Transfer ke Mandiri Supriadi — nilai netto setelah PPh 23",
    substeps:[
      {
        title:"Buat Payment Entry dari Purchase Invoice",
        path:"Buka Purchase Invoice → Create → Payment Entry",
        why:"Payment Entry mencatat transfer aktual ke rekening Supriadi. Nilai yang ditransfer = Grand Total PI (sudah dikurangi PPh 23).",
        fields:[
          {f:"Payment Type",                    v:"Pay",                               t:"Select",  n:"Membayar ke Supplier"},
          {f:"Party Type",                      v:"Supplier",                          t:"Select",  n:""},
          {f:"Party",                           v:"Supriadi",                          t:"Link",    n:"Pilih dari dropdown"},
          {f:"Party Bank Account",              v:"Mandiri - 1510022885195 - Supriadi",t:"Link",    n:"Rekening yang sudah didaftarkan di Supplier"},
          {f:"Paid From (Bank Kita)",           v:"Bank BCA - Rekening Operasional Proyek", t:"Link", n:"Rekening perusahaan yang dipakai transfer"},
          {f:"Posting Date",                    v:"23-03-2026",                        t:"Date",    n:"Tanggal transfer dilakukan"},
          {f:"Paid Amount",                     v:"68,600,000",                        t:"Currency",n:"NETTO: 70.000.000 − PPh23 1.400.000"},
          {f:"Reference No",                    v:"TRF2026032300X",                   t:"Data",    n:"Nomor referensi transfer dari internet banking"},
          {f:"Reference Date",                  v:"23-03-2026",                        t:"Date",    n:"Tanggal transfer di mutasi bank"},
        ],
        note:"Nilai yang ditransfer ke Supriadi adalah Rp 68.600.000 (bukan Rp 70.000.000). Selisih Rp 1.400.000 adalah PPh 23 yang NINDYA tahan untuk disetor ke negara.",
      },
      {
        title:"Link ke Invoice + Submit",
        path:"Masih di form PE → tabel Payment References → Add Row",
        why:"Kita harus specify invoice mana yang dilunasi agar AP berkurang dan invoice berubah status menjadi Paid.",
        fields:[
          {f:"Type",                            v:"Purchase Invoice",                  t:"Select",  n:""},
          {f:"Name",                            v:"ACC-PINV-2026-000XX",               t:"Link",    n:"Nomor PI sewa bulan ini"},
          {f:"Outstanding Amount",              v:"68,600,000",                        t:"Fetch",   n:"Auto dari PI"},
          {f:"Allocated Amount",                v:"68,600,000",                        t:"Currency",n:"Full payment — lunasi semua"},
          {f:"────── Submit ──────",            v:"Klik Submit → cek Journal Entry otomatis", t:"Action", n:"Dr: Hutang Supriadi | Cr: Bank"},
          {f:"Efek ke AP",                      v:"Hutang ke Supriadi = Rp 0 (lunas)", t:"Result",  n:""},
          {f:"Efek ke Bank",                    v:"Saldo bank berkurang Rp 68.600.000",t:"Result",  n:""},
          {f:"Sisa PPh 23",                     v:"Rp 1.400.000 ada di akun Hutang PPh 23", t:"Note", n:"Disetor ke negara terpisah via Journal Entry / Tax Payment"},
        ],
        note:"Setelah pembayaran: cetak Bukti Potong PPh 23, berikan ke Supriadi sebagai bukti pajak yang sudah dipotong. Ini kewajiban NINDYA sebagai pemotong pajak.",
      },
    ],
  },
  {
    id:"bbm_operator", icon:"⛽", label:"BBM & Biaya Operator", badge:"HARIAN/BULANAN", color: C.orange,
    tagline:"Biaya yang ditanggung NINDYA — input TERPISAH dari PO sewa",
    substeps:[
      {
        title:"Input Pembelian BBM Solar untuk Alat",
        path:"TIDAK melalui PO Supriadi — buat PO/Purchase Invoice ke supplier BBM",
        why:"BBM ditanggung NINDYA (Pihak Kedua). Ini biaya terpisah — dimasukkan ke Cost Center proyek sebagai biaya BBM/bahan bakar, BUKAN bagian dari hutang ke Supriadi.",
        fields:[
          {f:"Supplier BBM",                    v:"Pertamina / SPBU setempat",         t:"Link",    n:"Supplier BBM terpisah dari Supriadi"},
          {f:"Item",                            v:"BBM-SOLAR-ALAT",                   t:"Link",    n:"Item solar yang sudah dibuat"},
          {f:"UOM",                             v:"Liter",                             t:"Link",    n:""},
          {f:"Qty",                             v:"(liter per hari × hari pakai)",     t:"Float",   n:"Excavator 320D ≈ 30-40 liter/jam operasi"},
          {f:"Rate",                            v:"(harga solar aktual)",              t:"Currency",n:"Sesuai harga Pertamina saat pembelian"},
          {f:"Project",                         v:"Pembangunan Sekolah Rakyat SS-2",  t:"Link",    n:"WAJIB — biaya masuk project costing"},
          {f:"Cost Center",                     v:"CC-SCHOOL-BONE-2026",              t:"Link",    n:"WAJIB"},
          {f:"Akun Biaya",                      v:"BBM & Bahan Bakar Alat (HPP)",      t:"Link",    n:"Agar tampil terpisah di P&L proyek"},
          {f:"Cara Input Praktis",              v:"Expense Claim dari Site Manager atau Purchase Invoice mingguan dari SPBU", t:"Opsional", n:""},
        ],
        note:"Jika pembelian BBM sangat frequent (harian), pertimbangkan sistem logbook harian + input ke ERPNext mingguan sebagai Expense Claim atau Purchase Invoice dari SPBU.",
      },
      {
        title:"Input Gaji Operator + Gaji HM + Lembur",
        path:"Dua opsi: HR → Payroll (jika operator karyawan) ATAU Journal Entry (jika operator mandor/harian)",
        why:"Gaji operator, gaji HM (Hour Meter) Rp 25.000/jam, dan lembur Rp 50.000/jam adalah tanggungan NINDYA — BUKAN Supriadi. Masuk ke biaya upah proyek.",
        fields:[
          {f:"OPSI A: Operator Karyawan Tetap",  v:"HR → Payroll Entry → salary slip → link ke project", t:"Payroll",  n:"Komponen salary: gaji pokok + tunjangan + HM allowance"},
          {f:"OPSI B: Operator Harian/Mandor",   v:"Journal Entry atau Expense Claim per bulan",          t:"JE",       n:"Dr: Biaya Upah Operator Alat | Cr: Kas/Bank/Hutang"},
          {f:"────",                              v:"────────────────────────────────────────────────────", t:"──",       n:"──────────────────────────────────────────────────"},
          {f:"Log Gaji HM Bulanan",               v:"Jam Operasi × Rp 25.000",                            t:"Hitung",   n:"Misal: 200 jam × 25.000 = Rp 5.000.000/bulan"},
          {f:"Log Lembur",                        v:"Jam lembur × Rp 50.000",                             t:"Hitung",   n:"Jam di atas 8/hari × rate lembur"},
          {f:"Project di JE/Payroll",             v:"WAJIB link ke project & cost center",                t:"WAJIB",    n:"Agar masuk ke Project Costing laporan"},
          {f:"Akun Biaya",                        v:"Biaya Upah Langsung — Operator Alat (HPP)",           t:"Link",     n:"Di Chart of Accounts proyek"},
        ],
        note:"Rekap bulanan yang perlu di-track untuk operator: (1) Total jam operasi dari HM log, (2) Total gaji pokok, (3) Total gaji HM = jam × 25.000, (4) Total lembur = jam lembur × 50.000. Semua ini masuk ke Project Costing sebagai biaya upah.",
      },
    ],
  },
];

/* ─── COST SUMMARY TABLE ─── */
function CostSummary() {
  const rows = [
    { cat:"Sewa Alat", item:"Excavator 320D per jam",        pihak:"Supriadi",     supplier:"✅ Supriadi",  po:"PO Sewa Per Jam",      acct:"Sewa Alat Berat (HPP)",    amount:"70.000.000/bulan", color:C.blue },
    { cat:"Sewa Alat", item:"Mobilisasi",                    pihak:"Supriadi",     supplier:"✅ Supriadi",  po:"PO Mobilisasi",        acct:"Sewa Alat Berat (HPP)",    amount:"12.000.000 (sekali)", color:C.teal },
    { cat:"Sewa Alat", item:"Demobilisasi",                  pihak:"Supriadi",     supplier:"✅ Supriadi",  po:"PO Demobilisasi",      acct:"Sewa Alat Berat (HPP)",    amount:"12.000.000 (sekali)", color:C.teal },
    { cat:"BBM",       item:"Solar untuk Excavator",         pihak:"NINDYA",       supplier:"SPBU/Pertamina", po:"PO BBM terpisah",      acct:"BBM & Bahan Bakar (HPP)",  amount:"Aktual (±35 L/jam)", color:C.amber },
    { cat:"Upah",      item:"Gaji Operator (pokok)",         pihak:"NINDYA",       supplier:"Payroll",      po:"Payroll / JE",         acct:"Upah Langsung (HPP)",      amount:"Aktual per kontrak", color:C.purple },
    { cat:"Upah",      item:"Gaji HM (25.000/jam)",          pihak:"NINDYA",       supplier:"Payroll",      po:"Payroll / JE",         acct:"Upah Langsung (HPP)",      amount:"Jam × 25.000", color:C.purple },
    { cat:"Upah",      item:"Lembur Operator (50.000/jam)",  pihak:"NINDYA",       supplier:"Payroll",      po:"Payroll / JE",         acct:"Upah Langsung (HPP)",      amount:"Jam lembur × 50.000", color:C.orange },
  ];
  return (
    <div style={{ overflowX:"auto", borderRadius:10, border:`1px solid ${C.border}` }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.72rem" }}>
        <thead>
          <tr style={{ background:C.navy, color:"#fff" }}>
            {["Kategori","Item Biaya","Ditanggung","Supplier/Input Via","Dokumen ERPNext","Akun Biaya","Estimasi Nilai"].map(h=>(
              <th key={h} style={{ padding:"6px 10px", textAlign:"left", fontFamily:"monospace", fontSize:"0.56rem", letterSpacing:1, whiteSpace:"nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} style={{ background:i%2===0?"#fff":"#f8faff", borderBottom:`1px solid ${C.light}` }}>
              <td style={{ padding:"5px 10px" }}>
                <span style={{ background:r.color+"18", color:r.color, border:`1px solid ${r.color}35`, borderRadius:4, padding:"1px 7px", fontSize:"0.6rem", fontFamily:"monospace", fontWeight:700 }}>{r.cat}</span>
              </td>
              <td style={{ padding:"5px 10px", color:C.text, fontWeight:600, fontSize:"0.72rem" }}>{r.item}</td>
              <td style={{ padding:"5px 10px", color:r.pihak==="Supriadi"?C.blue:C.orange, fontWeight:700, fontSize:"0.7rem" }}>{r.pihak}</td>
              <td style={{ padding:"5px 10px", fontFamily:"monospace", fontSize:"0.68rem", color:C.sub }}>{r.supplier}</td>
              <td style={{ padding:"5px 10px", fontFamily:"monospace", fontSize:"0.68rem", color:r.color, fontWeight:600 }}>{r.po}</td>
              <td style={{ padding:"5px 10px", fontSize:"0.68rem", color:C.muted }}>{r.acct}</td>
              <td style={{ padding:"5px 10px", fontFamily:"monospace", fontSize:"0.68rem", color:C.navy, fontWeight:600 }}>{r.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── CHAIN VISUAL ─── */
function Chain({ active }) {
  const steps = [
    { id:"prereq",         icon:"⚙️", label:"Setup",       color:C.purple },
    { id:"po_mobdem",      icon:"🚛", label:"PO Mobdem",   color:C.teal   },
    { id:"po_sewa",        icon:"⏱️", label:"PO Sewa",     color:C.blue   },
    { id:"receipt_monthly",icon:"📊", label:"Receipt/HM",  color:C.green  },
    { id:"invoice_sewa",   icon:"🧾", label:"Invoice",     color:C.amber  },
    { id:"payment",        icon:"💸", label:"Bayar",       color:C.teal   },
    { id:"bbm_operator",   icon:"⛽", label:"BBM & Upah",  color:C.orange },
  ];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, overflowX:"auto", padding:"0.5rem 0" }}>
      {steps.map((s,i)=>(
        <>
          <div key={s.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, minWidth:62 }}>
            <div style={{ width:38, height:38, borderRadius:"50%", background:active===s.id?s.color:s.color+"20", border:`2px solid ${s.color}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{s.icon}</div>
            <div style={{ fontSize:"0.57rem", color:active===s.id?s.color:C.muted, textAlign:"center", fontWeight:active===s.id?700:400, fontFamily:"monospace" }}>{s.label}</div>
          </div>
          {i<steps.length-1&&<div key={`a${i}`} style={{ color:C.light, fontSize:"1.2rem", flexShrink:0, marginBottom:14 }}>›</div>}
        </>
      ))}
    </div>
  );
}

/* ─── MAIN ─── */
export default function FlowAlatBerat() {
  const [activePhase, setActivePhase] = useState("po_sewa");
  const [openSub, setOpenSub] = useState(0);
  const [showCostMap, setShowCostMap] = useState(true);

  const phase = PHASES.find(p=>p.id===activePhase);

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:"'Segoe UI', sans-serif" }}>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg, #0f2344 0%, #1a3a6a 100%)", borderBottom:`4px solid #d4911a`, padding:"1.3rem 1.5rem 1.1rem" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontFamily:"monospace", fontSize:"0.54rem", color:"#4a72b0", letterSpacing:4, marginBottom:5 }}>ERPNEXT — SEWA PAKAI ALAT BERAT | PANDUAN INPUT LENGKAP</div>
          <h1 style={{ margin:0, color:"#fff", fontSize:"clamp(1.1rem,2.2vw,1.65rem)", fontWeight:900, letterSpacing:-0.3 }}>
            Kontrak Sewa Pakai Alat Berat di ERPNext
          </h1>
          <div style={{ marginTop:6, fontFamily:"monospace", fontSize:"0.7rem", color:"#6a90c8", display:"flex", gap:16, flexWrap:"wrap" }}>
            <span>🚜 Excavator Caterpillar 320D</span>
            <span>👤 Supriadi (Pihak Pertama)</span>
            <span>⏱️ Rp 350.000/jam — min 200 jam</span>
            <span>💰 Rp 70.000.000/bulan</span>
            <span>📅 18 Feb 2026 | Kab. Bone</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"1.3rem 1.5rem", display:"flex", flexDirection:"column", gap:12 }}>

        {/* KEY INSIGHT */}
        <div style={{ background:"#fffbeb", border:`2px solid #d97706`, borderRadius:10, padding:"0.9rem 1.1rem" }}>
          <div style={{ fontFamily:"monospace", fontSize:"0.55rem", color:C.gold, letterSpacing:3, marginBottom:6 }}>PERBEDAAN KRITIS: SEWA ALAT vs SPK SUBKON</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:10 }}>
            {[
              { icon:"📋", label:"SPK Bekisting (Mas Samsuri)", note:"1 PO, 1 jenis biaya, bayar per BAO opname volume m2. Sederhana.", color:C.green },
              { icon:"🚜", label:"Sewa Alat (Supriadi)", note:"3+ PO berbeda + biaya BBM + biaya operator — semua harus ditrack TERPISAH karena tanggungannya berbeda.", color:C.amber },
            ].map((k,i)=>(
              <div key={i} style={{ background:k.color+"10", border:`1px solid ${k.color}40`, borderRadius:8, padding:"0.65rem 0.85rem", display:"flex", gap:8 }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{k.icon}</span>
                <div>
                  <div style={{ color:k.color, fontWeight:700, fontSize:"0.8rem", marginBottom:3 }}>{k.label}</div>
                  <div style={{ color:C.sub, fontSize:"0.74rem", lineHeight:1.55 }}>{k.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COST MAP */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
          <button onClick={()=>setShowCostMap(!showCostMap)}
            style={{ width:"100%", background:"none", border:"none", padding:"0.85rem 1.1rem", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", textAlign:"left" }}>
            <div>
              <div style={{ fontFamily:"monospace", fontSize:"0.55rem", color:C.muted, letterSpacing:3 }}>PETA BIAYA — SIAPA TANGGUNG APA & INPUT DI MANA</div>
              <div style={{ color:C.navy, fontWeight:700, fontSize:"0.86rem", marginTop:2 }}>7 Komponen Biaya dari Kontrak Ini — Masing-masing Beda Cara Input</div>
            </div>
            <span style={{ color:C.blue, fontSize:"1.1rem", transform:showCostMap?"rotate(90deg)":"none", transition:"transform 0.2s" }}>›</span>
          </button>
          {showCostMap && <div style={{ padding:"0 1.1rem 1.1rem" }}><CostSummary /></div>}
        </div>

        {/* CHAIN */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"0.9rem 1.2rem" }}>
          <div style={{ fontFamily:"monospace", fontSize:"0.55rem", color:C.muted, letterSpacing:3, marginBottom:8 }}>ALUR 7 FASE — KLIK FASE UNTUK DETAIL</div>
          <Chain active={activePhase} />
        </div>

        {/* PHASE SELECTOR */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {PHASES.map(p=>(
            <button key={p.id} onClick={()=>{ setActivePhase(p.id); setOpenSub(0); }}
              style={{ padding:"0.42rem 0.85rem", background:activePhase===p.id?p.color:C.card, border:`2px solid ${activePhase===p.id?p.color:C.border}`, borderRadius:7, cursor:"pointer", color:activePhase===p.id?"#fff":C.sub, fontWeight:700, fontSize:"0.7rem", display:"flex", gap:5, alignItems:"center", transition:"all 0.15s" }}>
              <span>{p.icon}</span><span>{p.label}</span>
              <span style={{ background:activePhase===p.id?"rgba(255,255,255,0.25)":p.color+"20", color:activePhase===p.id?"#fff":p.color, borderRadius:4, padding:"0 5px", fontSize:"0.56rem", fontFamily:"monospace" }}>{p.badge}</span>
            </button>
          ))}
        </div>

        {/* PHASE CONTENT */}
        {phase && (
          <div style={{ background:C.card, border:`2px solid ${phase.color}`, borderRadius:12, overflow:"hidden" }}>
            <div style={{ background:phase.color, padding:"0.9rem 1.2rem", display:"flex", gap:12, alignItems:"center" }}>
              <span style={{ fontSize:26 }}>{phase.icon}</span>
              <div>
                <div style={{ color:"rgba(255,255,255,0.7)", fontFamily:"monospace", fontSize:"0.57rem", letterSpacing:3 }}>FASE {PHASES.findIndex(p=>p.id===phase.id)+1} — {phase.badge}</div>
                <div style={{ color:"#fff", fontWeight:900, fontSize:"0.98rem" }}>{phase.label}</div>
                <div style={{ color:"rgba(255,255,255,0.75)", fontSize:"0.77rem" }}>{phase.tagline}</div>
              </div>
            </div>
            <div style={{ padding:"1rem" }}>
              {phase.substeps.map((sub,si)=>(
                <div key={si} style={{ marginBottom:8, border:`1px solid ${openSub===si?phase.color+"60":C.border}`, borderRadius:10, overflow:"hidden", transition:"border-color 0.2s" }}>
                  <button onClick={()=>setOpenSub(openSub===si?-1:si)}
                    style={{ width:"100%", background:openSub===si?phase.color+"08":"none", border:"none", padding:"0.72rem 1rem", cursor:"pointer", display:"grid", gridTemplateColumns:"28px 1fr auto", gap:10, alignItems:"center", textAlign:"left" }}>
                    <div style={{ width:25, height:25, borderRadius:"50%", background:openSub===si?phase.color:C.light, border:`2px solid ${openSub===si?phase.color:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"monospace", fontSize:"0.63rem", color:openSub===si?"#fff":C.muted, fontWeight:700 }}>{si+1}</div>
                    <div>
                      <div style={{ color:C.navy, fontWeight:700, fontSize:"0.85rem" }}>{sub.title}</div>
                      <div style={{ fontFamily:"monospace", fontSize:"0.59rem", color:phase.color, marginTop:1 }}>📍 {sub.path}</div>
                    </div>
                    <span style={{ color:phase.color, fontSize:"1.1rem", transform:openSub===si?"rotate(90deg)":"none", transition:"transform 0.2s", display:"inline-block" }}>›</span>
                  </button>
                  {openSub===si && (
                    <div style={{ borderTop:`1px solid ${C.border}`, padding:"0.9rem 1rem" }}>
                      <div style={{ background:phase.color+"10", border:`1px solid ${phase.color}30`, borderRadius:8, padding:"0.55rem 0.82rem", marginBottom:12, display:"flex", gap:8 }}>
                        <span style={{ color:phase.color, flexShrink:0 }}>💡</span>
                        <span style={{ color:C.sub, fontSize:"0.76rem", lineHeight:1.6 }}><strong>Kenapa langkah ini?</strong> {sub.why}</span>
                      </div>
                      <div style={{ overflowX:"auto", borderRadius:8, border:`1px solid ${C.border}`, marginBottom:12 }}>
                        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.72rem" }}>
                          <thead>
                            <tr style={{ background:"#f1f5f9" }}>
                              {["Field / Aksi","Nilai yang Diinput","Tipe","Keterangan"].map(h=>(
                                <th key={h} style={{ padding:"5px 10px", textAlign:"left", fontFamily:"monospace", fontSize:"0.55rem", color:C.muted, letterSpacing:2, borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sub.fields.map((fld,fi)=>{
                              const tc = fld.t.includes("Calc")||fld.t.includes("Fetch")||fld.t.includes("AUTO")||fld.t.includes("Result") ? C.blue :
                                         fld.t.includes("Custom") ? C.amber :
                                         fld.t.includes("WAJIB") ? C.red :
                                         fld.t.includes("Rekomendasi")||fld.t.includes("Decision") ? C.green :
                                         fld.t.includes("Extra") ? C.purple : C.navy;
                              return (
                                <tr key={fi} style={{ background:fi%2===0?"#fff":"#f8faff", borderBottom:`1px solid ${C.light}` }}>
                                  <td style={{ padding:"4px 10px", fontWeight:700, color:C.navy, fontSize:"0.72rem" }}>{fld.f}</td>
                                  <td style={{ padding:"4px 10px", fontFamily:"monospace", fontSize:"0.7rem", color:tc, fontWeight:600 }}>{fld.v}</td>
                                  <td style={{ padding:"4px 10px", whiteSpace:"nowrap" }}>
                                    <span style={{ background:tc+"15", color:tc, border:`1px solid ${tc}30`, borderRadius:4, padding:"1px 6px", fontSize:"0.57rem", fontFamily:"monospace", fontWeight:700 }}>{fld.t}</span>
                                  </td>
                                  <td style={{ padding:"4px 10px", color:C.muted, fontSize:"0.7rem" }}>{fld.n}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ background:"#fffbeb", border:`1px solid #d97706`, borderRadius:8, padding:"0.58rem 0.82rem", display:"flex", gap:8 }}>
                        <span style={{ color:C.gold, flexShrink:0 }}>⚠️</span>
                        <span style={{ color:"#78350f", fontSize:"0.75rem", lineHeight:1.6 }}>{sub.note}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MONTHLY CYCLE SUMMARY */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:11, padding:"1rem 1.2rem" }}>
          <div style={{ fontFamily:"monospace", fontSize:"0.55rem", color:C.muted, letterSpacing:3, marginBottom:10 }}>SIKLUS BULANAN — YANG HARUS DILAKUKAN SETIAP BULAN</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:8 }}>
            {[
              { day:"H+1 setiap hari",   task:"Operator isi Log HM harian",                icon:"📝", color:C.green  },
              { day:"Akhir bulan",        task:"Rekap total jam HM dari log harian",         icon:"📊", color:C.blue   },
              { day:"Akhir bulan",        task:"Rekap konsumsi BBM + buat PI ke SPBU",       icon:"⛽", color:C.amber  },
              { day:"Akhir bulan",        task:"Buat Purchase Receipt (jam HM aktual)",      icon:"📐", color:C.green  },
              { day:"Awal bulan+1",       task:"Terima invoice Supriadi → buat PI → potong PPh 23", icon:"🧾", color:C.amber },
              { day:"Maks 7 hari",        task:"Bayar ke Supriadi (netto setelah PPh 23)",   icon:"💸", color:C.teal   },
              { day:"Tgl 10 bulan+1",     task:"Setor PPh 23 ke negara + buat Bupot",        icon:"🏛️", color:C.purple },
              { day:"Maks tgl 10",        task:"Input gaji operator (payroll/JE)",           icon:"👷", color:C.orange },
            ].map((t,i)=>(
              <div key={i} style={{ background:"#f8faff", border:`1px solid ${t.color}25`, borderRadius:8, padding:"0.6rem 0.75rem", borderLeft:`3px solid ${t.color}` }}>
                <div style={{ fontFamily:"monospace", fontSize:"0.58rem", color:t.color, marginBottom:3 }}>{t.day}</div>
                <div style={{ display:"flex", gap:5, alignItems:"flex-start" }}>
                  <span style={{ fontSize:14, flexShrink:0 }}>{t.icon}</span>
                  <span style={{ color:C.sub, fontSize:"0.73rem", lineHeight:1.5 }}>{t.task}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PPH NOTE */}
        <div style={{ background:"#fef2f2", border:`2px solid ${C.red}`, borderRadius:10, padding:"1rem 1.2rem" }}>
          <div style={{ fontFamily:"monospace", fontSize:"0.55rem", color:C.red, letterSpacing:3, marginBottom:6 }}>PERHATIAN PAJAK — WAJIB DIKETAHUI</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              { title:"Sewa Alat Berat → PPh Pasal 23", body:"Tarif: 2% dari penghasilan bruto. Dipotong oleh NINDYA saat membayar Supriadi. Wajib disetor ke negara paling lambat tgl 10 bulan berikutnya. Bukti Potong (Bupot) diserahkan ke Supriadi.", color:C.red },
              { title:"Bukan PPh 4(2) Final", body:"PPh 4(2) adalah untuk JASA KONSTRUKSI (seperti SPK Mas Samsuri). Sewa alat bukan jasa konstruksi — masuknya ke PPh 23 sewa harta. Jangan sampai salah tarif dan salah setor.", color:C.orange },
            ].map((p,i)=>(
              <div key={i} style={{ background:"#fff", borderRadius:8, padding:"0.7rem 0.9rem", border:`1px solid ${p.color}30` }}>
                <div style={{ color:p.color, fontWeight:700, fontSize:"0.8rem", marginBottom:4 }}>{p.title}</div>
                <div style={{ color:C.sub, fontSize:"0.74rem", lineHeight:1.6 }}>{p.body}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
