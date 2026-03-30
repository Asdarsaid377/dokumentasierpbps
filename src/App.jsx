// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "./App.css";
// import { Route, Routes } from "react-router-dom";
// import Kebutuhan from "./pages/erpnext-contractor";
// import RABDetail from "./pages/rab-boq-detail";
// import Subkon from "./pages/subcon-management-detail";
// import ProgressOpnameLapangan from "./pages/progress-opname-detail";
// import DokumenKontrak from "./pages/document-contract-detail";
// import TutorialProjectSetup from "./pages/tutorial/erpnext-project-management";
// import Procurement from "./pages/tutorial/erpnext-procurement-scm";
// import BarangdanGudang from "./pages/tutorial/erpnext-inventory-warehouse";
// import Keuangan from "./pages/tutorial/erpnext-accounting-finance";

// function App() {
// 	return (
// 		<>
// 			<Routes>
// 				<Route exact path="/" element={<Kebutuhan />} />
// 				<Route exact path="/rabdetail" element={<RABDetail />} />
// 				<Route exact path="/subkon" element={<Subkon />} />
// 				<Route exact path="/progress" element={<ProgressOpnameLapangan />} />
// 				<Route exact path="/dokumenkontrak" element={<DokumenKontrak />} />
// 				<Route exact path="/tutorial/procurement" element={<Procurement />} />
// 				<Route
// 					exact
// 					path="/tutorial/projectsetup"
// 					element={<TutorialProjectSetup />}
// 				/>
// 				<Route exact path="/tutorial/barang" element={<BarangdanGudang />} />
// 				<Route exact path="/tutorial/keuangan" element={<Keuangan />} />
// 			</Routes>
// 		</>
// 	);
// }

// export default App;

import { useState } from "react";
import "./App.css";

import Kebutuhan from "./pages/erpnext-contractor";
import RABDetail from "./pages/rab-boq-detail";
import Subkon from "./pages/subcon-management-detail";
import ProgressOpnameLapangan from "./pages/progress-opname-detail";
import DokumenKontrak from "./pages/document-contract-detail";
import TutorialProjectSetup from "./pages/tutorial/erpnext-project-management";
import Procurement from "./pages/tutorial/erpnext-procurement-scm";
import BarangdanGudang from "./pages/tutorial/erpnext-inventory-warehouse";
import Keuangan from "./pages/tutorial/erpnext-accounting-finance";
import SalesCRM from "./pages/tutorial/erpnext-crm-sales";
import InputSPKDetail from "./pages/tutorial/spk-input-guide-detail";
import FlowAlatBerat from "./pages/tutorial/sewa-alat-berat-erpnext";
import AlatBeratGuide from "./pages/tutorial/alat-berat-overrun-guide";

function App() {
	const [activePage, setActivePage] = useState("kebutuhan");

	const pages = {
		kebutuhan: <Kebutuhan />,
		rab: <RABDetail />,
		subkon: <Subkon />,
		progress: <ProgressOpnameLapangan />,
		dokumen: <DokumenKontrak />,
		projectsetup: <TutorialProjectSetup />,
		procurement: <Procurement />,
		barang: <BarangdanGudang />,
		keuangan: <Keuangan />,
		crm: <SalesCRM />,
		spk: <InputSPKDetail />,
		alatberat: <FlowAlatBerat />,
		alatberatguide: <AlatBeratGuide />,
	};

	const MenuItem = ({ id, label }) => (
		<div
			className={`menu-item ${activePage === id ? "active" : ""}`}
			onClick={() => setActivePage(id)}>
			{label}
		</div>
	);

	return (
		<div className="layout">
			{/* Sidebar */}
			<div className="sidebar">
				<h2 className="logo">ERP Guide</h2>

				<div className="menu-group">
					<p className="menu-title">PROJECT</p>
					<MenuItem id="kebutuhan" label="Kebutuhan Project" />
					<MenuItem id="rab" label="RAB Detail" />
				</div>

				<div className="menu-group">
					<p className="menu-title">TUTORIAL</p>
					<MenuItem id="projectsetup" label="Project Setup" />
					<MenuItem id="procurement" label="Procurement/Pengadaan PO" />
					<MenuItem id="barang" label="Barang & Gudang" />
					<MenuItem id="keuangan" label="Keuangan" />
					<MenuItem id="crm" label="Crm" />
					<MenuItem id="spk" label="SPK Input Guide" />
					<MenuItem id="alatberat" label="Alat Berat Input Guide" />
					<MenuItem id="alatberatguide" label="Alat Berat Studi Kasus" />
				</div>

				<div className="menu-group">
					<p className="menu-title">Rencana di custom</p>
					<MenuItem id="subkon" label="Subkon Management" />
					<MenuItem id="progress" label="Progress Opname Lapangan" />
					<MenuItem id="dokumen" label="Dokumen Kontrak" />
				</div>
			</div>

			{/* Content */}
			<div className="content">{pages[activePage]}</div>
		</div>
	);
}

export default App;
