import { useState } from "react";

/* ════════════════════════════════════════════════════════════
   PANDUAN: LEMBUR ALAT BERAT & PO OVERRUN DI ERPNEXT
   Kasus: Excavator 320D — PO awal Rp 210 juta (600 jam)
   Aktual bisa melebihi estimasi → bagaimana penanganannya?
════════════════════════════════════════════════════════════ */

const C = {
	bg: "#f0f4f8",
	card: "#ffffff",
	navy: "#0f2344",
	blue: "#1a56a0",
	green: "#0b7a5e",
	amber: "#c25a0a",
	red: "#b91c1c",
	purple: "#5b21b6",
	teal: "#0d6e7a",
	orange: "#c2410c",
	gold: "#92680a",
	muted: "#64748b",
	light: "#e2e8f0",
	border: "#cbd5e1",
	sub: "#475569",
	text: "#1e293b",
};
const f = (n) => new Intl.NumberFormat("id-ID").format(n);

/* ─── SKENARIO DATA ─── */
const SCENARIOS = [
	{
		id: "lembur_harian",
		icon: "⏰",
		label: "Lembur Harian (jam > 8/hari)",
		color: C.amber,
		badge: "PALING UMUM",
		desc: "Operator bekerja lebih dari 8 jam/hari. Misal hari ini jam 08.00–20.00 = 12 jam. 4 jam lembur dihitung Rp 50.000/jam ke NINDYA (bukan ke Supriadi).",
		po_impact:
			"TIDAK ada dampak ke PO Supriadi — lembur operator tanggungan NINDYA sendiri",
		solution:
			"Catat di Log HM harian. Input sebagai biaya upah tambahan via Payroll/JE. PO Supriadi tetap dihitung per total jam HM (normal + lembur sama-sama terbaca di HM meter).",
		erp_action: [
			"Log HM harian: catat jam mulai & jam selesai alat",
			"Hitung jam lembur = total jam - 8 jam normal",
			"Biaya lembur operator masuk Payroll/Journal Entry (BUKAN PO Supriadi)",
			"Tagihan Supriadi tetap = total jam HM × Rp 350.000 (normal rate)",
			"Total jam HM di akhir bulan mungkin > 200 jam → nilai PR lebih tinggi dari minimum",
		],
		warning:
			"Lembur operator TIDAK menambah rate sewa ke Supriadi. Rate tetap Rp 350.000/jam apapun jamnya. Yang bertambah hanya biaya upah operator di sisi NINDYA.",
	},
	{
		id: "overrun_monthly",
		icon: "📈",
		label: "Jam Aktual > 200 Jam (melebihi minimum bulanan)",
		color: C.blue,
		badge: "SERING TERJADI",
		desc: "Dalam 1 bulan, alat dipakai 280 jam (bukan 200 jam minimum). Nilai tagihan bulan ini = 280 × 350.000 = Rp 98 juta, bukan Rp 70 juta.",
		po_impact:
			"Purchase Receipt bulan ini qty = 280 jam, Amount = Rp 98 juta. Jika PO hanya Rp 210 juta (600 jam), maka sisa PO berkurang lebih cepat dari rencana.",
		solution:
			"Tidak ada masalah selama total jam kumulatif belum melebihi qty di PO. Yang perlu diwaspadai adalah saat total kumulatif mendekati batas PO — harus segera amend.",
		erp_action: [
			"Buka PO-SAB-2026-0002 → lihat tab 'Receipt' → cek sisa qty",
			"Buat Purchase Receipt bulan ini dengan Qty = 280 jam",
			"Amount otomatis = 280 × 350.000 = Rp 98.000.000",
			"ERPNext akan WARNING jika qty PR melebihi sisa PO — ini trigger untuk amend",
			"Monitor: jika sisa PO < 200 jam, segera buat PO Amendment",
		],
		warning:
			"Jika ERPNext setting Allow Over Receipt = No, sistem BLOKIR PR yang melebihi qty PO. Pastikan setting ini = Yes untuk sewa alat agar tidak menghambat operasional.",
	},
	{
		id: "overrun_po",
		icon: "🚨",
		label: "Total Jam Melebihi Qty di Purchase Order",
		color: C.red,
		badge: "PERLU TINDAKAN",
		desc: "PO awal 600 jam. Sudah terpakai 580 jam tapi pekerjaan belum selesai. Sisa PO tinggal 20 jam — tidak cukup untuk bulan berikutnya.",
		po_impact:
			"Tidak bisa buat Purchase Receipt baru yang melebihi sisa 20 jam tanpa tindakan ke PO. Sistem akan warning/block.",
		solution:
			"WAJIB lakukan PO Amendment (Amend) sebelum buat PR berikutnya. Tambah qty di PO sesuai estimasi sisa pemakaian.",
		erp_action: [
			"Buka PO-SAB-2026-0002 → klik tombol 'Amend'",
			"PO baru ter-generate dengan status Draft, referensi ke PO lama",
			"Edit field Qty: dari 600 → 900 jam (tambah 300 jam estimasi sisa)",
			"Edit Amount otomatis: 900 × 350.000 = Rp 315.000.000",
			"Submit amended PO → workflow approval ulang jika ada",
			"PO lama otomatis di-Cancel, PO baru jadi referensi untuk PR berikutnya",
		],
		warning:
			"PO Amendment butuh approval ulang dari KA Divisi/Direktur sesuai workflow. Lakukan SEBELUM qty habis — jangan tunggu sampai sistem block.",
	},
	{
		id: "perpanjang",
		icon: "📅",
		label: "Durasi Sewa Diperpanjang (melebihi tanggal kontrak)",
		color: C.purple,
		badge: "ADDENDUM KONTRAK",
		desc: "Kontrak awal sampai 21 Maret 2026. Pekerjaan belum selesai — alat harus tetap di lokasi sampai April 2026. Butuh addendum kontrak dengan Supriadi.",
		po_impact:
			"Required By Date di PO sudah lewat. Butuh perpanjangan PO dan addendum kontrak fisik.",
		solution:
			"Dua langkah bersamaan: (1) Buat addendum kontrak fisik dengan Supriadi untuk perpanjangan, (2) Amend PO di ERPNext untuk update tanggal dan tambah qty.",
		erp_action: [
			"Tandatangani Addendum Kontrak fisik dengan Supriadi",
			"Buka PO lama → Amend",
			"Update field Required By Date ke tanggal baru (misal 30 April 2026)",
			"Update Qty: tambah jam untuk bulan perpanjangan",
			"Update Custom Field 'Tanggal Selesai Sewa'",
			"Lampirkan scan Addendum Kontrak ke PO yang di-amend",
			"Submit → approval → PO baru aktif",
		],
		warning:
			"Jangan operasikan alat di luar masa kontrak tanpa addendum yang ditandatangani. Ini risiko hukum — jika terjadi kecelakaan alat, klausul asuransi dan tanggung jawab bisa tidak berlaku.",
	},
];

