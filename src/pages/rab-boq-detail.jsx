import { useState } from "react";

const FONT = "'Courier New', monospace";
const SANS = "'Georgia', serif";

// ─── DATA ───────────────────────────────────────────────────────────────────

const FLOW_STEPS = [
	{
		id: 1,
		phase: "INISIASI",
		color: "#06b6d4",
		icon: "📋",
		title: "Setup Master Data",
		actor: "Admin / Estimator",
		desc: "Sebelum RAB bisa dibuat, master data wajib terisi. Ini adalah fondasi seluruh sistem estimasi.",
		actions: [
			"Input Item Pekerjaan (master) beserta satuan (m², m³, unit, ls)",
			"Input Koefisien AHSP (Analisis Harga Satuan Pekerjaan) per item — bisa dari SNI atau custom",
			"Input Master Harga Upah (per tukang, mandor, pekerja) — update per proyek/periode",
			"Input Master Harga Material (per supplier, per region, per waktu)",
			"Input Master Harga Alat Berat (sewa/jam, sewa/hari per jenis alat)",
			"Setup komponen overhead & profit (% dari biaya langsung)",
		],
		output: "Master data siap → bisa dipakai oleh semua proyek",
		warning: null,
	},
	{
		id: 2,
		phase: "ESTIMASI",
		color: "#8b5cf6",
		icon: "🔢",
		title: "Buat RAB / BOQ Baru",
		actor: "Estimator / Site Manager",
		desc: "Estimator membuat RAB baru yang terhubung ke proyek atau tender. Struktur RAB mengikuti WBS (Work Breakdown Structure) proyek.",
		actions: [
			"Buat dokumen RAB baru → link ke Project atau Tender",
			"Tentukan struktur divisi pekerjaan: Pekerjaan Persiapan, Sipil, Mekanikal, Elektrikal, Finishing, dll",
			"Per divisi → input Sub-Item Pekerjaan dengan volume dari gambar teknis (as-design)",
			"Sistem auto-fetch harga satuan dari master AHSP → tampil breakdown biaya (upah+material+alat)",
			"Estimator bisa override harga jika kondisi lapangan berbeda dari standar",
			"Sistem hitung otomatis: Volume × Harga Satuan = Total per item",
			"Rekapitulasi naik ke level divisi → naik ke Total RAB",
		],
		output: "Draft RAB dengan breakdown biaya per item pekerjaan",
		warning:
			"Semua perubahan tersimpan sebagai draft, belum bisa dipakai untuk procurement",
	},
	{
		id: 3,
		phase: "REVIEW",
		color: "#f59e0b",
		icon: "🔍",
		title: "Review & Approval",
		actor: "Project Manager → Chief Estimator → Direktur",
		desc: "RAB masuk ke workflow approval bertingkat sesuai nilai proyek. Setiap approval bisa memberi catatan atau request revisi.",
		actions: [
			"PM review kewajaran volume dan harga satuan vs pengalaman proyek sejenis",
			"Chief Estimator validasi metodologi perhitungan dan AHSP yang digunakan",
			"Jika nilai RAB > threshold → naik ke Direktur untuk final approval",
			"Setiap reviewer bisa 'Reject → Request Revisi' dengan komentar spesifik per baris",
			"Estimator revisi dan submit ulang → histori perubahan tersimpan lengkap",
			"Setelah semua level approve → RAB status berubah menjadi 'Approved'",
		],
		output: "RAB Approved — resmi menjadi acuan biaya proyek",
		warning:
			"Setelah Approved, perubahan hanya bisa via Change Order (CO) yang memiliki approval tersendiri",
	},
	{
		id: 4,
		phase: "EKSEKUSI",
		color: "#10b981",
		icon: "⚙️",
		title: "RAB → Integrasi Operasional",
		actor: "Sistem Otomatis + Tim Operasional",
		desc: "RAB yang sudah approved langsung menjadi sumber data untuk seluruh operasional proyek.",
		actions: [
			"Material dari RAB → auto-generate Material Request ke Procurement (per fase/milestone)",
			"Upah dari RAB → jadi acuan perhitungan mandor/subkon di kontrak kerja",
			"Alat dari RAB → jadi jadwal kebutuhan Equipment ke Departemen Alat",
			"Budget per WBS → masuk ke Project Budget di modul Project Management ERPNext",
			"Setiap Purchase Order, Timesheet, Equipment usage → ter-link ke item RAB untuk tracking aktual",
		],
		output:
			"Seluruh tim operasional bekerja berdasarkan angka yang sama dari satu RAB",
		warning: null,
	},
	{
		id: 5,
		phase: "MONITORING",
		color: "#ef4444",
		icon: "📊",
		title: "RAB vs Realisasi (Cost Control)",
		actor: "Project Manager / Cost Controller",
		desc: "Jantung dari cost control — setiap pengeluaran dibandingkan real-time dengan anggaran RAB.",
		actions: [
			"Setiap GRN (material masuk) → sistem debit biaya ke item RAB terkait",
			"Setiap Timesheet mandor/pekerja → sistem debit ke item RAB pekerjaan terkait",
			"Setiap penggunaan alat berat → sistem debit ke item RAB alat",
			"Dashboard tampilkan: Budget RAB vs Aktual vs % Sisa per item real-time",
			"Early warning otomatis: alert jika realisasi > 80% budget (configurable threshold)",
			"Variance report: identifikasi item mana yang over-budget dan sebabnya",
		],
		output:
			"Cost Control real-time — PM tahu kondisi keuangan proyek setiap saat",
		warning:
			"Tanpa fitur ini, over-budget baru ketahuan di akhir proyek — sudah terlambat",
	},
	{
		id: 6,
		phase: "PERUBAHAN",
		color: "#f97316",
		icon: "🔄",
		title: "Change Order Management",
		actor: "PM → Owner/Klien → Direktur",
		desc: "Perubahan scope di lapangan sangat umum. Setiap perubahan RAB harus terdokumentasi sebagai Change Order (CO/VO).",
		actions: [
			"PM identifikasi pekerjaan tambah/kurang dari scope awal kontrak",
			"Buat dokumen Change Order: item pekerjaan, volume perubahan, harga satuan",
			"Lampirkan justifikasi teknis, foto kondisi lapangan, persetujuan Pengawas/MK",
			"CO melalui approval internal (Direktur) + approval eksternal (Owner/Konsultan MK)",
			"Setelah CO approved → sistem auto-update nilai RAB dan budget proyek",
			"Semua versi RAB tersimpan: RAB Awal, RAB setelah CO-1, CO-2, dst",
			"Nilai CO ter-link ke kontrak → jadi dasar addendum kontrak dan penagihan tambahan",
		],
		output:
			"Riwayat perubahan RAB lengkap dan ter-audit — tidak ada perubahan liar",
		warning: null,
	},
];

