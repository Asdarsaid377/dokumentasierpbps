import { useState } from "react";

const MONO = "'Courier New', monospace";
const SERIF = "'Palatino Linotype', 'Book Antiqua', Palatino, serif";

// ─── FLOW DATA ───────────────────────────────────────────────────────────────

const FLOW_STEPS = [
  {
    id: 1, phase: "SETUP TEMPLATE", color: "#c084fc", icon: "🖊️",
    title: "Template & Standarisasi Dokumen",
    actor: "Legal / Admin Kontrak / Direksi",
    desc: "Fondasi dari seluruh sistem dokumen. Sebelum satu pun kontrak dibuat, perusahaan harus memiliki library template dokumen yang terstandarisasi dan sudah di-review legal.",
    actions: [
      "Legal membuat master template untuk setiap jenis kontrak: Kontrak Owner, Kontrak Subkon, SPK, Adendum, NDA, MOU",
      "Template berisi placeholder variable: {{nama_proyek}}, {{nilai_kontrak}}, {{tanggal_mulai}} — otomatis terisi saat kontrak dibuat",
      "Tentukan klausul wajib per jenis kontrak: retensi, denda, garansi, force majeure, dispute resolution",
      "Buat template untuk surat menyurat standar: surat teguran, surat klaim, berita acara, instruksi perubahan",
      "Semua template di-review dan di-approve Direksi sebelum diaktifkan",
      "Template dikunci — hanya Legal yang boleh memodifikasi template master",
      "Buat numbering convention: KONT-PRJ-2024-001, SPK-2024-015, ADD-2024-003",
      "Setup folder struktur dokumen per proyek di dalam sistem",
    ],
    output: "Library template siap pakai, terstandarisasi, dan sudah disetujui Legal & Direksi",
    warning: "Template yang tidak ter-review legal berpotensi menciptakan kontrak yang tidak menguntungkan atau tidak sah",
  },
  {
    id: 2, phase: "INISIASI KONTRAK", color: "#38bdf8", icon: "📄",
    title: "Pembuatan Draft Kontrak",
    actor: "PM / Admin Kontrak",
    desc: "Kontrak baru dibuat dari template yang sudah ada. Sistem memandu pengisian data sehingga tidak ada klausul penting yang terlewat.",
    actions: [
      "PM / Admin pilih jenis kontrak yang akan dibuat dari library template",
      "Sistem tampilkan form wizard: isi data proyek, pihak yang berkontrak, nilai, tanggal, scope",
      "Sistem auto-generate nomor kontrak sesuai numbering convention",
      "Variable di template otomatis terisi dari data yang diinput dan dari master data proyek di ERPNext",
      "Isi annex / lampiran: BOQ kontrak, jadwal pelaksanaan, spesifikasi teknis, gambar kontrak",
      "System link kontrak ke proyek terkait di ERPNext Project",
      "Set reminder otomatis: alert H-30, H-14, H-7 sebelum tanggal berakhir kontrak",
      "Draft tersimpan, belum bisa digunakan sampai melalui proses review",
    ],
    output: "Draft kontrak lengkap ter-generate dari template, siap masuk ke workflow review",
    warning: null,
  },
  {
    id: 3, phase: "REVIEW & NEGOSIASI", color: "#34d399", icon: "🔄",
    title: "Review Internal & Negosiasi dengan Pihak Lain",
    actor: "PM → Legal → Direksi / Pihak Eksternal",
    desc: "Draft kontrak melewati review internal berlapis sebelum dinegosiasikan dengan pihak eksternal. Setiap perubahan terdokumentasi dalam version history.",
    actions: [
      "Draft masuk ke queue review PM — PM cek kesesuaian scope, nilai, dan jadwal dengan kondisi proyek",
      "PM submit untuk Legal review — Legal cek klausul hukum, risiko, dan kewajiban perusahaan",
      "Setiap reviewer bisa tambah komentar / mark-up langsung di dalam dokumen",
      "Jika ada perubahan → sistem buat versi baru dokumen (v0.1, v0.2, dst) — versi lama tersimpan",
      "Setelah internal approve → kirim ke pihak eksternal (owner / subkon) untuk review mereka",
      "Pihak eksternal beri tanggapan → tim Legal negosiasikan pasal per pasal",
      "Setiap putaran negosiasi tercatat: siapa yang mengusulkan perubahan, pasal apa, tanggal berapa",
      "Versi final yang disepakati kedua pihak → naik ke tahap approval akhir",
    ],
    output: "Kontrak yang sudah disepakati kedua pihak, dengan histori negosiasi lengkap tersimpan",
    warning: "Setiap versi dokumen harus tersimpan — jangan pernah overwrite dokumen sebelumnya",
  },
  {
    id: 4, phase: "APPROVAL", color: "#fbbf24", icon: "✅",
    title: "Approval Workflow Bertingkat",
    actor: "PM → Manajer → Direktur (tergantung nilai kontrak)",
    desc: "Kontrak tidak boleh ditandatangani tanpa melewati approval internal sesuai Surat Keputusan Otorisasi (SKO) perusahaan. Threshold nilai menentukan siapa yang harus approve.",
    actions: [
      "Sistem otomatis routing approval berdasarkan nilai kontrak dan tipe dokumen",
      "Nilai < Rp 500jt: PM Approve → Manajer Approve",
      "Nilai Rp 500jt – 5M: + Legal Approve → Direktur Teknik Approve",
      "Nilai > Rp 5M: + Direktur Utama / Dewan Direksi",
      "Setiap approver mendapat notifikasi email/sistem — batas waktu review 3 hari kerja",
      "Approver bisa: Approve / Reject with Comment / Delegate ke orang lain",
      "Jika di-reject → kembali ke drafter dengan catatan perbaikan yang spesifik",
      "Audit trail lengkap: siapa approve, jam berapa, dari IP address mana",
      "Setelah semua level approve → status dokumen berubah ke 'Ready to Sign'",
    ],
    output: "Kontrak sudah disetujui semua pihak internal yang berwenang, siap untuk penandatanganan",
    warning: "Kontrak yang ditandatangani tanpa approval lengkap tidak sah secara internal dan bisa menjadi temuan audit",
  },
  {
    id: 5, phase: "PENANDATANGANAN", color: "#fb7185", icon: "✍️",
    title: "Penandatanganan & Pemberlakuan",
    actor: "Direktur / Pejabat yang Berwenang + Pihak Eksternal",
    desc: "Penandatanganan adalah momen kontrak menjadi sah secara hukum. Sistem mendukung tanda tangan fisik (scan) maupun e-sign.",
    actions: [
      "Cetak dokumen untuk tanda tangan fisik ATAU kirim link e-sign ke semua pihak (integrasi dengan layanan e-sign seperti PrivyID / DocuSign)",
      "Setiap halaman kontrak di-paraf, halaman terakhir ditandatangani + stempel perusahaan",
      "Scan dokumen yang sudah ditandatangani → upload ke sistem (jika tanda tangan fisik)",
      "Sistem tandai dokumen sebagai 'Signed' + catat tanggal efektif kontrak",
      "Nomor kontrak resmi teregistrasi — tidak bisa diubah lagi",
      "Distribusi salinan: pihak lawan kontrak, PM proyek, Legal, Finance, Arsip",
      "Kontrak aktif → status proyek otomatis update di ERPNext",
      "Trigger reminder jadwal: H-30 sebelum akhir masa kontrak",
    ],
    output: "Kontrak resmi berlaku dengan dokumen bertandatangan tersimpan di sistem dan terdistribusi",
    warning: "Dokumen asli fisik harus disimpan di brankas — sistem hanya menyimpan salinan digital",
  },
  {
    id: 6, phase: "EKSEKUSI & MONITORING", color: "#a3e635", icon: "📊",
    title: "Monitoring Kewajiban & Milestone Kontrak",
    actor: "PM / Admin Kontrak",
    desc: "Setelah kontrak aktif, sistem secara aktif memonitor pemenuhan kewajiban kedua pihak dan mengingatkan deadline-deadline penting.",
    actions: [
      "Sistem buat checklist kewajiban kontrak: apa yang harus dilakukan kontraktor, apa yang harus dilakukan owner",
      "Milestone kontrak di-input: tanggal pembayaran DP, deadline setiap termin, tanggal selesai",
      "Alert otomatis: H-14 sebelum deadline milestone — PM wajib konfirmasi status",
      "Tracking dokumen yang harus diserahkan ke owner: jaminan pelaksanaan, asuransi, laporan bulanan",
      "Tracking dokumen yang harus diterima dari owner: jaminan pembayaran, ijin-ijin, shop drawing approval",
      "PM update status setiap kewajiban: Pending / Fulfilled / Overdue",
      "Dashboard kontrak aktif: tampilkan semua kontrak dengan status kewajiban dan alert",
      "Jika kewajiban owner overdue → sistem bantu buat surat teguran formal",
    ],
    output: "Semua kewajiban kontrak terpantau real-time, tidak ada yang terlewat atau terlupa",
    warning: null,
  },
  {
    id: 7, phase: "ADENDUM & PERUBAHAN", color: "#f97316", icon: "🔁",
    title: "Adendum & Change Order Kontrak",
    actor: "PM → Legal → Direksi → Pihak Eksternal",
    desc: "Perubahan scope, nilai, atau waktu dari kontrak awal harus diproses sebagai adendum resmi. Tidak ada perubahan lisan yang diakui.",
    actions: [
      "PM identifikasi kebutuhan perubahan: tambah pekerjaan, kurang pekerjaan, perpanjangan waktu, penyesuaian harga",
      "Buat dokumen Change Order / Instruksi Perubahan (IP) dengan justifikasi teknis",
      "Hitung nilai perubahan: berapa tambah/kurang dari nilai kontrak awal",
      "Change Order melalui approval internal yang sama dengan kontrak (sesuai nilai perubahannya)",
      "Negosiasikan dengan pihak lawan kontrak — jika disepakati, buat dokumen Adendum",
      "Adendum merujuk ke nomor kontrak induk: ADD-KONT-PRJ-2024-001-A01",
      "Setelah ditandatangani → sistem otomatis update nilai kontrak + perpanjang tanggal jika ada",
      "Semua adendum tertaut ke kontrak induk — bisa dilihat histori lengkapnya",
      "Nilai kontrak terupdate otomatis di modul RAB dan billing proyek",
    ],
    output: "Adendum resmi tersimpan dan terhubung ke kontrak induk, semua nilai & jadwal ter-update otomatis",
    warning: "Pekerjaan tambahan yang dikerjakan tanpa adendum tidak bisa ditagihkan — risiko sengketa besar",
  },
  {
    id: 8, phase: "KLAIM & SENGKETA", color: "#ef4444", icon: "⚖️",
    title: "Manajemen Klaim & Sengketa",
    actor: "PM / Legal",
    desc: "Ketika terjadi perselisihan — baik klaim ke owner maupun klaim dari subkon — semua dokumen pendukung harus terorganisir dan mudah diakses.",
    actions: [
      "Identifikasi dasar klaim: pasal kontrak apa yang dilanggar/menjadi dasar klaim",
      "Kumpulkan dokumen pendukung dari repository: foto, LHL, BAO, surat korespondensi, BA rapat",
      "Buat Surat Klaim formal dengan referensi pasal kontrak yang spesifik",
      "Sistem bantu susun kronologi kejadian dari semua dokumen yang tersimpan",
      "Track status klaim: terkirim / dibalas / negosiasi / mediasi / arbitrase / selesai",
      "Jika ada timeline klaim di kontrak (misal harus submit klaim dalam 28 hari kejadian) — sistem alert sebelum deadline",
      "Semua korespondensi klaim disimpan dalam folder khusus per klaim",
      "Jika berlanjut ke arbitrase — semua dokumen sudah terorganisir dan mudah diserahkan ke arbiter",
    ],
    output: "Klaim terdokumentasi rapi dengan dasar hukum yang jelas, kronologi tersusun, dan dokumen bukti siap",
    warning: "Klaim yang diajukan melewati batas waktu yang ditetapkan kontrak bisa ditolak — alert wajib aktif",
  },
  {
    id: 9, phase: "PERIZINAN & LEGALITAS", color: "#818cf8", icon: "🏛️",
    title: "Manajemen Izin & Legalitas Perusahaan",
    actor: "Admin Legal / Procurement",
    desc: "Terpisah dari kontrak proyek, perusahaan memiliki dokumen legalitas korporat yang harus selalu valid. Kadaluarsa izin bisa menghentikan operasional perusahaan.",
    actions: [
      "Input semua dokumen legalitas perusahaan: SIUJK, SBU, SKK, NPWP, NIB, Akta, ISO, BPJS",
      "Set tanggal terbit dan tanggal kadaluarsa setiap dokumen",
      "Sistem hitung hari menuju kadaluarsa setiap dokumen secara real-time",
      "Alert bertingkat: 90 hari, 60 hari, 30 hari, 14 hari sebelum kadaluarsa → notifikasi ke PIC",
      "PIC perpanjang dokumen → upload versi baru → update tanggal kadaluarsa di sistem",
      "Dashboard: tampilkan semua dokumen per status (Valid / Expiring Soon / Expired)",
      "Dokumen expired otomatis muncul sebagai blocker saat membuat kontrak baru yang membutuhkan dokumen tersebut",
      "Histori semua versi dokumen tersimpan (audit trail untuk tender dan akreditasi)",
    ],
    output: "Zero dokumen kadaluarsa — perusahaan selalu siap ikut tender dan menandatangani kontrak kapan saja",
    warning: "SIUJK / SBU yang kadaluarsa saat proyek berjalan bisa jadi alasan owner menghentikan kontrak",
  },
  {
    id: 10, phase: "ARSIP & PENCARIAN", color: "#94a3b8", icon: "🗄️",
    title: "Arsip Digital & Full-Text Search",
    actor: "Semua User (sesuai hak akses)",
    desc: "Ribuan dokumen dari puluhan proyek harus bisa ditemukan dalam hitungan detik. Sistem arsip yang baik adalah aset perusahaan yang tidak ternilai.",
    actions: [
      "Semua dokumen tersimpan terstruktur: per proyek → per kategori → per nomor dokumen",
      "Full-text search: cari berdasarkan kata kunci di dalam konten dokumen (bukan hanya nama file)",
      "Filter pencarian: per proyek, per tipe dokumen, per tanggal, per status, per pihak yang terlibat",
      "Sistem tagging: setiap dokumen bisa diberi tag fleksibel untuk kategori tambahan",
      "Version comparison: bandingkan dua versi dokumen side-by-side untuk lihat perubahan",
      "Hak akses berbasis role: PM hanya bisa lihat proyek yang dia handle, Legal bisa lihat semua",
      "Download & sharing: link dokumen yang bisa dikirim ke pihak eksternal dengan masa berlaku",
      "Audit log: setiap akses, download, dan perubahan dokumen tercatat siapa dan kapan",
    ],
    output: "Repository dokumen terpusat yang terorganisir, searchable, dan aman dengan access control",
    warning: null,
  },
];