/* ─── AMENDMENT STEPS ─── */
const AMEND_STEPS = [
	{
		no: "01",
		title: "Deteksi Dini — Monitor Sisa PO",
		color: C.green,
		who: "PM / Procurement",
		detail:
			"Buka PO → tab 'Receipt' → lihat kolom 'Received Qty' vs 'Qty'. Jika sisa < 20% dari total qty, segera eskalasi ke PM untuk keputusan perpanjangan.",
		tip: "Buat alert otomatis via ERPNext Notification: ketika (Received Qty / Qty) > 80%, kirim email ke PM dan Procurement.",
	},
	{
		no: "02",
		title: "Hitung Kebutuhan Tambahan",
		color: C.blue,
		who: "PM + Site Engineer",
		detail:
			"Estimasi: sisa pekerjaan butuh berapa jam lagi? Misal: masih ada 3 minggu pekerjaan, rata-rata 10 jam/hari × 6 hari/minggu = 180 jam tambahan.",
		tip: "Tambahkan buffer 20% dari estimasi untuk antisipasi ketidakpastian lapangan. Jadi request amend = 180 + 36 = 216 jam.",
	},
	{
		no: "03",
		title: "Buat PO Amendment di ERPNext",
		color: C.amber,
		who: "Procurement",
		detail:
			"Buying → Purchase Order → buka PO asli → klik tombol 'Amend' → sistem buat PO baru dengan prefix -1 (misal PO-SAB-2026-0002-1) → edit Qty dan tanggal → Submit.",
		tip: "Field 'Amended From' otomatis ter-isi dengan nomor PO lama. Ini menjaga audit trail — siapapun bisa trace riwayat perubahan.",
	},
	{
		no: "04",
		title: "Approval Amendment",
		color: C.purple,
		who: "KA Divisi / Direktur",
		detail:
			"PO Amendment masuk workflow approval sama seperti PO baru. Nilai tambahan harus masuk dalam budget yang tersedia di Cost Center proyek.",
		tip: "Cek Budget Variance sebelum approve — apakah penambahan ini masih dalam buffer RAB atau butuh buffer release?",
	},
	{
		no: "05",
		title: "Update Budget jika Diperlukan",
		color: C.teal,
		who: "Finance",
		detail:
			"Jika penambahan nilai PO melebihi budget yang ada di Cost Center, Finance harus amend Budget ERPNext terlebih dahulu. Koordinasikan dengan RAB_Buffer release jika pakai custom module.",
		tip: "Urutan yang benar: Budget Update → PO Amendment → PR → PI → Payment. Jangan amend PO sebelum ada budget.",
	},
	{
		no: "06",
		title: "Lanjutkan Purchase Receipt Normal",
		color: C.green,
		who: "Site Engineer / PM",
		detail:
			"Setelah PO Amendment approved, buat PR seperti biasa menggunakan PO baru (amended). Semua history PR lama tetap terekam dan bisa dilihat.",
		tip: "PR yang dibuat dari PO amended akan auto-link ke PO amendment. Di laporan, tampil sebagai satu rangkaian kontrak yang utuh.",
	},
];

/* ─── SETTING KRITIS ─── */
const SETTINGS = [
	{
		setting: "Allow Over Receipt",
		path: "Buying → Buying Settings",
		value: "Yes (aktifkan untuk sewa alat)",
		color: C.green,
		why: "Agar Purchase Receipt bisa dibuat meski qty sedikit melebihi PO. Memberi fleksibilitas untuk fluktuasi jam harian tanpa harus amend PO setiap saat.",
		risk: "Jika di-set Yes, tidak ada blocking — tergantung disiplin user. Pastikan ada monitoring manual.",
	},
	{
		setting: "PO Required for Purchase",
		path: "Buying → Buying Settings",
		value: "Yes (tetap aktifkan)",
		color: C.blue,
		why: "Pastikan setiap PI selalu punya PO referensi. Ini menjaga three-way matching yang kuat.",
		risk: "Jika ada PI tanpa PO (emergency), buat PO retroaktif sebelum submit PI.",
	},
	{
		setting: "Budget Exception Action",
		path: "Accounting → Budget → Action",
		value: "Warn (bukan Stop)",
		color: C.amber,
		why: "Warn memberi alert tapi tetap bisa jalan. Stop akan blokir transaksi — terlalu kaku untuk lingkungan proyek yang dinamis.",
		risk: "Warning bisa diabaikan jika tidak ada follow-up. Pastikan ada proses review budget warning setiap minggu.",
	},
	{
		setting: "Notification untuk PO 80% Used",
		path: "Setup → Notification → New",
		value: "Buat custom notification",
		color: C.purple,
		why: "Alert otomatis ke PM dan Procurement saat PO sudah terpakai 80% — sehingga amendment bisa dilakukan sebelum blocked.",
		risk: "Perlu setup satu kali oleh admin. Jika tidak di-setup, monitoring harus manual.",
	},
];

/* ─── LOG HM TEMPLATE ─── */
const LOG_ENTRIES = [
	{
		tgl: "18-Feb",
		hm_awal: 3240,
		hm_akhir: 3248,
		jam: 8,
		lembur: 0,
		bbm: 280,
		ket: "Normal",
	},
	{
		tgl: "19-Feb",
		hm_awal: 3248,
		hm_akhir: 3258,
		jam: 10,
		lembur: 2,
		bbm: 350,
		ket: "Lembur 2 jam",
	},
	{
		tgl: "20-Feb",
		hm_awal: 3258,
		hm_akhir: 3266,
		jam: 8,
		lembur: 0,
		bbm: 280,
		ket: "Normal",
	},
	{
		tgl: "21-Feb",
		hm_awal: 3266,
		hm_akhir: 3278,
		jam: 12,
		lembur: 4,
		bbm: 420,
		ket: "Lembur 4 jam — target kejar schedule",
	},
	{
		tgl: "22-Feb",
		hm_awal: 3278,
		hm_akhir: 3286,
		jam: 8,
		lembur: 0,
		bbm: 280,
		ket: "Normal",
	},
	{
		tgl: "23-Feb",
		hm_awal: 3286,
		hm_akhir: 3286,
		jam: 0,
		lembur: 0,
		bbm: 0,
		ket: "Libur Minggu",
	},
	{
		tgl: "24-Feb",
		hm_awal: 3286,
		hm_akhir: 3294,
		jam: 8,
		lembur: 0,
		bbm: 280,
		ket: "Normal",
	},
];

