import { useState } from "react";

const MONO = "'Courier New', monospace";
const SERIF = "'Georgia', serif";

// ─── DATA ────────────────────────────────────────────────────────────────────

const MODULES = [
  {
    id: "lead", icon: "📡", label: "Lead & Opportunity",
    color: "#818cf8",
    short: "Pipeline proyek & prospek tender",
    desc: "Lead adalah informasi awal tentang proyek yang berpotensi diikuti tender — bisa dari info LPSE, referral klien, atau networking. Opportunity adalah ketika lead sudah dikonfirmasi dan perusahaan memutuskan untuk berpartisipasi. Untuk kontraktor, pipeline tender yang terkelola dengan baik menentukan utilisasi kapasitas perusahaan 3-6 bulan ke depan.",
    howto: [
      { step: "Input setiap informasi proyek sebagai Lead", detail: "CRM → Lead → New. Isi: nama proyek, owner/instansi, estimasi nilai, sumber informasi (LPSE, referral, networking), tanggal info diperoleh. Assign ke Business Development yang bertanggung jawab. Status awal: Open." },
      { step: "Kualifikasi Lead menjadi Opportunity", detail: "Setelah evaluasi awal (apakah proyek sesuai kompetensi, apakah margin cukup, apakah kapasitas tersedia), convert Lead yang qualified: dari Lead → Convert to Opportunity. Lead yang tidak qualified di-mark Closed dengan alasan." },
      { step: "Isi detail Opportunity secara lengkap", detail: "Di Opportunity: isi Opportunity From (Company/Individual), nilai estimasi kontrak, expected closing date (tanggal pengumuman tender), probability (% kemungkinan menang), dan Pipeline Stage." },
      { step: "Assign tim BD dan tentukan Go/No-Go", detail: "Set Sales Person yang handle, tambahkan next activity (site visit, ambil dokumen tender, submit prakualifikasi). Review di rapat BD mingguan: apakah tender ini dilanjutkan atau dilepas (No-Go decision)." },
      { step: "Update stage seiring perkembangan tender", detail: "Update Opportunity Stage secara konsisten: Prospecting → Qualification → Proposal → Negotiation → Won/Lost. Ini yang membentuk Sales Pipeline report dan forecast revenue." },
      { step: "Catat kompetitor yang ikut tender", detail: "Di Opportunity, isi Competitors field dengan nama kontraktor lain yang diketahui ikut tender. Data ini berguna untuk analisis win/loss rate dan strategi penawaran." },
    ],
    config: [
      { field: "Lead Source", value: "Buat master: LPSE Pemerintah, LPSE BUMN, Direct Owner, Referral Internal, Referral Konsultan, Repeat Order, Tender Terbatas" },
      { field: "Opportunity Stage", value: "Buat pipeline stage khas kontraktor: Info Awal → Prakualifikasi → Dokumen Tender → Penawaran Submitted → Evaluasi → Negosiasi → Won / Lost" },
      { field: "Territory", value: "Buat territory per wilayah: Jabodetabek, Jawa Barat, Jawa Tengah, Kalimantan, dll — untuk analisis distribusi proyek per wilayah" },
      { field: "Industry", value: "Kategorikan sektor: Gedung Komersial, Gedung Pemerintah, Infrastruktur Jalan, Minyak & Gas, Industri, Perumahan" },
    ],
    warning: "Opportunity yang tidak diupdate secara berkala membuat pipeline report tidak akurat. Tetapkan SOP: setiap Opportunity harus ada activity update minimal sekali seminggu selama proses tender berlangsung."
  },
  {
    id: "quotation", icon: "📝", label: "Quotation (Penawaran Tender)",
    color: "#f59e0b",
    short: "Dokumen penawaran harga ke owner",
    desc: "Quotation di ERPNext adalah dokumen penawaran formal yang dikirimkan ke owner/klien. Untuk kontraktor, Quotation merepresentasikan dokumen penawaran tender — berisi nilai total penawaran, breakdown pekerjaan, syarat-syarat, dan masa berlaku penawaran. Quotation yang ter-approve akan dikonversi menjadi Sales Order (kontrak).",
    howto: [
      { step: "Buat Quotation dari Opportunity yang Go", detail: "Buka Opportunity yang sudah di-approve Go → Make → Quotation. Data Customer, nilai estimasi, dan referensi opportunity otomatis terbawa. Ini menjaga traceability dari prospect sampai kontrak." },
      { step: "Isi item penawaran sesuai scope BOQ", detail: "Di tabel Items, tambahkan item-item pekerjaan sesuai BOQ yang diminta owner: bisa per divisi pekerjaan (Pekerjaan Struktur, Pekerjaan Arsitektur) atau per item detail sesuai dokumen tender." },
      { step: "Set harga berdasarkan RAB internal", detail: "Harga di Quotation (nilai yang ditawarkan ke owner) = RAB internal + margin. Jangan masukkan RAB detail — hanya nilai total per divisi atau lump sum. RAB detail adalah dokumen internal yang tidak dibagikan ke owner." },
      { step: "Tambahkan Terms & Conditions", detail: "Di tab Terms, isi syarat penawaran: masa berlaku penawaran, syarat pembayaran (DP, termin, retensi), jadwal pelaksanaan, lingkup pekerjaan yang di-include dan di-exclude." },
      { step: "Set validity date dengan hati-hati", detail: "Isi Valid Till date sesuai ketentuan dokumen tender (biasanya 60-90 hari). Setelah tanggal ini, harga penawaran tidak berlaku lagi dan perlu negosiasi ulang jika owner mau melanjutkan." },
      { step: "Submit dan kirim ke owner", detail: "Submit Quotation → cetak PDF → kirim ke owner. ERPNext generate PDF dengan format profesional. Catat nomor surat dan tanggal pengiriman ke sistem sebagai referensi." },
      { step: "Update status setelah pengumuman tender", detail: "Jika menang: Quotation → Make → Sales Order. Jika kalah: update status = Lost, isi Lost Reason (harga terlalu tinggi, kalah teknis, dll). Data lost reason ini sangat berharga untuk evaluasi strategi tender." },
    ],
    config: [
      { field: "Quotation To", value: "Customer (untuk owner yang sudah terdaftar) atau Lead (untuk owner yang belum terdaftar sebagai customer)" },
      { field: "Print Format", value: "Buat custom print format untuk Quotation yang sesuai dengan standar dokumen penawaran konstruksi Indonesia — termasuk kop surat, cap perusahaan, tanda tangan Direktur" },
      { field: "Item Rate", value: "Harga di Quotation adalah harga jual ke owner — berbeda dengan harga di RAB internal. Jangan link langsung ke purchase price list" },
      { field: "Terms Template", value: "Buat Terms & Conditions template standar untuk tender: syarat pembayaran kontrak konstruksi, masa pemeliharaan, retensi, denda keterlambatan" },
    ],
    warning: "Quotation untuk proyek pemerintah (LPSE) memiliki format dan persyaratan khusus yang tidak bisa sepenuhnya diakomodasi oleh format ERPNext standar. Gunakan ERPNext untuk internal tracking — dokumen penawaran formal tetap dibuat di Word/Excel sesuai format yang diminta."
  },
  {
    id: "salesorder", icon: "📋", label: "Sales Order (Kontrak dengan Owner)",
    color: "#34d399",
    short: "Representasi kontrak proyek di sistem",
    desc: "Sales Order di ERPNext adalah representasi kontrak proyek dengan owner. Setelah tender menang dan kontrak ditandatangani, Sales Order dibuat berdasarkan Quotation — ini menjadi induk dari semua penagihan termin (Sales Invoice) ke owner selama proyek berlangsung.",
    howto: [
      { step: "Convert Quotation yang menang menjadi Sales Order", detail: "Buka Quotation yang dimenangkan → Make → Sales Order. Semua data terbawa otomatis. Adjust nilai jika ada negosiasi sebelum penandatanganan kontrak yang mengubah nilai penawaran awal." },
      { step: "Set Payment Schedule sesuai kontrak", detail: "Di Sales Order, buka Payment Schedule → tambahkan baris sesuai termin pembayaran di kontrak: Termin 1 (DP 20%) pada tanggal, Termin 2 (Progress 50%) setelah BAO tertentu, dst. Ini yang menjadi dasar penagihan." },
      { step: "Isi nilai kontrak final secara akurat", detail: "Nilai di Sales Order harus sama persis dengan nilai di dokumen kontrak yang ditandatangani (SP3/SPMK). Ini yang menjadi dasar laporan revenue recognition dan project profitability." },
      { step: "Link ke Project yang sudah dibuat", detail: "Di Sales Order, isi field Project dengan proyek ERPNext yang sesuai. Ini menghubungkan seluruh billing (penagihan) dengan project tracking dan project costing." },
      { step: "Set Delivery Date = tanggal selesai proyek", detail: "Isi Delivery Date dengan tanggal penyelesaian proyek sesuai kontrak. ERPNext akan track apakah Sales Order bisa 'delivered' (proyek selesai) sebelum tanggal ini." },
      { step: "Generate Sales Invoice dari Sales Order per termin", detail: "Saat progress mencapai milestone termin, buka Sales Order → Make → Sales Invoice. Isi % atau amount yang ditagih sesuai BAO yang sudah di-approve owner. Lampirkan dokumen BAO ke invoice." },
      { step: "Monitor Billing Status di Sales Order", detail: "Di Sales Order, tab Billing: tampilkan berapa yang sudah di-invoice, berapa yang sudah dibayar, berapa yang masih outstanding. Overview penagihan proyek dalam satu layar." },
    ],
    config: [
      { field: "Sales Order Type", value: "Untuk kontraktor: set type = Service (bukan Product) karena yang dijual adalah jasa konstruksi, bukan barang" },
      { field: "Project Linking", value: "WAJIB link Sales Order ke Project. Tanpa ini, revenue di Sales Invoice tidak ter-connect ke project profitability report" },
      { field: "Payment Terms Template", value: "Buat template termin bayar khas konstruksi: DP → Progress 1 → Progress 2 → BAST PHO → Retensi. Bisa dipakai ulang untuk kontrak dengan struktur termin yang sama" },
      { field: "Amended From", value: "Saat ada adendum kontrak yang mengubah nilai, buat Sales Order baru dengan referensi ke SO lama — traceable perubahan nilai kontrak dari awal sampai akhir" },
    ],
    warning: "Satu Sales Order = Satu kontrak. Jangan gabungkan dua kontrak berbeda (meskipun dari owner yang sama) dalam satu Sales Order — penagihan dan revenue tracking akan tidak bisa dibedakan."
  },
  {
    id: "sinvoice", icon: "🧾", label: "Sales Invoice (Penagihan Termin)",
    color: "#22d3ee",
    short: "Invoice termin ke owner berdasarkan progress",
    desc: "Sales Invoice adalah tagihan resmi ke owner untuk setiap termin pembayaran. Di konstruksi, invoice dibuat berdasarkan progress aktual yang sudah diverifikasi (BAO). ERPNext otomatis update AR, revenue recognition, dan project billing status setiap kali Sales Invoice di-submit.",
    howto: [
      { step: "Generate dari Sales Order setelah BAO approve", detail: "Sales Order → Make → Sales Invoice. Sistem ambil items dari SO. Adjust amount sesuai nilai BAO yang sudah ditandatangani owner. Jangan invoice lebih dari yang sudah di-BAO — owner akan reject." },
      { step: "Struktur invoice dengan potongan yang benar", detail: "Buat line items terpisah: (+) Nilai Progress Termin ini (bruto dari BAO), (-) Potongan Uang Muka (sesuai % di kontrak), (-) Potongan Retensi 5% (sampai max retensi), (-) PPh 4(2) Final jika dipotong owner. Total = netto yang ditagih." },
      { step: "Lampirkan dokumen pendukung", detail: "Di Sales Invoice, attach: PDF Berita Acara Opname, Foto dokumentasi progress, BAP (Berita Acara Pembayaran) jika ada. Owner/procurement owner akan butuh ini sebelum approve pembayaran." },
      { step: "Set due date yang jelas", detail: "Payment Terms otomatis hitung due date. Konfirmasi bahwa due date ini sesuai dengan ketentuan kontrak — biasanya 14-30 hari kerja setelah invoice diterima owner." },
      { step: "Submit dan kirim ke owner resmi", detail: "Submit Sales Invoice → cetak/kirim PDF ke owner. Catat nomor surat pengantar, tanggal pengiriman, dan nama PIC yang menerima di owner. Ini yang menjadi bukti bahwa invoice sudah diterima." },
      { step: "Follow up pembayaran secara proaktif", detail: "H+7 setelah invoice dikirim: follow up ke Finance owner apakah invoice sudah masuk proses. H+14: konfirmasi jadwal transfer. H+30 (jika belum bayar): eskalasi ke PM untuk koordinasi dengan PM owner." },
    ],
    config: [
      { field: "Include Payment Link", value: "Aktifkan payment link di Sales Invoice agar owner bisa konfirmasi pembayaran langsung dari email — mempercepat proses administrasi" },
      { field: "Revenue Account", value: "Pastikan Income Account di Sales Invoice mengarah ke akun Pendapatan Jasa Konstruksi yang sesuai di CoA — bukan ke akun umum" },
      { field: "Debit To", value: "Set akun Piutang Usaha yang sesuai (Piutang Biasa untuk termin, Piutang Retensi untuk invoice retensi)" },
      { field: "Is Return", detail: "Gunakan untuk credit note jika ada koreksi invoice yang sudah dikirim — jangan delete invoice yang sudah terkirim ke owner" },
    ],
    warning: null
  },
  {
    id: "customer", icon: "🏢", label: "Customer Management (Owner)",
    color: "#f97316",
    short: "Database & riwayat klien/owner proyek",
    desc: "Customer Master di ERPNext adalah database lengkap semua owner/klien perusahaan — pemerintah (kementerian, pemda, BUMN), swasta (developer, pabrik, perusahaan). Customer yang terkelola baik memudahkan repeat order, analisis klien terbaik, dan manajemen piutang.",
    howto: [
      { step: "Daftarkan semua owner/klien sebagai Customer", detail: "Selling → Customer → New. Isi: nama instansi/perusahaan, jenis (Company/Government), NPWP, alamat, PIC dari owner (nama, jabatan, email, HP). Lengkapi profil customer sebelum buat Quotation atau Sales Order." },
      { step: "Kategorikan Customer dengan Customer Group", detail: "Buat Customer Group: Pemerintah Pusat / Pemerintah Daerah / BUMN / Swasta Nasional / Swasta Multinasional / Pengembang Properti. Segmentasi ini penting untuk analisis dan strategi bisnis." },
      { step: "Catat riwayat kontrak dan nilai proyek", detail: "Di Customer, tab Sales Order: terlihat semua proyek yang pernah dikerjakan untuk customer ini, nilai kontraknya, dan statusnya. Informasi berharga saat mempersiapkan repeat order atau referensi." },
      { step: "Set Credit Terms dan Credit Limit", detail: "Berdasarkan track record pembayaran customer, set Payment Terms default dan Credit Limit (batas maksimal piutang outstanding). Customer yang sering terlambat bayar → credit limit lebih ketat." },
      { step: "Catat kontak PIC yang lengkap", detail: "Tambahkan multiple Contacts per Customer: PIC Procurement (untuk urusan tender), PIC Teknis (untuk urusan pekerjaan), PIC Finance (untuk urusan pembayaran). Setiap kontak punya email dan HP." },
      { step: "Assign Sales Person dan Territory", detail: "Di Customer, assign Sales Person yang bertanggung jawab untuk maintain hubungan dengan customer ini. Territory memudahkan manajemen tim BD per wilayah." },
    ],
    config: [
      { field: "Customer Type", value: "Company untuk instansi/perusahaan, Individual untuk kontrak personal (sangat jarang di konstruksi)" },
      { field: "Customer Group", value: "Segmentasi yang benar memungkinkan analisis revenue per segment klien dan strategi fokus pada segment yang paling profitable" },
      { field: "Default Payment Terms", value: "Set terms sesuai pola pembayaran customer — pemerintah biasanya Net 30-45, swasta bisa lebih cepat atau lebih lambat tergantung cash flow mereka" },
      { field: "NPWP / NIK", value: "Wajib untuk kebutuhan pelaporan pajak — PPh 4(2) final jasa konstruksi dilaporkan berdasarkan data customer" },
    ],
    warning: null
  },
  {
    id: "subconout", icon: "🔀", label: "Subkon Keluar via CRM/Sales",
    color: "#ec4899",
    short: "Mengelola kontrak ke subkontraktor keluar",
    desc: "Menariknya, ketika perusahaan kontraktor bertindak sebagai subkontraktor (bekerja untuk kontraktor utama/main contractor), alurnya MIRIP dengan CRM Sales — perusahaan kita adalah 'supplier jasa' bagi main contractor. Sementara untuk subkon yang kita keluarkan ke sub-subkontraktor, ini menggunakan modul Procurement. Panduan ini menjelaskan keduanya.",
    howto: [
      { step: "Skenario A: Perusahaan kita SEBAGAI subkon", detail: "Jika kita mengerjakan proyek sebagai subkon dari main contractor: main contractor = Customer kita. Alurnya sama persis dengan CRM regular: Opportunity → Quotation → Sales Order (SPK dari main con) → Sales Invoice (tagihan progress ke main con)." },
      { step: "Buat Customer khusus untuk Main Contractor", detail: "Daftarkan main contractor sebagai Customer di ERPNext. Buat Sales Order berdasarkan SPK yang diterima. Setiap tagihan progress ke main contractor dibuat sebagai Sales Invoice." },
      { step: "Skenario B: Kita MENGELUARKAN subkon", detail: "Untuk pekerjaan yang di-subkonkan ke pihak lain: ini masuk ke modul Procurement — subkontraktor = Supplier kita. Alur: MR → RFQ ke subkon → Supplier Quotation → Purchase Order (SPK ke subkon) → Purchase Receipt (berdasarkan BAO subkon) → Purchase Invoice (tagihan subkon ke kita)." },
      { step: "Daftarkan Subkontraktor sebagai Supplier", detail: "Buying → Supplier → New. Isi data lengkap subkontraktor: nama perusahaan, SIUJK, SBU, NPWP, PIC, rekening bank, syarat pembayaran default. Kategorikan: Subkontraktor Struktur / Subkon ME / Subkon Finishing / dll." },
      { step: "Buat Purchase Order (SPK) ke Subkontraktor", detail: "Saat memilih subkon untuk paket pekerjaan tertentu: buat Purchase Order dengan item = nama paket pekerjaan, qty = 1, rate = nilai SPK, link ke Project. Ini adalah SPK (Surat Perintah Kerja) dalam sistem." },
      { step: "Proses tagihan subkon via Purchase Invoice", detail: "Setelah BAO subkon diapprove: subkon kirim invoice → buat Purchase Invoice dari PO → isi amount sesuai nilai BAO subkon → apply potongan retensi dan DP → submit → hutang subkon tercatat di AP." },
    ],
    config: [
      { field: "Subkon sebagai Supplier", value: "Set Supplier Group = Subkontraktor. Ini memisahkan hutang subkon dari hutang material supplier di AP Aging dan laporan keuangan" },
      { field: "SPK Item Setup", value: "Buat Item Master untuk setiap jenis paket subkon: 'Jasa Subkon Struktur', 'Jasa Subkon ME', 'Jasa Subkon Finishing' — enable Is Service Item = Yes" },
      { field: "Retensi Subkon di PO", value: "Tambahkan baris potongan retensi 5% di Purchase Order sebagai line item negatif, atau handle via Journal Entry setiap kali bayar tagihan subkon" },
      { field: "Link PO ke Project", value: "WAJIB link Purchase Order subkon ke Project yang sesuai. Biaya subkon masuk ke HPP Subkontraktor di project costing" },
    ],
    warning: "Untuk kontrak subkon keluar yang nilainya besar, pertimbangkan custom module Subkontraktor (Custom Feature #2 dalam blueprint) yang lebih powerful dibandingkan menggunakan Purchase Order biasa. PO standard tidak punya fitur: tracking retensi otomatis, scoring performance subkon, atau manajemen multiple BAO per kontrak."
  },
  {
    id: "activity", icon: "📅", label: "CRM Activity & Follow-Up",
    color: "#a78bfa",
    short: "Tracking komunikasi & jadwal BD",
    desc: "CRM Activity mencatat semua interaksi tim Business Development dengan owner — meeting, phone call, site visit, presentasi, pengiriman dokumen. Ini memastikan tidak ada follow-up yang terlewat dan riwayat komunikasi terdokumentasi dengan baik.",
    howto: [
      { step: "Catat setiap interaksi dengan owner", detail: "CRM → Activity → New (atau dari dalam Lead/Opportunity, tambah Activity). Isi: tanggal, tipe aktivitas (Call/Meeting/Email/Site Visit), summary hasil, next action, due date next action." },
      { step: "Buat To-Do list dari Activity", detail: "Setiap Activity yang punya next action → set sebagai To-Do yang assign ke PIC tertentu dengan due date. Sistem kirim notifikasi saat due date tiba — tidak ada follow-up yang terlupa." },
      { step: "Track semua dokumen yang dikirim/diterima", detail: "Di Activity, lampirkan dokumen yang dikirimkan: undangan, penawaran, presentasi, surat. Semua dokumen komunikasi tersimpan di sistem dan bisa dicari kapan saja." },
      { step: "Review Activity timeline sebelum meeting", detail: "Sebelum meeting dengan owner, buka Opportunity dan lihat semua Activity history — siapa yang terakhir kontak, apa yang dibicarakan, apa yang dijanjikan. Ini membuat tim BD selalu siap dan konsisten." },
    ],
    config: [
      { field: "Activity Type", value: "Buat master: Site Visit, Client Meeting, Proposal Presentation, Tender Briefing, Negosiasi, Follow-up Pembayaran, Courtesy Visit" },
      { field: "Lead Source Tracking", value: "Setiap activity harus ter-link ke Lead atau Opportunity — jangan buat activity orphan yang tidak ter-associate ke deal apapun" },
    ],
    warning: null
  },
  {
    id: "salesperson", icon: "👥", label: "Sales Person & Target",
    color: "#84cc16",
    short: "Tim BD, target, dan komisi",
    desc: "ERPNext memungkinkan setup Sales Person (tim Business Development), penetapan target penjualan (target nilai kontrak yang di-close), dan tracking komisi. Untuk kontraktor, ini berguna untuk manajemen kinerja tim BD dan melihat kontribusi tiap orang terhadap revenue perusahaan.",
    howto: [
      { step: "Daftarkan tim BD sebagai Sales Person", detail: "Selling → Sales Person → New. Isi nama, parent (struktur tim: Sales Manager → Sales Executive), Employee (link ke HR jika karyawan). Set Is Active = Yes." },
      { step: "Set Sales Target per periode", detail: "Di Sales Person → Sales Target: tambahkan target per tahun/kuartal: Target Amount (nilai kontrak yang harus di-close), Target Qty (jumlah proyek), Base Target Currency. Review pencapaian di Sales Person Target Variance report." },
      { step: "Assign Sales Person ke Customer dan Opportunity", detail: "Di setiap Customer dan Opportunity, assign Sales Person yang bertanggung jawab. Ini yang menentukan siapa yang di-credit atas deal yang closed." },
      { step: "Setup komisi (opsional)", detail: "Di Sales Person, isi Commission Rate (%). ERPNext otomatis hitung komisi berdasarkan nilai Sales Invoice yang ter-link ke sales person tersebut. Berguna jika perusahaan punya sistem insentif untuk BD." },
    ],
    config: [
      { field: "Sales Team", value: "Buat hierarki: Chief BD → Regional Manager → BD Executive per wilayah. Ini memungkinkan roll-up reporting dari bawah ke atas" },
      { field: "Target Setting", value: "Set target realistis berdasarkan pipeline yang ada dan kapasitas eksekusi perusahaan — target yang terlalu tinggi tanpa basis akan merusak moral tim" },
    ],
    warning: null
  },
];

