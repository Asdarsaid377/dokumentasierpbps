import { useState } from "react";

const MONO = "'Courier New', monospace";
const SERIF = "'Georgia', serif";

const MODULES = [
	{
		id: "warehouse",
		icon: "🏭",
		label: "Warehouse Management",
		color: "#22d3ee",
		short: "Struktur gudang pusat & site proyek",
		desc: "Warehouse di ERPNext bukan sekadar lokasi fisik — ini adalah entitas akuntansi yang memisahkan stok per lokasi. Untuk kontraktor, setiap site proyek harus punya warehouse sendiri agar stok material tidak tercampur antar proyek dan biaya material bisa ditracking per proyek dengan akurat.",
		howto: [
			{
				step: "Rancang struktur warehouse sesuai operasional",
				detail:
					"Buat hierarki: Gudang Utama (parent) → Gudang Pusat → Site Proyek A / Site Proyek B. Setiap level mencerminkan lokasi fisik nyata.",
			},
			{
				step: "Buat Gudang Pusat (Central Store)",
				detail:
					"Stock → Warehouse → New. Nama: 'Gudang Pusat - [Nama Perusahaan]'. Set Is Group = No, Account: pilih akun Inventory di CoA. Ini gudang buffer sebelum material dikirim ke site.",
			},
			{
				step: "Buat Site Warehouse per Proyek",
				detail:
					"Untuk setiap proyek aktif, buat warehouse: 'Site - Proyek Gedung ABC'. Hubungkan ke Cost Center proyek tersebut. Saat material di-receive ke sini, biaya otomatis masuk ke proyek.",
			},
			{
				step: "Buat Rejected/QC Warehouse",
				detail:
					"Buat warehouse khusus: 'Rejected Material Store'. Material yang gagal QC saat penerimaan masuk ke sini dulu sebelum dikembalikan ke supplier. Memisahkan material bad dari material usable.",
			},
			{
				step: "Buat Scrap Warehouse",
				detail:
					"Warehouse untuk sisa material yang tidak terpakai (scrap): 'Scrap Store'. Material sisa bisa di-value dan dilaporkan terpisah.",
			},
			{
				step: "Set Warehouse Account mapping",
				detail:
					"Setiap warehouse harus dipetakan ke akun inventory di Chart of Accounts. Ini penting agar nilai stok di balance sheet akurat dan bisa di-reconcile.",
			},
		],
		config: [
			{
				field: "Warehouse Type",
				value:
					"Transit = untuk material dalam perjalanan | Stores = gudang aktif | Scrap = material sisa/rusak",
			},
			{
				field: "Parent Warehouse",
				value:
					"Buat hierarki: All Warehouses → Gudang Pusat → Site Proyek. Ini membentuk tree yang memudahkan drill-down di laporan",
			},
			{
				field: "Account",
				value:
					"Wajib set akun inventory (Stock In Hand) yang berbeda per warehouse group agar balance sheet bisa di-breakdown per proyek",
			},
			{
				field: "Company",
				value:
					"Set company yang benar — penting untuk multi-company setup jika grup perusahaan punya lebih dari satu entitas",
			},
		],
		warning:
			"Jangan buat satu warehouse untuk semua proyek. Tanpa pemisahan warehouse per proyek, nilai stok di setiap proyek tidak bisa diketahui dan laporan biaya proyek tidak akurat.",
	},
	{
		id: "item",
		icon: "📦",
		label: "Item Master & Item Variants",
		color: "#a78bfa",
		short: "Database lengkap semua material konstruksi",
		desc: "Item Master adalah katalog semua material yang dikelola perusahaan. Kelengkapan dan konsistensi Item Master menentukan kualitas seluruh sistem inventory. Untuk kontraktor, item master harus mencakup semua material dari RAB dengan kode yang terstandarisasi.",
		howto: [
			{
				step: "Kategorikan material dengan Item Group yang logis",
				detail:
					"Buat Item Groups: Material Sipil Utama / Besi & Baja / Material Arsitektur / Material Mekanikal / Material Elektrikal / Alat Kecil / Material K3. Hierarchy yang baik memudahkan laporan per kategori.",
			},
			{
				step: "Buat Item per material dengan kode unik",
				detail:
					"Item Code: MAT-SEM-PCC-001 (Material-Semen-Portland Composite-varian 001). Nama: 'Semen Portland Composite 40kg'. Kode yang konsisten kritis untuk searching dan reporting.",
			},
			{
				step: "Set UOM (Unit of Measure) yang tepat",
				detail:
					"Default UOM: satuan pembelian (zak, ton, m³). Tapi bisa set UOM conversion: 1 ton = 25 zak. ERPNext otomatis convert saat diperlukan. Pastikan UOM di PO sama dengan di MR untuk menghindari confusion.",
			},
			{
				step: "Aktifkan Maintain Stock untuk material simpan",
				detail:
					"Centang 'Maintain Stock = Yes' untuk semua material yang disimpan di gudang. Material habis pakai (consumable kecil) bisa set Maintain Stock = No.",
			},
			{
				step: "Set reorder level & safety stock",
				detail:
					"Di tab Inventory, set: Reorder Level (titik pemesanan ulang), Reorder Qty (berapa qty dipesan saat reorder), Safety Stock (stok minimum yang harus selalu ada). Sistem akan alert saat stok mendekati reorder level.",
			},
			{
				step: "Item Variant untuk material dengan spec berbeda",
				detail:
					"Gunakan Item Template + Variant untuk material yang punya varian: Besi Beton dengan diameter berbeda (D10, D13, D16, D19, D22, D25) cukup satu template dengan atribut diameter.",
			},
		],
		config: [
			{
				field: "Valuation Method",
				value:
					"FIFO (First In First Out) — recommended untuk konstruksi karena material yang datang duluan harus dipakai duluan. Set di Accounting Settings.",
			},
			{
				field: "Item Tax Template",
				value:
					"Buat template per kategori: PPN 11% untuk material umum, No Tax untuk material tertentu yang exempt",
			},
			{
				field: "Quality Inspection Required",
				value:
					"Aktifkan untuk material kritis: besi beton, semen, beton ready mix — wajib QC sebelum GRN bisa di-submit",
			},
			{
				field: "Allow Negative Stock",
				value:
					"JANGAN aktifkan ini. Jika diaktifkan, sistem akan izinkan pemakaian melebihi stok yang ada — data inventory tidak real.",
			},
		],
		warning:
			"Item Master yang tidak terstandarisasi (nama berbeda untuk material yang sama, kode tidak konsisten) adalah penyebab utama laporan inventory tidak bisa dibaca. Luangkan waktu 1-2 minggu untuk setup Item Master yang benar sebelum go-live.",
	},
	{
		id: "stockentry",
		icon: "🔄",
		label: "Stock Entry (Pergerakan Material)",
		color: "#34d399",
		short: "Semua transaksi pergerakan stok",
		desc: "Stock Entry adalah dokumen untuk semua jenis pergerakan material di luar transaksi pembelian dan penjualan. Untuk kontraktor, ini dipakai untuk: transfer material dari gudang pusat ke site, pencatatan pemakaian material di lapangan, material return dari site ke gudang, dan write-off material rusak.",
		howto: [
			{
				step: "Material Transfer: Gudang Pusat → Site",
				detail:
					"Saat material dikirim dari gudang pusat ke site proyek: New Stock Entry → Type: Material Transfer → Source Warehouse: Gudang Pusat → Target Warehouse: Site Proyek A → isi items dan qty → Submit. Stok berkurang di gudang pusat, bertambah di site.",
			},
			{
				step: "Material Issue: Pencatatan Pemakaian di Lapangan",
				detail:
					"Saat material dipakai dari gudang site untuk pekerjaan: New Stock Entry → Type: Material Issue → Source Warehouse: Site Proyek A → isi items yang dipakai, qty, dan link ke Project → Submit. Stok berkurang, biaya masuk ke project costing.",
			},
			{
				step: "Material Receipt: Penerimaan dari Supplier",
				detail:
					"Normalnya ini lewat Purchase Receipt (GRN), bukan Stock Entry langsung. Gunakan Stock Entry type Receipt hanya untuk penerimaan non-pembelian: hibah material, material pindahan dari proyek lain.",
			},
			{
				step: "Material Return: Sisa Material dari Site",
				detail:
					"Material sisa di site yang dikembalikan ke gudang pusat: Stock Entry → Type: Material Transfer → Source: Site Proyek A → Target: Gudang Pusat. Stok pindah kembali ke gudang pusat, biaya proyek berkurang.",
			},
			{
				step: "Stock Reconciliation: Opname fisik gudang",
				detail:
					"Setelah stock opname fisik, sesuaikan sistem dengan realita: Stock → Stock Reconciliation → New. Isi qty aktual per item per warehouse. Sistem otomatis buat penyesuaian (gain/loss stok).",
			},
			{
				step: "Write-off material rusak/hilang",
				detail:
					"Material yang rusak atau hilang: Stock Entry → Type: Material Issue → Source: Warehouse → Target: Scrap Warehouse atau langsung write off. Isi Expense Account = Loss on Stock Write-off untuk mencatat kerugian.",
			},
		],
		config: [
			{
				field: "Stock Entry Type",
				value:
					"Material Issue / Material Transfer / Material Transfer for Manufacture / Material Receipt / Repack / Send to Subcontractor",
			},
			{
				field: "Link ke Project",
				value:
					"WAJIB isi field Project di Stock Entry type Material Issue agar biaya material masuk ke Project Costing",
			},
			{
				field: "Additional Cost",
				value:
					"Bisa tambahkan biaya handling/angkut di Additional Costs — otomatis ter-include ke landed cost material",
			},
			{
				field: "Scan Barcode",
				value:
					"Aktifkan barcode scanning di Stock Entry untuk input item lebih cepat di gudang — kurangi human error",
			},
		],
		warning:
			"Material Issue yang dilakukan tanpa link ke Project adalah biaya yang 'hilang' — tidak masuk ke project costing manapun. Strict SOP: setiap Material Issue harus ada Project yang dipilih.",
	},
	{
		id: "serial",
		icon: "🔢",
		label: "Serial No & Batch Tracking",
		color: "#fbbf24",
		short: "Tracking individual & kelompok material",
		desc: "Serial Number untuk tracking material satu-per-satu (alat berat, pompa, panel listrik). Batch Number untuk tracking kelompok material dengan karakteristik sama (satu pengiriman beton ready mix, satu lot besi dari pabrik yang sama). Penting untuk quality traceability di konstruksi.",
		howto: [
			{
				step: "Aktifkan Serial Number untuk alat dan equipment",
				detail:
					"Di Item Master, centang 'Has Serial No = Yes' untuk: genset, pompa air, alat survei, panel listrik, dll. Setiap unit punya nomor seri unik. ERPNext paksa input Serial No di setiap transaksi.",
			},
			{
				step: "Aktifkan Batch untuk material dengan lot",
				detail:
					"Centang 'Has Batch No = Yes' untuk: beton ready mix (batch per truck), besi beton (per lot pabrik + mill certificate), cat (per lot warna). Batch memungkinkan traceability jika ada klaim kualitas.",
			},
			{
				step: "Input Serial No saat GRN",
				detail:
					"Saat material dengan Serial No datang, input nomor seri dari sticker/label fisik ke sistem. ERPNext akan validate bahwa Serial No tidak duplikat.",
			},
			{
				step: "Buat Batch saat terima material berlot",
				detail:
					"Saat GRN, buat Batch baru: isi Batch ID (bisa dari nomor delivery note supplier), Expiry Date (untuk material dengan masa pakai), Manufacturing Date. Upload Mill Certificate sebagai lampiran batch.",
			},
			{
				step: "Track Serial No di lapangan",
				detail:
					"Saat alat dipindah ke site: Stock Entry → pilih Serial No yang spesifik. Sistem tahu persis dimana setiap alat berada saat ini — tidak bisa dua tempat sekaligus.",
			},
		],
		config: [
			{
				field: "Serial No",
				value:
					"Gunakan untuk: Alat berat, pompa, genset, scaffold jack base, panel listrik — item yang bisa dicuri atau hilang dan perlu ditracking individual",
			},
			{
				field: "Batch No",
				value:
					"Gunakan untuk: Beton ready mix (per truck), besi beton (per mill cert), cat (per lot), waterproofing (per lot) — material yang butuh quality traceability",
			},
			{
				field: "Batch Expiry",
				value:
					"Set expiry date untuk material yang punya masa pakai: semen (3 bulan), cat (2 tahun), bahan kimia. Sistem alert saat material mendekati expiry.",
			},
		],
		warning: null,
	},
	{
		id: "valuation",
		icon: "💰",
		label: "Stock Valuation & Costing",
		color: "#f97316",
		short: "Nilai inventori & HPP material",
		desc: "Stock Valuation menentukan berapa nilai material yang ada di gudang dan berapa biaya material yang sudah dipakai (COGS). Untuk kontraktor, valuation yang akurat sangat penting karena nilai stok material di site bisa sangat besar dan langsung berdampak ke laporan keuangan.",
		howto: [
			{
				step: "Pilih metode valuation yang tepat: FIFO",
				detail:
					"Di Accounting Settings, set Stock Valuation Method = FIFO. Ini berarti material yang masuk lebih dulu (harga lama) dipakai duluan dalam perhitungan HPP. Paling sesuai untuk konstruksi karena material fisik juga dipakai berdasarkan urutan datang.",
			},
			{
				step: "Pantau Stock Value Report",
				detail:
					"Stock → Reports → Stock Value. Tampilkan nilai total inventory per warehouse atau per item. Review bulanan untuk pastikan nilai di sistem sesuai dengan realita di lapangan.",
			},
			{
				step: "Reconcile dengan Balance Sheet",
				detail:
					"Nilai total di Stock Value Report harus sama dengan nilai akun 'Persediaan Material' di Balance Sheet. Jika ada perbedaan → ada transaksi yang salah akun atau ada stock entry yang tidak submit.",
			},
			{
				step: "Handle price fluctuation dengan benar",
				detail:
					"Harga material konstruksi sering berubah. Saat harga naik, HPP material yang dipakai berubah sesuai FIFO. PM perlu aware bahwa biaya aktual proyek bisa berbeda dari estimasi RAB jika harga material berubah signifikan.",
			},
		],
		config: [
			{
				field: "Valuation Method",
				value:
					"FIFO untuk kontraktor — Moving Average bisa dipakai jika harga relatif stabil tapi kurang akurat untuk analisis per-lot",
			},
			{
				field: "Auto Inventory Accounting",
				value:
					"Aktifkan di Accounting Settings. Setiap Stock Entry otomatis buat Journal Entry — tidak perlu input manual ke accounting",
			},
			{
				field: "Stock In Transit Account",
				value:
					"Buat akun khusus untuk material yang sudah di-PO dan di-GRN tapi belum di-invoice: memisahkan hutang yang pasti dari yang belum",
			},
		],
		warning: null,
	},
	{
		id: "reorder",
		icon: "🔔",
		label: "Reorder Level & Auto Replenishment",
		color: "#ec4899",
		short: "Alert stok menipis & reorder otomatis",
		desc: "ERPNext bisa otomatis alert atau bahkan membuat MR otomatis ketika stok material di gudang site mencapai reorder level. Untuk kontraktor, ini mencegah work stoppage akibat material habis tiba-tiba.",
		howto: [
			{
				step: "Set Reorder Level per item per warehouse",
				detail:
					"Item Master → tab Inventory → Item Reorder Table. Tambahkan baris: Warehouse (site proyek), Warehouse Reorder Level (qty minimum), Warehouse Reorder Qty (berapa qty yang dipesan saat mencapai level ini), Material Request Type.",
			},
			{
				step: "Jalankan Reorder Report secara berkala",
				detail:
					"Stock → Reports → Itemwise Recommended Reorder Level. Tampilkan semua item yang stoknya sudah di bawah atau mendekati reorder level. Procurement wajib cek ini setiap hari.",
			},
			{
				step: "Setup Auto Material Request (opsional)",
				detail:
					"Aktifkan 'Auto Create Material Request' di Stock Settings. Saat stok item mencapai reorder level, sistem otomatis buat MR draft yang tinggal di-review dan submit oleh Logistik.",
			},
			{
				step: "Kalibrasi reorder level sesuai jadwal proyek",
				detail:
					"Reorder level bukan angka tetap — sesuaikan dengan schedule konstruksi. Jika minggu depan ada pekerjaan besar (cor lantai), naikkan reorder level besi dan semen minggu ini.",
			},
		],
		config: [
			{
				field: "Reorder Level per Site",
				value:
					"Set reorder level berbeda untuk setiap site warehouse sesuai kecepatan konsumsi material di proyek tersebut",
			},
			{
				field: "Lead Time Days",
				value:
					"Isi rata-rata lead time pengiriman supplier di Item Master — sistem gunakan ini untuk kalkulasi kapan harus order agar material sampai tepat waktu",
			},
		],
		warning:
			"Reorder level yang terlalu rendah akan menyebabkan material habis sebelum PO sempat diproses. Rumusnya: Reorder Level = (Rata-rata konsumsi harian × Lead Time hari) + Safety Stock.",
	},
	{
		id: "transfer",
		icon: "🚚",
		label: "Inter-Warehouse Transfer",
		color: "#06b6d4",
		short: "Transfer material antar gudang & proyek",
		desc: "Transfer material antar warehouse adalah transaksi yang sangat sering di kontraktor — material dari gudang pusat ke site, material sisa dari site ke gudang pusat, atau material pinjaman dari satu site ke site lain. ERPNext mencatat semua ini dengan lengkap.",
		howto: [
			{
				step: "Transfer rutin Gudang Pusat → Site",
				detail:
					"Setiap pengiriman material dari gudang pusat ke site: Stock Entry type Material Transfer. Source: Gudang Pusat, Target: Site Proyek. Submit → stok pindah, biaya belum terjadi (masih jadi aset inventory di site).",
			},
			{
				step: "Biaya terjadi saat Material Issue di site",
				detail:
					"Material baru dianggap 'dipakai' (jadi biaya proyek) ketika Stock Entry type Material Issue dibuat dari site warehouse. Sebelum itu, material masih jadi aset di balance sheet proyek.",
			},
			{
				step: "Transfer material antar proyek (pinjaman)",
				detail:
					"Proyek B butuh material yang ada di Proyek A: buat dua Stock Entry — Issue dari Site A, Receipt ke Site B. Catat di kedua project untuk reconciliation biaya di akhir.",
			},
			{
				step: "Return material ke gudang pusat",
				detail:
					"Material sisa di akhir proyek dikembalikan ke gudang pusat: Stock Entry Material Transfer, Source: Site Proyek, Target: Gudang Pusat. Biaya proyek berkurang, stok gudang pusat bertambah.",
			},
		],
		config: [
			{
				field: "Purpose of Transfer",
				value:
					"Selalu isi remarks/purpose di setiap Stock Entry Transfer: 'Pengiriman ke Site Bulan April' atau 'Return sisa material proyek selesai'",
			},
			{
				field: "Two-Step Transfer",
				value:
					"Aktifkan Two-Step Transfer di Stock Settings untuk pengiriman jarak jauh: pertama buat dokumen pengiriman (transit), lalu konfirmasi penerimaan di tujuan",
			},
		],
		warning: null,
	},
	{
		id: "stockcount",
		icon: "📋",
		label: "Stock Opname & Reconciliation",
		color: "#84cc16",
		short: "Audit fisik gudang & penyesuaian sistem",
		desc: "Stock opname (physical inventory count) adalah proses menghitung fisik stok di gudang dan membandingkan dengan data sistem. Untuk kontraktor, opname gudang harus dilakukan minimal sebulan sekali di setiap site agar biaya material proyek akurat.",
		howto: [
			{
				step: "Download Opname Sheet dari sistem",
				detail:
					"Stock → Stock Reconciliation → Download. Sistem generate sheet berisi semua item per warehouse dengan qty di sistem. Tim lapangan isi qty aktual di kolom sebelah.",
			},
			{
				step: "Lakukan penghitungan fisik di gudang site",
				detail:
					"Tim terdiri dari 2 orang (1 hitung, 1 catat) — jangan dilakukan oleh yang sama yang sehari-hari pegang gudang. Hitung semua item satu per satu, catat di opname sheet.",
			},
			{
				step: "Input hasil penghitungan ke sistem",
				detail:
					"Stock → Stock Reconciliation → New. Pilih Warehouse, set tanggal opname. Upload atau input qty aktual per item. Sistem otomatis hitung selisih (gain = stok lebih dari sistem, loss = stok kurang dari sistem).",
			},
			{
				step: "Analisis selisih sebelum submit",
				detail:
					"Review semua selisih sebelum submit. Selisih kecil (0-2%) mungkin wajar karena susut material. Selisih besar perlu investigasi: ada Stock Entry yang belum diinput? Ada material hilang? Ada pencurian?",
			},
			{
				step: "Submit dan catat ke akun yang tepat",
				detail:
					"Setelah diverifikasi, Submit Reconciliation. Gain/Loss otomatis masuk ke akun 'Selisih Persediaan' di P&L. PM harus tanda tangan opname sheet sebagai accountability.",
			},
		],
		config: [
			{
				field: "Frequency",
				value:
					"Gudang Pusat: opname bulanan | Site Proyek: opname mingguan untuk material high-value (besi, kabel) | Semua material: opname akhir proyek",
			},
			{
				field: "Difference Account",
				value:
					"Set akun khusus untuk selisih opname: 'Selisih Persediaan Material' agar mudah dimonitor nilainya per periode",
			},
		],
		warning:
			"Opname yang dilakukan oleh orang yang sama yang pegang stok sehari-hari tidak akan efektif — ada conflict of interest. Gunakan tim independen atau rotasi personil untuk opname.",
	},
];

