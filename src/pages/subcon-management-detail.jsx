import { useState } from "react";

const FONT = "'Courier New', monospace";
const SANS = "'Georgia', serif";

const FLOW_STEPS = [
	{
		id: 1,
		phase: "REGISTRASI",
		color: "#06b6d4",
		icon: "📋",
		title: "Database & Kualifikasi Subkon",
		actor: "Procurement / Admin Kontrak",
		desc: "Sebelum subkon bisa dikontrak, mereka harus terdaftar dan lulus kualifikasi. Ini mencegah penggunaan subkon tidak kompeten atau bermasalah.",
		actions: [
			"Subkon mengisi form pendaftaran: data perusahaan, bidang keahlian, kapasitas pekerjaan",
			"Upload dokumen legal: SIUJK, SKK, NPWP, Akta Perusahaan, BPJS Ketenagakerjaan",
			"Tim Procurement verifikasi dokumen — set masa berlaku tiap dokumen",
			"Evaluasi track record: pengalaman proyek sejenis, referensi dari proyek lain",
			"Penilaian awal: kemampuan finansial, peralatan yang dimiliki, jumlah tenaga ahli",
			"Status subkon ditetapkan: Approved Vendor / Conditional / Blacklist",
			"Sistem otomatis kirim alert 30/60 hari sebelum dokumen kadaluarsa",
		],
		output:
			"Subkon terdaftar di Vendor Master dengan status kualifikasi yang jelas",
		warning:
			"Subkon dengan status non-Approved tidak bisa dipilih saat membuat kontrak",
	},
	{
		id: 2,
		phase: "PENGADAAN",
		color: "#8b5cf6",
		icon: "📨",
		title: "Seleksi & Proses Tender Subkon",
		actor: "PM / Procurement Officer",
		desc: "PM mengidentifikasi pekerjaan yang akan disubkonkan, lalu Procurement menjalankan proses seleksi untuk mendapat harga terbaik.",
		actions: [
			"PM buat Subcon Work Package: definisi scope, volume, spesifikasi teknis pekerjaan",
			"Link ke item RAB yang relevan → sistem tampilkan budget tersedia untuk pekerjaan ini",
			"Procurement kirim undangan penawaran (RFQ) ke minimal 3 subkon qualified",
			"Subkon submit penawaran harga dalam form terstandar (breakdown upah, material, alat jika supply & install)",
			"Procurement buat tabel perbandingan penawaran (bid comparison matrix)",
			"PM + Procurement evaluasi: harga, metode kerja, jadwal, reputasi",
			"Negosiasi harga dengan subkon terpilih",
			"Approval internal untuk nilai di atas threshold tertentu (PM → Direktur)",
		],
		output:
			"Subkon terpilih dengan harga dan scope yang disepakati, siap dikontrak",
		warning: null,
	},
	{
		id: 3,
		phase: "KONTRAK",
		color: "#f59e0b",
		icon: "✍️",
		title: "Penerbitan Kontrak Subkon",
		actor: "PM / Legal / Direktur",
		desc: "Kontrak subkon adalah dokumen hukum yang mengatur hak dan kewajiban kedua pihak. Strukturnya harus menutup semua risiko proyek.",
		actions: [
			"Generate draft kontrak dari template standar perusahaan",
			"Isi detail: scope pekerjaan detail (mengacu ke BOQ subkon), nilai kontrak, jadwal mulai-selesai",
			"Tentukan term pembayaran: termin berbasis progress, DP jika ada",
			"Set nilai retensi (biasanya 5% dari setiap tagihan, max 10% dari nilai kontrak)",
			"Tentukan denda keterlambatan (misal 1‰ per hari dari nilai kontrak, max 5%)",
			"Klausul garansi pekerjaan / masa pemeliharaan (FHO ke subkon)",
			"Review Legal → tandatangan kedua pihak (bisa e-sign)",
			"Kontrak resmi aktif → nomor kontrak terdaftar di sistem",
		],
		output:
			"Kontrak Subkon resmi dengan semua klausul, tersimpan di sistem dan ter-link ke proyek",
		warning:
			"Subkon tidak boleh mulai bekerja sebelum kontrak ditandatangani dan SPK diterbitkan",
	},
	{
		id: 4,
		phase: "MOBILISASI",
		color: "#10b981",
		icon: "🚀",
		title: "SPK & Mobilisasi Lapangan",
		actor: "PM / Site Manager",
		desc: "Setelah kontrak aktif, PM menerbitkan Surat Perintah Kerja (SPK) sebagai instruksi resmi untuk subkon mulai bekerja.",
		actions: [
			"PM terbitkan SPK: tanggal mulai, area kerja, scope spesifik yang boleh dikerjakan",
			"Subkon lakukan mobilisasi: personil, peralatan, material ke lokasi",
			"Site Manager verifikasi personil subkon: cek SKK/sertifikat, induction K3",
			"Input data personil subkon ke sistem (nama, jabatan, no KTP, sertifikat)",
			"Alokasi area kerja di layout proyek — tidak overlap dengan subkon lain",
			"Kick-off meeting: pembahasan jadwal detail, metode kerja, koordinasi dengan sub lain",
			"Setup tracking: baseline schedule subkon diinput ke sistem",
		],
		output:
			"Subkon aktif di lapangan dengan data personil, jadwal, dan area kerja terdokumentasi",
		warning: null,
	},
	{
		id: 5,
		phase: "MONITORING",
		color: "#3b82f6",
		icon: "📊",
		title: "Progress & Opname Lapangan",
		actor: "Site Manager / Pengawas / Quality Inspector",
		desc: "Ini adalah proses paling intensif — pengukuran dan verifikasi progress subkon secara berkala sebagai dasar pembayaran.",
		actions: [
			"Subkon submit laporan progres harian/mingguan via form digital",
			"Site Manager verifikasi progress di lapangan — pengukuran fisik per item pekerjaan",
			"Buat Berita Acara Opname (BAO): catat volume terpasang per item BOQ subkon",
			"Quality Inspector checklist kualitas pekerjaan per item — pass/fail per standar spesifikasi",
			"Jika ada Non-Conformance (NCR): catat, foto, instruksi perbaikan ke subkon",
			"Setelah QC pass → volume di-approve, diakumulasi ke progress total subkon",
			"Update kurva S subkon: rencana vs realisasi — identifikasi deviasi jadwal",
			"Jika progress tertinggal >10% → formal warning letter ke subkon",
		],
		output:
			"BA Opname ter-approve dengan volume terverifikasi → jadi dasar tagihan subkon",
		warning:
			"Subkon TIDAK BOLEH tagih lebih dari volume yang sudah di-approve di BA Opname",
	},
	{
		id: 6,
		phase: "PEMBAYARAN",
		color: "#ec4899",
		icon: "💳",
		title: "Invoice & Pembayaran Subkon",
		actor: "Subkon → PM → Finance",
		desc: "Proses pembayaran terstruktur berbasis BA Opname yang sudah diverifikasi, dengan pemotongan retensi dan DP secara otomatis.",
		actions: [
			"Subkon submit invoice + lampirkan BA Opname yang sudah di-approve",
			"Sistem kalkulasi otomatis: Nilai Tagihan = Volume Opname × Harga Satuan Kontrak",
			"Deduct DP (Uang Muka): jika ada DP, dipotong proporsional setiap termin",
			"Deduct Retensi: potong 5% dari nilai bersih → masuk ke Retention Account",
			"Tampilkan nilai bersih yang akan dibayar ke subkon",
			"PM approve kewajaran invoice vs BA Opname",
			"Finance Officer approve → kirim ke accounting untuk proses pembayaran",
			"Setelah transfer → update status invoice: Paid + tanggal bayar",
			"Akumulasi semua pembayaran vs nilai kontrak → % progress pembayaran",
		],
		output:
			"Invoice terbayar dengan deduction DP & retensi tercatat rapi per termin",
		warning:
			"Total pembayaran tidak boleh melebihi nilai kontrak + CO yang sudah approved",
	},
	{
		id: 7,
		phase: "SELESAI",
		color: "#f97316",
		icon: "🏁",
		title: "PHO, FHO & Pencairan Retensi",
		actor: "PM / Site Manager / Finance",
		desc: "Penyelesaian kontrak subkon meliputi serah terima pekerjaan dan pencairan retensi setelah masa pemeliharaan selesai.",
		actions: [
			"Subkon ajukan penyelesaian pekerjaan → PM verifikasi 100% item BOQ selesai dan QC pass",
			"Berita Acara PHO (Provisional Hand Over): serah terima pertama, pekerjaan selesai",
			"Masa pemeliharaan berjalan (sesuai kontrak, biasanya 90-180 hari)",
			"Selama masa pemeliharaan: subkon wajib perbaiki defect yang ditemukan",
			"Setelah masa pemeliharaan selesai → inspeksi final, buat BA FHO",
			"FHO approved → unlock retensi subkon untuk dicairkan",
			"Finance proses pembayaran retensi ke subkon",
			"Update performance rating subkon: kualitas, waktu, kooperatif",
			"Tutup kontrak di sistem → status: Completed",
		],
		output:
			"Kontrak subkon selesai resmi, retensi cair, performance rating terupdate",
		warning:
			"Retensi TIDAK boleh dicairkan sebelum BA FHO ditandatangani kedua pihak",
	},
	{
		id: 8,
		phase: "EVALUASI",
		color: "#64748b",
		icon: "⭐",
		title: "Performance Rating & Vendor Database Update",
		actor: "PM / Procurement",
		desc: "Data performance proyek lalu digunakan untuk menentukan apakah subkon layak digunakan di proyek berikutnya.",
		actions: [
			"PM isi form evaluasi subkon setelah proyek selesai",
			"Penilaian per kategori: Kualitas Pekerjaan, Ketepatan Waktu, Keselamatan K3, Kooperatif, Administrasi",
			"Sistem hitung score total → update di vendor master",
			"Jika score di bawah minimum → status turun jadi Conditional atau Blacklist",
			"Jika ada insiden K3 fatal → auto-blacklist pending investigasi",
			"Histori semua proyek subkon tersimpan → bisa jadi referensi PM lain",
			"Update kapasitas: apakah subkon bisa handle proyek lebih besar",
		],
		output:
			"Vendor master terupdate → jadi acuan pemilihan subkon proyek berikutnya",
		warning: null,
	},
];

