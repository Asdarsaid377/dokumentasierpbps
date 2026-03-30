import { useState } from "react";

const MONO = "'Courier New', monospace";
const SERIF = "'Georgia', serif";

const MODULES = [
	{
		id: "coa",
		icon: "🗂️",
		label: "Chart of Accounts (CoA)",
		color: "#f59e0b",
		short: "Struktur akun keuangan perusahaan kontraktor",
		desc: "Chart of Accounts adalah tulang punggung seluruh sistem keuangan. Untuk perusahaan kontraktor, CoA harus dirancang khusus agar bisa memisahkan biaya per proyek, melacak pendapatan per kontrak, dan menghasilkan laporan keuangan yang sesuai standar industri konstruksi Indonesia.",
		howto: [
			{
				step: "Rancang struktur CoA sesuai bisnis konstruksi",
				detail:
					"ERPNext punya template CoA default — tapi untuk kontraktor, perlu kustomisasi signifikan. Minimal harus ada: akun pendapatan per proyek, akun HPP (Material/Upah/Alat/Overhead), akun retensi, akun jaminan, akun progress billing.",
			},
			{
				step: "Buat grup akun Pendapatan Proyek",
				detail:
					"Assets → Income → buat sub-akun: Pendapatan Proyek Sipil / Pendapatan Proyek Mekanikal / Pendapatan Proyek Elektrikal / Pendapatan Proyek EPC. Pemisahan ini memungkinkan analisis margin per segmen bisnis.",
			},
			{
				step: "Setup akun HPP yang detail",
				detail:
					"Cost of Goods Sold → buat sub-akun: HPP Material / HPP Upah Langsung / HPP Sewa Alat / HPP Subkontraktor / HPP Overhead Lapangan. Ini dasar laporan Gross Margin per proyek.",
			},
			{
				step: "Buat akun Balance Sheet khusus konstruksi",
				detail:
					"Tambahkan akun: Piutang Retensi (Owner), Hutang Retensi (Subkon), Uang Muka Diterima (dari owner), Uang Muka Dibayar (ke subkon), Jaminan Pelaksanaan Diterima, Progress Billing Unbilled.",
			},
			{
				step: "Setup akun Biaya Overhead Kantor",
				detail:
					"Expenses → buat sub-akun overhead: Gaji Staf Kantor, Biaya Kendaraan, Sewa Kantor, Listrik/Air, Asuransi Perusahaan, Biaya Marketing/Tender, Depresiasi Aset.",
			},
			{
				step: "Map setiap akun ke tipe yang benar",
				detail:
					"Pastikan setiap akun di-set dengan Account Type yang tepat: Receivable (piutang), Payable (hutang), Bank, Cash, Stock, dll. Account Type menentukan bagaimana akun muncul di laporan keuangan.",
			},
		],
		config: [
			{
				field: "Account Type",
				value:
					"Receivable untuk semua piutang, Payable untuk semua hutang, Income untuk pendapatan, Expense untuk biaya — jangan salah set karena ini menentukan posisi di Balance Sheet",
			},
			{
				field: "Cost Center Required",
				value:
					"Set 'Is Cost Center Required' = Yes untuk semua akun biaya dan pendapatan — memaksa setiap transaksi harus specify cost center (proyek)",
			},
			{
				field: "Root Type",
				value:
					"Asset / Liability / Equity / Income / Expense — pastikan setiap akun masuk root type yang benar untuk laporan Balance Sheet dan P&L yang akurat",
			},
			{
				field: "Inter Company Account",
				value:
					"Jika grup perusahaan punya entitas multiple, setup inter-company accounts untuk transaksi antar entitas",
			},
		],
		warning:
			"CoA yang tidak dirancang dengan baik di awal sangat sulit diubah setelah ada ribuan transaksi. Investasikan 1-2 minggu bersama akuntan berpengalaman di industri konstruksi untuk merancang CoA yang tepat sebelum go-live.",
	},
	{
		id: "costcenter",
		icon: "🏗️",
		label: "Cost Center per Proyek",
		color: "#38bdf8",
		short: "Pemisahan keuangan per proyek konstruksi",
		desc: "Cost Center adalah fitur terpenting ERPNext untuk kontraktor. Dengan Cost Center per proyek, setiap biaya dan pendapatan bisa dilacak per proyek secara terpisah — ini yang memungkinkan laporan laba/rugi per proyek yang akurat.",
		howto: [
			{
				step: "Buat hierarki Cost Center yang logis",
				detail:
					"Accounting → Cost Center → buat struktur: Perusahaan → Divisi Proyek → Proyek Individual. Contoh: PT ABC → Divisi Konstruksi → Proyek Gedung XYZ 2024 / Proyek Jalan ABC 2024.",
			},
			{
				step: "Buat Cost Center baru untuk setiap proyek",
				detail:
					"Setiap proyek baru = Cost Center baru. Nama harus sama dengan Project Name di modul Project. Set Parent = Divisi yang relevan. Set Company = entitas yang mengerjakan proyek.",
			},
			{
				step: "Wajibkan Cost Center di semua transaksi biaya",
				detail:
					"Customize Form → di Purchase Invoice, Journal Entry, Expense Claim, Payroll Entry — set field Cost Center sebagai Mandatory. Tidak ada transaksi biaya yang boleh lolos tanpa Cost Center.",
			},
			{
				step: "Setup Cost Center untuk overhead kantor",
				detail:
					"Buat Cost Center terpisah untuk overhead: 'Overhead Perusahaan', 'HO Marketing', 'HO Keuangan'. Biaya overhead dialokasikan ke proyek secara manual di akhir bulan lewat Journal Entry alokasi.",
			},
			{
				step: "Review Cost Center P&L Report bulanan",
				detail:
					"Accounting → Reports → Profit & Loss Statement → filter by Cost Center (pilih proyek tertentu). Ini laporan laba-rugi per proyek — PM dan Direktur wajib review setiap bulan.",
			},
		],
		config: [
			{
				field: "Cost Center Tree",
				value:
					"All Cost Centers → [Company] → Overhead → Proyek Aktif (per proyek) → Proyek Selesai (arsip). Hierarki ini memungkinkan roll-up reporting.",
			},
			{
				field: "Cost Center in Payroll",
				value:
					"Staf yang assign ke proyek → set Cost Center di Employee master → gaji otomatis masuk ke proyek. Untuk staf multi-proyek, split manual via Journal Entry.",
			},
			{
				field: "Budget per Cost Center",
				value:
					"Set budget RAB di Accounting → Budget → per Cost Center proyek. Sistem block atau warn jika transaksi melebihi budget.",
			},
		],
		warning:
			"Setelah proyek selesai, jangan hapus Cost Center — set Is Group = No dan tandai sebagai 'Completed'. Data historis laporan keuangan proyek harus tetap bisa diakses untuk audit, klaim, dan referensi di masa depan.",
	},
	{
		id: "ar",
		icon: "💵",
		label: "Accounts Receivable (AR)",
		color: "#34d399",
		short: "Piutang tagihan termin ke owner",
		desc: "Accounts Receivable mengelola semua piutang dari owner — invoice termin yang sudah dikirim tapi belum dibayar. Untuk kontraktor, AR sangat kritis karena arus kas sangat bergantung pada kecepatan pembayaran owner. Keterlambatan bayar owner = proyek bisa mandek.",
		howto: [
			{
				step: "Buat Sales Invoice setelah BAO approved",
				detail:
					"Setelah Berita Acara Opname (BAO) ditandatangani kedua pihak, buat Sales Invoice: Billing → Sales Invoice → New. Pilih Customer (owner), link ke Project, isi amount sesuai nilai BAO. Lampirkan PDF BAO sebagai dokumen pendukung.",
			},
			{
				step: "Struktur invoice dengan line item yang jelas",
				detail:
					"Buat line item terpisah di invoice: Nilai Progress Termin (nilai bruto), Potongan Uang Muka (-), Potongan Retensi (-). Ini memudahkan owner untuk review dan approve pembayaran lebih cepat.",
			},
			{
				step: "Set Payment Terms sesuai kontrak",
				detail:
					"Di Sales Invoice, pilih Payment Terms sesuai kontrak (misal: Net 30 dari tanggal invoice). ERPNext otomatis hitung Due Date. Ini yang akan muncul di aging report.",
			},
			{
				step: "Kirim invoice resmi ke owner",
				detail:
					"Print atau kirim PDF invoice via email langsung dari ERPNext. Catat tanggal pengiriman invoice — ini yang menentukan kapan due date mulai dihitung.",
			},
			{
				step: "Monitor AR Aging setiap minggu",
				detail:
					"Accounting → Accounts Receivable → Accounts Receivable Summary. Filter per Customer (owner). Lihat invoice mana yang sudah due, berapa hari terlambat, dan total outstanding per proyek.",
			},
			{
				step: "Input pembayaran saat terima transfer",
				detail:
					"Saat owner transfer, buat Payment Entry: Accounts → Payment Entry → New. Pilih Payment Type = Receive, pilih Party (owner), pilih Invoice yang dibayar, isi jumlah dan referensi transfer. Submit → piutang berkurang, kas bertambah.",
			},
		],
		config: [
			{
				field: "Debtors Account",
				value:
					"Buat akun piutang terpisah: 'Piutang Usaha - Kontrak' dan 'Piutang Retensi'. Memisahkan piutang aktif dari piutang retensi yang belum jatuh tempo.",
			},
			{
				field: "Credit Limit per Customer",
				value:
					"Set credit limit per owner — kontrol berapa besar total piutang yang boleh outstanding ke satu owner. Alert jika mendekati limit.",
			},
			{
				field: "Dunning (Surat Tagihan)",
				detail:
					"ERPNext punya fitur Dunning untuk kirim surat tagihan otomatis ke owner yang terlambat bayar — set timeline: 7 hari, 14 hari, 30 hari setelah due date",
			},
		],
		warning:
			"Invoice retensi harus dibuat sebagai invoice terpisah dengan Payment Term yang sesuai masa pemeliharaan. Jangan gabungkan piutang retensi dengan piutang termin biasa karena memiliki jatuh tempo yang sangat berbeda.",
	},
	{
		id: "ap",
		icon: "💳",
		label: "Accounts Payable (AP)",
		color: "#f472b6",
		short: "Hutang ke supplier, subkon & vendor",
		desc: "Accounts Payable mengelola semua hutang perusahaan — ke supplier material, subkontraktor, vendor sewa alat, dan pihak lainnya. Manajemen AP yang baik memastikan pembayaran tepat waktu (menjaga kepercayaan supplier) tanpa menguras kas di saat yang salah.",
		howto: [
			{
				step: "Purchase Invoice otomatis masuk ke AP",
				detail:
					"Setiap Purchase Invoice yang di-submit otomatis menciptakan hutang (AP) ke supplier. Tidak perlu entri manual — ini hasil integrasi modul Procurement dengan Accounting.",
			},
			{
				step: "Review AP Aging setiap Jumat",
				detail:
					"Accounting → Accounts Payable → Accounts Payable Summary. Tampilkan semua hutang per supplier dengan aging: 0-30 hari, 31-60 hari, 61-90 hari, >90 hari. Hutang yang mendekati due date harus dijadwalkan untuk dibayar.",
			},
			{
				step: "Buat Payment Plan mingguan",
				detail:
					"Finance Officer membuat rencana pembayaran minggu ini: list semua invoice yang due dalam 7 hari ke depan, total amount, dan pastikan saldo kas cukup. Jika tidak cukup, prioritaskan pembayaran supplier material kritis.",
			},
			{
				step: "Proses pembayaran via Payment Entry",
				detail:
					"Accounts → Payment Entry → New. Payment Type = Pay, Party Type = Supplier, pilih supplier, pilih invoice yang akan dibayar (bisa bayar beberapa invoice sekaligus ke satu supplier), isi Bank Account, referensi transfer. Submit.",
			},
			{
				step: "Handle retensi subkon di AP",
				detail:
					"Saat bayar subkon dengan potongan retensi: di Payment Entry, isi jumlah bersih (setelah retensi). Buat Journal Entry terpisah untuk mencatat retensi yang ditahan ke akun 'Hutang Retensi Subkon'.",
			},
			{
				step: "Rekonsiliasi AP dengan laporan bank",
				detail:
					"Setiap akhir bulan, rekonsiliasi total AP di sistem dengan mutasi pembayaran di rekening bank. Setiap payment entry harus ada pasangannya di mutasi bank.",
			},
		],
		config: [
			{
				field: "Creditors Account",
				value:
					"Pisahkan akun hutang: 'Hutang Supplier Material', 'Hutang Subkontraktor', 'Hutang Retensi Subkon', 'Hutang Sewa Alat'. Pemisahan ini memudahkan analisis komposisi hutang.",
			},
			{
				field: "Payment Terms",
				value:
					"Set default payment terms di Supplier Master — otomatis terisi di PO dan Invoice. Ini yang menentukan kapan hutang jatuh tempo di AP Aging.",
			},
			{
				field: "Block Payment jika Invoice Dispute",
				detail:
					"Gunakan fitur 'On Hold' di Purchase Invoice jika ada dispute dengan supplier. Hutang tercatat tapi tidak akan jatuh tempo sampai dispute diselesaikan.",
			},
		],
		warning:
			"Jangan terlambat bayar supplier material kritis (semen, besi, ready mix). Supplier yang tidak dibayar tepat waktu akan stop pengiriman — proyek mandek — denda keterlambatan dari owner. Cost of late payment jauh lebih mahal dari bunga pinjaman.",
	},
	{
		id: "je",
		icon: "📓",
		label: "Journal Entry & Akuntansi Proyek",
		color: "#a78bfa",
		short: "Pencatatan manual & alokasi biaya",
		desc: "Journal Entry (JE) digunakan untuk transaksi yang tidak bisa di-capture lewat dokumen transaksi biasa — alokasi biaya overhead ke proyek, pencatatan retensi, koreksi kesalahan, dan transaksi akuntansi khusus. Di kontraktor, JE paling sering dipakai untuk alokasi overhead dan penyesuaian akhir bulan.",
		howto: [
			{
				step: "Alokasi biaya overhead ke proyek (bulan-end)",
				detail:
					"Setiap akhir bulan, biaya overhead kantor (gaji HO, sewa kantor, listrik) dialokasikan ke proyek berdasarkan formula — bisa berdasarkan % nilai kontrak atau % revenue bulan itu. Buat JE: Debit akun overhead proyek (per CC proyek), Credit akun overhead kantor.",
			},
			{
				step: "Pencatatan Uang Muka dari Owner",
				detail:
					"Saat terima DP dari owner: JE Debit Bank → Credit 'Uang Muka Diterima' (Liability). Akun ini akan di-debit secara bertahap saat termin mulai dipotong DP dari invoice.",
			},
			{
				step: "Pencatatan Retensi yang Ditahan",
				detail:
					"Saat bayar subkon dengan potongan retensi: JE Debit 'Hutang Subkon' → Credit 'Hutang Retensi Subkon' (untuk porsi yang ditahan). Saat retensi cair: Debit 'Hutang Retensi Subkon' → Credit Bank.",
			},
			{
				step: "Koreksi kesalahan Cost Center",
				detail:
					"Jika ada biaya yang salah masuk ke Cost Center proyek yang salah: buat JE koreksi — Debit akun biaya di CC yang benar, Credit akun biaya di CC yang salah. Isi remark dengan penjelasan koreksi.",
			},
			{
				step: "Depresiasi alat berat bulanan",
				detail:
					"ERPNext bisa otomatis buat JE depresiasi jika alat terdaftar di Asset Module dengan depreciation schedule. Set Method = Straight Line, nilai alat, masa manfaat — ERPNext buat JE depresiasi setiap bulan.",
			},
			{
				step: "Accrual biaya yang belum di-invoice",
				detail:
					"Akhir bulan: jika ada pekerjaan yang sudah dilakukan supplier tapi invoice belum datang, buat accrual JE — Debit Expense, Credit Accrued Liability. Ini memastikan laporan P&L bulan ini akurat.",
			},
		],
		config: [
			{
				field: "Journal Entry Type",
				value:
					"Journal Entry (umum) / Opening Entry (saldo awal) / Depreciation Entry / Bank Entry / Cash Entry / Credit Card Entry / Contra Entry / Excise Entry",
			},
			{
				field: "Narration",
				value:
					"Selalu isi narasi/remark yang detail di setiap JE — minimal: tanggal, proyek, alasan. Ini yang akan dibaca auditor dan Finance Manager saat review",
			},
			{
				field: "Difference Account",
				value:
					"Jika ada selisih kecil di JE karena pembulatan, masukkan ke akun 'Selisih Pembulatan' bukan di-force ke akun lain",
			},
		],
		warning: null,
	},
	{
		id: "cashflow",
		icon: "💧",
		label: "Cash Flow & Treasury",
		color: "#22d3ee",
		short: "Manajemen arus kas proyek & perusahaan",
		desc: "Cash flow adalah nadi perusahaan kontraktor. Kontraktor bisa untung secara akrual tapi bangkrut karena cash — bayar material dan gaji duluan sebelum terima pembayaran dari owner. ERPNext membantu memonitor dan memproyeksikan cash flow agar tidak pernah kekurangan likuiditas.",
		howto: [
			{
				step: "Monitor Cash Flow Statement real-time",
				detail:
					"Accounting → Reports → Cash Flow Statement. Tampilkan arus kas masuk (penerimaan dari owner) dan arus kas keluar (pembayaran supplier, subkon, gaji) untuk periode tertentu. Update setiap ada payment entry.",
			},
			{
				step: "Buat Cash Flow Projection manual per proyek",
				detail:
					"Di luar ERPNext (Excel atau custom report), buat proyeksi: jadwal termin dari owner (bulan berapa, berapa nilainya) vs jadwal pembayaran supplier & subkon. Identifikasi bulan defisit yang perlu bridging loan.",
			},
			{
				step: "Setup Bank Accounts di ERPNext",
				detail:
					"Accounting → Bank Account → New. Daftarkan semua rekening bank operasional perusahaan. Set akun Bank yang sesuai di Chart of Accounts untuk setiap rekening.",
			},
			{
				step: "Bank Reconciliation setiap akhir bulan",
				detail:
					"Accounting → Bank Reconciliation Statement. Upload mutasi rekening koran, cocokkan dengan transaksi di ERPNext. Setiap transaksi di rekening koran harus punya pasangan di sistem — tidak boleh ada yang tidak ter-match.",
			},
			{
				step: "Monitor saldo kas real-time",
				detail:
					"Buat Number Card di Dashboard: Total Cash & Bank Balance. Finance Manager bisa lihat posisi kas perusahaan kapan saja tanpa harus run report.",
			},
		],
		config: [
			{
				field: "Payment Reconciliation",
				value:
					"Gunakan Payment Reconciliation Tool untuk match payment yang belum ter-link ke invoice specific — terutama untuk partial payments atau advance payments dari owner",
			},
			{
				field: "Multi-Currency",
				value:
					"Jika ada proyek dengan kontrak USD atau SGD, aktifkan multi-currency. Set exchange rate harian atau weekly untuk revaluation otomatis",
			},
			{
				field: "Bank Integration",
				value:
					"ERPNext bisa integrasi dengan beberapa bank via API untuk auto-import mutasi rekening. Konsultasi dengan implementor untuk setup ini.",
			},
		],
		warning:
			"Kontraktor yang terlambat mengidentifikasi cash deficit biasanya sudah terlambat ketika sadar — harus siapkan bridging facility jauh-jauh hari. Monitor cash flow projection minimal 8 minggu ke depan setiap saat.",
	},
	{
		id: "tax",
		icon: "🏛️",
		label: "Tax Management (PPh & PPN)",
		color: "#f97316",
		short: "PPN, PPh 4(2), PPh 23, PPh 21",
		desc: "Industri konstruksi memiliki kewajiban pajak yang kompleks: PPN atas jasa konstruksi (1.2% untuk SBU kualifikasi besar), PPh Pasal 4 ayat 2 (final) atas jasa konstruksi, PPh 23 untuk jasa tertentu, dan PPh 21 untuk karyawan. ERPNext bisa menghandle semuanya jika dikonfigurasi dengan benar.",
		howto: [
			{
				step: "Setup Tax Category untuk jasa konstruksi",
				detail:
					"Accounts → Tax Category → New. Buat kategori: 'Jasa Konstruksi SBU Besar' (PPN 1.2%, PPh4(2) 2.65%), 'Jasa Konstruksi SBU Kecil' (PPN 1.2%, PPh4(2) 3.5%), dll sesuai regulasi pajak konstruksi terbaru.",
			},
			{
				step: "Buat Tax Rule untuk auto-apply",
				detail:
					"Accounts → Tax Rule → New. Set rule: jika Customer Type = Owner Swasta + Item Category = Jasa Konstruksi → apply Tax Category yang sesuai. Pajak otomatis masuk ke setiap Sales Invoice tanpa harus manual.",
			},
			{
				step: "Input Tax Template di Purchase Invoice",
				detail:
					"Untuk pembelian dari supplier PKP: buat Purchase Tax Template dengan PPN Masukan 11%. Untuk supplier non-PKP atau item bebas PPN: buat template tanpa PPN. Assign ke supplier di Supplier Master.",
			},
			{
				step: "Generate laporan pajak bulanan",
				detail:
					"Setiap akhir bulan: Accounting → Reports → GST/Tax Summary. Export data PPN Keluaran (dari Sales Invoice) dan PPN Masukan (dari Purchase Invoice) untuk rekap SPT Masa PPN. Data ini yang diserahkan ke konsultan pajak.",
			},
			{
				step: "Hitung dan catat PPh 21 karyawan",
				detail:
					"HR & Payroll → Payroll Entry. Saat proses penggajian, sistem otomatis hitung PPh 21 berdasarkan PTKP dan tarif progresif. Hasil perhitungan bisa diekspor untuk rekap SPT Tahunan PPh 21.",
			},
		],
		config: [
			{
				field: "Tax Account Mapping",
				value:
					"PPN Keluaran → akun 'PPN Keluaran' (Liability) | PPN Masukan → akun 'PPN Masukan' (Asset) | PPh 4(2) dipotong → akun 'Hutang PPh 4(2)'",
			},
			{
				field: "Withholding Tax",
				value:
					"ERPNext punya fitur Withholding Tax untuk PPh 23 — set di Supplier master. Saat bayar supplier, sistem otomatis hitung PPh 23 yang harus dipotong dan dibayarkan ke negara.",
			},
			{
				field: "Tax Exemption",
				value:
					"Untuk pekerjaan pemerintah (APBN/APBD), konfigurasikan tax template yang sesuai regulasi — biasanya ada perbedaan tarif dan mekanisme",
			},
		],
		warning:
			"Regulasi pajak konstruksi berubah cukup sering. Pastikan Tax Template di ERPNext selalu diupdate setiap ada perubahan regulasi. Konsultasikan dengan konsultan pajak yang familiar dengan industri konstruksi setidaknya setahun sekali.",
	},
	{
		id: "budget",
		icon: "📊",
		label: "Budget Control & Variance",
		color: "#ec4899",
		short: "Kontrol anggaran RAB vs realisasi",
		desc: "Budget Control di ERPNext memungkinkan perusahaan menetapkan batas pengeluaran per akun per proyek (Cost Center) dan mendapat alert atau block ketika transaksi akan melampaui budget. Ini adalah safety net finansial agar proyek tidak over-budget tanpa disadari.",
		howto: [
			{
				step: "Buat Budget dari nilai RAB",
				detail:
					"Accounting → Budget → New. Pilih Company, Fiscal Year, Budget Against = Cost Center, pilih Cost Center proyek. Isi budget per akun: Material (dari RAB material), Upah (dari RAB upah), Alat, Subkon, Overhead. Submit.",
			},
			{
				step: "Set Budget Exception Action",
				detail:
					"Di Budget, set Action if Annual Budget Exceeded: Stop (block transaksi) atau Warn (beri peringatan tapi tetap boleh lanjut). Rekomendasi: set Warn untuk fleksibilitas operasional, Stop hanya untuk akun yang kritis.",
			},
			{
				step: "Monitor Budget vs Actual secara berkala",
				detail:
					"Accounting → Reports → Budget Variance Report. Filter per Cost Center (proyek). Tampilkan: Budget Amount, Actual Amount, Variance (selisih), % utilization. Review setiap minggu.",
			},
			{
				step: "Update Budget saat ada Change Order",
				detail:
					"Setiap Change Order yang approved → update Budget di sistem sesuai nilai adendum. Budget harus selalu mencerminkan nilai kontrak terkini, bukan hanya nilai awal.",
			},
			{
				step: "Analisis variance yang signifikan",
				detail:
					"Variance > 5% dari budget per akun perlu penjelasan tertulis dari PM. Bisa karena: harga naik dari estimasi, over-konsumsi, scope tambah yang belum di-CO, atau kesalahan Cost Center. Setiap alasan memerlukan tindakan berbeda.",
			},
		],
		config: [
			{
				field: "Budget Against",
				value:
					"Pilih Cost Center (bukan Profit & Loss) agar budget bisa diset per proyek. Ini memungkinkan kontrol anggaran di level proyek individual.",
			},
			{
				field: "Monthly Distribution",
				value:
					"Set distribusi budget per bulan berdasarkan kurva S proyek — budget Januari tidak sama dengan Agustus jika pekerjaan tidak merata. Ini untuk analisis variance yang lebih akurat.",
			},
			{
				field: "Budget Expense Type",
				value:
					"Aktifkan Budget untuk semua tipe transaksi: Purchase Invoice, Journal Entry, Expense Claim — komprehensif budget control",
			},
		],
		warning: null,
	},
	{
		id: "assetmgmt",
		icon: "🚜",
		label: "Fixed Asset & Depreciation",
		color: "#84cc16",
		short: "Alat berat, kendaraan & aset tetap",
		desc: "Fixed Asset Management mengelola semua aset tetap perusahaan kontraktor — alat berat (excavator, crane, truck mixer), kendaraan operasional, komputer, peralatan kantor. ERPNext menghitung depresiasi otomatis dan mengalokasikan biaya depresiasi ke proyek yang menggunakan alat tersebut.",
		howto: [
			{
				step: "Daftarkan semua aset ke Asset Master",
				detail:
					"Accounting → Asset → New. Isi: Asset Name (Excavator Cat 320D - BK1234AB), Item Code, Location, Purchase Date, Gross Purchase Amount, Depreciation Method (Straight Line / Double Declining). Submit → aset terdaftar.",
			},
			{
				step: "Set Depreciation Schedule",
				detail:
					"Di Asset, set: Asset Category (Alat Berat = 8 tahun, Kendaraan = 4 tahun, Komputer = 4 tahun), Depreciation Method, Expected Value After Useful Life (nilai residu). ERPNext auto-generate jadwal depresiasi bulanan.",
			},
			{
				step: "Submit Depreciation Journal Entry bulanan",
				detail:
					"Accounting → Asset → Asset Depreciation Ledger → klik 'Depreciate'. ERPNext buat JE otomatis: Debit 'Biaya Depresiasi', Credit 'Akumulasi Depresiasi'. Bisa di-schedule agar berjalan otomatis setiap tanggal 1.",
			},
			{
				step: "Alokasikan biaya alat ke proyek",
				detail:
					"Untuk alat yang digunakan di proyek tertentu, buat Asset Movement atau Stock Entry dengan link ke Project. Biaya depresiasi periode tersebut dialokasikan ke Cost Center proyek yang memakai alat.",
			},
			{
				step: "Asset Disposal saat jual/scrap alat",
				detail:
					"Saat alat dijual atau di-scrap: Accounting → Asset → Make → Asset Sale/Scrap. ERPNext hitung gain/loss dari penjualan (harga jual - nilai buku). JE disposal dibuat otomatis.",
			},
		],
		config: [
			{
				field: "Asset Category",
				value:
					"Buat kategori sesuai jenis aset kontraktor: Alat Berat Besar (8-10 tahun), Alat Berat Kecil (5 tahun), Kendaraan Operasional (4-5 tahun), Komputer & IT (4 tahun), Peralatan Kantor (5 tahun)",
			},
			{
				field: "Depreciation to Project",
				value:
					"Untuk alat yang 100% dipakai di satu proyek, set Cost Center proyek di Asset. Depresiasi bulanan otomatis masuk ke biaya proyek.",
			},
			{
				field: "Asset Maintenance",
				value:
					"ERPNext punya Asset Maintenance module — schedule preventive maintenance, catat biaya servis, histori perbaikan. Link ke Cost Center proyek untuk alokasi biaya maintenance.",
			},
		],
		warning: null,
	},
];

