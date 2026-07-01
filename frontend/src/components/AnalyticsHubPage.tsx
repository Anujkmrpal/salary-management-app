import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp, Award, Users } from 'lucide-react';
import type { AnalyticsRow, SalaryDistributionItem, GenderAnalyticsRow } from '../types';

interface AnalyticsHubPageProps {
  departmentData: AnalyticsRow[];
  countryData: AnalyticsRow[];
  salaryDistribution: SalaryDistributionItem[];
  genderData: GenderAnalyticsRow[];
}

export function AnalyticsHubPage({
  departmentData,
  countryData,
  salaryDistribution,
  genderData,
}: AnalyticsHubPageProps) {
  // Local state to manage currency filters on multi-currency aggregates
  const [deptCurrency, setDeptCurrency] = useState('USD');
  const [countryCurrency, setCountryCurrency] = useState('USD');
  const [genderCurrency, setGenderCurrency] = useState('USD');

  // Colors for visualization bands
  const THEME_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'];
  const GENDER_COLORS = {
    'Male': '#6366f1',
    'Female': '#ec4899',
    'Non-binary': '#10b981',
    'Unassigned': '#64748b',
  } as any;

  // Extract unique currencies from the raw data arrays
  const uniqueDeptCurrencies = useMemo(() => {
    return Array.from(new Set(departmentData.map((d) => d.currency).filter(Boolean)));
  }, [departmentData]);

  const uniqueCountryCurrencies = useMemo(() => {
    return Array.from(new Set(countryData.map((c) => c.currency).filter(Boolean)));
  }, [countryData]);

  const uniqueGenderCurrencies = useMemo(() => {
    return Array.from(new Set(genderData.map((g) => g.currency).filter(Boolean)));
  }, [genderData]);

  // Filtered chart data views
  const filteredDeptData = useMemo(() => {
    return departmentData
      .filter((d) => d.currency === deptCurrency)
      .map((d) => ({
        name: d.department,
        avgSalary: d.avgSalary,
        headcount: d.headcount,
      }));
  }, [departmentData, deptCurrency]);

  const filteredCountryData = useMemo(() => {
    return countryData
      .filter((c) => c.currency === countryCurrency)
      .map((c) => ({
        name: c.country,
        avgSalary: c.avgSalary,
        headcount: c.headcount,
      }));
  }, [countryData, countryCurrency]);

  const filteredGenderData = useMemo(() => {
    return genderData
      .filter((g) => g.currency === genderCurrency)
      .map((g) => ({
        name: g.gender,
        avgSalary: g.avgSalary,
        headcount: g.headcount,
      }));
  }, [genderData, genderCurrency]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="page-header">
        <div>
          <h1>Analytics Hub</h1>
          <p>Detailed insights into organizational headcount, payroll distribution, and pay equity trends.</p>
        </div>
      </div>

      <div className="charts-grid-2x2">
        {/* Average Salary by Department */}
        <div className="card-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="panel-title" style={{ margin: 0 }}>
              <Award size={18} style={{ color: 'var(--primary)' }} />
              Average Salary by Department
            </h3>
            {uniqueDeptCurrencies.length > 1 && (
              <div className="filters-row">
                <select value={deptCurrency} onChange={(e) => setDeptCurrency(e.target.value)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  {uniqueDeptCurrencies.map((cur) => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filteredDeptData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [`${deptCurrency} ${Number(value || 0).toLocaleString()}`, 'Average Salary']}
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-heading)',
                }}
              />
              <Bar dataKey="avgSalary" fill="url(#colorDept)" radius={[4, 4, 0, 0]}>
                <defs>
                  <linearGradient id="colorDept" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Headcount and Average Salary by Country */}
        <div className="card-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="panel-title" style={{ margin: 0 }}>
              <TrendingUp size={18} style={{ color: 'var(--success)' }} />
              Average Salary by Country
            </h3>
            {uniqueCountryCurrencies.length > 1 && (
              <div className="filters-row">
                <select value={countryCurrency} onChange={(e) => setCountryCurrency(e.target.value)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  {uniqueCountryCurrencies.map((cur) => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filteredCountryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [`${countryCurrency} ${Number(value || 0).toLocaleString()}`, 'Average Salary']}
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-heading)',
                }}
              />
              <Bar dataKey="avgSalary" fill="url(#colorCountry)" radius={[4, 4, 0, 0]}>
                <defs>
                  <linearGradient id="colorCountry" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Salary Distribution Histogram */}
        <div className="card-panel">
          <h3 className="panel-title">
            <BarChart3 size={18} style={{ color: 'var(--accent)' }} />
            Pay Band Distribution (Histogram)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salaryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [value, 'Employees']}
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-heading)',
                }}
              />
              <Bar dataKey="count" fill="url(#colorBands)" radius={[4, 4, 0, 0]}>
                {salaryDistribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={THEME_COLORS[index % THEME_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Pay Equality Trends */}
        <div className="card-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="panel-title" style={{ margin: 0 }}>
              <Users size={18} style={{ color: 'var(--info)' }} />
              Gender Pay Equality Trends
            </h3>
            {uniqueGenderCurrencies.length > 1 && (
              <div className="filters-row">
                <select value={genderCurrency} onChange={(e) => setGenderCurrency(e.target.value)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  {uniqueGenderCurrencies.map((cur) => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filteredGenderData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'avgSalary') {
                    return [`${genderCurrency} ${Number(value || 0).toLocaleString()}`, 'Average Salary'];
                  }
                  return [Number(value || 0).toLocaleString(), 'Headcount'];
                }}
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-heading)',
                }}
              />
              <Bar dataKey="avgSalary" radius={[4, 4, 0, 0]}>
                {filteredGenderData.map((entry: any, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={GENDER_COLORS[entry.name] || THEME_COLORS[index % THEME_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