// ─── DATA MODELS ─────────────────────────────────────────────────────────────

const DATA_MODELS = [
  {
    name: "Document_Template",
    label: "Document Template",
    color: "#c084fc",
    icon: "🖊️",
    type: "Master DocType",
    desc: "Library template semua jenis dokumen — master yang dikunci, hanya Legal yang bisa edit",
    fields: [
      { name: "template_id", type: "Data", key: true, desc: "TPL-KONT-OWNER-001" },
      { name: "template_name", type: "Data", key: false, desc: "Kontrak Pekerjaan dengan Owner" },
      { name: "document_category", type: "Select", key: false, desc: "Kontrak / Adendum / SPK / Surat / BA / Perizinan" },
      { name: "contract_party_type", type: "Select", key: false, desc: "Owner / Subkon / Vendor / Internal / Regulator" },
      { name: "template_content", type: "Text Editor", key: false, desc: "Isi template dengan placeholder {{variable}}" },
      { name: "mandatory_clauses", type: "Table", key: false, desc: "Daftar klausul wajib yang harus ada" },
      { name: "variable_list", type: "Table", key: false, desc: "List placeholder yang dipakai di template" },
      { name: "numbering_format", type: "Data", key: false, desc: "KONT-PRJ-{YYYY}-{SEQ}" },
      { name: "approval_matrix_ref", type: "Link → Approval_Matrix", key: false, desc: "Matriks approval untuk tipe dokumen ini" },
      { name: "is_active", type: "Check", key: false, desc: "FALSE = template diarsipkan" },
      { name: "version", type: "Data", key: false, desc: "v3.1 — versi template" },
      { name: "last_reviewed_by", type: "Link → User", key: false, desc: "Legal yang terakhir review" },
      { name: "last_reviewed_date", type: "Date", key: false, desc: "" },
    ]
  },
  {
    name: "Contract_Document",
    label: "Contract Document",
    color: "#38bdf8",
    icon: "📜",
    type: "DocType Utama",
    desc: "Dokumen kontrak resmi — dari draft sampai signed, satu record per kontrak",
    fields: [
      { name: "contract_id", type: "Data", key: true, desc: "KONT-PRJ-2024-018" },
      { name: "template_ref", type: "Link → Document_Template", key: false, desc: "Template yang digunakan" },
      { name: "contract_title", type: "Data", key: false, desc: "Judul resmi kontrak" },
      { name: "contract_category", type: "Select", key: false, desc: "Kontrak Owner / Subkon / Vendor / Konsultan / Sewa Alat" },
      { name: "project", type: "Link → Project", key: false, desc: "Link ke ERPNext Project" },
      { name: "party_type", type: "Select", key: false, desc: "Owner / Subkon / Vendor / Internal" },
      { name: "party_name", type: "Dynamic Link", key: false, desc: "Link ke Customer / Supplier sesuai party_type" },
      { name: "contract_value", type: "Currency", key: false, desc: "Nilai kontrak resmi" },
      { name: "contract_value_after_amendment", type: "Currency", key: false, desc: "Nilai setelah semua adendum (auto-calc)" },
      { name: "currency", type: "Link → Currency", key: false, desc: "IDR / USD / SGD" },
      { name: "effective_date", type: "Date", key: false, desc: "Tanggal kontrak mulai berlaku" },
      { name: "expiry_date", type: "Date", key: false, desc: "Tanggal kontrak berakhir" },
      { name: "days_to_expiry", type: "Int", key: false, desc: "Auto-calc dari today() — negatif = sudah expired" },
      { name: "status", type: "Select", key: false, desc: "Draft / Under Review / Negotiation / Approved / Signed / Active / Expired / Terminated / Completed" },
      { name: "current_version", type: "Data", key: false, desc: "v0.3, v1.0 (final)" },
      { name: "signed_document", type: "Attach", key: false, desc: "File PDF kontrak yang sudah ditandatangani" },
      { name: "esign_status", type: "Select", key: false, desc: "Not Started / Sent / Partially Signed / Fully Signed" },
      { name: "esign_ref", type: "Data", key: false, desc: "Referensi ID dari layanan e-sign" },
      { name: "reminder_sent_30d", type: "Check", key: false, desc: "Flag: apakah reminder 30 hari sudah terkirim" },
      { name: "reminder_sent_14d", type: "Check", key: false, desc: "" },
      { name: "reminder_sent_7d", type: "Check", key: false, desc: "" },
      { name: "created_by", type: "Link → User", key: false, desc: "" },
      { name: "tags", type: "Table MultiSelect", key: false, desc: "Tag fleksibel untuk pencarian" },
    ]
  },
  {
    name: "Contract_Version",
    label: "Contract Version History",
    color: "#34d399",
    icon: "🔀",
    type: "Child of Contract_Document",
    desc: "Histori setiap versi dokumen — dari v0.1 draft sampai v1.0 final yang ditandatangani",
    fields: [
      { name: "version_number", type: "Data", key: false, desc: "v0.1, v0.2, v1.0" },
      { name: "version_date", type: "Datetime", key: false, desc: "Waktu versi ini dibuat" },
      { name: "created_by", type: "Link → User", key: false, desc: "Siapa yang membuat versi ini" },
      { name: "change_summary", type: "Text", key: false, desc: "Ringkasan apa yang berubah dari versi sebelumnya" },
      { name: "change_type", type: "Select", key: false, desc: "Initial Draft / Internal Revision / Negotiation Round / Final / Signed" },
      { name: "document_file", type: "Attach", key: false, desc: "File dokumen versi ini" },
      { name: "is_current", type: "Check", key: false, desc: "TRUE hanya untuk versi terbaru" },
      { name: "reviewed_by", type: "Link → User", key: false, desc: "Reviewer versi ini" },
      { name: "review_notes", type: "Text", key: false, desc: "Catatan reviewer" },
    ]
  },
  {
    name: "Contract_Clause",
    label: "Contract Clause Registry",
    color: "#34d399",
    icon: "📑",
    type: "Child of Contract_Document",
    desc: "Index pasal-pasal penting dalam kontrak — memudahkan pencarian dan referensi saat klaim",
    fields: [
      { name: "clause_number", type: "Data", key: false, desc: "Pasal 12.3" },
      { name: "clause_title", type: "Data", key: false, desc: "Retensi dan Pencairan Jaminan" },
      { name: "clause_category", type: "Select", key: false, desc: "Pembayaran / Denda / Retensi / Garansi / Terminasi / Sengketa / Force Majeure / Kerahasiaan" },
      { name: "clause_summary", type: "Text", key: false, desc: "Ringkasan pasal dalam bahasa sederhana" },
      { name: "has_deadline", type: "Check", key: false, desc: "TRUE jika ada batas waktu di pasal ini" },
      { name: "deadline_description", type: "Data", key: false, desc: "Klaim harus diajukan dalam 28 hari kalender" },
      { name: "is_kpi_tracked", type: "Check", key: false, desc: "TRUE jika pasal ini perlu di-monitor ketaatannya" },
    ]
  },
  {
    name: "Approval_Matrix",
    label: "Approval Matrix",
    color: "#fbbf24",
    icon: "🏛️",
    type: "Master DocType",
    desc: "Matriks otorisasi penandatanganan kontrak berdasarkan nilai — sesuai SKO perusahaan",
    fields: [
      { name: "matrix_id", type: "Data", key: true, desc: "APM-KONT-001" },
      { name: "document_category", type: "Select", key: false, desc: "Kontrak Owner / Subkon / Vendor / dll" },
      { name: "value_threshold_min", type: "Currency", key: false, desc: "Batas bawah nilai (0 untuk tier pertama)" },
      { name: "value_threshold_max", type: "Currency", key: false, desc: "Batas atas nilai (kosong = tidak terbatas)" },
      { name: "approver_1_role", type: "Data", key: false, desc: "PM Proyek" },
      { name: "approver_2_role", type: "Data", key: false, desc: "Manajer Proyek / Kepala Divisi" },
      { name: "approver_3_role", type: "Data", key: false, desc: "Legal Officer" },
      { name: "approver_4_role", type: "Data", key: false, desc: "Direktur Teknik" },
      { name: "approver_5_role", type: "Data", key: false, desc: "Direktur Utama (untuk nilai tertinggi)" },
      { name: "sla_days_per_approver", type: "Int", key: false, desc: "Maksimum hari per approver (SLA review)" },
      { name: "signatory_role", type: "Data", key: false, desc: "Siapa yang berwenang tandatangan akhir" },
    ]
  },
  {
    name: "Approval_Log",
    label: "Approval Log",
    color: "#fbbf24",
    icon: "📋",
    type: "Child of Contract_Document",
    desc: "Jejak audit lengkap setiap langkah approval — siapa, kapan, dan keputusan apa",
    fields: [
      { name: "approval_sequence", type: "Int", key: false, desc: "Urutan approval (1, 2, 3...)" },
      { name: "approver", type: "Link → User", key: false, desc: "" },
      { name: "approver_role", type: "Data", key: false, desc: "Jabatan saat approval" },
      { name: "assigned_date", type: "Datetime", key: false, desc: "Kapan dokumen masuk ke approver ini" },
      { name: "action_date", type: "Datetime", key: false, desc: "Kapan approver mengambil keputusan" },
      { name: "action", type: "Select", key: false, desc: "Approved / Rejected / Delegated / Pending" },
      { name: "comments", type: "Text", key: false, desc: "Catatan / alasan keputusan" },
      { name: "ip_address", type: "Data", key: false, desc: "IP address saat approval (untuk audit)" },
      { name: "is_overdue", type: "Check", key: false, desc: "TRUE jika melewati SLA" },
    ]
  },
  {
    name: "Contract_Obligation",
    label: "Contract Obligation",
    color: "#a3e635",
    icon: "📌",
    type: "Child of Contract_Document",
    desc: "Daftar semua kewajiban yang harus dipenuhi setiap pihak — di-monitor sampai kontrak selesai",
    fields: [
      { name: "obligation_title", type: "Data", key: false, desc: "Serahkan Jaminan Pelaksanaan" },
      { name: "obligation_type", type: "Select", key: false, desc: "Dokumen / Pembayaran / Tindakan / Pelaporan / Milestone" },
      { name: "party_responsible", type: "Select", key: false, desc: "Kontraktor / Owner / Kedua Pihak" },
      { name: "due_date", type: "Date", key: false, desc: "Batas waktu pemenuhan" },
      { name: "recurrence", type: "Select", key: false, desc: "One Time / Monthly / Per Termin / Per Milestone" },
      { name: "status", type: "Select", key: false, desc: "Pending / Fulfilled / Overdue / Waived" },
      { name: "fulfilled_date", type: "Date", key: false, desc: "Tanggal kewajiban dipenuhi" },
      { name: "evidence_doc", type: "Attach", key: false, desc: "Bukti pemenuhan kewajiban" },
      { name: "clause_ref", type: "Data", key: false, desc: "Pasal yang mengatur kewajiban ini" },
      { name: "reminder_days_before", type: "Int", key: false, desc: "Kirim reminder X hari sebelum due date" },
      { name: "escalation_user", type: "Link → User", key: false, desc: "User yang di-eskalasi jika overdue" },
    ]
  },
  {
    name: "Contract_Amendment",
    label: "Contract Amendment (Adendum)",
    color: "#f97316",
    icon: "🔁",
    type: "DocType",
    desc: "Dokumen perubahan resmi dari kontrak yang sudah aktif — harus linked ke kontrak induk",
    fields: [
      { name: "amendment_id", type: "Data", key: true, desc: "ADD-KONT-PRJ-2024-001-A02" },
      { name: "parent_contract", type: "Link → Contract_Document", key: false, desc: "Kontrak yang diamendemen" },
      { name: "amendment_number", type: "Int", key: false, desc: "Adendum ke-N (1, 2, 3...)" },
      { name: "amendment_type", type: "Select", key: false, desc: "Perubahan Nilai / Perubahan Scope / Perpanjangan Waktu / Perubahan Klausul / Kombinasi" },
      { name: "reason", type: "Text", key: false, desc: "Justifikasi perubahan" },
      { name: "change_order_ref", type: "Link → Change_Order", key: false, desc: "CO dari modul RAB yang jadi dasar adendum" },
      { name: "value_before", type: "Currency", key: false, desc: "Nilai kontrak sebelum adendum" },
      { name: "delta_value", type: "Currency", key: false, desc: "Perubahan nilai (+ tambah / - kurang)" },
      { name: "value_after", type: "Currency", key: false, desc: "Nilai kontrak setelah adendum (auto)" },
      { name: "date_before", type: "Date", key: false, desc: "Tanggal selesai sebelum adendum" },
      { name: "extension_days", type: "Int", key: false, desc: "Penambahan waktu (hari)" },
      { name: "date_after", type: "Date", key: false, desc: "Tanggal selesai baru (auto)" },
      { name: "effective_date", type: "Date", key: false, desc: "Tanggal adendum berlaku" },
      { name: "status", type: "Select", key: false, desc: "Draft / Under Approval / Signed / Active" },
      { name: "signed_document", type: "Attach", key: false, desc: "File adendum yang ditandatangani" },
    ]
  },
  {
    name: "Company_Legal_Document",
    label: "Company Legal Document",
    color: "#818cf8",
    icon: "🏛️",
    type: "DocType Master",
    desc: "Semua dokumen legalitas korporat perusahaan dengan tracking kadaluarsa otomatis",
    fields: [
      { name: "legal_doc_id", type: "Data", key: true, desc: "LEGDOC-2024-012" },
      { name: "document_type", type: "Select", key: false, desc: "SIUJK / SBU / SKK / NIB / NPWP / Akta / TDP / ISO / BPJS / Asuransi / Sertifikat Lainnya" },
      { name: "document_number", type: "Data", key: false, desc: "Nomor dokumen resmi" },
      { name: "document_name", type: "Data", key: false, desc: "Nama lengkap dokumen" },
      { name: "issuing_authority", type: "Data", key: false, desc: "LPJK / OSS / Kemenkumham / BPS / BPJS" },
      { name: "qualification_grade", type: "Data", key: false, desc: "Grade / Kualifikasi (misal SBU: B2)" },
      { name: "scope_of_work", type: "Data", key: false, desc: "Lingkup yang dicakup dokumen (misal: Sipil, Mekanikal)" },
      { name: "issued_date", type: "Date", key: false, desc: "" },
      { name: "expiry_date", type: "Date", key: false, desc: "" },
      { name: "days_to_expiry", type: "Int", key: false, desc: "Auto-calc — negatif = sudah expired" },
      { name: "status", type: "Select", key: false, desc: "Valid / Expiring (< 90 hari) / Critical (< 30 hari) / Expired" },
      { name: "pic_renewal", type: "Link → User", key: false, desc: "PIC yang bertanggung jawab perpanjangan" },
      { name: "renewal_cost", type: "Currency", key: false, desc: "Estimasi biaya perpanjangan" },
      { name: "renewal_lead_time", type: "Int", key: false, desc: "Berapa hari proses perpanjangan biasanya" },
      { name: "document_file", type: "Attach", key: false, desc: "File dokumen terbaru" },
      { name: "is_required_for_tender", type: "Check", key: false, desc: "TRUE jika wajib ada saat ikut tender" },
      { name: "notes", type: "Text", key: false, desc: "Catatan penting, persyaratan khusus" },
    ]
  },
  {
    name: "Legal_Doc_History",
    label: "Legal Document History",
    color: "#818cf8",
    icon: "📚",
    type: "Child of Company_Legal_Document",
    desc: "Riwayat semua versi dokumen legalitas — audit trail untuk tender dan akreditasi",
    fields: [
      { name: "version_seq", type: "Int", key: false, desc: "Urutan versi" },
      { name: "document_number", type: "Data", key: false, desc: "Nomor dokumen versi ini" },
      { name: "issued_date", type: "Date", key: false, desc: "" },
      { name: "expiry_date", type: "Date", key: false, desc: "" },
      { name: "document_file", type: "Attach", key: false, desc: "File dokumen versi lama" },
      { name: "notes", type: "Data", key: false, desc: "Catatan versi ini" },
    ]
  },
  {
    name: "Correspondence_Log",
    label: "Correspondence Log (Surat Menyurat)",
    color: "#fb7185",
    icon: "✉️",
    type: "DocType",
    desc: "Log semua surat masuk dan keluar terkait proyek dan kontrak — bukti korespondensi resmi",
    fields: [
      { name: "letter_id", type: "Data", key: true, desc: "SURAT-OUT-2024-0234" },
      { name: "direction", type: "Select", key: false, desc: "Keluar (Outgoing) / Masuk (Incoming)" },
      { name: "letter_type", type: "Select", key: false, desc: "Surat Resmi / Instruksi / Teguran / Klaim / Balasan / Notulen Rapat / BA / Memo" },
      { name: "letter_number", type: "Data", key: false, desc: "Nomor surat resmi" },
      { name: "letter_date", type: "Date", key: false, desc: "Tanggal surat" },
      { name: "subject", type: "Data", key: false, desc: "Perihal surat" },
      { name: "from_party", type: "Data", key: false, desc: "Nama perusahaan / instansi pengirim" },
      { name: "to_party", type: "Data", key: false, desc: "Nama perusahaan / instansi penerima" },
      { name: "project", type: "Link → Project", key: false, desc: "Proyek terkait" },
      { name: "contract_ref", type: "Link → Contract_Document", key: false, desc: "Kontrak yang dirujuk (jika ada)" },
      { name: "summary", type: "Text", key: false, desc: "Ringkasan isi surat" },
      { name: "requires_response", type: "Check", key: false, desc: "TRUE jika surat ini perlu dibalas" },
      { name: "response_due_date", type: "Date", key: false, desc: "Batas waktu membalas" },
      { name: "response_status", type: "Select", key: false, desc: "Not Required / Pending / Replied / Overdue" },
      { name: "linked_response", type: "Link → Correspondence_Log", key: false, desc: "Link ke surat balasan" },
      { name: "document_file", type: "Attach", key: false, desc: "File scan / PDF surat" },
      { name: "tags", type: "Table MultiSelect", key: false, desc: "Tag: klaim / teguran / progress / pembayaran" },
    ]
  },
  {
    name: "Claim_Register",
    label: "Claim Register",
    color: "#ef4444",
    icon: "⚖️",
    type: "DocType",
    desc: "Register semua klaim yang sedang berjalan — ke owner maupun dari subkon",
    fields: [
      { name: "claim_id", type: "Data", key: true, desc: "CLAIM-2024-007" },
      { name: "claim_direction", type: "Select", key: false, desc: "Kami ke Owner / Subkon ke Kami / Kami ke Subkon" },
      { name: "contract_ref", type: "Link → Contract_Document", key: false, desc: "Kontrak yang jadi dasar klaim" },
      { name: "project", type: "Link → Project", key: false, desc: "" },
      { name: "claim_type", type: "Select", key: false, desc: "Pembayaran Terlambat / Pekerjaan Tambah / Perpanjangan Waktu / Kerusakan / Force Majeure / Denda" },
      { name: "claim_basis_clauses", type: "Text", key: false, desc: "Pasal-pasal kontrak yang jadi dasar klaim" },
      { name: "claim_description", type: "Text", key: false, desc: "Deskripsi lengkap klaim" },
      { name: "claim_amount", type: "Currency", key: false, desc: "Nilai klaim yang diajukan" },
      { name: "claim_date", type: "Date", key: false, desc: "Tanggal klaim diajukan" },
      { name: "deadline_per_contract", type: "Date", key: false, desc: "Batas waktu pengajuan klaim per kontrak" },
      { name: "supporting_docs", type: "Table", key: false, desc: "List dokumen pendukung klaim" },
      { name: "status", type: "Select", key: false, desc: "Draft / Submitted / Under Negotiation / Mediation / Arbitration / Settled / Rejected / Withdrawn" },
      { name: "settled_amount", type: "Currency", key: false, desc: "Nilai yang disepakati setelah negosiasi" },
      { name: "settlement_date", type: "Date", key: false, desc: "" },
      { name: "assigned_legal", type: "Link → User", key: false, desc: "Legal officer yang handle klaim ini" },
    ]
  },
];

