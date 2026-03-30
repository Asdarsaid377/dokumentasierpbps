import { useState } from "react";

const MONO = "'Courier New', monospace";
const SERIF = "'Georgia', serif";

// ─── DATA ────────────────────────────────────────────────────────────────────

const MODULES = [
	{
		id: "mr",
		icon: "📝",
		label: "Material Request (MR)",
		color: "#38bdf8",
		short: "Permintaan material dari site ke procurement",
		desc: "Material Request adalah titik awal seluruh proses pengadaan. Di kontraktor, MR dibuat oleh Site Engineer atau Pelaksana lapangan ketika material dibutuhkan untuk pekerjaan yang akan datang. MR harus ter-link ke Proyek dan item WBS agar biaya bisa ditracking dengan benar.",
		howto: [
			{
				step: "Site Engineer buat MR baru",
				detail:
					"Menu: Buying → Material Request → New. Pilih Material Request Type = Purchase (untuk beli) atau Transfer (ambil dari gudang lain).",
			},
			{
				step: "Link ke Project & Cost Center",
				detail:
					"WAJIB isi field Project dan Cost Center di header MR. Semua item di MR akan inherit nilai ini ke PO dan invoice nantinya.",
			},
			{
				step: "Isi daftar item material",
				detail:
					"Di tabel Items, tambahkan setiap material yang dibutuhkan: Item Code, Qty, UOM (Unit of Measure), Required By date, Warehouse (gudang tujuan pengiriman).",
			},
			{
				step: "Referensikan ke RAB/BOM",
				detail:
					"Gunakan data koefisien AHSP dari RAB sebagai acuan quantity. Contoh: untuk 100 m² pasang bata, kebutuhan semen = 100 × 0.215 zak = 21.5 zak. Jangan request berlebihan.",
			},
			{
				step: "Submit MR untuk approval",
				detail:
					"Setelah semua item terisi, Submit MR. Sistem otomatis kirim notifikasi ke Kepala Logistik / Procurement untuk review dan approve.",
			},
			{
				step: "Procurement review & approve",
				detail:
					"Procurement cek kewajaran qty, apakah item sudah ada di gudang, apakah sudah ada PO yang belum datang. Jika OK → Approve → MR siap dijadikan RFQ/PO.",
			},
		],
		config: [
			{
				field: "Material Request Type",
				value:
					"Purchase = beli baru dari supplier | Transfer = ambil dari gudang pusat ke gudang site | Manufacture = produksi sendiri (jarang untuk kontraktor)",
			},
			{
				field: "Required By Date",
				value:
					"Isi tanggal material HARUS sudah ada di site — procurement akan hitung mundur kapan harus order dan kapan harus produksi",
			},
			{
				field: "Set Warehouse",
				value:
					"Buat warehouse terpisah per site proyek: 'Gudang Site Proyek A', 'Gudang Site Proyek B', agar stok tidak tercampur",
			},
			{
				field: "Raise Material Request from Project",
				value:
					"Di ERPNext bisa auto-generate MR dari Project Task — aktifkan di Project Settings untuk otomasi lebih lanjut",
			},
		],
		warning:
			"MR yang dibuat tanpa link ke Project akan membuat biaya material tidak masuk ke Project Costing. Wajibkan field Project sebagai mandatory di Customize Form → Material Request.",
	},
	{
		id: "rfq",
		icon: "📨",
		label: "Request for Quotation (RFQ)",
		color: "#a78bfa",
		short: "Permintaan penawaran harga ke supplier",
		desc: "RFQ adalah dokumen resmi yang dikirimkan ke minimal 3 supplier untuk meminta penawaran harga. Di ERPNext, RFQ bisa di-generate otomatis dari Material Request yang sudah approved. Proses ini memastikan perusahaan selalu mendapat harga kompetitif.",
		howto: [
			{
				step: "Buat RFQ dari MR yang sudah approved",
				detail:
					"Buka MR yang sudah diapprove → klik tombol 'Make → Request for Quotation'. Sistem otomatis ambil semua item dari MR ke RFQ.",
			},
			{
				step: "Tambahkan daftar supplier yang diundang",
				detail:
					"Di tabel Suppliers, tambahkan minimal 3 supplier yang qualified untuk item ini. Pastikan semua supplier sudah terdaftar di master Supplier ERPNext.",
			},
			{
				step: "Set deadline pengiriman penawaran",
				detail:
					"Isi field Message for Supplier dengan detail teknis yang dibutuhkan dan tanggal batas waktu submit penawaran (biasanya 3-7 hari kerja).",
			},
			{
				step: "Kirim RFQ ke semua supplier",
				detail:
					"Klik Send Emails → sistem otomatis kirim email dengan attachment PDF RFQ ke semua supplier yang terdaftar. Supplier bisa reply langsung atau input di portal supplier.",
			},
			{
				step: "Input penawaran yang masuk",
				detail:
					"Setelah penawaran dari supplier masuk (email / WhatsApp / fisik), input ke sistem: buka RFQ → pilih supplier → isi harga yang ditawarkan per item.",
			},
			{
				step: "Review Supplier Quotation comparison",
				detail:
					"ERPNext otomatis buat Supplier Quotation dari setiap penawaran yang diinput. Gunakan Report 'Supplier Quotation Comparison' untuk lihat semua penawaran berdampingan.",
			},
		],
		config: [
			{
				field: "RFQ Terms",
				value:
					"Buat Terms & Conditions standar untuk RFQ: syarat pembayaran, syarat pengiriman (DDP site / ex-warehouse), syarat garansi material",
			},
			{
				field: "Supplier Portal",
				value:
					"Aktifkan Supplier Portal agar supplier bisa submit penawaran langsung di ERPNext — lebih efisien dari email manual",
			},
			{
				field: "Message Template",
				value:
					"Buat email template RFQ yang profesional dengan spesifikasi teknis material yang jelas — mengurangi pertanyaan balik dari supplier",
			},
		],
		warning: null,
	},
	{
		id: "sq",
		icon: "📊",
		label: "Supplier Quotation & Bid Comparison",
		color: "#34d399",
		short: "Perbandingan harga & evaluasi supplier",
		desc: "Supplier Quotation adalah catatan penawaran dari setiap supplier. ERPNext menyediakan fitur Quotation Comparison yang menampilkan semua penawaran secara berdampingan — memudahkan pengambilan keputusan pemilihan supplier berdasarkan harga, kualitas, dan syarat.",
		howto: [
			{
				step: "Lihat Supplier Quotation Comparison",
				detail:
					"Buying → Reports → Supplier Quotation Comparison. Pilih Material Request atau RFQ number. Sistem tampilkan tabel perbandingan: semua supplier di kolom, semua item di baris, dengan highlight harga terendah.",
			},
			{
				step: "Evaluasi lebih dari sekadar harga",
				detail:
					"Buat custom scoring di luar sistem: harga (40%), delivery time (25%), track record (20%), syarat pembayaran (15%). Input skor total ke field Notes di Supplier Quotation untuk referensi.",
			},
			{
				step: "Tandai penawaran terpilih",
				detail:
					"Di Supplier Quotation yang dipilih, update Status = Ordered. Ini menandai bahwa supplier ini yang akan dibuatkan PO.",
			},
			{
				step: "Buat Purchase Order dari Supplier Quotation",
				detail:
					"Buka Supplier Quotation yang terpilih → klik 'Make → Purchase Order'. ERPNext otomatis isi semua data dari quotation ke PO — tidak perlu input ulang.",
			},
			{
				step: "Simpan alasan pemilihan supplier",
				detail:
					"Di Supplier Quotation terpilih, isi Remarks: alasan pemilihan (harga, kualitas, leadtime). Ini penting untuk audit trail dan jika ada pertanyaan dari manajemen.",
			},
		],
		config: [
			{
				field: "Supplier Rating",
				value:
					"Aktifkan Supplier Rating di Buying Settings. Setelah setiap transaksi selesai, beri rating supplier: kualitas material, ketepatan delivery, respons",
			},
			{
				field: "Blocked Supplier",
				value:
					"Supplier yang bermasalah bisa di-block: Supplier master → Is Blocked = Yes. Supplier ini tidak akan muncul saat membuat RFQ baru",
			},
			{
				field: "Supplier Type",
				value:
					"Kategorikan supplier: Material Bangunan Umum, Besi & Baja, Mekanikal, Elektrikal, Alat Berat. Memudahkan filtering saat membuat RFQ",
			},
		],
		warning:
			"Pemilihan supplier yang hanya berdasarkan harga terendah tanpa mempertimbangkan kualitas dan track record sering berujung pada material tidak sesuai spesifikasi atau pengiriman terlambat yang menghambat proyek.",
	},
	{
		id: "po",
		icon: "📋",
		label: "Purchase Order (PO)",
		color: "#fbbf24",
		short: "Surat pesanan pembelian resmi",
		desc: "Purchase Order adalah dokumen pembelian yang resmi dan mengikat secara hukum. Setelah PO di-submit dan dikirim ke supplier, supplier wajib mengirim material sesuai spesifikasi, quantity, harga, dan waktu yang tertulis di PO.",
		howto: [
			{
				step: "Generate PO dari Supplier Quotation",
				detail:
					"Cara paling efisien: dari Supplier Quotation terpilih → Make → Purchase Order. Semua item, harga, supplier otomatis terbawa. Tinggal cek dan adjust jika perlu.",
			},
			{
				step: "Atau buat PO manual untuk pembelian rutin",
				detail:
					"Buying → Purchase Order → New. Isi Supplier, set Date, Delivery Date, link ke Project (WAJIB). Tambahkan items dari item master.",
			},
			{
				step: "Isi delivery details",
				detail:
					"Di setiap item, isi: Qty, Rate (harga yang sudah disepakati), Required By Date, Warehouse tujuan. Pastikan UOM sama dengan yang di MR agar tidak ada confusion di lapangan.",
			},
			{
				step: "Set Payment Terms per PO",
				detail:
					"Pilih Payment Terms sesuai negosiasi dengan supplier: Net 30, 50% DP 50% COD, dll. Payment Terms ini yang akan muncul di Purchase Invoice nanti.",
			},
			{
				step: "Submit & kirim ke supplier",
				detail:
					"Submit PO → cetak PDF → kirim ke supplier via email atau WhatsApp. PO yang sudah Submit tidak bisa diubah — hanya bisa di-amend jika ada perubahan.",
			},
			{
				step: "Monitor status PO secara aktif",
				detail:
					"Procurement wajib follow up supplier H-2 sebelum delivery date. Gunakan PO Status report untuk lihat PO mana yang belum delivered dan deadlinenya kapan.",
			},
		],
		config: [
			{
				field: "PO Number Format",
				value:
					"Buat format numbering: PO-{PROYEK}-{YYYY}-{SEQ}. Contoh: PO-GDGABC-2024-0045. Memudahkan penelusuran PO per proyek.",
			},
			{
				field: "Supplier Currency",
				value:
					"Untuk material impor, set currency sesuai (USD/EUR). ERPNext handle konversi otomatis berdasarkan exchange rate yang diinput.",
			},
			{
				field: "PO Amendment",
				value:
					"Jika ada perubahan setelah PO di-submit: Amend PO → buat PO baru dengan nomor yang sama + suffix -1. PO original tetap tersimpan.",
			},
			{
				field: "Set Buying Price List",
				value:
					"Buat Price List untuk material yang sering dibeli. Harga otomatis terisi saat item dipilih di PO — mengurangi kesalahan input harga.",
			},
		],
		warning:
			"Jangan buat PO tanpa ada Material Request dan Supplier Quotation di atasnya kecuali untuk pembelian darurat. Pembelian tanpa alur yang benar membuka celah fraud dan tidak bisa dipertanggungjawabkan di audit.",
	},
	{
		id: "grn",
		icon: "📦",
		label: "Purchase Receipt / GRN",
		color: "#fb923c",
		short: "Penerimaan material di gudang/site",
		desc: "Goods Received Note (GRN) atau Purchase Receipt adalah dokumen yang menyatakan bahwa material sudah diterima di gudang/site sesuai dengan PO. Di kontraktor, GRN adalah bukti bahwa material sudah sampai dan bisa diproses untuk pembayaran ke supplier.",
		howto: [
			{
				step: "Material tiba di site, tim logistik cek fisik",
				detail:
					"Satpam/Logistik terima kendaraan supplier. Cek: jenis material, quantity, kondisi fisik, kesesuaian dengan DO (Delivery Order) supplier dan PO.",
			},
			{
				step: "Buat Purchase Receipt dari PO",
				detail:
					"Buka PO terkait → Make → Purchase Receipt. Sistem otomatis isi semua item dari PO. Tinggal adjust quantity aktual yang diterima (bisa berbeda dari PO jika pengiriman parsial).",
			},
			{
				step: "Input quantity aktual yang diterima",
				detail:
					"Jika ada kekurangan qty atau material yang di-reject (rusak, tidak sesuai spesifikasi), kurangi qty di Purchase Receipt. Item yang di-reject dicatat di Rejected Qty.",
			},
			{
				step: "Verifikasi kualitas material",
				detail:
					"QC Site Inspector cek: spesifikasi material (merek, grade, ukuran), kondisi fisik, sertifikat material jika required (mill certificate besi, dll). Jika gagal QC → reject dan kembalikan ke supplier.",
			},
			{
				step: "Input ke warehouse yang tepat",
				detail:
					"Pastikan Warehouse di Purchase Receipt adalah gudang site proyek yang benar. Ini yang menentukan di gudang mana stok tercatat.",
			},
			{
				step: "Submit GRN",
				detail:
					"Setelah semua terverifikasi → Submit. Stok otomatis bertambah di warehouse yang dipilih. Biaya material masuk ke Inventory Valuation dan siap untuk proses Purchase Invoice.",
			},
		],
		config: [
			{
				field: "Quality Inspection",
				value:
					"Aktifkan Quality Inspection di Purchase Receipt untuk item tertentu (besi, semen, dll). Inspector harus approve QC sebelum GRN bisa di-Submit.",
			},
			{
				field: "Rejected Qty & Return",
				detail:
					"Material yang di-reject → isi Rejected Qty di GRN → buat Purchase Return untuk kembalikan ke supplier dan credit note",
			},
			{
				field: "Barcode / QR Code",
				value:
					"Untuk material high-value, pertimbangkan labeling dengan barcode/QR setelah GRN — memudahkan tracking pemakaian di lapangan",
			},
		],
		warning:
			"GRN yang dibuat sebelum material benar-benar diterima (fiktif) adalah fraud pengadaan yang umum. Implementasikan kontrol: GRN harus dibuat oleh orang yang berbeda dari yang membuat PO, dan harus ada foto bukti penerimaan.",
	},
	{
		id: "pi",
		icon: "🧾",
		label: "Purchase Invoice & Payment",
		color: "#f472b6",
		short: "Tagihan supplier & proses pembayaran",
		desc: "Purchase Invoice adalah tagihan dari supplier yang harus dibayar. Di ERPNext, Purchase Invoice dibuat berdasarkan GRN — ini memastikan kita hanya membayar material yang sudah benar-benar diterima. Three-way matching: PO ↔ GRN ↔ Invoice.",
		howto: [
			{
				step: "Buat Purchase Invoice dari GRN",
				detail:
					"Buka GRN yang sudah di-submit → Make → Purchase Invoice. Sistem otomatis isi: supplier, items, qty dari GRN, harga dari PO. Ini memastikan tidak bisa invoice melebihi yang sudah diterima.",
			},
			{
				step: "Verifikasi invoice fisik dari supplier",
				detail:
					"Bandingkan invoice yang dibuat di sistem dengan invoice fisik dari supplier: nomor invoice, tanggal, qty, harga. Jika ada perbedaan → klarifikasi ke supplier sebelum di-Submit.",
			},
			{
				step: "Set due date pembayaran",
				detail:
					"Payment Terms otomatis calculate due date dari tanggal invoice. PM atau Finance perlu konfirmasi due date ini sesuai dengan kesepakatan kontrak supplier.",
			},
			{
				step: "Submit Invoice → masuk ke AP",
				detail:
					"Setelah verifikasi, Submit. Invoice masuk ke Accounts Payable. Finance bisa lihat semua hutang yang outstanding dan jadwal pembayarannya.",
			},
			{
				step: "Proses pembayaran",
				detail:
					"Finance buat Payment Entry dari Purchase Invoice: pilih mode pembayaran (transfer bank), isi jumlah, referensi transaksi bank. Submit → hutang berkurang, kas berkurang.",
			},
			{
				step: "Reconcile dengan mutasi bank",
				detail:
					"Setelah pembayaran, lakukan Bank Reconciliation: cocokkan Payment Entry di ERPNext dengan mutasi rekening koran bank. Pastikan tidak ada perbedaan.",
			},
		],
		config: [
			{
				field: "Three-Way Matching",
				value:
					"ERPNext otomatis validasi: qty di Invoice tidak boleh > qty di GRN, dan harga tidak boleh > harga di PO. Jika ada perbedaan, sistem warning.",
			},
			{
				field: "Hold Invoice",
				value:
					"Jika ada dispute dengan supplier, gunakan 'On Hold' di Purchase Invoice — hutang tercatat tapi tidak jatuh tempo sampai dispute selesai",
			},
			{
				field: "Auto-Accounting",
				value:
					"Setup chart of accounts yang benar: Inventory Account untuk material masuk, COGS untuk material yang dipakai, AP Account untuk hutang supplier",
			},
		],
		warning: null,
	},
	{
		id: "lc",
		icon: "🚛",
		label: "Landed Cost Voucher",
		color: "#818cf8",
		short: "Biaya pengiriman & handling ke HPP",
		desc: "Landed Cost Voucher adalah fitur ERPNext untuk menambahkan biaya-biaya tambahan ke harga pokok material — biaya angkut, bongkar muat, asuransi pengiriman. Untuk kontraktor, ini penting karena biaya kirim material ke site bisa signifikan dan harus masuk ke biaya proyek.",
		howto: [
			{
				step: "Buat Landed Cost Voucher",
				detail:
					"Buying → Landed Cost Voucher → New. Pilih Company, pilih Purchase Receipts yang terkait (bisa satu atau lebih GRN sekaligus).",
			},
			{
				step: "Tambahkan biaya-biaya tambahan",
				detail:
					"Di tabel Taxes and Charges, tambahkan: Ongkos Kirim, Biaya Bongkar Muat, Asuransi Pengiriman, Biaya Handling. Isi amount atau percentage.",
			},
			{
				step: "Pilih allocation method",
				detail:
					"Tentukan bagaimana biaya tambahan ini dibagi ke setiap item: By Qty (proporsi berdasarkan jumlah), By Amount (proporsi berdasarkan nilai), By Weight, By Volume.",
			},
			{
				step: "Submit",
				detail:
					"ERPNext otomatis recalculate HPP (Harga Pokok Persediaan) setiap item material dengan menambahkan porsi landed cost. Nilai di Balance Sheet inventory pun terupdate.",
			},
		],
		config: [
			{
				field: "Allocation Method",
				value:
					"Untuk material konstruksi: gunakan 'By Amount' — material mahal mendapat porsi biaya kirim lebih besar, lebih fair secara akuntansi",
			},
			{
				field: "Landed Cost Account",
				value:
					"Buat akun khusus di CoA: 'Biaya Angkut Pembelian' agar bisa dilacak totalnya per periode",
			},
		],
		warning: null,
	},
	{
		id: "supplier",
		icon: "🏢",
		label: "Supplier Management",
		color: "#2dd4bf",
		short: "Database & evaluasi performa supplier",
		desc: "Supplier Master di ERPNext adalah database lengkap semua vendor material. Untuk kontraktor, manajemen supplier yang baik berarti selalu punya pilihan supplier qualified, harga kompetitif, dan rekam jejak yang terdokumentasi.",
		howto: [
			{
				step: "Daftarkan semua supplier aktif",
				detail:
					"Buying → Supplier → New. Isi: nama perusahaan, tipe (Company/Individual), NPWP, alamat, kontak PIC, nomor rekening bank untuk pembayaran.",
			},
			{
				step: "Kategorikan supplier",
				detail:
					"Field Supplier Group: Material Bangunan Umum / Besi & Baja / Mekanikal / Elektrikal / Sewa Alat / Jasa. Memudahkan filtering saat buat RFQ.",
			},
			{
				step: "Set payment terms per supplier",
				detail:
					"Di Supplier master, set Default Payment Terms. Ini otomatis terisi di setiap PO ke supplier ini — mengurangi kesalahan.",
			},
			{
				step: "Monitor supplier performance",
				detail:
					"Setelah setiap transaksi selesai, update Supplier Scorecard (jika diaktifkan) atau catat di Notes. Buat keputusan re-qualification berdasarkan data historis ini.",
			},
			{
				step: "Blacklist supplier bermasalah",
				detail:
					"Supplier yang sering telat kirim atau material tidak sesuai spesifikasi: set Is Blocked = Yes. Mereka tidak akan bisa dipilih di RFQ/PO baru.",
			},
		],
		config: [
			{
				field: "Supplier Scorecard",
				value:
					"Aktifkan di Buying Settings. Set criteria: Delivery (30%), Quality (30%), Price Competitiveness (20%), Responsiveness (20%).",
			},
			{
				field: "Default Currency",
				value:
					"Untuk supplier impor, set default currency. Harga di PO otomatis dalam currency yang benar.",
			},
			{
				field: "Credit Limit",
				value:
					"Set credit limit per supplier — batas maksimal hutang yang boleh outstanding ke supplier tersebut sebelum harus bayar dulu",
			},
		],
		warning: null,
	},
];