const TENDER_FLOW = [
  { no: "01", phase: "Identifikasi Proyek", doc: "Lead", color: "#818cf8", who: "BD / Marketing", detail: "Monitor LPSE, info pasar, referral. Input semua potensi proyek sebagai Lead di CRM." },
  { no: "02", phase: "Go / No-Go Decision", doc: "Opportunity", color: "#818cf8", who: "Direktur + BD", detail: "Evaluasi: apakah proyek sesuai kompetensi, margin cukup, kapasitas tersedia, risiko acceptable." },
  { no: "03", phase: "Prakualifikasi (PQ)", doc: "Activity Log", color: "#a78bfa", who: "BD + Legal", detail: "Submit dokumen PQ ke owner. Catat semua dokumen yang dikirim di CRM Activity." },
  { no: "04", phase: "Ambil & Pelajari Dokumen Tender", doc: "Activity Log", color: "#a78bfa", who: "Estimasi + Teknis", detail: "Download dokumen tender dari LPSE. Pelajari scope, spesifikasi, syarat kontrak." },
  { no: "05", phase: "Hitung RAB & Estimasi Internal", doc: "RAB (Custom Module)", color: "#f59e0b", who: "Estimator + PM", detail: "Hitung RAB detail internal menggunakan Custom Module RAB Builder. Ini dokumen rahasia." },
  { no: "06", phase: "Susun Dokumen Penawaran", doc: "Quotation", color: "#f59e0b", who: "BD + Estimasi", detail: "Buat Quotation di ERPNext sebagai tracking internal. Dokumen penawaran formal di Word/PDF sesuai format tender." },
  { no: "07", phase: "Submit Penawaran ke Owner", doc: "Quotation Submitted", color: "#34d399", who: "BD / Direktur", detail: "Kirim dokumen penawaran sebelum batas waktu. Update status Quotation = Submitted." },
  { no: "08", phase: "Evaluasi oleh Owner / Panitia", doc: "Opportunity: Evaluation", color: "#34d399", who: "Menunggu", detail: "Update Opportunity Stage = Under Evaluation. Pantau pengumuman hasil evaluasi di LPSE atau notifikasi dari owner." },
  { no: "09", phase: "Negosiasi Harga & Kontrak", doc: "Quotation Rev", color: "#22d3ee", who: "Direktur + BD", detail: "Jika ada klarifikasi atau negosiasi: buat revisi Quotation dengan harga yang dinego. Catat semua perubahan." },
  { no: "10", phase: "Penandatanganan Kontrak", doc: "Sales Order", color: "#22d3ee", who: "Direktur", detail: "Setelah kontrak ditandatangani: convert Quotation → Sales Order. Nilai SO = nilai kontrak yang sudah ditandatangani." },
  { no: "11", phase: "SPMK & Mobilisasi", doc: "Project Created", color: "#f97316", who: "PM + Logistik", detail: "Sales Order ter-link ke Project. Proyek mulai berjalan. Termin billing dan schedule sudah set di SO." },
  { no: "12", phase: "Penagihan Termin (Billing)", doc: "Sales Invoice", color: "#f97316", who: "Finance + PM", detail: "Setiap milestone progress: SO → Make Sales Invoice. Lampirkan BAO. Submit → piutang tercatat di AR." },
];