const REPORTS = [
	{
		name: "Profit & Loss per Proyek",
		path: "Accounting → Reports → Profit and Loss Statement → filter by Cost Center",
		color: "#f59e0b",
		freq: "Bulanan",
		critical: true,
		use: "Laporan Laba Rugi per proyek individual. Tampilkan: Pendapatan (dari Sales Invoice), HPP (Material+Upah+Alat+Subkon), Gross Profit, Overhead allocated, Net Profit per proyek.",
		benefit:
			"Mengetahui proyek mana yang benar-benar untung dan mana yang merugi. Dasar keputusan strategis: jenis proyek apa yang harus lebih dikejar, dan mana yang harus dihindari.",
	},
	{
		name: "Balance Sheet",
		path: "Accounting → Reports → Balance Sheet",
		color: "#38bdf8",
		freq: "Bulanan",
		critical: true,
		use: "Posisi keuangan perusahaan: Aset (kas, piutang, inventory, aset tetap), Liabilitas (hutang supplier, hutang bank, UM diterima), dan Ekuitas. Benchmark kondisi finansial perusahaan.",
		benefit:
			"Dibutuhkan untuk pengajuan kredit bank, dokumen tender pemerintah (LPSE), dan evaluasi kesehatan finansial oleh direksi dan pemegang saham.",
	},
	{
		name: "Cash Flow Statement",
		path: "Accounting → Reports → Cash Flow",
		color: "#22d3ee",
		freq: "Mingguan",
		critical: true,
		use: "Arus kas masuk dan keluar: operasional (penerimaan termin, bayar supplier), investasi (beli alat), pendanaan (pinjaman bank). Bedakan profit akrual dengan kondisi kas riil.",
		benefit:
			"Mencegah krisis likuiditas. Banyak kontraktor yang 'untung di atas kertas' tapi bangkrut karena cash. Ini laporan paling penting untuk CFO.",
	},
	{
		name: "Accounts Receivable Aging",
		path: "Accounting → Accounts Receivable → Summary",
		color: "#34d399",
		freq: "Mingguan",
		critical: true,
		use: "Piutang owner yang outstanding per aging bucket: 0-30 hari, 31-60 hari, 61-90 hari, >90 hari. Filter per proyek atau per owner. Identifikasi piutang yang sudah overdue.",
		benefit:
			"Input langsung untuk collection action. Owner yang terlambat bayar >30 hari dari due date perlu surat tagihan formal. Owner yang >90 hari perlu eskalasi ke Direktur.",
	},
	{
		name: "Accounts Payable Aging",
		path: "Accounting → Accounts Payable → Summary",
		color: "#f472b6",
		freq: "Mingguan",
		critical: true,
		use: "Hutang ke supplier/subkon yang outstanding per aging. Identifikasi mana yang sudah due dan harus segera dibayar agar supply tidak terhenti.",
		benefit:
			"Payment planning yang proaktif — Finance tidak reaktif menunggu supplier marah, tapi sudah punya jadwal bayar yang terencana setiap minggu.",
	},
	{
		name: "Budget Variance Report",
		path: "Accounting → Reports → Budget Variance Report",
		color: "#ec4899",
		freq: "Mingguan",
		critical: false,
		use: "Perbandingan budget RAB vs pengeluaran aktual per akun per proyek (Cost Center). Tampilkan selisih dan % utilization. Highlight akun yang sudah >80% atau >100% dari budget.",
		benefit:
			"Early warning system untuk biaya proyek. PM yang rutin review ini tidak akan kaget dengan over-budget di akhir proyek karena sudah tahu dan take action dari awal.",
	},
	{
		name: "Project Profitability Report",
		path: "Project → Reports → Project Costing (kombinasi dengan P&L per CC)",
		color: "#a78bfa",
		freq: "Bulanan",
		critical: false,
		use: "Profitabilitas per proyek: Nilai Kontrak vs Total Biaya Aktual vs Estimasi Biaya Akhir. Kalkulasi Gross Margin per proyek dan bandingkan dengan target margin saat tender.",
		benefit:
			"Evaluasi apakah estimasi RAB saat tender akurat. Proyek yang margin aktualnya jauh di bawah estimasi perlu post-mortem analisis untuk perbaikan estimasi di tender berikutnya.",
	},
	{
		name: "Trial Balance",
		path: "Accounting → Reports → Trial Balance",
		color: "#f97316",
		freq: "Bulanan",
		critical: false,
		use: "Saldo debit dan kredit semua akun pada tanggal tertentu. Verifikasi bahwa total debit = total kredit (seimbang). Dasar pembuatan laporan keuangan formal.",
		benefit:
			"Verifikasi integritas data akuntansi sebelum tutup buku bulanan. Jika trial balance tidak balance, ada kesalahan input yang harus ditemukan dan dikoreksi.",
	},
	{
		name: "General Ledger",
		path: "Accounting → Reports → General Ledger",
		color: "#84cc16",
		freq: "Per Kebutuhan",
		critical: false,
		use: "Semua transaksi per akun dalam periode tertentu dengan saldo berjalan. Filter per akun atau per Cost Center untuk melihat detail semua transaksi yang membentuk saldo akun tersebut.",
		benefit:
			"Drill-down investigasi: ketika ada saldo akun yang aneh, General Ledger menunjukkan setiap transaksi penyusunnya — sangat berguna saat audit dan koreksi kesalahan.",
	},
	{
		name: "Tax Summary (PPN & PPh)",
		path: "Accounting → Reports → GST Summary / Tax Withholding Summary",
		color: "#38bdf8",
		freq: "Bulanan",
		critical: false,
		use: "Rekap PPN Keluaran, PPN Masukan, PPh 23 yang dipotong, PPh 4(2) final per bulan. Dasar pengisian SPT Masa PPN dan SSP PPh.",
		benefit:
			"Kepatuhan pajak yang terdokumentasi dengan baik — mengurangi risiko pemeriksaan pajak dan denda. Konsultan pajak akan lebih mudah bekerja dengan data yang sudah terstruktur dari ERPNext.",
	},
];

