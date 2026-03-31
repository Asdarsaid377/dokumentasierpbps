"use client";

import { useState } from "react";

// ─── Tokens ───────────────────────────────────────────────────────────────────

const VARIANTS = {
	blue: {
		bg: "#E6F1FB",
		border: "#185FA5",
		title: "#0C447C",
		subtitle: "#185FA5",
	},
	green: {
		bg: "#EAF3DE",
		border: "#3B6D11",
		title: "#27500A",
		subtitle: "#3B6D11",
	},
	amber: {
		bg: "#FAEEDA",
		border: "#854F0B",
		title: "#633806",
		subtitle: "#854F0B",
	},
	red: {
		bg: "#FCEBEB",
		border: "#A32D2D",
		title: "#791F1F",
		subtitle: "#A32D2D",
	},
	purple: {
		bg: "#EEEDFE",
		border: "#534AB7",
		title: "#3C3489",
		subtitle: "#534AB7",
	},
	teal: {
		bg: "#E1F5EE",
		border: "#0F6E56",
		title: "#085041",
		subtitle: "#0F6E56",
	},
	gray: {
		bg: "#F1EFE8",
		border: "#5F5E5A",
		title: "#444441",
		subtitle: "#5F5E5A",
	},
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Node({ title, subtitle, variant }) {
	const v = VARIANTS[variant];
	return (
		<div
			style={{
				background: v.bg,
				border: `1px solid ${v.border}`,
				borderRadius: 8,
				padding: subtitle ? "10px 16px 12px" : "12px 16px",
				textAlign: "center",
				width: "100%",
			}}>
			<p
				style={{
					margin: 0,
					fontSize: 14,
					fontWeight: 500,
					color: v.title,
					lineHeight: 1.4,
				}}>
				{title}
			</p>
			{subtitle && (
				<p
					style={{
						margin: "3px 0 0",
						fontSize: 12,
						color: v.subtitle,
						lineHeight: 1.4,
					}}>
					{subtitle}
				</p>
			)}
		</div>
	);
}

function Arrow({ label, color = "#6b7280" }) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				margin: "4px 0",
			}}>
			{label && (
				<span style={{ fontSize: 11, color, marginBottom: 2, fontWeight: 500 }}>
					{label}
				</span>
			)}
			<svg width="16" height="20" viewBox="0 0 16 20">
				<line x1="8" y1="0" x2="8" y2="14" stroke={color} strokeWidth="1.5" />
				<path
					d="M3 10 L8 16 L13 10"
					fill="none"
					stroke={color}
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	);
}

function Section({ label, color = "default", children }) {
	const bg = color === "purple" ? "#CECBF6" : "#D3D1C7";
	const fg = color === "purple" ? "#26215C" : "#2C2C2A";
	return (
		<div style={{ marginBottom: 8 }}>
			<div
				style={{
					background: bg,
					borderRadius: 6,
					padding: "5px 12px",
					marginBottom: 12,
					textAlign: "center",
					fontSize: 13,
					fontWeight: 600,
					color: fg,
					letterSpacing: "0.03em",
				}}>
				{label}
			</div>
			{children}
		</div>
	);
}

function Connector() {
	return (
		<div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
			<div style={{ width: 1.5, height: 20, background: "#9ca3af" }} />
		</div>
	);
}

// ─── Stok Kosong Panel ────────────────────────────────────────────────────────

