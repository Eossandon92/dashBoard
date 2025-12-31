import { KpiCard } from '../../components/ui/kpi-card';

export default function KpiFlat({ label, value, trend, caption, tone }) {
    return (
        <KpiCard
            label={label}
            value={value}
            trend={trend}
            caption={caption}
            tone={tone}
        />
    );
}