const FLOW = [
	{
		no: "01",
		from: "Site Engineer",
		action: "Buat Material Request (MR)",
		doc: "Material Request",
		color: "#38bdf8",
		note: "Link ke Project & WBS item wajib",
	},
	{
		no: "02",
		from: "Kepala Logistik",
		action: "Review & Approve MR",
		doc: "MR Approved",
		color: "#38bdf8",
		note: "Cek stok gudang, kewajaran qty",
	},
	{
		no: "03",
		from: "Procurement",
		action: "Buat RFQ ke ≥3 Supplier",
		doc: "Request for Quotation",
		color: "#a78bfa",
		note: "Supplier qualified dari vendor master",
	},
	{
		no: "04",
		from: "Supplier",
		action: "Submit Penawaran Harga",
		doc: "Supplier Quotation",
		color: "#a78bfa",
		note: "Input ke sistem atau via supplier portal",
	},
	{
		no: "05",
		from: "Procurement",
		action: "Bid Comparison & Evaluasi",
		doc: "Quotation Comparison Report",
		color: "#34d399",
		note: "Harga + kualitas + track record",
	},
	{
		no: "06",
		from: "PM / Kepala Logistik",
		action: "Approve Pemenang Tender",
		doc: "Supplier Quotation Approved",
		color: "#34d399",
		note: "Approval bertingkat sesuai nilai PO",
	},
	{
		no: "07",
		from: "Procurement",
		action: "Terbitkan Purchase Order",
		doc: "Purchase Order",
		color: "#fbbf24",
		note: "Kirim ke supplier, simpan di sistem",
	},
	{
		no: "08",
		from: "Supplier",
		action: "Kirim Material + DO ke Site",
		doc: "Delivery Order Supplier",
		color: "#fbbf24",
		note: "Supplier kirim sesuai jadwal di PO",
	},
	{
		no: "09",
		from: "Logistik / QC Site",
		action: "Terima & Inspeksi Material",
		doc: "Purchase Receipt (GRN)",
		color: "#fb923c",
		note: "Cek qty, kondisi, spesifikasi fisik",
	},
	{
		no: "10",
		from: "Finance / Accounting",
		action: "Proses Invoice Supplier",
		doc: "Purchase Invoice",
		color: "#f472b6",
		note: "3-way matching: PO ↔ GRN ↔ Invoice",
	},
	{
		no: "11",
		from: "Finance",
		action: "Bayar Supplier",
		doc: "Payment Entry",
		color: "#f472b6",
		note: "Sesuai payment terms & jadwal cash flow",
	},
	{
		no: "12",
		from: "Logistik",
		action: "Input Biaya Kirim ke HPP",
		doc: "Landed Cost Voucher",
		color: "#818cf8",
		note: "Ongkir, bongkar muat masuk ke biaya material",
	},
];