function StokKosongPanel() {
	const [open, setOpen] = useState(false);

	return (
		<div
			style={{
				border: "1.5px dashed #E24B4A",
				borderRadius: 10,
				background: "#fff8f8",
				marginTop: 8,
				marginBottom: 8,
				overflow: "hidden",
			}}>
			<button
				onClick={() => setOpen((o) => !o)}
				style={{
					width: "100%",
					background: "#FCEBEB",
					border: "none",
					borderBottom: open ? "1px solid #fca5a5" : "none",
					padding: "10px 16px",
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 8,
				}}>
				<span style={{ fontSize: 13, fontWeight: 600, color: "#991B1B" }}>
					⚠ Stok Kosong — Klik untuk lihat penanganan
				</span>
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					style={{
						transform: open ? "rotate(180deg)" : "rotate(0deg)",
						transition: "transform 0.2s",
					}}>
					<path
						d="M3 6l5 5 5-5"
						fill="none"
						stroke="#991B1B"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>

			{open && (
				<div style={{ padding: "14px 16px 16px" }}>
					<p
						style={{
							margin: "0 0 12px",
							fontSize: 12,
							color: "#A32D2D",
							fontStyle: "italic",
						}}>
						Jika stok tidak mencukupi, pilih salah satu opsi penanganan berikut:
					</p>

					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr 1fr",
							gap: 10,
						}}>
						{[
							{
								no: "A",
								title: "Emergency PO",
								desc: "Buat Purchase Order darurat ke vendor, proses dipercepat oleh purchasing.",
							},
							{
								no: "B",
								title: "Stock Transfer",
								desc: "Pindahkan stok dari warehouse / cabang lain yang masih memiliki stok.",
							},
							{
								no: "C",
								title: "Backorder / Tunda",
								desc: "Tunda pengeluaran barang hingga stok tersedia dari order berikutnya.",
							},
						].map((opt) => (
							<div
								key={opt.no}
								style={{
									background: "#FCEBEB",
									border: "1px solid #F09595",
									borderRadius: 8,
									padding: "10px 12px",
								}}>
								<div
									style={{
										width: 24,
										height: 24,
										borderRadius: "50%",
										background: "#A32D2D",
										color: "#fff",
										fontSize: 12,
										fontWeight: 700,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										marginBottom: 8,
									}}>
									{opt.no}
								</div>
								<p
									style={{
										margin: "0 0 4px",
										fontSize: 13,
										fontWeight: 600,
										color: "#791F1F",
									}}>
									{opt.title}
								</p>
								<p
									style={{
										margin: 0,
										fontSize: 11,
										color: "#A32D2D",
										lineHeight: 1.5,
									}}>
									{opt.desc}
								</p>
							</div>
						))}
					</div>

					<div
						style={{
							marginTop: 12,
							padding: "8px 12px",
							background: "#FAEEDA",
							border: "1px solid #854F0B",
							borderRadius: 6,
							fontSize: 12,
							color: "#633806",
						}}>
						<strong>Setelah stok tersedia</strong> → kembali ke langkah{" "}
						<em>Cek Ketersediaan Stok</em> dan lanjutkan proses Submit Stock
						Entry.
					</div>
				</div>
			)}
		</div>
	);
}

// ─── Journal Entries ──────────────────────────────────────────────────────────