const SUBCON_FLOW = [
  { no: "01", phase: "Identifikasi Paket Subkon", doc: "WBS / RAB Review", color: "#ec4899", who: "PM + Estimator", detail: "Dari RAB, identifikasi pekerjaan yang akan di-subkon. Tentukan scope, nilai budget subkon per paket." },
  { no: "02", phase: "Seleksi Kandidat Subkon", doc: "Supplier List", color: "#ec4899", who: "Procurement", detail: "Pilih minimal 3 subkon dari vendor master yang qualified untuk paket tersebut. Cek SIUJK, SBU, track record." },
  { no: "03", phase: "Undang Penawaran (RFQ)", doc: "Request for Quotation", color: "#f97316", who: "Procurement", detail: "Kirim RFQ ke subkon yang dipilih: kirimkan BOQ paket pekerjaan, spesifikasi teknis, dan batas waktu penawaran." },
  { no: "04", phase: "Evaluasi Penawaran Subkon", doc: "Supplier Quotation Comparison", color: "#f97316", who: "PM + Procurement", detail: "Bandingkan penawaran: harga, schedule, metode kerja, referensi proyek sejenis. Pilih subkon terbaik." },
  { no: "05", phase: "Negosiasi & Persetujuan", doc: "Internal Approval", color: "#fbbf24", who: "PM + Direktur", detail: "Negosiasi nilai dan syarat kontrak. Dapatkan persetujuan Direktur untuk nilai di atas threshold." },
  { no: "06", phase: "Terbitkan SPK (Purchase Order)", doc: "Purchase Order", color: "#fbbf24", who: "Procurement", detail: "Buat PO di ERPNext sebagai SPK: item = paket pekerjaan, nilai = nilai kontrak subkon, link ke Project." },
  { no: "07", phase: "Mobilisasi & Pelaksanaan", doc: "Activity / Progress", color: "#34d399", who: "PM / Site", detail: "Subkon mulai bekerja. Monitor progress via custom Progress module. Setiap minggu evaluasi output subkon." },
  { no: "08", phase: "Opname & BAO Subkon", doc: "Purchase Receipt (BAO)", color: "#34d399", who: "PM + QC", detail: "Setelah verifikasi volume pekerjaan subkon: buat Purchase Receipt dari PO sebagai bukti 'barang/jasa diterima'." },
  { no: "09", phase: "Terima & Verifikasi Invoice Subkon", doc: "Purchase Invoice", color: "#22d3ee", who: "Finance + PM", detail: "Subkon kirim invoice → buat PI dari Purchase Receipt → apply potongan: DP, Retensi, Denda jika ada." },
  { no: "10", phase: "Pembayaran Termin Subkon", doc: "Payment Entry", color: "#22d3ee", who: "Finance", detail: "Proses pembayaran setelah disetujui PM → Payment Entry → transfer ke rekening subkon → hutang berkurang." },
];

