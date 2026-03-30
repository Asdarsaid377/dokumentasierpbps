import { useState } from "react";

const data = {
	builtin: [
		{
			category: "Project Management",
			icon: "🏗️",
			color: "#F59E0B",
			desc: "Manajemen proyek konstruksi end-to-end",
			features: [
				{
					name: "Project & Task Management",
					detail:
						"Buat proyek, milestone, sub-task, Gantt chart untuk setiap proyek konstruksi",
				},
				{
					name: "Project Costing",
					detail:
						"Budget vs Actual cost per proyek, variance analysis real-time",
				},
				{
					name: "Project Billing",
					detail:
						"Penagihan berbasis progress (progress billing) atau milestone",
				},
				{
					name: "Timesheet & Resource Allocation",
					detail: "Alokasi tenaga kerja, jam kerja, overtime per proyek",
				},
			],
		},
		{
			category: "Procurement & SCM",
			icon: "📦",
			color: "#3B82F6",
			desc: "Pengadaan material dan manajemen vendor",
			features: [
				{
					name: "Purchase Order & RFQ",
					detail:
						"Permintaan penawaran harga, perbandingan vendor, PO approval workflow",
				},
				{
					name: "Supplier Management",
					detail: "Database vendor, rating, blacklist, term pembayaran",
				},
				{
					name: "Material Request",
					detail: "Permintaan material dari site ke gudang atau procurement",
				},
				{
					name: "Landed Cost Voucher",
					detail: "Kalkulasi biaya pengiriman material ke dalam HPP",
				},
			],
		},
		{
			category: "Inventory & Warehouse",
			icon: "🏭",
			color: "#10B981",
			desc: "Manajemen stok material di gudang & site",
			features: [
				{
					name: "Multi-Warehouse",
					detail: "Gudang pusat, gudang site, stok per lokasi proyek",
				},
				{
					name: "Stock Ledger & Valuation",
					detail: "FIFO/Moving Average, riwayat pergerakan material lengkap",
				},
				{
					name: "Delivery Note & GRN",
					detail: "Penerimaan material, retur, transfer antar lokasi",
				},
				{
					name: "Asset Management",
					detail:
						"Manajemen alat berat, kendaraan, depresiasi, maintenance schedule",
				},
			],
		},
		{
			category: "Accounting & Finance",
			icon: "💰",
			color: "#8B5CF6",
			desc: "Keuangan proyek dan perusahaan",
			features: [
				{
					name: "Chart of Accounts (CoA)",
					detail: "Struktur akun sesuai standar konstruksi, multi-currency",
				},
				{
					name: "Accounts Payable/Receivable",
					detail: "Hutang material, piutang owner/klien, aging report",
				},
				{
					name: "Bank Reconciliation",
					detail: "Rekonsiliasi otomatis, multi-rekening bank",
				},
				{
					name: "Financial Reports",
					detail: "P&L, Balance Sheet, Cash Flow per proyek maupun konsolidasi",
				},
			],
		},
		{
			category: "HR & Payroll",
			icon: "👷",
			color: "#EF4444",
			desc: "SDM lapangan dan kantor",
			features: [
				{
					name: "Employee Management",
					detail: "Data karyawan, organogram, kontrak kerja, BPJS",
				},
				{
					name: "Attendance & Leave",
					detail: "Absensi site, cuti, izin, lembur dengan approval workflow",
				},
				{
					name: "Payroll Processing",
					detail: "Slip gaji, PPh21, BPJS Ketenagakerjaan & Kesehatan otomatis",
				},
				{
					name: "Expense Claims",
					detail: "Reimbursement perjalanan dinas, uang muka kerja (UMK)",
				},
			],
		},
		{
			category: "CRM & Sales",
			icon: "🤝",
			color: "#F97316",
			desc: "Pipeline tender dan manajemen klien",
			features: [
				{
					name: "Lead & Opportunity",
					detail: "Tracking tender, proposal, pipeline proyek baru",
				},
				{
					name: "Quotation & Contract",
					detail: "RAB, penawaran harga, kontrak klien, addendum",
				},
				{
					name: "Customer Management",
					detail: "Database owner/klien, riwayat proyek, credit limit",
				},
			],
		},
	],
	custom: [
		{
			category: "RAB & Estimasi Biaya",
			icon: "📐",
			priority: "CRITICAL",
			color: "#DC2626",
			features: [
				{
					name: "Bill of Quantity (BOQ) Builder",
					detail:
						"Input volume pekerjaan, harga satuan, koefisien SNI/AHSP otomatis",
				},
				{
					name: "Rate Analysis",
					detail:
						"Analisa harga satuan pekerjaan (AHSP) sesuai SNI per item pekerjaan",
				},
				{
					name: "RAB vs Realisasi",
					detail:
						"Perbandingan anggaran vs biaya aktual per item pekerjaan real-time",
				},
				{
					name: "Tender Document Generator",
					detail:
						"Generate dokumen penawaran, RAB, jadwal pelaksanaan otomatis",
				},
				{
					name: "Revisi & Versioning RAB",
					detail:
						"Histori perubahan RAB, persetujuan addendum, change order management",
				},
			],
		},
		{
			category: "Manajemen Subkontraktor",
			icon: "🔧",
			priority: "CRITICAL",
			color: "#DC2626",
			features: [
				{
					name: "Subcon Contract Management",
					detail:
						"Kontrak subkon, scope pekerjaan, nilai kontrak, term pembayaran",
				},
				{
					name: "Subcon Progress & Opname",
					detail: "Pengukuran progress subkon di lapangan, berita acara opname",
				},
				{
					name: "Subcon Invoice & Retention",
					detail: "Tagihan subkon, retensi 5-10%, pencairan setelah FHO/PHO",
				},
				{
					name: "Subcon Performance Rating",
					detail:
						"Evaluasi kualitas, ketepatan waktu, kesesuaian spesifikasi subkon",
				},
			],
		},
		{
			category: "Progress & Opname Lapangan",
			icon: "📊",
			priority: "HIGH",
			color: "#D97706",
			features: [
				{
					name: "Daily/Weekly Progress Report",
					detail:
						"Laporan harian lapangan (LHL): cuaca, tenaga kerja, pekerjaan selesai",
				},
				{
					name: "S-Curve & Bobot Pekerjaan",
					detail: "Kurva S rencana vs realisasi, bobot per item pekerjaan",
				},
				{
					name: "Berita Acara Opname",
					detail:
						"Digital BA opname, tanda tangan elektronik pengawas & site manager",
				},
				{
					name: "Photo Documentation",
					detail:
						"Dokumentasi foto progress terhubung ke item pekerjaan & milestone",
				},
				{
					name: "Quality Inspection Checklist",
					detail:
						"Checklist QC per item pekerjaan, non-conformance report (NCR)",
				},
			],
		},
		{
			category: "Manajemen Alat Berat",
			icon: "🚜",
			priority: "HIGH",
			color: "#D97706",
			features: [
				{
					name: "Equipment Scheduling",
					detail:
						"Jadwal pemakaian alat berat antar proyek, idle time monitoring",
				},
				{
					name: "Fuel & Spare Parts Tracking",
					detail:
						"Konsumsi BBM, suku cadang, biaya operasional per alat per proyek",
				},
				{
					name: "Preventive Maintenance",
					detail:
						"Jadwal servis berkala, work order maintenance, downtime history",
				},
				{
					name: "Equipment Cost Allocation",
					detail: "Alokasi biaya sewa/pemakaian alat ke biaya proyek otomatis",
				},
			],
		},
		{
			category: "Manajemen K3 & HSE",
			icon: "🦺",
			priority: "HIGH",
			color: "#D97706",
			features: [
				{
					name: "Hazard Identification & HIRARC",
					detail:
						"Identifikasi bahaya, penilaian risiko, pengendalian per area kerja",
				},
				{
					name: "Incident & Near Miss Reporting",
					detail:
						"Pelaporan kecelakaan, near miss, investigasi, tindakan korektif",
				},
				{
					name: "Safety Induction Management",
					detail:
						"Tracking induction karyawan & tamu, masa berlaku sertifikat K3",
				},
				{
					name: "Safety Meeting & Tool Box Talk",
					detail: "Jadwal, absensi, notulen safety meeting harian/mingguan",
				},
			],
		},
		{
			category: "Penagihan & Cash Flow Proyek",
			icon: "💳",
			priority: "HIGH",
			color: "#D97706",
			features: [
				{
					name: "Progress Invoice (Termin)",
					detail:
						"Penagihan termin berbasis % progress terverifikasi, BA opname",
				},
				{
					name: "Retention Management",
					detail:
						"Tracking retensi per kontrak, jadwal pencairan, masa pemeliharaan",
				},
				{
					name: "Down Payment (Uang Muka)",
					detail: "Pengelolaan DP, deduction UM per termin secara otomatis",
				},
				{
					name: "Project Cash Flow Forecast",
					detail: "Proyeksi arus kas per proyek, early warning deficit kas",
				},
			],
		},
		{
			category: "Dokumen & Kontrak",
			icon: "📋",
			priority: "MEDIUM",
			color: "#2563EB",
			features: [
				{
					name: "Contract Repository",
					detail: "Penyimpanan kontrak, addendum, surat menyurat per proyek",
				},
				{
					name: "Document Expiry Alert",
					detail: "Notifikasi izin kadaluarsa: SIUJK, SKK, SBU, SLF, SIPA",
				},
				{
					name: "Approval Workflow Engine",
					detail: "Kustomisasi alur persetujuan dokumen sesuai SOA perusahaan",
				},
				{
					name: "Drawing Management",
					detail: "Versioning gambar teknis, shop drawing, as-built drawing",
				},
			],
		},
		{
			category: "Dashboard & Analytics",
			icon: "📈",
			priority: "MEDIUM",
			color: "#2563EB",
			features: [
				{
					name: "Executive Dashboard",
					detail:
						"Overview semua proyek: status, progress, profitabilitas, cash flow",
				},
				{
					name: "Project Profitability Report",
					detail: "Margin per proyek, trend laba, proyek tidak menguntungkan",
				},
				{
					name: "Resource Utilization Report",
					detail: "Utilisasi tenaga kerja, alat, material antar proyek",
				},
				{
					name: "KPI Monitoring",
					detail:
						"SPI, CPI, Schedule Variance, Cost Variance (Earned Value Management)",
				},
			],
		},
	],
};

