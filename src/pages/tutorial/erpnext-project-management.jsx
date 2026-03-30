import { useState } from "react";

const MONO = "'Courier New', monospace";
const SERIF = "'Georgia', serif";

// ─── DATA ────────────────────────────────────────────────────────────────────

const MODULES = [
	{
		id: "project",
		icon: "🏗️",
		label: "Project Master",
		color: "#0ea5e9",
		short: "Induk proyek & konfigurasi dasar",
		desc: "Project Master adalah 'container' utama di ERPNext. Semua transaksi — pembelian material, timesheet, biaya — ter-link ke sini. Untuk kontraktor, satu proyek konstruksi = satu Project Master.",
		howto: [
			{
				step: "Buat Project baru",
				detail:
					"Menu: Project → Project → New. Isi Project Name dengan nama kontrak resmi, misal 'Pembangunan Gedung Kantor PT ABC – Paket 2'.",
			},
			{
				step: "Set Project Type",
				detail:
					"Pilih kategori: External (proyek dari klien/owner) atau Internal (proyek internal perusahaan). Proyek konstruksi dari owner = External.",
			},
			{
				step: "Isi Expected Start Date & End Date",
				detail:
					"Tanggal ini jadi acuan kurva S dan monitoring keterlambatan. Gunakan tanggal dari kontrak resmi, bukan estimasi.",
			},
			{
				step: "Set Project Manager",
				detail:
					"Pilih User ERPNext yang menjadi PM. Dia yang akan mendapat notifikasi dan bisa approve transaksi di proyek ini.",
			},
			{
				step: "Hubungkan ke Customer",
				detail:
					"Di field Customer, pilih nama owner/klien dari master Customer ERPNext. Ini penting agar invoice otomatis ter-link ke proyek.",
			},
			{
				step: "Set Estimated Cost (dari RAB)",
				detail:
					"Isi estimated cost dengan nilai total RAB yang sudah diapprove. Field ini jadi acuan % cost utilization.",
			},
			{
				step: "Aktifkan Cost Center per Proyek",
				detail:
					"Buat Cost Center baru khusus proyek ini (Accounting → Cost Center). Semua transaksi proyek wajib pakai Cost Center ini agar laporan keuangan proyek terpisah.",
			},
		],
		config: [
			{
				field: "Project Name",
				value: "Nama kontrak resmi — konsisten dengan dokumen legal",
			},
			{
				field: "Status",
				value:
					"Open saat proyek berjalan, Completed saat selesai, Cancelled jika dibatalkan",
			},
			{
				field: "% Complete Method",
				value:
					"PILIH: Manual — PM update sendiri berdasarkan BAO, bukan otomatis dari task",
			},
			{
				field: "Is Active",
				value: "Centang untuk proyek yang sedang berjalan",
			},
			{
				field: "Cost Center",
				value:
					"WAJIB diisi — satu Cost Center per proyek, jangan gabung dengan proyek lain",
			},
			{
				field: "Department",
				value:
					"Divisi Proyek / Departemen Teknik sesuai struktur org perusahaan",
			},
		],
		warning:
			"Jangan pernah gabungkan dua proyek dalam satu Project Master. Biaya akan tercampur dan laporan proyek tidak bisa dibaca.",
	},
	{
		id: "task",
		icon: "📋",
		label: "Task & WBS",
		color: "#8b5cf6",
		short: "Struktur pekerjaan & Gantt Chart",
		desc: "Task di ERPNext mewakili setiap item pekerjaan dalam WBS (Work Breakdown Structure). Susun Task secara hierarki untuk mendapatkan Gantt Chart otomatis yang mencerminkan jadwal proyek.",
		howto: [
			{
				step: "Buat Task dari WBS proyek",
				detail:
					"Di dalam Project, klik tab Tasks → Add Row. Buat Task untuk setiap divisi pekerjaan utama: Pekerjaan Persiapan, Pekerjaan Struktur, Pekerjaan Arsitektur, M/E, Finishing.",
			},
			{
				step: "Buat Sub-Task (hierarki)",
				detail:
					"Setiap Task divisi bisa punya child task. Contoh: 'Pekerjaan Struktur' → child: 'Pekerjaan Pondasi', 'Pekerjaan Kolom', 'Pekerjaan Balok', 'Pekerjaan Plat Lantai'.",
			},
			{
				step: "Set Expected Start & End per Task",
				detail:
					"Isi tanggal rencana untuk setiap task sesuai jadwal konstruksi (network planning / bar chart). Ini yang akan membentuk Gantt Chart.",
			},
			{
				step: "Set Dependency (Predecessor)",
				detail:
					"Di field 'Depends On', pilih task yang harus selesai sebelum task ini bisa mulai. Contoh: 'Pekerjaan Kolom' depends on 'Pekerjaan Pondasi'.",
			},
			{
				step: "Assign Task ke User",
				detail:
					"Di field Assigned To, pilih Site Engineer atau Pelaksana yang bertanggung jawab. Mereka akan dapat notifikasi dan bisa update progress.",
			},
			{
				step: "Set Weight per Task",
				detail:
					"Di field 'Weight', isi bobot task terhadap keseluruhan proyek (dalam %). Ambil dari nilai RAB: bobot = nilai item / total nilai kontrak × 100.",
			},
			{
				step: "Update Progress Task secara berkala",
				detail:
					"PM atau Site Engineer update field '% Progress' di setiap task berdasarkan kondisi lapangan aktual. Update ini otomatis dihitung ke % progress proyek.",
			},
		],
		config: [
			{
				field: "Task Name",
				value:
					"Gunakan naming yang sama dengan WBS di RAB — konsistensi kritis untuk tracking",
			},
			{
				field: "Status",
				value:
					"Open / Working / Pending Review / Overdue / Completed / Cancelled",
			},
			{
				field: "Priority",
				value:
					"Low / Medium / High / Urgent — mark pekerjaan di jalur kritis sebagai High/Urgent",
			},
			{
				field: "Is Milestone",
				value:
					"Centang untuk task yang merupakan milestone penting: selesai pondasi, selesai atap, dll",
			},
			{
				field: "Expected Time (Hours)",
				detail:
					"Estimasi jam kerja — bisa dikosongkan untuk kontraktor, fokus pada tanggal saja",
			},
			{
				field: "Closing Date",
				value:
					"Tanggal deadline — jika task tidak selesai sebelum ini, status otomatis jadi Overdue",
			},
		],
		warning:
			"Jangan buat terlalu banyak task level detail di ERPNext — sistem akan berat. Cukup sampai level 3 (Divisi → Sub-Divisi → Item Pekerjaan Utama). Detail item masuk ke custom Progress module.",
	},
	{
		id: "timesheet",
		icon: "⏱️",
		label: "Timesheet",
		color: "#10b981",
		short: "Alokasi jam kerja per proyek",
		desc: "Timesheet mencatat berapa jam setiap orang (karyawan) bekerja untuk proyek tertentu. Untuk kontraktor, Timesheet dipakai untuk biaya staf kantor (PM, Site Engineer, Surveyor) yang dialokasikan ke proyek — bukan untuk mandor/tukang harian yang dicatat di LHL.",
		howto: [
			{
				step: "Aktifkan Timesheet di pengaturan HR",
				detail:
					"HR → Settings → HR Settings → centang 'Enable Timesheet'. Tanpa ini, timesheet tidak muncul di menu.",
			},
			{
				step: "Karyawan buat Timesheet mingguan",
				detail:
					"Project → Timesheet → New. Pilih Employee, isi periode (From Date - To Date). Sistem auto-isi nama karyawan dari akun user yang login.",
			},
			{
				step: "Isi Time Log per hari",
				detail:
					"Di tabel Time Logs, tambahkan baris per hari: pilih Project, pilih Task yang dikerjakan, isi From Time - To Time atau Hours, isi Activity Type (Site Visit, Design, Meeting, Report).",
			},
			{
				step: "Set billing rate (opsional)",
				detail:
					"Jika biaya staf perlu dialokasikan ke proyek, aktifkan Billing Rate di Employee master atau Activity Type. ERPNext akan hitung otomatis biaya staf per proyek.",
			},
			{
				step: "Supervisor approve Timesheet",
				detail:
					"Timesheet yang sudah diisi Submit → masuk ke queue PM untuk approve. PM bisa reject jika ada jam yang tidak masuk akal.",
			},
			{
				step: "Lihat biaya staf per proyek",
				detail:
					"Setelah approved, biaya staf otomatis masuk ke Project Costing Report sebagai komponen biaya langsung proyek.",
			},
		],
		config: [
			{
				field: "Activity Type",
				value:
					"Buat master activity: Site Supervision, Design Review, Client Meeting, Report Writing, Procurement, QC Inspection",
			},
			{
				field: "Billing Rate",
				value:
					"Set rate per jam per employee type: PM, Site Engineer, Drafter, Quantity Surveyor — ambil dari struktur biaya perusahaan",
			},
			{
				field: "Auto Billing",
				value:
					"Jika proyek cost plus, aktifkan agar jam kerja bisa langsung ditagihkan ke owner",
			},
		],
		warning:
			"Timesheet hanya untuk staf tetap. Mandor, tukang, dan pekerja harian dicatat di Laporan Harian Lapangan (custom module) dan diproses melalui Payroll atau Purchase Invoice ke mandor.",
	},
	{
		id: "costing",
		icon: "💰",
		label: "Project Costing",
		color: "#f59e0b",
		short: "Budget vs Aktual per proyek",
		desc: "Project Costing adalah fitur terpenting ERPNext untuk kontraktor — membandingkan anggaran (dari RAB) dengan biaya aktual yang sudah terjadi. Ini tampil di Project Costing Report dan di dashboard setiap Project.",
		howto: [
			{
				step: "Input Budget ke Cost Center proyek",
				detail:
					"Accounting → Budget → New Budget. Pilih Cost Center proyek, isi budget per akun (Material, Upah, Alat, Overhead) sesuai nilai RAB yang sudah diapprove.",
			},
			{
				step: "Pastikan semua transaksi pakai Cost Center yang benar",
				detail:
					"Setiap Purchase Order, Purchase Invoice, Expense Claim, Journal Entry yang terkait proyek ini WAJIB dipilih Cost Center proyek. Ini titik kritis — jika ada yang salah Cost Center, laporan keuangan proyek akan tidak akurat.",
			},
			{
				step: "Lihat Project Costing Report",
				detail:
					"Project → Reports → Project Costing. Pilih Project Name, set date range. Report tampilkan: Estimated Cost (dari RAB), Actual Cost (dari transaksi), Variance, dan % utilization.",
			},
			{
				step: "Monitor Budget Variance secara berkala",
				detail:
					"PM wajib review Project Costing setiap minggu. Jika ada akun yang sudah > 80% dari budget, perlu investigasi dan tindakan — apakah volume bertambah atau ada pemborosan.",
			},
			{
				step: "Drill down ke transaksi",
				detail:
					"Di Project Costing Report, klik pada angka Actual Cost untuk lihat transaksi apa saja yang membentuk biaya tersebut — bisa sampai level Purchase Invoice per material.",
			},
		],
		config: [
			{
				field: "Budget vs Actual Alert",
				value:
					"Aktifkan Budget Variance alert di Accounting Settings: notifikasi otomatis jika transaksi akan membuat budget terlampaui",
			},
			{
				field: "Cost Center Tree",
				value:
					"Buat hierarki Cost Center: Perusahaan → Divisi Proyek → Proyek A / Proyek B / Proyek C",
			},
			{
				field: "Project in PO",
				value:
					"Di Purchase Order, selalu isi field 'Project' — ini yang menghubungkan pembelian material ke proyek",
			},
		],
		warning:
			"Project Costing hanya seakurat data yang diinput. Jika Purchase Order material tidak di-link ke proyek yang benar, biaya tidak akan masuk ke laporan proyek.",
	},
	{
		id: "billing",
		icon: "🧾",
		label: "Project Billing",
		color: "#ec4899",
		short: "Penagihan berbasis progress ke owner",
		desc: "ERPNext mendukung penagihan berbasis milestone atau berbasis persentase progress. Untuk kontraktor, ini dipakai untuk generate invoice ke owner setelah BAO di-approve.",
		howto: [
			{
				step: "Set Billing Method di Project",
				detail:
					"Di Project Master, field Billing Based On: pilih 'Task Completion' (untuk milestone-based billing) atau gunakan custom approach dengan Sales Invoice manual untuk progress-based billing.",
			},
			{
				step: "Buat Sales Order untuk proyek",
				detail:
					"Billing → Sales Order → New. Isi Customer (owner), link ke Project, isi items: termin pembayaran sesuai kontrak. Contoh: Termin 1 – DP 20%, Termin 2 – Progress 30%, dst.",
			},
			{
				step: "Generate Invoice per Termin",
				detail:
					"Setelah BAO approved, dari Sales Order klik 'Create → Sales Invoice'. Isi % yang ditagihkan sesuai BAO, tambahkan lampiran nomor BAO sebagai referensi.",
			},
			{
				step: "Set Milestone di Sales Order (opsional)",
				detail:
					"Jika kontrak berbasis milestone, set milestone amounts di Sales Order. ERPNext akan otomatis suggest invoice saat milestone tercapai.",
			},
			{
				step: "Tracking piutang per proyek",
				detail:
					"Accounts → Accounts Receivable → filter per Customer (owner). Lihat invoice mana yang sudah dibayar, yang belum, dan aging (berapa lama outstanding).",
			},
		],
		config: [
			{
				field: "Payment Terms",
				value:
					"Buat Payment Terms sesuai kontrak: Net 30, Net 45, atau custom per kontrak proyek",
			},
			{
				field: "Sales Order per Proyek",
				value:
					"Satu Sales Order per kontrak — ini jadi backbone semua penagihan termin ke satu owner",
			},
			{
				field: "Retention Deduction",
				value:
					"Buat item 'Retensi 5%' dengan nilai negatif di Sales Invoice — cara ERPNext untuk handle potongan retensi",
			},
		],
		warning:
			"ERPNext tidak punya fitur retensi built-in untuk sisi piutang owner. Perlu workaround: buat item Retensi sebagai line item negatif, atau gunakan custom module (masuk Custom Feature Billing & Cash Flow).",
	},
	{
		id: "gantt",
		icon: "📅",
		label: "Gantt Chart",
		color: "#14b8a6",
		short: "Visualisasi jadwal proyek",
		desc: "ERPNext memiliki Gantt Chart bawaan yang ter-generate otomatis dari data Task. Untuk kontraktor, Gantt Chart ini bisa dijadikan Master Schedule yang selalu up-to-date.",
		howto: [
			{
				step: "Akses Gantt dari Project",
				detail:
					"Buka Project → klik tab Gantt. Chart otomatis ter-generate dari semua Task yang ada di proyek beserta tanggal mulai-selesai dan dependency.",
			},
			{
				step: "Drag & drop untuk update jadwal",
				detail:
					"Di tampilan Gantt, task bisa di-drag untuk mengubah tanggal. Perubahan otomatis tersimpan ke task yang bersangkutan. Gunakan untuk reschedule setelah ada keterlambatan.",
			},
			{
				step: "Warna status task",
				detail:
					"Perhatikan warna: Abu-abu = Not Started, Biru = In Progress, Hijau = Completed, Merah = Overdue. Merah = perlu perhatian segera.",
			},
			{
				step: "Gunakan sebagai acuan rapat mingguan",
				detail:
					"Print atau screenshot Gantt setiap Senin untuk rapat koordinasi proyek. Tampilkan actual progress di setiap task (update % completion sebelum rapat).",
			},
			{
				step: "Lihat Gantt multi-proyek",
				detail:
					"Project → Gantt → pilih 'All Projects'. PM bisa lihat semua proyek sekaligus untuk deteksi resource conflict (dua proyek butuh resource yang sama di waktu bersamaan).",
			},
		],
		config: [
			{
				field: "Task Dependency",
				value:
					"Set Finish-to-Start dependency dengan benar — ini yang membuat Gantt akurat dan critical path bisa teridentifikasi",
			},
			{
				field: "Task Color",
				value:
					"Gunakan Priority (High = merah, Medium = kuning) untuk color-coding visual di Gantt",
			},
			{
				field: "Milestone Task",
				value:
					"Centang 'Is Milestone' untuk task penting — akan tampil sebagai diamond di Gantt Chart",
			},
		],
		warning:
			"Gantt ERPNext tidak se-powerful MS Project atau Primavera P6. Untuk proyek besar dengan ribuan activity, pertimbangkan import jadwal dari MS Project ke ERPNext hanya untuk level summary (3 level WBS).",
	},
	{
		id: "resource",
		icon: "👷",
		label: "Resource Planning",
		color: "#f97316",
		short: "Alokasi sumber daya ke proyek",
		desc: "ERPNext memungkinkan alokasi sumber daya (manusia dan peralatan) ke proyek dan task tertentu, sehingga PM bisa tahu apakah suatu resource sudah overloaded atau masih available.",
		howto: [
			{
				step: "Assign Resource ke Task",
				detail:
					"Di setiap Task, field 'Assigned To': pilih User/karyawan yang bertanggung jawab. Untuk alat berat, gunakan custom field atau catat di notes task.",
			},
			{
				step: "Lihat Resource utilization",
				detail:
					"Project → Reports → Resource Utilization. Lihat per karyawan berapa jam sudah dialokasikan ke proyek-proyek berbeda dalam periode tertentu.",
			},
			{
				step: "Deteksi overloading",
				detail:
					"Jika satu karyawan muncul di > 2 proyek di waktu bersamaan dengan jam penuh, ada masalah alokasi. Diskusikan dengan Direktur untuk redistribusi.",
			},
			{
				step: "Planning tenaga kerja harian (dari RAB)",
				detail:
					"Gunakan data koefisien AHSP dari RAB untuk menghitung kebutuhan mandor dan tukang per minggu. Input ini ke Notes di Task sebagai acuan Site Manager.",
			},
		],
		config: [
			{
				field: "Employee Availability",
				value:
					"Set jadwal kerja karyawan di HR → Employee → Attendance → Working Hours agar sistem tahu kapan mereka available",
			},
			{
				field: "Resource Calendar",
				value:
					"Aktifkan resource calendar untuk lihat siapa yang available di tanggal berapa — berguna saat planning site visit atau inspeksi",
			},
		],
		warning:
			"Resource planning untuk mandor dan tukang lepas tidak bisa langsung di ERPNext karena mereka bukan Employee. Gunakan custom Daily Report (LHL) untuk tracking tenaga kerja harian di lapangan.",
	},
	{
		id: "dashboard",
		icon: "📊",
		label: "Project Dashboard",
		color: "#6366f1",
		short: "Ringkasan status semua proyek",
		desc: "ERPNext menyediakan Project Dashboard yang menampilkan ringkasan semua proyek aktif dalam satu layar. Ini adalah cockpit PM dan Direktur untuk monitoring semua proyek sekaligus.",
		howto: [
			{
				step: "Akses Project List dengan filter",
				detail:
					"Project → Project. Tampilan list semua proyek. Gunakan filter Status=Open untuk lihat proyek aktif saja. Kolom yang penting: % Complete, Estimated Cost, Actual Cost.",
			},
			{
				step: "Buat custom dashboard ERPNext",
				detail:
					"Dashboard → New Dashboard. Tambahkan chart: 'Projects by Status' (pie chart), 'Project Cost vs Budget' (bar chart), 'Overdue Tasks' (number card). Set sebagai halaman utama login.",
			},
			{
				step: "Setup KPI di dashboard",
				detail:
					"Tambahkan Number Cards: Total Proyek Aktif, Proyek Overdue (% Complete tertinggal dari rencana), Total Nilai Kontrak, Total Biaya Aktual, Margin Proyek.",
			},
			{
				step: "Gunakan Project Summary di tiap Project",
				detail:
					"Di dalam setiap Project, ada section ringkasan: # Tasks, # Overdue Tasks, Billing Amount, Costing Amount. PM cukup buka ini untuk update cepat.",
			},
		],
		config: [
			{
				field: "Dashboard Charts",
				value:
					"Buat chart: Projects by Status, Cost Variance per Project, Task Completion Rate per Project",
			},
			{
				field: "Saved Filters",
				value:
					"Simpan filter 'My Projects' (proyek yang dihandle PM tertentu) sebagai default view",
			},
			{
				field: "Notification Rules",
				value:
					"Setup notifikasi: task overdue → kirim email ke PM dan assignee, budget > 90% → kirim email ke PM dan Finance",
			},
		],
		warning: null,
	},
];

