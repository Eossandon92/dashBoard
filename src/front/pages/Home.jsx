
import { div } from "framer-motion/client";
import CardSuperAdmin from "../components/CardSuperAdmin";
import KpiCard from "../components/KpiCard";

const condominios = [
	{
		id: 1,
		nombre: "Condominio Los Álamos",
		mainValue: 1256,
		percentageChange: 8.6,
		benchmarkAverage: 960,
	},

];


export function Home() {
	return (
		<>

			<div className=" row   mt-5 mb-5 px-8">
				<div className="col-12 col-sm-6 col-md-5 col-lg-2 mb-5">
					<KpiCard label="🏢 Condominios Activos" value={5} trend="flat" caption="2 + este mes" tone="default" />
				</div>
				<div className="col-12 col-sm-6 col-md-5 col-lg-2 mb-5">
					<KpiCard label="🚨  Condominios en Riesgo" value={1} trend="flat" caption="1 - este mes" tone="danger" />
				</div>
				<div className="col-12 col-sm-6 col-md-5 col-lg-2 mb-5">
					<KpiCard label="💰 Recaudación total" value={"$98.200.000"} trend="flat" caption="93% esperado" tone="warning" />
				</div>
				<div className="col-12 col-sm-6 col-md-5 col-lg-2 mb-5">
					<KpiCard label="⏳ Morosidad global" value={"7.8%"} trend="flat" caption="-1.2% mes a mes" tone="success" />
				</div>
				<div className="col-12 col-sm-6 col-md-5 col-lg-2 mb-5">
					<KpiCard label="🛠 Reclamos críticos" value={9} trend="flat" caption="3 sin atender > 48h" tone="default" />
				</div>
				<div className="col-12 col-sm-6 col-md-5 col-lg-2 mb-5">
					<KpiCard label="🧠 Salud del negocio" value={"88 / 100"} trend="flat" caption="Estable" tone="primary" />
				</div>

			</div>
			<div className="mt-5 mb-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-20 px-6">
				{condominios.map((condominio) => (
					<CardSuperAdmin key={condominio.id} data={condominio} />
				))}

			</div>
		</>
	);
}
