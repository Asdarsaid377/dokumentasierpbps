import { useState } from "react";

const FONT = "'Courier New', monospace";
const SANS = "'Georgia', serif";

const FLOW_STEPS = [
  {
    id: 1, phase: "SETUP", color: "#0ea5e9", icon: "⚙️",
    title: "Setup Baseline Proyek",
    actor: "PM / Planner",
    desc: "Sebelum progress bisa dicatat, sistem butuh baseline yang jelas: jadwal rencana, bobot pekerjaan, dan struktur WBS. Ini adalah titik nol dari seluruh monitoring.",
    actions: [
      "Import WBS dari RAB yang sudah approved — setiap divisi dan item pekerjaan otomatis masuk sebagai item progress",
      "Tentukan bobot (%) setiap item terhadap keseluruhan proyek berdasarkan nilai RAB (auto-kalkulasi)",
      "Input jadwal rencana per item: tanggal mulai, tanggal selesai, durasi (hari/minggu)",
      "Buat kurva S rencana: distribusi bobot progress per periode waktu (minggu/bulan)",
      "Tetapkan periode pelaporan: harian, mingguan, atau per termin sesuai kebutuhan proyek",
      "Set milestone utama proyek: Fondasi selesai, Struktur selesai, Atap, Finishing, Serah Terima",
      "Assign penanggung jawab lapangan per divisi pekerjaan",
      "Baseline terkunci setelah di-approve PM → jadi acuan kurva S sepanjang proyek",
    ],
    output: "Baseline proyek terkunci: WBS, bobot, jadwal rencana, dan kurva S tersimpan di sistem",
    warning: "Perubahan baseline setelah proyek jalan harus melalui Change Order — tidak boleh diedit bebas",
  },
  {
    id: 2, phase: "HARIAN", color: "#10b981", icon: "📅",
    title: "Laporan Harian Lapangan (LHL)",
    actor: "Pelaksana / Mandor / Site Engineer",
    desc: "Setiap hari kerja, tim lapangan mencatat kondisi aktual di lokasi. LHL adalah raw data dari lapangan yang jadi fondasi semua laporan progress.",
    actions: [
      "Buka form LHL harian — auto-terisi: tanggal, nama proyek, nama pelapor",
      "Input kondisi cuaca: Cerah / Mendung / Hujan Ringan / Hujan Lebat (mempengaruhi produktivitas)",
      "Catat kehadiran tenaga kerja: mandor, tukang, pekerja — per divisi pekerjaan",
      "Input pekerjaan yang dikerjakan hari ini: pilih dari daftar item WBS",
      "Catat volume pekerjaan yang diselesaikan hari ini per item (misal: 12 m² bekisting terpasang)",
      "Catat material yang digunakan: jenis, jumlah, satuan — link ke item RAB material",
      "Catat peralatan yang digunakan: jenis alat, jam operasi",
      "Dokumentasi foto: minimal 3 foto (kondisi pagi, progress kerja, kondisi sore)",
      "Catat kendala/masalah: material terlambat, alat rusak, cuaca, dll",
      "Submit LHL → notifikasi ke Site Manager untuk review",
    ],
    output: "LHL terisi lengkap dengan data kuantitatif volume + foto dokumentasi setiap hari kerja",
    warning: "LHL yang tidak diisi dalam 24 jam → sistem kirim reminder ke pelaksana dan Site Manager",
  },
  {
    id: 3, phase: "MINGGUAN", color: "#8b5cf6", icon: "📊",
    title: "Rekapitulasi & Laporan Mingguan",
    actor: "Site Manager / Site Engineer",
    desc: "Setiap akhir minggu, data LHL harian direkap menjadi laporan mingguan yang menunjukkan progress kumulatif dan deviasi dari rencana.",
    actions: [
      "Sistem auto-rekapitulasi dari LHL harian minggu tersebut — Site Manager tinggal review",
      "Verifikasi akurasi data: cek kesesuaian volume LHL vs kondisi fisik lapangan",
      "Hitung progress mingguan per item: total volume minggu ini / volume kontrak × 100%",
      "Update progress kumulatif: progress minggu ini + akumulasi minggu-minggu sebelumnya",
      "Bandingkan dengan kurva S rencana: apakah ahead, on track, atau behind schedule?",
      "Hitung Schedule Variance (SV): progress aktual − progress rencana (dalam %)",
      "Identifikasi item pekerjaan yang paling tertinggal dari jadwal",
      "Buat catatan kendala yang berdampak ke progress dan rencana percepatan",
      "Site Manager approve laporan mingguan → data masuk ke dashboard PM",
    ],
    output: "Laporan mingguan berisi progress per item, kurva S update, dan analisis deviasi jadwal",
    warning: null,
  },
  {
    id: 4, phase: "OPNAME", color: "#f59e0b", icon: "📏",
    title: "Berita Acara Opname (BAO)",
    actor: "Site Manager + Pengawas MK / Owner",
    desc: "Opname adalah pengukuran progress yang resmi dan disepakati bersama antara kontraktor dan pengawas/owner. Hasilnya jadi dasar penagihan ke owner.",
    actions: [
      "PM/Site Manager ajukan request opname ke Pengawas / Konsultan MK",
      "Tentukan tanggal opname bersama — biasanya tiap bulan atau per termin",
      "Tim gabungan (Site Manager + Pengawas MK) turun ke lapangan bersama",
      "Lakukan pengukuran fisik bersama per item pekerjaan: hitung volume terpasang yang benar-benar selesai dan sesuai spesifikasi",
      "Input volume hasil pengukuran ke form BAO digital per item BOQ",
      "Pengawas MK bisa menolak/mengurangi volume jika kualitas tidak memenuhi spesifikasi",
      "Hitung nilai progress: volume opname × harga satuan kontrak",
      "Hitung % progress keseluruhan: nilai progress kumulatif / nilai kontrak × 100%",
      "Lampirkan foto dokumentasi kondisi terkini setiap item pekerjaan",
      "Kedua pihak review dan setujui angka — tanda tangan BA Opname (digital atau fisik)",
      "BAO yang sudah ditandatangani → jadi dasar penerbitan invoice ke owner",
    ],
    output: "BA Opname resmi bertandatangan: volume terverifikasi, nilai tagihan, dan % progress proyek",
    warning: "Volume yang diakui di BAO adalah angka FINAL untuk penagihan — tidak bisa direvisi setelah ditandatangani kecuali ada addendum",
  },
  {
    id: 5, phase: "QC", color: "#ef4444", icon: "🔍",
    title: "Quality Control & Inspeksi",
    actor: "Quality Inspector / Site Manager",
    desc: "QC berjalan paralel dengan progress. Setiap item pekerjaan yang selesai harus diinspeksi sebelum ditutup/tertimbun atau sebelum pekerjaan berikutnya dimulai.",
    actions: [
      "Quality Inspector buat Work Inspection Request (WIR) setelah item pekerjaan selesai",
      "Tentukan kriteria inspeksi: spesifikasi teknis, standar SNI, gambar kontrak",
      "Checklist inspeksi per item: dimensi, material, workmanship, kesesuaian gambar",
      "Lakukan inspeksi fisik — catat hasil per poin checklist: PASS / FAIL / NEEDS REPAIR",
      "Jika ada item FAIL → terbitkan Non-Conformance Report (NCR): deskripsi cacat, foto, instruksi perbaikan",
      "Assign NCR ke pelaksana/subkon terkait dengan batas waktu perbaikan",
      "Pelaksana lakukan perbaikan → foto after repair → submit untuk re-inspeksi",
      "Quality Inspector re-inspeksi → jika PASS → tutup NCR",
      "Volume di BAO hanya boleh diakui untuk pekerjaan yang status QC-nya PASS",
      "Rekap NCR per periode: berapa open, closed, overdue → jadi KPI kualitas proyek",
    ],
    output: "Laporan QC terdokumentasi: semua item ter-inspeksi, NCR terlacak, dan kualitas terjamin",
    warning: "Pekerjaan yang belum clear QC tidak boleh dimasukkan dalam perhitungan BAO",
  },
  {
    id: 6, phase: "S-CURVE", color: "#f97316", icon: "📈",
    title: "Analisis Kurva S & EVM",
    actor: "PM / Planner",
    desc: "Kurva S dan Earned Value Management (EVM) adalah tools utama PM untuk memantau kesehatan proyek dari sisi waktu dan biaya sekaligus.",
    actions: [
      "Sistem auto-plot kurva S aktual dari data BAO yang sudah approved",
      "Tampilkan dua kurva: garis Rencana (baseline) vs garis Aktual — deviasi langsung terlihat visual",
      "Hitung Schedule Performance Index (SPI): Earned Value / Planned Value — SPI < 1 artinya terlambat",
      "Hitung Cost Performance Index (CPI): Earned Value / Actual Cost — CPI < 1 artinya over-budget",
      "Hitung Schedule Variance (SV) dalam hari: berapa hari proyek lebih lambat dari rencana",
      "Forecast penyelesaian proyek: berdasarkan tren SPI saat ini, kapan proyek akan selesai?",
      "Identifikasi critical path: item pekerjaan mana yang jika terlambat akan geser tanggal selesai proyek",
      "PM buat action plan: percepatan mana yang perlu dilakukan untuk recovery schedule",
      "Laporan EVM dikirim ke owner/direksi jika proyek terlambat lebih dari threshold (misal SPI < 0.9)",
    ],
    output: "Dashboard kurva S + EVM metrics real-time: SPI, CPI, SV, CV, projected completion date",
    warning: null,
  },
  {
    id: 7, phase: "FOTO DOC", color: "#ec4899", icon: "📸",
    title: "Dokumentasi Foto Terstruktur",
    actor: "Pelaksana / Site Engineer / QC Inspector",
    desc: "Foto adalah bukti hukum dan teknis yang tidak terbantahkan. Sistem dokumentasi foto harus terstruktur, tidak hanya kumpulan foto acak.",
    actions: [
      "Setiap foto wajib di-tag ke: item pekerjaan (WBS), tanggal, lokasi (koordinat GPS jika memungkinkan), tipe foto",
      "Tipe foto standar: 0% (kondisi awal/pre-work), 50% (in progress), 100% (selesai), After Repair (pasca perbaikan NCR)",
      "Foto progress periodik: sama sudut pandang setiap kali → bisa dibandingkan timeline",
      "Foto material datang: dokumentasi delivery material ke lapangan",
      "Foto kondisi lahan/existing sebelum pekerjaan dimulai: perlindungan hukum jika ada klaim",
      "Sistem tampilkan galeri foto per item pekerjaan: bisa lihat progress dari 0% sampai 100%",
      "Foto otomatis ter-embed di laporan progress dan BA Opname",
    ],
    output: "Arsip foto terstruktur per item pekerjaan, tersedia kapan saja untuk laporan dan klaim",
    warning: null,
  },
  {
    id: 8, phase: "PELAPORAN", color: "#64748b", icon: "📋",
    title: "Laporan ke Owner & Manajemen",
    actor: "PM / Site Manager",
    desc: "Laporan progress adalah komunikasi formal kontraktor ke owner dan manajemen internal. Formatnya harus konsisten, informatif, dan mudah dipahami.",
    actions: [
      "Sistem generate laporan bulanan otomatis dari semua data yang sudah diinput",
      "Komponen laporan: executive summary, kurva S, tabel progress per item, foto milestone, issues & risks",
      "Laporan progress bulan ini dikirim ke owner sebelum tanggal penagihan termin",
      "Internal report ke Direksi: kondisi semua proyek dalam satu dashboard",
      "Alert otomatis: proyek dengan SPI < 0.85 (terlambat > 15%) → eskalasi ke Direktur",
      "Forecasting: estimasi biaya akhir proyek (Estimate at Completion / EAC) berdasarkan tren aktual",
      "Laporan bisa di-export: PDF untuk owner, Excel untuk internal analisis",
    ],
    output: "Laporan progress bulanan siap kirim ke owner + dashboard manajemen terupdate real-time",
    warning: null,
  },
];