const SETUP_STEPS = [
	{
		no: 1,
		title: "Konfigurasi Cost Center per Proyek",
		color: "#0ea5e9",
		desc: "Ini langkah PERTAMA dan TERPENTING sebelum proyek mulai. Setiap proyek harus punya Cost Center sendiri di Accounting.",
		steps: [
			"Accounting → Chart of Accounts → Cost Centers",
			"Buat Cost Center baru: nama proyek (sama persis dengan Project Name)",
			"Parent: pilih Cost Center 'Divisi Proyek' atau parent yang sesuai",
			"Simpan → gunakan Cost Center ini di SEMUA transaksi proyek",
		],
	},
	{
		no: 2,
		title: "Buat Customer (Owner) jika belum ada",
		color: "#8b5cf6",
		desc: "Owner/klien proyek harus terdaftar sebagai Customer di ERPNext sebelum proyek dibuat.",
		steps: [
			"Selling → Customer → New",
			"Isi nama perusahaan owner, jenis (Company), NPWP, alamat",
			"Set Payment Terms sesuai kontrak (Net 30, Net 45, dll)",
			"Simpan → siap dipakai di Project dan Sales Order",
		],
	},
	{
		no: 3,
		title: "Buat Project Master",
		color: "#10b981",
		desc: "Buat Project setelah Cost Center dan Customer sudah siap.",
		steps: [
			"Project → Project → New",
			"Isi: Project Name, Customer, Project Manager, Expected Start/End",
			"Set % Complete Method = Manual",
			"Hubungkan ke Cost Center yang sudah dibuat",
			"Set Estimated Cost dari nilai RAB yang diapprove",
		],
	},
	{
		no: 4,
		title: "Buat WBS sebagai Task Hierarki",
		color: "#f59e0b",
		desc: "Susun struktur pekerjaan sebagai Task — maksimal 3 level untuk menjaga performa sistem.",
		steps: [
			"Buka Project → tab Tasks → Add Row",
			"Level 1: Divisi (Persiapan, Struktur, Arsitektur, ME, Finishing)",
			"Level 2: Sub-Divisi per Divisi",
			"Level 3: Item Pekerjaan Utama per Sub-Divisi",
			"Isi tanggal mulai-selesai dan bobot setiap task",
			"Set dependency antar task",
		],
	},
	{
		no: 5,
		title: "Setup Budget di Accounting",
		color: "#ec4899",
		desc: "Input budget RAB ke sistem Accounting agar budget vs actual bisa termonitor.",
		steps: [
			"Accounting → Budget → New",
			"Pilih Company, Fiscal Year, dan Cost Center proyek",
			"Isi budget per akun: Material, Upah, Alat, Overhead",
			"Action: Stop — agar transaksi yang melebihi budget di-block atau Warning saja",
			"Simpan → Budget aktif",
		],
	},
	{
		no: 6,
		title: "Buat Sales Order untuk Billing ke Owner",
		color: "#14b8a6",
		desc: "Sales Order jadi backbone semua penagihan termin ke owner.",
		steps: [
			"Selling → Sales Order → New",
			"Pilih Customer (owner), link ke Project",
			"Buat items: Termin 1 (DP), Termin 2, Termin 3, dst sesuai kontrak",
			"Set Payment Terms dan Payment Schedule",
			"Submit → siap untuk generate invoice per termin",
		],
	},
	{
		no: 7,
		title: "Konfigurasi Notifikasi & Alert",
		color: "#f97316",
		desc: "Setup sistem notifikasi agar PM tidak perlu cek manual setiap saat.",
		steps: [
			"Setup → Notification → New",
			"Buat notifikasi: Task Overdue → kirim email ke Assigned To + Project Manager",
			"Buat notifikasi: Budget > 80% → kirim ke PM + Finance Manager",
			"Buat notifikasi: Project End Date approaching (7 hari) → kirim ke PM + Direktur",
			"Test semua notifikasi sebelum proyek mulai",
		],
	},
];

