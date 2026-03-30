import { useState } from "react";

/* ════════════════════════════════════════════════════════════
   PANDUAN INPUT SPK — STEP BY STEP ERPNEXT
   Data: SPK 006/SPK/NINDYA-BPS/I/2026
   Subkon: Mas Samsuri | Rp 3,018,802,608
════════════════════════════════════════════════════════════ */

const f = (n) => new Intl.NumberFormat("id-ID").format(n);
const C = {
	bg: "#f4f6fb",
	card: "#ffffff",
	navy: "#162040",
	blue: "#1a5fb4",
	green: "#0e7c61",
	amber: "#c2570a",
	red: "#c0392b",
	purple: "#6d28d9",
	teal: "#0d7377",
	muted: "#64748b",
	light: "#e2e8f0",
	border: "#d1d9e6",
	sub: "#475569",
	text: "#1e293b",
	gold: "#b8860b",
};

/* ─── SPK DATA ─── */
const SPK = {
	nomor: "006/SPK/NINDYA-BPS/I/2026",
	tgl: "18 Januari 2026",
	proyek: "Pembangunan Sekolah Rakyat Sulawesi-Selatan 2",
	lokasi: "Kelurahan Bajoe, Kec. Tanete Riattang Timur, Kab. Bone",
	supplier: "MAS SAMSURI",
	alamat: "Dusun Pencol Puwodadi, Jawa Tengah",
	jenis: "Struktur dan Arsitek",
	area: "Area Gedung Sekolah",
	mulai: "21 Januari 2026",
	selesai: "21 Maret 2026",
	total: 3_018_802_608,
	ka_div: "Judhi Widjayanto",
	sem: "Nur Hajis",
	items: [
		{
			no: 1,
			gedung: "GEDUNG SEKOLAH SD",
			kode: "BEKS-TIEPILE",
			nama: "Bekisting (Tie Beam dan Pilecap)",
			sat: "m2",
			vol: 981.79,
			hsat: 132000,
			jumlah: 129596280,
		},
		{
			no: 2,
			gedung: "GEDUNG SEKOLAH SD",
			kode: "BEKS-PHENOLIC",
			nama: "Bekisting (Kolom, Balok, Plat Lantai) Phenolic film",
			sat: "m2",
			vol: 5672.93,
			hsat: 198000,
			jumlah: 1123239664.74,
		},
		{
			no: 3,
			gedung: "GEDUNG SEKOLAH SMP",
			kode: "BEKS-TIEPILE-SMP",
			nama: "Bekisting (Tie Beam dan Pilecap) SMP",
			sat: "m2",
			vol: 316.71,
			hsat: 132000,
			jumlah: 41805720,
		},
		{
			no: 4,
			gedung: "GEDUNG SEKOLAH SMP",
			kode: "BEKS-PHENOLIC-SMP",
			nama: "Bekisting (Kolom, Balok, Plat Lantai) Phenolic film SMP",
			sat: "m2",
			vol: 3850.62,
			hsat: 198000,
			jumlah: 762422979.53,
		},
		{
			no: 5,
			gedung: "GEDUNG SEKOLAH SMA",
			kode: "BEKS-TIEPILE-SMA",
			nama: "Bekisting (Tie Beam dan Pilecap) SMA",
			sat: "m2",
			vol: 868.25,
			hsat: 132000,
			jumlah: 114609000,
		},
		{
			no: 6,
			gedung: "GEDUNG SEKOLAH SMA",
			kode: "BEKS-PHENOLIC-SMA",
			nama: "Bekisting (Kolom, Balok, Plat Lantai) Phenolic film SMA",
			sat: "m2",
			vol: 4278.43,
			hsat: 198000,
			jumlah: 847128963.53,
		},
	],
};