const DATA_MODELS = [
	{
		name: "Subcon_Vendor",
		label: "Subcon Vendor Master",
		color: "#06b6d4",
		icon: "🏢",
		type: "Master DocType",
		desc: "Database lengkap setiap perusahaan subkontraktor — profil, legalitas, kualifikasi",
		fields: [
			{ name: "vendor_id", type: "Data", key: true, desc: "SUB-2024-001" },
			{
				name: "company_name",
				type: "Data",
				key: false,
				desc: "PT Maju Bersama Konstruksi",
			},
			{
				name: "vendor_code",
				type: "Data",
				key: false,
				desc: "Kode unik internal",
			},
			{ name: "npwp", type: "Data", key: false, desc: "Nomor NPWP" },
			{ name: "siujk_no", type: "Data", key: false, desc: "No SIUJK" },
			{
				name: "siujk_expiry",
				type: "Date",
				key: false,
				desc: "Kadaluarsa SIUJK → trigger alert",
			},
			{
				name: "sbu_grade",
				type: "Select",
				key: false,
				desc: "K1/K2/K3/M1/M2/B (grading LPJK)",
			},
			{
				name: "specialization",
				type: "Table MultiSelect",
				key: false,
				desc: "Sipil / Mekanikal / Elektrikal / Finishing",
			},
			{
				name: "max_contract_value",
				type: "Currency",
				key: false,
				desc: "Kapasitas max nilai kontrak",
			},
			{
				name: "status",
				type: "Select",
				key: false,
				desc: "Approved / Conditional / Blacklist / Pending",
			},
			{
				name: "blacklist_reason",
				type: "Text",
				key: false,
				desc: "Alasan jika blacklist",
			},
			{
				name: "avg_performance_score",
				type: "Float",
				key: false,
				desc: "Rata-rata score dari semua proyek (0-100)",
			},
			{
				name: "total_projects",
				type: "Int",
				key: false,
				desc: "Jumlah proyek yang pernah dikerjakan",
			},
			{
				name: "bank_account",
				type: "Data",
				key: false,
				desc: "No rekening untuk pembayaran",
			},
			{ name: "bank_name", type: "Data", key: false, desc: "" },
			{
				name: "pic_name",
				type: "Data",
				key: false,
				desc: "Nama PIC / direktur",
			},
			{ name: "pic_phone", type: "Data", key: false, desc: "" },
			{ name: "pic_email", type: "Data", key: false, desc: "" },
		],
	},
	{
		name: "Subcon_Document",
		label: "Subcon Document",
		color: "#06b6d4",
		icon: "📎",
		type: "Child of Subcon_Vendor",
		desc: "Dokumen legal subkon dengan tracking kadaluarsa otomatis",
		fields: [
			{
				name: "doc_type",
				type: "Select",
				key: false,
				desc: "SIUJK / SBU / SKK / NPWP / Akta / ISO / BPJS",
			},
			{ name: "doc_number", type: "Data", key: false, desc: "Nomor dokumen" },
			{
				name: "issued_by",
				type: "Data",
				key: false,
				desc: "Instansi penerbit",
			},
			{ name: "issued_date", type: "Date", key: false, desc: "" },
			{
				name: "expiry_date",
				type: "Date",
				key: false,
				desc: "Tanggal kadaluarsa",
			},
			{
				name: "days_to_expiry",
				type: "Int",
				key: false,
				desc: "Auto-calc dari today() − expiry_date",
			},
			{
				name: "status",
				type: "Select",
				key: false,
				desc: "Valid / Expiring Soon / Expired",
			},
			{
				name: "attachment",
				type: "Attach",
				key: false,
				desc: "File scan dokumen",
			},
		],
	},
	{
		name: "Subcon_Work_Package",
		label: "Subcon Work Package",
		color: "#8b5cf6",
		icon: "📦",
		type: "DocType",
		desc: "Definisi scope pekerjaan yang akan disubkonkan — dibuat sebelum proses tender subkon",
		fields: [
			{ name: "wp_id", type: "Data", key: true, desc: "SWP-2024-010" },
			{
				name: "project",
				type: "Link → Project",
				key: false,
				desc: "Link ke proyek ERPNext",
			},
			{
				name: "rab_ref",
				type: "Link → RAB_Header",
				key: false,
				desc: "RAB yang jadi acuan budget",
			},
			{
				name: "work_description",
				type: "Text",
				key: false,
				desc: "Deskripsi scope pekerjaan",
			},
			{
				name: "work_category",
				type: "Select",
				key: false,
				desc: "Sipil / Mekanikal / Elektrikal / Finishing",
			},
			{ name: "planned_start", type: "Date", key: false, desc: "" },
			{ name: "planned_end", type: "Date", key: false, desc: "" },
			{
				name: "budget_from_rab",
				type: "Currency",
				key: false,
				desc: "Auto-fetch dari RAB item terkait",
			},
			{
				name: "owner_supply",
				type: "Check",
				key: false,
				desc: "TRUE jika material disupply kontraktor utama",
			},
			{
				name: "status",
				type: "Select",
				key: false,
				desc: "Draft / Tender / Awarded / Cancelled",
			},
			{
				name: "awarded_to",
				type: "Link → Subcon_Vendor",
				key: false,
				desc: "Subkon yang menang tender",
			},
			{
				name: "awarded_value",
				type: "Currency",
				key: false,
				desc: "Nilai kontrak yang disepakati",
			},
		],
	},
	{
		name: "Subcon_BOQ_Item",
		label: "Subcon BOQ Item",
		color: "#8b5cf6",
		icon: "📝",
		type: "Child of Work_Package",
		desc: "Rincian item pekerjaan dalam scope subkon — mirror dari RAB tapi bisa lebih detail",
		fields: [
			{
				name: "rab_item_ref",
				type: "Link → RAB_Item",
				key: false,
				desc: "Link ke item di RAB utama",
			},
			{
				name: "item_description",
				type: "Data",
				key: false,
				desc: "Deskripsi item pekerjaan",
			},
			{
				name: "unit",
				type: "Link → UOM",
				key: false,
				desc: "Satuan pekerjaan",
			},
			{
				name: "volume_contract",
				type: "Float",
				key: false,
				desc: "Volume per kontrak subkon",
			},
			{
				name: "unit_price_contract",
				type: "Currency",
				key: false,
				desc: "Harga satuan yang disepakati",
			},
			{
				name: "total_contract",
				type: "Currency",
				key: false,
				desc: "volume × unit_price (auto)",
			},
			{
				name: "volume_opname",
				type: "Float",
				key: false,
				desc: "Total volume yang sudah di-opname",
			},
			{
				name: "volume_remaining",
				type: "Float",
				key: false,
				desc: "volume_contract − volume_opname",
			},
			{
				name: "progress_pct",
				type: "Percent",
				key: false,
				desc: "volume_opname / volume_contract × 100",
			},
		],
	},
	{
		name: "Subcon_Contract",
		label: "Subcon Contract",
		color: "#f59e0b",
		icon: "📜",
		type: "DocType Utama",
		desc: "Kontrak resmi antara kontraktor utama dan subkontraktor — dokumen hukum paling penting",
		fields: [
			{
				name: "contract_id",
				type: "Data",
				key: true,
				desc: "KONT-SUB-2024-015",
			},
			{
				name: "work_package",
				type: "Link → Subcon_Work_Package",
				key: false,
				desc: "Referensi work package",
			},
			{
				name: "subcon_vendor",
				type: "Link → Subcon_Vendor",
				key: false,
				desc: "Subkon terpilih",
			},
			{ name: "project", type: "Link → Project", key: false, desc: "" },
			{
				name: "contract_value",
				type: "Currency",
				key: false,
				desc: "Nilai kontrak resmi",
			},
			{
				name: "contract_type",
				type: "Select",
				key: false,
				desc: "Lumpsum / Unit Price / Cost Plus",
			},
			{
				name: "supply_type",
				type: "Select",
				key: false,
				desc: "Jasa Saja / Supply & Install / Full EPC",
			},
			{
				name: "start_date",
				type: "Date",
				key: false,
				desc: "Tanggal mulai kerja",
			},
			{
				name: "end_date",
				type: "Date",
				key: false,
				desc: "Tanggal selesai kontrak",
			},
			{
				name: "dp_value",
				type: "Currency",
				key: false,
				desc: "Nilai uang muka (jika ada)",
			},
			{
				name: "dp_pct",
				type: "Percent",
				key: false,
				desc: "% DP dari nilai kontrak",
			},
			{
				name: "retention_pct",
				type: "Percent",
				key: false,
				desc: "% retensi per tagihan (default 5%)",
			},
			{
				name: "max_retention_pct",
				type: "Percent",
				key: false,
				desc: "Max akumulasi retensi (default 10%)",
			},
			{
				name: "penalty_per_day",
				type: "Currency",
				key: false,
				desc: "Denda keterlambatan per hari",
			},
			{
				name: "penalty_max_pct",
				type: "Percent",
				key: false,
				desc: "Max denda (default 5% dari nilai kontrak)",
			},
			{
				name: "maintenance_period",
				type: "Int",
				key: false,
				desc: "Masa pemeliharaan (hari)",
			},
			{
				name: "status",
				type: "Select",
				key: false,
				desc: "Draft / Active / Completed / Terminated",
			},
			{
				name: "total_paid",
				type: "Currency",
				key: false,
				desc: "Akumulasi pembayaran (auto)",
			},
			{
				name: "total_retention_held",
				type: "Currency",
				key: false,
				desc: "Total retensi yang ditahan (auto)",
			},
			{
				name: "balance_remaining",
				type: "Currency",
				key: false,
				desc: "contract_value − total_paid (auto)",
			},
			{
				name: "pho_date",
				type: "Date",
				key: false,
				desc: "Tanggal PHO (serah terima pertama)",
			},
			{
				name: "fho_date",
				type: "Date",
				key: false,
				desc: "Tanggal FHO (serah terima akhir)",
			},
			{
				name: "contract_doc",
				type: "Attach",
				key: false,
				desc: "File PDF kontrak yang ditandatangani",
			},
		],
	},
	{
		name: "Subcon_Opname",
		label: "Berita Acara Opname",
		color: "#10b981",
		icon: "📏",
		type: "DocType",
		desc: "Pengukuran progress fisik subkon di lapangan — sumber data pembayaran & progress tracking",
		fields: [
			{ name: "opname_id", type: "Data", key: true, desc: "OPN-2024-042" },
			{
				name: "contract",
				type: "Link → Subcon_Contract",
				key: false,
				desc: "Referensi kontrak subkon",
			},
			{
				name: "opname_date",
				type: "Date",
				key: false,
				desc: "Tanggal pengukuran",
			},
			{
				name: "opname_period",
				type: "Data",
				key: false,
				desc: "Periode: Minggu ke-8 / Termin-3",
			},
			{
				name: "measured_by",
				type: "Link → User",
				key: false,
				desc: "Site Manager yang mengukur",
			},
			{
				name: "witnessed_by",
				type: "Data",
				key: false,
				desc: "Nama wakil subkon yang hadir",
			},
			{
				name: "prev_cumulative_pct",
				type: "Percent",
				key: false,
				desc: "Progress kumulatif opname sebelumnya",
			},
			{
				name: "this_opname_pct",
				type: "Percent",
				key: false,
				desc: "Progress yang diakui opname ini",
			},
			{
				name: "cumulative_pct",
				type: "Percent",
				key: false,
				desc: "Total kumulatif s/d opname ini",
			},
			{
				name: "prev_cumulative_value",
				type: "Currency",
				key: false,
				desc: "Nilai kumulatif sebelumnya",
			},
			{
				name: "this_opname_value",
				type: "Currency",
				key: false,
				desc: "Nilai yang diakui opname ini",
			},
			{
				name: "cumulative_value",
				type: "Currency",
				key: false,
				desc: "Total nilai kumulatif",
			},
			{
				name: "qc_status",
				type: "Select",
				key: false,
				desc: "Pass / Conditional Pass / Fail",
			},
			{
				name: "ncr_count",
				type: "Int",
				key: false,
				desc: "Jumlah NCR terbuka",
			},
			{
				name: "status",
				type: "Select",
				key: false,
				desc: "Draft / Submitted / Approved / Rejected",
			},
			{ name: "approved_by", type: "Link → User", key: false, desc: "" },
			{
				name: "photo_docs",
				type: "Attach Multiple",
				key: false,
				desc: "Foto dokumentasi progress",
			},
			{
				name: "ba_document",
				type: "Attach",
				key: false,
				desc: "File BA Opname yang ditandatangani",
			},
		],
	},
	{
		name: "Subcon_Opname_Detail",
		label: "Opname Detail per Item",
		color: "#10b981",
		icon: "🔍",
		type: "Child of Subcon_Opname",
		desc: "Volume terukur per baris BOQ subkon di setiap opname",
		fields: [
			{
				name: "boq_item",
				type: "Link → Subcon_BOQ_Item",
				key: false,
				desc: "Item pekerjaan yang diukur",
			},
			{
				name: "volume_this_opname",
				type: "Float",
				key: false,
				desc: "Volume baru yang diukur opname ini",
			},
			{
				name: "cumulative_volume",
				type: "Float",
				key: false,
				desc: "Total volume kumulatif s/d opname ini",
			},
			{ name: "unit", type: "Link → UOM", key: false, desc: "Satuan" },
			{
				name: "unit_price",
				type: "Currency",
				key: false,
				desc: "Harga satuan dari kontrak",
			},
			{
				name: "value_this_opname",
				type: "Currency",
				key: false,
				desc: "volume_this × unit_price (auto)",
			},
			{
				name: "cumulative_value",
				type: "Currency",
				key: false,
				desc: "Nilai kumulatif (auto)",
			},
			{
				name: "progress_pct",
				type: "Percent",
				key: false,
				desc: "% dari volume kontrak",
			},
			{
				name: "qc_remark",
				type: "Select",
				key: false,
				desc: "OK / NCR / Perlu Perbaikan",
			},
			{
				name: "remark",
				type: "Small Text",
				key: false,
				desc: "Catatan lapangan",
			},
		],
	},
	{
		name: "Subcon_Invoice",
		label: "Subcon Invoice (Tagihan)",
		color: "#ec4899",
		icon: "💳",
		type: "DocType",
		desc: "Tagihan resmi subkon yang sudah diverifikasi — dasar pembayaran dari Finance",
		fields: [
			{ name: "invoice_id", type: "Data", key: true, desc: "INV-SUB-2024-028" },
			{
				name: "contract",
				type: "Link → Subcon_Contract",
				key: false,
				desc: "",
			},
			{
				name: "opname_ref",
				type: "Link → Subcon_Opname",
				key: false,
				desc: "BA Opname yang jadi dasar tagihan",
			},
			{
				name: "invoice_date",
				type: "Date",
				key: false,
				desc: "Tanggal invoice dari subkon",
			},
			{
				name: "invoice_no_subcon",
				type: "Data",
				key: false,
				desc: "Nomor invoice dari subkon",
			},
			{
				name: "termin_number",
				type: "Int",
				key: false,
				desc: "Termin ke berapa",
			},
			{
				name: "gross_amount",
				type: "Currency",
				key: false,
				desc: "Nilai bruto dari opname",
			},
			{
				name: "dp_deduction",
				type: "Currency",
				key: false,
				desc: "Potongan DP proporsional (auto)",
			},
			{
				name: "retention_amount",
				type: "Currency",
				key: false,
				desc: "Potongan retensi 5% (auto)",
			},
			{
				name: "penalty_amount",
				type: "Currency",
				key: false,
				desc: "Denda keterlambatan jika ada",
			},
			{
				name: "other_deduction",
				type: "Currency",
				key: false,
				desc: "Potongan lain (material pinjaman, dll)",
			},
			{
				name: "net_amount",
				type: "Currency",
				key: false,
				desc: "gross − DP − retensi − denda − lain (auto)",
			},
			{
				name: "ppn_amount",
				type: "Currency",
				key: false,
				desc: "PPN jika PKP",
			},
			{
				name: "pph_amount",
				type: "Currency",
				key: false,
				desc: "PPh 4(2) atau PPh 23 (auto)",
			},
			{
				name: "final_payment",
				type: "Currency",
				key: false,
				desc: "Yang benar-benar ditransfer",
			},
			{
				name: "due_date",
				type: "Date",
				key: false,
				desc: "Jatuh tempo pembayaran",
			},
			{
				name: "payment_status",
				type: "Select",
				key: false,
				desc: "Unpaid / Partial / Paid",
			},
			{
				name: "payment_date",
				type: "Date",
				key: false,
				desc: "Tanggal realisasi transfer",
			},
			{
				name: "status",
				type: "Select",
				key: false,
				desc: "Draft / PM Approved / Finance Approved / Paid",
			},
		],
	},
	{
		name: "Subcon_Retention",
		label: "Retention Ledger",
		color: "#f97316",
		icon: "🔒",
		type: "DocType",
		desc: "Ledger khusus tracking retensi per kontrak — berapa yang ditahan, kapan bisa dicairkan",
		fields: [
			{ name: "retention_id", type: "Data", key: true, desc: "RET-2024-015" },
			{
				name: "contract",
				type: "Link → Subcon_Contract",
				key: false,
				desc: "",
			},
			{
				name: "total_contract_value",
				type: "Currency",
				key: false,
				desc: "Nilai kontrak",
			},
			{
				name: "max_retention_value",
				type: "Currency",
				key: false,
				desc: "Max retensi = max_pct × contract_value",
			},
			{
				name: "total_retained",
				type: "Currency",
				key: false,
				desc: "Total yang sudah ditahan (auto-sum)",
			},
			{
				name: "retention_status",
				type: "Select",
				key: false,
				desc: "Accumulating / Capped / PHO Released / FHO Released",
			},
			{
				name: "pho_release_pct",
				type: "Percent",
				key: false,
				desc: "% retensi yang dicairkan saat PHO (default 50%)",
			},
			{
				name: "pho_release_value",
				type: "Currency",
				key: false,
				desc: "Nilai yang dicairkan saat PHO",
			},
			{
				name: "fho_release_value",
				type: "Currency",
				key: false,
				desc: "Sisa retensi yang dicairkan saat FHO",
			},
			{ name: "pho_date", type: "Date", key: false, desc: "" },
			{ name: "fho_date", type: "Date", key: false, desc: "" },
			{
				name: "fho_due_date",
				type: "Date",
				key: false,
				desc: "pho_date + masa_pemeliharaan (auto)",
			},
		],
	},
	{
		name: "Subcon_Performance",
		label: "Subcon Performance Rating",
		color: "#64748b",
		icon: "⭐",
		type: "DocType",
		desc: "Penilaian performa subkon setelah proyek selesai — menentukan status di vendor master",
		fields: [
			{ name: "rating_id", type: "Data", key: true, desc: "RTG-2024-008" },
			{
				name: "contract",
				type: "Link → Subcon_Contract",
				key: false,
				desc: "",
			},
			{ name: "vendor", type: "Link → Subcon_Vendor", key: false, desc: "" },
			{ name: "project", type: "Link → Project", key: false, desc: "" },
			{
				name: "rated_by",
				type: "Link → User",
				key: false,
				desc: "PM yang memberi penilaian",
			},
			{ name: "rating_date", type: "Date", key: false, desc: "" },
			{
				name: "score_quality",
				type: "Float",
				key: false,
				desc: "Kualitas pekerjaan (0-100)",
			},
			{
				name: "score_schedule",
				type: "Float",
				key: false,
				desc: "Ketepatan waktu (0-100)",
			},
			{
				name: "score_safety",
				type: "Float",
				key: false,
				desc: "Kepatuhan K3 (0-100)",
			},
			{
				name: "score_admin",
				type: "Float",
				key: false,
				desc: "Kelengkapan dokumen & administrasi (0-100)",
			},
			{
				name: "score_cooperation",
				type: "Float",
				key: false,
				desc: "Kooperatif & komunikasi (0-100)",
			},
			{
				name: "weighted_score",
				type: "Float",
				key: false,
				desc: "Score akhir (auto weighted average)",
			},
			{
				name: "recommendation",
				type: "Select",
				key: false,
				desc: "Highly Recommended / Recommended / Conditional / Not Recommended",
			},
			{
				name: "notes",
				type: "Text",
				key: false,
				desc: "Catatan tambahan untuk referensi proyek berikutnya",
			},
		],
	},
];

