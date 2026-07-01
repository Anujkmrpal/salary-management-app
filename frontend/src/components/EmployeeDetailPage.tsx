import { ArrowLeft, User, Calendar, TrendingUp } from 'lucide-react';
import { EmployeeForm, type EmployeeFormValues } from './EmployeeForm';
import { SalaryForm, type SalaryFormValues } from './SalaryForm';
import type { Department, Employee, Salary } from '../types';

interface EmployeeDetailPageProps {
  employee: Employee;
  departments: Department[];
  salaryHistory: Salary[];
  onBackToDirectory: () => void;
  onUpdateProfile: (values: EmployeeFormValues) => Promise<void>;
  onAddSalaryAdjustment: (values: SalaryFormValues) => Promise<void>;
}

export function EmployeeDetailPage({
  employee,
  departments,
  salaryHistory,
  onBackToDirectory,
  onUpdateProfile,
  onAddSalaryAdjustment,
}: EmployeeDetailPageProps) {
  // Sort salary history chronologically (latest first or oldest first). 
  // Let's sort latest first so the most recent is right at the top.
  const sortedHistory = [...salaryHistory].sort(
    (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <button
          className="btn-secondary"
          style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.85rem', marginBottom: '16px' }}
          onClick={onBackToDirectory}
        >
          <ArrowLeft size={14} /> Back to Directory
        </button>

        <div className="page-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
          <div>
            <h1>{employee.name}</h1>
            <p>
              Employee ID: <strong>#{employee.id}</strong> &middot; Department: <strong>{employee.department?.name ?? 'Unassigned'}</strong>
            </p>
          </div>
          <span className={`badge ${employee.status === 'active' ? 'active' : 'inactive'}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            {employee.status} Status
          </span>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left Column: Edit Profile */}
        <div className="card-panel">
          <h3 className="panel-title">
            <User size={18} style={{ color: 'var(--primary)' }} />
            Edit Profile details
          </h3>
          <EmployeeForm
            departments={departments}
            initialValues={{
              name: employee.name,
              email: employee.email,
              gender: employee.gender,
              departmentId: employee.departmentId?.toString(),
              country: employee.country,
              employmentType: employee.employmentType as any,
              status: employee.status as any,
              hireDate: employee.hireDate,
            }}
            onSubmit={onUpdateProfile}
            submitLabel="Update Employee Info"
          />
        </div>

        {/* Right Column: Salary adjustments & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Add salary adjustment */}
          <div className="card-panel">
            <h3 className="panel-title">
              <TrendingUp size={18} style={{ color: 'var(--success)' }} />
              Record Salary Adjustment
            </h3>
            <SalaryForm onSubmit={onAddSalaryAdjustment} submitLabel="Apply Adjustment" />
          </div>

          {/* Chronological History Timeline */}
          <div className="card-panel">
            <h3 className="panel-title">
              <Calendar size={18} style={{ color: 'var(--info)' }} />
              Chronological Salary History
            </h3>
            {sortedHistory.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No salary history records found.
              </p>
            ) : (
              <div className="timeline-container">
                {sortedHistory.map((entry) => (
                  <div key={entry.id} className="timeline-node">
                    <div className="timeline-marker" />
                    <div className="timeline-box">
                      <div className="timeline-info">
                        <h4>
                          {entry.currency} {entry.baseSalary.toLocaleString()}
                        </h4>
                        <p>Effective: {entry.effectiveDate}</p>
                      </div>
                      <div className="timeline-notes">
                        {entry.notes || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No notes provided</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