const FLOW = [
	{
		no: "01",
		event: "Material tiba dari supplier (GRN/PO)",
		action: "Purchase Receipt → stok masuk ke Gudang Pusat atau Site",
		type: "IN",
		color: "#22d3ee",
	},
	{
		no: "02",
		event: "Transfer ke Site Proyek",
		action: "Stock Entry: Material Transfer → stok pindah ke Site Warehouse",
		type: "MOVE",
		color: "#06b6d4",
	},
	{
		no: "03",
		event: "Material dipakai di lapangan",
		action:
			"Stock Entry: Material Issue → stok berkurang, biaya masuk ke Project",
		type: "OUT",
		color: "#34d399",
	},
	{
		no: "04",
		event: "Sisa material dikembalikan",
		action: "Stock Entry: Material Transfer → stok kembali ke Gudang Pusat",
		type: "MOVE",
		color: "#06b6d4",
	},
	{
		no: "05",
		event: "Material rusak / tidak sesuai spesifikasi",
		action:
			"Stock Entry: Transfer ke Rejected Store → proses return ke supplier",
		type: "REJECT",
		color: "#f97316",
	},
	{
		no: "06",
		event: "Material hilang / kadaluarsa",
		action: "Stock Entry: Material Issue ke Scrap → catat sebagai loss di P&L",
		type: "LOSS",
		color: "#ef4444",
	},
	{
		no: "07",
		event: "Stock opname fisik bulanan",
		action:
			"Stock Reconciliation → sesuaikan sistem dengan kondisi fisik aktual",
		type: "RECON",
		color: "#84cc16",
	},
	{
		no: "08",
		event: "Stok mencapai reorder level",
		action: "Auto alert / auto Material Request → Procurement proses PO",
		type: "ALERT",
		color: "#ec4899",
	},
];