const DATA_MODELS = [
  {
    name: "Project_Baseline",
    label: "Project Baseline",
    color: "#0ea5e9",
    icon: "📐",
    type: "DocType Master",
    desc: "Baseline proyek yang terkunci — jadwal rencana, bobot, dan kurva S. Referensi tetap sepanjang proyek.",
    fields: [
      { name: "baseline_id", type: "Data", key: true, desc: "BL-PRJ-2024-001" },
      { name: "project", type: "Link → Project", key: false, desc: "Link ke ERPNext Project" },
      { name: "rab_ref", type: "Link → RAB_Header", key: false, desc: "RAB yang jadi acuan WBS & bobot" },
      { name: "project_value", type: "Currency", key: false, desc: "Nilai kontrak proyek dengan owner" },
      { name: "planned_start", type: "Date", key: false, desc: "Tanggal mulai kontrak" },
      { name: "planned_end", type: "Date", key: false, desc: "Tanggal selesai kontrak" },
      { name: "contract_duration", type: "Int", key: false, desc: "Durasi kontrak (hari kalender)" },
      { name: "reporting_period", type: "Select", key: false, desc: "Daily / Weekly / Monthly" },
      { name: "status", type: "Select", key: false, desc: "Draft / Approved / Locked / Revised" },
      { name: "version", type: "Int", key: false, desc: "Versi baseline (naik jika ada CO jadwal)" },
      { name: "locked_date", type: "Date", key: false, desc: "Tanggal baseline dikunci" },
      { name: "locked_by", type: "Link → User", key: false, desc: "PM yang mengunci baseline" },
    ]
  },
  {
    name: "WBS_Item",
    label: "WBS Progress Item",
    color: "#0ea5e9",
    icon: "🗂️",
    type: "Child of Project_Baseline",
    desc: "Setiap item pekerjaan yang akan di-tracking progressnya — di-generate dari RAB Item",
    fields: [
      { name: "wbs_code", type: "Data", key: false, desc: "01.02.03 (kode hierarki WBS)" },
      { name: "rab_item_ref", type: "Link → RAB_Item", key: false, desc: "Sumber data dari RAB" },
      { name: "item_name", type: "Data", key: false, desc: "Nama item pekerjaan" },
      { name: "unit", type: "Link → UOM", key: false, desc: "Satuan pekerjaan" },
      { name: "volume_contract", type: "Float", key: false, desc: "Volume total dari kontrak" },
      { name: "value_contract", type: "Currency", key: false, desc: "Nilai item dari RAB" },
      { name: "bobot_pct", type: "Percent", key: false, desc: "Bobot item / total nilai proyek × 100%" },
      { name: "planned_start", type: "Date", key: false, desc: "Rencana mulai item ini" },
      { name: "planned_end", type: "Date", key: false, desc: "Rencana selesai item ini" },
      { name: "responsible", type: "Link → User", key: false, desc: "PIC lapangan item ini" },
      { name: "predecessor", type: "Data", key: false, desc: "WBS item yang harus selesai dulu" },
      { name: "is_milestone", type: "Check", key: false, desc: "TRUE jika item ini adalah milestone" },
      { name: "volume_actual", type: "Float", key: false, desc: "Volume aktual kumulatif (auto dari opname)" },
      { name: "progress_pct_actual", type: "Percent", key: false, desc: "volume_actual / volume_contract × 100%" },
      { name: "progress_pct_planned", type: "Percent", key: false, desc: "% rencana saat ini berdasarkan kurva S" },
      { name: "schedule_variance_pct", type: "Float", key: false, desc: "actual − planned (negatif = terlambat)" },
    ]
  },
  {
    name: "SCurve_Distribution",
    label: "S-Curve Distribution",
    color: "#0ea5e9",
    icon: "📈",
    type: "Child of Project_Baseline",
    desc: "Distribusi rencana progress per periode — membentuk kurva S baseline",
    fields: [
      { name: "period_no", type: "Int", key: false, desc: "Periode ke-N (minggu/bulan)" },
      { name: "period_label", type: "Data", key: false, desc: "Minggu 1 / Jan 2024 / dll" },
      { name: "period_start", type: "Date", key: false, desc: "" },
      { name: "period_end", type: "Date", key: false, desc: "" },
      { name: "planned_progress_pct", type: "Percent", key: false, desc: "Target progress periode ini (%)" },
      { name: "planned_cumulative_pct", type: "Percent", key: false, desc: "Target kumulatif s/d periode ini (%)" },
      { name: "planned_value", type: "Currency", key: false, desc: "Planned Value (PV) periode ini untuk EVM" },
      { name: "actual_progress_pct", type: "Percent", key: false, desc: "Realisasi progress periode ini (auto dari BAO)" },
      { name: "actual_cumulative_pct", type: "Percent", key: false, desc: "Realisasi kumulatif (auto)" },
      { name: "earned_value", type: "Currency", key: false, desc: "EV = actual_pct × contract_value (auto)" },
      { name: "actual_cost", type: "Currency", key: false, desc: "AC dari transaksi aktual periode ini" },
    ]
  },
  {
    name: "Daily_Report",
    label: "Laporan Harian Lapangan (LHL)",
    color: "#10b981",
    icon: "📅",
    type: "DocType",
    desc: "Catatan harian kondisi lapangan — raw data progress dari pelaksana setiap hari kerja",
    fields: [
      { name: "lhl_id", type: "Data", key: true, desc: "LHL-2024-0856" },
      { name: "project", type: "Link → Project", key: false, desc: "" },
      { name: "report_date", type: "Date", key: false, desc: "Tanggal laporan" },
      { name: "reported_by", type: "Link → User", key: false, desc: "Pelaksana yang mengisi" },
      { name: "weather_morning", type: "Select", key: false, desc: "Cerah / Mendung / Hujan Ringan / Hujan Lebat" },
      { name: "weather_afternoon", type: "Select", key: false, desc: "Cerah / Mendung / Hujan Ringan / Hujan Lebat" },
      { name: "work_hours", type: "Float", key: false, desc: "Jam kerja efektif hari ini" },
      { name: "total_workers", type: "Int", key: false, desc: "Total tenaga kerja hadir" },
      { name: "safety_incident", type: "Check", key: false, desc: "TRUE jika ada insiden K3 hari ini" },
      { name: "safety_incident_desc", type: "Small Text", key: false, desc: "Deskripsi insiden jika ada" },
      { name: "issues_today", type: "Text", key: false, desc: "Kendala/masalah yang dihadapi" },
      { name: "plan_tomorrow", type: "Text", key: false, desc: "Rencana kerja besok" },
      { name: "status", type: "Select", key: false, desc: "Draft / Submitted / Reviewed" },
      { name: "reviewed_by", type: "Link → User", key: false, desc: "Site Manager yang review" },
    ]
  },
  {
    name: "Daily_Work_Item",
    label: "LHL Work Item Detail",
    color: "#10b981",
    icon: "🔨",
    type: "Child of Daily_Report",
    desc: "Volume pekerjaan yang diselesaikan per item WBS setiap hari",
    fields: [
      { name: "wbs_item", type: "Link → WBS_Item", key: false, desc: "Item pekerjaan dari WBS" },
      { name: "volume_today", type: "Float", key: false, desc: "Volume yang diselesaikan hari ini" },
      { name: "unit", type: "Link → UOM", key: false, desc: "Satuan pekerjaan" },
      { name: "location_description", type: "Data", key: false, desc: "As-5, Kolom K1, Grid A-B / 1-2" },
      { name: "worker_count", type: "Int", key: false, desc: "Jumlah tenaga kerja untuk item ini" },
      { name: "remark", type: "Small Text", key: false, desc: "Catatan khusus pekerjaan ini" },
    ]
  },
  {
    name: "Daily_Labour",
    label: "LHL Labour Detail",
    color: "#10b981",
    icon: "👷",
    type: "Child of Daily_Report",
    desc: "Kehadiran tenaga kerja per kategori setiap hari",
    fields: [
      { name: "labour_type", type: "Select", key: false, desc: "Mandor / Kepala Tukang / Tukang / Pekerja / Operator" },
      { name: "count_plan", type: "Int", key: false, desc: "Rencana jumlah tenaga" },
      { name: "count_actual", type: "Int", key: false, desc: "Realisasi hadir" },
      { name: "overtime_hours", type: "Float", key: false, desc: "Jam lembur (jika ada)" },
      { name: "source", type: "Select", key: false, desc: "Borongan Sendiri / Subkon A / Subkon B" },
    ]
  },
  {
    name: "Progress_Opname",
    label: "Berita Acara Opname (BAO)",
    color: "#f59e0b",
    icon: "📏",
    type: "DocType Utama",
    desc: "Pengukuran progress resmi bersama pengawas/MK — dasar penagihan ke owner",
    fields: [
      { name: "bao_id", type: "Data", key: true, desc: "BAO-2024-008" },
      { name: "project", type: "Link → Project", key: false, desc: "" },
      { name: "baseline_ref", type: "Link → Project_Baseline", key: false, desc: "" },
      { name: "opname_date", type: "Date", key: false, desc: "Tanggal pelaksanaan opname" },
      { name: "opname_period", type: "Data", key: false, desc: "Termin-3 / Bulan April 2024" },
      { name: "conducted_by", type: "Link → User", key: false, desc: "Site Manager kontraktor" },
      { name: "witnessed_by_name", type: "Data", key: false, desc: "Nama Pengawas MK / Owner Rep" },
      { name: "witnessed_by_org", type: "Data", key: false, desc: "Nama perusahaan MK / owner" },
      { name: "prev_cumulative_pct", type: "Percent", key: false, desc: "Progress kumulatif BAO sebelumnya" },
      { name: "prev_cumulative_value", type: "Currency", key: false, desc: "Nilai kumulatif BAO sebelumnya" },
      { name: "this_opname_pct", type: "Percent", key: false, desc: "Progress yang diakui opname ini" },
      { name: "this_opname_value", type: "Currency", key: false, desc: "Nilai yang diakui opname ini" },
      { name: "cumulative_pct", type: "Percent", key: false, desc: "Total kumulatif s/d opname ini" },
      { name: "cumulative_value", type: "Currency", key: false, desc: "Nilai kumulatif total" },
      { name: "planned_pct_at_date", type: "Percent", key: false, desc: "Target dari kurva S pada tanggal opname" },
      { name: "schedule_variance", type: "Float", key: false, desc: "cumulative_pct − planned_pct (±%)" },
      { name: "all_qc_cleared", type: "Check", key: false, desc: "Konfirmasi semua QC passed untuk item yang diopname" },
      { name: "status", type: "Select", key: false, desc: "Draft / Submitted / Approved / Locked" },
      { name: "approved_by_contractor", type: "Link → User", key: false, desc: "PM kontraktor" },
      { name: "approved_by_mk", type: "Data", key: false, desc: "Nama pengawas MK yang ttd" },
      { name: "ba_document", type: "Attach", key: false, desc: "File BA Opname yang sudah ditandatangani" },
    ]
  },
  {
    name: "Opname_Item_Detail",
    label: "BAO Item Detail",
    color: "#f59e0b",
    icon: "📋",
    type: "Child of Progress_Opname",
    desc: "Volume terukur per item WBS di setiap sesi opname",
    fields: [
      { name: "wbs_item", type: "Link → WBS_Item", key: false, desc: "Item pekerjaan yang diukur" },
      { name: "volume_prev_cumulative", type: "Float", key: false, desc: "Volume kumulatif opname sebelumnya" },
      { name: "volume_this_opname", type: "Float", key: false, desc: "Volume baru yang diukur opname ini" },
      { name: "volume_cumulative", type: "Float", key: false, desc: "Total kumulatif s/d opname ini" },
      { name: "volume_contract", type: "Float", key: false, desc: "Volume kontrak (dari WBS)" },
      { name: "progress_pct", type: "Percent", key: false, desc: "volume_cumulative / volume_contract × 100%" },
      { name: "unit_price", type: "Currency", key: false, desc: "Harga satuan dari kontrak" },
      { name: "value_this_opname", type: "Currency", key: false, desc: "volume_this × unit_price (auto)" },
      { name: "value_cumulative", type: "Currency", key: false, desc: "Nilai kumulatif s/d opname ini" },
      { name: "bobot_contribution", type: "Percent", key: false, desc: "Kontribusi item ke % progress total" },
      { name: "qc_status", type: "Select", key: false, desc: "Cleared / Conditional / Not Cleared" },
      { name: "mk_remark", type: "Small Text", key: false, desc: "Catatan pengawas MK untuk item ini" },
    ]
  },
  {
    name: "Quality_Inspection",
    label: "Work Inspection Request (WIR)",
    color: "#ef4444",
    icon: "🔍",
    type: "DocType",
    desc: "Permintaan inspeksi kualitas setelah item pekerjaan selesai — wajib sebelum diakui di BAO",
    fields: [
      { name: "wir_id", type: "Data", key: true, desc: "WIR-2024-156" },
      { name: "project", type: "Link → Project", key: false, desc: "" },
      { name: "wbs_item", type: "Link → WBS_Item", key: false, desc: "Item yang minta diinspeksi" },
      { name: "requested_by", type: "Link → User", key: false, desc: "Pelaksana / Site Engineer" },
      { name: "requested_date", type: "Date", key: false, desc: "" },
      { name: "inspection_date", type: "Date", key: false, desc: "Tanggal inspeksi dilaksanakan" },
      { name: "inspector", type: "Link → User", key: false, desc: "QC Inspector" },
      { name: "volume_to_inspect", type: "Float", key: false, desc: "Volume yang minta diinspeksi" },
      { name: "location_desc", type: "Data", key: false, desc: "Lokasi spesifik di lapangan" },
      { name: "spec_reference", type: "Data", key: false, desc: "No. spesifikasi / gambar yang dijadikan acuan" },
      { name: "overall_result", type: "Select", key: false, desc: "PASS / CONDITIONAL PASS / FAIL" },
      { name: "volume_accepted", type: "Float", key: false, desc: "Volume yang diterima setelah inspeksi" },
      { name: "status", type: "Select", key: false, desc: "Pending / Inspected / NCR Issued / Closed" },
      { name: "inspection_photos", type: "Attach Multiple", key: false, desc: "Foto saat inspeksi" },
    ]
  },
  {
    name: "QC_Checklist_Item",
    label: "QC Checklist Item",
    color: "#ef4444",
    icon: "✅",
    type: "Child of Quality_Inspection",
    desc: "Poin-poin checklist inspeksi kualitas per item pekerjaan",
    fields: [
      { name: "check_point", type: "Data", key: false, desc: "Dimensi sesuai gambar / Slump test beton / Ketebalan cat" },
      { name: "standard_requirement", type: "Data", key: false, desc: "SNI 2847:2019 / Gambar S-05 Rev.2" },
      { name: "method_of_check", type: "Data", key: false, desc: "Visual / Measurement / Test / Document" },
      { name: "result", type: "Select", key: false, desc: "PASS / FAIL / N/A" },
      { name: "actual_value", type: "Data", key: false, desc: "Nilai aktual hasil pengukuran" },
      { name: "required_value", type: "Data", key: false, desc: "Nilai yang disyaratkan" },
      { name: "remark", type: "Small Text", key: false, desc: "Catatan inspector" },
    ]
  },
  {
    name: "NCR",
    label: "Non-Conformance Report (NCR)",
    color: "#ef4444",
    icon: "🚨",
    type: "DocType",
    desc: "Laporan ketidaksesuaian kualitas — tracking dari temuan sampai perbaikan selesai",
    fields: [
      { name: "ncr_id", type: "Data", key: true, desc: "NCR-2024-023" },
      { name: "project", type: "Link → Project", key: false, desc: "" },
      { name: "wir_ref", type: "Link → Quality_Inspection", key: false, desc: "WIR sumber NCR ini" },
      { name: "wbs_item", type: "Link → WBS_Item", key: false, desc: "" },
      { name: "raised_by", type: "Link → User", key: false, desc: "QC Inspector yang temukan" },
      { name: "raised_date", type: "Date", key: false, desc: "" },
      { name: "ncr_type", type: "Select", key: false, desc: "Major / Minor / Observation" },
      { name: "description", type: "Text", key: false, desc: "Deskripsi lengkap ketidaksesuaian" },
      { name: "location", type: "Data", key: false, desc: "Lokasi fisik di lapangan" },
      { name: "nonconformance_photos", type: "Attach Multiple", key: false, desc: "Foto kondisi saat ditemukan" },
      { name: "required_action", type: "Text", key: false, desc: "Tindakan perbaikan yang harus dilakukan" },
      { name: "assigned_to", type: "Link → User", key: false, desc: "Pelaksana / subkon yang harus perbaiki" },
      { name: "due_date", type: "Date", key: false, desc: "Batas waktu perbaikan" },
      { name: "closed_date", type: "Date", key: false, desc: "Tanggal NCR ditutup setelah perbaikan selesai" },
      { name: "closure_photos", type: "Attach Multiple", key: false, desc: "Foto after repair" },
      { name: "status", type: "Select", key: false, desc: "Open / In Progress / Pending Verification / Closed / Overdue" },
      { name: "verified_by", type: "Link → User", key: false, desc: "QC yang verifikasi perbaikan" },
    ]
  },
  {
    name: "Photo_Documentation",
    label: "Photo Documentation",
    color: "#ec4899",
    icon: "📸",
    type: "DocType",
    desc: "Arsip foto terstruktur — setiap foto ter-tag ke item pekerjaan, tipe, dan tanggal",
    fields: [
      { name: "photo_id", type: "Data", key: true, desc: "PHT-2024-1892" },
      { name: "project", type: "Link → Project", key: false, desc: "" },
      { name: "wbs_item", type: "Link → WBS_Item", key: false, desc: "Item pekerjaan yang difoto" },
      { name: "photo_date", type: "Date", key: false, desc: "" },
      { name: "photo_type", type: "Select", key: false, desc: "0% Pre-Work / In Progress / 100% Complete / NCR Found / After Repair / Material Delivery / Overall Site" },
      { name: "taken_by", type: "Link → User", key: false, desc: "" },
      { name: "location_desc", type: "Data", key: false, desc: "As-5, Area A, Grid 1-2" },
      { name: "gps_lat", type: "Float", key: false, desc: "Koordinat GPS latitude" },
      { name: "gps_lng", type: "Float", key: false, desc: "Koordinat GPS longitude" },
      { name: "image_file", type: "Attach Image", key: false, desc: "File foto" },
      { name: "caption", type: "Data", key: false, desc: "Keterangan foto" },
      { name: "source_doc", type: "Dynamic Link", key: false, desc: "Link ke LHL / BAO / WIR / NCR sumber foto" },
    ]
  },
  {
    name: "EVM_Snapshot",
    label: "EVM Snapshot",
    color: "#f97316",
    icon: "📊",
    type: "DocType (auto-generated)",
    desc: "Rekaman Earned Value Metrics per periode — jadi data historis untuk tren analisis",
    fields: [
      { name: "snapshot_id", type: "Data", key: true, desc: "EVM-2024-PRJ01-012" },
      { name: "project", type: "Link → Project", key: false, desc: "" },
      { name: "snapshot_date", type: "Date", key: false, desc: "Tanggal snapshot (biasanya per BAO)" },
      { name: "bao_ref", type: "Link → Progress_Opname", key: false, desc: "BAO yang trigger snapshot ini" },
      { name: "planned_value_pct", type: "Percent", key: false, desc: "PV% dari kurva S baseline" },
      { name: "earned_value_pct", type: "Percent", key: false, desc: "EV% = progress aktual yang diakui" },
      { name: "actual_cost_pct", type: "Percent", key: false, desc: "AC% = biaya aktual / nilai kontrak" },
      { name: "planned_value", type: "Currency", key: false, desc: "PV = PV% × contract_value" },
      { name: "earned_value", type: "Currency", key: false, desc: "EV = EV% × contract_value" },
      { name: "actual_cost", type: "Currency", key: false, desc: "AC dari akumulasi biaya aktual" },
      { name: "schedule_variance", type: "Currency", key: false, desc: "SV = EV − PV (negatif = terlambat)" },
      { name: "cost_variance", type: "Currency", key: false, desc: "CV = EV − AC (negatif = over-budget)" },
      { name: "spi", type: "Float", key: false, desc: "SPI = EV / PV (< 1 terlambat)" },
      { name: "cpi", type: "Float", key: false, desc: "CPI = EV / AC (< 1 over-budget)" },
      { name: "eac", type: "Currency", key: false, desc: "EAC = BAC / CPI (perkiraan biaya akhir)" },
      { name: "etc", type: "Currency", key: false, desc: "ETC = EAC − AC (sisa biaya yang diperkirakan)" },
      { name: "projected_end_date", type: "Date", key: false, desc: "Perkiraan selesai berdasarkan tren SPI" },
      { name: "delay_days", type: "Int", key: false, desc: "Estimasi keterlambatan (hari)" },
    ]
  },
];