/* ─── PHASES ─── */
const PHASES = [
	{
		id: "prereq",
		label: "Pra-Syarat Setup",
		icon: "⚙️",
		color: C.purple,
		badge: "SEKALI SAJA",
		tagline: "Lakukan ini SATU KALI sebelum bisa input SPK apapun",
		substeps: [
			{
				title: "A. Tambahkan Custom Fields ke Purchase Order",
				path: "Setup → Customize Form → ketik 'Purchase Order' → Open",
				why: "ERPNext Purchase Order standard tidak punya field Nomor SPK, Jenis Pekerjaan, dll. Kita tambahkan via Customize Form — TANPA KODING.",
				fields: [
					{
						label: "Field Label",
						value: "Nomor SPK",
						type: "Data",
						section: "Header",
					},
					{
						label: "Field Label",
						value: "Jenis Pekerjaan SPK",
						type: "Data",
						section: "Header",
					},
					{
						label: "Field Label",
						value: "Area Pekerjaan",
						type: "Data",
						section: "Header",
					},
					{
						label: "Field Label",
						value: "Tanggal Mulai Pekerjaan",
						type: "Date",
						section: "Header",
					},
					{
						label: "Field Label",
						value: "Tanggal Selesai Pekerjaan",
						type: "Date",
						section: "Header",
					},
					{
						label: "Field Label",
						value: "KA Divisi",
						type: "Link→User",
						section: "Signature",
					},
					{
						label: "Field Label",
						value: "SEM",
						type: "Link→User",
						section: "Signature",
					},
					{
						label: "Field Label",
						value: "Harga Sudah Termasuk",
						type: "Text",
						section: "Terms",
					},
					{
						label: "Field Label",
						value: "Gedung (per item)",
						type: "Data (child)",
						section: "Items Table",
					},
				],
				note: "Setelah ditambahkan, field ini akan muncul di semua Purchase Order — tidak hanya SPK. Bisa dibuat opsional (Mandatory = No) agar tidak mengganggu PO biasa.",
			},
			{
				title: "B. Buat Item Master untuk Pekerjaan Bekisting",
				path: "Stock → Item → New",
				why: "Setiap jenis pekerjaan dalam SPK harus terdaftar sebagai Item di ERPNext. Karena ini jasa (bukan barang fisik), set khusus.",
				fields: [
					{
						label: "Item Code",
						value: "BEKS-TIEPILE",
						type: "Data",
						section: "",
					},
					{
						label: "Item Name",
						value: "Bekisting Tie Beam dan Pilecap",
						type: "Data",
						section: "",
					},
					{
						label: "Item Group",
						value: "Jasa Subkontraktor",
						type: "Link",
						section: "",
					},
					{ label: "Default UOM", value: "m2", type: "Link", section: "" },
					{
						label: "Is Stock Item",
						value: "❌ TIDAK dicentang",
						type: "Check",
						section: "",
					},
					{
						label: "Is Service Item",
						value: "✅ Dicentang",
						type: "Check",
						section: "",
					},
					{
						label: "Maintain Stock",
						value: "❌ TIDAK dicentang",
						type: "Check",
						section: "",
					},
					{
						label: "Include Item in Manufacturing",
						value: "❌ TIDAK",
						type: "Check",
						section: "",
					},
				],
				note: "Buat 6 item total sesuai SPK: BEKS-TIEPILE (SD/SMP/SMA) dan BEKS-PHENOLIC (SD/SMP/SMA). Atau buat 2 item generic + pakai Gedung sebagai keterangan.",
			},
			{
				title: "C. Daftarkan MAS SAMSURI sebagai Supplier",
				path: "Buying → Supplier → New",
				why: "Subkon harus terdaftar sebagai Supplier sebelum bisa dipilih di Purchase Order.",
				fields: [
					{
						label: "Supplier Name",
						value: "Mas Samsuri",
						type: "Data",
						section: "",
					},
					{
						label: "Supplier Type",
						value: "Individual",
						type: "Select",
						section: "",
					},
					{
						label: "Supplier Group",
						value: "Subkontraktor",
						type: "Link",
						section: "",
					},
					{ label: "Country", value: "Indonesia", type: "Link", section: "" },
					{
						label: "Primary Address",
						value: "Dusun Pencol Puwodadi, Jawa Tengah",
						type: "Address",
						section: "",
					},
					{
						label: "Default Payment Terms",
						value: "Opname-Based (buat dulu)",
						type: "Link",
						section: "",
					},
					{ label: "NPWP", value: "(isi jika ada)", type: "Data", section: "" },
					{
						label: "Bank Account",
						value: "(isi rekening untuk transfer)",
						type: "Child",
						section: "",
					},
				],
				note: "Tambahkan kontak PIC: nama, no HP, email. Ini yang akan menerima email notifikasi PO dari sistem.",
			},
			{
				title: "D. Buat Payment Terms Template",
				path: "Accounting → Payment Terms → New → lalu buat Payment Terms Template",
				why: "SPK ini berbasis opname (bayar sesuai volume yang sudah dikerjakan dan diverifikasi). Perlu template payment terms yang mencerminkan ini.",
				fields: [
					{
						label: "Template Name",
						value: "Termin Opname Subkon",
						type: "Data",
						section: "",
					},
					{
						label: "Payment Term Name",
						value: "Termin Opname 1",
						type: "Data",
						section: "",
					},
					{
						label: "Due Date Based On",
						value: "Day(s) after invoice date",
						type: "Select",
						section: "",
					},
					{ label: "Credit Days", value: "14", type: "Int", section: "" },
					{ label: "Invoke Part", value: "100", type: "Float", section: "" },
				],
				note: "Bisa buat multiple termin (Termin 1, Termin 2, dst) atau buat satu template generic karena SPK ini 'volume tidak mengikat' — bayar per hasil opname.",
			},
		],
	},
	{
		id: "po",
		label: "Input Purchase Order (SPK)",
		icon: "📋",
		color: C.blue,
		badge: "UTAMA",
		tagline: "Ini inti implementasi — Purchase Order = SPK di sistem",
		substeps: [
			{
				title: "Buka Form Purchase Order Baru",
				path: "Buying → Purchase Order → klik tombol '+ New'",
				why: "Purchase Order adalah dokumen ERPNext yang paling tepat merepresentasikan SPK. Semua transaksi turunan (opname, invoice, bayar) akan ber-parent ke PO ini.",
				fields: [
					{
						label: "[HEADER] Supplier",
						value: "Mas Samsuri",
						type: "Link",
						section: "",
						note: "Pilih dari dropdown — sudah kita daftarkan di langkah pra-syarat",
					},
					{
						label: "[HEADER] Series",
						value: "PO-SPK-.YYYY.-",
						type: "Auto",
						section: "",
						note: "Buat naming series khusus: PO-SPK-.YYYY.- agar mudah dibedakan dari PO material biasa",
					},
					{
						label: "[HEADER] Date",
						value: "18-01-2026",
						type: "Date",
						section: "",
						note: "Tanggal SPK ditandatangani",
					},
					{
						label: "[HEADER] Required By",
						value: "21-03-2026",
						type: "Date",
						section: "",
						note: "Tanggal selesai kontrak = deadline pekerjaan",
					},
					{
						label: "[HEADER] Project",
						value: "Pembangunan Sekolah Rakyat SS-2",
						type: "Link",
						section: "",
						note: "WAJIB — link ke Project master agar biaya masuk project costing",
					},
					{
						label: "[HEADER] Cost Center",
						value: "CC-SCHOOL-BONE-2026",
						type: "Link",
						section: "",
						note: "WAJIB — Cost Center proyek ini",
					},
					{
						label: "[HEADER] Company",
						value: "PT Nindya Karya (KSO)",
						type: "Link",
						section: "",
						note: "Entitas yang menerbitkan SPK",
					},
					{
						label: "[CUSTOM] Nomor SPK",
						value: "006/SPK/NINDYA-BPS/I/2026",
						type: "Data",
						section: "",
						note: "Field custom yang kita tambahkan — isi nomor SPK fisik",
					},
					{
						label: "[CUSTOM] Jenis Pekerjaan SPK",
						value: "Struktur dan Arsitek",
						type: "Data",
						section: "",
						note: "Dari poin 5 di SPK fisik",
					},
					{
						label: "[CUSTOM] Area Pekerjaan",
						value: "Area Gedung Sekolah",
						type: "Data",
						section: "",
						note: "Lokasi spesifik pekerjaan",
					},
					{
						label: "[CUSTOM] Tgl Mulai Pekerjaan",
						value: "21-01-2026",
						type: "Date",
						section: "",
						note: "Dari poin 7 waktu pelaksanaan",
					},
					{
						label: "[CUSTOM] Tgl Selesai Pekerjaan",
						value: "21-03-2026",
						type: "Date",
						section: "",
						note: "Durasi 59 hari kalender",
					},
					{
						label: "[HEADER] Payment Terms",
						value: "Termin Opname Subkon",
						type: "Link",
						section: "",
						note: "Template yang sudah dibuat",
					},
				],
				note: "Semua field di atas ada di bagian ATAS (header) form Purchase Order. Isi semuanya sebelum lanjut ke bagian Items.",
			},
			{
				title: "Isi Tabel Items — 6 Baris Sesuai SPK",
				path: "Masih di form PO → scroll ke bawah → tabel Items → klik 'Add Row'",
				why: "Setiap baris di tabel Items PO = satu baris pekerjaan di SPK. Kita input 6 baris sesuai SPK: 2 item × 3 gedung.",
				fields: [
					{
						label: "Baris 1 — Item Code",
						value: "BEKS-TIEPILE",
						type: "Link",
						section: "SD",
						note: "Pilih item yang sudah dibuat",
					},
					{
						label: "Baris 1 — [CUSTOM] Gedung",
						value: "GEDUNG SEKOLAH SD",
						type: "Data",
						section: "SD",
						note: "Field custom per baris",
					},
					{
						label: "Baris 1 — Keterangan",
						value: "Bekisting (Tie Beam dan Pilecap) — SD",
						type: "Data",
						section: "SD",
						note: "Description item, tampil di print",
					},
					{
						label: "Baris 1 — UOM",
						value: "m2",
						type: "Link",
						section: "SD",
						note: "Satuan meter persegi",
					},
					{
						label: "Baris 1 — Qty",
						value: "981.79",
						type: "Float",
						section: "SD",
						note: "Volume kontrak dari SPK",
					},
					{
						label: "Baris 1 — Rate",
						value: "132,000",
						type: "Currency",
						section: "SD",
						note: "Harga satuan Rp 132.000/m2",
					},
					{
						label: "Baris 1 — Amount",
						value: "129,596,280",
						type: "Calc",
						section: "SD",
						note: "AUTO: Qty × Rate dihitung sistem",
					},
					{
						label: "Baris 1 — Warehouse",
						value: "Site - Proyek SS-2",
						type: "Link",
						section: "SD",
						note: "N/A untuk jasa, bisa dikosongkan atau pakai virtual warehouse",
					},
					{
						label: "────── dst baris 2 s/d 6",
						value: "(isi sesuai tabel di bawah)",
						type: "─",
						section: "─",
						note: "─",
					},
				],
				note: "Amount setiap baris dihitung OTOMATIS oleh sistem (Qty × Rate). Anda hanya perlu input Qty dan Rate.",
			},
			{
				title: "Isi Syarat & Ketentuan SPK",
				path: "Masih di form PO → tab 'Terms and Conditions'",
				why: "Syarat-syarat di poin 7-11 SPK fisik (harga termasuk/tidak termasuk, APD, SHE) dimasukkan ke sini sebagai Terms & Conditions.",
				fields: [
					{
						label: "Terms & Conditions",
						value: `Harga Sudah Termasuk:\n- Pekerjaan sesuai spesifikasi dan shop drawing\n- Tidak termasuk alat bantu\n- Pengadaan APD Standar (helm, rompi, dan sepatu)\n- PPh\n\nCara Pembayaran:\n- Opname sesuai volume lapangan\n- Volume tidak mengikat\n\nKetentuan K3/SHE:\n- Setiap crew wajib menggunakan APD (helm, rompi, dan sepatu) saat bekerja dan saat berada di lokasi proyek\n- Kesanggupan memenuhi ketentuan aspek lingkungan`,
						type: "Text Area",
						section: "",
						note: "Bisa dibuat sebagai Template T&C yang dipakai ulang di SPK berikutnya",
					},
				],
				note: "Buat Terms & Conditions Template khusus 'SPK Bekisting' agar tidak perlu ketik ulang untuk SPK sejenis di masa depan.",
			},
			{
				title: "Submit & Approve PO/SPK",
				path: "Klik tombol 'Submit' di pojok kanan atas",
				why: "PO yang sudah di-Submit bersifat resmi dan terkunci — tidak bisa diubah sembarangan. Status berubah dari Draft menjadi Open (Aktif).",
				fields: [
					{
						label: "Sebelum Submit — cek",
						value: "Total Grand Total = Rp 3,018,802,608",
						type: "Validasi",
						section: "",
						note: "Cocokkan dengan angka di SPK fisik",
					},
					{
						label: "Sebelum Submit — cek",
						value: "Project & Cost Center sudah terisi",
						type: "Validasi",
						section: "",
						note: "WAJIB agar biaya masuk project costing",
					},
					{
						label: "Sebelum Submit — cek",
						value: "Semua 6 item sudah diinput",
						type: "Validasi",
						section: "",
						note: "Cek qty dan rate setiap baris",
					},
					{
						label: "Workflow Approval",
						value:
							"Jika ada workflow: tunggu KA Divisi approve via email/ERPNext",
						type: "Process",
						section: "",
						note: "Judhi Widjayanto harus approve sebelum PO aktif",
					},
					{
						label: "Status setelah Submit",
						value: "Open — PO/SPK resmi aktif di sistem",
						type: "Result",
						section: "",
						note: "PO Number tergenerate: PO-SPK-2026-0001",
					},
					{
						label: "Print & Kirim ke Subkon",
						value: "Tombol Print → pilih Print Format 'SPK Format' → PDF",
						type: "Action",
						section: "",
						note: "Kirim PDF ke Mas Samsuri via WhatsApp/email",
					},
				],
				note: "Setelah Submit, PO ini muncul di laporan Procurement Tracker, Project Costing (committed cost), dan AP report.",
			},
		],
	},
	{
		id: "receipt",
		label: "Purchase Receipt (BAO Opname)",
		icon: "📐",
		color: C.green,
		badge: "PER OPNAME",
		tagline: "Setiap kali opname lapangan → buat Purchase Receipt",
		substeps: [
			{
				title: "Kapan Membuat Purchase Receipt?",
				path: "— (pemahaman konsep dulu) —",
				why: "Purchase Receipt di ERPNext = Berita Acara Opname (BAO) Subkon. Dibuat SETIAP KALI ada opname volume pekerjaan di lapangan yang sudah diverifikasi PM/QC. Satu PO bisa punya beberapa PR (opname bertahap).",
				fields: [
					{
						label: "Trigger",
						value: "PM dan Mas Samsuri sudah ukur volume di lapangan",
						type: "Event",
						section: "",
						note: "Misal: opname minggu ke-3, ternyata SD sudah 60% beres",
					},
					{
						label: "Dokumen Fisik",
						value: "BAO (Berita Acara Opname) ditandatangani kedua pihak",
						type: "Prereq",
						section: "",
						note: "BAO fisik harus ada SEBELUM input ke sistem",
					},
					{
						label: "Siapa yang input",
						value: "Site Engineer atau PM yang berwenang",
						type: "Actor",
						section: "",
						note: "Bukan Finance — mereka yang tahu volume lapangan",
					},
					{
						label: "Berapa kali bisa?",
						value: "Bisa berkali-kali dari 1 PO yang sama",
						type: "Info",
						section: "",
						note: "Karena SPK bilang 'volume tidak mengikat dan berbasis opname'",
					},
				],
				note: "PENTING: Volume di PR tidak harus sama dengan volume di PO. PR bisa lebih kecil (opname parsial). Tapi total kumulatif PR tidak boleh melebihi volume PO.",
			},
			{
				title: "Buat Purchase Receipt dari PO",
				path: "Buying → Purchase Order → buka PO-SPK-2026-0001 → klik tombol 'Create' → pilih 'Purchase Receipt'",
				why: "Cara termudah: generate PR langsung dari PO. Semua data sudah ter-copy otomatis, tinggal edit volume yang sudah selesai saja.",
				fields: [
					{
						label: "[AUTO] Supplier",
						value: "Mas Samsuri",
						type: "Fetch",
						section: "",
						note: "Otomatis dari PO",
					},
					{
						label: "[AUTO] Purchase Order",
						value: "PO-SPK-2026-0001",
						type: "Fetch",
						section: "",
						note: "Referensi ke PO induk",
					},
					{
						label: "[EDIT] Posting Date",
						value: "10-02-2026",
						type: "Date",
						section: "",
						note: "Tanggal opname / tanggal BAO ditandatangani",
					},
					{
						label: "[EDIT] Project",
						value: "Pembangunan Sekolah Rakyat SS-2",
						type: "Link",
						section: "",
						note: "Harus sama dengan PO",
					},
					{
						label: "[CUSTOM] No BAO",
						value: "BAO-001/SS2/I/2026",
						type: "Data",
						section: "",
						note: "Nomor BAO fisik — tambahkan custom field",
					},
					{
						label: "[CUSTOM] Tanggal BAO",
						value: "08-02-2026",
						type: "Date",
						section: "",
						note: "Tanggal penandatanganan BAO",
					},
					{
						label: "[CUSTOM] Periode",
						value: "Opname ke-1",
						type: "Data",
						section: "",
						note: "Untuk tracking urutan opname",
					},
				],
				note: "Setelah dibuka, form PR sudah terisi data dari PO. Langkah selanjutnya: edit qty aktual per baris.",
			},
			{
				title: "Edit Qty Aktual di Tabel Items PR",
				path: "Di form PR → tabel Items → edit kolom 'Qty' setiap baris",
				why: "Ini inti dari BAO — berapa volume aktual yang SUDAH SELESAI dikerjakan dan sudah diopname, bukan volume kontrak total.",
				fields: [
					{
						label: "Baris 1 BEKS-TIEPILE SD",
						value: "Qty: 650.00 dari 981.79",
						type: "Edit Qty",
						section: "Opname ke-1",
						note: "= 66.2% dari volume kontrak SD Tiepile",
					},
					{
						label: "Baris 2 BEKS-PHENOLIC SD",
						value: "Qty: 3200.00 dari 5672.93",
						type: "Edit Qty",
						section: "Opname ke-1",
						note: "= 56.4% dari volume kontrak SD Phenolic",
					},
					{
						label: "Baris 3 BEKS-TIEPILE SMP",
						value: "Qty: 316.71 dari 316.71",
						type: "Edit Qty",
						section: "Opname ke-1",
						note: "= 100% SMP Tiepile sudah selesai",
					},
					{
						label: "Baris 4 BEKS-PHENOLIC SMP",
						value: "Qty: 1500.00 dari 3850.62",
						type: "Edit Qty",
						section: "Opname ke-1",
						note: "= 39% SMP Phenolic",
					},
					{
						label: "Baris 5 BEKS-TIEPILE SMA",
						value: "Qty: 0.00 dari 868.25",
						type: "Edit Qty",
						section: "Opname ke-1",
						note: "= 0% SMA belum mulai",
					},
					{
						label: "Baris 6 BEKS-PHENOLIC SMA",
						value: "Qty: 0.00 dari 4278.43",
						type: "Edit Qty",
						section: "Opname ke-1",
						note: "= 0% SMA belum mulai",
					},
					{
						label: "[AUTO] Accepted Qty",
						value: "= sama dengan Qty yang diisi",
						type: "Calc",
						section: "",
						note: "Accepted = yang diterima/lulus QC",
					},
					{
						label: "[AUTO] Amount",
						value: "Dihitung ulang dari Qty baru",
						type: "Calc",
						section: "",
						note: "Nilai opname ke-1 ini",
					},
					{
						label: "Lampirkan BAO Fisik",
						value: "Attach → upload scan/foto BAO yang sudah TTD",
						type: "Attach",
						section: "",
						note: "WAJIB sebagai bukti dokumen",
					},
				],
				note: "Nilai Amount di PR ini = nilai yang akan ditagihkan oleh Mas Samsuri untuk opname ke-1 ini. Rate tetap dari PO, hanya Qty yang berubah.",
			},
			{
				title: "Submit Purchase Receipt",
				path: "Klik tombol 'Submit'",
				why: "Setelah di-Submit, sistem mencatat bahwa pekerjaan sejumlah itu sudah selesai secara teknis (diterima). Biaya masuk ke Project Costing.",
				fields: [
					{
						label: "Cek sebelum Submit",
						value: "Nilai total PR wajar (tidak melebihi sisa PO)",
						type: "Validasi",
						section: "",
						note: "ERPNext otomatis warning jika over",
					},
					{
						label: "Status setelah Submit",
						value: "Purchase Receipt: Completed",
						type: "Result",
						section: "",
						note: "PO status berubah dari Open ke Partially Received",
					},
					{
						label: "Efek ke Project Costing",
						value: "Actual Cost proyek bertambah sebesar nilai PR",
						type: "Effect",
						section: "",
						note: "Muncul di tab Costing di Project",
					},
					{
						label: "Efek ke AP",
						value: "Belum ada hutang — hutang muncul saat PI dibuat",
						type: "Effect",
						section: "",
						note: "PR bukan hutang, hanya konfirmasi pekerjaan",
					},
				],
				note: "PR yang sudah Submit bisa dijadikan dasar Purchase Invoice. Mas Samsuri baru bisa tagih setelah ada PR yang approved.",
			},
		],
	},
	{
		id: "invoice",
		label: "Purchase Invoice (Tagihan Subkon)",
		icon: "🧾",
		color: C.amber,
		badge: "PER TERMIN",
		tagline: "Mas Samsuri kirim invoice → input ke sistem → hutang tercatat",
		substeps: [
			{
				title: "Buat Purchase Invoice dari Purchase Receipt",
				path: "Buying → Purchase Receipt → buka PR yang relevan → klik 'Create' → pilih 'Purchase Invoice'",
				why: "Generate PI dari PR memastikan three-way matching: PO (kontrak) ↔ PR (BAO) ↔ PI (invoice). Tidak bisa invoice lebih dari yang sudah di-BAO.",
				fields: [
					{
						label: "[AUTO] Supplier",
						value: "Mas Samsuri",
						type: "Fetch",
						section: "",
						note: "Dari PR",
					},
					{
						label: "[AUTO] Items + Qty",
						value: "Terisi dari PR — jangan diubah",
						type: "Fetch",
						section: "",
						note: "Qty = volume yang sudah diopname",
					},
					{
						label: "[EDIT] Invoice Date",
						value: "15-02-2026",
						type: "Date",
						section: "",
						note: "Tanggal invoice fisik dari Mas Samsuri",
					},
					{
						label: "[EDIT] Due Date",
						value: "01-03-2026",
						type: "Date",
						section: "",
						note: "14 hari dari invoice date sesuai payment terms",
					},
					{
						label: "[CUSTOM] No Invoice Subkon",
						value: "INV/SMS/02/2026/001",
						type: "Data",
						section: "",
						note: "Nomor invoice fisik Mas Samsuri — custom field",
					},
					{
						label: "[EDIT] Project",
						value: "Pembangunan Sekolah Rakyat SS-2",
						type: "Link",
						section: "",
						note: "Sama dengan PO & PR",
					},
					{
						label: "Lampirkan Invoice Fisik",
						value: "Attach scan invoice yang diterima",
						type: "Attach",
						section: "",
						note: "WAJIB untuk audit trail",
					},
				],
				note: "Sebelum membuat PI, pastikan invoice fisik dari Mas Samsuri sudah di-review dan nilai cocok dengan PR.",
			},
			{
				title: "Tambahkan Potongan-Potongan di Invoice",
				path: "Masih di form PI → scroll ke bagian 'Taxes and Charges'",
				why: "SPK menyebut 'Harga Sudah Termasuk PPh'. Artinya PPh menjadi tanggungan subkon (dipotong dari pembayaran). Juga ada potongan retensi jika berlaku.",
				fields: [
					{
						label: "Potongan PPh 4(2) Final",
						value:
							"Cara: tambah baris di Taxes — Type: 'Actual', Amount: NEGATIF",
						type: "Tax",
						section: "",
						note: "PPh jasa konstruksi: 2.65% × nilai bruto = Rp 79,998,269 (untuk opname ke-1 ini)",
					},
					{
						label: "PPh Rate untuk bekisting",
						value: "2.65% (SBU besar/sedang) ATAU 4% (kualifikasi kecil)",
						type: "Info",
						section: "",
						note: "Cek SBU/SIUJK Mas Samsuri untuk tentukan tarif yang tepat",
					},
					{
						label: "Retensi (jika berlaku)",
						value: "Jika kontrak ada retensi: tambah baris negatif Retensi 5%",
						type: "Deduction",
						section: "",
						note: "SPK ini tidak eksplisit sebut retensi — tanyakan ke PM",
					},
					{
						label: "Cara input di form",
						value:
							"Taxes Table → Add Row → Type='Actual' → Amount = nilai potongan NEGATIF",
						type: "How",
						section: "",
						note: "Misal: -Rp 15,000,000 untuk retensi",
					},
					{
						label: "Net to Pay",
						value:
							"Gross Amount - PPh - Retensi = Nilai yang dibayarkan ke subkon",
						type: "Result",
						section: "",
						note: "Ini yang dikirim ke rekening Mas Samsuri",
					},
				],
				note: "Kunci: Amount di Taxes harus NEGATIF untuk potongan. ERPNext akan hitung Grand Total = Subtotal + Taxes (yang bernilai negatif).",
			},
			{
				title: "Submit Purchase Invoice",
				path: "Klik tombol 'Submit'",
				why: "Setelah Submit, hutang ke Mas Samsuri resmi tercatat di Accounts Payable. Due date pembayaran sudah terset.",
				fields: [
					{
						label: "Cek Grand Total",
						value: "= Nilai opname - PPh (- Retensi jika ada)",
						type: "Validasi",
						section: "",
						note: "Verifikasi cocok dengan invoice fisik subkon",
					},
					{
						label: "Status setelah Submit",
						value: "PI: Unpaid — muncul di AP",
						type: "Result",
						section: "",
						note: "Hutang ke Mas Samsuri = Grand Total PI",
					},
					{
						label: "Efek ke AP",
						value: "Hutang Subkon bertambah sejumlah Grand Total",
						type: "Effect",
						section: "",
						note: "Muncul di AP Aging Report",
					},
					{
						label: "Efek ke P&L",
						value: "Biaya HPP Subkontraktor bertambah",
						type: "Effect",
						section: "",
						note: "Di Cost Center proyek",
					},
					{
						label: "Journal Entry",
						value: "Dr: HPP Subkon | Cr: Hutang Subkon",
						type: "JE Auto",
						section: "",
						note: "ERPNext buat JE otomatis — tidak perlu manual",
					},
				],
				note: "Satu invoice bisa di-link ke beberapa PR sekaligus jika Mas Samsuri menggabungkan tagihan beberapa periode dalam satu invoice. ERPNext support multi-PR ke satu PI.",
			},
		],
	},
	{
		id: "payment",
		label: "Payment Entry (Bayar Subkon)",
		icon: "💸",
		color: C.teal,
		badge: "PER PEMBAYARAN",
		tagline: "Saatnya transfer ke Mas Samsuri — ini langkah terakhir",
		substeps: [
			{
				title: "Buat Payment Entry dari Purchase Invoice",
				path: "Accounts → Payment Entry → New ATAU dari PI: klik 'Create' → 'Payment'",
				why: "Payment Entry mencatat bahwa kita sudah benar-benar mentransfer uang ke Mas Samsuri. Ini yang mengurangi hutang di AP dan mengurangi saldo bank.",
				fields: [
					{
						label: "Payment Type",
						value: "Pay",
						type: "Select",
						section: "",
						note: "Kita membayar ke supplier",
					},
					{
						label: "Party Type",
						value: "Supplier",
						type: "Select",
						section: "",
						note: "Pihak yang dibayar adalah Supplier",
					},
					{
						label: "Party",
						value: "Mas Samsuri",
						type: "Link",
						section: "",
						note: "Pilih dari dropdown",
					},
					{
						label: "Party Bank Account",
						value: "[rekening Mas Samsuri yang sudah didaftarkan]",
						type: "Link",
						section: "",
						note: "Nama bank, no rekening, atas nama",
					},
					{
						label: "Posting Date",
						value: "28-02-2026",
						type: "Date",
						section: "",
						note: "Tanggal transfer dilakukan",
					},
					{
						label: "Paid From",
						value: "Bank BCA - Rekening Operasional Proyek",
						type: "Link",
						section: "",
						note: "Rekening bank kita yang dipakai untuk bayar",
					},
					{
						label: "Paid Amount",
						value: "(isi nilai yang ditransfer)",
						type: "Currency",
						section: "",
						note: "Sesuai bukti transfer / instruksi Finance",
					},
					{
						label: "Reference No",
						value: "TRF20260228001",
						type: "Data",
						section: "",
						note: "Nomor referensi transfer bank — PENTING untuk rekonsiliasi",
					},
					{
						label: "Reference Date",
						value: "28-02-2026",
						type: "Date",
						section: "",
						note: "Tanggal transfer di mutasi bank",
					},
				],
				note: "Jika membayar sebagian (partial payment), isi Paid Amount dengan nilai parsial. ERPNext akan menyisakan hutang di AP sesuai selisihnya.",
			},
			{
				title: "Link ke Invoice yang Dibayar",
				path: "Masih di form PE → scroll ke bawah → tabel 'Payment References'",
				why: "Kita perlu specify invoice mana yang dilunasi oleh pembayaran ini. Jika tidak di-link, pembayaran akan jadi 'unallocated' dan invoice masih dianggap outstanding.",
				fields: [
					{
						label: "Type",
						value: "Purchase Invoice",
						type: "Select",
						section: "",
						note: "Pilih tipe dokumen yang dilunasi",
					},
					{
						label: "Name (No. Invoice)",
						value: "ACC-PINV-2026-00012",
						type: "Link",
						section: "",
						note: "Pilih nomor PI yang dibuat sebelumnya",
					},
					{
						label: "Grand Total",
						value: "(auto-filled)",
						type: "Fetch",
						section: "",
						note: "Total invoice yang harus dibayar",
					},
					{
						label: "Outstanding Amount",
						value: "(auto-filled)",
						type: "Fetch",
						section: "",
						note: "Sisa yang belum dibayar",
					},
					{
						label: "Allocated Amount",
						value: "(isi berapa yang dibayar untuk invoice ini)",
						type: "Currency",
						section: "",
						note: "Kalau lunasi penuh: sama dengan outstanding",
					},
				],
				note: "Bisa bayar beberapa invoice sekaligus dalam satu Payment Entry jika Mas Samsuri minta pembayaran gabungan. Tambahkan baris di tabel References.",
			},
			{
				title: "Submit Payment Entry",
				path: "Klik tombol 'Submit'",
				why: "Submit PE = konfirmasi pembayaran sudah dilakukan. Saldo bank berkurang, hutang AP ke Mas Samsuri berkurang.",
				fields: [
					{
						label: "Status setelah Submit",
						value: "Payment Entry: Submitted",
						type: "Result",
						section: "",
						note: "",
					},
					{
						label: "Efek ke AP",
						value: "Hutang ke Mas Samsuri berkurang sebesar Paid Amount",
						type: "Effect",
						section: "",
						note: "Jika lunas: PI status = Paid",
					},
					{
						label: "Efek ke Bank",
						value: "Saldo rekening bank berkurang",
						type: "Effect",
						section: "",
						note: "Muncul di Bank Ledger",
					},
					{
						label: "Journal Entry otomatis",
						value: "Dr: Hutang Subkon | Cr: Bank",
						type: "JE Auto",
						section: "",
						note: "ERPNext buat JE otomatis",
					},
					{
						label: "Bank Reconciliation",
						value: "Cocokkan dengan mutasi rekening koran",
						type: "Action",
						section: "",
						note: "Accounting → Bank Reconciliation Statement — lakukan akhir bulan",
					},
				],
				note: "Setelah Submit, cetak atau download bukti pembayaran dari ERPNext untuk dokumentasi. Kirim ke Mas Samsuri sebagai konfirmasi transfer.",
			},
		],
	},
];