const REPORTS = [
	{
		name: "Project Costing",
		path: "Project → Reports → Project Costing",
		use: "Bandingkan estimated cost (RAB) vs actual cost (transaksi riil). Review mingguan oleh PM.",
		color: "#f59e0b",
	},
	{
		name: "Project Billing Summary",
		path: "Project → Reports → Project Billing Summary",
		use: "Lihat total yang sudah ditagihkan ke owner per proyek dan status pembayarannya.",
		color: "#ec4899",
	},
	{
		name: "Daily Time Log",
		path: "Project → Reports → Daily Time Log",
		use: "Rekap jam kerja staf per proyek per hari. Berguna untuk verifikasi alokasi tenaga staf.",
		color: "#10b981",
	},
	{
		name: "Task Analysis",
		path: "Project → Reports → Task Analysis",
		use: "Analisis task: berapa yang on-time, overdue, completed. Identifikasi bottleneck dalam eksekusi proyek.",
		color: "#8b5cf6",
	},
	{
		name: "Project Summary",
		path: "Project → Reports → Project Summary",
		use: "Overview semua proyek: status, % complete, nilai kontrak, biaya aktual. Cocok untuk laporan ke Direksi.",
		color: "#0ea5e9",
	},
	{
		name: "Resource Utilization",
		path: "Project → Reports → Resource Utilization",
		use: "Lihat utilisasi setiap staf per proyek. Deteksi overloading atau underutilization.",
		color: "#f97316",
	},
	{
		name: "Accounts Receivable Aging",
		path: "Accounting → Accounts Receivable → Summary",
		use: "Pantau piutang termin yang belum dibayar per owner. Filter per proyek untuk detail spesifik.",
		color: "#ef4444",
	},
	{
		name: "Budget Variance Report",
		path: "Accounting → Budget → Budget Variance Report",
		use: "Selisih anggaran vs realisasi per Cost Center (proyek). Early warning jika ada item yang over-budget.",
		color: "#14b8a6",
	},
];