const REPORTS = [
  { name: "Sales Pipeline (Opportunity)", path: "CRM → Reports → Opportunity Summary", color: "#818cf8", freq: "Mingguan", use: "Tampilkan semua opportunity yang sedang berjalan: nama proyek, nilai estimasi, stage, probability, expected close date. Ini pipeline visual revenue perusahaan 3-6 bulan ke depan.", benefit: "BD dan Direktur bisa lihat berapa total nilai proyek yang sedang 'in pipeline' dan memproyeksikan revenue yang akan datang." },
  { name: "Quotation Trends", path: "Selling → Reports → Quotation Trends", color: "#f59e0b", freq: "Bulanan", use: "Analisis tren penawaran: berapa Quotation yang dibuat per bulan, berapa yang won, berapa yang lost. Breakdown per customer segment atau per wilayah.", benefit: "Evaluasi win rate tender — jika win rate di bawah 20%, strategi penawaran atau segmentasi target tender perlu dievaluasi ulang." },
  { name: "Sales Order Summary", path: "Selling → Reports → Sales Order Summary", color: "#34d399", freq: "Bulanan", use: "Rekap semua kontrak aktif: nilai kontrak, yang sudah di-invoice, yang sudah dibayar, yang masih outstanding. Filter per proyek atau per customer.", benefit: "CFO dan Direktur tahu total nilai kontrak di backlog perusahaan — kontrak yang sudah di-tanda tangan tapi belum selesai di-execute." },
  { name: "Sales Invoice Trends", path: "Selling → Reports → Sales Invoice Trends", color: "#22d3ee", freq: "Bulanan", use: "Tren nilai invoice yang diterbitkan per bulan. Bandingkan dengan target revenue bulanan. Identifikasi bulan dengan billing rendah.", benefit: "Jika ada bulan dengan billing sangat rendah, perlu dicek apakah ada progress BAO yang terlambat atau invoicing yang belum dilakukan." },
  { name: "Accounts Receivable Aging", path: "Accounting → Accounts Receivable Summary", color: "#f97316", freq: "Mingguan", use: "Piutang per customer aging. Identifikasi owner yang terlambat bayar. Dasar untuk collection action dan eskalasi.", benefit: "Setiap Rp 1 piutang yang terlambat = biaya bunga yang ditanggung perusahaan. Koleksi yang agresif langsung berdampak ke cash flow." },
  { name: "Lost Opportunity Analysis", path: "CRM → Reports → Lost Opportunity Analysis", color: "#ef4444", freq: "Bulanan", use: "Analisis semua tender yang kalah: alasan kalah (harga, teknis, relasi), nilai yang hilang, siapa pemenangnya. Breakdown per segment dan wilayah.", benefit: "Insight paling berharga untuk perbaikan strategi tender. Jika 70% kalah karena harga, review proses estimasi. Jika 70% kalah karena teknis, review kapabilitas." },
  { name: "Customer Acquisition & Retention", path: "Selling → Reports → Customer Acquisition and Loyalty", color: "#a78bfa", freq: "Kuartalan", use: "Berapa customer baru yang didapat per periode, berapa customer lama yang repeat order. Analisis retensi dan loyalitas klien.", benefit: "Repeat order dari customer lama cost of acquisition-nya jauh lebih murah dari customer baru. Monitor ini untuk prioritaskan account management." },
  { name: "Sales Person Performance", path: "Selling → Reports → Sales Person-wise Transaction Summary", color: "#84cc16", freq: "Bulanan", use: "Kinerja setiap Sales Person/BD: total nilai Quotation yang dibuat, nilai SO yang closed, win rate, vs target yang ditetapkan.", benefit: "Basis evaluasi kinerja dan insentif tim BD. BD yang performanya rendah perlu coaching atau redistribusi territory." },
  { name: "Territory-wise Sales", path: "Selling → Reports → Territory-wise Sales", color: "#38bdf8", freq: "Kuartalan", use: "Distribusi penjualan per wilayah/territory. Identifikasi wilayah yang over-performing dan under-performing.", benefit: "Dasar keputusan alokasi sumber daya: tambah BD di wilayah yang potensial tapi under-penetrated, atau fokus defend di wilayah yang sudah strong." },
  { name: "Subcon Performance (AP-based)", path: "Buying → Reports → Purchase Order Analysis (filter Supplier Type = Subkontraktor)", color: "#ec4899", freq: "Kuartalan", use: "Analisis kinerja subkon berdasarkan data transaksi: nilai pekerjaan, ketepatan waktu invoice, riwayat payment. Proxy untuk evaluasi subkon.", benefit: "Data-driven vendor qualification — subkon yang nilainya besar tapi sering ada dispute atau invoice tidak tepat perlu dievaluasi ulang untuk kontrak berikutnya." },
];