const DATA_MODELS = [
	{
		name: "RAB_Header",
		label: "RAB Header",
		color: "#06b6d4",
		icon: "📄",
		type: "DocType Utama",
		desc: "Dokumen induk setiap RAB, satu per proyek/tender",
		fields: [
			{ name: "rab_id", type: "Data", key: true, desc: "RAB-2024-001" },
			{
				name: "project",
				type: "Link → Project",
				key: false,
				desc: "Link ke ERPNext Project",
			},
			{
				name: "tender_ref",
				type: "Data",
				key: false,
				desc: "No. Tender (jika belum jadi proyek)",
			},
			{
				name: "rab_type",
				type: "Select",
				key: false,
				desc: "Penawaran / Pelaksanaan / EPC",
			},
			{
				name: "status",
				type: "Select",
				key: false,
				desc: "Draft / Submitted / Approved / Locked",
			},
			{
				name: "version",
				type: "Int",
				key: false,
				desc: "1, 2, 3 (naik setiap ada CO)",
			},
			{
				name: "parent_rab",
				type: "Link → RAB_Header",
				key: false,
				desc: "Untuk versioning CO",
			},
			{
				name: "total_material",
				type: "Currency",
				key: false,
				desc: "Auto-sum dari items",
			},
			{
				name: "total_upah",
				type: "Currency",
				key: false,
				desc: "Auto-sum dari items",
			},
			{
				name: "total_alat",
				type: "Currency",
				key: false,
				desc: "Auto-sum dari items",
			},
			{
				name: "overhead_pct",
				type: "Percent",
				key: false,
				desc: "% overhead (default 10%)",
			},
			{
				name: "profit_pct",
				type: "Percent",
				key: false,
				desc: "% profit (default 8%)",
			},
			{ name: "ppn_pct", type: "Percent", key: false, desc: "PPN 11%" },
			{
				name: "grand_total",
				type: "Currency",
				key: false,
				desc: "Final setelah OH + profit + PPN",
			},
			{
				name: "approved_by",
				type: "Link → User",
				key: false,
				desc: "User yang approve final",
			},
			{ name: "approved_date", type: "Date", key: false, desc: "" },
		],
	},
	{
		name: "RAB_Division",
		label: "RAB Division",
		color: "#8b5cf6",
		icon: "📁",
		type: "Child DocType",
		desc: "Kelompok pekerjaan (WBS Level 1), misal: Pekerjaan Persiapan, Struktur, Arsitektur",
		fields: [
			{ name: "division_id", type: "Data", key: true, desc: "DIV-001" },
			{
				name: "parent_rab",
				type: "Link → RAB_Header",
				key: false,
				desc: "FK ke header",
			},
			{
				name: "division_name",
				type: "Data",
				key: false,
				desc: "Pekerjaan Struktur Beton",
			},
			{
				name: "division_code",
				type: "Data",
				key: false,
				desc: "02 (kode WBS)",
			},
			{ name: "sequence", type: "Int", key: false, desc: "Urutan tampilan" },
			{
				name: "total_division",
				type: "Currency",
				key: false,
				desc: "Auto-sum dari sub-items",
			},
			{
				name: "bobot_pct",
				type: "Percent",
				key: false,
				desc: "Bobot terhadap total RAB (auto)",
			},
		],
	},
	{
		name: "RAB_Item",
		label: "RAB Item (BOQ Line)",
		color: "#10b981",
		icon: "📝",
		type: "Child DocType — Inti BOQ",
		desc: "Satu baris pekerjaan dalam BOQ — ini adalah tabel paling penting dalam sistem",
		fields: [
			{ name: "item_id", type: "Data", key: true, desc: "ITEM-0042" },
			{
				name: "parent_division",
				type: "Link → RAB_Division",
				key: false,
				desc: "FK ke divisi",
			},
			{
				name: "work_item",
				type: "Link → Work_Item_Master",
				key: false,
				desc: "Pekerjaan Pasang Bata Merah",
			},
			{
				name: "description",
				type: "Text",
				key: false,
				desc: "Deskripsi bebas jika tidak dari master",
			},
			{
				name: "unit",
				type: "Link → UOM",
				key: false,
				desc: "m², m³, unit, ls, kg",
			},
			{
				name: "volume",
				type: "Float",
				key: false,
				desc: "Volume dari gambar teknis",
			},
			{
				name: "ahsp_ref",
				type: "Link → AHSP_Header",
				key: false,
				desc: "Link ke analisa harga satuan",
			},
			{
				name: "unit_material",
				type: "Currency",
				key: false,
				desc: "Harga material per satuan (auto dari AHSP)",
			},
			{
				name: "unit_upah",
				type: "Currency",
				key: false,
				desc: "Harga upah per satuan (auto dari AHSP)",
			},
			{
				name: "unit_alat",
				type: "Currency",
				key: false,
				desc: "Harga alat per satuan (auto dari AHSP)",
			},
			{
				name: "unit_total",
				type: "Currency",
				key: false,
				desc: "Total harga satuan (material+upah+alat)",
			},
			{
				name: "is_override",
				type: "Check",
				key: false,
				desc: "TRUE jika harga satuan di-override manual",
			},
			{
				name: "override_reason",
				type: "Small Text",
				key: false,
				desc: "Alasan override harga",
			},
			{
				name: "total_material",
				type: "Currency",
				key: false,
				desc: "volume × unit_material",
			},
			{
				name: "total_upah",
				type: "Currency",
				key: false,
				desc: "volume × unit_upah",
			},
			{
				name: "total_alat",
				type: "Currency",
				key: false,
				desc: "volume × unit_alat",
			},
			{
				name: "total_item",
				type: "Currency",
				key: false,
				desc: "volume × unit_total",
			},
			{
				name: "bobot_item",
				type: "Percent",
				key: false,
				desc: "% terhadap total RAB (auto-calc)",
			},
			{
				name: "actual_cost",
				type: "Currency",
				key: false,
				desc: "Realisasi dari transaksi aktual (linked)",
			},
			{
				name: "variance",
				type: "Currency",
				key: false,
				desc: "total_item − actual_cost",
			},
		],
	},
	{
		name: "AHSP_Header",
		label: "AHSP Header",
		color: "#f59e0b",
		icon: "🔬",
		type: "Master DocType",
		desc: "Analisa Harga Satuan Pekerjaan — koefisien material, upah, alat per satu satuan pekerjaan",
		fields: [
			{ name: "ahsp_id", type: "Data", key: true, desc: "AHSP-2024-SNI-087" },
			{
				name: "work_item",
				type: "Link → Work_Item_Master",
				key: false,
				desc: "Pasang Bata Merah 1/2 batu",
			},
			{ name: "unit", type: "Link → UOM", key: false, desc: "m²" },
			{
				name: "source",
				type: "Select",
				key: false,
				desc: "SNI / AHSP Nasional / Custom",
			},
			{
				name: "sni_ref",
				type: "Data",
				key: false,
				desc: "SNI 7394:2008-6.3.2",
			},
			{
				name: "valid_from",
				type: "Date",
				key: false,
				desc: "Periode berlaku harga",
			},
			{ name: "valid_to", type: "Date", key: false, desc: "" },
			{
				name: "total_material_coeff",
				type: "Float",
				key: false,
				desc: "Auto-sum koefisien material",
			},
			{
				name: "total_upah_coeff",
				type: "Float",
				key: false,
				desc: "Auto-sum koefisien upah",
			},
			{
				name: "total_alat_coeff",
				type: "Float",
				key: false,
				desc: "Auto-sum koefisien alat",
			},
			{
				name: "unit_price_material",
				type: "Currency",
				key: false,
				desc: "Auto-calc dari detail × harga master",
			},
			{
				name: "unit_price_upah",
				type: "Currency",
				key: false,
				desc: "Auto-calc dari detail × harga master",
			},
			{
				name: "unit_price_alat",
				type: "Currency",
				key: false,
				desc: "Auto-calc dari detail × harga master",
			},
			{
				name: "unit_price_total",
				type: "Currency",
				key: false,
				desc: "Total harga satuan jadi",
			},
		],
	},
	{
		name: "AHSP_Detail",
		label: "AHSP Detail (Koefisien)",
		color: "#ef4444",
		icon: "🧮",
		type: "Child of AHSP_Header",
		desc: "Baris koefisien — berapa kebutuhan tiap komponen untuk menghasilkan 1 satuan pekerjaan",
		fields: [
			{
				name: "component_type",
				type: "Select",
				key: false,
				desc: "Material / Upah / Alat",
			},
			{
				name: "item_ref",
				type: "Dynamic Link",
				key: false,
				desc: "Link ke Material/Labour/Equipment master",
			},
			{
				name: "koefisien",
				type: "Float",
				key: false,
				desc: "0.07 (contoh: 0.07 m³ semen per m²)",
			},
			{
				name: "unit",
				type: "Link → UOM",
				key: false,
				desc: "Satuan koefisien",
			},
			{
				name: "unit_price",
				type: "Currency",
				key: false,
				desc: "Harga satuan komponen (dari master harga)",
			},
			{
				name: "subtotal",
				type: "Currency",
				key: false,
				desc: "koefisien × unit_price (auto)",
			},
		],
	},
	{
		name: "Change_Order",
		label: "Change Order (CO/VO)",
		color: "#f97316",
		icon: "🔄",
		type: "DocType Perubahan",
		desc: "Dokumen resmi setiap perubahan scope/nilai dari RAB yang sudah approved",
		fields: [
			{ name: "co_id", type: "Data", key: true, desc: "CO-2024-003" },
			{
				name: "parent_rab",
				type: "Link → RAB_Header",
				key: false,
				desc: "RAB yang diubah",
			},
			{
				name: "co_type",
				type: "Select",
				key: false,
				desc: "Tambah / Kurang / Ubah Volume",
			},
			{
				name: "initiated_by",
				type: "Link → User",
				key: false,
				desc: "PM yang inisiasi CO",
			},
			{
				name: "reason",
				type: "Text",
				key: false,
				desc: "Justifikasi teknis perubahan",
			},
			{
				name: "owner_approval",
				type: "Select",
				key: false,
				desc: "Pending / Approved / Rejected",
			},
			{
				name: "owner_ref_doc",
				type: "Attach",
				key: false,
				desc: "Scan BA persetujuan owner",
			},
			{
				name: "effective_date",
				type: "Date",
				key: false,
				desc: "Tanggal CO berlaku",
			},
			{
				name: "delta_value",
				type: "Currency",
				key: false,
				desc: "Selisih nilai (+ tambah / - kurang)",
			},
			{
				name: "new_rab_version",
				type: "Link → RAB_Header",
				key: false,
				desc: "RAB versi baru setelah CO",
			},
		],
	},
	{
		name: "Master_Price",
		label: "Master Harga",
		color: "#64748b",
		icon: "💰",
		type: "Master Reference",
		desc: "Harga satuan material, upah, dan alat — sumber data untuk kalkulasi AHSP",
		fields: [
			{ name: "price_id", type: "Data", key: true, desc: "PRC-MAT-2024-001" },
			{
				name: "component_type",
				type: "Select",
				key: false,
				desc: "Material / Labour / Equipment",
			},
			{
				name: "item_name",
				type: "Data",
				key: false,
				desc: "Semen Portland Tipe 1",
			},
			{ name: "item_code", type: "Data", key: false, desc: "MAT-SEM-001" },
			{
				name: "unit",
				type: "Link → UOM",
				key: false,
				desc: "Zak (40kg), m³, OH, Jam",
			},
			{ name: "price", type: "Currency", key: false, desc: "Harga berlaku" },
			{
				name: "region",
				type: "Link → Region",
				key: false,
				desc: "Batam, Jakarta, Surabaya",
			},
			{
				name: "supplier",
				type: "Link → Supplier",
				key: false,
				desc: "Untuk material — opsional",
			},
			{ name: "valid_from", type: "Date", key: false, desc: "" },
			{ name: "valid_to", type: "Date", key: false, desc: "" },
			{
				name: "source",
				type: "Select",
				key: false,
				desc: "Survey / Harga Pasar / Kontrak Supplier",
			},
		],
	},
];