const RELATIONS = [
	{
		from: "Subcon_Vendor",
		to: "Subcon_Document",
		label: "1 → N",
		desc: "Satu vendor punya banyak dokumen legal",
	},
	{
		from: "Subcon_Work_Package",
		to: "Subcon_BOQ_Item",
		label: "1 → N",
		desc: "Satu work package punya banyak item BOQ",
	},
	{
		from: "Subcon_Work_Package",
		to: "Subcon_Contract",
		label: "1 → 1",
		desc: "Satu work package menghasilkan satu kontrak",
	},
	{
		from: "Subcon_Contract",
		to: "Subcon_Opname",
		label: "1 → N",
		desc: "Satu kontrak bisa punya banyak BA opname",
	},
	{
		from: "Subcon_Opname",
		to: "Subcon_Opname_Detail",
		label: "1 → N",
		desc: "Satu opname punya detail per item BOQ",
	},
	{
		from: "Subcon_Opname",
		to: "Subcon_Invoice",
		label: "1 → 1",
		desc: "Satu opname menghasilkan satu invoice termin",
	},
	{
		from: "Subcon_Contract",
		to: "Subcon_Retention",
		label: "1 → 1",
		desc: "Satu kontrak punya satu retention ledger",
	},
	{
		from: "Subcon_Contract",
		to: "Subcon_Performance",
		label: "1 → 1",
		desc: "Satu kontrak dinilai satu kali setelah selesai",
	},
	{
		from: "Subcon_Performance",
		to: "Subcon_Vendor",
		label: "→ update",
		desc: "Score performa update avg_score di vendor master",
	},
	{
		from: "RAB_Item",
		to: "Subcon_BOQ_Item",
		label: "1 → 1",
		desc: "Item BOQ subkon terhubung ke item RAB utama",
	},
];