const RELATIONS = [
  { from: "Document_Template", to: "Contract_Document", label: "1 → N", desc: "Satu template dipakai untuk buat banyak kontrak" },
  { from: "Contract_Document", to: "Contract_Version", label: "1 → N", desc: "Satu kontrak punya banyak versi (draft s/d final)" },
  { from: "Contract_Document", to: "Contract_Clause", label: "1 → N", desc: "Satu kontrak punya index banyak pasal penting" },
  { from: "Contract_Document", to: "Approval_Log", label: "1 → N", desc: "Setiap kontrak punya jejak approval lengkap" },
  { from: "Contract_Document", to: "Contract_Obligation", label: "1 → N", desc: "Satu kontrak punya banyak kewajiban yang di-monitor" },
  { from: "Approval_Matrix", to: "Contract_Document", label: "1 → N", desc: "Matriks approval berlaku untuk banyak kontrak" },
  { from: "Contract_Document", to: "Contract_Amendment", label: "1 → N", desc: "Satu kontrak bisa punya banyak adendum" },
  { from: "Contract_Amendment", to: "Contract_Document", label: "→ update", desc: "Adendum auto-update nilai & tanggal di kontrak induk" },
  { from: "RAB_Header", to: "Contract_Amendment", label: "CO ref", desc: "Change Order dari RAB jadi dasar adendum kontrak" },
  { from: "Company_Legal_Document", to: "Legal_Doc_History", label: "1 → N", desc: "Satu dokumen legal punya histori semua versi lama" },
  { from: "Contract_Document", to: "Correspondence_Log", label: "1 → N", desc: "Semua surat menyurat terkait kontrak ter-linked" },
  { from: "Contract_Clause", to: "Claim_Register", label: "ref", desc: "Pasal kontrak jadi basis hukum setiap klaim" },
  { from: "Contract_Document", to: "Claim_Register", label: "1 → N", desc: "Satu kontrak bisa punya beberapa klaim aktif" },
  { from: "Correspondence_Log", to: "Claim_Register", label: "N → N", desc: "Surat korespondensi jadi dokumen pendukung klaim" },
];