const CONTRACTOR_SCENARIOS = [
  {
    title: "Skenario 1: Tender Proyek Pemerintah (LPSE)",
    color: "#818cf8",
    steps: [
      "Monitor LPSE → temukan paket tender yang sesuai → input sebagai Lead di CRM",
      "Rapat Go/No-Go: evaluasi nilai, margin target, persaingan, kapasitas → keputusan Direktur",
      "Jika Go: convert Lead → Opportunity. Assign tim: BD, Estimator, Teknis",
      "Download dokumen tender → buat Activity log untuk setiap interaksi",
      "Hitung RAB internal (Custom Module) → tentukan Harga Penawaran",
      "Buat Quotation di ERPNext sebagai tracking internal + dokumen penawaran formal di Word",
      "Submit penawaran sebelum deadline → update Quotation status = Submitted",
      "Tunggu evaluasi → update Opportunity Stage sesuai perkembangan",
      "Jika menang: Quotation → Sales Order (nilai kontrak) → link ke Project",
      "Jika kalah: update Lost Reason → data ini masuk ke Lost Opportunity Analysis",
    ]
  },
  {
    title: "Skenario 2: Repeat Order dari Owner Swasta",
    color: "#34d399",
    steps: [
      "Owner existing menghubungi untuk proyek baru → langsung buat Opportunity (skip Lead)",
      "Karena repeat order, evaluasi lebih cepat — biasanya langsung Go",
      "Buat Quotation dengan harga yang mempertimbangkan track record kerja sama sebelumnya",
      "Negosiasi lebih cepat karena mutual trust sudah ada dari proyek sebelumnya",
      "Sales Order → set Payment Terms sesuai pola bayar owner ini (sudah diketahui dari riwayat)",
      "Link ke Project baru → billing termin mulai saat SPMK terbit",
    ]
  },
  {
    title: "Skenario 3: Perusahaan Kita SEBAGAI Subkon",
    color: "#ec4899",
    steps: [
      "Main Contractor tawarkan paket pekerjaan → buat Lead (MC = lead source)",
      "Evaluasi: apakah scope sesuai kompetensi, margin cukup setelah dipotong MC → Go/No-Go",
      "Terima RFQ dari MC → buat Quotation di ERPNext untuk tracking internal",
      "Negosiasi harga dan scope dengan MC → revisi Quotation jika perlu",
      "SPK diterima dari MC → convert Quotation → Sales Order (MC = Customer kita)",
      "Set Payment Terms sesuai SPK: berapa DP dari MC, termin bayar, retensi",
      "Progress pekerjaan → generate Sales Invoice ke MC berdasarkan BAO yang disetujui MC",
      "Track AR terhadap MC sama seperti AR dari owner biasa",
    ]
  },
  {
    title: "Skenario 4: Mengeluarkan Subkon untuk Paket Pekerjaan Khusus",
    color: "#f59e0b",
    steps: [
      "PM identifikasi paket yang di-subkon dari WBS → buat MR atau langsung RFQ ke subkon",
      "Kirim RFQ (scope BOQ, spesifikasi) ke minimal 3 subkon qualified dari vendor master",
      "Evaluasi penawaran subkon → pilih yang terbaik berdasarkan harga + teknis + track record",
      "Buat Purchase Order (SPK) ke subkon → link ke Project → nilai SPK masuk ke HPP Subkon",
      "Subkon mulai kerja → monitor progress mingguan → evaluasi quality via QC",
      "BAO subkon disetujui → buat Purchase Receipt dari PO sebagai konfirmasi pekerjaan selesai",
      "Subkon kirim invoice → buat Purchase Invoice → apply retensi 5% dan DP deduction",
      "Bayar termin subkon sesuai jadwal → catat Payment Entry → AP subkon berkurang",
    ]
  },
];