const CALC_EXAMPLE = {
	contract_value: 500_000_000,
	dp_pct: 20,
	retention_pct: 5,
	termin: [
		{ no: 1, progress: 30, gross: 150_000_000 },
		{ no: 2, progress: 25, gross: 125_000_000 },
		{ no: 3, progress: 25, gross: 125_000_000 },
		{ no: 4, progress: 20, gross: 100_000_000 },
	],
};

const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

const TAG = ({ color, children }) => (
	<span
		style={{
			background: color + "22",
			color,
			border: `1px solid ${color}55`,
			borderRadius: 4,
			padding: "1px 7px",
			fontSize: "0.68rem",
			fontFamily: FONT,
			fontWeight: 700,
			whiteSpace: "nowrap",
		}}>
		{children}
	</span>
);

export default function Subkon() {
	const [section, setSection] = useState("flow");
	const [activeStep, setActiveStep] = useState(0);
	const [activeModel, setActiveModel] = useState(0);

	const step = FLOW_STEPS[activeStep];

	// Compute termin calculations
	const dp_total = (CALC_EXAMPLE.contract_value * CALC_EXAMPLE.dp_pct) / 100;
	const max_retention = CALC_EXAMPLE.contract_value * 0.1;
	let cum_dp_deducted = 0;
	let cum_retention = 0;
	const termins = CALC_EXAMPLE.termin.map((t) => {
		const dp_cut = (t.gross * CALC_EXAMPLE.dp_pct) / 100;
		const ret = Math.min(
			(t.gross * CALC_EXAMPLE.retention_pct) / 100,
			max_retention - cum_retention,
		);
		cum_dp_deducted += dp_cut;
		cum_retention += ret;
		const net = t.gross - dp_cut - ret;
		return { ...t, dp_cut, ret, net, cum_retention };
	});

	return (
		<div
			style={{
				background: "#070a0f",
				minHeight: "100vh",
				color: "#cbd5e1",
				fontFamily: SANS,
			}}>
			{/* Header */}
			<div
				style={{
					background: "linear-gradient(180deg, #0d1117 0%, #070a0f 100%)",
					borderBottom: "1px solid #1a2234",
					padding: "2rem 1.5rem 1.5rem",
				}}>
				<div style={{ maxWidth: 1050, margin: "0 auto" }}>
					<div
						style={{
							fontFamily: FONT,
							fontSize: "0.62rem",
							color: "#3d5068",
							letterSpacing: 5,
							textTransform: "uppercase",
							marginBottom: 6,
						}}>
						Custom Feature #2 — Deep Dive
					</div>
					<h1
						style={{
							margin: 0,
							fontSize: "clamp(1.4rem, 3vw, 2rem)",
							fontWeight: 700,
							color: "#f1f5f9",
							lineHeight: 1.2,
						}}>
						Manajemen Subkontraktor
					</h1>
					<p
						style={{
							color: "#475569",
							margin: "0.5rem 0 0",
							fontSize: "0.875rem",
						}}>
						Kualifikasi · Kontrak · Opname · Pembayaran Termin · Retensi ·
						Performance Rating
					</p>
				</div>
			</div>

			{/* Nav */}
			<div
				style={{
					borderBottom: "1px solid #1a2234",
					background: "#070a0f",
					position: "sticky",
					top: 0,
					zIndex: 100,
				}}>
				<div
					style={{
						maxWidth: 1050,
						margin: "0 auto",
						padding: "0 1.5rem",
						display: "flex",
						gap: 0,
						overflowX: "auto",
					}}>
					{[
						{ key: "flow", label: "🔄 Alur & Cara Kerja" },
						{ key: "model", label: "🗄️ Model Data" },
						{ key: "calc", label: "🧮 Simulasi Kalkulasi" },
						{ key: "relation", label: "🔗 Relasi Tabel" },
					].map((n) => (
						<button
							key={n.key}
							onClick={() => setSection(n.key)}
							style={{
								padding: "0.85rem 1.1rem",
								background: "none",
								border: "none",
								borderBottom:
									section === n.key
										? "2px solid #ec4899"
										: "2px solid transparent",
								color: section === n.key ? "#ec4899" : "#3d5068",
								fontFamily: SANS,
								fontSize: "0.82rem",
								fontWeight: 600,
								cursor: "pointer",
								whiteSpace: "nowrap",
							}}>
							{n.label}
						</button>
					))}
				</div>
			</div>

			<div style={{ maxWidth: 1050, margin: "0 auto", padding: "1.5rem" }}>
				{/* ── FLOW ──────────────────────────────────────── */}
				{section === "flow" && (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "210px 1fr",
							gap: 14,
						}}>
						<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
							{FLOW_STEPS.map((s, i) => (
								<button
									key={i}
									onClick={() => setActiveStep(i)}
									style={{
										textAlign: "left",
										padding: "0.65rem 0.85rem",
										background: activeStep === i ? s.color + "18" : "#0d1117",
										border: `1px solid ${activeStep === i ? s.color : "#1a2234"}`,
										borderRadius: 8,
										cursor: "pointer",
										transition: "all 0.2s",
									}}>
									<div
										style={{ display: "flex", gap: 7, alignItems: "center" }}>
										<span style={{ fontSize: 15 }}>{s.icon}</span>
										<div>
											<div
												style={{
													fontFamily: FONT,
													fontSize: "0.58rem",
													color: activeStep === i ? s.color : "#3d5068",
													letterSpacing: 2,
												}}>
												{s.phase}
											</div>
											<div
												style={{
													color: activeStep === i ? "#f1f5f9" : "#64748b",
													fontSize: "0.76rem",
													fontWeight: 600,
													lineHeight: 1.3,
												}}>
												{s.title}
											</div>
										</div>
									</div>
								</button>
							))}
						</div>

						<div
							style={{
								background: "#0d1117",
								border: `1px solid ${step.color}40`,
								borderRadius: 12,
								padding: "1.4rem",
								borderTop: `3px solid ${step.color}`,
							}}>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 10,
									marginBottom: "0.75rem",
								}}>
								<span style={{ fontSize: 26 }}>{step.icon}</span>
								<div>
									<div
										style={{
											fontFamily: FONT,
											fontSize: "0.62rem",
											color: step.color,
											letterSpacing: 3,
										}}>
										FASE {step.id} · {step.phase}
									</div>
									<h2
										style={{
											margin: 0,
											color: "#f1f5f9",
											fontSize: "1.05rem",
											fontWeight: 700,
										}}>
										{step.title}
									</h2>
								</div>
							</div>
							<div
								style={{
									display: "flex",
									gap: 6,
									marginBottom: "0.85rem",
									flexWrap: "wrap",
								}}>
								<span style={{ color: "#3d5068", fontSize: "0.72rem" }}>
									👤
								</span>
								<TAG color={step.color}>{step.actor}</TAG>
							</div>
							<p
								style={{
									color: "#94a3b8",
									fontSize: "0.85rem",
									lineHeight: 1.7,
									margin: "0 0 1rem",
								}}>
								{step.desc}
							</p>
							<div
								style={{
									fontFamily: FONT,
									fontSize: "0.6rem",
									color: "#3d5068",
									letterSpacing: 2,
									marginBottom: 8,
									textTransform: "uppercase",
								}}>
								Detail Proses:
							</div>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 5,
									marginBottom: "1rem",
								}}>
								{step.actions.map((a, i) => (
									<div
										key={i}
										style={{
											display: "flex",
											gap: 10,
											padding: "0.55rem 0.8rem",
											background: "#070a0f",
											borderRadius: 6,
											borderLeft: `2px solid ${step.color}55`,
										}}>
										<span
											style={{
												color: step.color,
												fontFamily: FONT,
												fontSize: "0.68rem",
												minWidth: 20,
												paddingTop: 1,
											}}>
											{String(i + 1).padStart(2, "0")}
										</span>
										<span
											style={{
												color: "#94a3b8",
												fontSize: "0.82rem",
												lineHeight: 1.6,
											}}>
											{a}
										</span>
									</div>
								))}
							</div>
							<div
								style={{
									background: step.color + "12",
									border: `1px solid ${step.color}30`,
									borderRadius: 8,
									padding: "0.7rem 0.9rem",
									marginBottom: step.warning ? "0.75rem" : 0,
								}}>
								<span
									style={{
										fontFamily: FONT,
										fontSize: "0.6rem",
										color: step.color,
										letterSpacing: 2,
									}}>
									OUTPUT →{" "}
								</span>
								<span style={{ color: "#e2e8f0", fontSize: "0.82rem" }}>
									{step.output}
								</span>
							</div>
							{step.warning && (
								<div
									style={{
										background: "#f59e0b0f",
										border: "1px solid #f59e0b30",
										borderRadius: 8,
										padding: "0.7rem 0.9rem",
										display: "flex",
										gap: 8,
									}}>
									<span>⚠️</span>
									<span style={{ color: "#fcd34d", fontSize: "0.8rem" }}>
										{step.warning}
									</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* ── MODEL ──────────────────────────────────────── */}
				{section === "model" && (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "210px 1fr",
							gap: 14,
						}}>
						<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
							{DATA_MODELS.map((m, i) => (
								<button
									key={i}
									onClick={() => setActiveModel(i)}
									style={{
										textAlign: "left",
										padding: "0.6rem 0.8rem",
										background: activeModel === i ? m.color + "18" : "#0d1117",
										border: `1px solid ${activeModel === i ? m.color : "#1a2234"}`,
										borderRadius: 8,
										cursor: "pointer",
										transition: "all 0.2s",
									}}>
									<div
										style={{ display: "flex", gap: 6, alignItems: "center" }}>
										<span style={{ fontSize: 13 }}>{m.icon}</span>
										<div>
											<div
												style={{
													color: activeModel === i ? "#f1f5f9" : "#64748b",
													fontSize: "0.75rem",
													fontWeight: 700,
												}}>
												{m.label}
											</div>
											<div
												style={{
													fontFamily: FONT,
													fontSize: "0.58rem",
													color: activeModel === i ? m.color : "#3d5068",
												}}>
												{m.type}
											</div>
										</div>
									</div>
								</button>
							))}
						</div>
						{(() => {
							const m = DATA_MODELS[activeModel];
							return (
								<div
									style={{
										background: "#0d1117",
										border: `1px solid ${m.color}40`,
										borderRadius: 12,
										padding: "1.2rem",
										borderTop: `3px solid ${m.color}`,
									}}>
									<div
										style={{
											display: "flex",
											gap: 8,
											alignItems: "center",
											marginBottom: 4,
										}}>
										<span style={{ fontSize: 20 }}>{m.icon}</span>
										<span
											style={{
												color: "#f1f5f9",
												fontWeight: 700,
												fontSize: "1rem",
											}}>
											{m.label}
										</span>
										<TAG color={m.color}>{m.type}</TAG>
										<span
											style={{
												marginLeft: "auto",
												fontFamily: FONT,
												fontSize: "0.62rem",
												color: "#3d5068",
											}}>
											{m.fields.length} fields
										</span>
									</div>
									<p
										style={{
											color: "#475569",
											margin: "0 0 1rem",
											fontSize: "0.78rem",
										}}>
										{m.desc}
									</p>
									<div style={{ overflowX: "auto" }}>
										<table
											style={{
												width: "100%",
												borderCollapse: "collapse",
												fontSize: "0.76rem",
											}}>
											<thead>
												<tr style={{ background: "#070a0f" }}>
													{["Field Name", "Type", "Keterangan"].map((h) => (
														<th
															key={h}
															style={{
																padding: "0.45rem 0.7rem",
																textAlign: "left",
																color: "#3d5068",
																fontFamily: FONT,
																fontSize: "0.6rem",
																letterSpacing: 2,
																borderBottom: "1px solid #1a2234",
																whiteSpace: "nowrap",
															}}>
															{h}
														</th>
													))}
												</tr>
											</thead>
											<tbody>
												{m.fields.map((f, i) => (
													<tr
														key={i}
														style={{
															borderBottom: "1px solid #0c1018",
															background: f.key
																? m.color + "08"
																: "transparent",
														}}>
														<td
															style={{
																padding: "0.45rem 0.7rem",
																fontFamily: FONT,
																color: f.key ? m.color : "#94a3b8",
																fontSize: "0.72rem",
																whiteSpace: "nowrap",
															}}>
															{f.key && "🔑 "}
															{f.name}
														</td>
														<td
															style={{
																padding: "0.45rem 0.7rem",
																whiteSpace: "nowrap",
															}}>
															<TAG
																color={
																	f.type.startsWith("Link")
																		? "#06b6d4"
																		: f.type === "Currency"
																			? "#10b981"
																			: f.type === "Select"
																				? "#8b5cf6"
																				: f.type === "Date"
																					? "#f59e0b"
																					: f.type === "Attach" ||
																						  f.type === "Attach Multiple"
																						? "#f97316"
																						: f.type === "Check"
																							? "#ec4899"
																							: "#475569"
																}>
																{f.type}
															</TAG>
														</td>
														<td
															style={{
																padding: "0.45rem 0.7rem",
																color: "#475569",
																fontSize: "0.72rem",
															}}>
															{f.desc}
														</td>
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

				{/* ── CALC ───────────────────────────────────────── */}
				{section === "calc" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
						<div
							style={{
								background: "#0d1117",
								border: "1px solid #1a2234",
								borderRadius: 12,
								padding: "1.3rem",
							}}>
							<div
								style={{
									fontFamily: FONT,
									fontSize: "0.6rem",
									color: "#3d5068",
									letterSpacing: 3,
									marginBottom: "0.9rem",
									textTransform: "uppercase",
								}}>
								📋 Parameter Kontrak Subkon (Contoh)
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
									gap: 10,
								}}>
								{[
									{
										label: "Nilai Kontrak",
										val: fmt(CALC_EXAMPLE.contract_value),
										color: "#06b6d4",
									},
									{
										label: "Uang Muka (DP)",
										val: `${CALC_EXAMPLE.dp_pct}% = ${fmt(dp_total)}`,
										color: "#8b5cf6",
									},
									{
										label: "Retensi per Termin",
										val: `${CALC_EXAMPLE.retention_pct}%`,
										color: "#ec4899",
									},
									{
										label: "Max Retensi",
										val: `10% = ${fmt(max_retention)}`,
										color: "#f97316",
									},
								].map((p, i) => (
									<div
										key={i}
										style={{
											background: "#070a0f",
											borderRadius: 8,
											padding: "0.85rem 1rem",
											borderLeft: `3px solid ${p.color}`,
										}}>
										<div
											style={{
												fontFamily: FONT,
												fontSize: "0.62rem",
												color: "#475569",
												marginBottom: 4,
											}}>
											{p.label}
										</div>
										<div
											style={{
												color: p.color,
												fontWeight: 700,
												fontSize: "0.88rem",
											}}>
											{p.val}
										</div>
									</div>
								))}
							</div>
						</div>

						<div
							style={{
								background: "#0d1117",
								border: "1px solid #1a2234",
								borderRadius: 12,
								padding: "1.3rem",
							}}>
							<div
								style={{
									fontFamily: FONT,
									fontSize: "0.6rem",
									color: "#3d5068",
									letterSpacing: 3,
									marginBottom: "1rem",
									textTransform: "uppercase",
								}}>
								🧮 Kalkulasi Per Termin Pembayaran
							</div>
							<div style={{ overflowX: "auto" }}>
								<table
									style={{
										width: "100%",
										borderCollapse: "collapse",
										fontSize: "0.78rem",
									}}>
									<thead>
										<tr style={{ background: "#070a0f" }}>
											{[
												"Termin",
												"Progress",
												"Gross Tagihan",
												"Potong DP",
												"Potong Retensi",
												"Netto Bayar",
												"Kum. Retensi",
											].map((h, index) => (
												<th
													key={index}
													style={{
														padding: "0.5rem 0.75rem",
														textAlign: "right",
														color: "#3d5068",
														fontFamily: FONT,
														fontSize: "0.6rem",
														letterSpacing: 1,
														borderBottom: "1px solid #1a2234",
														whiteSpace: "nowrap",
													}}>
													{h}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{termins.map((t, i) => (
											<tr key={i} style={{ borderBottom: "1px solid #0c1018" }}>
												<td
													style={{
														padding: "0.55rem 0.75rem",
														textAlign: "center",
														fontFamily: FONT,
														color: "#ec4899",
														fontWeight: 700,
													}}>
													#{t.no}
												</td>
												<td
													style={{
														padding: "0.55rem 0.75rem",
														textAlign: "center",
													}}>
													<TAG color="#06b6d4">{t.progress}%</TAG>
												</td>
												<td
													style={{
														padding: "0.55rem 0.75rem",
														textAlign: "right",
														color: "#94a3b8",
														fontFamily: FONT,
														fontSize: "0.72rem",
													}}>
													{fmt(t.gross)}
												</td>
												<td
													style={{
														padding: "0.55rem 0.75rem",
														textAlign: "right",
														color: "#ef4444",
														fontFamily: FONT,
														fontSize: "0.72rem",
													}}>
													({fmt(t.dp_cut)})
												</td>
												<td
													style={{
														padding: "0.55rem 0.75rem",
														textAlign: "right",
														color: "#f97316",
														fontFamily: FONT,
														fontSize: "0.72rem",
													}}>
													({fmt(t.ret)})
												</td>
												<td
													style={{
														padding: "0.55rem 0.75rem",
														textAlign: "right",
														color: "#10b981",
														fontFamily: FONT,
														fontSize: "0.78rem",
														fontWeight: 700,
													}}>
													{fmt(t.net)}
												</td>
												<td
													style={{
														padding: "0.55rem 0.75rem",
														textAlign: "right",
														color: "#f59e0b",
														fontFamily: FONT,
														fontSize: "0.72rem",
													}}>
													{fmt(t.cum_retention)}
												</td>
											</tr>
										))}
										<tr
											style={{
												background: "#070a0f",
												borderTop: "2px solid #1a2234",
											}}>
											<td
												colSpan={2}
												style={{
													padding: "0.6rem 0.75rem",
													fontFamily: FONT,
													fontSize: "0.7rem",
													color: "#475569",
												}}>
												TOTAL
											</td>
											<td
												style={{
													padding: "0.6rem 0.75rem",
													textAlign: "right",
													fontFamily: FONT,
													fontSize: "0.75rem",
													color: "#94a3b8",
													fontWeight: 700,
												}}>
												{fmt(termins.reduce((s, t) => s + t.gross, 0))}
											</td>
											<td
												style={{
													padding: "0.6rem 0.75rem",
													textAlign: "right",
													fontFamily: FONT,
													fontSize: "0.75rem",
													color: "#ef4444",
													fontWeight: 700,
												}}>
												({fmt(termins.reduce((s, t) => s + t.dp_cut, 0))})
											</td>
											<td
												style={{
													padding: "0.6rem 0.75rem",
													textAlign: "right",
													fontFamily: FONT,
													fontSize: "0.75rem",
													color: "#f97316",
													fontWeight: 700,
												}}>
												({fmt(termins.reduce((s, t) => s + t.ret, 0))})
											</td>
											<td
												style={{
													padding: "0.6rem 0.75rem",
													textAlign: "right",
													fontFamily: FONT,
													fontSize: "0.75rem",
													color: "#10b981",
													fontWeight: 700,
												}}>
												{fmt(termins.reduce((s, t) => s + t.net, 0))}
											</td>
											<td
												style={{
													padding: "0.6rem 0.75rem",
													textAlign: "right",
													fontFamily: FONT,
													fontSize: "0.75rem",
													color: "#f59e0b",
													fontWeight: 700,
												}}>
												{fmt(max_retention)}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<div
								style={{
									marginTop: 12,
									background: "#ec489912",
									border: "1px solid #ec489930",
									borderRadius: 8,
									padding: "0.75rem 1rem",
									fontFamily: FONT,
									fontSize: "0.72rem",
									color: "#94a3b8",
									lineHeight: 1.9,
								}}>
								<span style={{ color: "#f1f5f9", fontWeight: 700 }}>
									Formula Netto per Termin:
								</span>
								<br />
								<span style={{ color: "#ec4899" }}>
									Netto = Gross − (Gross × DP%) − min(Gross × 5%, Sisa Kuota
									Retensi)
								</span>
								<br />
								<span style={{ color: "#64748b" }}>
									Catatan: Setelah retensi mencapai 10% dari kontrak (
									{fmt(max_retention)}), potongan retensi berhenti.
								</span>
								<br />
								<span style={{ color: "#f59e0b" }}>
									Retensi {fmt(max_retention)} → cair 50% saat PHO, 50% saat FHO
									setelah masa pemeliharaan.
								</span>
							</div>
						</div>

						<div
							style={{
								background: "#0d1117",
								border: "1px solid #1a2234",
								borderRadius: 12,
								padding: "1.3rem",
							}}>
							<div
								style={{
									fontFamily: FONT,
									fontSize: "0.6rem",
									color: "#3d5068",
									letterSpacing: 3,
									marginBottom: "0.9rem",
									textTransform: "uppercase",
								}}>
								⭐ Formula Performance Score
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
									gap: 8,
									marginBottom: 12,
								}}>
								{[
									{
										label: "Kualitas Pekerjaan",
										weight: "30%",
										color: "#10b981",
									},
									{ label: "Ketepatan Waktu", weight: "25%", color: "#3b82f6" },
									{ label: "Kepatuhan K3", weight: "20%", color: "#f97316" },
									{ label: "Administrasi", weight: "15%", color: "#8b5cf6" },
									{ label: "Kooperatif", weight: "10%", color: "#ec4899" },
								].map((c, i) => (
									<div
										key={i}
										style={{
											background: "#070a0f",
											borderRadius: 7,
											padding: "0.7rem 0.85rem",
											borderLeft: `3px solid ${c.color}`,
										}}>
										<div
											style={{
												color: "#64748b",
												fontSize: "0.72rem",
												marginBottom: 3,
											}}>
											{c.label}
										</div>
										<div
											style={{
												color: c.color,
												fontWeight: 700,
												fontFamily: FONT,
												fontSize: "0.85rem",
											}}>
											{c.weight}
										</div>
									</div>
								))}
							</div>
							<div
								style={{
									background: "#070a0f",
									borderRadius: 8,
									padding: "0.8rem 1rem",
									fontFamily: FONT,
									fontSize: "0.72rem",
									color: "#64748b",
									lineHeight: 1.9,
								}}>
								<span style={{ color: "#f1f5f9" }}>
									Score = (Kualitas×0.30) + (Waktu×0.25) + (K3×0.20) +
									(Admin×0.15) + (Koop×0.10)
								</span>
								<br />
								<span style={{ color: "#10b981" }}>
									Score ≥ 80 → Highly Recommended
								</span>
								{"  "}
								<span style={{ color: "#f59e0b" }}>60–79 → Recommended</span>
								{"  "}
								<span style={{ color: "#f97316" }}>40–59 → Conditional</span>
								{"  "}
								<span style={{ color: "#ef4444" }}>
									{"< 40"} → Not Recommended / Blacklist
								</span>
							</div>
						</div>
					</div>
				)}

				{/* ── RELATION ───────────────────────────────────── */}
				{section === "relation" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
						<div
							style={{
								background: "#0d1117",
								border: "1px solid #1a2234",
								borderRadius: 12,
								padding: "1.3rem",
							}}>
							<div
								style={{
									fontFamily: FONT,
									fontSize: "0.6rem",
									color: "#3d5068",
									letterSpacing: 3,
									marginBottom: "1rem",
									textTransform: "uppercase",
								}}>
								🔗 Relasi Antar DocType
							</div>
							<div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
								{RELATIONS.map((r, i) => {
									const fromM = DATA_MODELS.find((d) => d.name === r.from) || {
										color: "#475569",
									};
									const toM = DATA_MODELS.find((d) => d.name === r.to) || {
										color: "#475569",
									};
									return (
										<div
											key={i}
											style={{
												display: "flex",
												alignItems: "center",
												gap: 8,
												padding: "0.65rem 0.9rem",
												background: "#070a0f",
												borderRadius: 7,
												flexWrap: "wrap",
											}}>
											<span
												style={{
													color: fromM.color,
													fontFamily: FONT,
													fontSize: "0.72rem",
													fontWeight: 700,
													minWidth: 160,
												}}>
												{r.from}
											</span>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: 5,
												}}>
												<div
													style={{
														height: 1,
														width: 20,
														background: "#1a2234",
													}}
												/>
												<TAG color="#64748b">{r.label}</TAG>
												<div
													style={{
														height: 1,
														width: 20,
														background: "#1a2234",
													}}
												/>
											</div>
											<span
												style={{
													color: toM.color,
													fontFamily: FONT,
													fontSize: "0.72rem",
													fontWeight: 700,
													minWidth: 160,
												}}>
												{r.to}
											</span>
											<span
												style={{
													color: "#3d5068",
													fontSize: "0.75rem",
													flex: 1,
												}}>
												{r.desc}
											</span>
										</div>
									);
								})}
							</div>
						</div>

						<div
							style={{
								background: "#0d1117",
								border: "1px solid #1a2234",
								borderRadius: 12,
								padding: "1.3rem",
							}}>
							<div
								style={{
									fontFamily: FONT,
									fontSize: "0.6rem",
									color: "#3d5068",
									letterSpacing: 3,
									marginBottom: "1rem",
									textTransform: "uppercase",
								}}>
								💡 Integrasi dengan Modul ERPNext Lain
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
									gap: 10,
								}}>
								{[
									{
										module: "Project Management",
										color: "#06b6d4",
										link: "Subcon_Contract & Opname → terhubung ke ERPNext Project → update % completion proyek utama",
									},
									{
										module: "Accounts Payable",
										color: "#10b981",
										link: "Subcon_Invoice setelah Finance approve → otomatis buat Journal Entry hutang ke subkon di AP",
									},
									{
										module: "RAB / Cost Control",
										color: "#f59e0b",
										link: "Subcon_Invoice yang terbayar → debit ke item RAB terkait → update actual cost vs budget",
									},
									{
										module: "HR / Payroll",
										color: "#8b5cf6",
										link: "Personil subkon bisa didata sebagai External Worker untuk tracking K3 & induction",
									},
									{
										module: "Asset Management",
										color: "#f97316",
										link: "Alat berat yang disewa/dipinjam ke subkon bisa di-track di Equipment Module",
									},
									{
										module: "Quality Management",
										color: "#ec4899",
										link: "NCR dari Opname Detail → bisa link ke Quality Inspection ERPNext atau custom NCR module",
									},
								].map((m, i) => (
									<div
										key={i}
										style={{
											background: "#070a0f",
											borderRadius: 8,
											padding: "0.85rem 1rem",
											borderLeft: `3px solid ${m.color}`,
										}}>
										<div
											style={{
												color: m.color,
												fontWeight: 700,
												fontSize: "0.82rem",
												marginBottom: 6,
											}}>
											{m.module}
										</div>
										<div
											style={{
												color: "#475569",
												fontSize: "0.75rem",
												lineHeight: 1.6,
											}}>
											{m.link}
										</div>
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