const INTEGRATIONS = [
	{
		module: "Procurement (Purchase Order)",
		color: "#0ea5e9",
		detail:
			"Setiap PO material WAJIB diisi field 'Project'. Dengan ini, biaya material otomatis masuk ke Project Costing dan Cost Center proyek.",
	},
	{
		module: "Inventory (Stock Entry)",
		color: "#10b981",
		detail:
			"Pemakaian material dari gudang ke site → buat Stock Entry type 'Material Issue' dengan link ke Project. Biaya HPP material masuk ke proyek.",
	},
	{
		module: "HR (Expense Claims)",
		color: "#8b5cf6",
		detail:
			"Uang muka kerja dan reimbursement staf → di Expense Claim, pilih Project. Biaya langsung masuk ke project costing.",
	},
	{
		module: "Accounts Payable",
		color: "#f59e0b",
		detail:
			"Purchase Invoice dari supplier/subkon → link ke Project agar hutang ter-track per proyek dan biaya masuk ke laporan.",
	},
	{
		module: "Accounts Receivable",
		color: "#ec4899",
		detail:
			"Sales Invoice ke owner → link ke Project. Semua piutang termin ter-track per proyek untuk cash flow monitoring.",
	},
	{
		module: "Asset Management",
		color: "#f97316",
		detail:
			"Alat berat yang dipakai di proyek → buat Asset Usage Entry link ke Project. Biaya depresiasi/sewa dialokasikan ke proyek.",
	},
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const Tag = ({ color, children, small }) => (
	<span
		style={{
			background: color + "18",
			color,
			border: `1px solid ${color}40`,
			borderRadius: 4,
			padding: small ? "1px 5px" : "2px 8px",
			fontSize: small ? "0.62rem" : "0.68rem",
			fontFamily: MONO,
			fontWeight: 700,
			whiteSpace: "nowrap",
		}}>
		{children}
	</span>
);

const SectionHead = ({ children }) => (
	<div
		style={{
			fontFamily: MONO,
			fontSize: "0.58rem",
			color: "#334155",
			letterSpacing: 4,
			textTransform: "uppercase",
			marginBottom: "1rem",
		}}>
		{children}
	</div>
);

export default function TutorialProjectSetup() {
	const [tab, setTab] = useState("modules");
	const [activeModule, setActiveModule] = useState(0);
	const [activeSetup, setActiveSetup] = useState(null);

	const mod = MODULES[activeModule];

	return (
		<div
			style={{
				background: "#07090f",
				minHeight: "100vh",
				color: "#c0cfe0",
				fontFamily: SERIF,
			}}>
			{/* HEADER */}
			<div
				style={{
					background: "linear-gradient(170deg, #0d1220 0%, #07090f 100%)",
					borderBottom: "1px solid #192030",
					padding: "2rem 1.5rem 1.6rem",
					position: "relative",
					overflow: "hidden",
				}}>
				<div
					style={{
						position: "absolute",
						top: -60,
						right: -60,
						width: 320,
						height: 320,
						borderRadius: "50%",
						background:
							"radial-gradient(circle, #0ea5e912 0%, transparent 70%)",
						pointerEvents: "none",
					}}
				/>
				<div style={{ maxWidth: 1080, margin: "0 auto" }}>
					<div
						style={{
							fontFamily: MONO,
							fontSize: "0.58rem",
							color: "#1e3a52",
							letterSpacing: 6,
							marginBottom: 8,
						}}>
						BUILT-IN FEATURE #1 — DEEP DIVE
					</div>
					<h1
						style={{
							margin: 0,
							fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
							fontWeight: 700,
							color: "#eaf4ff",
							lineHeight: 1.2,
						}}>
						ERPNext Project Management
					</h1>
					<p
						style={{
							color: "#1e3a52",
							margin: "0.6rem 0 0",
							fontSize: "0.85rem",
							fontFamily: MONO,
						}}>
						Cara kerja · Konfigurasi untuk kontraktor · Setup step-by-step ·
						Reports & Integrasi
					</p>
				</div>
			</div>

			{/* NAV */}
			<div
				style={{
					borderBottom: "1px solid #192030",
					background: "#07090f",
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
						{ key: "modules", label: "🧩 Fitur & Cara Kerja" },
						{ key: "setup", label: "⚙️ Setup Step-by-Step" },
						{ key: "reports", label: "📊 Reports Penting" },
						{ key: "integration", label: "🔌 Integrasi Modul" },
					].map((n) => (
						<button
							key={n.key}
							onClick={() => setTab(n.key)}
							style={{
								padding: "0.85rem 1.05rem",
								background: "none",
								border: "none",
								borderBottom:
									tab === n.key ? "2px solid #0ea5e9" : "2px solid transparent",
								color: tab === n.key ? "#0ea5e9" : "#1e3a52",
								fontFamily: SERIF,
								fontSize: "0.82rem",
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
				{/* ── MODULES TAB ── */}
				{tab === "modules" && (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "230px 1fr",
							gap: 14,
						}}>
						{/* Sidebar */}
						<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
							{MODULES.map((m, i) => (
								<button
									key={i}
									onClick={() => setActiveModule(i)}
									style={{
										textAlign: "left",
										padding: "0.65rem 0.85rem",
										background: activeModule === i ? m.color + "15" : "#0d1220",
										border: `1px solid ${activeModule === i ? m.color + "70" : "#192030"}`,
										borderRadius: 8,
										cursor: "pointer",
										transition: "all 0.15s",
									}}>
									<div
										style={{ display: "flex", gap: 8, alignItems: "center" }}>
										<span style={{ fontSize: 17 }}>{m.icon}</span>
										<div>
											<div
												style={{
													color: activeModule === i ? "#eaf4ff" : "#4a6a84",
													fontSize: "0.78rem",
													fontWeight: 700,
												}}>
												{m.label}
											</div>
											<div
												style={{
													fontFamily: MONO,
													fontSize: "0.58rem",
													color: activeModule === i ? m.color : "#1e3a52",
													lineHeight: 1.4,
												}}>
												{m.short}
											</div>
										</div>
									</div>
								</button>
							))}
						</div>

						{/* Detail panel */}
						<div
							style={{
								background: "#0d1220",
								border: `1px solid ${mod.color}30`,
								borderRadius: 12,
								padding: "1.5rem",
								borderTop: `3px solid ${mod.color}`,
							}}>
							<div
								style={{
									display: "flex",
									gap: 10,
									alignItems: "center",
									marginBottom: "0.8rem",
								}}>
								<span style={{ fontSize: 26 }}>{mod.icon}</span>
								<div>
									<div
										style={{
											fontFamily: MONO,
											fontSize: "0.6rem",
											color: mod.color,
											letterSpacing: 3,
										}}>
										FITUR BAWAAN ERPNEXT
									</div>
									<h2
										style={{
											margin: 0,
											color: "#eaf4ff",
											fontSize: "1.1rem",
											fontWeight: 700,
										}}>
										{mod.label}
									</h2>
								</div>
							</div>

							<p
								style={{
									color: "#5a7a94",
									fontSize: "0.85rem",
									lineHeight: 1.75,
									margin: "0 0 1.2rem",
									borderLeft: `3px solid ${mod.color}40`,
									paddingLeft: "0.9rem",
								}}>
								{mod.desc}
							</p>

							{/* How to use */}
							<SectionHead>🛠 Cara Penggunaan untuk Kontraktor</SectionHead>
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
											gridTemplateColumns: "auto 1fr",
											gap: 10,
											padding: "0.65rem 0.85rem",
											background: "#07090f",
											borderRadius: 7,
											borderLeft: `2px solid ${mod.color}45`,
										}}>
										<div
											style={{
												width: 22,
												height: 22,
												borderRadius: "50%",
												background: mod.color + "20",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontFamily: MONO,
												fontSize: "0.65rem",
												color: mod.color,
												flexShrink: 0,
											}}>
											{i + 1}
										</div>
										<div>
											<div
												style={{
													color: "#eaf4ff",
													fontSize: "0.82rem",
													fontWeight: 700,
													marginBottom: 3,
												}}>
												{h.step}
											</div>
											<div
												style={{
													color: "#5a7a94",
													fontSize: "0.79rem",
													lineHeight: 1.65,
												}}>
												{h.detail}
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Config tips */}
							<SectionHead>⚙️ Konfigurasi & Setting Penting</SectionHead>
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
											gridTemplateColumns: "180px 1fr",
											gap: 10,
											padding: "0.5rem 0.85rem",
											background: "#07090f",
											borderRadius: 6,
										}}>
										<div
											style={{
												fontFamily: MONO,
												fontSize: "0.7rem",
												color: mod.color,
											}}>
											{c.field}
										</div>
										<div
											style={{
												color: "#5a7a94",
												fontSize: "0.77rem",
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
										border: "1px solid #fbbf2430",
										borderRadius: 8,
										padding: "0.75rem 1rem",
										display: "flex",
										gap: 8,
										marginTop: "1rem",
									}}>
									<span>⚠️</span>
									<span
										style={{
											color: "#fcd34d",
											fontSize: "0.8rem",
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
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						<div
							style={{
								background: "#0d1220",
								border: "1px solid #192030",
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
								marginBottom: 4,
							}}>
							<SectionHead>
								⚙️ Urutan Setup yang Benar — Ikuti Urutan Ini Sebelum Proyek
								Mulai
							</SectionHead>
							<p style={{ color: "#3a5a74", fontSize: "0.82rem", margin: 0 }}>
								Jika setup tidak berurutan, data akan tidak konsisten dan
								laporan proyek tidak akurat. Ikuti 7 langkah ini secara
								berurutan untuk setiap proyek baru.
							</p>
						</div>
						{SETUP_STEPS.map((s, i) => (
							<div
								key={i}
								style={{
									background: "#0d1220",
									border: `1px solid ${activeSetup === i ? s.color + "60" : "#192030"}`,
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
										padding: "0.9rem 1.1rem",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										gap: 12,
										textAlign: "left",
									}}>
									<div
										style={{
											width: 32,
											height: 32,
											borderRadius: "50%",
											background: s.color + "20",
											border: `2px solid ${s.color}50`,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
										}}>
										<span
											style={{
												fontFamily: MONO,
												fontSize: "0.8rem",
												color: s.color,
												fontWeight: 700,
											}}>
											{String(s.no).padStart(2, "0")}
										</span>
									</div>
									<div style={{ flex: 1 }}>
										<div
											style={{
												color: "#eaf4ff",
												fontWeight: 700,
												fontSize: "0.9rem",
											}}>
											{s.title}
										</div>
										<div
											style={{
												color: "#3a5a74",
												fontSize: "0.76rem",
												marginTop: 2,
											}}>
											{s.desc}
										</div>
									</div>
									<span
										style={{
											color: s.color,
											fontSize: "1.1rem",
											transition: "transform 0.2s",
											display: "inline-block",
											transform: activeSetup === i ? "rotate(90deg)" : "none",
										}}>
										›
									</span>
								</button>
								{activeSetup === i && (
									<div
										style={{
											borderTop: "1px solid #192030",
											padding: "0.8rem 1.1rem 1rem 1.1rem",
										}}>
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: 6,
											}}>
											{s.steps.map((step, j) => (
												<div
													key={j}
													style={{
														display: "flex",
														gap: 10,
														padding: "0.55rem 0.8rem",
														background: "#07090f",
														borderRadius: 6,
														borderLeft: `2px solid ${s.color}45`,
													}}>
													<span
														style={{
															color: s.color,
															fontFamily: MONO,
															fontSize: "0.65rem",
															minWidth: 18,
															paddingTop: 2,
														}}>
														{String(j + 1).padStart(2, "0")}
													</span>
													<span
														style={{
															color: "#5a7a94",
															fontSize: "0.81rem",
															lineHeight: 1.6,
														}}>
														{step}
													</span>
												</div>
											))}
										</div>
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
								background: "#0d1220",
								border: "1px solid #192030",
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
								marginBottom: 4,
							}}>
							<SectionHead>
								📊 Report Bawaan ERPNext yang Paling Relevan untuk Kontraktor
							</SectionHead>
							<p style={{ color: "#3a5a74", fontSize: "0.82rem", margin: 0 }}>
								ERPNext memiliki 8+ report bawaan di modul Project dan
								Accounting yang langsung bisa dipakai. Berikut cara akses dan
								kapan menggunakannya.
							</p>
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
								gap: 10,
							}}>
							{REPORTS.map((r, i) => (
								<div
									key={i}
									style={{
										background: "#0d1220",
										border: `1px solid ${r.color}25`,
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
													color: r.color,
													fontWeight: 700,
													fontSize: "0.88rem",
													marginBottom: 3,
												}}>
												{r.name}
											</div>
											<div
												style={{
													fontFamily: MONO,
													fontSize: "0.62rem",
													color: "#2a4a64",
													background: "#07090f",
													padding: "3px 7px",
													borderRadius: 4,
													display: "inline-block",
												}}>
												{r.path}
											</div>
										</div>
									</div>
									<p
										style={{
											color: "#5a7a94",
											fontSize: "0.78rem",
											lineHeight: 1.6,
											margin: 0,
										}}>
										{r.use}
									</p>
								</div>
							))}
						</div>

						{/* Custom report tips */}
						<div
							style={{
								background: "#0d1220",
								border: "1px solid #192030",
								borderRadius: 10,
								padding: "1.2rem",
							}}>
							<SectionHead>
								💡 Custom Report yang Perlu Dibuat di ERPNext
							</SectionHead>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
									gap: 10,
								}}>
								{[
									{
										name: "Project P&L per Proyek",
										desc: "Pendapatan (invoice ke owner) dikurangi semua biaya (material, upah, alat, overhead) = laba/rugi per proyek",
										color: "#10b981",
									},
									{
										name: "Cash Flow per Proyek",
										desc: "Proyeksi arus kas masuk (invoice termin) vs arus kas keluar (pembelian material, bayar subkon) per minggu ke depan",
										color: "#0ea5e9",
									},
									{
										name: "Multi-Project Dashboard",
										desc: "Satu view semua proyek: progress %, biaya vs budget, piutang outstanding, margin. Untuk Direksi.",
										color: "#8b5cf6",
									},
									{
										name: "Cost to Complete (ETC)",
										desc: "Berapa biaya tersisa yang perlu dikeluarkan sampai proyek selesai, berdasarkan progress dan biaya aktual saat ini",
										color: "#f59e0b",
									},
								].map((c, i) => (
									<div
										key={i}
										style={{
											background: "#07090f",
											borderRadius: 8,
											padding: "0.85rem",
											borderTop: `3px solid ${c.color}`,
										}}>
										<div
											style={{
												color: c.color,
												fontWeight: 700,
												fontSize: "0.8rem",
												marginBottom: 5,
											}}>
											{c.name}
										</div>
										<div
											style={{
												color: "#3a5a74",
												fontSize: "0.75rem",
												lineHeight: 1.55,
											}}>
											{c.desc}
										</div>
										<div style={{ marginTop: 8 }}>
											<Tag color={c.color} small>
												Custom Script Report
											</Tag>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* ── INTEGRATION TAB ── */}
				{tab === "integration" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
						<div
							style={{
								background: "#0d1220",
								border: "1px solid #192030",
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
							}}>
							<SectionHead>
								🔌 Integrasi Project Management dengan Modul ERPNext Lainnya
							</SectionHead>
							<p style={{ color: "#3a5a74", fontSize: "0.82rem", margin: 0 }}>
								Kekuatan utama ERPNext adalah integrasi antar modul yang mulus.
								Semua biaya proyek dari berbagai sumber otomatis terkumpul di
								Project Costing jika field "Project" selalu diisi dengan benar.
							</p>
						</div>

						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
								gap: 10,
							}}>
							{INTEGRATIONS.map((m, i) => (
								<div
									key={i}
									style={{
										background: "#0d1220",
										border: `1px solid ${m.color}25`,
										borderRadius: 10,
										padding: "1rem 1.1rem",
										borderLeft: `4px solid ${m.color}`,
									}}>
									<div
										style={{
											color: m.color,
											fontWeight: 700,
											fontSize: "0.85rem",
											marginBottom: 6,
										}}>
										{m.module}
									</div>
									<p
										style={{
											color: "#5a7a94",
											fontSize: "0.78rem",
											lineHeight: 1.6,
											margin: 0,
										}}>
										{m.detail}
									</p>
								</div>
							))}
						</div>

						{/* Data flow diagram */}
						<div
							style={{
								background: "#0d1220",
								border: "1px solid #192030",
								borderRadius: 12,
								padding: "1.3rem",
							}}>
							<SectionHead>🔄 Aliran Data ke Project Costing</SectionHead>
							<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
								{[
									{
										source: "Purchase Order → GRN → Purchase Invoice",
										label: "Biaya Material",
										color: "#0ea5e9",
										dest: "Project Costing (Material Cost)",
									},
									{
										source: "Timesheet (staf proyek)",
										label: "Biaya Staf",
										color: "#8b5cf6",
										dest: "Project Costing (Labour Cost)",
									},
									{
										source: "Expense Claim (uang muka, perjalanan)",
										label: "Biaya Lainnya",
										color: "#10b981",
										dest: "Project Costing (Other Cost)",
									},
									{
										source: "Asset Usage Entry (alat berat)",
										label: "Biaya Alat",
										color: "#f97316",
										dest: "Project Costing (Asset Cost)",
									},
									{
										source: "Journal Entry (biaya overhead, dll)",
										label: "Biaya Overhead",
										color: "#f59e0b",
										dest: "Project Costing (Overhead)",
									},
									{
										source: "Sales Invoice ke Owner",
										label: "Pendapatan",
										color: "#ec4899",
										dest: "Project Billing Report (Revenue)",
									},
								].map((row, i) => (
									<div
										key={i}
										style={{
											display: "grid",
											gridTemplateColumns: "1fr auto 1fr",
											gap: 10,
											alignItems: "center",
											padding: "0.6rem 0.85rem",
											background: "#07090f",
											borderRadius: 7,
										}}>
										<div
											style={{
												fontFamily: MONO,
												fontSize: "0.68rem",
												color: "#4a6a84",
											}}>
											{row.source}
										</div>
										<div
											style={{ display: "flex", alignItems: "center", gap: 5 }}>
											<Tag color={row.color}>{row.label}</Tag>
											<span style={{ color: "#1e3a52", fontSize: "1rem" }}>
												→
											</span>
										</div>
										<div
											style={{
												fontFamily: MONO,
												fontSize: "0.68rem",
												color: row.color,
											}}>
											{row.dest}
										</div>
									</div>
								))}
							</div>
							<div
								style={{
									marginTop: 12,
									background: "#07090f",
									borderRadius: 8,
									padding: "0.8rem 1rem",
									borderLeft: "3px solid #0ea5e9",
								}}>
								<div
									style={{
										fontFamily: MONO,
										fontSize: "0.62rem",
										color: "#0ea5e9",
										letterSpacing: 2,
										marginBottom: 5,
									}}>
									KUNCI INTEGRASI
								</div>
								<p
									style={{
										color: "#3a5a74",
										fontSize: "0.78rem",
										lineHeight: 1.6,
										margin: 0,
									}}>
									Field{" "}
									<span style={{ color: "#eaf4ff", fontFamily: MONO }}>
										Project
									</span>{" "}
									di setiap transaksi adalah penghubungnya. Jika satu transaksi
									tidak diisi Project, biayanya tidak akan masuk ke Project
									Costing. Wajibkan pengisian field Project melalui{" "}
									<span style={{ color: "#eaf4ff", fontFamily: MONO }}>
										Customize Form → Set Field as Mandatory
									</span>{" "}
									untuk semua transaksi yang relevan.
								</p>
							</div>
						</div>

						{/* Best practices */}
						<div
							style={{
								background: "#0d1220",
								border: "1px solid #192030",
								borderRadius: 12,
								padding: "1.3rem",
							}}>
							<SectionHead>✅ Best Practices untuk Kontraktor</SectionHead>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
									gap: 10,
								}}>
								{[
									{
										tip: "Satu Proyek = Satu Cost Center",
										detail:
											"Jangan gabungkan dua proyek dalam satu Cost Center — laporan keuangan proyek akan tidak bisa dibaca.",
										color: "#ef4444",
										type: "WAJIB",
									},
									{
										tip: "Project field wajib di PO & Invoice",
										detail:
											"Set field Project sebagai mandatory di Purchase Order dan Purchase Invoice untuk mencegah data yang tidak ter-link.",
										color: "#ef4444",
										type: "WAJIB",
									},
									{
										tip: "Update Task % completion setiap Senin",
										detail:
											"Tetapkan rutinitas: setiap Senin pagi, PM atau Site Engineer update progress semua task sebelum rapat koordinasi.",
										color: "#f59e0b",
										type: "RUTIN",
									},
									{
										tip: "Review Project Costing setiap minggu",
										detail:
											"PM wajib buka Project Costing Report setiap Jumat — deteksi early jika ada akun yang mendekati atau melewati budget.",
										color: "#f59e0b",
										type: "RUTIN",
									},
									{
										tip: "Gunakan naming convention yang konsisten",
										detail:
											"Nama Project, Task, dan Cost Center harus menggunakan format yang sama — ini kritis untuk filtering dan reporting yang akurat.",
										color: "#10b981",
										type: "DISIPLIN",
									},
									{
										tip: "Jangan delete — gunakan Cancel",
										detail:
											"Jika ada transaksi salah, jangan delete — cancel saja. Deletion mengganggu audit trail dan bisa menyebabkan inkonsistensi data.",
										color: "#10b981",
										type: "DISIPLIN",
									},
								].map((b, i) => (
									<div
										key={i}
										style={{
											background: "#07090f",
											borderRadius: 8,
											padding: "0.9rem",
											borderLeft: `3px solid ${b.color}`,
										}}>
										<div
											style={{
												display: "flex",
												gap: 6,
												alignItems: "center",
												marginBottom: 5,
											}}>
											<span
												style={{
													color: "#eaf4ff",
													fontWeight: 700,
													fontSize: "0.8rem",
												}}>
												{b.tip}
											</span>
											<Tag color={b.color} small>
												{b.type}
											</Tag>
										</div>
										<div
											style={{
												color: "#3a5a74",
												fontSize: "0.74rem",
												lineHeight: 1.55,
											}}>
											{b.detail}
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