const RELATIONS = [
  { from: "RAB_Header", to: "Project_Baseline", label: "1 → 1", desc: "RAB approved jadi sumber WBS & nilai baseline" },
  { from: "Project_Baseline", to: "WBS_Item", label: "1 → N", desc: "Baseline punya banyak item WBS" },
  { from: "Project_Baseline", to: "SCurve_Distribution", label: "1 → N", desc: "Baseline punya distribusi per periode" },
  { from: "Daily_Report", to: "Daily_Work_Item", label: "1 → N", desc: "Satu LHL punya banyak baris item kerja" },
  { from: "Daily_Report", to: "Daily_Labour", label: "1 → N", desc: "Satu LHL catat banyak kategori tenaga kerja" },
  { from: "Daily_Work_Item", to: "WBS_Item", label: "N → 1", desc: "Banyak LHL bisa update satu WBS item" },
  { from: "Progress_Opname", to: "Opname_Item_Detail", label: "1 → N", desc: "Satu BAO punya detail per item WBS" },
  { from: "Opname_Item_Detail", to: "WBS_Item", label: "N → 1", desc: "Detail opname update volume aktual WBS item" },
  { from: "WBS_Item", to: "Quality_Inspection", label: "1 → N", desc: "Satu item bisa punya banyak WIR" },
  { from: "Quality_Inspection", to: "QC_Checklist_Item", label: "1 → N", desc: "Satu WIR punya banyak poin checklist" },
  { from: "Quality_Inspection", to: "NCR", label: "1 → N", desc: "Satu WIR bisa hasilkan banyak NCR" },
  { from: "Progress_Opname", to: "EVM_Snapshot", label: "1 → 1", desc: "Setiap BAO approved trigger snapshot EVM" },
  { from: "Photo_Documentation", to: "WBS_Item", label: "N → 1", desc: "Banyak foto ter-tag ke satu item WBS" },
];