const APPROVAL_TIERS = [
  { tier: "Tier 1", range: "< Rp 500 Jt", approvers: ["PM Proyek", "Manajer Proyek"], signatory: "Manajer Proyek", color: "#34d399" },
  { tier: "Tier 2", range: "Rp 500 Jt – 2 M", approvers: ["PM Proyek", "Manajer Proyek", "Legal Officer"], signatory: "Direktur Teknik", color: "#fbbf24" },
  { tier: "Tier 3", range: "Rp 2 M – 10 M", approvers: ["PM Proyek", "Manajer Proyek", "Legal Officer", "Direktur Teknik"], signatory: "Direktur Utama", color: "#f97316" },
  { tier: "Tier 4", range: "> Rp 10 M", approvers: ["PM Proyek", "Manajer Proyek", "Legal Officer", "Direktur Teknik", "Direktur Utama"], signatory: "Direktur Utama + Komisaris", color: "#ef4444" },
];

const DOC_TYPES = [
  { cat: "Kontrak", items: ["Kontrak Induk dengan Owner", "Kontrak Lump Sum", "Kontrak Unit Price", "Kontrak Subkon Jasa", "Kontrak Subkon Supply & Install", "Kontrak Sewa Alat Berat", "Kontrak Konsultan"] },
  { cat: "Adendum & Perubahan", items: ["Adendum Nilai", "Adendum Waktu", "Adendum Scope", "Change Order / Instruksi Perubahan", "Berita Acara Kesepakatan"] },
  { cat: "Surat Perintah", items: ["SPK (Surat Perintah Kerja)", "SPMK (Surat Perintah Mulai Kerja)", "Surat Instruksi Lapangan", "Surat Teguran", "Surat Peringatan (SP1/SP2/SP3)"] },
  { cat: "Berita Acara", items: ["BA Opname Progress", "BA Serah Terima (PHO)", "BA Selesai Masa Pemeliharaan (FHO)", "BA Rapat", "BA Investigasi"] },
  { cat: "Jaminan & Asuransi", items: ["Jaminan Penawaran (Bid Bond)", "Jaminan Pelaksanaan (Performance Bond)", "Jaminan Uang Muka", "Jaminan Pemeliharaan", "CAR Insurance", "TL Insurance"] },
  { cat: "Legalitas Perusahaan", items: ["SIUJK", "SBU Kualifikasi", "NIB / TDP", "NPWP Perusahaan", "Akta Pendirian & Perubahan", "ISO 9001 / 14001 / 45001", "BPJS Ketenagakerjaan & Kesehatan"] },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const TAG = ({ color, children }) => (
  <span style={{ background: color + "1a", color, border: `1px solid ${color}44`, borderRadius: 3, padding: "1px 6px", fontSize: "0.66rem", fontFamily: MONO, fontWeight: 700, whiteSpace: "nowrap" }}>
    {children}
  </span>
);

export default function DokumenKontrak() {
  const [section, setSection] = useState("flow");
  const [activeStep, setActiveStep] = useState(0);
  const [activeModel, setActiveModel] = useState(0);
  const step = FLOW_STEPS[activeStep];

  return (
    <div style={{ background: "#0a0c10", minHeight: "100vh", color: "#c8d6e5", fontFamily: SERIF }}>

      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(160deg, #12151f 0%, #0a0c10 100%)", borderBottom: "1px solid #1c2535", padding: "2rem 1.5rem 1.6rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 300, height: 300, background: "radial-gradient(circle, #c084fc08 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: "#2e4060", letterSpacing: 6, textTransform: "uppercase", marginBottom: 8 }}>Custom Feature #7 — Deep Dive</div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.4rem, 3vw, 2.1rem)", fontWeight: 400, color: "#f0f4ff", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            Manajemen Dokumen & Kontrak
          </h1>
          <p style={{ color: "#2e4060", margin: "0.6rem 0 0", fontSize: "0.875rem", fontFamily: MONO }}>
            Template · Versioning · Approval Workflow · Kewajiban · Adendum · Klaim · Perizinan · Arsip
          </p>
        </div>
      </div>

      {/* ── NAV ── */}
      <div style={{ borderBottom: "1px solid #1c2535", background: "#0a0c10", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 1.5rem", display: "flex", overflowX: "auto" }}>
          {[
            { key: "flow", label: "🔄 Alur & Cara Kerja" },
            { key: "model", label: "🗄️ Model Data" },
            { key: "matrix", label: "🏛️ Approval Matrix" },
            { key: "doclib", label: "📚 Library Dokumen" },
            { key: "relation", label: "🔗 Relasi Tabel" },
          ].map(n => (
            <button key={n.key} onClick={() => setSection(n.key)}
              style={{ padding: "0.85rem 1.05rem", background: "none", border: "none", borderBottom: section === n.key ? "2px solid #c084fc" : "2px solid transparent", color: section === n.key ? "#c084fc" : "#2e4060", fontFamily: SERIF, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.2s" }}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "1.5rem" }}>

        {/* ── FLOW ── */}
        {section === "flow" && (
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {FLOW_STEPS.map((s, i) => (
                <button key={i} onClick={() => setActiveStep(i)}
                  style={{ textAlign: "left", padding: "0.6rem 0.8rem", background: activeStep === i ? s.color + "15" : "#12151f", border: `1px solid ${activeStep === i ? s.color + "80" : "#1c2535"}`, borderRadius: 7, cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    <span style={{ fontSize: 14 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: "0.57rem", color: activeStep === i ? s.color : "#2e4060", letterSpacing: 2 }}>FASE {s.id}</div>
                      <div style={{ color: activeStep === i ? "#f0f4ff" : "#4a6080", fontSize: "0.74rem", fontWeight: 700, lineHeight: 1.3 }}>{s.title}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ background: "#12151f", border: `1px solid ${step.color}35`, borderRadius: 12, padding: "1.4rem", borderTop: `3px solid ${step.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.7rem" }}>
                <span style={{ fontSize: 24 }}>{step.icon}</span>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: step.color, letterSpacing: 3 }}>FASE {step.id} · {step.phase}</div>
                  <h2 style={{ margin: 0, color: "#f0f4ff", fontSize: "1rem", fontWeight: 700 }}>{step.title}</h2>
                </div>
              </div>
              <div style={{ marginBottom: "0.8rem" }}><TAG color={step.color}>{step.actor}</TAG></div>
              <p style={{ color: "#6a8aaa", fontSize: "0.84rem", lineHeight: 1.75, margin: "0 0 1rem" }}>{step.desc}</p>
              <div style={{ fontFamily: MONO, fontSize: "0.58rem", color: "#2e4060", letterSpacing: 2, marginBottom: 7, textTransform: "uppercase" }}>Detail Proses:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: "1rem" }}>
                {step.actions.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "0.5rem 0.75rem", background: "#0a0c10", borderRadius: 6, borderLeft: `2px solid ${step.color}45` }}>
                    <span style={{ color: step.color, fontFamily: MONO, fontSize: "0.64rem", minWidth: 18, paddingTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ color: "#6a8aaa", fontSize: "0.82rem", lineHeight: 1.65 }}>{a}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: step.color + "10", border: `1px solid ${step.color}28`, borderRadius: 8, padding: "0.65rem 0.9rem", marginBottom: step.warning ? "0.7rem" : 0 }}>
                <span style={{ fontFamily: MONO, fontSize: "0.58rem", color: step.color, letterSpacing: 2 }}>OUTPUT → </span>
                <span style={{ color: "#dde8f5", fontSize: "0.82rem" }}>{step.output}</span>
              </div>
              {step.warning && (
                <div style={{ background: "#f59e0b0c", border: "1px solid #f59e0b28", borderRadius: 8, padding: "0.65rem 0.9rem", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ paddingTop: 2 }}>⚠️</span>
                  <span style={{ color: "#fcd34d", fontSize: "0.79rem", lineHeight: 1.6 }}>{step.warning}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODEL ── */}
        {section === "model" && (
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {DATA_MODELS.map((m, i) => (
                <button key={i} onClick={() => setActiveModel(i)}
                  style={{ textAlign: "left", padding: "0.58rem 0.75rem", background: activeModel === i ? m.color + "15" : "#12151f", border: `1px solid ${activeModel === i ? m.color + "80" : "#1c2535"}`, borderRadius: 7, cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 13 }}>{m.icon}</span>
                    <div>
                      <div style={{ color: activeModel === i ? "#f0f4ff" : "#4a6080", fontSize: "0.72rem", fontWeight: 700 }}>{m.label}</div>
                      <div style={{ fontFamily: MONO, fontSize: "0.56rem", color: activeModel === i ? m.color : "#2e4060" }}>{m.type}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {(() => {
              const m = DATA_MODELS[activeModel];
              return (
                <div style={{ background: "#12151f", border: `1px solid ${m.color}35`, borderRadius: 12, padding: "1.2rem", borderTop: `3px solid ${m.color}` }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 18 }}>{m.icon}</span>
                    <span style={{ color: "#f0f4ff", fontWeight: 700, fontSize: "0.98rem" }}>{m.label}</span>
                    <TAG color={m.color}>{m.type}</TAG>
                    <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: "0.6rem", color: "#2e4060" }}>{m.fields.length} fields</span>
                  </div>
                  <p style={{ color: "#3a5570", margin: "0 0 0.9rem", fontSize: "0.77rem" }}>{m.desc}</p>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.74rem" }}>
                      <thead>
                        <tr style={{ background: "#0a0c10" }}>
                          {["Field Name", "Type", "Keterangan"].map(h => (
                            <th key={h} style={{ padding: "0.42rem 0.65rem", textAlign: "left", color: "#2e4060", fontFamily: MONO, fontSize: "0.58rem", letterSpacing: 2, borderBottom: "1px solid #1c2535", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {m.fields.map((f, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #0f1318", background: f.key ? m.color + "08" : "transparent" }}>
                            <td style={{ padding: "0.42rem 0.65rem", fontFamily: MONO, color: f.key ? m.color : "#6a8aaa", fontSize: "0.69rem", whiteSpace: "nowrap" }}>{f.key && "🔑 "}{f.name}</td>
                            <td style={{ padding: "0.42rem 0.65rem", whiteSpace: "nowrap" }}>
                              <TAG color={
                                f.type.startsWith("Link") ? "#38bdf8" :
                                f.type === "Currency" ? "#34d399" :
                                f.type === "Select" ? "#c084fc" :
                                f.type === "Date" || f.type === "Datetime" ? "#fbbf24" :
                                f.type.startsWith("Attach") ? "#f97316" :
                                f.type === "Check" ? "#fb7185" :
                                f.type === "Percent" ? "#818cf8" :
                                f.type === "Text Editor" ? "#a3e635" :
                                "#4a6080"
                              }>{f.type}</TAG>
                            </td>
                            <td style={{ padding: "0.42rem 0.65rem", color: "#3a5570", fontSize: "0.7rem" }}>{f.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── APPROVAL MATRIX ── */}
        {section === "matrix" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#12151f", border: "1px solid #1c2535", borderRadius: 12, padding: "1.3rem" }}>
              <div style={{ fontFamily: MONO, fontSize: "0.58rem", color: "#2e4060", letterSpacing: 3, marginBottom: "1.1rem", textTransform: "uppercase" }}>🏛️ Matriks Otorisasi Kontrak (Sesuai SKO Perusahaan)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {APPROVAL_TIERS.map((t, i) => (
                  <div key={i} style={{ background: "#0a0c10", borderRadius: 10, padding: "1rem 1.2rem", borderLeft: `4px solid ${t.color}` }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: "0.7rem", flexWrap: "wrap" }}>
                      <TAG color={t.color}>{t.tier}</TAG>
                      <span style={{ color: t.color, fontWeight: 700, fontSize: "0.88rem" }}>{t.range}</span>
                      <span style={{ marginLeft: "auto", color: "#3a5570", fontSize: "0.75rem" }}>Penandatangan: <span style={{ color: "#f0f4ff" }}>{t.signatory}</span></span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {t.approvers.map((a, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: t.color + "20", border: `1px solid ${t.color}60`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: "0.6rem", color: t.color }}>{j + 1}</div>
                          <span style={{ color: "#6a8aaa", fontSize: "0.78rem" }}>{a}</span>
                          {j < t.approvers.length - 1 && <span style={{ color: "#2e4060", fontSize: "0.8rem" }}>→</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA */}
            <div style={{ background: "#12151f", border: "1px solid #1c2535", borderRadius: 12, padding: "1.3rem" }}>
              <div style={{ fontFamily: MONO, fontSize: "0.58rem", color: "#2e4060", letterSpacing: 3, marginBottom: "0.9rem", textTransform: "uppercase" }}>⏱️ SLA Approval & Mekanisme Eskalasi</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                {[
                  { label: "SLA per Approver", val: "3 hari kerja", desc: "Setiap approver wajib respond dalam 3 hari kerja setelah dokumen masuk ke queue-nya", color: "#38bdf8" },
                  { label: "Eskalasi Hari ke-4", val: "Auto-reminder", desc: "Jika hari ke-4 belum ada action, sistem kirim reminder email ke approver", color: "#fbbf24" },
                  { label: "Eskalasi Hari ke-6", val: "Notif ke Atasan", desc: "Hari ke-6 tidak ada action → notifikasi otomatis ke atasan approver", color: "#f97316" },
                  { label: "Delegate Option", val: "Bisa didelegasikan", desc: "Approver bisa delegasikan ke pengganti (acting) selama cuti/berhalangan", color: "#c084fc" },
                  { label: "Parallel Approval", val: "Tersedia", desc: "Beberapa approver di level yang sama bisa approve paralel untuk mempercepat proses", color: "#34d399" },
                  { label: "Audit Trail", val: "Lengkap", desc: "Setiap aksi tersimpan: siapa, kapan, dari mana — tidak bisa dihapus", color: "#fb7185" },
                ].map((c, i) => (
                  <div key={i} style={{ background: "#0a0c10", borderRadius: 8, padding: "0.9rem", borderLeft: `3px solid ${c.color}` }}>
                    <div style={{ color: c.color, fontWeight: 700, fontSize: "0.8rem", marginBottom: 3 }}>{c.label}</div>
                    <div style={{ fontFamily: MONO, fontSize: "0.72rem", color: "#f0f4ff", marginBottom: 5 }}>{c.val}</div>
                    <div style={{ color: "#3a5570", fontSize: "0.73rem", lineHeight: 1.5 }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── DOC LIBRARY ── */}
        {section === "doclib" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#12151f", border: "1px solid #1c2535", borderRadius: 12, padding: "1.3rem" }}>
              <div style={{ fontFamily: MONO, fontSize: "0.58rem", color: "#2e4060", letterSpacing: 3, marginBottom: "1.1rem", textTransform: "uppercase" }}>📚 Library Jenis Dokumen yang Harus Dikelola</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                {DOC_TYPES.map((cat, i) => {
                  const colors = ["#c084fc", "#38bdf8", "#34d399", "#fbbf24", "#f97316", "#818cf8"];
                  const c = colors[i % colors.length];
                  return (
                    <div key={i} style={{ background: "#0a0c10", borderRadius: 9, padding: "0.9rem 1rem", borderTop: `3px solid ${c}` }}>
                      <div style={{ color: c, fontWeight: 700, fontSize: "0.82rem", marginBottom: 8 }}>{cat.cat}</div>
                      {cat.items.map((item, j) => (
                        <div key={j} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 5 }}>
                          <span style={{ color: c, fontSize: "0.6rem", paddingTop: 4 }}>▸</span>
                          <span style={{ color: "#6a8aaa", fontSize: "0.77rem", lineHeight: 1.5 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ background: "#12151f", border: "1px solid #1c2535", borderRadius: 12, padding: "1.3rem" }}>
              <div style={{ fontFamily: MONO, fontSize: "0.58rem", color: "#2e4060", letterSpacing: 3, marginBottom: "0.9rem", textTransform: "uppercase" }}>🔔 Alert & Notifikasi Otomatis yang Harus Dibangun</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { trigger: "Kontrak hampir expired (H-30, H-14, H-7)", action: "Notifikasi ke PM + Admin Kontrak untuk inisiasi perpanjangan atau penutupan kontrak", color: "#fbbf24", severity: "HIGH" },
                  { trigger: "Dokumen legal perusahaan (SIUJK, SBU, dll) hampir expired", action: "Alert ke PIC Renewal dengan estimasi waktu proses dan biaya perpanjangan", color: "#ef4444", severity: "CRITICAL" },
                  { trigger: "Kewajiban kontrak (obligation) melewati due date", action: "Eskalasi ke PM + Manajer dengan summary kewajiban yang overdue", color: "#f97316", severity: "HIGH" },
                  { trigger: "Approval pending melewati SLA 3 hari", action: "Reminder ke approver, hari ke-6 eskalasi ke atasan approver", color: "#f97316", severity: "MEDIUM" },
                  { trigger: "Kontrak subkon belum ditandatangani tapi subkon sudah mulai kerja", action: "Alert kritis ke PM: risiko hukum tinggi — hentikan pekerjaan atau tandatangani segera", color: "#ef4444", severity: "CRITICAL" },
                  { trigger: "Deadline pengajuan klaim per kontrak mendekati (H-7)", action: "Alert ke Legal + PM: window klaim akan tutup, siapkan dokumen pendukung", color: "#ef4444", severity: "CRITICAL" },
                  { trigger: "Surat masuk membutuhkan balasan dan mendekati deadline", action: "Reminder ke PIC surat H-3 dan H-1 sebelum batas waktu balasan", color: "#38bdf8", severity: "MEDIUM" },
                  { trigger: "Adendum disepakati dan ditandatangani", action: "Auto-update nilai kontrak di modul Finance, RAB, dan Billing", color: "#34d399", severity: "INFO" },
                ].map((a, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, padding: "0.65rem 0.9rem", background: "#0a0c10", borderRadius: 7, borderLeft: `3px solid ${a.color}`, alignItems: "start" }}>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: "0.57rem", color: "#2e4060", marginBottom: 3 }}>TRIGGER</div>
                      <div style={{ color: "#8aaccc", fontSize: "0.77rem", lineHeight: 1.5 }}>{a.trigger}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: "0.57rem", color: "#2e4060", marginBottom: 3 }}>AKSI SISTEM</div>
                      <div style={{ color: "#6a8aaa", fontSize: "0.75rem", lineHeight: 1.5 }}>{a.action}</div>
                    </div>
                    <TAG color={a.color}>{a.severity}</TAG>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RELATION ── */}
        {section === "relation" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#12151f", border: "1px solid #1c2535", borderRadius: 12, padding: "1.3rem" }}>
              <div style={{ fontFamily: MONO, fontSize: "0.58rem", color: "#2e4060", letterSpacing: 3, marginBottom: "1rem", textTransform: "uppercase" }}>🔗 Relasi Antar DocType</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {RELATIONS.map((r, i) => {
                  const fm = DATA_MODELS.find(d => d.name === r.from) || { color: "#4a6080" };
                  const tm = DATA_MODELS.find(d => d.name === r.to) || { color: "#4a6080" };
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.6rem 0.85rem", background: "#0a0c10", borderRadius: 7, flexWrap: "wrap" }}>
                      <span style={{ color: fm.color, fontFamily: MONO, fontSize: "0.69rem", fontWeight: 700, minWidth: 158 }}>{r.from}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 14, height: 1, background: "#1c2535" }} />
                        <TAG color="#4a6080">{r.label}</TAG>
                        <div style={{ width: 14, height: 1, background: "#1c2535" }} />
                      </div>
                      <span style={{ color: tm.color, fontFamily: MONO, fontSize: "0.69rem", fontWeight: 700, minWidth: 158 }}>{r.to}</span>
                      <span style={{ color: "#2e4060", fontSize: "0.74rem", flex: 1 }}>{r.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ background: "#12151f", border: "1px solid #1c2535", borderRadius: 12, padding: "1.3rem" }}>
              <div style={{ fontFamily: MONO, fontSize: "0.58rem", color: "#2e4060", letterSpacing: 3, marginBottom: "0.9rem", textTransform: "uppercase" }}>🔌 Integrasi dengan Modul Lain di ERPNext</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                {[
                  { mod: "RAB & BOQ Builder", color: "#c084fc", detail: "Change Order dari RAB otomatis trigger pembuatan draft Adendum Kontrak" },
                  { mod: "Subcon Management", color: "#38bdf8", detail: "Kontrak Subkon ter-link ke Work Package — update nilai kontrak subkon jika ada adendum" },
                  { mod: "Project Progress", color: "#34d399", detail: "BAO yang di-approve otomatis dijadikan lampiran penagihan termin ke owner" },
                  { mod: "Accounts Receivable", color: "#fbbf24", detail: "Invoice ke owner dibuat berdasarkan nilai yang disetujui di BAO dan kontrak termin" },
                  { mod: "HR & Payroll", color: "#fb7185", detail: "Kontrak kerja karyawan dan SKK dikelola dalam sistem yang sama untuk konsistensi" },
                  { mod: "Asset Management", color: "#f97316", detail: "Kontrak sewa alat berat ter-link ke Asset — tracking periode sewa dan biaya otomatis" },
                ].map((m, i) => (
                  <div key={i} style={{ background: "#0a0c10", borderRadius: 8, padding: "0.85rem", borderLeft: `3px solid ${m.color}` }}>
                    <div style={{ color: m.color, fontWeight: 700, fontSize: "0.8rem", marginBottom: 5 }}>{m.mod}</div>
                    <div style={{ color: "#3a5570", fontSize: "0.74rem", lineHeight: 1.55 }}>{m.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