const RELATIONS = [
	{
		from: "RAB_Header",
		to: "RAB_Division",
		label: "1 → N",
		desc: "Satu RAB punya banyak divisi",
	},
	{
		from: "RAB_Division",
		to: "RAB_Item",
		label: "1 → N",
		desc: "Satu divisi punya banyak item",
	},
	{
		from: "RAB_Item",
		to: "AHSP_Header",
		label: "N → 1",
		desc: "Banyak item bisa pakai AHSP yang sama",
	},
	{
		from: "AHSP_Header",
		to: "AHSP_Detail",
		label: "1 → N",
		desc: "Satu AHSP punya banyak baris koefisien",
	},
	{
		from: "AHSP_Detail",
		to: "Master_Price",
		label: "N → 1",
		desc: "Koefisien fetch harga dari master",
	},
	{
		from: "RAB_Header",
		to: "Change_Order",
		label: "1 → N",
		desc: "Satu RAB bisa ada banyak CO",
	},
	{
		from: "Change_Order",
		to: "RAB_Header",
		label: "→ new ver",
		desc: "CO menghasilkan RAB versi baru",
	},
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

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

export default function RABDetail() {
	const [section, setSection] = useState("flow");
	const [activeStep, setActiveStep] = useState(0);
	const [activeModel, setActiveModel] = useState(0);

	const step = FLOW_STEPS[activeStep];

	return (
		<div
			style={{
				background: "#080b10",
				minHeight: "100vh",
				color: "#cbd5e1",
				fontFamily: SANS,
			}}>
			{/* Header */}
			<div
				style={{
					background: "linear-gradient(180deg, #0d1117 0%, #080b10 100%)",
					borderBottom: "1px solid #1e293b",
					padding: "2rem 1.5rem 1.5rem",
				}}>
				<div style={{ maxWidth: 1000, margin: "0 auto" }}>
					<div
						style={{
							fontFamily: FONT,
							fontSize: "0.65rem",
							color: "#475569",
							letterSpacing: 5,
							textTransform: "uppercase",
							marginBottom: 6,
						}}>
						Custom Feature #1 — Deep Dive
					</div>
					<h1
						style={{
							margin: 0,
							fontSize: "clamp(1.4rem, 3vw, 2rem)",
							fontWeight: 700,
							color: "#f8fafc",
							lineHeight: 1.2,
						}}>
						RAB & BOQ Builder
					</h1>
					<p
						style={{
							color: "#64748b",
							margin: "0.5rem 0 0",
							fontSize: "0.875rem",
						}}>
						Rencana Anggaran Biaya · Bill of Quantity · AHSP · Change Order ·
						Cost Control
					</p>
				</div>
			</div>

			{/* Nav */}
			<div
				style={{
					borderBottom: "1px solid #1e293b",
					background: "#080b10",
					position: "sticky",
					top: 0,
					zIndex: 100,
				}}>
				<div
					style={{
						maxWidth: 1000,
						margin: "0 auto",
						padding: "0 1.5rem",
						display: "flex",
						gap: 0,
					}}>
					{[
						{ key: "flow", label: "🔄 Alur & Cara Kerja" },
						{ key: "model", label: "🗄️ Model Data" },
						{ key: "relation", label: "🔗 Relasi Antar Tabel" },
					].map((n) => (
						<button
							key={n.key}
							onClick={() => setSection(n.key)}
							style={{
								padding: "0.85rem 1.2rem",
								background: "none",
								border: "none",
								borderBottom:
									section === n.key
										? "2px solid #06b6d4"
										: "2px solid transparent",
								color: section === n.key ? "#06b6d4" : "#475569",
								fontFamily: SANS,
								fontSize: "0.83rem",
								fontWeight: 600,
								cursor: "pointer",
								whiteSpace: "nowrap",
							}}>
							{n.label}
						</button>
					))}
				</div>
			</div>

			<div style={{ maxWidth: 1000, margin: "0 auto", padding: "1.5rem" }}>
				{/* ── SECTION: FLOW ─────────────────────────────── */}
				{section === "flow" && (
					<div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "220px 1fr",
								gap: 16,
							}}>
							{/* Step list */}
							<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
								{FLOW_STEPS.map((s, i) => (
									<button
										key={i}
										onClick={() => setActiveStep(i)}
										style={{
											textAlign: "left",
											padding: "0.75rem 0.9rem",
											background: activeStep === i ? s.color + "18" : "#0d1117",
											border: `1px solid ${activeStep === i ? s.color : "#1e293b"}`,
											borderRadius: 8,
											cursor: "pointer",
											transition: "all 0.2s",
										}}>
										<div
											style={{ display: "flex", alignItems: "center", gap: 7 }}>
											<span style={{ fontSize: 16 }}>{s.icon}</span>
											<div>
												<div
													style={{
														fontFamily: FONT,
														fontSize: "0.6rem",
														color: activeStep === i ? s.color : "#475569",
														letterSpacing: 2,
													}}>
													{s.phase}
												</div>
												<div
													style={{
														color: activeStep === i ? "#f8fafc" : "#94a3b8",
														fontSize: "0.78rem",
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

							{/* Step detail */}
							<div
								style={{
									background: "#0d1117",
									border: `1px solid ${step.color}40`,
									borderRadius: 12,
									padding: "1.5rem",
									borderTop: `3px solid ${step.color}`,
								}}>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: 10,
										marginBottom: "0.8rem",
									}}>
									<span style={{ fontSize: 28 }}>{step.icon}</span>
									<div>
										<div
											style={{
												fontFamily: FONT,
												fontSize: "0.65rem",
												color: step.color,
												letterSpacing: 3,
											}}>
											STEP {step.id} · {step.phase}
										</div>
										<h2
											style={{
												margin: 0,
												color: "#f8fafc",
												fontSize: "1.1rem",
												fontWeight: 700,
											}}>
											{step.title}
										</h2>
									</div>
								</div>

								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: 8,
										marginBottom: "0.9rem",
									}}>
									<span style={{ color: "#475569", fontSize: "0.75rem" }}>
										👤 Aktor:
									</span>
									<TAG color={step.color}>{step.actor}</TAG>
								</div>

								<p
									style={{
										color: "#94a3b8",
										fontSize: "0.875rem",
										lineHeight: 1.7,
										margin: "0 0 1rem",
									}}>
									{step.desc}
								</p>

								<div style={{ marginBottom: "1rem" }}>
									<div
										style={{
											fontFamily: FONT,
											fontSize: "0.62rem",
											color: "#475569",
											letterSpacing: 2,
											marginBottom: 8,
											textTransform: "uppercase",
										}}>
										Detail Aksi / Proses:
									</div>
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											gap: 6,
										}}>
										{step.actions.map((a, i) => (
											<div
												key={i}
												style={{
													display: "flex",
													gap: 10,
													padding: "0.6rem 0.8rem",
													background: "#080b10",
													borderRadius: 6,
													borderLeft: `2px solid ${step.color}55`,
												}}>
												<span
													style={{
														color: step.color,
														fontFamily: FONT,
														fontSize: "0.7rem",
														minWidth: 20,
														paddingTop: 2,
													}}>
													{String(i + 1).padStart(2, "0")}
												</span>
												<span
													style={{
														color: "#94a3b8",
														fontSize: "0.83rem",
														lineHeight: 1.6,
													}}>
													{a}
												</span>
											</div>
										))}
									</div>
								</div>

								<div
									style={{
										background: step.color + "12",
										border: `1px solid ${step.color}30`,
										borderRadius: 8,
										padding: "0.75rem 1rem",
										marginBottom: step.warning ? "0.8rem" : 0,
									}}>
									<span
										style={{
											fontFamily: FONT,
											fontSize: "0.62rem",
											color: step.color,
											letterSpacing: 2,
										}}>
										OUTPUT →{" "}
									</span>
									<span style={{ color: "#e2e8f0", fontSize: "0.83rem" }}>
										{step.output}
									</span>
								</div>

								{step.warning && (
									<div
										style={{
											background: "#f59e0b12",
											border: "1px solid #f59e0b30",
											borderRadius: 8,
											padding: "0.75rem 1rem",
											display: "flex",
											gap: 8,
										}}>
										<span>⚠️</span>
										<span style={{ color: "#fcd34d", fontSize: "0.82rem" }}>
											{step.warning}
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Cara kerja kalkulasi AHSP */}
						<div
							style={{
								marginTop: 20,
								background: "#0d1117",
								border: "1px solid #1e293b",
								borderRadius: 12,
								padding: "1.5rem",
							}}>
							<div
								style={{
									fontFamily: FONT,
									fontSize: "0.62rem",
									color: "#475569",
									letterSpacing: 3,
									marginBottom: "1rem",
									textTransform: "uppercase",
								}}>
								🔢 Mekanisme Kalkulasi Harga Satuan (AHSP)
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
									gap: 10,
									marginBottom: 16,
								}}>
								{[
									{
										label: "Material",
										color: "#06b6d4",
										example: "Semen 0.215 zak × Rp 65.000 = Rp 13.975",
										icon: "🧱",
									},
									{
										label: "Upah",
										color: "#8b5cf6",
										example: "Tukang 0.200 OH × Rp 180.000 = Rp 36.000",
										icon: "👷",
									},
									{
										label: "Alat",
										color: "#10b981",
										example: "Molen 0.030 jam × Rp 120.000 = Rp 3.600",
										icon: "🔧",
									},
								].map((c, i) => (
									<div
										key={i}
										style={{
											background: "#080b10",
											borderRadius: 8,
											padding: "0.9rem",
											borderLeft: `3px solid ${c.color}`,
										}}>
										<div
											style={{
												display: "flex",
												gap: 6,
												alignItems: "center",
												marginBottom: 6,
											}}>
											<span>{c.icon}</span>
											<span
												style={{
													color: c.color,
													fontWeight: 700,
													fontSize: "0.85rem",
												}}>
												{c.label}
											</span>
										</div>
										<div
											style={{
												fontFamily: FONT,
												fontSize: "0.72rem",
												color: "#64748b",
												lineHeight: 1.6,
											}}>
											{c.example}
										</div>
									</div>
								))}
							</div>
							<div
								style={{
									background: "#f8fafc08",
									borderRadius: 8,
									padding: "0.8rem 1rem",
									fontFamily: FONT,
									fontSize: "0.75rem",
									color: "#94a3b8",
									lineHeight: 1.8,
								}}>
								<span style={{ color: "#f8fafc", fontWeight: 700 }}>
									Harga Satuan Total
								</span>
								{
									" = (Material + Upah + Alat) × (1 + %Overhead) × (1 + %Profit) × (1 + %PPN)"
								}
								<br />
								<span style={{ color: "#f59e0b" }}>
									= (13.975 + 36.000 + 3.600) × 1.10 × 1.08 × 1.11 = ~Rp
									64.800/m²
								</span>
								<br />
								<span style={{ color: "#475569", fontSize: "0.68rem" }}>
									Volume 500 m² × Rp 64.800 = Total Item Rp 32.400.000
								</span>
							</div>
						</div>
					</div>
				)}

				{/* ── SECTION: MODEL ─────────────────────────────── */}
				{section === "model" && (
					<div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "200px 1fr",
								gap: 14,
							}}>
							{/* Table list */}
							<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
								{DATA_MODELS.map((m, i) => (
									<button
										key={i}
										onClick={() => setActiveModel(i)}
										style={{
											textAlign: "left",
											padding: "0.7rem 0.85rem",
											background:
												activeModel === i ? m.color + "18" : "#0d1117",
											border: `1px solid ${activeModel === i ? m.color : "#1e293b"}`,
											borderRadius: 8,
											cursor: "pointer",
											transition: "all 0.2s",
										}}>
										<div
											style={{ display: "flex", gap: 7, alignItems: "center" }}>
											<span style={{ fontSize: 14 }}>{m.icon}</span>
											<div>
												<div
													style={{
														color: activeModel === i ? "#f8fafc" : "#94a3b8",
														fontSize: "0.78rem",
														fontWeight: 700,
													}}>
													{m.label}
												</div>
												<div
													style={{
														fontFamily: FONT,
														fontSize: "0.6rem",
														color: activeModel === i ? m.color : "#475569",
													}}>
													{m.type}
												</div>
											</div>
										</div>
									</button>
								))}
							</div>

							{/* Table detail */}
							{(() => {
								const m = DATA_MODELS[activeModel];
								return (
									<div
										style={{
											background: "#0d1117",
											border: `1px solid ${m.color}40`,
											borderRadius: 12,
											padding: "1.3rem",
											borderTop: `3px solid ${m.color}`,
										}}>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "flex-start",
												marginBottom: "0.8rem",
												flexWrap: "wrap",
												gap: 8,
											}}>
											<div>
												<div
													style={{
														display: "flex",
														gap: 8,
														alignItems: "center",
														marginBottom: 4,
													}}>
													<span style={{ fontSize: 22 }}>{m.icon}</span>
													<span
														style={{
															color: "#f8fafc",
															fontWeight: 700,
															fontSize: "1.05rem",
														}}>
														{m.label}
													</span>
													<TAG color={m.color}>{m.type}</TAG>
												</div>
												<p
													style={{
														color: "#64748b",
														margin: 0,
														fontSize: "0.8rem",
													}}>
													{m.desc}
												</p>
											</div>
											<div
												style={{
													fontFamily: FONT,
													fontSize: "0.65rem",
													color: "#475569",
												}}>
												{m.fields.length} fields
											</div>
										</div>

										{/* Field table */}
										<div style={{ overflowX: "auto" }}>
											<table
												style={{
													width: "100%",
													borderCollapse: "collapse",
													fontSize: "0.78rem",
												}}>
												<thead>
													<tr style={{ background: "#080b10" }}>
														{["Field Name", "Type", "Keterangan"].map((h) => (
															<th
																key={h}
																style={{
																	padding: "0.5rem 0.75rem",
																	textAlign: "left",
																	color: "#475569",
																	fontFamily: FONT,
																	fontSize: "0.62rem",
																	letterSpacing: 2,
																	borderBottom: "1px solid #1e293b",
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
																borderBottom: "1px solid #0f1623",
																background: f.key
																	? m.color + "08"
																	: "transparent",
															}}>
															<td
																style={{
																	padding: "0.5rem 0.75rem",
																	fontFamily: FONT,
																	color: f.key ? m.color : "#94a3b8",
																	fontSize: "0.75rem",
																	whiteSpace: "nowrap",
																}}>
																{f.key && (
																	<span style={{ marginRight: 4 }}>🔑</span>
																)}
																{f.name}
															</td>
															<td
																style={{
																	padding: "0.5rem 0.75rem",
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
																					: f.type === "Check"
																						? "#f59e0b"
																						: f.type === "Attach"
																							? "#f97316"
																							: "#64748b"
																	}>
																	{f.type}
																</TAG>
															</td>
															<td
																style={{
																	padding: "0.5rem 0.75rem",
																	color: "#64748b",
																	fontSize: "0.75rem",
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
					</div>
				)}

				{/* ── SECTION: RELATION ─────────────────────────── */}
				{section === "relation" && (
					<div>
						{/* ERD visual */}
						<div
							style={{
								background: "#0d1117",
								border: "1px solid #1e293b",
								borderRadius: 12,
								padding: "1.5rem",
								marginBottom: 16,
							}}>
							<div
								style={{
									fontFamily: FONT,
									fontSize: "0.62rem",
									color: "#475569",
									letterSpacing: 3,
									marginBottom: "1.2rem",
									textTransform: "uppercase",
								}}>
								Entity Relationship Diagram (ERD)
							</div>
							<div
								style={{
									display: "flex",
									flexWrap: "wrap",
									gap: 10,
									justifyContent: "center",
									alignItems: "flex-start",
								}}>
								{/* ERD boxes */}
								{[
									{ name: "RAB_Header", color: "#06b6d4", x: 0 },
									{ name: "RAB_Division", color: "#8b5cf6", x: 1 },
									{ name: "RAB_Item", color: "#10b981", x: 2 },
									{ name: "AHSP_Header", color: "#f59e0b", x: 3 },
									{ name: "AHSP_Detail", color: "#ef4444", x: 4 },
									{ name: "Master_Price", color: "#64748b", x: 5 },
									{ name: "Change_Order", color: "#f97316", x: 6 },
								].map((e, i) => {
									const model = DATA_MODELS.find((d) => d.name === e.name);
									return (
										<div
											key={i}
											style={{
												background: "#080b10",
												border: `1px solid ${e.color}50`,
												borderRadius: 8,
												padding: "0.7rem 1rem",
												minWidth: 130,
												borderTop: `3px solid ${e.color}`,
											}}>
											<div
												style={{
													color: e.color,
													fontWeight: 700,
													fontSize: "0.78rem",
													marginBottom: 4,
												}}>
												{model?.icon} {e.name}
											</div>
											<div
												style={{
													color: "#475569",
													fontFamily: FONT,
													fontSize: "0.62rem",
												}}>
												{model?.type}
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Relations list */}
						<div
							style={{
								background: "#0d1117",
								border: "1px solid #1e293b",
								borderRadius: 12,
								padding: "1.3rem",
							}}>
							<div
								style={{
									fontFamily: FONT,
									fontSize: "0.62rem",
									color: "#475569",
									letterSpacing: 3,
									marginBottom: "1rem",
									textTransform: "uppercase",
								}}>
								Relasi Antar Tabel
							</div>
							<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
								{RELATIONS.map((r, i) => {
									const fromModel = DATA_MODELS.find((d) => d.name === r.from);
									const toModel = DATA_MODELS.find((d) => d.name === r.to);
									return (
										<div
											key={i}
											style={{
												display: "flex",
												alignItems: "center",
												gap: 10,
												padding: "0.75rem 1rem",
												background: "#080b10",
												borderRadius: 8,
												flexWrap: "wrap",
											}}>
											<span
												style={{
													color: fromModel?.color || "#94a3b8",
													fontFamily: FONT,
													fontSize: "0.78rem",
													fontWeight: 700,
													minWidth: 120,
												}}>
												{r.from}
											</span>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: 6,
												}}>
												<div
													style={{
														height: 1,
														width: 30,
														background: "#1e293b",
													}}
												/>
												<TAG color="#94a3b8">{r.label}</TAG>
												<div
													style={{
														height: 1,
														width: 30,
														background: "#1e293b",
													}}
												/>
											</div>
											<span
												style={{
													color: toModel?.color || "#94a3b8",
													fontFamily: FONT,
													fontSize: "0.78rem",
													fontWeight: 700,
													minWidth: 120,
												}}>
												{r.to}
											</span>
											<span
												style={{
													color: "#475569",
													fontSize: "0.78rem",
													flex: 1,
												}}>
												{r.desc}
											</span>
										</div>
									);
								})}
							</div>
						</div>

						{/* Frappe DocType note */}
						<div
							style={{
								marginTop: 14,
								background: "#0d1117",
								border: "1px solid #1e293b",
								borderRadius: 12,
								padding: "1.3rem",
							}}>
							<div
								style={{
									fontFamily: FONT,
									fontSize: "0.62rem",
									color: "#475569",
									letterSpacing: 3,
									marginBottom: "0.9rem",
									textTransform: "uppercase",
								}}>
								💡 Implementasi di Frappe / ERPNext
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
									gap: 10,
								}}>
								{[
									{
										label: "DocType Utama",
										color: "#06b6d4",
										items: [
											"RAB_Header",
											"AHSP_Header",
											"Change_Order",
											"Master_Price",
										],
										tip: "Buat sebagai standalone DocType dengan form view & list view",
									},
									{
										label: "Child DocType",
										color: "#8b5cf6",
										items: ["RAB_Division", "RAB_Item", "AHSP_Detail"],
										tip: "Ditampilkan sebagai Table (child table) di dalam DocType induknya",
									},
									{
										label: "Computed Fields",
										color: "#10b981",
										items: [
											"total_item",
											"bobot_item",
											"unit_price_total",
											"grand_total",
										],
										tip: "Pakai Frappe Formula Field atau Server Script untuk kalkulasi otomatis",
									},
									{
										label: "Workflow",
										color: "#f59e0b",
										items: ["Draft → Submitted → Approved → Locked"],
										tip: "Frappe Workflow Engine — set approval roles & permission per state",
									},
								].map((g, i) => (
									<div
										key={i}
										style={{
											background: "#080b10",
											borderRadius: 8,
											padding: "0.9rem",
											borderLeft: `3px solid ${g.color}`,
										}}>
										<div
											style={{
												color: g.color,
												fontWeight: 700,
												fontSize: "0.82rem",
												marginBottom: 6,
											}}>
											{g.label}
										</div>
										{g.items.map((item, j) => (
											<div
												key={j}
												style={{
													fontFamily: FONT,
													fontSize: "0.7rem",
													color: "#94a3b8",
													marginBottom: 2,
												}}>
												· {item}
											</div>
										))}
										<div
											style={{
												color: "#475569",
												fontSize: "0.72rem",
												marginTop: 8,
												lineHeight: 1.5,
											}}>
											{g.tip}
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