function JournalEntries() {
	const entries = [
		{
			debit: "Dr. Stock / Expense Account",
			debitSub: "Nilai barang / jasa masuk",
			credit: "Cr. Accounts Payable",
			creditSub: "Hutang ke vendor tercatat",
		},
		{
			debit: "Dr. Accounts Payable",
			debitSub: "Hutang lunas saat bayar",
			credit: "Cr. Bank / Cash Account",
			creditSub: "Kas / bank berkurang",
		},
	];

	return (
		<div
			style={{
				border: "1px dashed #9b8fe8",
				borderRadius: 10,
				padding: "12px 14px",
				background: "#faf9ff",
				marginBottom: 4,
			}}>
			<p
				style={{
					margin: "0 0 10px",
					fontSize: 11,
					color: "#534AB7",
					fontWeight: 600,
					textTransform: "uppercase",
					letterSpacing: "0.05em",
				}}>
				Jurnal Otomatis ERPNext
			</p>
			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				{entries.map((e, i) => (
					<div
						key={i}
						style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
						<div
							style={{
								background: "#EEEDFE",
								border: "1px solid #534AB7",
								borderRadius: 6,
								padding: "8px 10px",
							}}>
							<p
								style={{
									margin: 0,
									fontSize: 12,
									fontWeight: 600,
									color: "#3C3489",
								}}>
								{e.debit}
							</p>
							<p style={{ margin: "2px 0 0", fontSize: 11, color: "#534AB7" }}>
								{e.debitSub}
							</p>
						</div>
						<div
							style={{
								background: "#EEEDFE",
								border: "1px solid #534AB7",
								borderRadius: 6,
								padding: "8px 10px",
							}}>
							<p
								style={{
									margin: 0,
									fontSize: 12,
									fontWeight: 600,
									color: "#3C3489",
								}}>
								{e.credit}
							</p>
							<p style={{ margin: "2px 0 0", fontSize: 11, color: "#534AB7" }}>
								{e.creditSub}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
	const items = [
		{ color: "blue", label: "Proses utama" },
		{ color: "green", label: "Dokumen / Form" },
		{ color: "amber", label: "Keputusan / Approval" },
		{ color: "red", label: "Penanganan darurat" },
		{ color: "purple", label: "Accounting / Closing" },
		{ color: "teal", label: "Selesai" },
	];
	return (
		<div
			style={{
				display: "flex",
				flexWrap: "wrap",
				gap: "6px 16px",
				padding: "10px 14px",
				border: "1px solid #e5e7eb",
				borderRadius: 8,
				background: "#fff",
				marginBottom: 20,
			}}>
			{items.map((item) => {
				const v = VARIANTS[item.color];
				return (
					<div
						key={item.color}
						style={{ display: "flex", alignItems: "center", gap: 6 }}>
						<div
							style={{
								width: 12,
								height: 12,
								borderRadius: 3,
								background: v.bg,
								border: `1px solid ${v.border}`,
							}}
						/>
						<span style={{ fontSize: 12, color: "#5f5e5a" }}>{item.label}</span>
					</div>
				);
			})}
		</div>
	);
}

// ─── Decision Node ────────────────────────────────────────────────────────────

function Decision({ title, subtitle, yesLabel = "Ya", noLabel, noDetail }) {
	return (
		<div style={{ position: "relative" }}>
			<Node title={`▼ ${title}`} subtitle={subtitle} variant="amber" />
			{noLabel && (
				<div
					style={{
						position: "absolute",
						right: -130,
						top: "50%",
						transform: "translateY(-50%)",
						display: "flex",
						alignItems: "center",
						gap: 6,
					}}>
					<div style={{ width: 40, height: 1.5, background: "#E24B4A" }} />
					<div
						style={{
							background: "#FCEBEB",
							border: "1px solid #A32D2D",
							borderRadius: 6,
							padding: "6px 10px",
							width: 88,
						}}>
						<p
							style={{
								margin: 0,
								fontSize: 11,
								fontWeight: 600,
								color: "#791F1F",
								textAlign: "center",
							}}>
							{noLabel}
						</p>
						{noDetail && (
							<p
								style={{
									margin: "2px 0 0",
									fontSize: 10,
									color: "#A32D2D",
									textAlign: "center",
								}}>
								{noDetail}
							</p>
						)}
					</div>
				</div>
			)}
			<Arrow label={yesLabel} color="#3B6D11" />
		</div>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PengadaanFlowchart() {
	return (
		<div
			style={{
				fontFamily:
					'"DM Sans", "Geist", ui-sans-serif, system-ui, -apple-system, sans-serif',
				background: "#f5f4f0",
				minHeight: "100vh",
				padding: "32px 16px 64px",
			}}>
			{/* Header */}
			<div style={{ maxWidth: 680, margin: "0 auto 24px" }}>
				<h1
					style={{
						fontSize: 22,
						fontWeight: 600,
						color: "#1a1a18",
						margin: "0 0 4px",
						textAlign: "center",
					}}>
					Flowchart Pengadaan Barang &amp; Jasa
				</h1>
				<p
					style={{
						textAlign: "center",
						fontSize: 13,
						color: "#888780",
						margin: 0,
					}}>
					ERPNext · Procurement to Accounting Cycle
				</p>
			</div>

			<div
				style={{
					maxWidth: 680,
					margin: "0 auto",
					background: "#fff",
					borderRadius: 16,
					border: "1px solid rgba(0,0,0,0.07)",
					padding: "24px 28px 32px",
					boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
				}}>
				<Legend />

				{/* ── 1. PERMINTAAN ── */}
				<Section label="1. PERMINTAAN PEMBELIAN">
					<Node
						title="Material Request"
						subtitle="User buat permintaan barang / jasa"
						variant="blue"
					/>
					<Arrow />
					<Node
						title="Approval Material Request"
						subtitle="Manager / Head Dept. approve"
						variant="amber"
					/>
					<Arrow />
				</Section>

				{/* ── 2. PENGADAAN ── */}
				{/* <Section label="2. PENGADAAN (PROCUREMENT)">
          <Node title="Request for Quotation (RFQ)" subtitle="Kirim RFQ ke vendor" variant="blue" />
          <Arrow />
          <Node title="Supplier Quotation" subtitle="Vendor kirim penawaran harga" variant="green" />
          <Arrow />
          <Decision
            title="Evaluasi & Negosiasi Penawaran"
            subtitle="Harga & syarat sesuai?"
            yesLabel="Ya – lanjut"
            noLabel="Tidak / negosiasi"
            noDetail="Kembali ke RFQ"
          />
        </Section> */}

				{/* ── 3. PURCHASE ORDER ── */}
				<Section label="2. PURCHASE ORDER">
					<Node
						title="Purchase Order (PO)"
						subtitle="Buat & submit PO ke vendor"
						variant="blue"
					/>
					<Arrow />
					<Node
						title="Approval Purchase Order"
						subtitle="Direktur / Finance approve PO"
						variant="amber"
					/>
					<Arrow />
				</Section>

				{/* ── 4. PENERIMAAN ── */}
				<Section label="3. PENERIMAAN BARANG">
					<Node
						title="Purchase Receipt"
						subtitle="Barang diterima, stok masuk gudang"
						variant="green"
					/>
					<Arrow />
					<Decision
						title="Quality Inspection"
						subtitle="Barang sesuai spesifikasi?"
						yesLabel="OK – lanjut"
						noLabel="Reject"
						noDetail="Return ke supplier"
					/>
				</Section>

				{/* ── 5. STOCK ENTRY ── */}
				<Section label="4. PENGELUARAN BARANG (STOCK ENTRY)">
					<Node
						title="Stock Entry – Material Issue"
						subtitle="User request pengeluaran barang"
						variant="blue"
					/>
					<Arrow />
					<Node
						title="▼ Cek Ketersediaan Stok"
						subtitle="Stok mencukupi di gudang?"
						variant="amber"
					/>
					<StokKosongPanel />
					<Arrow label="Stok ada – lanjut" color="#3B6D11" />
					<Node
						title="Submit Stock Entry"
						subtitle="Stok dikurangi, dokumen terbuat"
						variant="green"
					/>
					<Arrow />
				</Section>

				{/* ── 6. INVOICE & PAYMENT ── */}
				<Section label="5. INVOICE & PEMBAYARAN">
					<Node
						title="Purchase Invoice"
						subtitle="Invoice dari vendor diterima"
						variant="green"
					/>
					<Arrow />
					<Decision
						title="3-Way Matching"
						subtitle="PO vs Receipt vs Invoice sesuai?"
						yesLabel="Sesuai – lanjut"
						noLabel="Tidak sesuai"
						noDetail="Dispute / klarifikasi vendor"
					/>
					<Node
						title="Approval Invoice"
						subtitle="Finance / Management approve"
						variant="amber"
					/>
					<Arrow />
					<Node
						title="Payment Entry"
						subtitle="Transfer / bayar ke vendor"
						variant="blue"
					/>
					<Arrow />
				</Section>

				{/* ── 7. ACCOUNTING & CLOSING ── */}
				<Section label="6. ACCOUNTING & CLOSING" color="purple">
					<Node
						title="Journal Entry Otomatis"
						subtitle="ERPNext generate jurnal dari setiap dokumen"
						variant="purple"
					/>
					<Connector />
					<JournalEntries />
					<Connector />
					<Node
						title="Rekonsiliasi Akun"
						subtitle="Cek saldo AP, kas, stok"
						variant="purple"
					/>
					<Arrow />
					<Node
						title="Period End Closing"
						subtitle="Close periode akuntansi di ERPNext"
						variant="purple"
					/>
					<Arrow />
					<Node
						title="Laporan Keuangan"
						subtitle="Trial Balance, P&L, Balance Sheet"
						variant="purple"
					/>
					<Arrow />
					<Node
						title="SELESAI / CLOSED"
						subtitle="Siklus pengadaan selesai"
						variant="teal"
					/>
				</Section>
			</div>

			<p
				style={{
					textAlign: "center",
					fontSize: 11,
					color: "#b4b2a9",
					marginTop: 20,
				}}>
				ERPNext — Procurement to Accounting Cycle
			</p>
		</div>
	);
}