const REPORTS = [
	{
		name: "Stock Balance",
		path: "Stock → Reports → Stock Balance",
		color: "#22d3ee",
		freq: "Harian",
		use: "Tampilkan saldo stok per item per warehouse pada tanggal tertentu. Filter per site proyek untuk lihat berapa stok material yang tersedia di lapangan.",
		benefit:
			"PM dan logistik site tahu persis berapa material tersisa setiap hari — dasar keputusan apakah perlu request material baru.",
	},
	{
		name: "Stock Ledger",
		path: "Stock → Reports → Stock Ledger",
		color: "#34d399",
		freq: "Mingguan",
		use: "Tampilkan semua transaksi pergerakan stok per item dengan saldo berjalan. Lihat setiap pemasukan, pengeluaran, transfer dengan tanggal, dokumen referensi, dan saldo setelah transaksi.",
		benefit:
			"Audit trail lengkap — bisa trace dari mana material datang dan ke mana perginya. Sangat berguna saat investigasi selisih stok.",
	},
	{
		name: "Itemwise Recommended Reorder Level",
		path: "Stock → Reports → Itemwise Recommended Reorder Level",
		color: "#ec4899",
		freq: "Harian",
		use: "Tampilkan semua item yang sudah di bawah atau mendekati reorder level. Alert procurement untuk segera buat MR/PO sebelum material habis di site.",
		benefit:
			"Mencegah work stoppage akibat material habis mendadak — salah satu penyebab terbesar keterlambatan proyek konstruksi.",
	},
	{
		name: "Stock Ageing",
		path: "Stock → Reports → Stock Ageing",
		color: "#fbbf24",
		freq: "Bulanan",
		use: "Tampilkan berapa lama material sudah tersimpan di gudang: 0-30 hari, 31-60 hari, 61-90 hari, >90 hari. Identifikasi material yang terlalu lama di gudang (slow-moving).",
		benefit:
			"Deteksi material yang dibeli berlebihan atau tidak terpakai — biaya modal yang terlock di inventory. Dasar keputusan untuk return ke supplier atau realokasi ke proyek lain.",
	},
	{
		name: "Warehouse-wise Stock Value",
		path: "Stock → Reports → Warehouse-wise Stock Value",
		color: "#f97316",
		freq: "Bulanan",
		use: "Nilai total inventori per warehouse (per site proyek). Tampilkan berapa nilai material yang ada di Gudang Pusat, Site A, Site B, dll.",
		benefit:
			"Finance dan PM bisa tahu berapa 'uang' yang tersimpan dalam bentuk material di setiap proyek — input penting untuk analisis working capital.",
	},
	{
		name: "Stock Summary",
		path: "Stock → Reports → Stock Summary",
		color: "#a78bfa",
		freq: "Mingguan",
		use: "Ringkasan stok semua item di semua warehouse dalam satu tampilan. Bisa filter per Item Group untuk fokus pada material tertentu.",
		benefit:
			"Overview cepat kondisi inventory seluruh perusahaan — Direktur atau Manajer Logistik bisa monitor semua gudang sekaligus.",
	},
	{
		name: "Material Consumption",
		path: "Stock → Reports → Material Consumption for Manufacture (kustomisasi ke construction)",
		color: "#06b6d4",
		freq: "Mingguan",
		use: "Rekap pemakaian material per proyek dalam periode tertentu. Bandingkan dengan rencana konsumsi dari RAB — apakah konsumsi aktual sesuai dengan progress pekerjaan?",
		benefit:
			"Deteksi pemborosan material atau pemakaian tidak efisien di lapangan. Pemakaian aktual yang jauh lebih besar dari rencana RAB = ada masalah di lapangan.",
	},
	{
		name: "Stock Reconciliation Report",
		path: "Stock → Reports → Stock Reconciliation",
		color: "#84cc16",
		freq: "Per Opname",
		use: "Rekap hasil stock opname: selisih antara qty sistem vs qty fisik per item. Tampilkan nilai selisih dalam rupiah.",
		benefit:
			"Accountability laporan ke manajemen atas kondisi inventory — bukti bahwa pengelolaan material di site sudah diaudit dan sesuai.",
	},
	{
		name: "Batch-wise Balance History",
		path: "Stock → Reports → Batch-wise Balance History",
		color: "#fbbf24",
		freq: "Per Kebutuhan",
		use: "Track stok per batch number — berapa sisa dari setiap lot pengiriman material. Kritis untuk material dengan batch traceability (besi beton per mill cert, beton per truck).",
		benefit:
			"Jika ada klaim kualitas dari owner, bisa trace persis batch mana yang dipakai di bagian pekerjaan mana — dasar defensi teknis dan hukum.",
	},
	{
		name: "Dead Stock Report",
		path: "Stock → Reports → Dead Stock (kustom dari Stock Ageing)",
		color: "#ef4444",
		freq: "Bulanan",
		use: "Material yang tidak bergerak selama >60 hari di gudang. Identifikasi material 'stuck' yang membebani working capital.",
		benefit:
			"Keputusan: material stuck → realokasi ke proyek lain, jual, atau return ke supplier sebelum kadaluarsa. Setiap hari material mengendap = biaya modal yang terbuang.",
	},
];