const REPORTS = [
	{
		name: "Purchase Order Analysis",
		path: "Buying → Reports → Purchase Order Trends",
		color: "#fbbf24",
		freq: "Mingguan",
		use: "Lihat total PO per proyek, per supplier, per periode. Analisis tren pembelian dan identifikasi supplier mana yang paling sering dipakai.",
		benefit:
			"Deteksi pembelian berlebihan atau pengulangan order material yang sama karena perencanaan buruk.",
	},
	{
		name: "Supplier Quotation Comparison",
		path: "Buying → Reports → Supplier Quotation Comparison",
		color: "#34d399",
		freq: "Per Tender",
		use: "Tampilkan semua penawaran supplier untuk satu RFQ secara berdampingan dengan highlight harga terendah per item.",
		benefit:
			"Dokumentasi keputusan pemilihan supplier — transparansi dan anti-korupsi dalam pengadaan.",
	},
	{
		name: "Purchase Register",
		path: "Buying → Reports → Purchase Register",
		color: "#38bdf8",
		freq: "Bulanan",
		use: "Rekap semua pembelian dalam periode tertentu: supplier, item, nilai, tanggal. Bisa filter per proyek atau per Cost Center.",
		benefit:
			"Dasar rekonsiliasi biaya material per proyek dengan data RAB. Identifikasi pembelian yang tidak ter-link ke proyek.",
	},
	{
		name: "Material Request Analysis",
		path: "Buying → Reports → Material Requests for which Supplier Quotations are Pending",
		color: "#a78bfa",
		freq: "Harian",
		use: "Tampilkan MR yang sudah diapprove tapi belum dibuatkan RFQ atau PO. Procurement wajib pantau ini setiap hari.",
		benefit:
			"Mencegah material terlambat tiba di site karena PO yang lupa dibuat.",
	},
	{
		name: "Purchase Invoice Trends",
		path: "Accounts → Accounts Payable → Purchase Invoice Trends",
		color: "#f472b6",
		freq: "Bulanan",
		use: "Tren nilai invoice per bulan per supplier atau per proyek. Identifikasi supplier dengan invoice terbesar dan apakah sesuai kontrak.",
		benefit:
			"Kontrol anggaran pembelian dan deteksi invoice anomali (terlalu besar atau di luar kontrak).",
	},
	{
		name: "Accounts Payable Aging",
		path: "Accounts → Accounts Payable → Accounts Payable Summary",
		color: "#fb923c",
		freq: "Mingguan",
		use: "Lihat hutang yang outstanding per supplier dengan aging: 0-30 hari, 31-60 hari, 61-90 hari, > 90 hari.",
		benefit:
			"Finance bisa prioritaskan pembayaran sesuai due date dan hindari supplier menghentikan supply karena hutang menumpuk.",
	},
	{
		name: "Stock Ledger Report",
		path: "Stock → Reports → Stock Ledger",
		color: "#2dd4bf",
		freq: "Mingguan",
		use: "Rekap semua pergerakan stok per gudang site: material masuk (GRN), material keluar (pemakaian), saldo akhir. Filter per item atau per gudang.",
		benefit:
			"Kontrol material di site — deteksi material yang hilang, terpakai berlebihan, atau tidak ter-record.",
	},
	{
		name: "Purchase Analytics",
		path: "Buying → Reports → Purchase Analytics",
		color: "#818cf8",
		freq: "Bulanan",
		use: "Analisis pembelian dengan pivot table: bisa group by Supplier, Item Group, Project, Period. Visualisasi dalam chart.",
		benefit:
			"Insight strategis untuk negosiasi kontrak payung dengan supplier utama berdasarkan volume pembelian historis.",
	},
	{
		name: "Procurement Tracker",
		path: "Buying → Reports → Procurement Tracker",
		color: "#f59e0b",
		freq: "Harian",
		use: "Status tracking setiap item dari MR sampai PO sampai GRN: berapa yang sudah diterima, berapa yang pending, berapa yang terlambat.",
		benefit:
			"Dashboard pengadaan harian — procurement tahu persis mana PO yang sudah kirim, mana yang belum, dan mana yang sudah lewat deadline.",
	},
	{
		name: "Supplier Scorecard",
		path: "Buying → Supplier Scorecard",
		color: "#34d399",
		freq: "Triwulan",
		use: "Evaluasi performa setiap supplier berdasarkan kriteria yang sudah diset: ketepatan delivery, kualitas material, responsivitas, harga kompetitif.",
		benefit:
			"Basis keputusan vendor qualification — supplier dengan score rendah perlu di-review ulang atau diganti.",
	},
];

