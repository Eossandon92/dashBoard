
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
				<div className="col-12 col-sm-6 col-md-5 col-lg-3 mb-5">
					<KpiCard label="Condominios Activos" value={1} trend="flat" caption="month over month" tone="danger" />
				</div>
				<div className="col-12 col-sm-6 col-md-5 col-lg-3 mb-5">
					<KpiCard label="Active Plans" value={10234} trend="flat" caption="month over month" tone="primary" />
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