const SETUP_STEPS = [
	{
		no: 1,
		title: "Rancang Struktur Warehouse Sebelum Go-Live",
		color: "#22d3ee",
		desc: "Rancang di atas kertas dulu sebelum input ke sistem. Struktur yang salah sulit diubah setelah ada transaksi.",
		steps: [
			"List semua lokasi fisik: Gudang Pusat (kantor), Site Proyek yang sedang berjalan, gudang transit jika ada",
			"Buat hierarki: All Warehouses → [Nama Perusahaan] → Gudang Pusat → Site Proyek A / B / C",
			"Tambahkan: Rejected Store, Scrap Store (untuk semua proyek, bukan per proyek)",
			"Buat di ERPNext: Stock → Warehouse → New untuk setiap lokasi",
			"Set Account (Inventory Account) untuk setiap warehouse group — konsultasi dengan akuntan",
			"Assign Cost Center ke setiap site warehouse",
		],
	},
	{
		no: 2,
		title: "Build Item Master yang Komprehensif",
		color: "#a78bfa",
		desc: "Ini pekerjaan terbesar dalam setup — luangkan minimal 2 minggu. Kualitas item master menentukan kualitas semua laporan inventory.",
		steps: [
			"Export data item dari sistem lama atau spreadsheet existing",
			"Standarisasi: kode item, nama, UOM, kategori — hilangkan duplikasi",
			"Buat Item Groups sesuai kategorisasi material konstruksi perusahaan",
			"Import item via Data Import Tool ERPNext (gunakan template yang disediakan)",
			"Set reorder level dan safety stock untuk material kritis per site warehouse",
			"Aktifkan Serial No untuk alat dan equipment, Batch untuk material berlot",
			"Set Quality Inspection Required untuk material yang butuh QC",
		],
	},
	{
		no: 3,
		title: "Setup UOM Conversion",
		color: "#34d399",
		desc: "Material sering dibeli dalam satu satuan tapi dipakai dalam satuan lain. UOM Conversion menghindari confusion.",
		steps: [
			"Stock → UOM Conversion → tambahkan konversi yang dibutuhkan",
			"Contoh: 1 ton = 25 zak semen | 1 m³ pasir = ±1.6 ton | 1 roll kabel = 100 m",
			"Set di Item Master: Purchase UOM (satuan beli dari supplier) dan Stock UOM (satuan simpan di gudang)",
			"Test konversi dengan transaksi dummy sebelum go-live",
		],
	},
	{
		no: 4,
		title: "Konfigurasi Stock Settings",
		color: "#fbbf24",
		desc: "Konfigurasi global yang mempengaruhi semua transaksi inventory.",
		steps: [
			"Stock → Stock Settings → buka konfigurasi",
			"Valuation Method: FIFO",
			"Allow Negative Stock: NO (sangat penting!)",
			"Auto Insert Price List Rate if Missing: Yes",
			"Show Barcode Field: Yes (untuk scanning di gudang)",
			"Percentage you can Receive / Deliver more against PO: set 0% untuk kontrol ketat",
			"Aktifkan Quality Inspection jika diperlukan",
		],
	},
	{
		no: 5,
		title: "Opening Stock Entry (Migrasi Stok Awal)",
		color: "#fb923c",
		desc: "Jika go-live di tengah proyek berjalan, stok yang sudah ada di gudang harus diinput ke sistem.",
		steps: [
			"Lakukan stock opname fisik di semua gudang sebelum go-live",
			"Stock → Stock Reconciliation → New",
			"Pilih Purpose: Opening Stock",
			"Input qty aktual per item per warehouse dari hasil opname",
			"Set valuation rate berdasarkan harga beli terakhir",
			"Submit → stok awal tercatat di sistem",
			"Verifikasi: nilai total stok di sistem = nilai yang akan masuk ke Opening Balance Sheet",
		],
	},
	{
		no: 6,
		title: "Setup SOP dan Training Tim Gudang",
		color: "#84cc16",
		desc: "Sistem terbaik tidak berguna tanpa SDM yang paham cara penggunaannya. SOP tertulis adalah mandatory.",
		steps: [
			"Tulis SOP: cara buat Stock Entry penerimaan, transfer, issue, return",
			"SOP: kapan Batch/Serial Number harus diisi (jangan skip)",
			"SOP: kapan opname dilakukan dan siapa yang bertanggung jawab",
			"Training minimal 4 jam untuk semua tim logistik site",
			"Buat user permission: petugas gudang hanya bisa akses warehouse-nya sendiri",
			"Designate satu PIC per site untuk review semua Stock Entry setiap hari",
		],
	},
];