const SETUP_STEPS = [
	{
		no: 1,
		title: "Konfigurasi Item Master untuk Material Konstruksi",
		color: "#38bdf8",
		desc: "Sebelum PO bisa dibuat, semua material yang akan dibeli harus terdaftar di Item Master dengan kode yang terstandarisasi.",
		steps: [
			"Buat Item Groups: Semen & Bahan Dasar / Besi & Baja / Material Finishing / M/E Material / Konsumable",
			"Buat Item per material: kode item (MAT-SEM-001), nama, UOM (zak, kg, batang, m², m³)",
			"Aktifkan 'Maintain Stock' = Yes untuk semua material yang disimpan di gudang",
			"Set default Buying UOM dan Selling UOM yang berbeda jika perlu (beli per ton, pakai per kg)",
			"Set Item Tax Template jika material kena PPN (hampir semua material konstruksi kena PPN 11%)",
			"Buat Price List 'Standard Buying' sebagai harga referensi — update setiap kuartal dari survey pasar",
		],
	},
	{
		no: 2,
		title: "Setup Warehouse per Site Proyek",
		color: "#a78bfa",
		desc: "Setiap site proyek harus punya gudang sendiri di ERPNext agar stok tidak tercampur antar proyek.",
		steps: [
			"Stock → Warehouse → New",
			"Buat Warehouse: 'Gudang Pusat', lalu child warehouse per proyek: 'Site Proyek Gedung ABC'",
			"Set Parent Warehouse = Gudang Pusat untuk semua site warehouse",
			"Buat warehouse 'Rejected Material' untuk material yang di-reject QC sebelum dikembalikan ke supplier",
			"Assign Warehouse ke Cost Center proyek yang sesuai",
			"Set 'Is Group' = Yes untuk Gudang Pusat agar bisa jadi parent",
		],
	},
	{
		no: 3,
		title: "Konfigurasi Supplier Master",
		color: "#34d399",
		desc: "Daftarkan semua supplier aktif dengan data lengkap sebelum proses pengadaan dimulai.",
		steps: [
			"Buying → Supplier → New untuk setiap supplier",
			"Kategorikan: Supplier Type (Company/Individual), Supplier Group (per kategori material)",
			"Isi Payment Terms default per supplier sesuai negosiasi awal",
			"Input data bank supplier untuk pembayaran: Bank Name, Account No, Branch",
			"Upload dokumen legalitas supplier: NPWP, SIUP, rekening koran jika diperlukan",
			"Set Credit Limit sesuai nilai transaksi rata-rata dengan supplier tersebut",
			"Aktifkan Supplier Scorecard di Buying Settings untuk penilaian performa",
		],
	},
	{
		no: 4,
		title: "Setup Approval Workflow untuk Pengadaan",
		color: "#fbbf24",
		desc: "Setiap tahapan pengadaan harus punya approval yang jelas agar tidak ada pembelian tanpa otorisasi.",
		steps: [
			"Setup → Workflow → New",
			"Workflow untuk Material Request: Pelaksana submit → Logistik approve → Procurement eksekusi",
			"Workflow untuk Purchase Order: berdasarkan nilai — < 50jt: Procurement approve | 50-500jt: + PM approve | > 500jt: + Direktur approve",
			"Set Notification di setiap transisi status: kirim email ke approver berikutnya",
			"Test workflow dengan transaksi dummy sebelum go-live",
			"Dokumentasikan SOP pengadaan yang mencerminkan workflow di sistem",
		],
	},
	{
		no: 5,
		title: "Setup Budget Control di Buying",
		color: "#fb923c",
		desc: "Aktifkan budget control agar PO tidak bisa diterbitkan jika anggaran RAB sudah habis.",
		steps: [
			"Accounting → Budget → New (buat budget per Cost Center proyek per akun material)",
			"Accounting Settings → Budget Exception Action: set ke 'Stop' untuk material kritis atau 'Warn' untuk fleksibilitas",
			"Pastikan Cost Center di setiap PO terisi — ini yang dipakai sistem untuk cek budget",
			"Review budget utilization mingguan via Budget Variance Report",
			"Set alert email ke PM jika budget utilization > 80%",
		],
	},
	{
		no: 6,
		title: "Konfigurasi Taxes & Charges",
		color: "#f472b6",
		desc: "Setup pajak dan biaya tambahan yang benar agar invoice supplier akurat dan rekonsiliasi pajak mudah.",
		steps: [
			"Accounts → Tax Rule → New",
			"Buat Purchase Tax Template: 'PPN Masukan 11%' untuk supplier PKP",
			"Buat template khusus: 'PPh 22 Impor' untuk material impor",
			"Buat Purchase Tax Template 'No Tax' untuk supplier non-PKP",
			"Set default Tax Template di Supplier Master per supplier — otomatis terisi di setiap PO",
			"Verifikasi Tax Account mapping ke CoA yang benar",
		],
	},
];