const COA_STRUCTURE = [
	{
		group: "ASET (Assets)",
		color: "#38bdf8",
		accounts: [
			{
				code: "1-1110",
				name: "Kas",
				type: "Cash",
				note: "Petty cash di kantor dan site",
			},
			{
				code: "1-1120",
				name: "Bank BCA - Rekening Operasional",
				type: "Bank",
				note: "Rekening utama operasional",
			},
			{
				code: "1-1210",
				name: "Piutang Usaha - Kontrak",
				type: "Receivable",
				note: "Tagihan termin ke owner belum dibayar",
			},
			{
				code: "1-1220",
				name: "Piutang Retensi",
				type: "Receivable",
				note: "Retensi yang belum bisa ditagih",
			},
			{
				code: "1-1310",
				name: "Persediaan Material - Gudang Pusat",
				type: "Stock",
				note: "Nilai material di gudang pusat",
			},
			{
				code: "1-1320",
				name: "Persediaan Material - Site",
				type: "Stock",
				note: "Nilai material di semua site proyek",
			},
			{
				code: "1-1410",
				name: "Uang Muka Dibayar ke Subkon",
				type: "Asset",
				note: "DP ke subkon yang belum dipotong",
			},
			{
				code: "1-2110",
				name: "Alat Berat (Nilai Perolehan)",
				type: "Fixed Asset",
				note: "Excavator, Crane, dll",
			},
			{
				code: "1-2120",
				name: "Akumulasi Depresiasi - Alat Berat",
				type: "Accumulated Depreciation",
				note: "Contra asset — nilai negatif",
			},
		],
	},
	{
		group: "LIABILITAS (Liabilities)",
		color: "#f472b6",
		accounts: [
			{
				code: "2-1110",
				name: "Hutang Usaha - Supplier Material",
				type: "Payable",
				note: "AP ke supplier material",
			},
			{
				code: "2-1120",
				name: "Hutang Subkontraktor",
				type: "Payable",
				note: "AP ke subkon atas pekerjaan selesai",
			},
			{
				code: "2-1130",
				name: "Hutang Retensi Subkon",
				type: "Payable",
				note: "Retensi yang ditahan dari subkon",
			},
			{
				code: "2-1210",
				name: "Uang Muka Diterima dari Owner",
				type: "Liability",
				note: "DP dari owner yang belum di-offset",
			},
			{
				code: "2-1310",
				name: "Hutang PPN Keluaran",
				type: "Tax",
				note: "PPN yang harus disetor ke negara",
			},
			{
				code: "2-1320",
				name: "Hutang PPh Pasal 4(2)",
				type: "Tax",
				note: "PPh final jasa konstruksi",
			},
			{
				code: "2-1330",
				name: "Hutang PPh 21 Karyawan",
				type: "Tax",
				note: "PPh 21 dari penggajian",
			},
			{
				code: "2-2110",
				name: "Hutang Bank Jangka Panjang",
				type: "Liability",
				note: "Kredit investasi alat berat dll",
			},
		],
	},
	{
		group: "PENDAPATAN (Income)",
		color: "#34d399",
		accounts: [
			{
				code: "4-1110",
				name: "Pendapatan Jasa Konstruksi - Gedung",
				type: "Income",
				note: "Revenue dari kontrak gedung",
			},
			{
				code: "4-1120",
				name: "Pendapatan Jasa Konstruksi - Infrastruktur",
				type: "Income",
				note: "Jalan, jembatan, utilitas",
			},
			{
				code: "4-1130",
				name: "Pendapatan Jasa Konstruksi - M/E",
				type: "Income",
				note: "Mekanikal elektrikal",
			},
			{
				code: "4-1210",
				name: "Pendapatan Variasi / Change Order",
				type: "Income",
				note: "Pekerjaan tambah dari CO/adendum",
			},
		],
	},
	{
		group: "HPP / COGS",
		color: "#f59e0b",
		accounts: [
			{
				code: "5-1110",
				name: "HPP Material Langsung",
				type: "Cost of Goods Sold",
				note: "Biaya material yang dipakai di proyek",
			},
			{
				code: "5-1120",
				name: "HPP Upah Langsung",
				type: "Cost of Goods Sold",
				note: "Mandor, tukang, pekerja harian",
			},
			{
				code: "5-1130",
				name: "HPP Sewa / Depresiasi Alat",
				type: "Cost of Goods Sold",
				note: "Biaya alat yang dipakai di proyek",
			},
			{
				code: "5-1140",
				name: "HPP Biaya Subkontraktor",
				type: "Cost of Goods Sold",
				note: "Tagihan subkon atas pekerjaan selesai",
			},
			{
				code: "5-1150",
				name: "HPP Overhead Lapangan",
				type: "Cost of Goods Sold",
				note: "Listrik site, air, K3, dll",
			},
		],
	},
	{
		group: "BIAYA OPERASIONAL (Expenses)",
		color: "#a78bfa",
		accounts: [
			{
				code: "6-1110",
				name: "Gaji Staf Kantor",
				type: "Expense",
				note: "PM, Site Engineer, Admin, Finance",
			},
			{
				code: "6-1120",
				name: "Biaya Kendaraan Operasional",
				type: "Expense",
				note: "BBM, servis kendaraan kantor",
			},
			{
				code: "6-1130",
				name: "Sewa Kantor & Utilitas",
				type: "Expense",
				note: "Sewa, listrik, air, internet kantor",
			},
			{
				code: "6-1140",
				name: "Biaya Marketing & Tender",
				type: "Expense",
				note: "Biaya dokumen tender, presentasi",
			},
			{
				code: "6-1150",
				name: "Asuransi Perusahaan",
				type: "Expense",
				note: "CAR, TL, asuransi aset",
			},
			{
				code: "6-1160",
				name: "Depresiasi Aset Kantor",
				type: "Expense",
				note: "Depresiasi komputer, mebel, dll",
			},
		],
	},
];