const EVM_EXAMPLE = [
  { period: "Bln 1", pv: 8, ev: 7.5, ac: 7.8 },
  { period: "Bln 2", pv: 18, ev: 15, ac: 16.5 },
  { period: "Bln 3", pv: 30, ev: 24, ac: 27 },
  { period: "Bln 4", pv: 45, ev: 36, ac: 41 },
  { period: "Bln 5", pv: 62, ev: 50, ac: 58 },
  { period: "Bln 6", pv: 78, ev: 64, ac: 75 },
];

const fmt = (n) => n.toLocaleString("id-ID");
const TAG = ({ color, children }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 4, padding: "1px 7px", fontSize: "0.68rem", fontFamily: FONT, fontWeight: 700, whiteSpace: "nowrap" }}>
    {children}
  </span>
);

const Bar = ({ pv, ev, ac, height = 80 }) => {
  const max = Math.max(pv, ev, ac, 1);
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height }}>
      {[{ v: pv, c: "#0ea5e9" }, { v: ev, c: "#10b981" }, { v: ac, c: "#ef4444" }].map((b, i) => (
        <div key={i} style={{ width: 10, background: b.c, height: `${(b.v / max) * height}px`, borderRadius: "2px 2px 0 0", opacity: 0.85 }} />
      ))}
    </div>
  );
};

