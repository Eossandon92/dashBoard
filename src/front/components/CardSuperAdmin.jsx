import { PerformanceCard } from "../../components/performance-benchmark-card";
import { Building2 } from "lucide-react";

export default function CardSuperAdmin({ data }) {
    return (
        <PerformanceCard
            title={data.nombre}
            headerIcon={<Building2 className="w-4 h-4" />}
            mainValue={data.mainValue}
            percentageChange={data.percentageChange}
            benchmarkAverage={data.benchmarkAverage}
            competitors={[]}
            performanceLevels={[
                { label: "Bajo", value: 800, color: "bg-red-500" },
                { label: "Medio", value: 1100, color: "bg-yellow-400" },
                { label: "Alto", value: 1500, color: "bg-green-500" },
            ]}
        />
    );
}