const MONTH_END_CHECKLIST = [
	{
		task: "Rekonsiliasi Bank untuk semua rekening",
		priority: "CRITICAL",
		day: "H+1",
		detail:
			"Cocokkan semua payment entry di sistem dengan mutasi rekening koran. Pastikan tidak ada selisih.",
	},
	{
		task: "Submit semua Purchase Invoice pending",
		priority: "CRITICAL",
		day: "H+2",
		detail:
			"Pastikan tidak ada PI yang masih Draft — semua hutang bulan ini harus tercatat sebelum tutup buku.",
	},
	{
		task: "Input Landed Cost Voucher yang tertunda",
		priority: "HIGH",
		day: "H+2",
		detail:
			"Biaya angkut material bulan ini harus masuk ke HPP material agar costing proyek akurat.",
	},
	{
		task: "Posting Depresiasi Aset Tetap",
		priority: "HIGH",
		day: "H+3",
		detail:
			"Run depreciation untuk semua aset tetap. JE depresiasi harus di-submit untuk bulan yang ditutup.",
	},
	{
		task: "Alokasi Overhead Kantor ke Proyek",
		priority: "HIGH",
		day: "H+3",
		detail:
			"Hitung dan buat JE alokasi overhead: Debit akun overhead per CC proyek, Credit akun overhead kantor.",
	},
	{
		task: "Accrual biaya yang belum di-invoice",
		priority: "HIGH",
		day: "H+4",
		detail:
			"Buat accrual JE untuk pekerjaan yang sudah dilakukan tapi invoice belum datang (subkon, supplier).",
	},
	{
		task: "Review & resolve stock valuation errors",
		priority: "MEDIUM",
		day: "H+4",
		detail:
			"Cek Stock Reconciliation — pastikan tidak ada negative stock dan nilai inventory di sistem masuk akal.",
	},
	{
		task: "Generate & review Trial Balance",
		priority: "CRITICAL",
		day: "H+5",
		detail:
			"Pastikan trial balance seimbang. Investigasi setiap akun yang saldonya tidak masuk akal sebelum laporan final.",
	},
	{
		task: "Generate Laporan P&L per Proyek",
		priority: "HIGH",
		day: "H+7",
		detail:
			"Generate P&L per Cost Center. Distribusikan ke PM masing-masing proyek untuk review dan comment.",
	},
	{
		task: "Kirim laporan ke Manajemen & Direksi",
		priority: "HIGH",
		day: "H+10",
		detail:
			"Kirim paket laporan: P&L konsolidasi, Balance Sheet, Cash Flow, AR Aging, AP Aging, Budget Variance.",
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
			color: "#f6f6f6ff",
			letterSpacing: 4,
			textTransform: "uppercase",
			marginBottom: "0.9rem",
		}}>
		{children}
	</div>
);