export default function ProgressOpnameLapangan() {
  const [section, setSection] = useState("flow");
  const [activeStep, setActiveStep] = useState(0);
  const [activeModel, setActiveModel] = useState(0);
  const step = FLOW_STEPS[activeStep];

  return (
    <div style={{ background: "#060910", minHeight: "100vh", color: "#cbd5e1", fontFamily: SANS }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #0b1120 0%, #060910 100%)", borderBottom: "1px solid #162032", padding: "2rem 1.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ fontFamily: FONT, fontSize: "0.62rem", color: "#2d4a6a", letterSpacing: 5, textTransform: "uppercase", marginBottom: 6 }}>Custom Feature #3 — Deep Dive</div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#f0f6ff", lineHeight: 1.2 }}>
            Progress & Opname Lapangan
          </h1>
          <p style={{ color: "#3d5a7a", margin: "0.5rem 0 0", fontSize: "0.875rem" }}>
            LHL Harian · Kurva S · Berita Acara Opname · QC / NCR · EVM · Dokumentasi Foto
          </p>
        </div>
      </div>

      {/* Nav */}
      <div style={{ borderBottom: "1px solid #162032", background: "#060910", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 1.5rem", display: "flex", gap: 0, overflowX: "auto" }}>
          {[
            { key: "flow", label: "🔄 Alur & Cara Kerja" },
            { key: "model", label: "🗄️ Model Data" },
            { key: "evm", label: "📈 Simulasi Kurva S & EVM" },
            { key: "relation", label: "🔗 Relasi Tabel" },
          ].map(n => (
            <button key={n.key} onClick={() => setSection(n.key)}
              style={{ padding: "0.85rem 1.1rem", background: "none", border: "none", borderBottom: section === n.key ? "2px solid #f59e0b" : "2px solid transparent", color: section === n.key ? "#f59e0b" : "#2d4a6a", fontFamily: SANS, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "1.5rem" }}>

        {/* FLOW */}
        {section === "flow" && (
          <div style={{ display: "grid", gridTemplateColumns: "215px 1fr", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {FLOW_STEPS.map((s, i) => (
                <button key={i} onClick={() => setActiveStep(i)}
                  style={{ textAlign: "left", padding: "0.6rem 0.8rem", background: activeStep === i ? s.color + "18" : "#0b1120", border: `1px solid ${activeStep === i ? s.color : "#162032"}`, borderRadius: 8, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    <span style={{ fontSize: 15 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontFamily: FONT, fontSize: "0.58rem", color: activeStep === i ? s.color : "#2d4a6a", letterSpacing: 2 }}>{s.phase}</div>
                      <div style={{ color: activeStep === i ? "#f0f6ff" : "#475569", fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.3 }}>{s.title}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ background: "#0b1120", border: `1px solid ${step.color}40`, borderRadius: 12, padding: "1.4rem", borderTop: `3px solid ${step.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "0.75rem" }}>
                <span style={{ fontSize: 26 }}>{step.icon}</span>
                <div>
                  <div style={{ fontFamily: FONT, fontSize: "0.62rem", color: step.color, letterSpacing: 3 }}>FASE {step.id} · {step.phase}</div>
                  <h2 style={{ margin: 0, color: "#f0f6ff", fontSize: "1.05rem", fontWeight: 700 }}>{step.title}</h2>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: "0.85rem", flexWrap: "wrap" }}>
                <TAG color={step.color}>{step.actor}</TAG>
              </div>
              <p style={{ color: "#7a9ab8", fontSize: "0.84rem", lineHeight: 1.75, margin: "0 0 1rem" }}>{step.desc}</p>
              <div style={{ fontFamily: FONT, fontSize: "0.6rem", color: "#2d4a6a", letterSpacing: 2, marginBottom: 8 }}>DETAIL PROSES:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: "1rem" }}>
                {step.actions.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "0.55rem 0.8rem", background: "#060910", borderRadius: 6, borderLeft: `2px solid ${step.color}50` }}>
                    <span style={{ color: step.color, fontFamily: FONT, fontSize: "0.65rem", minWidth: 20 }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ color: "#7a9ab8", fontSize: "0.82rem", lineHeight: 1.6 }}>{a}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: step.color + "12", border: `1px solid ${step.color}30`, borderRadius: 8, padding: "0.7rem 0.9rem", marginBottom: step.warning ? "0.75rem" : 0 }}>
                <span style={{ fontFamily: FONT, fontSize: "0.6rem", color: step.color, letterSpacing: 2 }}>OUTPUT → </span>
                <span style={{ color: "#e2f0ff", fontSize: "0.82rem" }}>{step.output}</span>
              </div>
              {step.warning && (
                <div style={{ background: "#f59e0b0f", border: "1px solid #f59e0b30", borderRadius: 8, padding: "0.7rem 0.9rem", display: "flex", gap: 8 }}>
                  <span>⚠️</span>
                  <span style={{ color: "#fcd34d", fontSize: "0.8rem" }}>{step.warning}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODEL */}
        {section === "model" && (
          <div style={{ display: "grid", gridTemplateColumns: "215px 1fr", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {DATA_MODELS.map((m, i) => (
                <button key={i} onClick={() => setActiveModel(i)}
                  style={{ textAlign: "left", padding: "0.6rem 0.8rem", background: activeModel === i ? m.color + "18" : "#0b1120", border: `1px solid ${activeModel === i ? m.color : "#162032"}`, borderRadius: 8, cursor: "pointer" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 13 }}>{m.icon}</span>
                    <div>
                      <div style={{ color: activeModel === i ? "#f0f6ff" : "#475569", fontSize: "0.73rem", fontWeight: 700 }}>{m.label}</div>
                      <div style={{ fontFamily: FONT, fontSize: "0.57rem", color: activeModel === i ? m.color : "#2d4a6a" }}>{m.type}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {(() => {
              const m = DATA_MODELS[activeModel];
              return (
                <div style={{ background: "#0b1120", border: `1px solid ${m.color}40`, borderRadius: 12, padding: "1.2rem", borderTop: `3px solid ${m.color}` }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <span style={{ color: "#f0f6ff", fontWeight: 700, fontSize: "1rem" }}>{m.label}</span>
                    <TAG color={m.color}>{m.type}</TAG>
                    <span style={{ marginLeft: "auto", fontFamily: FONT, fontSize: "0.62rem", color: "#2d4a6a" }}>{m.fields.length} fields</span>
                  </div>
                  <p style={{ color: "#3d5a7a", margin: "0 0 1rem", fontSize: "0.78rem" }}>{m.desc}</p>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                      <thead>
                        <tr style={{ background: "#060910" }}>
                          {["Field Name", "Type", "Keterangan"].map(h => (
                            <th key={h} style={{ padding: "0.45rem 0.7rem", textAlign: "left", color: "#2d4a6a", fontFamily: FONT, fontSize: "0.6rem", letterSpacing: 2, borderBottom: "1px solid #162032", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {m.fields.map((f, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #0a1020", background: f.key ? m.color + "08" : "transparent" }}>
                            <td style={{ padding: "0.45rem 0.7rem", fontFamily: FONT, color: f.key ? m.color : "#7a9ab8", fontSize: "0.7rem", whiteSpace: "nowrap" }}>{f.key && "🔑 "}{f.name}</td>
                            <td style={{ padding: "0.45rem 0.7rem", whiteSpace: "nowrap" }}>
                              <TAG color={
                                f.type.startsWith("Link") ? "#0ea5e9" :
                                f.type === "Currency" ? "#10b981" :
                                f.type === "Select" ? "#8b5cf6" :
                                f.type === "Date" ? "#f59e0b" :
                                f.type.startsWith("Attach") ? "#f97316" :
                                f.type === "Check" ? "#ec4899" :
                                f.type === "Percent" ? "#06b6d4" :
                                "#475569"
                              }>{f.type}</TAG>
                            </td>
                            <td style={{ padding: "0.45rem 0.7rem", color: "#3d5a7a", fontSize: "0.71rem" }}>{f.desc}</td>
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

        {/* EVM SIMULATION */}
        {section === "evm" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Legend */}
            <div style={{ background: "#0b1120", border: "1px solid #162032", borderRadius: 12, padding: "1.2rem" }}>
              <div style={{ fontFamily: FONT, fontSize: "0.6rem", color: "#2d4a6a", letterSpacing: 3, marginBottom: "1rem", textTransform: "uppercase" }}>📈 Simulasi Kurva S & Earned Value (Proyek Terlambat)</div>
              <div style={{ display: "flex", gap: 16, marginBottom: "1.2rem", flexWrap: "wrap" }}>
                {[{ c: "#0ea5e9", l: "PV — Planned Value (Rencana)" }, { c: "#10b981", l: "EV — Earned Value (Realisasi Progress)" }, { c: "#ef4444", l: "AC — Actual Cost (Biaya Aktual)" }].map((x, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    <div style={{ width: 24, height: 4, background: x.c, borderRadius: 2 }} />
                    <span style={{ color: "#7a9ab8", fontSize: "0.78rem" }}>{x.l}</span>
                  </div>
                ))}
              </div>
              {/* Chart */}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", padding: "1rem 0.5rem 0.5rem", borderBottom: "1px solid #162032", overflowX: "auto" }}>
                {EVM_EXAMPLE.map((d, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 70 }}>
                    <Bar pv={d.pv} ev={d.ev} ac={d.ac} height={120} />
                    <div style={{ fontFamily: FONT, fontSize: "0.65rem", color: "#2d4a6a" }}>{d.period}</div>
                    <div style={{ fontFamily: FONT, fontSize: "0.6rem", color: "#0ea5e9" }}>{d.pv}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* EVM Table */}
            <div style={{ background: "#0b1120", border: "1px solid #162032", borderRadius: 12, padding: "1.2rem" }}>
              <div style={{ fontFamily: FONT, fontSize: "0.6rem", color: "#2d4a6a", letterSpacing: 3, marginBottom: "1rem", textTransform: "uppercase" }}>🧮 Kalkulasi EVM per Periode (nilai dalam % dari kontrak)</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.76rem" }}>
                  <thead>
                    <tr style={{ background: "#060910" }}>
                      {["Periode", "PV%", "EV%", "AC%", "SV%", "CV%", "SPI", "CPI", "Status"].map(h => (
                        <th key={h} style={{ padding: "0.45rem 0.65rem", textAlign: "center", color: "#2d4a6a", fontFamily: FONT, fontSize: "0.6rem", letterSpacing: 1, borderBottom: "1px solid #162032", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {EVM_EXAMPLE.map((d, i) => {
                      const sv = (d.ev - d.pv).toFixed(1);
                      const cv = (d.ev - d.ac).toFixed(1);
                      const spi = (d.ev / d.pv).toFixed(2);
                      const cpi = (d.ev / d.ac).toFixed(2);
                      const late = parseFloat(spi) < 1;
                      const over = parseFloat(cpi) < 1;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #0a1020" }}>
                          <td style={{ padding: "0.5rem 0.65rem", textAlign: "center", fontFamily: FONT, color: "#7a9ab8", fontSize: "0.72rem" }}>{d.period}</td>
                          <td style={{ padding: "0.5rem 0.65rem", textAlign: "center", color: "#0ea5e9", fontFamily: FONT, fontSize: "0.72rem" }}>{d.pv}%</td>
                          <td style={{ padding: "0.5rem 0.65rem", textAlign: "center", color: "#10b981", fontFamily: FONT, fontSize: "0.72rem" }}>{d.ev}%</td>
                          <td style={{ padding: "0.5rem 0.65rem", textAlign: "center", color: "#ef4444", fontFamily: FONT, fontSize: "0.72rem" }}>{d.ac}%</td>
                          <td style={{ padding: "0.5rem 0.65rem", textAlign: "center", color: parseFloat(sv) < 0 ? "#ef4444" : "#10b981", fontFamily: FONT, fontSize: "0.72rem" }}>{sv}%</td>
                          <td style={{ padding: "0.5rem 0.65rem", textAlign: "center", color: parseFloat(cv) < 0 ? "#ef4444" : "#10b981", fontFamily: FONT, fontSize: "0.72rem" }}>{cv}%</td>
                          <td style={{ padding: "0.5rem 0.65rem", textAlign: "center" }}><TAG color={late ? "#ef4444" : "#10b981"}>{spi}</TAG></td>
                          <td style={{ padding: "0.5rem 0.65rem", textAlign: "center" }}><TAG color={over ? "#ef4444" : "#10b981"}>{cpi}</TAG></td>
                          <td style={{ padding: "0.5rem 0.65rem", textAlign: "center", fontSize: "0.7rem" }}>
                            {late && over ? "⚠️ Terlambat + Over" : late ? "🕐 Terlambat" : over ? "💸 Over Budget" : "✅ On Track"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 12, background: "#060910", borderRadius: 8, padding: "0.85rem 1rem", fontFamily: FONT, fontSize: "0.7rem", color: "#3d5a7a", lineHeight: 2 }}>
                <span style={{ color: "#f0f6ff", fontWeight: 700 }}>Formula EVM:</span><br />
                <span style={{ color: "#0ea5e9" }}>PV</span> = Target % dari kurva S × Nilai Kontrak{"  "}|{"  "}
                <span style={{ color: "#10b981" }}>EV</span> = Progress aktual diakui × Nilai Kontrak{"  "}|{"  "}
                <span style={{ color: "#ef4444" }}>AC</span> = Biaya aktual yang dikeluarkan<br />
                <span style={{ color: "#8b5cf6" }}>SPI = EV/PV</span> → {"< 1 terlambat  "}|{"  "}
                <span style={{ color: "#f59e0b" }}>CPI = EV/AC</span> → {"< 1 over-budget"}{"  "}|{"  "}
                <span style={{ color: "#ec4899" }}>EAC = BAC/CPI</span> → Estimasi biaya akhir proyek
              </div>
            </div>

            {/* Bobot progress formula */}
            <div style={{ background: "#0b1120", border: "1px solid #162032", borderRadius: 12, padding: "1.2rem" }}>
              <div style={{ fontFamily: FONT, fontSize: "0.6rem", color: "#2d4a6a", letterSpacing: 3, marginBottom: "0.9rem", textTransform: "uppercase" }}>⚖️ Cara Hitung % Progress Proyek Keseluruhan</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                {[
                  { step: "1. Bobot Item", color: "#0ea5e9", formula: "Bobot Item = Nilai Item RAB / Total Nilai Kontrak × 100%", example: "Pekerjaan Struktur Rp 300jt / Rp 1M = 30%" },
                  { step: "2. Progress Item", color: "#10b981", formula: "Progress Item = Volume Opname / Volume Kontrak × 100%", example: "250 m³ / 500 m³ × 100% = 50%" },
                  { step: "3. Kontribusi Item", color: "#f59e0b", formula: "Kontribusi = Bobot Item × Progress Item", example: "30% × 50% = 15% kontribusi ke total" },
                  { step: "4. Progress Total", color: "#ec4899", formula: "Progress Total = Σ Kontribusi semua item", example: "Σ(Bobot_i × Progress_i) = 64% total progress" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#060910", borderRadius: 8, padding: "0.9rem", borderLeft: `3px solid ${s.color}` }}>
                    <div style={{ color: s.color, fontWeight: 700, fontSize: "0.8rem", marginBottom: 6 }}>{s.step}</div>
                    <div style={{ fontFamily: FONT, fontSize: "0.68rem", color: "#7a9ab8", lineHeight: 1.7, marginBottom: 6 }}>{s.formula}</div>
                    <div style={{ fontFamily: FONT, fontSize: "0.66rem", color: "#3d5a7a", lineHeight: 1.5 }}>Contoh: {s.example}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RELATION */}
        {section === "relation" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#0b1120", border: "1px solid #162032", borderRadius: 12, padding: "1.3rem" }}>
              <div style={{ fontFamily: FONT, fontSize: "0.6rem", color: "#2d4a6a", letterSpacing: 3, marginBottom: "1rem", textTransform: "uppercase" }}>🔗 Relasi Antar DocType</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {RELATIONS.map((r, i) => {
                  const fm = DATA_MODELS.find(d => d.name === r.from) || { color: "#475569" };
                  const tm = DATA_MODELS.find(d => d.name === r.to) || { color: "#475569" };
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.6rem 0.9rem", background: "#060910", borderRadius: 7, flexWrap: "wrap" }}>
                      <span style={{ color: fm.color, fontFamily: FONT, fontSize: "0.7rem", fontWeight: 700, minWidth: 155 }}>{r.from}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 16, height: 1, background: "#162032" }} />
                        <TAG color="#475569">{r.label}</TAG>
                        <div style={{ width: 16, height: 1, background: "#162032" }} />
                      </div>
                      <span style={{ color: tm.color, fontFamily: FONT, fontSize: "0.7rem", fontWeight: 700, minWidth: 155 }}>{r.to}</span>
                      <span style={{ color: "#2d4a6a", fontSize: "0.74rem", flex: 1 }}>{r.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ background: "#0b1120", border: "1px solid #162032", borderRadius: 12, padding: "1.3rem" }}>
              <div style={{ fontFamily: FONT, fontSize: "0.6rem", color: "#2d4a6a", letterSpacing: 3, marginBottom: "0.9rem", textTransform: "uppercase" }}>⚙️ Otomasi Sistem yang Perlu Dibangun</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                {[
                  { trigger: "LHL harian di-submit", action: "Auto-update volume aktual di WBS_Item", color: "#10b981" },
                  { trigger: "BAO di-approve", action: "Auto-generate EVM_Snapshot + update SCurve_Distribution actual", color: "#f59e0b" },
                  { trigger: "BAO di-lock", action: "Auto-buat Invoice ke Owner (link ke modul Billing)", color: "#ec4899" },
                  { trigger: "WIR result = FAIL", action: "Auto-buat NCR dan assign ke pelaksana terkait", color: "#ef4444" },
                  { trigger: "NCR overdue", action: "Auto-kirim notifikasi ke PM dan Site Manager", color: "#f97316" },
                  { trigger: "SPI < 0.85", action: "Auto-trigger alert eskalasi ke Direktur + saran recovery", color: "#8b5cf6" },
                  { trigger: "LHL tidak diisi 24 jam", action: "Auto-reminder ke pelaksana + Site Manager", color: "#0ea5e9" },
                  { trigger: "Dokumen subkon expiry < 30 hari", action: "Auto-alert ke Procurement untuk perpanjangan", color: "#64748b" },
                ].map((a, i) => (
                  <div key={i} style={{ background: "#060910", borderRadius: 8, padding: "0.85rem", borderLeft: `3px solid ${a.color}` }}>
                    <div style={{ fontFamily: FONT, fontSize: "0.62rem", color: "#2d4a6a", marginBottom: 4 }}>TRIGGER:</div>
                    <div style={{ color: a.color, fontSize: "0.78rem", fontWeight: 600, marginBottom: 6 }}>{a.trigger}</div>
                    <div style={{ fontFamily: FONT, fontSize: "0.62rem", color: "#2d4a6a", marginBottom: 4 }}>ACTION:</div>
                    <div style={{ color: "#7a9ab8", fontSize: "0.76rem", lineHeight: 1.5 }}>{a.action}</div>
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