function LogHMTable() {
	const totalJam = LOG_ENTRIES.reduce((s, r) => s + r.jam, 0);
	const totalLembur = LOG_ENTRIES.reduce((s, r) => s + r.lembur, 0);
	const totalBBM = LOG_ENTRIES.reduce((s, r) => s + r.bbm, 0);
	const nilaiSupriadi = totalJam * 350_000;
	const biayaLembur = totalLembur * 50_000;
	const biayaHM = totalJam * 25_000;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
						fontSize: "0.71rem",
					}}>
					<thead>
						<tr style={{ background: C.navy, color: "#fff" }}>
							{[
								"Tgl",
								"HM Awal",
								"HM Akhir",
								"Jam HM",
								"Jam Lembur",
								"BBM (L)",
								"Keterangan",
							].map((h) => (
								<th
									key={h}
									style={{
										padding: "6px 10px",
										textAlign:
											h === "Tgl" || h === "Keterangan" ? "left" : "right",
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
						{LOG_ENTRIES.map((r, i) => (
							<tr
								key={i}
								style={{
									background:
										r.lembur > 0 ? "#fffbeb" : i % 2 === 0 ? "#fff" : "#f8faff",
									borderBottom: `1px solid ${C.light}`,
								}}>
								<td
									style={{
										padding: "4px 10px",
										fontFamily: "monospace",
										fontWeight: 700,
										color: C.navy,
									}}>
									{r.tgl}
								</td>
								<td
									style={{
										padding: "4px 10px",
										textAlign: "right",
										fontFamily: "monospace",
										color: C.muted,
									}}>
									{f(r.hm_awal)}
								</td>
								<td
									style={{
										padding: "4px 10px",
										textAlign: "right",
										fontFamily: "monospace",
										color: C.muted,
									}}>
									{f(r.hm_akhir)}
								</td>
								<td
									style={{
										padding: "4px 10px",
										textAlign: "right",
										fontFamily: "monospace",
										fontWeight: 700,
										color: C.blue,
									}}>
									{r.jam}
								</td>
								<td
									style={{
										padding: "4px 10px",
										textAlign: "right",
										fontFamily: "monospace",
										color: r.lembur > 0 ? C.amber : C.muted,
										fontWeight: r.lembur > 0 ? 700 : 400,
									}}>
									{r.lembur > 0 ? r.lembur : "—"}
								</td>
								<td
									style={{
										padding: "4px 10px",
										textAlign: "right",
										fontFamily: "monospace",
										color: C.sub,
									}}>
									{r.bbm > 0 ? f(r.bbm) : "—"}
								</td>
								<td
									style={{
										padding: "4px 10px",
										color: r.lembur > 0 ? C.amber : C.muted,
										fontSize: "0.68rem",
									}}>
									{r.ket}
								</td>
							</tr>
						))}
					</tbody>
					<tfoot>
						<tr
							style={{
								background: "#e8f0fb",
								borderTop: `2px solid ${C.navy}`,
							}}>
							<td
								colSpan={3}
								style={{
									padding: "5px 10px",
									fontWeight: 800,
									color: C.navy,
									fontFamily: "monospace",
								}}>
								TOTAL 7 HARI
							</td>
							<td
								style={{
									padding: "5px 10px",
									textAlign: "right",
									fontFamily: "monospace",
									fontWeight: 800,
									color: C.blue,
								}}>
								{totalJam} jam
							</td>
							<td
								style={{
									padding: "5px 10px",
									textAlign: "right",
									fontFamily: "monospace",
									fontWeight: 800,
									color: C.amber,
								}}>
								{totalLembur} jam
							</td>
							<td
								style={{
									padding: "5px 10px",
									textAlign: "right",
									fontFamily: "monospace",
									fontWeight: 800,
									color: C.sub,
								}}>
								{f(totalBBM)} L
							</td>
							<td />
						</tr>
					</tfoot>
				</table>
			</div>

			{/* Perhitungan */}
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
				<div
					style={{
						background: "#eff6ff",
						border: `1px solid ${C.blue}40`,
						borderRadius: 9,
						padding: "0.85rem 1rem",
					}}>
					<div
						style={{
							fontFamily: "monospace",
							fontSize: "0.56rem",
							color: C.blue,
							letterSpacing: 3,
							marginBottom: 8,
						}}>
						TAGIHAN KE SUPRIADI (Sewa Alat)
					</div>
					{[
						{ l: "Total Jam HM", v: `${totalJam} jam`, note: "" },
						{
							l: "Rate per jam",
							v: "Rp 350.000",
							note: "Flat — tidak ada rate lembur untuk Supriadi",
						},
						{ l: "Subtotal", v: `Rp ${f(nilaiSupriadi)}`, note: "" },
						{
							l: "PPh 23 (2%)",
							v: `−Rp ${f(Math.round(nilaiSupriadi * 0.02))}`,
							note: "",
						},
						{
							l: "NETTO ke Supriadi",
							v: `Rp ${f(Math.round(nilaiSupriadi * 0.98))}`,
							bold: true,
						},
					].map((r, i) => (
						<div
							key={i}
							style={{
								display: "flex",
								justifyContent: "space-between",
								padding: "3px 0",
								borderBottom: i < 4 ? `1px solid ${C.blue}15` : "none",
							}}>
							<span style={{ color: C.sub, fontSize: "0.73rem" }}>{r.l}</span>
							<span
								style={{
									fontFamily: "monospace",
									fontSize: "0.73rem",
									color: r.bold ? C.blue : C.text,
									fontWeight: r.bold ? 800 : 400,
								}}>
								{r.v}
							</span>
						</div>
					))}
				</div>
				<div
					style={{
						background: "#fff7ed",
						border: `1px solid ${C.amber}40`,
						borderRadius: 9,
						padding: "0.85rem 1rem",
					}}>
					<div
						style={{
							fontFamily: "monospace",
							fontSize: "0.56rem",
							color: C.amber,
							letterSpacing: 3,
							marginBottom: 8,
						}}>
						BIAYA TAMBAHAN NINDYA (Tanggungan Sendiri)
					</div>
					{[
						{
							l: "Gaji HM Operator",
							v: `${totalJam} jam × Rp 25.000 = Rp ${f(biayaHM)}`,
							note: "",
						},
						{
							l: "Lembur Operator",
							v: `${totalLembur} jam × Rp 50.000 = Rp ${f(biayaLembur)}`,
							note: "",
						},
						{
							l: "Total Upah Operator",
							v: `Rp ${f(biayaHM + biayaLembur)}`,
							bold: true,
						},
						{ l: "BBM Solar", v: `${f(totalBBM)} L × harga aktual`, note: "" },
					].map((r, i) => (
						<div
							key={i}
							style={{
								display: "flex",
								justifyContent: "space-between",
								padding: "3px 0",
								borderBottom: `1px solid ${C.amber}15`,
							}}>
							<span style={{ color: C.sub, fontSize: "0.73rem" }}>{r.l}</span>
							<span
								style={{
									fontFamily: "monospace",
									fontSize: "0.72rem",
									color: r.bold ? C.amber : C.text,
									fontWeight: r.bold ? 800 : 400,
								}}>
								{r.v}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

/* ─── PO TRACKER ─── */
function POTracker() {
	const months = [
		{ m: "Feb–Mar", jam: 200, rate: 350000, total: 70000000, kum: 200 },
		{
			m: "Mar–Apr (lembur)",
			jam: 280,
			rate: 350000,
			total: 98000000,
			kum: 480,
		},
		{ m: "Apr–Mei", jam: 200, rate: 350000, total: 70000000, kum: 680 },
	];
	const PO_ORIGINAL = 600;
	const PO_AMENDED = 900;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
						fontSize: "0.72rem",
					}}>
					<thead>
						<tr style={{ background: C.navy, color: "#fff" }}>
							{[
								"Periode",
								"Jam Aktual",
								"Rate",
								"Nilai PR",
								"Kumulatif Jam",
								"% PO Asli",
								"Status",
							].map((h) => (
								<th
									key={h}
									style={{
										padding: "6px 10px",
										textAlign: [
											"Jam Aktual",
											"Nilai PR",
											"Kumulatif Jam",
											"% PO Asli",
										].includes(h)
											? "right"
											: "left",
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
						{months.map((m, i) => {
							const pct = (m.kum / PO_ORIGINAL) * 100;
							const isOver = m.kum > PO_ORIGINAL;
							return (
								<tr
									key={i}
									style={{
										background: isOver
											? "#fef2f2"
											: m.kum / PO_ORIGINAL > 0.8
												? "#fffbeb"
												: "#fff",
										borderBottom: `1px solid ${C.light}`,
									}}>
									<td
										style={{
											padding: "5px 10px",
											fontWeight: 700,
											color: C.navy,
										}}>
										{m.m}
									</td>
									<td
										style={{
											padding: "5px 10px",
											textAlign: "right",
											fontFamily: "monospace",
											color: m.jam > 200 ? C.amber : C.blue,
											fontWeight: m.jam > 200 ? 700 : 400,
										}}>
										{f(m.jam)} jam
									</td>
									<td
										style={{
											padding: "5px 10px",
											textAlign: "right",
											fontFamily: "monospace",
											color: C.muted,
										}}>
										Rp {f(m.rate)}
									</td>
									<td
										style={{
											padding: "5px 10px",
											textAlign: "right",
											fontFamily: "monospace",
											fontWeight: 700,
											color: C.navy,
										}}>
										Rp {f(m.total)}
									</td>
									<td
										style={{
											padding: "5px 10px",
											textAlign: "right",
											fontFamily: "monospace",
											color: isOver ? C.red : C.text,
											fontWeight: isOver ? 800 : 400,
										}}>
										{f(m.kum)} jam
									</td>
									<td
										style={{
											padding: "5px 10px",
											textAlign: "right",
											fontFamily: "monospace",
											color: pct > 100 ? C.red : pct > 80 ? C.amber : C.green,
											fontWeight: 700,
										}}>
										{pct.toFixed(0)}%
									</td>
									<td style={{ padding: "5px 10px" }}>
										{isOver ? (
											<span
												style={{
													background: C.red + "18",
													color: C.red,
													border: `1px solid ${C.red}35`,
													borderRadius: 4,
													padding: "1px 7px",
													fontSize: "0.62rem",
													fontFamily: "monospace",
													fontWeight: 700,
												}}>
												⚠ AMEND PO
											</span>
										) : m.kum / PO_ORIGINAL > 0.8 ? (
											<span
												style={{
													background: C.amber + "18",
													color: C.amber,
													border: `1px solid ${C.amber}35`,
													borderRadius: 4,
													padding: "1px 7px",
													fontSize: "0.62rem",
													fontFamily: "monospace",
													fontWeight: 700,
												}}>
												⚡ WARNING 80%
											</span>
										) : (
											<span
												style={{
													background: C.green + "18",
													color: C.green,
													border: `1px solid ${C.green}35`,
													borderRadius: 4,
													padding: "1px 7px",
													fontSize: "0.62rem",
													fontFamily: "monospace",
													fontWeight: 700,
												}}>
												✓ OK
											</span>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<div
				style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
				{[
					{
						l: "PO Original",
						v: `${f(PO_ORIGINAL)} jam`,
						sub: `Rp ${f(PO_ORIGINAL * 350000)}`,
						color: C.blue,
					},
					{
						l: "PO After Amend",
						v: `${f(PO_AMENDED)} jam`,
						sub: `Rp ${f(PO_AMENDED * 350000)}`,
						color: C.green,
					},
					{
						l: "Tambahan",
						v: `+${f(PO_AMENDED - PO_ORIGINAL)} jam`,
						sub: `+Rp ${f((PO_AMENDED - PO_ORIGINAL) * 350000)}`,
						color: C.amber,
					},
				].map((k, i) => (
					<div
						key={i}
						style={{
							background: "#f8faff",
							border: `1px solid ${k.color}30`,
							borderRadius: 8,
							padding: "0.65rem 0.85rem",
							textAlign: "center",
						}}>
						<div
							style={{
								fontFamily: "monospace",
								fontSize: "0.57rem",
								color: k.color,
								letterSpacing: 2,
							}}>
							{k.l}
						</div>
						<div
							style={{
								color: k.color,
								fontWeight: 800,
								fontSize: "1rem",
								fontFamily: "monospace",
								margin: "4px 0",
							}}>
							{k.v}
						</div>
						<div
							style={{
								color: C.muted,
								fontSize: "0.68rem",
								fontFamily: "monospace",
							}}>
							{k.sub}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

/* ─── MAIN ─── */
export default function AlatBeratGuide() {
	const [tab, setTab] = useState("skenario");
	const [activeScenario, setActiveScenario] = useState("lembur_harian");
	const [openAmend, setOpenAmend] = useState(null);

	const scenario = SCENARIOS.find((s) => s.id === activeScenario);

	const TABS = [
		{ key: "skenario", label: "⚡ 4 Skenario Overrun" },
		{ key: "log", label: "📊 Log HM & Perhitungan" },
		{ key: "amend", label: "🔄 Cara Amend PO" },
		{ key: "tracker", label: "📈 PO Tracker" },
		{ key: "setting", label: "⚙️ Setting ERPNext" },
	];

	return (
		<div
			style={{
				background: C.bg,
				minHeight: "100vh",
				color: C.text,
				fontFamily: "'Segoe UI', sans-serif",
			}}>
			{/* HEADER */}
			<div
				style={{
					background: "linear-gradient(135deg, #0f2344 0%, #1a3a6a 100%)",
					borderBottom: "4px solid #e07b10",
					padding: "1.3rem 1.5rem 1.1rem",
				}}>
				<div style={{ maxWidth: 1100, margin: "0 auto" }}>
					<div
						style={{
							fontFamily: "monospace",
							fontSize: "0.54rem",
							color: "#4a72b0",
							letterSpacing: 4,
							marginBottom: 5,
						}}>
						ERPNEXT — PENANGANAN LEMBUR & PO OVERRUN ALAT BERAT
					</div>
					<h1
						style={{
							margin: 0,
							color: "#fff",
							fontSize: "clamp(1.1rem,2.2vw,1.6rem)",
							fontWeight: 900,
						}}>
						Ketika Jam Alat & Biaya Melebihi PO
					</h1>
					<div
						style={{
							marginTop: 5,
							fontFamily: "monospace",
							fontSize: "0.7rem",
							color: "#6a90c8",
							display: "flex",
							gap: 14,
							flexWrap: "wrap",
						}}>
						<span>🚜 Excavator 320D | Supriadi</span>
						<span>⏱️ PO Awal: 600 jam = Rp 210 juta</span>
						<span>🎯 Rate: Rp 350.000/jam flat</span>
					</div>
				</div>
			</div>

			{/* NAV */}
			<div
				style={{
					background: C.card,
					borderBottom: `1px solid ${C.border}`,
					position: "sticky",
					top: 0,
					zIndex: 50,
				}}>
				<div
					style={{
						maxWidth: 1100,
						margin: "0 auto",
						padding: "0 1.5rem",
						display: "flex",
						overflowX: "auto",
					}}>
					{TABS.map((t) => (
						<button
							key={t.key}
							onClick={() => setTab(t.key)}
							style={{
								padding: "0.75rem 0.95rem",
								background: "none",
								border: "none",
								borderBottom:
									tab === t.key
										? `3px solid ${C.blue}`
										: "3px solid transparent",
								color: tab === t.key ? C.blue : C.muted,
								fontFamily: "inherit",
								fontSize: "0.78rem",
								fontWeight: 700,
								cursor: "pointer",
								whiteSpace: "nowrap",
							}}>
							{t.label}
						</button>
					))}
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
				{/* ══ SKENARIO ══ */}
				{tab === "skenario" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						<div
							style={{
								background: C.card,
								border: `1px solid ${C.border}`,
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
							}}>
							<div
								style={{
									fontFamily: "monospace",
									fontSize: "0.55rem",
									color: C.muted,
									letterSpacing: 3,
									marginBottom: 6,
								}}>
								KONSEP KUNCI
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
									gap: 10,
								}}>
								{[
									{
										icon: "⏱️",
										title: "Rate Supriadi FLAT",
										body: "Rp 350.000/jam tidak peduli jam normal atau lembur. Tidak ada lembur rate untuk pemilik alat.",
										color: C.blue,
									},
									{
										icon: "👷",
										title: "Lembur = Biaya NINDYA",
										body: "Lembur operator (Rp 50.000/jam) adalah tanggungan NINDYA sendiri — TIDAK menambah tagihan Supriadi.",
										color: C.amber,
									},
									{
										icon: "📊",
										title: "HM Meter adalah Dasar",
										body: "Semua perhitungan berbasis bacaan Hour Meter alat — bukan jam kerja manusia. HM tidak bisa di-manipulasi.",
										color: C.green,
									},
									{
										icon: "🚨",
										title: "Amend PO Sebelum Block",
										body: "Jangan tunggu sistem block. Amend PO saat sudah 80% terpakai — bukan saat 100% habis.",
										color: C.red,
									},
								].map((k, i) => (
									<div
										key={i}
										style={{
											background: k.color + "10",
											border: `1px solid ${k.color}30`,
											borderRadius: 8,
											padding: "0.7rem 0.85rem",
											display: "flex",
											gap: 8,
										}}>
										<span style={{ fontSize: 20, flexShrink: 0 }}>
											{k.icon}
										</span>
										<div>
											<div
												style={{
													color: k.color,
													fontWeight: 700,
													fontSize: "0.8rem",
													marginBottom: 2,
												}}>
												{k.title}
											</div>
											<div
												style={{
													color: C.sub,
													fontSize: "0.74rem",
													lineHeight: 1.55,
												}}>
												{k.body}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Scenario selector */}
						<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
							{SCENARIOS.map((s) => (
								<button
									key={s.id}
									onClick={() => setActiveScenario(s.id)}
									style={{
										padding: "0.42rem 0.85rem",
										background: activeScenario === s.id ? s.color : C.card,
										border: `2px solid ${activeScenario === s.id ? s.color : C.border}`,
										borderRadius: 7,
										cursor: "pointer",
										color: activeScenario === s.id ? "#fff" : C.sub,
										fontWeight: 700,
										fontSize: "0.7rem",
										display: "flex",
										gap: 6,
										alignItems: "center",
										transition: "all 0.15s",
									}}>
									<span>{s.icon}</span>
									<span>{s.label.split("(")[0].trim()}</span>
									<span
										style={{
											background:
												activeScenario === s.id
													? "rgba(255,255,255,0.25)"
													: s.color + "20",
											color: activeScenario === s.id ? "#fff" : s.color,
											borderRadius: 4,
											padding: "0 5px",
											fontSize: "0.56rem",
											fontFamily: "monospace",
										}}>
										{s.badge}
									</span>
								</button>
							))}
						</div>

						{scenario && (
							<div
								style={{
									background: C.card,
									border: `2px solid ${scenario.color}`,
									borderRadius: 12,
									overflow: "hidden",
								}}>
								<div
									style={{
										background: scenario.color,
										padding: "0.9rem 1.2rem",
										display: "flex",
										gap: 12,
										alignItems: "center",
									}}>
									<span style={{ fontSize: 26 }}>{scenario.icon}</span>
									<div>
										<div
											style={{
												color: "rgba(255,255,255,0.7)",
												fontFamily: "monospace",
												fontSize: "0.57rem",
												letterSpacing: 3,
											}}>
											{scenario.badge}
										</div>
										<div
											style={{
												color: "#fff",
												fontWeight: 900,
												fontSize: "0.98rem",
											}}>
											{scenario.label}
										</div>
									</div>
								</div>
								<div style={{ padding: "1.1rem" }}>
									<p
										style={{
											color: C.sub,
											fontSize: "0.81rem",
											lineHeight: 1.7,
											margin: "0 0 12px",
											borderLeft: `3px solid ${scenario.color}30`,
											paddingLeft: "0.9rem",
										}}>
										{scenario.desc}
									</p>

									<div
										style={{
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: 10,
											marginBottom: 12,
										}}>
										<div
											style={{
												background: "#fef2f2",
												border: `1px solid ${C.red}25`,
												borderRadius: 8,
												padding: "0.7rem 0.9rem",
											}}>
											<div
												style={{
													fontFamily: "monospace",
													fontSize: "0.55rem",
													color: C.red,
													letterSpacing: 2,
													marginBottom: 4,
												}}>
												DAMPAK KE PO
											</div>
											<p
												style={{
													color: C.sub,
													fontSize: "0.77rem",
													lineHeight: 1.6,
													margin: 0,
												}}>
												{scenario.po_impact}
											</p>
										</div>
										<div
											style={{
												background: "#f0fdf4",
												border: `1px solid ${C.green}25`,
												borderRadius: 8,
												padding: "0.7rem 0.9rem",
											}}>
											<div
												style={{
													fontFamily: "monospace",
													fontSize: "0.55rem",
													color: C.green,
													letterSpacing: 2,
													marginBottom: 4,
												}}>
												SOLUSI
											</div>
											<p
												style={{
													color: C.sub,
													fontSize: "0.77rem",
													lineHeight: 1.6,
													margin: 0,
												}}>
												{scenario.solution}
											</p>
										</div>
									</div>

									<div
										style={{
											fontFamily: "monospace",
											fontSize: "0.55rem",
											color: C.muted,
											letterSpacing: 3,
											marginBottom: 8,
										}}>
										LANGKAH DI ERPNEXT
									</div>
									{scenario.erp_action.map((a, i) => (
										<div
											key={i}
											style={{
												display: "flex",
												gap: 9,
												padding: "0.42rem 0.75rem",
												background: "#f8faff",
												borderRadius: 6,
												borderLeft: `2px solid ${scenario.color}45`,
												marginBottom: 5,
											}}>
											<span
												style={{
													color: scenario.color,
													fontFamily: "monospace",
													fontSize: "0.6rem",
													minWidth: 18,
													paddingTop: 1,
												}}>
												{String(i + 1).padStart(2, "0")}
											</span>
											<span
												style={{
													color: C.sub,
													fontSize: "0.76rem",
													lineHeight: 1.55,
												}}>
												{a}
											</span>
										</div>
									))}

									<div
										style={{
											background: "#fffbeb",
											border: `1px solid #d97706`,
											borderRadius: 8,
											padding: "0.6rem 0.85rem",
											display: "flex",
											gap: 8,
											marginTop: 10,
										}}>
										<span style={{ color: C.gold, flexShrink: 0 }}>⚠️</span>
										<span
											style={{
												color: "#78350f",
												fontSize: "0.76rem",
												lineHeight: 1.6,
											}}>
											{scenario.warning}
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				{/* ══ LOG HM ══ */}
				{tab === "log" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						<div
							style={{
								background: C.card,
								border: `1px solid ${C.border}`,
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
							}}>
							<div
								style={{
									fontFamily: "monospace",
									fontSize: "0.55rem",
									color: C.muted,
									letterSpacing: 3,
									marginBottom: 6,
								}}>
								CONTOH LOG HM HARIAN — MINGGU PERTAMA (18–24 Feb 2026)
							</div>
							<p
								style={{
									color: C.sub,
									fontSize: "0.8rem",
									lineHeight: 1.65,
									margin: 0,
								}}>
								Ini adalah dokumen yang diisi operator setiap hari. Baris yang{" "}
								<span
									style={{
										background: "#fffbeb",
										padding: "0 4px",
										borderRadius: 3,
									}}>
									berwarna kuning
								</span>{" "}
								= hari ada lembur. Di akhir bulan, total jam HM menjadi dasar
								Purchase Receipt ke Supriadi.
							</p>
						</div>
						<div
							style={{
								background: C.card,
								border: `1px solid ${C.border}`,
								borderRadius: 10,
								padding: "1rem",
							}}>
							<LogHMTable />
						</div>
						<div
							style={{
								background: C.card,
								border: `1px solid ${C.border}`,
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
							}}>
							<div
								style={{
									fontFamily: "monospace",
									fontSize: "0.55rem",
									color: C.muted,
									letterSpacing: 3,
									marginBottom: 8,
								}}>
								CARA IMPLEMENTASI LOG HM DI ERPNEXT
							</div>
							{[
								{
									opt: "Opsi A (Sederhana)",
									desc: "Buat template Excel untuk Log HM Harian. Operator isi di HP/tablet. Rekap bulanan di-entry manual ke ERPNext sebagai Purchase Receipt.",
									color: C.green,
									label: "MUDAH",
								},
								{
									opt: "Opsi B (Terintegrasi)",
									desc: "Buat Custom DocType 'Equipment Daily Log' di ERPNext: field tanggal, HM awal, HM akhir, BBM, jam lembur. Operator input langsung via mobile ERPNext. Sistem auto-calculate total jam untuk PR.",
									color: C.blue,
									label: "OPTIMAL",
								},
								{
									opt: "Opsi C (Minimal)",
									desc: "Gunakan fitur 'Timesheet' bawaan ERPNext yang di-link ke alat sebagai Project Task. Setiap hari operator submit timesheet. Rekap otomatis per periode.",
									color: C.purple,
									label: "ALTERNATIF",
								},
							].map((o, i) => (
								<div
									key={i}
									style={{
										display: "flex",
										gap: 10,
										padding: "0.6rem 0.9rem",
										background: "#f8faff",
										borderRadius: 8,
										borderLeft: `3px solid ${o.color}`,
										marginBottom: 7,
									}}>
									<span
										style={{
											background: o.color + "18",
											color: o.color,
											border: `1px solid ${o.color}35`,
											borderRadius: 4,
											padding: "1px 7px",
											fontSize: "0.6rem",
											fontFamily: "monospace",
											fontWeight: 700,
											flexShrink: 0,
											height: "fit-content",
										}}>
										{o.label}
									</span>
									<div>
										<div
											style={{
												color: C.navy,
												fontWeight: 700,
												fontSize: "0.8rem",
												marginBottom: 2,
											}}>
											{o.opt}
										</div>
										<div
											style={{
												color: C.sub,
												fontSize: "0.75rem",
												lineHeight: 1.55,
											}}>
											{o.desc}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* ══ AMEND ══ */}
				{tab === "amend" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
						<div
							style={{
								background: C.card,
								border: `1px solid ${C.border}`,
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
							}}>
							<div
								style={{
									fontFamily: "monospace",
									fontSize: "0.55rem",
									color: C.muted,
									letterSpacing: 3,
									marginBottom: 6,
								}}>
								PANDUAN LENGKAP: PO AMENDMENT DI ERPNEXT
							</div>
							<p
								style={{
									color: C.sub,
									fontSize: "0.8rem",
									lineHeight: 1.65,
									margin: 0,
								}}>
								PO Amendment adalah fitur bawaan ERPNext untuk mengubah PO yang
								sudah di-Submit. Saat di-Amend, PO lama di-Cancel dan PO baru
								dibuat dengan referensi ke PO lama —{" "}
								<strong style={{ color: C.navy }}>
									audit trail tetap terjaga
								</strong>
								.
							</p>
						</div>
						{AMEND_STEPS.map((s, i) => (
							<div
								key={i}
								style={{
									background: C.card,
									border: `1px solid ${openAmend === i ? s.color + "60" : C.border}`,
									borderRadius: 10,
									overflow: "hidden",
									transition: "border-color 0.2s",
								}}>
								<button
									onClick={() => setOpenAmend(openAmend === i ? null : i)}
									style={{
										width: "100%",
										background: "none",
										border: "none",
										padding: "0.8rem 1.1rem",
										cursor: "pointer",
										display: "grid",
										gridTemplateColumns: "40px 1fr auto",
										gap: 12,
										alignItems: "center",
										textAlign: "left",
									}}>
									<div
										style={{
											width: 36,
											height: 36,
											borderRadius: "50%",
											background: s.color,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											color: "#fff",
											fontFamily: "monospace",
											fontSize: "0.75rem",
											fontWeight: 800,
											flexShrink: 0,
										}}>
										{s.no}
									</div>
									<div>
										<div
											style={{
												color: C.navy,
												fontWeight: 800,
												fontSize: "0.87rem",
											}}>
											{s.title}
										</div>
										<div
											style={{
												fontFamily: "monospace",
												fontSize: "0.6rem",
												color: s.color,
												marginTop: 1,
											}}>
											👤 {s.who}
										</div>
									</div>
									<span
										style={{
											color: s.color,
											fontSize: "1.1rem",
											transform: openAmend === i ? "rotate(90deg)" : "none",
											transition: "transform 0.2s",
											display: "inline-block",
										}}>
										›
									</span>
								</button>
								{openAmend === i && (
									<div
										style={{
											borderTop: `1px solid ${C.border}`,
											padding: "0.85rem 1.1rem 1rem",
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: 14,
										}}>
										<div>
											<div
												style={{
													fontFamily: "monospace",
													fontSize: "0.55rem",
													color: C.muted,
													letterSpacing: 3,
													marginBottom: 6,
												}}>
												DETAIL LANGKAH
											</div>
											<p
												style={{
													color: C.sub,
													fontSize: "0.78rem",
													lineHeight: 1.65,
													margin: 0,
												}}>
												{s.detail}
											</p>
										</div>
										<div
											style={{
												background: s.color + "10",
												border: `1px solid ${s.color}30`,
												borderRadius: 8,
												padding: "0.65rem 0.85rem",
											}}>
											<div
												style={{
													fontFamily: "monospace",
													fontSize: "0.55rem",
													color: s.color,
													letterSpacing: 2,
													marginBottom: 5,
												}}>
												💡 TIPS PRAKTIS
											</div>
											<p
												style={{
													color: C.sub,
													fontSize: "0.76rem",
													lineHeight: 1.6,
													margin: 0,
												}}>
												{s.tip}
											</p>
										</div>
									</div>
								)}
							</div>
						))}

						{/* Amendment vs new PO */}
						<div
							style={{
								background: C.card,
								border: `1px solid ${C.border}`,
								borderRadius: 10,
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
								AMEND PO vs BUAT PO BARU — KAPAN PAKAI YANG MANA?
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: 10,
								}}>
								{[
									{
										title: "✅ Gunakan AMEND PO",
										color: C.green,
										points: [
											"Perpanjangan kontrak dengan Supriadi yang SAMA",
											"Penambahan jam untuk pekerjaan yang SAMA",
											"Perubahan durasi kontrak (tanggal selesai mundur)",
											"Koreksi qty atau rate yang salah input",
											"Semua perubahan pada scope yang sudah ada",
										],
									},
									{
										title: "🆕 Buat PO BARU",
										color: C.blue,
										points: [
											"Sewa alat BARU atau alat BERBEDA dari Supriadi",
											"Kontrak sewa BARU setelah kontrak lama selesai",
											"Mobilisasi tambahan karena alat dipindah lokasi",
											"Penambahan unit alat (misal 1 excavator lagi)",
											"Addendum yang mengubah scope secara fundamental",
										],
									},
								].map((b, i) => (
									<div
										key={i}
										style={{
											background: b.color + "08",
											border: `1px solid ${b.color}30`,
											borderRadius: 9,
											padding: "0.85rem 1rem",
										}}>
										<div
											style={{
												color: b.color,
												fontWeight: 800,
												fontSize: "0.85rem",
												marginBottom: 8,
											}}>
											{b.title}
										</div>
										{b.points.map((p, j) => (
											<div
												key={j}
												style={{
													display: "flex",
													gap: 6,
													fontSize: "0.75rem",
													color: C.sub,
													marginBottom: 4,
												}}>
												<span style={{ color: b.color, flexShrink: 0 }}>•</span>
												{p}
											</div>
										))}
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* ══ TRACKER ══ */}
				{tab === "tracker" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
						<div
							style={{
								background: C.card,
								border: `1px solid ${C.border}`,
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
							}}>
							<div
								style={{
									fontFamily: "monospace",
									fontSize: "0.55rem",
									color: C.muted,
									letterSpacing: 3,
									marginBottom: 6,
								}}>
								SIMULASI 3 BULAN PEMAKAIAN — DENGAN LEMBUR DI BULAN KE-2
							</div>
							<p
								style={{
									color: C.sub,
									fontSize: "0.8rem",
									lineHeight: 1.65,
									margin: 0,
								}}>
								Bulan ke-2 alat dipakai 280 jam (ada lembur rutin). Di bulan
								ke-3, kumulatif sudah 680 jam — melebihi PO original 600 jam.{" "}
								<span style={{ color: C.red, fontWeight: 700 }}>
									PO harus di-Amend ke 900 jam sebelum buat PR bulan ke-3.
								</span>
							</p>
						</div>
						<div
							style={{
								background: C.card,
								border: `1px solid ${C.border}`,
								borderRadius: 10,
								padding: "1rem",
							}}>
							<POTracker />
						</div>
						<div
							style={{
								background: "#fef2f2",
								border: `2px solid ${C.red}`,
								borderRadius: 10,
								padding: "1rem 1.2rem",
							}}>
							<div
								style={{
									fontFamily: "monospace",
									fontSize: "0.55rem",
									color: C.red,
									letterSpacing: 3,
									marginBottom: 8,
								}}>
								ATURAN MONITORING — WAJIB DITERAPKAN
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
									gap: 8,
								}}>
								{[
									{
										threshold: "≤ 60% PO terpakai",
										action: "Normal — lanjutkan operasional",
										color: C.green,
										icon: "✅",
									},
									{
										threshold: "60–80% PO terpakai",
										action: "Mulai estimasi sisa kebutuhan jam",
										color: C.blue,
										icon: "👀",
									},
									{
										threshold: "80% PO terpakai",
										action: "Siapkan dokumen PO Amendment",
										color: C.amber,
										icon: "⚡",
									},
									{
										threshold: "90% PO terpakai",
										action: "Submit Amendment — jangan tunda",
										color: C.orange,
										icon: "🚨",
									},
									{
										threshold: "100% PO terpakai",
										action: "STOP buat PR sampai amend approved",
										color: C.red,
										icon: "🛑",
									},
								].map((r, i) => (
									<div
										key={i}
										style={{
											background: "#fff",
											border: `1px solid ${r.color}30`,
											borderRadius: 7,
											padding: "0.6rem 0.75rem",
											display: "flex",
											gap: 8,
											alignItems: "flex-start",
										}}>
										<span style={{ fontSize: 16, flexShrink: 0 }}>
											{r.icon}
										</span>
										<div>
											<div
												style={{
													fontFamily: "monospace",
													fontSize: "0.62rem",
													color: r.color,
													fontWeight: 700,
												}}>
												{r.threshold}
											</div>
											<div
												style={{
													color: C.sub,
													fontSize: "0.72rem",
													lineHeight: 1.5,
													marginTop: 2,
												}}>
												{r.action}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* ══ SETTING ══ */}
				{tab === "setting" && (
					<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						<div
							style={{
								background: C.card,
								border: `1px solid ${C.border}`,
								borderRadius: 10,
								padding: "0.9rem 1.1rem",
							}}>
							<div
								style={{
									fontFamily: "monospace",
									fontSize: "0.55rem",
									color: C.muted,
									letterSpacing: 3,
									marginBottom: 6,
								}}>
								4 SETTING KRITIS ERPNEXT UNTUK SEWA ALAT BERAT
							</div>
							<p
								style={{
									color: C.sub,
									fontSize: "0.8rem",
									lineHeight: 1.65,
									margin: 0,
								}}>
								Konfigurasi ini perlu dicek dan disesuaikan oleh ERPNext
								Administrator sebelum go-live modul sewa alat berat.
							</p>
						</div>
						{SETTINGS.map((s, i) => (
							<div
								key={i}
								style={{
									background: C.card,
									border: `1px solid ${s.color}30`,
									borderRadius: 10,
									padding: "1rem 1.2rem",
									borderLeft: `4px solid ${s.color}`,
								}}>
								<div
									style={{
										display: "flex",
										gap: 10,
										alignItems: "flex-start",
										flexWrap: "wrap",
										marginBottom: 8,
									}}>
									<div style={{ flex: 1 }}>
										<div
											style={{
												color: C.navy,
												fontWeight: 800,
												fontSize: "0.87rem",
											}}>
											{s.setting}
										</div>
										<div
											style={{
												fontFamily: "monospace",
												fontSize: "0.62rem",
												color: C.muted,
												marginTop: 2,
											}}>
											📍 {s.path}
										</div>
									</div>
									<span
										style={{
											background: s.color + "18",
											color: s.color,
											border: `1px solid ${s.color}40`,
											borderRadius: 6,
											padding: "3px 10px",
											fontSize: "0.68rem",
											fontFamily: "monospace",
											fontWeight: 700,
											whiteSpace: "nowrap",
										}}>
										{s.value}
									</span>
								</div>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: 10,
									}}>
									<div
										style={{
											background: "#f0fdf4",
											borderRadius: 7,
											padding: "0.6rem 0.8rem",
										}}>
										<div
											style={{
												fontFamily: "monospace",
												fontSize: "0.55rem",
												color: C.green,
												letterSpacing: 2,
												marginBottom: 4,
											}}>
											KENAPA SETTING INI
										</div>
										<p
											style={{
												color: C.sub,
												fontSize: "0.75rem",
												lineHeight: 1.6,
												margin: 0,
											}}>
											{s.why}
										</p>
									</div>
									<div
										style={{
											background: "#fef2f2",
											borderRadius: 7,
											padding: "0.6rem 0.8rem",
										}}>
										<div
											style={{
												fontFamily: "monospace",
												fontSize: "0.55rem",
												color: C.red,
												letterSpacing: 2,
												marginBottom: 4,
											}}>
											RISIKO JIKA SALAH SET
										</div>
										<p
											style={{
												color: C.sub,
												fontSize: "0.75rem",
												lineHeight: 1.6,
												margin: 0,
											}}>
											{s.risk}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