const CONTRACTOR_SCENARIOS = [
	{
		scenario: "Proyek Baru Dimulai",
		color: "#22d3ee",
		steps: [
			"Buat Warehouse baru: 'Site - Proyek [Nama]'",
			"Link ke Cost Center proyek",
			"Set reorder level untuk material yang akan dipakai sesuai jadwal konstruksi",
			"Transfer modal awal material dari gudang pusat ke site (jika ada)",
			"Briefing tim logistik site tentang SOP input Stock Entry harian",
		],
	},
	{
		scenario: "Pengiriman Material ke Site",
		color: "#34d399",
		steps: [
			"Supplier kirim material + DO ke site",
			"Logistik site buat Purchase Receipt dari PO yang sesuai",
			"Input qty aktual yang diterima (tidak harus sama dengan PO jika pengiriman parsial)",
			"QC Inspector verifikasi material — jika ada yang reject, catat di Rejected Qty",
			"Submit GRN → stok masuk ke Site Warehouse",
			"Jika ada biaya angkut, buat Landed Cost Voucher",
		],
	},
	{
		scenario: "Pemakaian Material di Lapangan",
		color: "#fbbf24",
		steps: [
			"Pelaksana/mandor request material ke logistik site",
			"Logistik cek stok di sistem sebelum keluarkan material",
			"Buat Stock Entry type Material Issue",
			"Isi: item, qty, source warehouse (site), Project (WAJIB)",
			"Submit → stok berkurang, biaya masuk ke project costing",
			"Cetak bon pengeluaran material sebagai bukti fisik",
		],
	},
	{
		scenario: "Akhir Proyek — Closing Inventory",
		color: "#a78bfa",
		steps: [
			"Lakukan stock opname fisik di site sebelum demobilisasi",
			"Stock Reconciliation untuk sesuaikan sistem dengan kondisi aktual",
			"Material bisa dipakai: Transfer ke Gudang Pusat atau proyek lain",
			"Material rusak / tidak layak: Issue ke Scrap Warehouse, catat sebagai biaya proyek",
			"Pastikan semua Stock Entry sudah Submit — tidak ada yang masih draft",
			"Final Stock Balance untuk site harus = 0 setelah semua ditransfer/write-off",
			"Tutup warehouse site dengan set Is Active = No",
		],
	},
];

const Tag = ({ color, children, sm }) => (
	<span
		style={{
			background: color + "18",
			color,
			border: `1px solid ${color}38`,
			borderRadius: 4,
			padding: sm ? "1px 5px" : "2px 8px",
			fontSize: sm ? "0.6rem" : "0.67rem",
			fontFamily: MONO,
			fontWeight: 700,
			whiteSpace: "nowrap",
		}}>
		{children}
	</span>
);

const SecHead = ({ children }) => (
	<div
		style={{
			fontFamily: MONO,
			fontSize: "0.57rem",
			color: "#ffffffff",
			letterSpacing: 4,
			textTransform: "uppercase",
			marginBottom: "0.9rem",
		}}>
		{children}
	</div>
);

const TYPE_COLORS = {
	IN: "#22d3ee",
	MOVE: "#06b6d4",
	OUT: "#34d399",
	REJECT: "#f97316",
	LOSS: "#ef4444",
	RECON: "#84cc16",
	ALERT: "#ec4899",
};