/* ─── ITEM TABLE ─── */
function ItemTable() {
	return (
		<div
			style={{
				overflowX: "auto",
				borderRadius: 8,
				border: `1px solid ${C.border}`,
			}}>
			<table
				style={{
					width: "100%",
					borderCollapse: "collapse",
					fontSize: "0.73rem",
				}}>
				<thead>
					<tr style={{ background: C.navy, color: "#fff" }}>
						{[
							"No",
							"Gedung",
							"Item Code",
							"Nama Pekerjaan",
							"UOM",
							"Qty (Volume)",
							"Rate (Harga Sat)",
							"Amount (Jumlah)",
						].map((h) => (
							<th
								key={h}
								style={{
									padding: "6px 10px",
									textAlign:
										h === "No"
											? "center"
											: h.includes("Qty") ||
												  h.includes("Rate") ||
												  h.includes("Amount")
												? "right"
												: "left",
									fontFamily: "monospace",
									fontSize: "0.58rem",
									letterSpacing: 1,
									whiteSpace: "nowrap",
								}}>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{SPK.items.map((it, i) => (
						<tr
							key={i}
							style={{
								background: i % 2 === 0 ? "#fff" : "#f8faff",
								borderBottom: `1px solid ${C.light}`,
							}}>
							<td
								style={{
									padding: "5px 10px",
									textAlign: "center",
									color: C.muted,
									fontFamily: "monospace",
								}}>
								{it.no}
							</td>
							<td
								style={{
									padding: "5px 10px",
									fontSize: "0.68rem",
									color: C.blue,
									fontWeight: 700,
								}}>
								{it.gedung}
							</td>
							<td
								style={{
									padding: "5px 10px",
									fontFamily: "monospace",
									fontSize: "0.68rem",
									color: C.purple,
								}}>
								{it.kode}
							</td>
							<td style={{ padding: "5px 10px", color: C.text }}>{it.nama}</td>
							<td
								style={{
									padding: "5px 10px",
									textAlign: "right",
									fontFamily: "monospace",
									color: C.muted,
								}}>
								{it.sat}
							</td>
							<td
								style={{
									padding: "5px 10px",
									textAlign: "right",
									fontFamily: "monospace",
								}}>
								{f(it.vol)}
							</td>
							<td
								style={{
									padding: "5px 10px",
									textAlign: "right",
									fontFamily: "monospace",
								}}>
								Rp {f(it.hsat)}
							</td>
							<td
								style={{
									padding: "5px 10px",
									textAlign: "right",
									fontFamily: "monospace",
									fontWeight: 700,
									color: C.navy,
								}}>
								Rp {f(Math.round(it.jumlah))}
							</td>
						</tr>
					))}
					<tr
						style={{ background: "#e8f0fb", borderTop: `2px solid ${C.navy}` }}>
						<td
							colSpan={7}
							style={{
								padding: "6px 10px",
								textAlign: "right",
								fontWeight: 800,
								color: C.navy,
							}}>
							TOTAL NILAI SPK
						</td>
						<td
							style={{
								padding: "6px 10px",
								textAlign: "right",
								fontFamily: "monospace",
								fontWeight: 800,
								color: C.blue,
								fontSize: "0.8rem",
							}}>
							Rp {f(SPK.total)}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}

/* ─── DECISION BOX ─── */
function DecisionBox() {
	return (
		<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
			{[
				{
					title: "✅ GUNAKAN Purchase Order Standard",
					color: C.green,
					points: [
						"SPK nilai kecil–menengah (< Rp 5 M)",
						"Subkon dengan 1-3 termin opname saja",
						"Tidak butuh fitur scoring performa subkon",
						"Tidak butuh manajemen retensi otomatis",
						"Tim tidak punya developer ERPNext",
						"Ingin go-live cepat (< 1 minggu setup)",
					],
					verdict: "90% kasus kontraktor di Indonesia cukup dengan ini",
					rec: "RECOMMENDED untuk SPK Mas Samsuri ini",
				},
				{
					title: "🔧 GUNAKAN Custom DocType SPK",
					color: C.amber,
					points: [
						"SPK nilai besar dengan banyak subkon",
						"Butuh multiple BAO per kontrak (> 5 termin)",
						"Butuh retensi otomatis dan ledger retensi per subkon",
						"Butuh scoring performa subkon otomatis",
						"Butuh penalty tracking per hari keterlambatan",
						"Ada developer ERPNext atau implementor",
					],
					verdict:
						"Untuk proyek skala besar atau perusahaan dengan ratusan SPK/tahun",
					rec: "Lihat Custom Feature #2 dalam blueprint",
				},
			].map((box, i) => (
				<div
					key={i}
					style={{
						background: C.card,
						border: `2px solid ${box.color}`,
						borderRadius: 12,
						padding: "1.1rem",
						display: "flex",
						flexDirection: "column",
						gap: 8,
					}}>
					<div
						style={{ color: box.color, fontWeight: 800, fontSize: "0.88rem" }}>
						{box.title}
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
						{box.points.map((p, j) => (
							<div
								key={j}
								style={{
									display: "flex",
									gap: 6,
									fontSize: "0.76rem",
									color: C.sub,
								}}>
								<span style={{ color: box.color, flexShrink: 0 }}>•</span>
								{p}
							</div>
						))}
					</div>
					<div
						style={{
							marginTop: "auto",
							background: box.color + "15",
							borderRadius: 7,
							padding: "0.5rem 0.7rem",
							fontSize: "0.72rem",
							color: box.color,
							fontWeight: 700,
						}}>
						{box.rec}
					</div>
				</div>
			))}
		</div>
	);
}

/* ─── CHAIN VISUAL ─── */
function ChainVisual({ activePhase }) {
	const phases = [
		{ id: "prereq", label: "Setup Awal", icon: "⚙️", color: C.purple },
		{ id: "po", label: "PO / SPK", icon: "📋", color: C.blue },
		{ id: "receipt", label: "BAO Opname", icon: "📐", color: C.green },
		{ id: "invoice", label: "Invoice", icon: "🧾", color: C.amber },
		{ id: "payment", label: "Bayar", icon: "💸", color: C.teal },
	];
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 0,
				flexWrap: "nowrap",
				overflowX: "auto",
				padding: "0.5rem 0",
			}}>
			{phases.map((p, i) => (
				<>
					<div
						key={p.id}
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: 4,
							minWidth: 70,
						}}>
						<div
							style={{
								width: 42,
								height: 42,
								borderRadius: "50%",
								background: activePhase === p.id ? p.color : p.color + "25",
								border: `2px solid ${p.color}`,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 18,
								transition: "all 0.2s",
							}}>
							{p.icon}
						</div>
						<div
							style={{
								fontSize: "0.6rem",
								color: activePhase === p.id ? p.color : C.muted,
								textAlign: "center",
								fontWeight: activePhase === p.id ? 700 : 400,
								fontFamily: "monospace",
							}}>
							{p.label}
						</div>
					</div>
					{i < phases.length - 1 && (
						<div
							key={`arr${i}`}
							style={{
								color: C.light,
								fontSize: "1.4rem",
								margin: "0 2px",
								flexShrink: 0,
								paddingBottom: 18,
							}}>
							→
						</div>
					)}
				</>
			))}
		</div>
	);
}

