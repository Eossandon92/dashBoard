
import CardSuperAdmin from "../components/CardSuperAdmin";

const condominios = [
	{
		id: 1,
		nombre: "Condominio Los Álamos",
		mainValue: 1256,
		percentageChange: 8.6,
		benchmarkAverage: 960,
	},
	{
		id: 2,
		nombre: "Condominio San Martín",
		mainValue: 980,
		percentageChange: -2.1,
		benchmarkAverage: 1100,
	},
	{
		id: 1,
		nombre: "Condominio Los Álamos",
		mainValue: 1256,
		percentageChange: 8.6,
		benchmarkAverage: 960,
	},
	{
		id: 2,
		nombre: "Condominio San Martín",
		mainValue: 980,
		percentageChange: -2.1,
		benchmarkAverage: 1100,
	},
	{
		id: 1,
		nombre: "Condominio Los Álamos",
		mainValue: 1256,
		percentageChange: 8.6,
		benchmarkAverage: 960,
	},
	{
		id: 2,
		nombre: "Condominio San Martín",
		mainValue: 980,
		percentageChange: -2.1,
		benchmarkAverage: 1100,
	},
];


export function Home() {
	return (
		<div className="mt-5 mb-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-20 px-6">
			{condominios.map((condominio) => (
				<CardSuperAdmin key={condominio.id} data={condominio} />
			))}
		</div>
	);
}