export default function BarangdanGudang() {
	const [tab, setTab] = useState("flow");
	const [activeModule, setActiveModule] = useState(0);
	const [activeSetup, setActiveSetup] = useState(null);
	const [activeScenario, setActiveScenario] = useState(null);

	const mod = MODULES[activeModule];

	return (
		<div
			style={{
				background: "#050e09",
				minHeight: "100vh",
				color: "#b8d4c0",
				fontFamily: SERIF,
			}}>
			{/* HEADER */}
			<div
				style={{
					background: "linear-gradient(160deg, #091810 0%, #050e09 100%)",
					borderBottom: "1px solid #0d2416",
					padding: "2rem 1.5rem 1.6rem",
					position: "relative",
					overflow: "hidden",
				}}>
				<div
					style={{
						position: "absolute",
						top: -50,
						right: -50,
						width: 300,
						height: 300,
						borderRadius: "50%",
						background:
							"radial-gradient(circle, #22d3ee10 0%, transparent 70%)",
						pointerEvents: "none",
					}}
				/>
				<div style={{ maxWidth: 1080, margin: "0 auto" }}>
					<div
						style={{
							fontFamily: MONO,
							fontSize: "0.57rem",
							color: "#ffffffff",
							letterSpacing: 6,
							marginBottom: 8,
						}}>
						BUILT-IN FEATURE #3 — DEEP DIVE
					</div>
					<h1
						style={{
							margin: 0,
							fontSize: "clamp(1.4rem, 3vw, 2rem)",
							fontWeight: 700,
							color: "#e4f5ea",
							lineHeight: 1.2,
						}}>
						ERPNext Inventory & Warehouse
					</h1>
					<p
						style={{
							color: "#ffffffff",
							margin: "0.6rem 0 0",
							fontSize: "0.84rem",
							fontFamily: SERIF,
						}}>
						Warehouse Setup · Item Master · Stock Entry · Serial/Batch ·
						Valuation · Reorder · Opname
					</p>
				</div>
			</div>

			{/* NAV */}
			<div
				style={{
					borderBottom: "1px solid #0d2416",
					background: "#050e09",
					position: "sticky",
					top: 0,
					zIndex: 100,
				}}>
				<div
					style={{
						maxWidth: 1080,
						margin: "0 auto",
						padding: "0 1.5rem",
						display: "flex",
						overflowX: "auto",
					}}>
					{[
						{ key: "flow", label: "🔄 Alur Pergerakan Stok" },
						{ key: "modules", label: "🧩 Fitur & Cara Kerja" },
						{ key: "setup", label: "⚙️ Setup Step-by-Step" },
						{ key: "reports", label: "📊 Reports Penting" },
						{ key: "scenarios", label: "🏗️ Skenario Kontraktor" },
					].map((n) => (
						<button
							key={n.key}
							onClick={() => setTab(n.key)}
							style={{
								padding: "0.85rem 1rem",
								background: "none",
								border: "none",
								borderBottom:
									tab === n.key ? "2px solid #22d3ee" : "2px solid transparent",
								color: tab === n.key ? "#22d3ee" : "#eeeeeeff",
								fontFamily: SERIF,
								fontSize: "0.8rem",
								fontWeight: 600,
								cursor: "pointer",
								whiteSpace: "nowrap",
								transition: "color 0.2s",
							}}>
							{n.label}
						</button>
					))}
				</div>
			</div>

			<div style={{ maxWidth: 1080, margin: "0 auto", padding: "1.5rem" }}>
				{/* FLOW */}
				{tab === "flow" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						<div
							style={{
								background: "#091810",
								border: "1px solid #0d2416",
								borderRadius: 10,
								padding: "1rem 1.2rem",
							}}>
							<SecHead>
								🔄 Siklus Lengkap Pergerakan Material di Proyek Konstruksi
							</SecHead>
							<p style={{ color: "#ffffffff", fontSize: "0.81rem", margin: 0 }}>
								Dari material datang dari supplier sampai material habis dipakai
								di lapangan — setiap pergerakan tercatat di sistem dengan
								dokumen yang bisa di-audit.
							</p>
						</div>
						{FLOW.map((f, i) => (
							<div
								key={i}
								style={{
									display: "grid",
									gridTemplateColumns: "36px 1fr 1fr auto",
									gap: 12,
									padding: "0.75rem 1rem",
									background: "#091810",
									borderRadius: 9,
									borderLeft: `3px solid ${f.color}`,
									alignItems: "center",
								}}>
								<div
									style={{
										width: 28,
										height: 28,
										borderRadius: "50%",
										background: f.color + "18",
										border: `1.5px solid ${f.color}50`,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontFamily: MONO,
										fontSize: "0.62rem",
										color: f.color,
									}}>
									{f.no}
								</div>
								<div
									style={{
										color: "#f4fff6ff",
										fontSize: "0.82rem",
										fontWeight: 600,
									}}>
									{f.event}
								</div>
								<div
									style={{
										color: "#cbe0d7ff",
										fontSize: "0.78rem",
										lineHeight: 1.5,
									}}>
									{f.action}
								</div>
								<Tag color={f.color} sm>
									{f.type}
								</Tag>
							</div>
						))}

						{/* Warehouse flow visual */}
						<div
							style={{
								background: "#091810",
								border: "1px solid #0d2416",
								borderRadius: 12,
								padding: "1.2rem",
								marginTop: 4,
							}}>
							<SecHead>🏭 Hierarki Warehouse untuk Kontraktor</SecHead>
							<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
								{[
									{
										name: "Gudang Pusat",
										sub: "Buffer & distribusi ke site",
										color: "#22d3ee",
										children: [
											"Site Proyek A",
											"Site Proyek B",
											"Site Proyek C",
										],
									},
									{
										name: "Rejected Store",
										sub: "Material gagal QC",
										color: "#f97316",
										children: [],
									},
									{
										name: "Scrap Store",
										sub: "Material rusak / sisa",
										color: "#ef4444",
										children: [],
									},
								].map((w, i) => (
									<div
										key={i}
										style={{
											background: "#050e09",
											borderRadius: 10,
											padding: "0.9rem 1rem",
											borderTop: `3px solid ${w.color}`,
											minWidth: 200,
										}}>
										<div
											style={{
												color: w.color,
												fontWeight: 700,
												fontSize: "0.82rem",
												marginBottom: 4,
											}}>
											{w.name}
										</div>
										<div
											style={{
												color: "#ffffffff",
												fontSize: "0.72rem",
												marginBottom: w.children.length ? 8 : 0,
											}}>
											{w.sub}
										</div>
										{w.children.map((c, j) => (
											<div
												key={j}
												style={{
													fontFamily: MONO,
													fontSize: "0.67rem",
													color: "#f9f9f9ff",
													padding: "2px 0 2px 10px",
													borderLeft: `1px solid ${w.color}40`,
												}}>
												↳ {c}
											</div>
										))}
									</div>
								))}
							</div>
							<div
								style={{
									marginTop: 10,
									background: "#050e09",
									borderRadius: 8,
									padding: "0.75rem 1rem",
									fontFamily: MONO,
									fontSize: "0.7rem",
									color: "#ffffffff",
									lineHeight: 1.9,
								}}>
								<span style={{ color: "#22d3ee" }}>Pembelian (GRN)</span> →
								Gudang Pusat/Site{"  "}|{"  "}
								<span style={{ color: "#06b6d4" }}>Transfer</span> → antar
								warehouse{"  "}|{"  "}
								<span style={{ color: "#34d399" }}>Material Issue</span> → biaya
								masuk proyek{"  "}|{"  "}
								<span style={{ color: "#84cc16" }}>Opname</span> → reconcile
								fisik vs sistem
							</div>
						</div>
					</div>
				)}

				{/* MODULES */}
				{tab === "modules" && (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "220px 1fr",
							gap: 14,
						}}>
						<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
							{MODULES.map((m, i) => (
								<button
									key={i}
									onClick={() => setActiveModule(i)}
									style={{
										textAlign: "left",
										padding: "0.58rem 0.78rem",
										background: activeModule === i ? m.color + "12" : "#091810",
										border: `1px solid ${activeModule === i ? m.color + "55" : "#0d2416"}`,
										borderRadius: 8,
										cursor: "pointer",
										transition: "all 0.15s",
									}}>
									<div
										style={{ display: "flex", gap: 7, alignItems: "center" }}>
										<span style={{ fontSize: 15 }}>{m.icon}</span>
										<div>
											<div
												style={{
													color: activeModule === i ? "#e4f5ea" : "#f8f8f8ff",
													fontSize: "0.74rem",
													fontWeight: 700,
												}}>
												{m.label}
											</div>
											<div
												style={{
													fontFamily: SERIF,
													fontSize: "0.55rem",
													color: activeModule === i ? m.color : "#ffffffff",
													lineHeight: 1.4,
												}}>
												{m.short}
											</div>
										</div>
									</div>
								</button>
							))}
						</div>
						<div
							style={{
								background: "#091810",
								border: `1px solid ${mod.color}25`,
								borderRadius: 12,
								padding: "1.4rem",
								borderTop: `3px solid ${mod.color}`,
							}}>
							<div
								style={{
									display: "flex",
									gap: 10,
									alignItems: "center",
									marginBottom: "0.8rem",
								}}>
								<span style={{ fontSize: 22 }}>{mod.icon}</span>
								<div>
									<div
										style={{
											fontFamily: MONO,
											fontSize: "0.57rem",
											color: mod.color,
											letterSpacing: 3,
										}}>
										FITUR BAWAAN ERPNEXT
									</div>
									<h2
										style={{
											margin: 0,
											color: "#ffffffff",
											fontSize: "1.02rem",
											fontWeight: 700,
										}}>
										{mod.label}
									</h2>
								</div>
							</div>
							<p
								style={{
									color: "#daf0e7ff",
									fontSize: "0.83rem",
									lineHeight: 1.75,
									margin: "0 0 1.1rem",
									borderLeft: `3px solid ${mod.color}30`,
									paddingLeft: "0.85rem",
								}}>
								{mod.desc}
							</p>
							<SecHead>🛠 Cara Penggunaan untuk Kontraktor</SecHead>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 6,
									marginBottom: "1.1rem",
								}}>
								{mod.howto.map((h, i) => (
									<div
										key={i}
										style={{
											display: "grid",
											gridTemplateColumns: "26px 1fr",
											gap: 9,
											padding: "0.58rem 0.78rem",
											background: "#050e09",
											borderRadius: 7,
											borderLeft: `2px solid ${mod.color}38`,
										}}>
										<div
											style={{
												width: 21,
												height: 21,
												borderRadius: "50%",
												background: mod.color + "18",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontFamily: MONO,
												fontSize: "0.6rem",
												color: mod.color,
												flexShrink: 0,
												marginTop: 1,
											}}>
											{i + 1}
										</div>
										<div>
											<div
												style={{
													color: "#e4f5ea",
													fontSize: "0.8rem",
													fontWeight: 700,
													marginBottom: 2,
												}}>
												{h.step}
											</div>
											<div
												style={{
													color: "#ffffffff",
													fontSize: "0.76rem",
													lineHeight: 1.65,
												}}>
												{h.detail}
											</div>
										</div>
									</div>
								))}
							</div>
							<SecHead>⚙️ Konfigurasi Penting</SecHead>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 5,
									marginBottom: mod.warning ? "1rem" : 0,
								}}>
								{mod.config.map((c, i) => (
									<div
										key={i}
										style={{
											display: "grid",
											gridTemplateColumns: "160px 1fr",
											gap: 9,
											padding: "0.45rem 0.78rem",
											background: "#050e09",
											borderRadius: 6,
										}}>
										<div
											style={{
												fontFamily: MONO,
												fontSize: "0.66rem",
												color: mod.color,
												paddingTop: 1,
											}}>
											{c.field}
										</div>
										<div
											style={{
												color: "#f9fbfaff",
												fontSize: "0.74rem",
												lineHeight: 1.55,
											}}>
											{c.value || c.detail}
										</div>
									</div>
								))}
							</div>
							{mod.warning && (
								<div
									style={{
										background: "#f59e0b0c",
										border: "1px solid #f59e0b25",
										borderRadius: 8,
										padding: "0.65rem 0.85rem",
										display: "flex",
										gap: 8,
									}}>
									<span>⚠️</span>
									<span
										style={{
											color: "#fcd34d",
											fontSize: "0.77rem",
											lineHeight: 1.6,
										}}>
										{mod.warning}
									</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* SETUP */}
				{tab === "setup" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
						<div
							style={{
								background: "#091810",
								border: "1px solid #0d2416",
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
							}}>
							<SecHead>
								⚙️ Setup Inventory & Warehouse — Urutan Wajib Sebelum Go-Live
							</SecHead>
							<p style={{ color: "#ffffffff", fontSize: "0.8rem", margin: 0 }}>
								Setup inventory yang benar membutuhkan persiapan serius.
								Estimasi waktu: 3-4 minggu untuk perusahaan kontraktor dengan
								5-10 proyek aktif dan 500+ jenis material.
							</p>
						</div>
						{SETUP_STEPS.map((s, i) => (
							<div
								key={i}
								style={{
									background: "#091810",
									border: `1px solid ${activeSetup === i ? s.color + "50" : "#0d2416"}`,
									borderRadius: 10,
									overflow: "hidden",
									transition: "border-color 0.2s",
								}}>
								<button
									onClick={() => setActiveSetup(activeSetup === i ? null : i)}
									style={{
										width: "100%",
										background: "none",
										border: "none",
										padding: "0.85rem 1rem",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										gap: 12,
										textAlign: "left",
									}}>
									<div
										style={{
											width: 30,
											height: 30,
											borderRadius: "50%",
											background: s.color + "18",
											border: `2px solid ${s.color}40`,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
										}}>
										<span
											style={{
												fontFamily: MONO,
												fontSize: "0.75rem",
												color: s.color,
												fontWeight: 700,
											}}>
											{String(s.no).padStart(2, "0")}
										</span>
									</div>
									<div style={{ flex: 1 }}>
										<div
											style={{
												color: "#e4f5ea",
												fontWeight: 700,
												fontSize: "0.86rem",
											}}>
											{s.title}
										</div>
										<div
											style={{
												color: "#c8d5cdff",
												fontSize: "0.73rem",
												marginTop: 2,
											}}>
											{s.desc}
										</div>
									</div>
									<span
										style={{
											color: s.color,
											fontSize: "1.1rem",
											transform: activeSetup === i ? "rotate(90deg)" : "none",
											transition: "transform 0.2s",
											display: "inline-block",
										}}>
										›
									</span>
								</button>
								{activeSetup === i && (
									<div
										style={{
											borderTop: "1px solid #0d2416",
											padding: "0.7rem 1rem 1rem",
										}}>
										{s.steps.map((st, j) => (
											<div
												key={j}
												style={{
													display: "flex",
													gap: 9,
													padding: "0.48rem 0.72rem",
													background: "#050e09",
													borderRadius: 6,
													borderLeft: `2px solid ${s.color}35`,
													marginBottom: 5,
												}}>
												<span
													style={{
														color: s.color,
														fontFamily: MONO,
														fontSize: "0.6rem",
														minWidth: 18,
														paddingTop: 2,
													}}>
													{String(j + 1).padStart(2, "0")}
												</span>
												<span
													style={{
														color: "#c0e1d3ff",
														fontSize: "0.78rem",
														lineHeight: 1.6,
													}}>
													{st}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				)}

				{/* REPORTS */}
				{tab === "reports" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						<div
							style={{
								background: "#091810",
								border: "1px solid #0d2416",
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
							}}>
							<SecHead>
								📊 10 Report Inventory yang Wajib Dimonitor Kontraktor
							</SecHead>
							<p style={{ color: "#ffffffff", fontSize: "0.8rem", margin: 0 }}>
								Laporan-laporan ini memberikan visibilitas penuh atas kondisi
								material — dari stok harian di site sampai nilai inventory di
								balance sheet.
							</p>
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
								gap: 10,
							}}>
							{REPORTS.map((r, i) => (
								<div
									key={i}
									style={{
										background: "#091810",
										border: `1px solid ${r.color}20`,
										borderRadius: 10,
										padding: "1rem 1.1rem",
										borderLeft: `4px solid ${r.color}`,
									}}>
									<div
										style={{
											display: "flex",
											gap: 6,
											alignItems: "center",
											marginBottom: 5,
											flexWrap: "wrap",
										}}>
										<span
											style={{
												color: r.color,
												fontWeight: 700,
												fontSize: "0.84rem",
											}}>
											{r.name}
										</span>
										<Tag color={r.color} sm>
											{r.freq}
										</Tag>
									</div>
									<div
										style={{
											fontFamily: MONO,
											fontSize: "0.59rem",
											color: "#ffffffff",
											background: "#050e09",
											padding: "2px 7px",
											borderRadius: 4,
											display: "inline-block",
											marginBottom: 6,
										}}>
										{r.path}
									</div>
									<p
										style={{
											color: "#dfebe6ff",
											fontSize: "0.75rem",
											lineHeight: 1.6,
											margin: "0 0 6px",
										}}>
										{r.use}
									</p>
									<div
										style={{
											display: "flex",
											gap: 6,
											alignItems: "flex-start",
										}}>
										<span
											style={{
												color: r.color,
												fontSize: "0.72rem",
												flexShrink: 0,
											}}>
											💡
										</span>
										<span
											style={{
												color: "#f2fbf5ff",
												fontSize: "0.71rem",
												lineHeight: 1.55,
											}}>
											{r.benefit}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* SCENARIOS */}
				{tab === "scenarios" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						<div
							style={{
								background: "#091810",
								border: "1px solid #0d2416",
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
							}}>
							<SecHead>🏗️ Skenario Operasional Nyata di Kontraktor</SecHead>
							<p style={{ color: "#ffffffff", fontSize: "0.8rem", margin: 0 }}>
								Bagaimana modul Inventory digunakan dalam situasi nyata di
								lapangan — dari proyek baru dimulai sampai proyek selesai dan
								closing inventory.
							</p>
						</div>
						{CONTRACTOR_SCENARIOS.map((sc, i) => (
							<div
								key={i}
								style={{
									background: "#091810",
									border: `1px solid ${activeScenario === i ? sc.color + "50" : "#0d2416"}`,
									borderRadius: 10,
									overflow: "hidden",
								}}>
								<button
									onClick={() =>
										setActiveScenario(activeScenario === i ? null : i)
									}
									style={{
										width: "100%",
										background: "none",
										border: "none",
										padding: "0.9rem 1.1rem",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										gap: 12,
										textAlign: "left",
									}}>
									<div
										style={{
											width: 10,
											height: 10,
											borderRadius: "50%",
											background: sc.color,
											flexShrink: 0,
										}}
									/>
									<span
										style={{
											color: "#e4f5ea",
											fontWeight: 700,
											fontSize: "0.88rem",
											flex: 1,
										}}>
										{sc.scenario}
									</span>
									<span
										style={{
											color: sc.color,
											fontSize: "1.1rem",
											transform:
												activeScenario === i ? "rotate(90deg)" : "none",
											transition: "transform 0.2s",
											display: "inline-block",
										}}>
										›
									</span>
								</button>
								{activeScenario === i && (
									<div
										style={{
											borderTop: "1px solid #0d2416",
											padding: "0.7rem 1.1rem 1rem",
										}}>
										{sc.steps.map((st, j) => (
											<div
												key={j}
												style={{
													display: "flex",
													gap: 9,
													padding: "0.5rem 0.75rem",
													background: "#050e09",
													borderRadius: 6,
													borderLeft: `2px solid ${sc.color}35`,
													marginBottom: 5,
												}}>
												<span
													style={{
														color: sc.color,
														fontFamily: MONO,
														fontSize: "0.62rem",
														minWidth: 18,
														paddingTop: 2,
													}}>
													{String(j + 1).padStart(2, "0")}
												</span>
												<span
													style={{
														color: "#f8fdfbff",
														fontSize: "0.79rem",
														lineHeight: 1.6,
													}}>
													{st}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						))}

						{/* Key KPIs */}
						<div
							style={{
								background: "#091810",
								border: "1px solid #0d2416",
								borderRadius: 12,
								padding: "1.2rem",
							}}>
							<SecHead>
								📈 KPI Inventory yang Harus Dimonitor Kontraktor
							</SecHead>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
									gap: 10,
								}}>
								{[
									{
										kpi: "Inventory Turnover per Proyek",
										formula: "COGS / Avg Inventory Value",
										target: "> 12x setahun",
										color: "#22d3ee",
										desc: "Material tidak boleh mengendap lama — semakin cepat berputar semakin efisien",
									},
									{
										kpi: "Stock Accuracy Rate",
										formula: "(1 - Selisih Opname / Total Stok) × 100%",
										target: "> 98%",
										color: "#34d399",
										desc: "Akurasi data stok di sistem vs kondisi fisik — di bawah 95% perlu investigasi",
									},
									{
										kpi: "Material Waste Ratio",
										formula: "Qty Scrap / Qty Total Pakai × 100%",
										target: "< 3%",
										color: "#fbbf24",
										desc: "Sisa material yang tidak terpakai — benchmark industri 2-3% untuk konstruksi",
									},
									{
										kpi: "Stockout Frequency",
										formula: "Jumlah kejadian kehabisan material/bulan",
										target: "0 per bulan",
										color: "#ec4899",
										desc: "Kehabisan material = work stoppage = keterlambatan proyek. Target zero.",
									},
									{
										kpi: "Slow-Moving Inventory %",
										formula: "Nilai stok > 60 hari / Total nilai stok",
										target: "< 5%",
										color: "#f97316",
										desc: "Material yang tidak bergerak 60+ hari = modal tersita. Harus di-action.",
									},
									{
										kpi: "Variance per Opname",
										formula: "Selisih nilai opname / Total nilai stok × 100%",
										target: "< 0.5%",
										color: "#84cc16",
										desc: "Selisih antara stok sistem dan fisik — lebih dari 0.5% perlu investigasi mendalam",
									},
								].map((k, i) => (
									<div
										key={i}
										style={{
											background: "#050e09",
											borderRadius: 9,
											padding: "0.9rem",
											borderTop: `3px solid ${k.color}`,
										}}>
										<div
											style={{
												color: k.color,
												fontWeight: 700,
												fontSize: "0.78rem",
												marginBottom: 4,
											}}>
											{k.kpi}
										</div>
										<div
											style={{
												fontFamily: MONO,
												fontSize: "0.63rem",
												color: "#cce1d7ff",
												marginBottom: 3,
											}}>
											{k.formula}
										</div>
										<div
											style={{
												display: "inline-block",
												background: k.color + "18",
												border: `1px solid ${k.color}35`,
												borderRadius: 4,
												padding: "1px 6px",
												fontFamily: MONO,
												fontSize: "0.62rem",
												color: k.color,
												marginBottom: 6,
											}}>
											Target: {k.target}
										</div>
										<div
											style={{
												color: "#ebf0eeff",
												fontSize: "0.72rem",
												lineHeight: 1.5,
											}}>
											{k.desc}
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
