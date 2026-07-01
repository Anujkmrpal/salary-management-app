import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Users, Activity } from 'lucide-react';
import { StatCard } from './StatCard';

interface DashboardPageProps {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    totalMonthlyPayroll: number;
    averageSalary: number;
    employeesWithSalary: number;
  } | null;
  countryData: any[];
  employmentBreakdown: any[];
  onNavigateToDirectory: () => void;
}

export function DashboardPage({ summary, countryData, employmentBreakdown, onNavigateToDirectory }: DashboardPageProps) {
  const countryChartData = useMemo(() => {
    return countryData.map((item) => ({
      name: item.country,
      headcount: item.headcount,
      avgSalary: item.avgSalary,
    })).slice(0, 6); // Top 6 countries
  }, [countryData]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header">
        <div>
          <h1>HR Operations Dashboard</h1>
          <p>High-level payroll snapshot and workforce distribution statistics.</p>
        </div>
        <button className="btn-primary" onClick={onNavigateToDirectory}>
          <Users size={16} /> Manage Employees
        </button>
      </div>

      {summary && (
        <div className="stats-row">
          <StatCard
            label="Total Employees"
            value={summary.totalEmployees.toLocaleString()}
            subtitle="Registered in system"
          />
          <StatCard
            label="Active Headcount"
            value={summary.activeEmployees.toLocaleString()}
            subtitle={`${((summary.activeEmployees / (summary.totalEmployees || 1)) * 100).toFixed(1)}% activity rate`}
          />
          <StatCard
            label="Monthly Payroll"
            value={`$${summary.totalMonthlyPayroll.toLocaleString()}`}
            subtitle="Latest month snapshot"
          />
          <StatCard
            label="Average Salary"
            value={`$${summary.averageSalary.toLocaleString()}`}
            subtitle="Across latest records"
          />
        </div>
      )}

      <div className="charts-grid-2x2">
        <div className="card-panel">
          <h3 className="panel-title">
            <Activity size={18} style={{ color: 'var(--primary)' }} />
            Headcount by Country (Top 6)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={countryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-heading)',
                }}
              />
              <Bar dataKey="headcount" fill="url(#colorHeadcount)" radius={[4, 4, 0, 0]}>
                <defs>
                  <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-panel">
          <h3 className="panel-title">
            <Users size={18} style={{ color: 'var(--success)' }} />
            Employment Type Mix
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={employmentBreakdown}
                dataKey="headcount"
                nameKey="employmentType"
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={50}
                paddingAngle={4}
              >
                {employmentBreakdown.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-heading)',
                }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--text-main)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