const Tag = ({ color, children, sm }) => (
  <span style={{
    background: color + "18", color, border: `1px solid ${color}38`,
    borderRadius: 4, padding: sm ? "1px 5px" : "2px 8px",
    fontSize: sm ? "0.6rem" : "0.67rem",
    fontFamily: MONO, fontWeight: 700, whiteSpace: "nowrap"
  }}>{children}</span>
);

const SecHead = ({ children }) => (
  <div style={{ fontFamily: MONO, fontSize: "0.57rem", color: "#2a1a40", letterSpacing: 4, textTransform: "uppercase", marginBottom: "0.9rem" }}>{children}</div>
);

export default function SalesCRM() {
  const [tab, setTab] = useState("flow");
  const [activeModule, setActiveModule] = useState(0);
  const [flowView, setFlowView] = useState("tender");
  const [activeScenario, setActiveScenario] = useState(null);
  const mod = MODULES[activeModule];

  return (
    <div style={{ background: "#080612", minHeight: "100vh", color: "#c8bce0", fontFamily: SERIF }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(160deg, #120a28 0%, #080612 100%)", borderBottom: "1px solid #1e1035", padding: "2rem 1.5rem 1.6rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, #818cf810 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: "0.57rem", color: "#2a1a40", letterSpacing: 6, marginBottom: 8 }}>BUILT-IN FEATURE #6 — DEEP DIVE</div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#ede8ff", lineHeight: 1.2 }}>
            ERPNext CRM & Sales
          </h1>
          <p style={{ color: "#2a1a40", margin: "0.6rem 0 0", fontSize: "0.84rem", fontFamily: MONO }}>
            Pipeline Tender · Quotation · Kontrak Owner · Billing Termin · Subkon Keluar/Masuk · Laporan BD
          </p>
        </div>
      </div>

      {/* NAV */}
      <div style={{ borderBottom: "1px solid #1e1035", background: "#080612", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 1.5rem", display: "flex", overflowX: "auto" }}>
          {[
            { key: "flow", label: "🔄 Alur Tender & Subkon" },
            { key: "modules", label: "🧩 Fitur & Cara Kerja" },
            { key: "reports", label: "📊 Reports BD & Sales" },
            { key: "scenarios", label: "🏗️ Skenario Kontraktor" },
          ].map(n => (
            <button key={n.key} onClick={() => setTab(n.key)}
              style={{ padding: "0.85rem 1rem", background: "none", border: "none", borderBottom: tab === n.key ? "2px solid #818cf8" : "2px solid transparent", color: tab === n.key ? "#818cf8" : "#2a1a40", fontFamily: SERIF, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.2s" }}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "1.5rem" }}>

        {/* FLOW TAB */}
        {tab === "flow" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 2 }}>
              {[
                { key: "tender", label: "📋 Alur Tender → Kontrak → Billing" },
                { key: "subcon", label: "🔀 Alur Subkon Keluar" },
              ].map(v => (
                <button key={v.key} onClick={() => setFlowView(v.key)}
                  style={{ padding: "0.5rem 1rem", background: flowView === v.key ? "#818cf815" : "#120a28", border: `1px solid ${flowView === v.key ? "#818cf8" : "#1e1035"}`, borderRadius: 7, cursor: "pointer", color: flowView === v.key ? "#818cf8" : "#2a1a40", fontFamily: MONO, fontSize: "0.68rem", fontWeight: 700 }}>
                  {v.label}
                </button>
              ))}
            </div>

            {flowView === "tender" && (
              <>
                <div style={{ background: "#120a28", border: "1px solid #1e1035", borderRadius: 10, padding: "0.9rem 1.2rem" }}>
                  <SecHead>📋 Alur Lengkap: Dari Prospek Tender Sampai Terima Pembayaran Owner</SecHead>
                  <p style={{ color: "#2a1a40", fontSize: "0.8rem", margin: 0 }}>12 tahap yang membentuk siklus bisnis kontraktor — dari informasi tender pertama kali ditemukan sampai invoice termin dibayar oleh owner.</p>
                </div>
                {TENDER_FLOW.map((f, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 160px 1fr auto", gap: 12, padding: "0.7rem 1rem", background: "#120a28", borderRadius: 9, borderLeft: `3px solid ${f.color}`, alignItems: "start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: f.color + "18", border: `1.5px solid ${f.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: "0.62rem", color: f.color, flexShrink: 0, marginTop: 2 }}>{f.no}</div>
                    <div>
                      <div style={{ color: "#ede8ff", fontSize: "0.81rem", fontWeight: 700, marginBottom: 2 }}>{f.phase}</div>
                      <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: "#4a3a60" }}>{f.who}</div>
                    </div>
                    <div style={{ color: "#4a3a60", fontSize: "0.77rem", lineHeight: 1.6 }}>{f.detail}</div>
                    <Tag color={f.color}>{f.doc}</Tag>
                  </div>
                ))}
              </>
            )}

            {flowView === "subcon" && (
              <>
                <div style={{ background: "#120a28", border: "1px solid #1e1035", borderRadius: 10, padding: "0.9rem 1.2rem" }}>
                  <SecHead>🔀 Alur Lengkap: Dari Identifikasi Paket Subkon Sampai Bayar Subkon</SecHead>
                  <p style={{ color: "#2a1a40", fontSize: "0.8rem", margin: 0 }}>10 tahap manajemen subkontraktor keluar — menggunakan modul Procurement (bukan CRM) karena subkon posisinya sebagai Supplier jasa bagi kita.</p>
                </div>
                {SUBCON_FLOW.map((f, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 180px 1fr auto", gap: 12, padding: "0.7rem 1rem", background: "#120a28", borderRadius: 9, borderLeft: `3px solid ${f.color}`, alignItems: "start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: f.color + "18", border: `1.5px solid ${f.color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: "0.62rem", color: f.color, flexShrink: 0, marginTop: 2 }}>{f.no}</div>
                    <div>
                      <div style={{ color: "#ede8ff", fontSize: "0.81rem", fontWeight: 700, marginBottom: 2 }}>{f.phase}</div>
                      <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: "#4a3a60" }}>{f.who}</div>
                    </div>
                    <div style={{ color: "#4a3a60", fontSize: "0.77rem", lineHeight: 1.6 }}>{f.detail}</div>
                    <Tag color={f.color}>{f.doc}</Tag>
                  </div>
                ))}
                <div style={{ background: "#120a28", border: "1px solid #ec489928", borderRadius: 10, padding: "0.9rem 1.1rem" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span>💡</span>
                    <div>
                      <div style={{ color: "#ec4899", fontWeight: 700, fontSize: "0.82rem", marginBottom: 4 }}>Subkon Keluar vs Custom Module Manajemen Subkontraktor</div>
                      <p style={{ color: "#4a3a60", fontSize: "0.78rem", lineHeight: 1.65, margin: 0 }}>
                        Alur di atas menggunakan modul Procurement standard ERPNext — cocok untuk subkon dengan kontrak sederhana (1-2 termin, nilai kecil). Untuk proyek besar dengan subkon yang punya multiple BAO, retensi otomatis, scoring performa, dan penalty tracking, gunakan <span style={{ color: "#ede8ff" }}>Custom Module Manajemen Subkontraktor (Custom Feature #2)</span> yang sudah dibahas dalam blueprint sebelumnya.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* MODULES TAB */}
        {tab === "modules" && (
          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {MODULES.map((m, i) => (
                <button key={i} onClick={() => setActiveModule(i)}
                  style={{ textAlign: "left", padding: "0.58rem 0.76rem", background: activeModule === i ? m.color + "12" : "#120a28", border: `1px solid ${activeModule === i ? m.color + "55" : "#1e1035"}`, borderRadius: 8, cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    <span style={{ fontSize: 14 }}>{m.icon}</span>
                    <div>
                      <div style={{ color: activeModule === i ? "#ede8ff" : "#4a3a60", fontSize: "0.73rem", fontWeight: 700 }}>{m.label}</div>
                      <div style={{ fontFamily: MONO, fontSize: "0.54rem", color: activeModule === i ? m.color : "#2a1a40", lineHeight: 1.4 }}>{m.short}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ background: "#120a28", border: `1px solid ${mod.color}25`, borderRadius: 12, padding: "1.4rem", borderTop: `3px solid ${mod.color}` }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: "0.8rem" }}>
                <span style={{ fontSize: 22 }}>{mod.icon}</span>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: "0.57rem", color: mod.color, letterSpacing: 3 }}>FITUR BAWAAN ERPNEXT</div>
                  <h2 style={{ margin: 0, color: "#ede8ff", fontSize: "1.02rem", fontWeight: 700 }}>{mod.label}</h2>
                </div>
              </div>
              <p style={{ color: "#4a3a60", fontSize: "0.83rem", lineHeight: 1.75, margin: "0 0 1.1rem", borderLeft: `3px solid ${mod.color}30`, paddingLeft: "0.85rem" }}>{mod.desc}</p>
              <SecHead>🛠 Cara Penggunaan untuk Kontraktor</SecHead>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "1.1rem" }}>
                {mod.howto.map((h, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 9, padding: "0.58rem 0.78rem", background: "#080612", borderRadius: 7, borderLeft: `2px solid ${mod.color}38` }}>
                    <div style={{ width: 21, height: 21, borderRadius: "50%", background: mod.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: "0.6rem", color: mod.color, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <div>
                      <div style={{ color: "#ede8ff", fontSize: "0.8rem", fontWeight: 700, marginBottom: 2 }}>{h.step}</div>
                      <div style={{ color: "#4a3a60", fontSize: "0.75rem", lineHeight: 1.65 }}>{h.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
              <SecHead>⚙️ Konfigurasi Penting</SecHead>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: mod.warning ? "1rem" : 0 }}>
                {mod.config.map((c, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 9, padding: "0.45rem 0.78rem", background: "#080612", borderRadius: 6 }}>
                    <div style={{ fontFamily: MONO, fontSize: "0.66rem", color: mod.color, paddingTop: 1 }}>{c.field}</div>
                    <div style={{ color: "#4a3a60", fontSize: "0.73rem", lineHeight: 1.55 }}>{c.value || c.detail}</div>
                  </div>
                ))}
              </div>
              {mod.warning && (
                <div style={{ background: "#f59e0b0c", border: "1px solid #f59e0b28", borderRadius: 8, padding: "0.65rem 0.85rem", display: "flex", gap: 8 }}>
                  <span>⚠️</span>
                  <span style={{ color: "#fcd34d", fontSize: "0.77rem", lineHeight: 1.6 }}>{mod.warning}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {tab === "reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#120a28", border: "1px solid #1e1035", borderRadius: 10, padding: "0.9rem 1.1rem" }}>
              <SecHead>📊 10 Report CRM & Sales yang Menguntungkan untuk Kontraktor</SecHead>
              <p style={{ color: "#2a1a40", fontSize: "0.8rem", margin: 0 }}>Laporan-laporan ini memberikan visibilitas penuh atas pipeline bisnis, performa tim BD, status kontrak, dan posisi piutang — informasi yang dibutuhkan Direktur dan BD Manager setiap minggu.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 10 }}>
              {REPORTS.map((r, i) => (
                <div key={i} style={{ background: "#120a28", border: `1px solid ${r.color}20`, borderRadius: 10, padding: "1rem 1.1rem", borderLeft: `4px solid ${r.color}` }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ color: r.color, fontWeight: 700, fontSize: "0.84rem", flex: 1 }}>{r.name}</span>
                    <Tag color={r.color} sm>{r.freq}</Tag>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: "0.58rem", color: "#2a1a40", background: "#080612", padding: "2px 7px", borderRadius: 4, display: "inline-block", marginBottom: 6 }}>{r.path}</div>
                  <p style={{ color: "#4a3a60", fontSize: "0.75rem", lineHeight: 1.6, margin: "0 0 6px" }}>{r.use}</p>
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <span style={{ color: r.color, fontSize: "0.72rem", flexShrink: 0 }}>💡</span>
                    <span style={{ color: "#2a1a40", fontSize: "0.71rem", lineHeight: 1.55 }}>{r.benefit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCENARIOS TAB */}
        {tab === "scenarios" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ background: "#120a28", border: "1px solid #1e1035", borderRadius: 10, padding: "0.9rem 1.1rem" }}>
              <SecHead>🏗️ 4 Skenario Operasional Nyata di Kontraktor</SecHead>
              <p style={{ color: "#2a1a40", fontSize: "0.8rem", margin: 0 }}>Bagaimana modul CRM & Sales digunakan dalam empat situasi berbeda yang sering dihadapi perusahaan kontraktor Indonesia.</p>
            </div>
            {CONTRACTOR_SCENARIOS.map((sc, i) => (
              <div key={i} style={{ background: "#120a28", border: `1px solid ${activeScenario === i ? sc.color + "50" : "#1e1035"}`, borderRadius: 10, overflow: "hidden" }}>
                <button onClick={() => setActiveScenario(activeScenario === i ? null : i)}
                  style={{ width: "100%", background: "none", border: "none", padding: "0.9rem 1.1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: sc.color, flexShrink: 0 }} />
                  <span style={{ color: "#ede8ff", fontWeight: 700, fontSize: "0.87rem", flex: 1 }}>{sc.title}</span>
                  <span style={{ color: sc.color, fontSize: "1.1rem", transform: activeScenario === i ? "rotate(90deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>›</span>
                </button>
                {activeScenario === i && (
                  <div style={{ borderTop: "1px solid #1e1035", padding: "0.7rem 1.1rem 1rem" }}>
                    {sc.steps.map((st, j) => (
                      <div key={j} style={{ display: "flex", gap: 9, padding: "0.5rem 0.75rem", background: "#080612", borderRadius: 6, borderLeft: `2px solid ${sc.color}35`, marginBottom: 5 }}>
                        <span style={{ color: sc.color, fontFamily: MONO, fontSize: "0.62rem", minWidth: 18, paddingTop: 2 }}>{String(j + 1).padStart(2, "0")}</span>
                        <span style={{ color: "#4a3a60", fontSize: "0.79rem", lineHeight: 1.6 }}>{st}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* CRM vs Custom Module matrix */}
            <div style={{ background: "#120a28", border: "1px solid #1e1035", borderRadius: 12, padding: "1.2rem" }}>
              <SecHead>⚖️ Kapan Pakai CRM Standard vs Custom Module</SecHead>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                  <thead>
                    <tr style={{ background: "#080612" }}>
                      {["Kebutuhan", "CRM/Sales Standard", "Custom Module"].map(h => (
                        <th key={h} style={{ padding: "0.5rem 0.8rem", textAlign: "left", color: "#2a1a40", fontFamily: MONO, fontSize: "0.58rem", letterSpacing: 2, borderBottom: "1px solid #1e1035" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Pipeline tender & BD tracking", "✅ Ya — Lead, Opportunity, Quotation", "Tidak perlu"],
                      ["Kontrak dengan owner (SPK)", "✅ Ya — Sales Order", "Tidak perlu"],
                      ["Billing termin ke owner", "✅ Ya — Sales Invoice dari SO", "Tidak perlu"],
                      ["Subkon kontrak sederhana (1-2 termin)", "✅ Ya — Purchase Order", "Tidak perlu"],
                      ["Subkon multiple BAO per kontrak", "⚠️ Terbatas — tidak ada multi-BAO per PO", "✅ Custom Subkon Module"],
                      ["Retensi subkon otomatis", "⚠️ Manual JE — tidak otomatis", "✅ Custom Subkon Module"],
                      ["Scoring & blacklist subkon", "❌ Tidak ada", "✅ Custom Subkon Module"],
                      ["Progress BAO link ke billing owner", "⚠️ Manual — tidak otomatis terhubung", "✅ Custom Progress + Billing Module"],
                      ["RAB internal sebagai dasar estimasi", "❌ Tidak ada", "✅ Custom RAB Builder Module"],
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #1a0e30" }}>
                        <td style={{ padding: "0.45rem 0.8rem", color: "#c8bce0", fontSize: "0.77rem" }}>{row[0]}</td>
                        <td style={{ padding: "0.45rem 0.8rem", color: row[1].startsWith("✅") ? "#34d399" : row[1].startsWith("⚠️") ? "#fbbf24" : "#ef4444", fontSize: "0.75rem" }}>{row[1]}</td>
                        <td style={{ padding: "0.45rem 0.8rem", color: row[2].startsWith("✅") ? "#818cf8" : "#4a3a60", fontSize: "0.75rem" }}>{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