export default function Keuangan() {
	const [tab, setTab] = useState("coa");
	const [activeModule, setActiveModule] = useState(0);
	const [activeCoaGroup, setActiveCoaGroup] = useState(0);
	const [activeChecklist, setActiveChecklist] = useState(null);
	const mod = MODULES[activeModule];

	return (
		<div
			style={{
				background: "#0d0900",
				minHeight: "100vh",
				color: "#fffefdff",
				fontFamily: SERIF,
			}}>
			{/* HEADER */}
			<div
				style={{
					background: "linear-gradient(160deg, #180f00 0%, #0d0900 100%)",
					borderBottom: "1px solid #2a1800",
					padding: "2rem 1.5rem 1.6rem",
					position: "relative",
					overflow: "hidden",
				}}>
				<div
					style={{
						position: "absolute",
						top: -50,
						right: -50,
						width: 320,
						height: 320,
						borderRadius: "50%",
						background:
							"radial-gradient(circle, #f59e0b10 0%, transparent 70%)",
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
						BUILT-IN FEATURE #4 — DEEP DIVE
					</div>
					<h1
						style={{
							margin: 0,
							fontSize: "clamp(1.4rem, 3vw, 2rem)",
							fontWeight: 700,
							color: "#ffffffff",
							lineHeight: 1.2,
						}}>
						ERPNext Accounting & Finance
					</h1>
					<p
						style={{
							color: "#ffffffff",
							margin: "0.6rem 0 0",
							fontSize: "0.84rem",
							fontFamily: MONO,
						}}>
						CoA · Cost Center · AR · AP · Journal Entry · Cash Flow · Tax ·
						Budget · Aset Tetap
					</p>
				</div>
			</div>

			{/* NAV */}
			<div
				style={{
					borderBottom: "1px solid #2a1800",
					background: "#0d0900",
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
						{ key: "coa", label: "📐 CoA Kontraktor" },
						{ key: "modules", label: "🧩 Fitur & Cara Kerja" },
						{ key: "reports", label: "📊 Reports Keuangan" },
						{ key: "monthend", label: "📅 Month-End Closing" },
					].map((n) => (
						<button
							key={n.key}
							onClick={() => setTab(n.key)}
							style={{
								padding: "0.85rem 1rem",
								background: "none",
								border: "none",
								borderBottom:
									tab === n.key ? "2px solid #f59e0b" : "2px solid transparent",
								color: tab === n.key ? "#f59e0b" : "#faf3e4ff",
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
				{/* COA TAB */}
				{tab === "coa" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						<div
							style={{
								background: "#180f00",
								border: "1px solid #2a1800",
								borderRadius: 10,
								padding: "1rem 1.2rem",
							}}>
							<SecHead>
								📐 Rancangan Chart of Accounts untuk Perusahaan Kontraktor
								Indonesia
							</SecHead>
							<p style={{ color: "#fffcf5ff", fontSize: "0.81rem", margin: 0 }}>
								Struktur akun di bawah ini dirancang khusus untuk kebutuhan
								perusahaan konstruksi — memisahkan pendapatan per segmen, HPP
								per komponen biaya, dan akun-akun spesifik konstruksi seperti
								piutang retensi dan uang muka proyek.
							</p>
						</div>
						<div
							style={{
								display: "flex",
								gap: 6,
								flexWrap: "wrap",
								marginBottom: 4,
							}}>
							{COA_STRUCTURE.map((g, i) => (
								<button
									key={i}
									onClick={() => setActiveCoaGroup(i)}
									style={{
										padding: "0.45rem 0.9rem",
										background:
											activeCoaGroup === i ? g.color + "20" : "#180f00",
										border: `1px solid ${activeCoaGroup === i ? g.color : "#2a1800"}`,
										borderRadius: 6,
										cursor: "pointer",
										color: activeCoaGroup === i ? g.color : "#ffffffff",
										fontFamily: MONO,
										fontSize: "0.65rem",
										fontWeight: 700,
										transition: "all 0.15s",
									}}>
									{g.group.split(" ")[0]}
								</button>
							))}
						</div>
						{(() => {
							const g = COA_STRUCTURE[activeCoaGroup];
							return (
								<div
									style={{
										background: "#180f00",
										border: `1px solid ${g.color}25`,
										borderRadius: 12,
										padding: "1.2rem",
										borderLeft: `4px solid ${g.color}`,
									}}>
									<div
										style={{
											color: g.color,
											fontWeight: 700,
											fontSize: "0.92rem",
											marginBottom: "0.9rem",
										}}>
										{g.group}
									</div>
									<table
										style={{
											width: "100%",
											borderCollapse: "collapse",
											fontSize: "0.75rem",
										}}>
										<thead>
											<tr style={{ background: "#0d0900" }}>
												{[
													"Kode Akun",
													"Nama Akun",
													"Account Type",
													"Keterangan",
												].map((h) => (
													<th
														key={h}
														style={{
															padding: "0.4rem 0.7rem",
															textAlign: "left",
															color: "#f2f2f2ff",
															fontFamily: MONO,
															fontSize: "0.58rem",
															letterSpacing: 2,
															borderBottom: "1px solid #2a1800",
															whiteSpace: "nowrap",
														}}>
														{h}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{g.accounts.map((a, i) => (
												<tr
													key={i}
													style={{ borderBottom: "1px solid #1a1000" }}>
													<td
														style={{
															padding: "0.4rem 0.7rem",
															fontFamily: MONO,
															color: g.color,
															fontSize: "0.7rem",
															whiteSpace: "nowrap",
														}}>
														{a.code}
													</td>
													<td
														style={{
															padding: "0.4rem 0.7rem",
															color: "#dcd5c6ff",
															fontSize: "0.77rem",
															fontWeight: 600,
														}}>
														{a.name}
													</td>
													<td
														style={{
															padding: "0.4rem 0.7rem",
															whiteSpace: "nowrap",
														}}>
														<Tag color={g.color} sm>
															{a.type}
														</Tag>
													</td>
													<td
														style={{
															padding: "0.4rem 0.7rem",
															color: "#f1ece6ff",
															fontSize: "0.72rem",
														}}>
														{a.note}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							);
						})()}
						<div
							style={{
								background: "#180f00",
								border: "1px solid #2a1800",
								borderRadius: 10,
								padding: "1rem 1.2rem",
							}}>
							<SecHead>💡 Prinsip CoA untuk Kontraktor</SecHead>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
									gap: 10,
								}}>
								{[
									{
										tip: "Pisahkan HPP per komponen",
										detail:
											"Material, Upah, Alat, Subkon, dan Overhead lapangan harus akun terpisah — gross margin analysis tidak mungkin tanpa ini",
										color: "#f59e0b",
									},
									{
										tip: "Piutang Retensi ≠ Piutang Biasa",
										detail:
											"Retensi tidak bisa ditagih sampai FHO — harus di akun terpisah agar cash flow projection akurat",
										color: "#38bdf8",
									},
									{
										tip: "UM Diterima adalah Liabilitas",
										detail:
											"Uang Muka dari owner bukan pendapatan — ini liability yang berkurang saat termin berjalan. Jangan masukkan ke pendapatan di awal",
										color: "#34d399",
									},
									{
										tip: "Satu Cost Center per Proyek",
										detail:
											"Ini yang memungkinkan P&L per proyek. Tanpa ini, Accounting tidak bisa pisahkan keuangan per proyek",
										color: "#ec4899",
									},
								].map((p, i) => (
									<div
										key={i}
										style={{
											background: "#0d0900",
											borderRadius: 8,
											padding: "0.85rem",
											borderLeft: `3px solid ${p.color}`,
										}}>
										<div
											style={{
												color: p.color,
												fontWeight: 700,
												fontSize: "0.78rem",
												marginBottom: 4,
											}}>
											{p.tip}
										</div>
										<div
											style={{
												color: "#fbfbfbff",
												fontSize: "0.73rem",
												lineHeight: 1.55,
											}}>
											{p.detail}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* MODULES TAB */}
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
										padding: "0.58rem 0.76rem",
										background: activeModule === i ? m.color + "12" : "#180f00",
										border: `1px solid ${activeModule === i ? m.color + "55" : "#2a1800"}`,
										borderRadius: 8,
										cursor: "pointer",
										transition: "all 0.15s",
									}}>
									<div
										style={{ display: "flex", gap: 7, alignItems: "center" }}>
										<span style={{ fontSize: 14 }}>{m.icon}</span>
										<div>
											<div
												style={{
													color: activeModule === i ? "#fef3d0" : "#ffffffff",
													fontSize: "0.73rem",
													fontWeight: 700,
												}}>
												{m.label}
											</div>
											<div
												style={{
													fontFamily: MONO,
													fontSize: "0.54rem",
													color: activeModule === i ? m.color : "#f7f6f5ff",
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
								background: "#180f00",
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
											color: "#fef3d0",
											fontSize: "1.02rem",
											fontWeight: 700,
										}}>
										{mod.label}
									</h2>
								</div>
							</div>
							<p
								style={{
									color: "#ebe9e7ff",
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
											background: "#0d0900",
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
													color: "#fef3d0",
													fontSize: "0.8rem",
													fontWeight: 700,
													marginBottom: 2,
												}}>
												{h.step}
											</div>
											<div
												style={{
													color: "#fcfcfcff",
													fontSize: "0.75rem",
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
											gridTemplateColumns: "175px 1fr",
											gap: 9,
											padding: "0.45rem 0.78rem",
											background: "#0d0900",
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
												color: "#ffffffff",
												fontSize: "0.73rem",
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
										background: "#ef44440c",
										border: "1px solid #ef444425",
										borderRadius: 8,
										padding: "0.65rem 0.85rem",
										display: "flex",
										gap: 8,
									}}>
									<span>⚠️</span>
									<span
										style={{
											color: "#fca5a5",
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

				{/* REPORTS TAB */}
				{tab === "reports" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						<div
							style={{
								background: "#180f00",
								border: "1px solid #2a1800",
								borderRadius: 10,
								padding: "1rem 1.2rem",
							}}>
							<SecHead>📊 10 Laporan Keuangan Wajib untuk Kontraktor</SecHead>
							<p style={{ color: "#fafafaff", fontSize: "0.8rem", margin: 0 }}>
								Lima laporan bertanda CRITICAL adalah laporan yang harus dilihat
								setiap minggu oleh Finance Manager dan PM. Lima lainnya ditinjau
								bulanan atau sesuai kebutuhan.
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
										background: "#180f00",
										border: `1px solid ${r.color}20`,
										borderRadius: 10,
										padding: "1rem 1.1rem",
										borderLeft: `4px solid ${r.color}`,
										position: "relative",
									}}>
									<div
										style={{
											display: "flex",
											gap: 6,
											alignItems: "flex-start",
											marginBottom: 5,
											flexWrap: "wrap",
										}}>
										<span
											style={{
												color: r.color,
												fontWeight: 700,
												fontSize: "0.84rem",
												flex: 1,
											}}>
											{r.name}
										</span>
										<div style={{ display: "flex", gap: 4 }}>
											<Tag color={r.color} sm>
												{r.freq}
											</Tag>
											{r.critical && (
												<Tag color="#ef4444" sm>
													CRITICAL
												</Tag>
											)}
										</div>
									</div>
									<div
										style={{
											fontFamily: SERIF,
											fontSize: "0.59rem",
											color: "#ffffffff",
											background: "#0d0900",
											padding: "2px 7px",
											borderRadius: 4,
											display: "inline-block",
											marginBottom: 6,
										}}>
										{r.path}
									</div>
									<p
										style={{
											color: "#ffffffff",
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
												color: "#ffffffff",
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

				{/* MONTH-END TAB */}
				{tab === "monthend" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						<div
							style={{
								background: "#180f00",
								border: "1px solid #2a1800",
								borderRadius: 10,
								padding: "1rem 1.2rem",
							}}>
							<SecHead>📅 Month-End Closing Checklist untuk Kontraktor</SecHead>
							<p style={{ color: "#efefefff", fontSize: "0.8rem", margin: 0 }}>
								Tutup buku bulanan harus dilakukan secara sistematis. Checklist
								ini memastikan tidak ada yang terlewat — setiap item harus
								diselesaikan sebelum laporan keuangan final bisa dikirim ke
								manajemen.
							</p>
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
							{MONTH_END_CHECKLIST.map((item, i) => (
								<div
									key={i}
									style={{
										background: "#180f00",
										border: `1px solid ${activeChecklist === i ? "#f59e0b55" : "#2a1800"}`,
										borderRadius: 10,
										overflow: "hidden",
										transition: "border-color 0.2s",
									}}>
									<button
										onClick={() =>
											setActiveChecklist(activeChecklist === i ? null : i)
										}
										style={{
											width: "100%",
											background: "none",
											border: "none",
											padding: "0.8rem 1rem",
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
											gap: 12,
											textAlign: "left",
										}}>
										<div
											style={{
												width: 28,
												height: 28,
												borderRadius: "50%",
												background:
													item.priority === "CRITICAL"
														? "#ef444418"
														: item.priority === "HIGH"
															? "#f59e0b18"
															: "#38bdf818",
												border: `1.5px solid ${item.priority === "CRITICAL" ? "#ef4444" : item.priority === "HIGH" ? "#f59e0b" : "#38bdf8"}50`,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontFamily: MONO,
												fontSize: "0.62rem",
												color:
													item.priority === "CRITICAL"
														? "#ef4444"
														: item.priority === "HIGH"
															? "#f59e0b"
															: "#38bdf8",
												flexShrink: 0,
											}}>
											{String(i + 1).padStart(2, "0")}
										</div>
										<div style={{ flex: 1 }}>
											<div
												style={{
													display: "flex",
													gap: 8,
													alignItems: "center",
													flexWrap: "wrap",
												}}>
												<span
													style={{
														color: "#fef3d0",
														fontWeight: 700,
														fontSize: "0.85rem",
													}}>
													{item.task}
												</span>
												<Tag
													color={
														item.priority === "CRITICAL"
															? "#ef4444"
															: item.priority === "HIGH"
																? "#f59e0b"
																: "#38bdf8"
													}
													sm>
													{item.priority}
												</Tag>
												<Tag color="#a78bfa" sm>
													{item.day}
												</Tag>
											</div>
										</div>
										<span
											style={{
												color: "#f59e0b",
												fontSize: "1.1rem",
												transform:
													activeChecklist === i ? "rotate(90deg)" : "none",
												transition: "transform 0.2s",
												display: "inline-block",
											}}>
											›
										</span>
									</button>
									{activeChecklist === i && (
										<div
											style={{
												borderTop: "1px solid #2a1800",
												padding: "0.7rem 1rem 1rem 3.5rem",
											}}>
											<p
												style={{
													color: "#e8e8e8ff",
													fontSize: "0.79rem",
													lineHeight: 1.7,
													margin: 0,
												}}>
												{item.detail}
											</p>
										</div>
									)}
								</div>
							))}
						</div>
						<div
							style={{
								background: "#180f00",
								border: "1px solid #2a1800",
								borderRadius: 12,
								padding: "1.2rem",
							}}>
							<SecHead>📦 Paket Laporan Bulanan ke Manajemen</SecHead>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
									gap: 10,
								}}>
								{[
									{
										audience: "Project Manager",
										reports: [
											"P&L per Proyek (CC-nya)",
											"Budget Variance per Proyek",
											"AR Outstanding per Proyek",
										],
										color: "#38bdf8",
									},
									{
										audience: "Finance Manager",
										reports: [
											"P&L Konsolidasi",
											"Balance Sheet",
											"Cash Flow",
											"AP Aging",
											"AR Aging",
											"Tax Summary",
										],
										color: "#f59e0b",
									},
									{
										audience: "Direktur / Direksi",
										reports: [
											"Executive P&L Summary semua proyek",
											"Cash Position & Forecast",
											"Project Profitability Ranking",
											"AR Collection Status",
										],
										color: "#34d399",
									},
									{
										audience: "Pemegang Saham",
										reports: [
											"Laporan Keuangan Formal (Q/Semi-Annual)",
											"Balance Sheet",
											"P&L Konsolidasi",
											"Catatan atas Laporan Keuangan",
										],
										color: "#a78bfa",
									},
								].map((p, i) => (
									<div
										key={i}
										style={{
											background: "#0d0900",
											borderRadius: 9,
											padding: "0.9rem",
											borderTop: `3px solid ${p.color}`,
										}}>
										<div
											style={{
												color: p.color,
												fontWeight: 700,
												fontSize: "0.8rem",
												marginBottom: 7,
											}}>
											👤 {p.audience}
										</div>
										{p.reports.map((r, j) => (
											<div
												key={j}
												style={{ display: "flex", gap: 6, marginBottom: 4 }}>
												<span
													style={{
														color: p.color,
														fontSize: "0.62rem",
														paddingTop: 3,
														flexShrink: 0,
													}}>
													▸
												</span>
												<span
													style={{
														color: "#f4f4f4ff",
														fontSize: "0.73rem",
														lineHeight: 1.5,
													}}>
													{r}
												</span>
											</div>
										))}
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