/* ─── MAIN ─── */
export default function InputSPKDetail() {
	const [activePhase, setActivePhase] = useState("po");
	const [openSub, setOpenSub] = useState(0);
	const [showDecision, setShowDecision] = useState(false);
	const [showItems, setShowItems] = useState(false);
	const phase = PHASES.find((p) => p.id === activePhase);

	return (
		<div
			style={{
				background: C.bg,
				minHeight: "100vh",
				color: C.text,
				fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
			}}>
			{/* HEADER */}
			<div
				style={{
					background: C.navy,
					borderBottom: `4px solid ${C.gold}`,
					padding: "1.3rem 1.5rem 1.1rem",
				}}>
				<div style={{ maxWidth: 1100, margin: "0 auto" }}>
					<div
						style={{
							fontFamily: "monospace",
							fontSize: "0.55rem",
							color: "#5a7aaa",
							letterSpacing: 4,
							marginBottom: 4,
						}}>
						PANDUAN IMPLEMENTASI LENGKAP — STEP BY STEP
					</div>
					<h1
						style={{
							margin: 0,
							color: "#fff",
							fontSize: "clamp(1.1rem,2.2vw,1.6rem)",
							fontWeight: 900,
						}}>
						Input SPK ke ERPNext: Dari Nol sampai Bayar Subkon
					</h1>
					<div
						style={{
							marginTop: 6,
							fontFamily: "monospace",
							fontSize: "0.7rem",
							color: "#7a9acc",
							display: "flex",
							gap: 12,
							flexWrap: "wrap",
						}}>
						<span>📋 {SPK.nomor}</span>
						<span>👤 {SPK.supplier}</span>
						<span>💰 Rp {f(SPK.total)}</span>
						<span>
							📅 {SPK.mulai} → {SPK.selesai}
						</span>
					</div>
				</div>
			</div>

			<div
				style={{
					maxWidth: 1100,
					margin: "0 auto",
					padding: "1.3rem 1.5rem",
					display: "flex",
					flexDirection: "column",
					gap: 12,
				}}>
				{/* DECISION BOX TOGGLE */}
				<div
					style={{
						background: C.card,
						border: `1px solid ${C.border}`,
						borderRadius: 10,
						padding: "0.9rem 1.1rem",
					}}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: 8,
						}}>
						<div>
							<div
								style={{
									fontFamily: "monospace",
									fontSize: "0.55rem",
									color: C.muted,
									letterSpacing: 3,
									marginBottom: 4,
								}}>
								JAWABAN ATAS PERTANYAAN ANDA
							</div>
							<p
								style={{
									color: C.sub,
									fontSize: "0.82rem",
									margin: 0,
									lineHeight: 1.6,
								}}>
								<strong style={{ color: C.navy }}>
									Untuk SPK Mas Samsuri ini: gunakan Purchase Order standard
									ERPNext.
								</strong>{" "}
								Custom DocType hanya perlu jika kompleksitas jauh lebih tinggi.
								Panduan ini mengajarkan cara input PO secara detail — field per
								field.
							</p>
						</div>
						<button
							onClick={() => setShowDecision(!showDecision)}
							style={{
								padding: "0.45rem 1rem",
								background: C.blue + "15",
								border: `1px solid ${C.blue}`,
								borderRadius: 6,
								color: C.blue,
								fontWeight: 700,
								fontSize: "0.74rem",
								cursor: "pointer",
								whiteSpace: "nowrap",
							}}>
							{showDecision
								? "Tutup"
								: "Lihat Perbandingan PO vs Custom DocType"}
						</button>
					</div>
					{showDecision && (
						<div style={{ marginTop: 12 }}>
							<DecisionBox />
						</div>
					)}
				</div>

				{/* ITEM TABLE TOGGLE */}
				<div
					style={{
						background: C.card,
						border: `1px solid ${C.border}`,
						borderRadius: 10,
						overflow: "hidden",
					}}>
					<button
						onClick={() => setShowItems(!showItems)}
						style={{
							width: "100%",
							background: "none",
							border: "none",
							padding: "0.85rem 1.1rem",
							cursor: "pointer",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							textAlign: "left",
						}}>
						<div>
							<div
								style={{
									fontFamily: "monospace",
									fontSize: "0.55rem",
									color: C.muted,
									letterSpacing: 3,
								}}>
								DATA REFERENSI — 6 ITEM SPK YANG AKAN DIINPUT
							</div>
							<div
								style={{
									color: C.navy,
									fontWeight: 700,
									fontSize: "0.88rem",
									marginTop: 2,
								}}>
								Tabel Items: Semua Baris yang Harus Diinput ke PO
							</div>
						</div>
						<span
							style={{
								color: C.blue,
								fontSize: "1.1rem",
								transform: showItems ? "rotate(90deg)" : "none",
								transition: "transform 0.2s",
							}}>
							›
						</span>
					</button>
					{showItems && (
						<div style={{ padding: "0 1.1rem 1.1rem" }}>
							<ItemTable />
						</div>
					)}
				</div>

				{/* CHAIN VISUAL */}
				<div
					style={{
						background: C.card,
						border: `1px solid ${C.border}`,
						borderRadius: 10,
						padding: "0.9rem 1.2rem",
					}}>
					<div
						style={{
							fontFamily: "monospace",
							fontSize: "0.55rem",
							color: C.muted,
							letterSpacing: 3,
							marginBottom: 8,
						}}>
						ALUR LENGKAP — KLIK FASE UNTUK BUKA PANDUAN
					</div>
					<ChainVisual activePhase={activePhase} />
				</div>

				{/* PHASE SELECTOR */}
				<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
					{PHASES.map((p) => (
						<button
							key={p.id}
							onClick={() => {
								setActivePhase(p.id);
								setOpenSub(0);
							}}
							style={{
								padding: "0.45rem 0.9rem",
								background: activePhase === p.id ? p.color : C.card,
								border: `2px solid ${activePhase === p.id ? p.color : C.border}`,
								borderRadius: 7,
								cursor: "pointer",
								color: activePhase === p.id ? "#fff" : C.sub,
								fontWeight: 700,
								fontSize: "0.73rem",
								transition: "all 0.15s",
								display: "flex",
								gap: 6,
								alignItems: "center",
							}}>
							<span>{p.icon}</span>
							<span>{p.label}</span>
							<span
								style={{
									background:
										activePhase === p.id
											? "rgba(255,255,255,0.25)"
											: p.color + "20",
									color: activePhase === p.id ? "#fff" : p.color,
									borderRadius: 4,
									padding: "0px 5px",
									fontSize: "0.57rem",
									fontFamily: "monospace",
								}}>
								{p.badge}
							</span>
						</button>
					))}
				</div>

				{/* PHASE CONTENT */}
				{phase && (
					<div
						style={{
							background: C.card,
							border: `2px solid ${phase.color}`,
							borderRadius: 12,
							overflow: "hidden",
						}}>
						{/* Phase header */}
						<div
							style={{
								background: phase.color,
								padding: "0.9rem 1.2rem",
								display: "flex",
								gap: 12,
								alignItems: "center",
							}}>
							<span style={{ fontSize: 26 }}>{phase.icon}</span>
							<div>
								<div
									style={{
										color: "rgba(255,255,255,0.7)",
										fontFamily: "monospace",
										fontSize: "0.58rem",
										letterSpacing: 3,
									}}>
									FASE {PHASES.findIndex((p) => p.id === phase.id) + 1} OF 5 —{" "}
									{phase.badge}
								</div>
								<div
									style={{ color: "#fff", fontWeight: 900, fontSize: "1rem" }}>
									{phase.label}
								</div>
								<div
									style={{
										color: "rgba(255,255,255,0.75)",
										fontSize: "0.78rem",
									}}>
									{phase.tagline}
								</div>
							</div>
						</div>

						{/* Substeps */}
						<div style={{ padding: "1rem" }}>
							{phase.substeps.map((sub, si) => (
								<div
									key={si}
									style={{
										marginBottom: 8,
										border: `1px solid ${openSub === si ? phase.color + "60" : C.border}`,
										borderRadius: 10,
										overflow: "hidden",
										transition: "border-color 0.2s",
									}}>
									<button
										onClick={() => setOpenSub(openSub === si ? -1 : si)}
										style={{
											width: "100%",
											background: openSub === si ? phase.color + "08" : "none",
											border: "none",
											padding: "0.75rem 1rem",
											cursor: "pointer",
											display: "grid",
											gridTemplateColumns: "28px 1fr auto",
											gap: 10,
											alignItems: "center",
											textAlign: "left",
										}}>
										<div
											style={{
												width: 26,
												height: 26,
												borderRadius: "50%",
												background: openSub === si ? phase.color : C.light,
												border: `2px solid ${openSub === si ? phase.color : C.border}`,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontFamily: "monospace",
												fontSize: "0.65rem",
												color: openSub === si ? "#fff" : C.muted,
												fontWeight: 700,
												flexShrink: 0,
											}}>
											{si + 1}
										</div>
										<div>
											<div
												style={{
													color: C.navy,
													fontWeight: 700,
													fontSize: "0.86rem",
												}}>
												{sub.title}
											</div>
											<div
												style={{
													fontFamily: "monospace",
													fontSize: "0.6rem",
													color: phase.color,
													marginTop: 1,
												}}>
												📍 {sub.path}
											</div>
										</div>
										<span
											style={{
												color: phase.color,
												fontSize: "1.1rem",
												transform: openSub === si ? "rotate(90deg)" : "none",
												transition: "transform 0.2s",
												display: "inline-block",
											}}>
											›
										</span>
									</button>

									{openSub === si && (
										<div
											style={{
												borderTop: `1px solid ${C.border}`,
												padding: "0.9rem 1rem",
											}}>
											{/* Why */}
											<div
												style={{
													background: phase.color + "10",
													border: `1px solid ${phase.color}30`,
													borderRadius: 8,
													padding: "0.6rem 0.85rem",
													marginBottom: 12,
													display: "flex",
													gap: 8,
												}}>
												<span style={{ color: phase.color, flexShrink: 0 }}>
													💡
												</span>
												<span
													style={{
														color: C.sub,
														fontSize: "0.77rem",
														lineHeight: 1.6,
													}}>
													<strong>Kenapa langkah ini?</strong> {sub.why}
												</span>
											</div>

											{/* Fields table */}
											<div
												style={{
													fontFamily: "monospace",
													fontSize: "0.55rem",
													color: C.muted,
													letterSpacing: 3,
													marginBottom: 8,
												}}>
												FIELD YANG DIISI — NILAI DARI SPK MAS SAMSURI
											</div>
											<div
												style={{
													overflowX: "auto",
													borderRadius: 8,
													border: `1px solid ${C.border}`,
													marginBottom: 12,
												}}>
												<table
													style={{
														width: "100%",
														borderCollapse: "collapse",
														fontSize: "0.73rem",
													}}>
													<thead>
														<tr style={{ background: "#f1f5f9" }}>
															{[
																"Field / Aksi",
																"Nilai yang Diinput",
																"Tipe",
																"Keterangan",
															].map((h) => (
																<th
																	key={h}
																	style={{
																		padding: "5px 10px",
																		textAlign: "left",
																		fontFamily: "monospace",
																		fontSize: "0.56rem",
																		color: C.muted,
																		letterSpacing: 2,
																		borderBottom: `1px solid ${C.border}`,
																		whiteSpace: "nowrap",
																	}}>
																	{h}
																</th>
															))}
														</tr>
													</thead>
													<tbody>
														{sub.fields.map((fld, fi) => {
															const tc =
																fld.type === "Fetch"
																	? "#0d6e56"
																	: fld.type.includes("AUTO") ||
																		  fld.type === "Calc"
																		? C.blue
																		: fld.type === "Validasi"
																			? "#b45309"
																			: fld.type === "Result"
																				? C.teal
																				: fld.type === "Effect"
																					? C.purple
																					: fld.type === "Tax" ||
																						  fld.type === "Deduction"
																						? C.red
																						: fld.label.includes("CUSTOM")
																							? C.amber
																							: C.navy;
															return (
																<tr
																	key={fi}
																	style={{
																		background:
																			fi % 2 === 0 ? "#fff" : "#f8faff",
																		borderBottom: `1px solid ${C.light}`,
																	}}>
																	<td
																		style={{
																			padding: "4px 10px",
																			fontWeight: 700,
																			color: C.navy,
																			fontSize: "0.73rem",
																		}}>
																		{fld.label}
																	</td>
																	<td
																		style={{
																			padding: "4px 10px",
																			fontFamily: "monospace",
																			fontSize: "0.7rem",
																			color: tc,
																			fontWeight: 600,
																		}}>
																		{fld.value}
																	</td>
																	<td
																		style={{
																			padding: "4px 10px",
																			whiteSpace: "nowrap",
																		}}>
																		<span
																			style={{
																				background: tc + "15",
																				color: tc,
																				border: `1px solid ${tc}30`,
																				borderRadius: 4,
																				padding: "1px 6px",
																				fontSize: "0.58rem",
																				fontFamily: "monospace",
																				fontWeight: 700,
																			}}>
																			{fld.type}
																		</span>
																	</td>
																	<td
																		style={{
																			padding: "4px 10px",
																			color: C.muted,
																			fontSize: "0.7rem",
																		}}>
																		{fld.note}
																	</td>
																</tr>
															);
														})}
													</tbody>
												</table>
											</div>

											{/* Note */}
											<div
												style={{
													background: "#fffbeb",
													border: `1px solid #d97706`,
													borderRadius: 8,
													padding: "0.6rem 0.85rem",
													display: "flex",
													gap: 8,
												}}>
												<span style={{ color: C.gold, flexShrink: 0 }}>⚠️</span>
												<span
													style={{
														color: "#78350f",
														fontSize: "0.76rem",
														lineHeight: 1.6,
													}}>
													{sub.note}
												</span>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* SUMMARY CHAIN */}
				<div
					style={{
						background: C.card,
						border: `1px solid ${C.border}`,
						borderRadius: 11,
						padding: "1rem 1.2rem",
					}}>
					<div
						style={{
							fontFamily: "monospace",
							fontSize: "0.55rem",
							color: C.muted,
							letterSpacing: 3,
							marginBottom: 10,
						}}>
						RINGKASAN: EFEK SETIAP LANGKAH KE LAPORAN KEUANGAN
					</div>
					<div style={{ overflowX: "auto" }}>
						<table
							style={{
								width: "100%",
								borderCollapse: "collapse",
								fontSize: "0.73rem",
							}}>
							<thead>
								<tr style={{ background: C.navy, color: "#fff" }}>
									{[
										"Langkah",
										"Dokumen ERPNext",
										"Efek ke AP",
										"Efek ke Project Cost",
										"Efek ke Bank",
										"Status PO",
									].map((h) => (
										<th
											key={h}
											style={{
												padding: "5px 10px",
												textAlign: "left",
												fontFamily: "monospace",
												fontSize: "0.57rem",
												letterSpacing: 1,
												whiteSpace: "nowrap",
											}}>
											{h}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{[
									[
										"1. Input PO",
										"Purchase Order",
										"—",
										"Committed Cost +3.01B",
										"—",
										"Open",
									],
									[
										"2. BAO/Opname ke-1",
										"Purchase Receipt",
										"—",
										"Actual Cost bertambah",
										"—",
										"Partially Received",
									],
									[
										"3. Invoice ke-1",
										"Purchase Invoice",
										"Hutang +nilai netto",
										"—",
										"—",
										"Partially Billed",
									],
									[
										"4. Bayar ke-1",
										"Payment Entry",
										"Hutang berkurang",
										"—",
										"Bank berkurang",
										"Partially Paid",
									],
									[
										"5. Repeat (Opname ke-2...N)",
										"PR → PI → PE",
										"Bertambah lalu turun",
										"Bertambah bertahap",
										"Berkurang bertahap",
										"Receiving...",
									],
									[
										"6. PO Fully Received",
										"Semua PR closed",
										"—",
										"Actual = kontrak",
										"—",
										"Closed",
									],
								].map((row, i) => (
									<tr
										key={i}
										style={{
											background: i % 2 === 0 ? "#fff" : "#f8faff",
											borderBottom: `1px solid ${C.light}`,
										}}>
										{row.map((cell, j) => (
											<td
												key={j}
												style={{
													padding: "5px 10px",
													color:
														j === 0
															? C.navy
															: j === 4 && cell !== "—"
																? C.red
																: j === 3 && cell !== "—"
																	? C.green
																	: j === 2 && cell.includes("Hutang")
																		? C.amber
																		: C.sub,
													fontWeight: j === 0 ? 700 : 400,
													fontSize: "0.72rem",
												}}>
												{cell}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