const priorityBadge = {
	CRITICAL: "bg-red-100 text-red-700 border-red-200",
	HIGH: "bg-amber-100 text-amber-700 border-amber-200",
	MEDIUM: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function Kebutuhan() {
	const [tab, setTab] = useState("builtin");
	const [expanded, setExpanded] = useState(null);

	const toggle = (key) => setExpanded(expanded === key ? null : key);
	const list = tab === "builtin" ? data.builtin : data.custom;

	return (
		<div
			style={{
				fontFamily: "'Georgia', serif",
				background: "#0f1117",
				minHeight: "100vh",
				color: "#e2e8f0",
			}}>
			{/* Header */}
			<div
				style={{
					background: "linear-gradient(135deg, #1a1f2e 0%, #0f1117 100%)",
					borderBottom: "1px solid #1e2535",
					padding: "2.5rem 2rem 2rem",
				}}>
				<div style={{ margin: "0 auto" }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 12,
							marginBottom: 8,
						}}>
						<span style={{ fontSize: 32 }}>🏗️</span>
						<div>
							<div
								style={{
									fontSize: 11,
									letterSpacing: 4,
									textTransform: "uppercase",
									color: "#64748b",
									fontFamily: "monospace",
								}}>
								Senior System Design
							</div>
							<h1
								style={{
									margin: 0,
									fontSize: "1.8rem",
									fontWeight: 700,
									color: "#f1f5f9",
									lineHeight: 1.2,
								}}>
								ERPNext untuk Perusahaan Kontraktor
							</h1>
						</div>
					</div>
					<p
						style={{
							color: "#94a3b8",
							margin: "0.8rem 0 0",
							fontSize: "0.95rem",
							maxWidth: 600,
						}}>
						Blueprint implementasi lengkap — modul bawaan ERPNext yang relevan +
						kustomisasi yang wajib dibangun untuk kebutuhan kontraktor.
					</p>
				</div>
			</div>

			{/* Tab */}
			<div
				style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 2rem 0" }}>
				<div
					style={{
						display: "flex",
						gap: 8,
						background: "#1a1f2e",
						borderRadius: 10,
						padding: 5,
						marginBottom: "1.5rem",
						width: "fit-content",
					}}>
					{[
						{
							key: "builtin",
							label: "✅ Fitur Bawaan ERPNext",
							count: data.builtin.length,
						},
						{
							key: "custom",
							label: "⚡ Kustomisasi Wajib",
							count: data.custom.length,
						},
					].map((t) => (
						<button
							key={t.key}
							onClick={() => {
								setTab(t.key);
								setExpanded(null);
							}}
							style={{
								padding: "0.5rem 1.2rem",
								borderRadius: 7,
								border: "none",
								cursor: "pointer",
								fontFamily: "inherit",
								fontSize: "0.875rem",
								fontWeight: 600,
								transition: "all 0.2s",
								background: tab === t.key ? "#3b82f6" : "transparent",
								color: tab === t.key ? "#fff" : "#64748b",
							}}>
							{t.label}{" "}
							<span style={{ opacity: 0.7, fontSize: "0.8rem" }}>
								({t.count})
							</span>
						</button>
					))}
				</div>

				{tab === "builtin" && (
					<div
						style={{
							background: "#1a1f2e",
							border: "1px solid #1e2535",
							borderRadius: 10,
							padding: "0.9rem 1.2rem",
							marginBottom: "1.2rem",
							display: "flex",
							alignItems: "center",
							gap: 10,
						}}>
						<span style={{ fontSize: 18 }}>💡</span>
						<p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>
							Modul ini sudah tersedia di ERPNext — cukup{" "}
							<strong style={{ color: "#f1f5f9" }}>
								aktifkan, konfigurasi, dan sesuaikan
							</strong>{" "}
							dengan proses bisnis kontraktor Anda. Tidak perlu development dari
							nol.
						</p>
					</div>
				)}
				{tab === "custom" && (
					<div
						style={{
							background: "#1a1f2e",
							border: "1px solid #dc2626",
							borderRadius: 10,
							padding: "0.9rem 1.2rem",
							marginBottom: "1.2rem",
							display: "flex",
							alignItems: "center",
							gap: 10,
						}}>
						<span style={{ fontSize: 18 }}>🔨</span>
						<p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>
							Fitur ini{" "}
							<strong style={{ color: "#fca5a5" }}>tidak tersedia</strong> di
							ERPNext standar dan harus dibangun melalui{" "}
							<strong style={{ color: "#f1f5f9" }}>
								Custom App / Frappe Custom DocType / ERPNext Construction Module
							</strong>
							.
						</p>
					</div>
				)}

				{/* Cards */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 10,
						paddingBottom: "2rem",
					}}>
					{list.map((section, i) => {
						const key = `${tab}-${i}`;
						const isOpen = expanded === key;
						return (
							<div
								key={key}
								style={{
									background: "#1a1f2e",
									border: `1px solid ${isOpen ? section.color + "55" : "#1e2535"}`,
									borderRadius: 12,
									overflow: "hidden",
									transition: "border-color 0.2s",
								}}>
								<button
									onClick={() => toggle(key)}
									style={{
										width: "100%",
										background: "none",
										border: "none",
										padding: "1rem 1.2rem",
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										gap: 12,
										textAlign: "left",
									}}>
									<span style={{ fontSize: 26, lineHeight: 1 }}>
										{section.icon}
									</span>
									<div style={{ flex: 1 }}>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: 8,
												flexWrap: "wrap",
											}}>
											<span
												style={{
													fontWeight: 700,
													color: "#f1f5f9",
													fontSize: "1rem",
													fontFamily: "inherit",
												}}>
												{section.category}
											</span>
											{section.priority && (
												<span
													style={{
														fontSize: "0.7rem",
														fontWeight: 700,
														letterSpacing: 1,
														padding: "2px 8px",
														borderRadius: 20,
														border: "1px solid",
														fontFamily: "monospace",
														...Object.fromEntries(
															Object.entries(
																priorityBadge[section.priority] ? {} : {},
															).concat([["className", ""]]),
														),
													}}
													className={priorityBadge[section.priority]}>
													{section.priority}
												</span>
											)}
										</div>
										{section.desc && (
											<div
												style={{
													color: "#64748b",
													fontSize: "0.8rem",
													marginTop: 2,
												}}>
												{section.desc}
											</div>
										)}
									</div>
									<div
										style={{ display: "flex", alignItems: "center", gap: 10 }}>
										<span
											style={{
												fontSize: "0.75rem",
												color: "#475569",
												fontFamily: "monospace",
											}}>
											{section.features.length} fitur
										</span>
										<span
											style={{
												color: section.color,
												fontSize: "1.1rem",
												transition: "transform 0.2s",
												display: "inline-block",
												transform: isOpen ? "rotate(90deg)" : "none",
											}}>
											›
										</span>
									</div>
								</button>

								{isOpen && (
									<div
										style={{
											borderTop: "1px solid #1e2535",
											padding: "0.8rem 1.2rem 1.2rem",
										}}>
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: 8,
											}}>
											{section.features.map((f, j) => (
												<div
													key={j}
													style={{
														display: "flex",
														gap: 12,
														padding: "0.75rem 1rem",
														background: "#0f1117",
														borderRadius: 8,
														borderLeft: `3px solid ${section.color}`,
													}}>
													<div style={{ flex: 1 }}>
														<div
															style={{
																fontWeight: 600,
																color: "#e2e8f0",
																fontSize: "0.9rem",
																marginBottom: 3,
															}}>
															{f.name}
														</div>
														<div
															style={{
																color: "#64748b",
																fontSize: "0.82rem",
																lineHeight: 1.5,
															}}>
															{f.detail}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>

				{/* Summary */}
				<div
					style={{
						background: "linear-gradient(135deg, #1e2535, #1a1f2e)",
						border: "1px solid #2d3748",
						borderRadius: 14,
						padding: "1.5rem",
						marginBottom: "2rem",
					}}>
					<h3
						style={{
							margin: "0 0 1rem",
							color: "#f1f5f9",
							fontSize: "1rem",
							fontWeight: 700,
						}}>
						📌 Rekomendasi Strategi Implementasi
					</h3>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
							gap: 12,
						}}>
						{[
							{
								phase: "Phase 1 (Bulan 1–2)",
								label: "Foundation",
								items: "Accounting, HR, Procurement, Inventory",
								color: "#3b82f6",
							},
							{
								phase: "Phase 2 (Bulan 3–4)",
								label: "Operasional",
								items: "Project Mgmt, RAB Builder, Progress & Opname",
								color: "#10b981",
							},
							{
								phase: "Phase 3 (Bulan 5–6)",
								label: "Advanced",
								items: "Subkon, Alat Berat, K3, Dashboard Analytics",
								color: "#f59e0b",
							},
							{
								phase: "Phase 4 (Ongoing)",
								label: "Optimasi",
								items: "Integrasi, Custom Report, User Training",
								color: "#8b5cf6",
							},
						].map((p, i) => (
							<div
								key={i}
								style={{
									background: "#0f1117",
									borderRadius: 10,
									padding: "1rem",
									borderTop: `3px solid ${p.color}`,
								}}>
								<div
									style={{
										fontSize: "0.7rem",
										color: p.color,
										fontWeight: 700,
										letterSpacing: 1,
										textTransform: "uppercase",
										fontFamily: "monospace",
									}}>
									{p.phase}
								</div>
								<div
									style={{
										fontWeight: 700,
										color: "#f1f5f9",
										margin: "4px 0 4px",
										fontSize: "0.9rem",
									}}>
									{p.label}
								</div>
								<div
									style={{
										color: "#64748b",
										fontSize: "0.78rem",
										lineHeight: 1.5,
									}}>
									{p.items}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