const CONTRACTOR_TIPS = [
	{
		category: "Perencanaan Material",
		color: "#38bdf8",
		tips: [
			"Buat Material Request H-14 sebelum material dibutuhkan di site — berikan waktu cukup untuk RFQ, negosiasi, dan pengiriman",
			"Group material request: daripada buat 10 MR kecil dalam seminggu, gabung jadi 1-2 MR besar — lebih efisien dan bisa negosiasi volume discount",
			"Integrasikan dengan jadwal konstruksi: MR harus dibuat bersamaan dengan planning mingguan di site",
		],
	},
	{
		category: "Kontrol Harga",
		color: "#34d399",
		tips: [
			"Buat Kontrak Payung dengan supplier material utama (semen, besi, pasir) — harga terkunci untuk volume tertentu dalam periode proyek",
			"Bandingkan harga aktual di PO dengan harga RAB secara berkala — jika selisih > 5% perlu justifikasi",
			"Simpan semua Supplier Quotation meskipun tidak dipilih — berguna untuk referensi negosiasi berikutnya",
		],
	},
	{
		category: "Kontrol Penerimaan",
		color: "#fb923c",
		tips: [
			"Foto WAJIB saat GRN: foto kendaraan pengiriman, foto material, foto DO/surat jalan supplier — upload ke sistem sebagai lampiran GRN",
			"Timbang ulang material curah (pasir, split, tanah urug) dengan timbangan site — jangan percaya surat jalan saja",
			"Material yang belum QC-cleared tidak boleh keluar dari area penerimaan — pisahkan secara fisik",
		],
	},
	{
		category: "Manajemen Cash Flow",
		color: "#f472b6",
		tips: [
			"Negosiasikan payment terms selaras dengan cash flow proyek: bayar supplier setelah termin dari owner cair",
			"Prioritaskan pembayaran supplier material kritis untuk keberlanjutan supply — jangan terlambat bayar supplier semen/besi",
			"Gunakan AP Aging report setiap Jumat untuk planning pembayaran minggu berikutnya",
		],
	},
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const Tag = ({ color, children, sm }) => (
	<span
		style={{
			background: color + "18",
			color,
			border: `1px solid ${color}40`,
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
			fontFamily: SERIF,
			fontSize: "0.7rem",
			color: "#e8eff5ff",
			letterSpacing: 4,
			textTransform: "uppercase",
			marginBottom: "0.9rem",
		}}>
		{children}
	</div>
);

export default function Procurement() {
	const [tab, setTab] = useState("flow");
	const [activeModule, setActiveModule] = useState(0);
	const [activeSetup, setActiveSetup] = useState(null);

	const mod = MODULES[activeModule];

	return (
		<div
			style={{
				background: "#060d12",
				minHeight: "100vh",
				color: "#b8cedd",
				fontFamily: SERIF,
			}}>
			{/* HEADER */}
			<div
				style={{
					background: "linear-gradient(160deg, #0b1820 0%, #060d12 100%)",
					borderBottom: "1px solid #0f2030",
					padding: "2rem 1.5rem 1.6rem",
					position: "relative",
					overflow: "hidden",
				}}>
				<div
					style={{
						position: "absolute",
						top: -40,
						right: -40,
						width: 280,
						height: 280,
						borderRadius: "50%",
						background:
							"radial-gradient(circle, #fbbf2410 0%, transparent 70%)",
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
						BUILT-IN FEATURE #2 — DEEP DIVE
					</div>
					<h1
						style={{
							margin: 0,
							fontSize: "clamp(1.4rem, 3vw, 2rem)",
							fontWeight: 700,
							color: "#e8f4ff",
							lineHeight: 1.2,
						}}>
						ERPNext Procurement & SCM
					</h1>
					<p
						style={{
							color: "#f9f9f9ff",
							margin: "0.6rem 0 0",
							fontSize: "0.84rem",
							fontFamily: MONO,
						}}>
						Material Request · RFQ · Bid Comparison · Purchase Order · GRN ·
						Invoice · Supplier Management
					</p>
				</div>
			</div>

			{/* NAV */}
			<div
				style={{
					borderBottom: "1px solid #0f2030",
					background: "#060d12",
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
						{ key: "flow", label: "🔄 Alur Pengadaan" },
						{ key: "modules", label: "🧩 Fitur & Cara Kerja" },
						{ key: "setup", label: "⚙️ Setup Step-by-Step" },
						{ key: "reports", label: "📊 Reports Penting" },
						{ key: "tips", label: "💡 Tips untuk Kontraktor" },
					].map((n) => (
						<button
							key={n.key}
							onClick={() => setTab(n.key)}
							style={{
								padding: "0.85rem 1rem",
								background: "none",
								border: "none",
								borderBottom:
									tab === n.key ? "2px solid #fbbf24" : "2px solid transparent",
								color: tab === n.key ? "#fbbf24" : "#1a3550",
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
				{/* ── FLOW TAB ── */}
				{tab === "flow" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						<div
							style={{
								background: "#0b1820",
								border: "1px solid #0f2030",
								borderRadius: 10,
								padding: "1rem 1.2rem",
							}}>
							<SecHead>
								🔄 Alur Lengkap Pengadaan Material — dari Kebutuhan Lapangan
								sampai Bayar Supplier
							</SecHead>
							<p style={{ color: "#d9e2ebff", fontSize: "0.82rem", margin: 0 }}>
								12 langkah berurutan yang membentuk siklus pengadaan material di
								proyek konstruksi. Setiap langkah menghasilkan dokumen yang
								menjadi dasar langkah berikutnya.
							</p>
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
							{FLOW.map((f, i) => (
								<div
									key={i}
									style={{
										display: "grid",
										gridTemplateColumns: "36px 160px 1fr auto auto",
										gap: 10,
										padding: "0.7rem 1rem",
										background: "#0b1820",
										borderRadius: 9,
										borderLeft: `3px solid ${f.color}`,
										alignItems: "center",
										textAlign: "left",
									}}>
									<div
										style={{
											width: 28,
											height: 28,
											borderRadius: "50%",
											background: f.color + "20",
											border: `1.5px solid ${f.color}60`,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontFamily: MONO,
											fontSize: "0.65rem",
											color: f.color,
											flexShrink: 0,
										}}>
										{f.no}
									</div>
									<div
										style={{
											fontFamily: MONO,
											fontSize: "0.65rem",
											color: "#eef2f6ff",
										}}>
										{f.from}
									</div>
									<div>
										<div
											style={{
												color: "#ffffffff",
												fontSize: "0.82rem",
												fontWeight: 600,
											}}>
											{f.action}
										</div>
										<div
											style={{
												color: "#ffffffff",
												fontSize: "0.72rem",
												marginTop: 2,
											}}>
											{f.note}
										</div>
									</div>
									<Tag color={f.color}>{f.doc}</Tag>
								</div>
							))}
						</div>
						{/* 3-way matching box */}
						<div
							style={{
								background: "#0b1820",
								border: "1px solid #0f2030",
								borderRadius: 10,
								padding: "1rem 1.2rem",
								marginTop: 4,
							}}>
							<SecHead>
								🔒 Three-Way Matching — Kontrol Anti-Fraud Pengadaan
							</SecHead>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(3, 1fr)",
									gap: 10,
								}}>
								{[
									{
										doc: "Purchase Order (PO)",
										icon: "📋",
										color: "#fbbf24",
										desc: "Harga & qty yang disetujui perusahaan saat order",
									},
									{
										doc: "Goods Receipt (GRN)",
										icon: "📦",
										color: "#fb923c",
										desc: "Qty aktual material yang diterima di site",
									},
									{
										doc: "Purchase Invoice",
										icon: "🧾",
										color: "#f472b6",
										desc: "Tagihan dari supplier yang harus dibayar",
									},
								].map((d, i) => (
									<div
										key={i}
										style={{
											background: "#060d12",
											borderRadius: 8,
											padding: "0.85rem",
											borderTop: `3px solid ${d.color}`,
											textAlign: "center",
										}}>
										<span style={{ fontSize: 24 }}>{d.icon}</span>
										<div
											style={{
												color: d.color,
												fontWeight: 700,
												fontSize: "0.82rem",
												margin: "5px 0 4px",
											}}>
											{d.doc}
										</div>
										<div
											style={{
												color: "#f7f7f7ff",
												fontSize: "0.74rem",
												lineHeight: 1.5,
											}}>
											{d.desc}
										</div>
									</div>
								))}
							</div>
							<div
								style={{
									background: "#060d12",
									borderRadius: 8,
									padding: "0.75rem 1rem",
									marginTop: 10,
									fontFamily: MONO,
									fontSize: "0.72rem",
									color: "#2a4560",
									lineHeight: 1.8,
								}}>
								<span style={{ color: "#e8f4ff" }}>Rule:</span>{" "}
								<span style={{ color: "#ffffffff" }}>
									Invoice tidak bisa di-submit jika qty {">"} GRN, dan harga
									tidak bisa {">"} PO. Perbedaan antara ketiganya = temuan
									pengadaan yang harus diselesaikan sebelum pembayaran.
								</span>
								<span style={{ color: "#fbbf24" }}>
									{" "}
									ERPNext enforce ini secara otomatis.
								</span>
							</div>
						</div>
					</div>
				)}

				{/* ── MODULES TAB ── */}
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
										padding: "0.6rem 0.8rem",
										background: activeModule === i ? m.color + "14" : "#0b1820",
										border: `1px solid ${activeModule === i ? m.color + "60" : "#0f2030"}`,
										borderRadius: 8,
										cursor: "pointer",
										transition: "all 0.15s",
									}}>
									<div
										style={{ display: "flex", gap: 7, alignItems: "center" }}>
										<span style={{ fontSize: 16 }}>{m.icon}</span>
										<div>
											<div
												style={{
													color: activeModule === i ? "#e8f4ff" : "#3a5a74",
													fontSize: "0.76rem",
													fontWeight: 700,
												}}>
												{m.label}
											</div>
											<div
												style={{
													fontFamily: SERIF,
													fontSize: "0.56rem",
													color: activeModule === i ? m.color : "#fefefeff",
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
								background: "#0b1820",
								border: `1px solid ${mod.color}28`,
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
								<span style={{ fontSize: 24 }}>{mod.icon}</span>
								<div>
									<div
										style={{
											fontFamily: MONO,
											fontSize: "0.58rem",
											color: mod.color,
											letterSpacing: 3,
										}}>
										FITUR BAWAAN ERPNEXT
									</div>
									<h2
										style={{
											margin: 0,
											color: "#e8f4ff",
											fontSize: "1.05rem",
											fontWeight: 700,
										}}>
										{mod.label}
									</h2>
								</div>
							</div>
							<p
								style={{
									color: "#3a5a74",
									fontSize: "0.84rem",
									lineHeight: 1.75,
									margin: "0 0 1.2rem",
									borderLeft: `3px solid ${mod.color}35`,
									paddingLeft: "0.9rem",
								}}>
								{mod.desc}
							</p>
							<SecHead>🛠 Cara Penggunaan untuk Kontraktor</SecHead>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 6,
									marginBottom: "1.2rem",
								}}>
								{mod.howto.map((h, i) => (
									<div
										key={i}
										style={{
											display: "grid",
											gridTemplateColumns: "26px 1fr",
											gap: 10,
											padding: "0.6rem 0.8rem",
											background: "#060d12",
											borderRadius: 7,
											borderLeft: `2px solid ${mod.color}40`,
										}}>
										<div
											style={{
												width: 22,
												height: 22,
												borderRadius: "50%",
												background: mod.color + "18",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontFamily: MONO,
												fontSize: "0.62rem",
												color: mod.color,
												flexShrink: 0,
												marginTop: 1,
											}}>
											{i + 1}
										</div>
										<div>
											<div
												style={{
													color: "#e8f4ff",
													fontSize: "0.81rem",
													fontWeight: 700,
													marginBottom: 2,
												}}>
												{h.step}
											</div>
											<div
												style={{
													color: "#f8f8f8ff",
													fontSize: "0.77rem",
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
											gridTemplateColumns: "170px 1fr",
											gap: 10,
											padding: "0.48rem 0.8rem",
											background: "#060d12",
											borderRadius: 6,
										}}>
										<div
											style={{
												fontFamily: MONO,
												fontSize: "0.68rem",
												color: mod.color,
												paddingTop: 1,
											}}>
											{c.field}
										</div>
										<div
											style={{
												color: "#3a5a74",
												fontSize: "0.75rem",
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
										background: "#fbbf2410",
										border: "1px solid #fbbf2428",
										borderRadius: 8,
										padding: "0.7rem 0.9rem",
										display: "flex",
										gap: 8,
										marginTop: "0.8rem",
									}}>
									<span>⚠️</span>
									<span
										style={{
											color: "#fcd34d",
											fontSize: "0.78rem",
											lineHeight: 1.6,
										}}>
										{mod.warning}
									</span>
								</div>
							)}
						</div>
					</div>
				)}

				{/* ── SETUP TAB ── */}
				{tab === "setup" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
						<div
							style={{
								background: "#0b1820",
								border: "1px solid #0f2030",
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
							}}>
							<SecHead>
								⚙️ Setup Modul Procurement — Urutan Wajib Sebelum Go-Live
							</SecHead>
							<p style={{ color: "#ffffffff", fontSize: "0.81rem", margin: 0 }}>
								Ikuti urutan ini. Jika setup tidak lengkap, transaksi pengadaan
								tidak bisa berjalan dengan benar dan laporan biaya proyek akan
								tidak akurat.
							</p>
						</div>
						{SETUP_STEPS.map((s, i) => (
							<div
								key={i}
								style={{
									background: "#0b1820",
									border: `1px solid ${activeSetup === i ? s.color + "55" : "#0f2030"}`,
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
											border: `2px solid ${s.color}45`,
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
												color: "#e8f4ff",
												fontWeight: 700,
												fontSize: "0.87rem",
											}}>
											{s.title}
										</div>
										<div
											style={{
												color: "#e6ebf1ff",
												fontSize: "0.74rem",
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
											borderTop: "1px solid #0f2030",
											padding: "0.75rem 1rem 1rem",
										}}>
										{s.steps.map((st, j) => (
											<div
												key={j}
												style={{
													display: "flex",
													gap: 10,
													padding: "0.5rem 0.75rem",
													background: "#060d12",
													borderRadius: 6,
													borderLeft: `2px solid ${s.color}40`,
													marginBottom: 5,
												}}>
												<span
													style={{
														color: s.color,
														fontFamily: MONO,
														fontSize: "0.62rem",
														minWidth: 18,
														paddingTop: 2,
													}}>
													{String(j + 1).padStart(2, "0")}
												</span>
												<span
													style={{
														color: "#ffffffff",
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
					</div>
				)}

				{/* ── REPORTS TAB ── */}
				{tab === "reports" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						<div
							style={{
								background: "#0b1820",
								border: "1px solid #0f2030",
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
							}}>
							<SecHead>
								📊 10 Report Procurement yang Wajib Dimonitor Kontraktor
							</SecHead>
							<p style={{ color: "#ffffffff", fontSize: "0.81rem", margin: 0 }}>
								Laporan-laporan ini memberikan visibilitas penuh atas pengadaan
								— dari status PO harian sampai evaluasi performa supplier
								tahunan.
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
										background: "#0b1820",
										border: `1px solid ${r.color}22`,
										borderRadius: 10,
										padding: "1rem 1.1rem",
										borderLeft: `4px solid ${r.color}`,
									}}>
									<div
										style={{
											display: "flex",
											gap: 8,
											alignItems: "flex-start",
											marginBottom: "0.5rem",
										}}>
										<div style={{ flex: 1 }}>
											<div
												style={{
													display: "flex",
													gap: 6,
													alignItems: "center",
													marginBottom: 4,
													flexWrap: "wrap",
												}}>
												<span
													style={{
														color: r.color,
														fontWeight: 700,
														fontSize: "0.85rem",
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
													fontSize: "0.6rem",
													color: "#f7f7f7ff",
													background: "#060d12",
													padding: "2px 7px",
													borderRadius: 4,
													display: "inline-block",
													marginBottom: 6,
												}}>
												{r.path}
											</div>
										</div>
									</div>
									<p
										style={{
											color: "#ffffffff",
											fontSize: "0.76rem",
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
										<span style={{ color: r.color, fontSize: "0.75rem" }}>
											💡
										</span>
										<span
											style={{
												color: "#f5f5f5ff",
												fontSize: "0.73rem",
												lineHeight: 1.5,
											}}>
											{r.benefit}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* ── TIPS TAB ── */}
				{tab === "tips" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						<div
							style={{
								background: "#0b1820",
								border: "1px solid #0f2030",
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
							}}>
							<SecHead>
								💡 Tips Spesifik untuk Kontraktor — Agar Procurement ERPNext
								Optimal
							</SecHead>
							<p style={{ color: "#2a4560", fontSize: "0.81rem", margin: 0 }}>
								Insight dari pengalaman implementasi di perusahaan konstruksi —
								hal-hal yang sering terlewat dan membuat sistem tidak memberikan
								manfaat penuh.
							</p>
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
								gap: 12,
							}}>
							{CONTRACTOR_TIPS.map((cat, i) => (
								<div
									key={i}
									style={{
										background: "#0b1820",
										border: `1px solid ${cat.color}22`,
										borderRadius: 10,
										padding: "1rem 1.1rem",
										borderTop: `3px solid ${cat.color}`,
									}}>
									<div
										style={{
											color: cat.color,
											fontWeight: 700,
											fontSize: "0.88rem",
											marginBottom: "0.7rem",
										}}>
										{cat.category}
									</div>
									{cat.tips.map((tip, j) => (
										<div
											key={j}
											style={{
												display: "flex",
												gap: 8,
												marginBottom: 8,
												padding: "0.55rem 0.75rem",
												background: "#060d12",
												borderRadius: 7,
											}}>
											<span
												style={{
													color: cat.color,
													fontSize: "0.65rem",
													paddingTop: 3,
													flexShrink: 0,
												}}>
												▸
											</span>
											<span
												style={{
													color: "#ffffffff",
													fontSize: "0.77rem",
													lineHeight: 1.6,
												}}>
												{tip}
											</span>
										</div>
									))}
								</div>
							))}
						</div>

						{/* Common mistakes */}
						<div
							style={{
								background: "#0b1820",
								border: "1px solid #ef444428",
								borderRadius: 10,
								padding: "1.1rem 1.2rem",
							}}>
							<SecHead>🚫 Kesalahan Umum yang Harus Dihindari</SecHead>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
									gap: 9,
								}}>
								{[
									{
										mistake: "Beli material tanpa MR dan PO",
										impact:
											"Tidak ada budget control, tidak ada dokumen untuk audit, biaya tidak masuk ke project costing",
										color: "#ef4444",
									},
									{
										mistake: "PO tidak di-link ke Project",
										impact:
											"Biaya material tidak masuk ke Project Costing Report — laporan keuangan proyek akan lebih kecil dari kenyataan",
										color: "#ef4444",
									},
									{
										mistake: "GRN dibuat sebelum material datang",
										impact:
											"Stok fiktif di sistem, potensi fraud, laporan inventory tidak akurat",
										color: "#ef4444",
									},
									{
										mistake: "Satu supplier tanpa kompetisi",
										impact:
											"Harga tidak kompetitif, tidak ada dokumentasi justifikasi pemilihan, rentan audit temuan",
										color: "#f97316",
									},
									{
										mistake: "Tidak update Item Master sebelum go-live",
										impact:
											"Kode item tidak standar, double entry, laporan material tidak bisa di-analisis dengan benar",
										color: "#f97316",
									},
									{
										mistake: "Mengabaikan Supplier Scorecard",
										impact:
											"Tidak ada data historis untuk evaluasi vendor — keputusan supplier berikutnya tidak berbasis data",
										color: "#f59e0b",
									},
								].map((m, i) => (
									<div
										key={i}
										style={{
											background: "#060d12",
											borderRadius: 8,
											padding: "0.85rem",
											borderLeft: `3px solid ${m.color}`,
										}}>
										<div
											style={{
												display: "flex",
												gap: 6,
												alignItems: "flex-start",
												marginBottom: 5,
											}}>
											<span style={{ fontSize: "0.8rem" }}>❌</span>
											<span
												style={{
													color: "#e8f4ff",
													fontWeight: 700,
													fontSize: "0.78rem",
												}}>
												{m.mistake}
											</span>
										</div>
										<div
											style={{
												color: "#2a4560",
												fontSize: "0.73rem",
												lineHeight: 1.55,
											}}>
											Dampak: {m.impact}
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
