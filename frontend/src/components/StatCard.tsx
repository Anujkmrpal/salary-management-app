interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

export function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <div className="stat-kpi">
      <div className="kpi-title">{label}</div>
      <div className="kpi-value">{value}</div>
      {subtitle ? <div className="kpi-subtitle">{subtitle}</div> : null}
    </div>
  );
}
